import { Task, Team } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
import { ContextAnalyzer } from '../analysis/ContextAnalyzer';
/**
 * Handles task selection strategies
 */
export declare class SelectionStrategy {
    private team;
    private llm;
    private contextAnalyzer;
    constructor(team: Team, llm: any, // LangChain LLM instance
    contextAnalyzer: ContextAnalyzer);
    /**
     * Select tasks from available options based on context and strategy
     */
    selectTasks(availableTasks: Task[], context: OrchestrationContext, preserveExisting: boolean): Promise<Task[]>;
    /**
     * Conservative selection: Focus on low-risk, proven tasks
     */
    private conservativeSelection;
    /**
     * Adaptive selection: Balance based on current context
     */
    private adaptiveSelection;
    /**
     * Innovative selection: Favor novel approaches and higher complexity
     */
    private innovativeSelection;
    /**
     * Learning selection: Focus on tasks that provide learning opportunities
     */
    private learningSelection;
    /**
     * Calculate adaptive score for task selection
     */
    private calculateAdaptiveScore;
    /**
     * Calculate innovative score for task selection
     */
    private calculateInnovativeScore;
    /**
     * Calculate learning score for a task
     */
    private calculateLearningScore;
    /**
     * Categorize tasks for diversity analysis
     */
    private categorizeTasks;
    /**
     * Prioritize tasks based on current strategy
     */
    private prioritizeTasks;
    /**
     * AI-driven task prioritization
     */
    private aiDrivenPrioritization;
    /**
     * Calculate phase alignment score
     */
    private calculatePhaseAlignment;
    /**
     * Estimate task complexity
     */
    private estimateTaskComplexity;
    /**
     * Parse estimated time to hours
     */
    private parseEstimatedTime;
    /**
     * Calculate how well a task aligns with user inputs
     */
    private calculateInputAlignmentScore;
}
