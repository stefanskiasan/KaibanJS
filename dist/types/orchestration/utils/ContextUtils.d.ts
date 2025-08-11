import { Task, Team, Agent } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
/**
 * Utility functions for building and managing orchestration context
 */
export declare class ContextUtils {
    /**
     * Build orchestration context for LLM prompts
     */
    static buildOrchestrationContext(team: Team): any;
    /**
     * Extract skills from agent profile
     */
    static extractAgentSkills(agent: Agent): string[];
    /**
     * Calculate skill match score between agent and task
     */
    static calculateSkillMatchScore(agent: Agent, task: Task): number;
    /**
     * Calculate project phase based on progress
     */
    static determineProjectPhase(progress: number): string;
    /**
     * Assess resource availability
     */
    static assessResourceAvailability(agents: Agent[]): string;
    /**
     * Calculate current workload status
     */
    static calculateCurrentWorkload(activeTasks: number, totalAgents: number): string;
    /**
     * Create a minimal context for specific operations
     */
    static createMinimalContext(activeTasks: Task[], availableAgents: Agent[], projectProgress: number): Partial<OrchestrationContext>;
}
