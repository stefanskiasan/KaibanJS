import { Task, Agent } from '../../index';
import { OrchestrationContext, TaskGap } from '../core/OrchestrationContext';
/**
 * Analyzes gaps in task coverage and workflow
 */
export declare class GapAnalyzer {
    private availableTasks;
    private extractAgentSkills;
    constructor(availableTasks: Task[], extractAgentSkills: (agent: Agent) => string[]);
    /**
     * Identify gaps in task coverage with comprehensive analysis
     */
    identifyTaskGaps(context: OrchestrationContext, selectedTasks: Task[]): Promise<TaskGap[]>;
    /**
     * Analyze skill gaps in the current workflow
     */
    private analyzeSkillGaps;
    /**
     * Analyze workflow gaps
     */
    private analyzeWorkflowGaps;
    /**
     * Analyze quality gaps
     */
    private analyzeQualityGaps;
    /**
     * Analyze resource gaps
     */
    private analyzeResourceGaps;
    /**
     * Analyze dependency gaps
     */
    private analyzeDependencyGaps;
}
