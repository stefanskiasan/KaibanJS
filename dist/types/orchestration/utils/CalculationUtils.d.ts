import { Task, Agent } from '../../index';
/**
 * Utility functions for various calculations
 */
export declare class CalculationUtils {
    /**
     * Calculate recency weight for performance scores
     */
    static calculateRecencyWeight(lastUpdated: number): number;
    /**
     * Calculate agent affinity for certain task types
     */
    static calculateAgentAffinityScore(agent: Agent, task: Task): number;
    /**
     * Calculate agent performance score based on historical data
     */
    static calculateAgentPerformanceScore(agent: Agent, completedTasks: Task[]): number;
    /**
     * Calculate overall agent score for task assignment
     */
    static calculateAgentScore(agent: Agent, task: Task, context: {
        workloadScore: number;
        skillMatchScore: number;
        performanceScore: number;
        affinityScore: number;
    }): number;
    /**
     * Calculate task complexity based on various factors
     */
    static calculateTaskComplexity(task: Task): number;
    /**
     * Parse estimated time to hours (helper method)
     */
    private static parseEstimatedTimeToHours;
    /**
     * Calculate variance for a set of numbers
     */
    static calculateVariance(numbers: number[]): number;
    /**
     * Calculate standard deviation
     */
    static calculateStandardDeviation(numbers: number[]): number;
    /**
     * Calculate percentile
     */
    static calculatePercentile(numbers: number[], percentile: number): number;
}
