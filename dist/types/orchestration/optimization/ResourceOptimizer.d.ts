import { Task, Team, Agent } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
/**
 * Optimizes resource allocation and workload distribution
 */
export declare class ResourceOptimizer {
    private team;
    private extractTaskComplexity;
    private logOrchestrationEvent;
    constructor(team: Team, extractTaskComplexity: (task: Task) => number, logOrchestrationEvent: (event: string, message: string, details?: any) => void);
    /**
     * Optimize resource utilization across agents
     */
    optimizeResourceUtilization(context: OrchestrationContext, tasks: Task[]): Promise<void>;
    /**
     * Redistribute tasks for better load balancing
     */
    private redistributeTasks;
    /**
     * Check if an agent can handle a specific task
     */
    private canHandleTask;
    /**
     * Calculate workload distribution across agents
     */
    calculateWorkloadDistribution(tasks: Task[]): Array<{
        agentName: string;
        assignedTasks: number;
    }>;
    /**
     * Calculate agent workload score for intelligent distribution
     */
    calculateAgentWorkloadScore(agent: Agent, context: OrchestrationContext): number;
    /**
     * Find optimal agent for a task using intelligent workload distribution
     */
    findOptimalAgent(task: Task, context: OrchestrationContext): Agent | null;
    /**
     * Calculate skill match between agent and task
     */
    private calculateSkillMatch;
    /**
     * Calculate agent specialization score
     */
    private calculateSpecializationScore;
    /**
     * Analyze agent utilization pattern
     */
    analyzeAgentUtilizationPattern(): {
        imbalanceScore: number;
    };
}
