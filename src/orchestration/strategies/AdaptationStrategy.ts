import { Task, Team, Agent } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';
import { nanoid } from 'nanoid';

/**
 * Handles task adaptation strategies
 */
export class AdaptationStrategy {
  constructor(
    private team: Team,
    private llm: any // LangChain LLM instance
  ) {}

  /**
   * Batch adapt multiple tasks in parallel
   */
  async batchAdaptTasks(tasks: Task[]): Promise<Task[]> {
    const operationStartTime = Date.now();
    logger.info(`🔄 Adapting ${tasks.length} tasks to current context`);
    
    // Check adaptable ratio
    const adaptableTasks = tasks.filter(task => task.adaptable);
    const nonAdaptableTasks = tasks.filter(task => !task.adaptable);
    
    if (nonAdaptableTasks.length > 0) {
      const ratio = Math.round((adaptableTasks.length / tasks.length) * 100);
      logger.warn(
        `⚠️ ${nonAdaptableTasks.length} of ${tasks.length} tasks (${100 - ratio}%) are not adaptable and will remain unchanged. ` +
        `Consider marking more tasks as adaptable for better orchestration flexibility.`
      );
    }

    // Adapt all tasks in parallel
    const adaptedTasks = await Promise.all(
      tasks.map(task => this.adaptTask(task))
    );

    const duration = Date.now() - operationStartTime;
    logger.info(`✅ Task adaptation completed in ${duration}ms`);

    return adaptedTasks;
  }

