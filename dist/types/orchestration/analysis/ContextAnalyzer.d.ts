import { Task, Team, Agent } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
/**
 * Analyzes orchestration context and project state
 */
export declare class ContextAnalyzer {
    private team;
    constructor(team: Team);
    /**
     * Analyze current team and project context
     */
    analyzeCurrentContext(inputs: Record<string, unknown>): Promise<OrchestrationContext>;
    /**
     * Calculate project progress percentage
     */
    calculateProjectProgress(): number;
    /**
     * Calculate current workload status
     */
    calculateCurrentWorkload(): string;
    /**
     * Determine current project phase
     */
    determineProjectPhase(): string;
    /**
     * Assess resource availability
     */
    assessResourceAvailability(): string;
    /**
     * Assess time constraints
     */
    assessTimeConstraints(): string;
    /**
     * Assess quality requirements
     */
    assessQualityRequirements(): string;
    /**
     * Calculate workload distribution across agents
     */
    calculateWorkloadDistribution(tasks: Task[]): Array<{
        agentName: string;
        assignedTasks: number;
    }>;
    /**
     * Calculate workload per agent
     */
    calculateAgentWorkload(tasks: Task[]): Map<string, number>;
    /**
     * Calculate agent workload score for intelligent distribution
     */
    calculateAgentWorkloadScore(agent: Agent, context: OrchestrationContext): number;
    /**
     * Calculate dynamic priority score for a task based on multiple factors
     */
    calculateDynamicPriorityScore(task: Task, context: OrchestrationContext): number;
    /**
     * Parse estimated time string to hours
     */
    private parseEstimatedTime;
    /**
     * Helper method to get team tasks
     */
    private getTeamTasks;
    /**
     * Helper method to get team agents
     */
    private getTeamAgents;
}
