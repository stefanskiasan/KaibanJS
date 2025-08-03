import { Task, Agent } from '../../index';
import { TASK_STATUS_enum } from '../../utils/enums';
import { logger } from '../../utils/logger';

/**
 * Recovery strategy configuration
 */
export interface RecoveryStrategy {
  type: 'retry' | 'reassign' | 'split';
  config: any;
}

/**
 * Task recovery manager for handling task failures
 * Note: This requires LLM to function properly
 */
export class TaskRecoveryManager {
  private logOrchestrationEvent: (event: string, message: string, data: any) => void;

  constructor(
    private team: any,
    logEventCallback: (event: string, message: string, data: any) => void
  ) {
    this.logOrchestrationEvent = logEventCallback;
  }

  /**
   * Automated workflow recovery for detected failures
   */
  async performWorkflowRecovery(
    failedTask: Task,
    failureReason: string
  ): Promise<void> {
    const recoveryStrategies = this.determineRecoveryStrategies(
      failedTask,
      failureReason
    );

    for (const strategy of recoveryStrategies) {
      try {
        switch (strategy.type) {
          case 'retry':
            await this.retryTask(failedTask, strategy.config);
            break;

          case 'reassign':
            await this.reassignTask(failedTask, strategy.config);
            break;

          case 'split':
            await this.splitFailedTask(failedTask, strategy.config);
            break;

          default:
            // No fallback strategies - orchestrator requires LLM
            throw new Error(
              `Unknown recovery strategy: ${strategy.type}. Orchestrator requires LLM to function.`
            );
        }

        // If recovery succeeded, log and exit
        this.logOrchestrationEvent(
          'RECOVERY_SUCCESS',
          `Successfully recovered from task failure using ${strategy.type} strategy`,
          {
            taskId: failedTask.id,
            strategy: strategy.type,
            failureReason: failureReason,
          }
        );

        break; // Exit loop on successful recovery
      } catch (strategyError) {
        logger.warn(
          `Recovery strategy ${strategy.type} failed:`,
          strategyError
        );
      }
    }
  }

  /**
   * Determine recovery strategies based on failure type
   */
  private determineRecoveryStrategies(
    task: Task,
    failureReason: string
  ): RecoveryStrategy[] {
    const strategies: RecoveryStrategy[] = [];

    // Analyze failure reason
    const isTimeoutError = failureReason.toLowerCase().includes('timeout');
    const isResourceError = failureReason.toLowerCase().includes('resource');
    const isSkillMismatch = failureReason.toLowerCase().includes('skill');

    // Add appropriate strategies
    if (isTimeoutError) {
      strategies.push({
        type: 'split',
        config: { parts: 2, parallel: true },
      });
    }

    if (isResourceError) {
      strategies.push({
        type: 'retry',
        config: { delay: 5000, maxAttempts: 2 },
      });
    }

    if (isSkillMismatch) {
      strategies.push({
        type: 'reassign',
        config: { preferredSkills: task.resourceRequirements?.skillsRequired },
      });
    }

    // No fallback strategies - orchestrator requires LLM to function
    // If no other strategies are applicable, let the task fail

    return strategies;
  }

  /**
   * Retry a failed task with delay
   */
  private async retryTask(task: Task, config: any): Promise<void> {
    const { delay = 3000, maxAttempts = 3 } = config;

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Reset task status
    task.status = TASK_STATUS_enum.TODO;

    this.logOrchestrationEvent(
      'TASK_RETRY',
      `Retrying task after ${delay}ms delay`,
      { taskId: task.id, attempt: 1, maxAttempts }
    );
  }