  /**
   * Adapt a single task based on current context
   */
  async adaptTask(task: Task): Promise<Task> {
    // Check if task is adaptable
    if (!task.adaptable) {
      return task; // Return unchanged if not adaptable
    }

    logger.info(`🔄 Adapting task: ${task.title}`);

    try {
      const teamState = this.team.store.getState();
      const context = {
        currentTaskStatus: teamState.tasks.map((t) => ({
          id: t.id,
          status: t.status,
          agent: t.agent?.name,
        })),
        availableAgents: teamState.agents.map((a) => ({
          name: a.name,
          role: a.role,
          status: a.status,
        })),
        workflowProgress: this.calculateProgress(teamState.tasks),
      };

      const adaptationPrompt = `
Analyze and adapt this task to the current workflow context and user inputs:

Task:
- Title: ${task.title}
- Description: ${task.description}
- Expected Output: ${task.expectedOutput}
- Priority: ${task.priority || 'medium'}
- Estimated Time: ${task.resourceRequirements?.estimatedTime || 'unknown'}
- Current Dependencies: ${task.dependencies?.length > 0 ? task.dependencies.join(', ') : 'None'}
${task.orchestrationRules ? `\n⚠️ ORCHESTRATION RULES (MUST FOLLOW):
${task.orchestrationRules}` : ''}

${teamState.inputs && Object.keys(teamState.inputs).length > 0 ? `
USER INPUTS (CRITICAL CONTEXT):
${Object.entries(teamState.inputs)
  .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
  .join('\n')}

IMPORTANT: Adapt the task to align with these user inputs wherever possible.
` : ''}

Current Context:
- Workflow Progress: ${context.workflowProgress}%
- Active Tasks: ${context.currentTaskStatus.filter((t) => t.status === 'DOING').length}
- Available Agents: ${context.availableAgents.filter((a) => a.status !== 'BUSY').length}

Consider:
1. How can the task be adapted to better align with user inputs?
2. Should the task description be refined based on user context and current progress?
3. Should the priority be adjusted based on user inputs and current workload?
4. Should the estimated time be updated based on current context?
5. Which agent is best suited for this task given current availability and skills?
6. Should dependencies be adjusted based on current workflow structure?
7. Are there any user-specific requirements that should be incorporated?
${task.orchestrationRules ? '\n⚠️ IMPORTANT: Any adaptation MUST comply with the orchestration rules specified above.' : ''}

Available Agents and their skills:
${context.availableAgents.map((agent) => `- ${agent.name} (${agent.role}): ${agent.status}`).join('\n')}

Current Tasks in Workflow (for dependency context):
${context.currentTaskStatus.map((t) => `- ${t.id}: ${t.status} (Agent: ${t.agent || 'unassigned'})`).join('\n')}

Provide your response in this JSON format:
{
  "adapted": boolean,
  "description": "updated task description that considers user inputs",
  "priority": "high|medium|low",
  "estimatedTime": "updated time estimate",
  "suggestedAgent": "agent name from available agents or null for auto-select",
  "dependencies": ["task_id1", "task_id2"] or null to keep current dependencies,
  "reasoning": "brief explanation of adaptations, especially how inputs influenced changes"
}
`;

      const response = await this.llm.invoke(adaptationPrompt);
      const adaptationResult = this.parseAdaptationResponse(response.content);

      if (adaptationResult.adapted) {
        logger.info(`✅ Task adapted: ${adaptationResult.reasoning}`);
        
        // Check if task has orchestration rules
        if (task.orchestrationRules) {
          logger.info(`🔒 Task has orchestration rules that will be preserved during adaptation`);
        }

        // Create adapted task with updates
        const adaptedTask = Object.assign(Object.create(Object.getPrototypeOf(task)), task);
        
        // Initialize adaptation history if not present
        if (!adaptedTask.adaptationHistory) {
          adaptedTask.adaptationHistory = [];
        }
        
        // Track changes for history
        const changes: any = {};
        
        if (adaptationResult.description) {
          // Validate description is not empty
          const trimmedDescription = adaptationResult.description.trim();
          if (trimmedDescription.length > 0) {
            changes.description = trimmedDescription;
            adaptedTask.description = trimmedDescription;
          } else {
            logger.warn('Adaptation provided empty description, keeping original');
          }
        }
        
        if (adaptationResult.priority) {
          if (adaptedTask.priority !== adaptationResult.priority) {
            changes.priority = adaptationResult.priority;
          }
          adaptedTask.priority = adaptationResult.priority;
        }
        
        if (adaptationResult.estimatedTime) {
          // Validate estimatedTime format (e.g., "2 hours", "30 minutes", "1-2 days")
          const timePattern = /^\d+(-\d+)?\s*(hour|hours|minute|minutes|day|days|week|weeks)$/i;
          if (timePattern.test(adaptationResult.estimatedTime.trim())) {
            if (!adaptedTask.resourceRequirements) {
              adaptedTask.resourceRequirements = {};
            }
            changes.estimatedTime = adaptationResult.estimatedTime.trim();
            adaptedTask.resourceRequirements.estimatedTime = adaptationResult.estimatedTime.trim();
          } else {
            logger.warn(`Invalid estimatedTime format: ${adaptationResult.estimatedTime}, keeping original`);
          }
        }
        
        if (adaptationResult.suggestedAgent) {
          // Find the suggested agent in available agents
          const suggestedAgentName = adaptationResult.suggestedAgent.trim();
          const newAgent = teamState.agents.find(
            (agent) => agent.name.toLowerCase() === suggestedAgentName.toLowerCase()
          );
          
          if (newAgent) {
            changes.agent = newAgent.name;
            adaptedTask.agent = newAgent;
            logger.info(`🔄 Task agent reassigned from ${task.agent?.name || 'unassigned'} to ${newAgent.name}`);
          } else {
            logger.warn(`Suggested agent '${suggestedAgentName}' not found in available agents`);
          }
        }
        
        if (adaptationResult.dependencies !== null && adaptationResult.dependencies !== undefined) {
          // Validate that all dependency IDs exist in current tasks
          const validDependencies = adaptationResult.dependencies.filter((depId: string) => {
            const exists = context.currentTaskStatus.some((t) => t.id === depId);
            if (!exists) {
              logger.warn(`Dependency task '${depId}' not found in current workflow`);
            }
            return exists;
          });
          
          if (JSON.stringify(adaptedTask.dependencies) !== JSON.stringify(validDependencies)) {
            changes.dependencies = validDependencies;
            adaptedTask.dependencies = validDependencies;
            logger.info(`📊 Task dependencies updated: [${validDependencies.join(', ')}]`);
          }
        }
        
        // Add adaptation to history if there were any changes
        if (Object.keys(changes).length > 0) {
          adaptedTask.adaptationHistory.push({
            timestamp: Date.now(),
            changes: changes,
            reasoning: adaptationResult.reasoning
          });
        }

        return adaptedTask;
      }

      return task; // Return unchanged if no adaptation needed
    } catch (error) {
      logger.error(`❌ Error adapting task ${task.id}:`, error);
      return task; // Return original task on error
    }
  }

