import { Task, Team } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
import { TaskAnalyzer } from '../analysis/TaskAnalyzer';
import { GapAnalyzer } from '../analysis/GapAnalyzer';
/**
 * Handles task generation strategies
 */
export declare class GenerationStrategy {
    private team;
    private llm;
    private taskAnalyzer;
    private gapAnalyzer?;
    constructor(team: Team, llm: any, // LangChain LLM instance
    taskAnalyzer: TaskAnalyzer, gapAnalyzer?: GapAnalyzer | undefined);
    /**
     * Generate additional tasks if gaps are identified
     */
    generateAdditionalTasks(context: OrchestrationContext, selectedTasks: Task[]): Promise<Task[]>;
    /**
     * Identify gaps in the current task set
     */
    private identifyGaps;
    /**
     * Prioritize gaps based on impact and context
     */
    private prioritizeGaps;
    /**
     * Calculate how well a gap aligns with user inputs
     */
    private calculateGapInputAlignment;
    /**
     * Generate a new task for an identified gap
     */
    private generateTaskForGap;
    /**
     * Find a suitable agent for the required skills
     */
    private findSuitableAgent;
    /**
     * Parse task generation response
     */
    private parseTaskGeneration;
    /**
     * Generate continuous optimization tasks
     */
    generateContinuousOptimizationTasks(recommendedTasks: any[], context: OrchestrationContext): Promise<Task[]>;
}
