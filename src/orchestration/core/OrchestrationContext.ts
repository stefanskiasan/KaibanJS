/**
 * Core Types and Interfaces for Intelligent Orchestration
 * 
 * This module contains the core type definitions and interfaces used throughout
 * the intelligent orchestration system.
 */

import { Task, Agent } from '../../index';

/**
 * Context information for orchestrator decision-making
 */
export interface OrchestrationContext {
  activeTasks: Task[];
  availableAgents: Agent[];
  projectProgress: number;
  blockedTasks: Task[];
  codeCoverage: number; // Legacy: kept for backward compatibility
  processCoverage?: number; // Domain-agnostic: percentage of process/workflow covered
  performanceScore: number; // Legacy: kept for backward compatibility  
  qualityScore?: number; // Domain-agnostic: overall quality metric
  workload: string;
  projectPhase: string;
  similarTasks: Task[];
  newPriorities?: string[];
  resourceAvailability: string;
  timeConstraints: string;
  qualityRequirements: string;
  existingTasks: Task[]; // All existing tasks in the team (including completed, pending, etc.)
  inputs?: Record<string, unknown>; // User-provided inputs from team.start()
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
 * Task performance history tracking
 */
export interface TaskPerformanceHistory {
  successRate: number;
  averageDuration: number;
  completions: number;
  failures: number;
  lastUpdated: number;
}

/**
 * Task adaptation history tracking
 */
export interface TaskAdaptationHistory {
  taskId: string;
  timestamp: number;
  adaptationLevel: string;
  reasoning: string;
}

/**
 * Orchestration modes
 */
export type OrchestrationMode = 'conservative' | 'adaptive' | 'innovative' | 'learning';

/**
 * Task split strategy preferences
 */
export type SplitStrategyPreference = 'conservative' | 'moderate' | 'aggressive';

/**
 * Orchestration metrics for performance tracking
 */
export interface OrchestrationMetrics {
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
  avgTaskCompletionTime: number;
  successRate: number | null;
  completionTimeHistory: number[];
  successRateHistory: number[];
  agentPerformance: Record<string, {
    successRate: number;
    avgCompletionTime: number;
    tasksCompleted: number;
  }>;
  complexityMetrics: {
    averageComplexity: number;
    complexityDistribution: {
      low: number;
      medium: number;
      high: number;
    };
    complexitySuccessCorrelation: number;
  };
  orchestrationOptimizations: {
    tasksAdapted: number;
    tasksGenerated: number;
    resourceOptimizations: number;
  };
  totalTasks: number;
}

/**
 * LLM cache entry
 */
export interface LLMCacheEntry {
  response: any;
  timestamp: number;
}

/**
 * Recovery strategy configuration
 */
export interface RecoveryStrategy {
  type: 'retry' | 'reassign' | 'split' | 'fallback' | 'skip';
  config: any;
}

/**
 * Agent workload information
 */
export interface AgentWorkload {
  agentId: string;
  agentName: string;
  currentLoad: number;
  assignedTasks: number;
}

/**
 * Dependency graph node
 */
export interface DependencyGraphNode {
  id: string;
  label: string;
  type: string;
  status: string;
  agent?: string;
}

/**
 * Dependency graph edge
 */
export interface DependencyGraphEdge {
  from: string;
  to: string;
  label?: string;
}

/**
 * Dependency graph metrics
 */
export interface DependencyGraphMetrics {
  depth: number;
  parallelism: number;
  criticalPath: string[];
}

/**
 * Performance insights
 */
export interface PerformanceInsights {
  highPerformingTasks: string[];
  lowPerformingTasks: string[];
  recommendations: string[];
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  metrics: Record<string, number>;
  recommendations: string[];
}

/**
 * Control status information
 */
export interface ControlStatus {
  status: 'healthy' | 'warning' | 'error';
  healthCheck: HealthCheckResult;
  configValidation: ConfigValidationResult;
  recommendations: string[];
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Metric trend information for performance analysis
 */
export interface MetricTrend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

/**
 * Task recommendation for optimization
 */
export interface TaskRecommendation {
  taskId: string;
  basedOnTasks: string[];
  estimatedDuration: number;
  recommendedAgent: string | null;
  potentialIssues: string[];
  confidence: number;
}

/**
 * Task completion recommendations
 */
export interface TaskCompletionRecommendations {
  analysis: {
    taskImpact: string;
    dependenciesUnblocked: string[];
    newOpportunities: string[];
    identifiedRisks: string[];
    qualityAssessment: string;
  };
  recommendations: {
    newTasks: any[];
    taskModifications: any[];
    priorityAdjustments: any[];
    resourceOptimizations: any[];
  };
  urgency: 'immediate' | 'next_iteration' | 'next_review';
  confidenceLevel: 'high' | 'medium' | 'low';
  nextReviewTrigger?: string;
}