/**
 * Workload Manager Service
 *
 * Handles agent workload distribution, task assignment optimization,
 * and resource balancing for the intelligent orchestration system.
 */
import { Agent, Task } from '../../index';
import { OrchestrationContext, WorkloadDistribution, AgentWorkload, AgentSkillMatch } from '../OrchestrationContext';
export declare class WorkloadManagerService {
    private workloadDistribution;
    private currentWorkloads;
    private skillCache;
    constructor(workloadDistribution?: WorkloadDistribution);
    /**
     * Find the optimal agent for a given task
     */
    findOptimalAgent(task: Task, context: OrchestrationContext): Agent | null;
    /**
     * Calculate comprehensive agent score for task assignment
     */
    calculateAgentScore(agent: Agent, task: Task, context: OrchestrationContext): number;
    /**
     * Calculate skill match score between agent and task
     */
    calculateSkillMatchScore(agent: Agent, task: Task): number;
    /**
     * Calculate agent workload score (higher score = less loaded)
     */
    calculateAgentWorkloadScore(agent: Agent, context: OrchestrationContext): number;
    /**
     * Calculate agent affinity score based on role-task matching
     */
    calculateAgentAffinityScore(agent: Agent, task: Task): number;
    /**
     * Calculate agent performance score based on historical data
     */
    calculateAgentPerformanceScore(agent: Agent, context: OrchestrationContext): number;
    /**
     * Calculate current workload for all agents
     */
    calculateAgentWorkload(tasks: Task[]): Map<string, number>;
    /**
     * Get workload distribution summary
     */
    calculateWorkloadDistribution(tasks: Task[]): Array<{
        agentName: string;
        assignedTasks: number;
    }>;
    /**
     * Get detailed agent workload information
     */
    getAgentWorkloads(agents: Agent[], tasks: Task[]): AgentWorkload[];
    /**
     * Check if an agent can handle a specific task
     */
    canAgentHandleTask(agent: Agent, task: Task): boolean;
    /**
     * Rebalance workload across agents
     */
    rebalanceWorkload(agents: Agent[], tasks: Task[]): Task[];
    /**
     * Get skill match analysis for agents and tasks
     */
    getSkillMatchAnalysis(agents: Agent[], tasks: Task[]): AgentSkillMatch[];
    /**
     * Update workload distribution strategy
     */
    updateDistributionStrategy(strategy: WorkloadDistribution): void;
    /**
     * Get current workload statistics
     */
    getWorkloadStatistics(agents: Agent[], tasks: Task[]): {
        totalWorkload: number;
        averageWorkload: number;
        workloadVariance: number;
        utilizationRate: number;
    };
    /**
     * Extract skills from agent background and role
     */
    private extractAgentSkills;
    /**
     * Extract required skills from tasks
     */
    private extractRequiredSkills;
    /**
     * Parse estimated time from string
     */
    private parseEstimatedTime;
    /**
     * Get current workload hours for an agent
     */
    private getCurrentWorkloadHours;
    /**
     * Get weight distribution based on workload strategy
     */
    private getWeightsByStrategy;
    /**
     * Calculate simple performance score (placeholder for more sophisticated metrics)
     */
    private calculateSimplePerformanceScore;
}
