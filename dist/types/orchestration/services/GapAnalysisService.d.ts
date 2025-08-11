/**
 * Gap Analysis Service
 *
 * Analyzes workflows, skills, quality, resources, and dependencies to identify
 * gaps that need to be addressed for successful project completion.
 */
import { Agent, Task } from '../../index';
import { OrchestrationContext, TaskGap, GapAnalysisResult, AgentSkillMatch } from '../OrchestrationContext';
export declare class GapAnalysisService {
    private skillPatterns;
    constructor();
    /**
     * Perform comprehensive gap analysis
     */
    performGapAnalysis(context: OrchestrationContext, selectedTasks: Task[]): Promise<GapAnalysisResult>;
    /**
     * Analyze skill gaps between required and available skills
     */
    analyzeSkillGaps(context: OrchestrationContext, selectedTasks: Task[]): TaskGap[];
    /**
     * Analyze workflow gaps (missing validation, documentation, etc.)
     */
    analyzeWorkflowGaps(context: OrchestrationContext, selectedTasks: Task[]): TaskGap[];
    /**
     * Analyze quality gaps based on metrics
     */
    analyzeQualityGaps(context: OrchestrationContext, selectedTasks: Task[]): TaskGap[];
    /**
     * Analyze resource gaps (capacity, skills, time)
     */
    analyzeResourceGaps(context: OrchestrationContext, selectedTasks: Task[]): TaskGap[];
    /**
     * Analyze dependency gaps (missing prerequisites)
     */
    analyzeDependencyGaps(context: OrchestrationContext, selectedTasks: Task[]): TaskGap[];
    /**
     * Prioritize gaps based on impact and urgency
     */
    prioritizeGaps(gaps: TaskGap[], context: OrchestrationContext): TaskGap[];
    /**
     * Get skill match analysis for agents
     */
    getSkillMatchAnalysis(agents: Agent[], tasks: Task[]): AgentSkillMatch[];
    /**
     * Infer agent skills from role and background
     */
    private inferAgentSkills;
    /**
     * Extract required skills from tasks
     */
    private extractRequiredSkills;
    /**
     * Estimate complexity of acquiring a skill
     */
    private estimateSkillComplexity;
    /**
     * Calculate priority of a skill gap
     */
    private calculateSkillPriority;
    /**
     * Check if tasks have security requirements
     */
    private hasSecurityRequirements;
    /**
     * Parse estimated time from string
     */
    private parseEstimatedTime;
    /**
     * Analyze skill distribution balance among agents
     */
    private analyzeSkillDistribution;
}