  /**
   * Reassign task to a different agent
   */
  private async reassignTask(task: Task, config: any): Promise<void> {
    const { preferredSkills = [] } = config;
    const agents = this.team.store.getState().agents;

    // Find best alternative agent
    const alternativeAgent = agents.find((agent: Agent) => {
      if (agent.id === task.agent.id) return false; // Skip current agent
      if (agent.status === 'BUSY') return false;

      // Check skills match
      const agentSkills = this.extractAgentSkills(agent);
      return preferredSkills.every((skill: string) =>
        agentSkills.includes(skill)
      );
    });

    if (alternativeAgent) {
      task.agent = alternativeAgent;
      task.status = TASK_STATUS_enum.TODO;

      this.logOrchestrationEvent(
        'TASK_REASSIGNED',
        `Task reassigned to agent with better skill match`,
        {
          taskId: task.id,
          newAgentId: alternativeAgent.id,
          newAgentName: alternativeAgent.name,
        }
      );
    } else {
      throw new Error('No suitable agent found for reassignment');
    }
  }

  /**
   * Split a failed task into smaller subtasks
   */
  private async splitFailedTask(task: Task, config: any): Promise<void> {
    const { parts = 2, parallel = false } = config;

    // Mark original task as completed (will be replaced by subtasks)
    task.status = TASK_STATUS_enum.DONE;
    task.result = {
      content: `Task split into ${parts} subtasks for recovery`,
      success: true,
    };

    // Create subtasks (simplified version - in production would use LLM)
    const subtasks: Task[] = [];
    for (let i = 0; i < parts; i++) {
      const subtask = new (task.constructor as any)({
        description: `[Part ${i + 1}/${parts}] ${task.description}`,
        expectedOutput: task.expectedOutput,
        agent: task.agent,
        dependencies: i === 0 ? task.dependencies : [subtasks[i - 1].id],
        allowParallelExecution: parallel && i > 0,
      });
      subtasks.push(subtask);
    }

    // Add subtasks to team
    this.team.store.getState().addTasks(subtasks);

    this.logOrchestrationEvent(
      'TASK_SPLIT_FOR_RECOVERY',
      `Split failed task into ${parts} subtasks`,
      {
        originalTaskId: task.id,
        subtaskIds: subtasks.map((t: Task) => t.id),
        parallel: parallel,
      }
    );
  }

  /**
   * Extract skills from agent background and role
   */
  private extractAgentSkills(agent: Agent): string[] {
    const skills: string[] = [];
    const text = `${agent.role} ${agent.background}`.toLowerCase();

    // Common skill keywords
    const skillKeywords = [
      'python',
      'javascript',
      'typescript',
      'react',
      'node',
      'api',
      'database',
      'frontend',
      'backend',
      'testing',
      'security',
      'performance',
      'architecture',
      'design',
      'analysis',
    ];

    skillKeywords.forEach((skill) => {
      if (text.includes(skill)) {
        skills.push(skill);
      }
    });

    return skills;
  }

  /**
   * Create recovery strategies for high-risk tasks
   */
  createTaskRecoveryStrategies(
    tasks: Task[],
    failureProbabilities: Map<string, number>
  ): Map<string, string[]> {
    const recoveryStrategies = new Map<string, string[]>();

    tasks.forEach((task) => {
      const failureProb = failureProbabilities.get(task.id) || 0;
      const strategies: string[] = [];

      if (failureProb > 0.3) {
        // High-risk task
        if (failureProb > 0.7) {
          strategies.push('Consider breaking down into smaller subtasks');
          strategies.push('Assign to most experienced agent');
        }

        if (task.dependencies && task.dependencies.length > 2) {
          strategies.push('Monitor dependencies closely');
          strategies.push('Prepare alternative execution paths');
        }

        if (!task.agent || task.agent.status === 'BUSY') {
          strategies.push('Pre-allocate backup agent');
        }

        if (task.expectedOutput && task.expectedOutput.length > 200) {
          strategies.push('Define clear intermediate milestones');
          strategies.push('Set up validation checkpoints');
        }

        if (task.isDeliverable) {
          strategies.push('Implement extra quality checks');
          strategies.push('Schedule buffer time for iterations');
        }

        // Add monitoring strategy for all high-risk tasks
        if (strategies.length > 0) {
          strategies.push('Enable detailed logging for debugging');
        }

        recoveryStrategies.set(task.id, strategies);
      }
    });

    return recoveryStrategies;
  }
}