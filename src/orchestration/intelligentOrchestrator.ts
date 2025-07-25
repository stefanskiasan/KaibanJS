/**
 * Intelligent Orchestrator for KaibanJS
 *
 * This module implements an AI-powered orchestrator that can autonomously:
 * - Select optimal tasks from a repository
 * - Adapt existing tasks to current circumstances
 * - Generate new tasks when gaps are identified
 * - Optimize workflow performance in real-time
 */

import { Agent, Task, Team } from '../index';
import { LangChainChatModel, LLMConfig } from '../utils/agents';
import { logger } from '../utils/logger';
import { createOrchestrationLog } from '../subscribers/orchestrationSubscriber';

/**
 * Context information for orchestrator decision-making
 */
export interface OrchestrationContext {
  activeTasks: Task[];
  availableAgents: Agent[];
  projectProgress: number;
  blockedTasks: Task[];
  codeCoverage: number;
  performanceScore: number;
  workload: string;
  projectPhase: string;
  similarTasks: Task[];
  newPriorities?: string[];
  resourceAvailability: string;
  timeConstraints: string;
  qualityRequirements: string;
  existingTasks: Task[]; // All existing tasks in the team (including completed, pending, etc.)
}

/**
 * Task gap information for new task generation
 */
export interface TaskGap {
  description: string;
  category: string;
  estimatedComplexity: 'low' | 'medium' | 'high';
  requirements: string[];
  dependencies: string[];
}

/**
 * Task modification permissions
 */
export interface TaskModificationPermissions {
  canModify: boolean;
  reason: string;
  allowedActions: string[];
}

/**
 * Intelligent Orchestrator Class
 *
 * Uses LLM-powered decision making to autonomously manage task workflows
 */
export class IntelligentOrchestrator {
  private team: Team;
  private availableTasks: Task[];
  private orchestrationStrategy: string;
  private mode: 'conservative' | 'adaptive' | 'innovative' | 'learning';
  private llm: LangChainChatModel | null;
  private conversationHistory: any[];
  private performanceMetrics: Map<string, number>;

  constructor(team: Team) {
    this.team = team;
    this.availableTasks = team.availableTasks || [];
    this.orchestrationStrategy = team.orchestrationStrategy || '';
    this.mode = team.mode || 'adaptive';
    this.llm = this.initializeLLM(team);
    this.conversationHistory = [];
    this.performanceMetrics = new Map();
  }

  /**
   * Initialize LLM instance for the orchestrator
   */
  private initializeLLM(team: Team): LangChainChatModel | null {
    if (team.llmInstance) {
      return team.llmInstance;
    }

    if (team.llmConfig) {
      return this.createLLMFromConfig(team.llmConfig);
    }

    logger.warn(
      'No LLM configuration provided for orchestrator. Operating in manual mode.'
    );
    return null;
  }

  /**
   * Create LLM instance from configuration
   */
  private createLLMFromConfig(_config: LLMConfig): LangChainChatModel {
    // This would need to be implemented with actual LLM provider integrations
    // For now, we'll throw an error to indicate it needs implementation
    throw new Error(
      'LLM configuration support not yet implemented. Please provide llmInstance directly.'
    );
  }