  /**
   * Parse LLM adaptation response
   */
  private parseAdaptationResponse(response: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { adapted: false };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate priority value
      let priority = parsed.priority;
      if (priority && !['high', 'medium', 'low'].includes(priority)) {
        logger.warn(`Invalid priority value: ${priority}, defaulting to 'medium'`);
        priority = 'medium';
      }
      
      // Validate dependencies array
      let dependencies = parsed.dependencies;
      if (dependencies !== null && dependencies !== undefined) {
        if (!Array.isArray(dependencies)) {
          logger.warn(`Invalid dependencies format: ${dependencies}, keeping original`);
          dependencies = null;
        }
      }
      
      return {
        adapted: parsed.adapted || false,
        description: parsed.description,
        priority: priority,
        estimatedTime: parsed.estimatedTime,
        suggestedAgent: parsed.suggestedAgent || null,
        dependencies: dependencies,
        reasoning: parsed.reasoning || 'No reasoning provided',
      };
    } catch (error) {
      logger.error('Error parsing adaptation response:', error);
      return { adapted: false };
    }
  }

  /**
   * Calculate workflow progress
   */
  private calculateProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === 'DONE').length;
    return Math.round((completed / tasks.length) * 100);
  }

  /**
   * Apply orchestration rules to a task
   */
  async applyOrchestrationRules(task: Task, context: OrchestrationContext): Promise<Task> {
    if (!task.orchestrationRules) {
      return task;
    }

    logger.info(`📋 Applying orchestration rules to task: ${task.title}`);

    try {
      const rulesPrompt = `
Apply these orchestration rules to the task, considering user inputs:

Task: ${task.title}
Rules: ${task.orchestrationRules}

${context.inputs && Object.keys(context.inputs).length > 0 ? `
USER INPUTS:
${Object.entries(context.inputs)
  .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
  .join('\n')}
` : ''}

Context:
- Project Phase: ${context.projectPhase}
- Resource Availability: ${context.resourceAvailability}
- Time Constraints: ${context.timeConstraints}
- Quality Requirements: ${context.qualityRequirements}

Determine if any task modifications are needed based on the rules, context, and especially user inputs.

Respond in JSON format:
{
  "shouldModify": boolean,
  "modifications": {
    "priority": "high|medium|low|unchanged",
    "timing": "immediate|delayed|unchanged",
    "resources": "additional|reduced|unchanged"
  },
  "reasoning": "explanation including how user inputs influenced the decision"
}
`;

      const response = await this.llm.invoke(rulesPrompt);
      const rulesResult = this.parseRulesResponse(response.content);

      if (rulesResult.shouldModify) {
        const modifiedTask = Object.assign(Object.create(Object.getPrototypeOf(task)), task);
        
        if (rulesResult.modifications.priority !== 'unchanged') {
          modifiedTask.priority = rulesResult.modifications.priority;
        }

        logger.info(`✅ Orchestration rules applied: ${rulesResult.reasoning}`);
        return modifiedTask;
      }

      return task;
    } catch (error) {
      logger.error(`❌ Error applying orchestration rules:`, error);
      return task;
    }
  }

  /**
   * Parse orchestration rules response
   */
  private parseRulesResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { shouldModify: false };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        shouldModify: parsed.shouldModify || false,
        modifications: parsed.modifications || {},
        reasoning: parsed.reasoning || 'No reasoning provided',
      };
    } catch (error) {
      logger.error('Error parsing rules response:', error);
      return { shouldModify: false };
    }
  }
}
