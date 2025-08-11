import { Task, Agent } from '../../index';
import { TaskRecommendation } from '../core/OrchestrationContext';
/**
 * Analyzes tasks and provides recommendations
 */
export declare class TaskAnalyzer {
    private extractAgentSkills;
    private extractTaskComplexity;
    constructor(extractAgentSkills: (agent: Agent) => string[], extractTaskComplexity: (task: Task) => number);
    /**
     * Select optimal agent for a task
     */
    selectOptimalAgent(task: Task, availableAgents: Agent[], existingTasks: Task[]): Agent | null;
    /**
     * Filter agents that have required skills for the task
     */
    private filterSuitableAgents;
    /**
     * Calculate suitability score for an agent-task pairing
     */
    private calculateAgentSuitabilityScore;
    /**
     * Calculate skill match score
     */
    private calculateSkillMatchScore;
    /**
     * Calculate workload score (lower workload = higher score)
     */
    private calculateWorkloadScore;
    /**
     * Calculate performance score based on past tasks
     */
    private calculatePerformanceScore;
    /**
     * Calculate complexity alignment score
     */
    private calculateComplexityAlignmentScore;
    /**
     * Analyze similar completed tasks to generate recommendations
     */
    generateTaskRecommendations(newTasks: Task[], completedTasks: Task[]): Promise<TaskRecommendation[]>;
    /**
     * Find tasks similar to the given task
     */
    private findSimilarTasks;
    /**
     * Analyze patterns in similar tasks
     */
    private analyzeTaskPatterns;
    /**
     * Extract common issues from failed tasks
     */
    private extractCommonIssues;
    /**
     * Analyze task for potential issues before execution
     */
    analyzeTaskRisks(task: Task, context: {
        existingTasks: Task[];
        availableAgents: Agent[];
    }): string[];
    /**
     * Parse estimated time string to hours
     */
    private parseEstimatedTime;
}
