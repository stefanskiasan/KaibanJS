/**
 * Task Selection Service
 *
 * Handles task selection, adaptation, prioritization, and workflow optimization
 * for the intelligent orchestration system.
 */
import { Task } from '../../index';
import { OrchestrationContext, OrchestrationMode, TaskPrioritization, SplitStrategyPreference } from '../OrchestrationContext';
import { LangChainChatModel } from '../../utils/agents';
export declare class TaskSelectionService {
    private llm;
    private mode;
    private taskPrioritization;
    private splitStrategyPreference;
    private orchestrationStrategy;
    constructor(llm: LangChainChatModel | null, mode?: OrchestrationMode, taskPrioritization?: TaskPrioritization, orchestrationStrategy?: string, splitStrategyPreference?: SplitStrategyPreference);
    /**
     * Select optimal tasks from available repository based on project goals
     */
    selectOptimalTasks(projectGoal: string, availableTasks: Task[], context: OrchestrationContext, preserveExistingTasks?: boolean, orchestrationMode?: 'initial' | 'continuous'): Promise<Task[]>;
    /**
     * Validate task against orchestration rules
     */
    validateTaskAgainstRules(task: Task, context: OrchestrationContext): boolean;
    /**
     * Adapt existing task based on current context and requirements
     */
    adaptTask(task: Task, context: OrchestrationContext, adaptationReason?: string): Promise<Task | null>;
    /**
     * Apply dynamic priority ordering to tasks
     */
    applyDynamicPriorityOrdering(tasks: Task[], context: OrchestrationContext): Task[];
    /**
     * Calculate dynamic priority score for a task
     */
    private calculateDynamicPriorityScore;
    /**
     * Process split recommendation for a task
     */
    private processSplitRecommendation;
    /**
     * Apply task adaptations to create a new adapted task
     */
    private applyTaskAdaptations;
    /**
     * Parse LLM response for task selection
     */
    private parseTaskSelectionResponse;
    /**
     * Parse LLM response for task adaptation
     */
    private parseAdaptationResponse;
    /**
     * Fallback task selection when LLM is unavailable
     */
    private fallbackTaskSelection;
    /**
     * Process selected tasks from LLM response
     */
    private processSelectedTasks;
    /**
     * Check if an agent can handle a specific task
     */
    private canAgentHandleTask;
    /**
     * Extract skills from agent background and role
     */
    private extractAgentSkills;
    /**
     * Extract maximum workload constraint from orchestration rules
     */
    private extractMaxWorkload;
    /**
     * Compare workload levels
     */
    private compareWorkload;
    /**
     * Update configuration
     */
    updateConfiguration(config: {
        mode?: OrchestrationMode;
        taskPrioritization?: TaskPrioritization;
        orchestrationStrategy?: string;
        splitStrategyPreference?: SplitStrategyPreference;
    }): void;
}
