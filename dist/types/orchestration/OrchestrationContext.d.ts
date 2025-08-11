/**
 * Orchestration Context and Type Definitions
 *
 * This module contains all interfaces, types, and enums used throughout
 * the intelligent orchestration system.
 */
import { Agent, Task } from '../index';
import { LangChainChatModel } from '../utils/agents';
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
 * Orchestration modes defining AI behavior patterns
 */
export type OrchestrationMode = 'conservative' | 'adaptive' | 'innovative' | 'learning';
/**
 * Task prioritization strategies
 */
export type TaskPrioritization = 'static' | 'dynamic' | 'ai-driven';
/**
 * Workload distribution strategies
 */
export type WorkloadDistribution = 'balanced' | 'skills-based' | 'availability';
/**
 * Task split strategies
 */
export type SplitStrategy = 'none' | 'manual' | 'auto';
/**
 * Split strategy preferences
 */
export type SplitStrategyPreference = 'conservative' | 'moderate' | 'aggressive';
/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
    orchestration_calls: number;
    successful_operations: number;
    failed_operations: number;
    llm_calls: number;
    llm_failures: number;
    tasks_generated: number;
    tasks_adapted: number;
    priority_adjustments: number;
    task_splits: number;
    task_merges: number;
    tasks_tracked: number;
    total_execution_time: number;
}
/**
 * Task adaptation history entry
 */
export interface TaskAdaptationHistoryEntry {
    taskId: string;
    timestamp: number;
    adaptationLevel: string;
    reasoning: string;
}
/**
 * Task performance history entry
 */
export interface TaskPerformanceHistory {
    successRate: number;
    averageDuration: number;
    completions: number;
    failures: number;
    lastUpdated: number;
}
/**
 * Orchestration configuration
 */
export interface OrchestrationConfig {
    enableOrchestration: boolean;
    continuousOrchestration?: boolean;
    backlogTasks?: Task[];
    allowTaskGeneration?: boolean;
    orchestrationStrategy?: string;
    mode?: OrchestrationMode;
    maxActiveTasks?: number;
    taskPrioritization?: TaskPrioritization;
    workloadDistribution?: WorkloadDistribution;
    llmInstance?: LangChainChatModel;
}
/**
 * LLM cache entry
 */
export interface LLMCacheEntry {
    response: any;
    timestamp: number;
}
/**
 * Performance insights
 */
export interface PerformanceInsights {
    currentPerformance: {
        successRate: number;
        averageResponseTime: number;
        errorRate: number;
    };
    trends: {
        performanceTrend: 'improving' | 'declining' | 'stable';
        recentChanges: number;
    };
    recommendations: string[];
}
/**
 * Agent workload information
 */
export interface AgentWorkload {
    agentId: string;
    currentTasks: number;
    estimatedHours: number;
    skillUtilization: number;
    performanceScore: number;
}
/**
 * Dependency graph node
 */
export interface DependencyGraphNode {
    id: string;
    task: Task;
    dependencies: string[];
    dependents: string[];
    level: number;
    criticalPath: boolean;
}
/**
 * Dependency graph
 */
export interface DependencyGraph {
    nodes: Map<string, DependencyGraphNode>;
    edges: Array<{
        from: string;
        to: string;
    }>;
    levels: number;
    criticalPath: string[];
}
/**
 * Graph metrics
 */
export interface GraphMetrics {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    criticalPathLength: number;
    parallelismOpportunities: number;
    bottlenecks: string[];
}
/**
 * Control status information
 */
export interface ControlStatus {
    isEnabled: boolean;
    currentMode: OrchestrationMode;
    activeTasks: number;
    totalAvailableTasks: number;
    performanceMetrics: PerformanceMetrics;
    lastOrchestrationTime: number | null;
    health: {
        llmConnection: boolean;
        errorRate: number;
        responseTime: number;
    };
}
/**
 * Learning patterns
 */
export interface LearningPattern {
    type: string;
    confidence: number;
    description: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
}
/**
 * Recovery strategy
 */
export interface RecoveryStrategy {
    type: string;
    description: string;
    priority: number;
    estimatedSuccess: number;
    resourceRequirements: string[];
}
/**
 * Orchestration event types
 */
export type OrchestrationEventType = 'ORCHESTRATION_START' | 'ORCHESTRATION_COMPLETE' | 'TASK_SELECTED' | 'TASK_ADAPTED' | 'TASK_GENERATED' | 'PRIORITY_ADJUSTED' | 'WORKFLOW_OPTIMIZED' | 'ORCHESTRATION_ERROR' | 'RECOVERY_INITIATED' | 'PERFORMANCE_ALERT' | 'PERFORMANCE_METRICS_SUMMARY' | 'LEARNING_UPDATE';
/**
 * Orchestration event
 */
export interface OrchestrationEvent {
    type: OrchestrationEventType;
    message: string;
    metadata?: any;
    timestamp?: number;
}
/**
 * Gap analysis result
 */
export interface GapAnalysisResult {
    skillGaps: TaskGap[];
    workflowGaps: TaskGap[];
    qualityGaps: TaskGap[];
    resourceGaps: TaskGap[];
    dependencyGaps: TaskGap[];
    prioritizedGaps: TaskGap[];
}
/**
 * Agent skill match result
 */
export interface AgentSkillMatch {
    agent: Agent;
    matchScore: number;
    availableSkills: string[];
    requiredSkills: string[];
    missingSkills: string[];
}