  /**
   * Main orchestration method
   * Analyzes context and optimally arranges tasks
   * @param projectGoal - The overall goal for the orchestrator to optimize towards
   * @param preserveExistingTasks - Whether to keep existing tasks and build upon them (default: true)
   */
  async orchestrateWorkflow(
    projectGoal: string,
    preserveExistingTasks: boolean = true
  ): Promise<Task[]> {
    const startTime = Date.now();

    try {
      logger.info(
        `🎯 Starting intelligent orchestration for goal: ${projectGoal}`
      );

      // Log orchestration activation
      this.logOrchestrationEvent(
        'ACTIVATED',
        'Intelligent orchestration activated',
        {
          projectGoal,
          preserveExistingTasks,
          existingTasksCount: this.team.getTasks().length,
          availableTasksCount: this.availableTasks.length,
          mode: this.mode,
          allowTaskGeneration: this.team.allowTaskGeneration,
          orchestrationStrategy: this.orchestrationStrategy,
        }
      );

      // Analyze current context
      const context = await this.analyzeCurrentContext();

      // Log context analysis
      this.logOrchestrationEvent(
        'ANALYSIS_STARTED',
        'Analyzing current team and project context',
        {
          contextAnalysis: {
            activeTasks: context.activeTasks.length,
            availableAgents: context.availableAgents.length,
            projectProgress: context.projectProgress,
            blockedTasks: context.blockedTasks.length,
            workload: context.workload,
            projectPhase: context.projectPhase,
            resourceAvailability: context.resourceAvailability,
          },
        }
      );

      if (preserveExistingTasks) {
        logger.info(
          `📋 Building upon ${context.existingTasks.length} existing tasks`
        );
      }

      // Select optimal tasks from repository (considering existing tasks)
      const selectedTasks = await this.selectOptimalTasks(context, projectGoal);

      // Generate new tasks if necessary and allowed
      const generatedTasks = await this.generateAdditionalTasks(
        context,
        selectedTasks
      );

      // Adapt tasks to current circumstances
      const newTasks = await this.adaptTasksToContext([
        ...selectedTasks,
        ...generatedTasks,
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (preserveExistingTasks) {
        // Add only new tasks to existing ones
        this.addOrchestrationTasks(newTasks);
        const allTasks = [...context.existingTasks, ...newTasks];

        // Log completion
        this.logOrchestrationEvent(
          'COMPLETED',
          'Orchestration completed successfully',
          {
            totalDuration: duration,
            results: {
              existingTasksPreserved: context.existingTasks.length,
              newTasksAdded: newTasks.length,
              tasksGenerated: generatedTasks.length,
              tasksAdapted: newTasks.filter((task) => task.adaptable).length,
              totalTasks: allTasks.length,
            },
            finalWorkloadDistribution:
              this.calculateWorkloadDistribution(allTasks),
            orchestrationStats: {
              llmCallsCount: this.conversationHistory.length,
              fallbackOperations: this.llm ? 0 : 1,
              gapAnalysisExecuted: true,
              performanceOptimizations: 0,
            },
          }
        );

        logger.info(
          `✅ Orchestration complete. Total: ${allTasks.length} tasks (${context.existingTasks.length} existing + ${newTasks.length} new).`
        );
        return allTasks;
      } else {
        // Replace all tasks (original behavior)
        this.updateTeamTasks(newTasks);

        // Log completion
        this.logOrchestrationEvent(
          'COMPLETED',
          'Orchestration completed with task replacement',
          {
            totalDuration: duration,
            results: {
              existingTasksPreserved: 0,
              newTasksAdded: newTasks.length,
              tasksGenerated: generatedTasks.length,
              tasksAdapted: newTasks.filter((task) => task.adaptable).length,
              totalTasks: newTasks.length,
            },
            finalWorkloadDistribution:
              this.calculateWorkloadDistribution(newTasks),
            orchestrationStats: {
              llmCallsCount: this.conversationHistory.length,
              fallbackOperations: this.llm ? 0 : 1,
              gapAnalysisExecuted: true,
              performanceOptimizations: 0,
            },
          }
        );

        logger.info(
          `✅ Orchestration complete. Arranged ${newTasks.length} tasks.`
        );
        return newTasks;
      }
    } catch (error) {
      logger.error('❌ Orchestration failed:', error);

      // Log orchestration error
      this.logOrchestrationEvent(
        'ERROR',
        'Orchestration failed, using fallback',
        {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          operationFailed: 'orchestrateWorkflow',
          fallbackExecuted: true,
          partialResults: {
            tasksProcessed: 0,
            operationsCompleted: ['context_analysis'],
          },
        }
      );

      return this.fallbackOrchestration();
    }
  }

  /**
   * Analyze current team and project context
   */
  private async analyzeCurrentContext(): Promise<OrchestrationContext> {
    const teamState = this.team.store.getState();

    return {
      activeTasks: teamState.tasks.filter((task) => task.status === 'DOING'),
      availableAgents: teamState.agents.filter(
        (agent) => agent.status !== 'BUSY'
      ),
      projectProgress: this.calculateProjectProgress(),
      blockedTasks: teamState.tasks.filter((task) => task.status === 'BLOCKED'),
      codeCoverage: 75, // Mock value - would be calculated from project metrics
      performanceScore: 85, // Mock value - would be calculated from project metrics
      workload: this.calculateCurrentWorkload(),
      projectPhase: this.determineProjectPhase(),
      similarTasks: [],
      resourceAvailability: this.assessResourceAvailability(),
      timeConstraints: this.assessTimeConstraints(),
      qualityRequirements: this.assessQualityRequirements(),
      existingTasks: teamState.tasks, // All existing tasks in the team
    };
  }

  /**
   * Select optimal tasks from available repository
   * Performs gap analysis considering existing tasks
   */
  private async selectOptimalTasks(
    context: OrchestrationContext,
    _projectGoal: string
  ): Promise<Task[]> {
    if (!this.llm) {
      return this.fallbackTaskSelection(context);
    }

    // LLM-powered task selection would be implemented here
    // For now, use enhanced fallback method with gap analysis
    return this.fallbackTaskSelectionWithGapAnalysis(context);
  }

  /**
   * Generate additional tasks if gaps are identified
   */
  private async generateAdditionalTasks(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): Promise<Task[]> {
    if (!this.team.allowTaskGeneration) {
      return [];
    }

    // Identify gaps in task coverage
    const gaps = await this.identifyTaskGaps(context, selectedTasks);

    if (gaps.length === 0) {
      return [];
    }

    const generatedTasks: Task[] = [];
    for (const gap of gaps) {
      const newTask = await this.generateTaskForGap(gap, context);
      if (newTask) {
        generatedTasks.push(newTask);
      }
    }

    // Log task generation
    this.logOrchestrationEvent('TASK_GENERATION', 'Task generation completed', {
      gapsIdentified: gaps.map((gap) => ({
        description: gap.description,
        category: gap.category,
        complexity: gap.estimatedComplexity,
        requirements: gap.requirements,
      })),
      tasksGenerated: generatedTasks.length,
      generationMethod: this.llm ? 'llm' : 'template',
    });

    return generatedTasks;
  }

  /**
   * Adapt tasks to current context and circumstances
   */
  private async adaptTasksToContext(tasks: Task[]): Promise<Task[]> {
    const adaptedTasks: Task[] = [];

    for (const task of tasks) {
      const permissions = await this.evaluateTaskModificationPermissions(task);

      // Log task adaptation
      this.logOrchestrationEvent(
        'TASK_ADAPTATION',
        'Task adaptation evaluation',
        {
          taskId: task.id,
          taskDescription: task.description,
          adaptationLevel: permissions.canModify ? 'minor' : 'none',
          adaptationPermissions: permissions,
          adaptationChanges: permissions.canModify
            ? ['optimization', 'agent_assignment']
            : [],
        }
      );

      if (permissions.canModify) {
        const adaptedTask = await this.adaptTask(task);
        adaptedTasks.push(adaptedTask);
      } else {
        // Task cannot be modified, use as-is
        adaptedTasks.push(task);
        logger.debug(
          `Task ${task.id} cannot be modified: ${permissions.reason}`
        );
      }
    }

    return adaptedTasks;
  }

  /**
   * Evaluate whether a task can be modified by the orchestrator
   */
  private async evaluateTaskModificationPermissions(
    task: Task
  ): Promise<TaskModificationPermissions> {
    // Check task-level permission
    if (task.adaptable === false) {
      return {
        canModify: false,
        reason: 'Task explicitly prohibits orchestrator modifications',
        allowedActions: ['scheduling', 'resource_coordination', 'monitoring'],
      };
    }

    return {
      canModify: true,
      reason: 'Full modification permissions granted',
      allowedActions: ['modify', 'split', 'merge', 'reassign', 'reprioritize'],
    };
  }

  /**
   * Adapt a single task based on current context
   */
  private async adaptTask(task: Task): Promise<Task> {
    // For now, return task as-is
    // LLM-powered adaptation would be implemented here
    return task;
  }

  /**
   * Update team's task list with orchestrated tasks (replaces all tasks)
   */
  private updateTeamTasks(tasks: Task[]): void {
    this.team.store.getState().addTasks(tasks);
  }

  /**
   * Add new orchestrated tasks to existing team tasks
   * Prevents duplicates and maintains existing tasks
   */
  private addOrchestrationTasks(newTasks: Task[]): void {
    const teamState = this.team.store.getState();
    const existingTaskIds = new Set(teamState.tasks.map((task) => task.id));

    // Filter out any tasks that already exist to prevent duplicates
    const uniqueNewTasks = newTasks.filter(
      (task) => !existingTaskIds.has(task.id)
    );

    if (uniqueNewTasks.length > 0) {
      logger.info(`➕ Adding ${uniqueNewTasks.length} new orchestrated tasks`);
      teamState.addTasks(uniqueNewTasks);
    } else {
      logger.info(`ℹ️ No new unique tasks to add`);
    }
  }

  /**
   * Fallback orchestration when LLM is not available
   */
  private fallbackOrchestration(): Task[] {
    logger.warn('🔄 Using fallback orchestration (no LLM available)');

    // Simple fallback: return first few available tasks
    return this.availableTasks.slice(0, this.team.maxActiveTasks);
  }

  /**
   * Fallback task selection
   */
  private fallbackTaskSelection(_context: OrchestrationContext): Task[] {
    // Simple priority-based selection
    const templateTasks = this.availableTasks.filter((task) => task.template);

    // Sort by priority (if implemented) or use first N tasks
    return templateTasks.slice(0, Math.min(3, this.team.maxActiveTasks));
  }

  /**
   * Helper method to log orchestration events
   */
  private logOrchestrationEvent(
    event: string,
    message: string,
    metadata: any
  ): void {
    try {
      const log = createOrchestrationLog(event, message, metadata);
      this.team.store.getState().addWorkflowLog(log);
    } catch (error) {
      logger.warn('Failed to log orchestration event:', error);
    }
  }

  /**
   * Calculate workload distribution across agents
   */
  private calculateWorkloadDistribution(
    tasks: Task[]
  ): Array<{ agentName: string; assignedTasks: number }> {
    const distribution = new Map<string, number>();

    tasks.forEach((task) => {
      const agentName = task.agent?.name || 'Unassigned';
      distribution.set(agentName, (distribution.get(agentName) || 0) + 1);
    });

    return Array.from(distribution.entries()).map(
      ([agentName, assignedTasks]) => ({
        agentName,
        assignedTasks,
      })
    );
  }

  /**
   * Enhanced fallback task selection with gap analysis
   * Considers existing tasks to avoid duplicates and fill gaps
   */
  private fallbackTaskSelectionWithGapAnalysis(
    context: OrchestrationContext
  ): Task[] {
    const templateTasks = this.availableTasks.filter((task) => task.template);
    const existingTaskDescriptions = new Set(
      context.existingTasks.map((task) => task.description.toLowerCase())
    );

    // Analyze what skill areas are covered by existing tasks
    const existingSkills = new Set<string>();
    context.existingTasks.forEach((task) => {
      if (task.resourceRequirements?.skillsRequired) {
        task.resourceRequirements.skillsRequired.forEach((skill) =>
          existingSkills.add(skill.toLowerCase())
        );
      }
    });

    // Filter out tasks that are too similar to existing ones
    const gapFillingTasks = templateTasks.filter((task) => {
      // Skip if description is too similar to existing tasks
      const taskDesc = task.description.toLowerCase();
      const isSimilar = Array.from(existingTaskDescriptions).some(
        (existingDesc) =>
          this.calculateTaskSimilarity(taskDesc, existingDesc) > 0.7
      );

      if (isSimilar) {
        logger.debug(`⏭️ Skipping similar task: ${task.description}`);
        return false;
      }

      // Prefer tasks that add new skills not covered by existing tasks
      if (task.resourceRequirements?.skillsRequired) {
        const hasNewSkills = task.resourceRequirements.skillsRequired.some(
          (skill) => !existingSkills.has(skill.toLowerCase())
        );
        if (hasNewSkills) {
          logger.debug(`✨ Gap-filling task found: ${task.description}`);
          return true;
        }
      }

      // Include other tasks if they don't duplicate existing work
      return true;
    });

    // Sort by potential value (tasks with new skills first)
    gapFillingTasks.sort((a, b) => {
      const aNewSkills =
        a.resourceRequirements?.skillsRequired?.filter(
          (skill) => !existingSkills.has(skill.toLowerCase())
        ).length || 0;
      const bNewSkills =
        b.resourceRequirements?.skillsRequired?.filter(
          (skill) => !existingSkills.has(skill.toLowerCase())
        ).length || 0;
      return bNewSkills - aNewSkills; // More new skills = higher priority
    });

    const maxNewTasks = Math.max(
      0,
      this.team.maxActiveTasks - context.existingTasks.length
    );
    const selectedTasks = gapFillingTasks.slice(0, Math.min(maxNewTasks, 3));

    // Collect skill information for logging
    const existingSkillsArray = Array.from(existingSkills);
    const newSkills = new Set<string>();
    selectedTasks.forEach((task) => {
      if (task.resourceRequirements?.skillsRequired) {
        task.resourceRequirements.skillsRequired.forEach((skill) => {
          if (!existingSkills.has(skill.toLowerCase())) {
            newSkills.add(skill);
          }
        });
      }
    });
    const newSkillsArray = Array.from(newSkills);

    // Log task selection
    this.logOrchestrationEvent(
      'TASK_SELECTION',
      'Task selection completed with gap analysis',
      {
        selectionStrategy: 'gap_analysis',
        selectedTasksCount: selectedTasks.length,
        skippedTasksCount: templateTasks.length - selectedTasks.length,
        selectionCriteria: [
          'gap_analysis',
          'skill_coverage',
          'similarity_avoidance',
        ],
        gapAnalysisPerformed: true,
        existingSkillsCovered: existingSkillsArray,
        newSkillsAdded: newSkillsArray,
      }
    );

    logger.info(
      `🔍 Gap analysis: Selected ${selectedTasks.length} tasks to complement ${context.existingTasks.length} existing tasks`
    );
    return selectedTasks;
  }

  /**
   * Calculate similarity between two task descriptions (0-1 scale)
   */
  private calculateTaskSimilarity(desc1: string, desc2: string): number {
    // Simple word-based similarity calculation
    const words1 = new Set(
      desc1.split(/\s+/).filter((word) => word.length > 3)
    );
    const words2 = new Set(
      desc2.split(/\s+/).filter((word) => word.length > 3)
    );

    const intersection = new Set(
      [...words1].filter((word) => words2.has(word))
    );
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Identify gaps in task coverage
   */
  private async identifyTaskGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): Promise<TaskGap[]> {
    // Simple gap identification logic
    const gaps: TaskGap[] = [];

    // Check if we have testing tasks
    const hasTestingTask = selectedTasks.some(
      (task) =>
        task.description.toLowerCase().includes('test') ||
        task.resourceRequirements?.skillsRequired?.includes('testing')
    );

    if (!hasTestingTask) {
      gaps.push({
        description: 'No testing tasks identified in current selection',
        category: 'quality_assurance',
        estimatedComplexity: 'medium',
        requirements: ['testing', 'quality_assurance'],
        dependencies: [],
      });
    }

    return gaps;
  }

  /**
   * Generate a new task for an identified gap
   */
  private async generateTaskForGap(
    gap: TaskGap,
    context: OrchestrationContext
  ): Promise<Task | null> {
    // Create a basic task for the gap
    // In full implementation, this would use LLM to generate detailed task

    try {
      const newTask = new Task({
        description: `Generated task: ${gap.description}`,
        expectedOutput: 'Task completed successfully',
        agent:
          context.availableAgents[0] || this.team.store.getState().agents[0],
        adaptable: true,
        template: false,
        orchestrationRules: `Generated task to fill gap in ${gap.category}`,
        resourceRequirements: {
          estimatedTime: gap.estimatedComplexity === 'high' ? '4-8h' : '2-4h',
          skillsRequired: gap.requirements,
          dependencies: gap.dependencies,
        },
      });

      return newTask;
    } catch (error) {
      logger.error('Failed to generate task for gap:', error);
      return null;
    }
  }

  // Helper methods for context analysis

  private calculateProjectProgress(): number {
    const tasks = this.team.store.getState().tasks;
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(
      (task) => task.status === 'DONE'
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  private calculateCurrentWorkload(): string {
    const activeTasks = this.team.store
      .getState()
      .tasks.filter((task) => task.status === 'DOING');
    const totalAgents = this.team.store.getState().agents.length;

    if (totalAgents === 0) return 'unknown';

    const tasksPerAgent = activeTasks.length / totalAgents;

    if (tasksPerAgent > 2) return 'high';
    if (tasksPerAgent > 1) return 'medium';
    return 'low';
  }

  private determineProjectPhase(): string {
    const progress = this.calculateProjectProgress();

    if (progress < 25) return 'planning';
    if (progress < 75) return 'development';
    if (progress < 95) return 'testing';
    return 'deployment';
  }

  private assessResourceAvailability(): string {
    const allAgents = this.team.store.getState().agents;
    const availableAgents = allAgents.filter(
      (agent) => agent.status !== 'BUSY'
    );
    const totalAgents = allAgents.length;

    if (totalAgents === 0) return 'none';

    const availabilityRatio = availableAgents.length / totalAgents;

    if (availabilityRatio > 0.75) return 'high';
    if (availabilityRatio > 0.5) return 'medium';
    return 'low';
  }

  private assessTimeConstraints(): string {
    // Mock implementation - in reality would analyze project deadlines
    return 'moderate';
  }

  private assessQualityRequirements(): string {
    // Mock implementation - in reality would analyze project quality standards
    return 'high';
  }

  /**
   * Start continuous optimization monitoring
   */
  async startContinuousOptimization(): Promise<void> {
    if (this.team.adaptationInterval <= 0) {
      return;
    }

    setInterval(async () => {
      try {
        const context = await this.analyzeCurrentContext();
        await this.optimizeCurrentWorkflow(context);
      } catch (error) {
        logger.error('Continuous optimization error:', error);
      }
    }, this.team.adaptationInterval);

    logger.info(
      `🔄 Started continuous optimization (interval: ${this.team.adaptationInterval}ms)`
    );
  }

  /**
   * Optimize current workflow based on performance metrics
   */
  private async optimizeCurrentWorkflow(
    context: OrchestrationContext
  ): Promise<void> {
    // Analyze current performance
    const performanceIssues = this.identifyPerformanceIssues(context);

    if (performanceIssues.length > 0) {
      logger.info(
        `🎯 Identified ${performanceIssues.length} performance optimization opportunities`
      );

      for (const issue of performanceIssues) {
        await this.applyOptimization(issue, context);
      }
    }
  }

  private identifyPerformanceIssues(context: OrchestrationContext): string[] {
    const issues: string[] = [];

    if (context.blockedTasks.length > 0) {
      issues.push('blocked_tasks');
    }

    if (context.activeTasks.length > this.team.maxActiveTasks) {
      issues.push('task_overload');
    }

    if (context.availableAgents.length === 0) {
      issues.push('no_available_agents');
    }

    return issues;
  }

  private async applyOptimization(
    issue: string,
    context: OrchestrationContext
  ): Promise<void> {
    switch (issue) {
      case 'blocked_tasks':
        await this.handleBlockedTasks(context.blockedTasks);
        break;
      case 'task_overload':
        await this.redistributeTasks(context);
        break;
      case 'no_available_agents':
        await this.optimizeAgentUtilization(context);
        break;
      default:
        logger.warn(`Unknown optimization issue: ${issue}`);
    }
  }

  private async handleBlockedTasks(blockedTasks: Task[]): Promise<void> {
    for (const task of blockedTasks) {
      logger.info(`🔧 Attempting to unblock task: ${task.id}`);
      // Implementation would analyze blocking reasons and attempt resolution
    }
  }

  private async redistributeTasks(
    _context: OrchestrationContext
  ): Promise<void> {
    logger.info('⚖️ Redistributing tasks to balance workload');
    // Implementation would redistribute tasks among available agents
  }

  private async optimizeAgentUtilization(
    _context: OrchestrationContext
  ): Promise<void> {
    logger.info('⚡ Optimizing agent utilization');
    // Implementation would analyze agent efficiency and reassign tasks
  }
}
