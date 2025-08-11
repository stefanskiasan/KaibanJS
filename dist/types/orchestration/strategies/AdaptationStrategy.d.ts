import { Task, Team } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
/**
 * Handles task adaptation strategies
 */
export declare class AdaptationStrategy {
    private team;
    private llm;
    constructor(team: Team, llm: any);
    /**
     * Batch adapt multiple tasks in parallel
     */
    batchAdaptTasks(tasks: Task[]): Promise<Task[]>;
    /**
     * Adapt a single task based on current context
     */
    adaptTask(task: Task): Promise<Task>;
    /**
     * Parse LLM adaptation response
     */
    private parseAdaptationResponse;
    /**
     * Calculate workflow progress
     */
    private calculateProgress;
    /**
     * Apply orchestration rules to a task
     */
    applyOrchestrationRules(task: Task, context: OrchestrationContext): Promise<Task>;
    /**
     * Parse orchestration rules response
     */
    private parseRulesResponse;
}
