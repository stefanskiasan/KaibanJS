/**
 * Intelligent Orchestrator for KaibanJS
 *
 * This module implements an AI-powered orchestrator that can autonomously:
 * - Select optimal tasks from a repository
 * - Adapt existing tasks to current circumstances
 * - Generate new tasks when gaps are identified
 * - Optimize workflow performance in real-time
 */
import { Agent, Task, Team } from '../index';
/**
 * Context information for orchestrator decision-making
 */
export interface OrchestrationContext {
    activeTasks: Task[];
    availableAgents: Agent[];
    projectProgress: number;
    blockedTasks: Task[];
    codeCoverage: number;
    performanceScore: number;
    workload: string;
    projectPhase: string;
    similarTasks: Task[];
    newPriorities?: string[];
    resourceAvailability: string;
    timeConstraints: string;
    qualityRequirements: string;
    existingTasks: Task[];
}
/**
 * Task gap information for new task generation
 */
export interface TaskGap {
    id?: string;
    description: string;
    category: string;
    estimatedComplexity: 'low' | 'medium' | 'high';
    requirements: string[];
    dependencies: string[];
    priority?: 'high' | 'medium' | 'low';
    suggestedSolution?: string;
}
/**
 * Task modification permissions
 */
export interface TaskModificationPermissions {
    canModify: boolean;
    reason: string;
    allowedActions: string[];
}
/**
 * Intelligent Orchestrator Class
 *
 * Uses LLM-powered decision making to autonomously manage task workflows
 */
export declare class IntelligentOrchestrator {
    private team;
    private availableTasks;
    private orchestrationStrategy;
    private mode;
    private llm;
    private conversationHistory;
    private performanceMetrics;
    private taskAdaptationHistory;
    private taskPerformanceHistory;
    private performanceLogInterval?;
    private metricHistory?;
    private splitStrategyPreference;
    private llmCache;
    private cacheTimeout;
    private adaptationTimeout;
    constructor(team: Team);
    /**
     * Initialize performance tracking for orchestrator control
     */
    private initializePerformanceTracking;
    /**
     * Enhanced error handling with fallback strategies
     */
    private handleOrchestrationError;
    /**
     * Recover from task selection failures
     */
    private recoverFromTaskSelectionFailure;
    /**
     * Recover from task generation failures
     */
    private recoverFromTaskGenerationFailure;
    /**
     * Recover from task adaptation failures
     */
    private recoverFromTaskAdaptationFailure;
    /**
     * Recover from LLM communication failures
     */
    private recoverFromLLMFailure;
    /**
     * Recover from workflow orchestration failures
     */
    private recoverFromWorkflowFailure;
    /**
     * Generic recovery strategy for unknown operations
     */
    private applyGenericRecoveryStrategy;
    /**
     * Create an emergency task when all else fails
     */
    private createEmergencyTask;
    /**
     * Ensure LLM is initialized (lazy initialization)
     */
    private ensureLLMInitialized;
    /**
     * Initialize LLM instance for the orchestrator
     */
    private initializeLLM;
    /**
     * Create LLM instance from configuration
     */
    private createLLMFromConfig;
    /**
     * Main orchestration method
     * Analyzes context and optimally arranges tasks
     * @param projectGoal - The overall goal for the orchestrator to optimize towards
     * @param preserveExistingTasks - Whether to keep existing tasks and build upon them (default: true)
     */
    orchestrateWorkflow(projectGoal: string, preserveExistingTasks?: boolean): Promise<Task[]>;
    /**
     * Analyze current team and project context
     */
    private analyzeCurrentContext;
    /**
     * Select optimal tasks from available repository
     * Performs gap analysis considering existing tasks
     */
    private selectOptimalTasks;
    /**
     * Generate additional tasks if gaps are identified
     */
    private generateAdditionalTasks;
    /**
     * Adapt tasks to current context and circumstances
     */
    private adaptTasksToContext;
    /**
     * Evaluate whether a task can be modified by the orchestrator
     */
    private evaluateTaskModificationPermissions;
    /**
     * Performance optimization: Batch adapt multiple tasks
     */
    private batchAdaptTasks;
    /**
     * Adapt a single task based on current context
     */
    private adaptTask;
    private parseAdaptationResponse;
    /**
     * Validate task against its orchestration rules and current context
     */
    private validateTaskAgainstRules;
    private compareWorkload;
    private applyTaskAdaptations;
    /**
     * Update team's task list with orchestrated tasks (replaces all tasks)
     */
    private updateTeamTasks;
    /**
     * Apply dynamic priority ordering to tasks based on current context
     */
    private applyDynamicPriorityOrdering;
    /**
     * Calculate dynamic priority score for a task based on multiple factors
     */
    private calculateDynamicPriorityScore;
    /**
     * Process task split recommendation
     */
    private processSplitRecommendation;
    /**
     * Process task merge recommendation
     */
    private processMergeRecommendation;
    /**
     * Apply priority adjustments from continuous orchestration recommendations
     */
    private applyPriorityAdjustments;
    /**
     * Add new orchestrated tasks to existing team tasks
     * Prevents duplicates and maintains existing tasks
     */
    private addOrchestrationTasks;
    /**
     * Helper method to log orchestration events
     */
    private logOrchestrationEvent;
    /**
     * Log to console with appropriate log levels based on event type
     */
    private logToConsoleWithLevel;
    /**
     * Calculate error rate from performance metrics
     */
    private calculateErrorRate;
    /**
     * Calculate success rate from performance metrics
     */
    private calculateSuccessRate;
    /**
     * Log aggregated performance metrics
     */
    private logPerformanceMetrics;
    /**
     * Start periodic performance metrics logging
     */
    private startPerformanceMetricsLogging;
    /**
     * Stop performance metrics logging
     */
    private stopPerformanceMetricsLogging;
    /**
     * Get orchestration metrics summary for external reporting
     */
    getOrchestrationMetrics(): {
        performance: Record<string, any>;
        taskStatistics: Record<string, any>;
        systemHealth: Record<string, any>;
    };
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
    /**
     * Prioritize gaps based on impact and context
     */
    private prioritizeGaps;
    /**
     * Infer skills from agent role and background
     */
    private inferAgentSkills;
    /**
     * Parse estimated time string to hours
     */
    private parseEstimatedTime;
    /**
     * Calculate workload per agent
     */
    private calculateAgentWorkload;
    /**
     * Calculate workload distribution across agents
     */
    private calculateWorkloadDistribution;
    /**
     * Identify gaps in task coverage with comprehensive analysis
     */
    private identifyTaskGaps;
    /**
     * Generate a new task for an identified gap
     */
    private generateTaskForGap;
    private calculateProjectProgress;
    private calculateCurrentWorkload;
    private determineProjectPhase;
    /**
     * Calculate agent workload score for intelligent distribution
     */
    private calculateAgentWorkloadScore;
    /**
     * Match agent skills to task requirements
     */
    private calculateSkillMatchScore;
    /**
     * Extract skills from agent profile
     */
    private extractAgentSkills;
    /**
     * Find optimal agent for a task using intelligent workload distribution
     */
    private findOptimalAgent;
    /**
     * Calculate overall agent score for task assignment
     */
    private calculateAgentScore;
    /**
     * Calculate agent affinity for certain task types
     */
    private calculateAgentAffinityScore;
    /**
     * Calculate agent performance score based on historical data
     */
    private calculateAgentPerformanceScore;
    /**
     * Track task performance for learning
     */
    private trackTaskPerformance;
    /**
     * Initialize task performance tracking
     */
    private initializeTaskPerformance;
    /**
     * Get performance score for a template task
     */
    private getTaskPerformanceScore;
    /**
     * Generate a key for task performance tracking
     */
    private getTaskPerformanceKey;
    /**
     * Simple string hash for consistent keys
     */
    private hashString;
    /**
     * Calculate recency weight for performance scores
     */
    private calculateRecencyWeight;
    /**
     * Apply performance-based learning to task selection
     */
    private applyPerformanceBasedFiltering;
    /**
     * Predict potential task failures based on historical data and current context
     */
    private predictTaskFailures;
    /**
     * Create recovery strategies for high-risk tasks
     */
    private createTaskRecoveryStrategies;
    /**
     * Generate task dependency graph visualization data
     */
    generateDependencyGraph(tasks: Task[]): {
        nodes: Array<{
            id: string;
            label: string;
            type: string;
            status: string;
            agent?: string;
        }>;
        edges: Array<{
            from: string;
            to: string;
            label?: string;
        }>;
        metrics: {
            depth: number;
            parallelism: number;
            criticalPath: string[];
        };
    };
    /**
     * Calculate dependency graph metrics
     */
    private calculateGraphMetrics;
    /**
     * Find the critical path in the task dependency graph
     */
    private findCriticalPath;
    /**
     * Get performance insights for orchestration decisions
     */
    private getPerformanceInsights;
    private assessResourceAvailability;
    private assessTimeConstraints;
    private assessQualityRequirements;
    /**
     * Optimize resource utilization across agents
     */
    private optimizeResourceUtilization;
    /**
     * Redistribute tasks for better load balancing
     */
    private redistributeTasks;
    /**
     * Check if agent can handle a specific task
     */
    private canAgentHandleTask;
    /**
     * Automated workflow recovery for detected failures
     */
    private performWorkflowRecovery;
    /**
     * Determine recovery strategies based on failure type
     */
    private determineRecoveryStrategies;
    /**
     * Retry a failed task with delay
     */
    private retryTask;
    /**
     * Reassign task to a different agent
     */
    private reassignTask;
    /**
     * Split a failed task into smaller subtasks
     */
    private splitFailedTask;
    /**
     * Execute a simplified fallback version of the task
     */
    private executeFallbackTask;
    /**
     * Skip a task and mark it as optional
     */
    private skipTask;
    /**
     * Robust JSON parsing with common issue fixes
     */
    private parseRobustJSON;
    /**
     * Handle task completion for continuous orchestration
     * This method is called after each task completion when continuousOrchestration is enabled
     */
    orchestrateTaskCompletion(completedTask: Task, allTasks: Task[]): Promise<any>;
    private generateTaskCompletionRecommendations;
    /**
     * Apply task completion recommendations to the workflow
     */
    private applyTaskCompletionRecommendations;
    /**
     * Generate new tasks specifically for continuous orchestration optimization
     */
    private generateContinuousOptimizationTasks;
    /**
     * Monitor orchestrator performance and health
     */
    private performHealthCheck;
    /**
     * Update performance metrics for tracking
     */
    private updatePerformanceMetric;
    /**
     * Validate orchestration configuration for edge cases
     */
    private validateOrchestrationConfig;
    /**
     * Get orchestrator control status and recommendations
     */
    getControlStatus(): Promise<{
        status: 'healthy' | 'warning' | 'error';
        healthCheck: any;
        configValidation: any;
        recommendations: string[];
    }>;
    /**
     * Select tasks specifically for continuous orchestration optimization
     */
    private selectContinuousOptimizationTasks;
    /**
     * Enhanced performance learning algorithm
     */
    private learnFromPerformanceHistory;
    /**
     * Analyze metric trends
     */
    private analyzeMetricTrends;
    /**
     * Identify performance patterns
     */
    private identifyPerformancePatterns;
    /**
     * Adjust strategies based on learning
     */
    private adjustStrategiesBasedOnLearning;
    /**
     * Helper method to analyze complexity vs success pattern
     */
    private analyzeComplexitySuccessPattern;
    /**
     * Helper method to analyze agent utilization pattern
     */
    private analyzeAgentUtilizationPattern;
    /**
     * Helper method to analyze time-based performance
     */
    private analyzeTimeBasedPerformance;
    /**
     * Adjust task split strategy
     */
    private adjustTaskSplitStrategy;
    /**
     * Estimate task complexity
     */
    private estimateTaskComplexity;
    /**
     * Identify high-risk tasks based on various factors
     */
    private identifyHighRiskTasks;
    /**
     * Simple logging method
     */
    private log;
    /**
     * Build orchestration context for LLM prompts
     */
    private buildOrchestrationContext;
    /**
     * Call LLM with proper error handling and retries
     */
    private callLLM;
    /**
     * Performance optimization: Generate hash for prompt caching
     */
    private hashPrompt;
    /**
     * Performance optimization: Clean expired cache entries
     */
    private cleanExpiredCache;
}
