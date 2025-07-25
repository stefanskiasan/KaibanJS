/**
 * Orchestration Log Types
 *
 * Defines log types for intelligent orchestration events including
 * task selection, adaptation, generation, and workflow optimization.
 */

import { BaseWorkflowLog } from './common';

// Orchestration activation logs
export interface OrchestrationActivatedLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'ACTIVATED';
  metadata: {
    message: string;
    projectGoal: string;
    preserveExistingTasks: boolean;
    existingTasksCount: number;
    availableTasksCount: number;
    mode: 'conservative' | 'adaptive' | 'innovative' | 'learning';
    allowTaskGeneration: boolean;
    orchestrationStrategy?: string;
  };
}

export interface OrchestrationDeactivatedLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'DEACTIVATED';
  metadata: {
    message: string;
    reason: string;
  };
}

// Task analysis and selection logs
export interface OrchestrationAnalysisLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'ANALYSIS_STARTED';
  metadata: {
    message: string;
    contextAnalysis: {
      activeTasks: number;
      availableAgents: number;
      projectProgress: number;
      blockedTasks: number;
      workload: string;
      projectPhase: string;
      resourceAvailability: string;
    };
  };
}

export interface TaskSelectionLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'TASK_SELECTION';
  metadata: {
    message: string;
    selectionStrategy: 'llm' | 'fallback' | 'gap_analysis';
    selectedTasksCount: number;
    skippedTasksCount: number;
    selectionCriteria: string[];
    gapAnalysisPerformed: boolean;
    existingSkillsCovered: string[];
    newSkillsAdded: string[];
  };
}

export interface TaskAdaptationLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'TASK_ADAPTATION';
  metadata: {
    message: string;
    taskId: string;
    taskDescription: string;
    adaptationLevel: 'none' | 'minor' | 'moderate' | 'major';
    adaptationPermissions: {
      canModify: boolean;
      reason: string;
      allowedActions: string[];
    };
    adaptationChanges?: string[];
  };
}

export interface TaskGenerationLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'TASK_GENERATION';
  metadata: {
    message: string;
    gapsIdentified: Array<{
      description: string;
      category: string;
      complexity: 'low' | 'medium' | 'high';
      requirements: string[];
    }>;
    tasksGenerated: number;
    generationMethod: 'llm' | 'template' | 'fallback';
  };
}

// Workflow optimization logs
export interface WorkflowOptimizationLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'OPTIMIZATION_STARTED';
  metadata: {
    message: string;
    performanceIssues: string[];
    optimizationStrategy: string;
    targetMetrics: Record<string, number>;
  };
}

export interface ContinuousOptimizationLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'CONTINUOUS_OPTIMIZATION';
  metadata: {
    message: string;
    adaptationInterval: number;
    optimizationsApplied: Array<{
      type: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: string;
    }>;
  };
}

// Orchestration completion logs
export interface OrchestrationCompletedLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'COMPLETED';
  metadata: {
    message: string;
    totalDuration: number;
    results: {
      existingTasksPreserved: number;
      newTasksAdded: number;
      tasksGenerated: number;
      tasksAdapted: number;
      totalTasks: number;
    };
    finalWorkloadDistribution: {
      agentName: string;
      assignedTasks: number;
    }[];
    orchestrationStats: {
      llmCallsCount: number;
      fallbackOperations: number;
      gapAnalysisExecuted: boolean;
      performanceOptimizations: number;
    };
  };
}

export interface OrchestrationErrorLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'ERROR';
  metadata: {
    message: string;
    error: string;
    errorStack?: string;
    operationFailed: string;
    fallbackExecuted: boolean;
    partialResults?: {
      tasksProcessed: number;
      operationsCompleted: string[];
    };
  };
}

// Task repository management logs
export interface TaskRepositoryLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'TASK_REPOSITORY_UPDATE';
  metadata: {
    message: string;
    operation: 'ADD' | 'REMOVE' | 'UPDATE';
    taskCount: number;
    repositorySize: number;
    affectedTaskIds: string[];
  };
}

// Performance monitoring logs
export interface PerformanceMonitoringLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'PERFORMANCE_MONITORING';
  metadata: {
    message: string;
    metrics: {
      taskCompletionRate: number;
      averageTaskDuration: number;
      agentUtilization: number;
      bottlenecksDetected: string[];
      qualityScore: number;
    };
    recommendations: string[];
    nextOptimizationScheduled: number; // timestamp
  };
}

// Task completion analysis logs
export interface TaskCompletionAnalysisLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'TASK_COMPLETION_ANALYSIS';
  metadata: {
    message: string;
    completedTaskId: string;
    completedTaskTitle?: string;
    totalTasks: number;
    remainingTasks: number;
  };
}

// Orchestration decisions logs
export interface OrchestrationDecisionsLog extends BaseWorkflowLog {
  logType: 'OrchestrationStatusUpdate';
  orchestrationEvent: 'ORCHESTRATION_DECISIONS';
  metadata: {
    message: string;
    decisionsGenerated: number;
    modifyTasks: number;
    addTasks: number;
    removeTasks: number;
    changePriorities: number;
    processingTime: number;
  };
}

// Union type for all orchestration logs
export type OrchestrationStatusLog =
  | OrchestrationActivatedLog
  | OrchestrationDeactivatedLog
  | OrchestrationAnalysisLog
  | TaskSelectionLog
  | TaskAdaptationLog
  | TaskGenerationLog
  | WorkflowOptimizationLog
  | ContinuousOptimizationLog
  | OrchestrationCompletedLog
  | OrchestrationErrorLog
  | TaskRepositoryLog
  | PerformanceMonitoringLog
  | TaskCompletionAnalysisLog
  | OrchestrationDecisionsLog;

// Orchestration event types for filtering
export type OrchestrationEventType =
  | 'ACTIVATED'
  | 'DEACTIVATED'
  | 'ANALYSIS_STARTED'
  | 'TASK_SELECTION'
  | 'TASK_ADAPTATION'
  | 'TASK_GENERATION'
  | 'OPTIMIZATION_STARTED'
  | 'CONTINUOUS_OPTIMIZATION'
  | 'COMPLETED'
  | 'ERROR'
  | 'TASK_REPOSITORY_UPDATE'
  | 'PERFORMANCE_MONITORING'
  | 'TASK_COMPLETION_ANALYSIS'
  | 'ORCHESTRATION_DECISIONS'
  | 'PERFORMANCE_METRICS_SUMMARY'
  | 'FALLBACK_TASK_SELECTION'
  | 'FALLBACK_TASK_ADAPTATION'
  | 'FALLBACK_TASK_GENERATION'
  | 'LLM_RECOVERY_SUCCESS'
  | 'LLM_RECOVERY_FAILED'
  | 'WORKFLOW_RECOVERY'
  | 'GENERIC_RECOVERY'
  | 'EMERGENCY_TASK_CREATED'
  | 'RECOVERY_SUCCESS'
  | 'CONTINUOUS_ORCHESTRATION_STARTED'
  | 'CONTINUOUS_ORCHESTRATION_COMPLETED'
  | 'CONTINUOUS_ORCHESTRATION_ERROR'
  | 'TASK_COMPLETION_ANALYSIS_ERROR'
  | 'RECOMMENDATIONS_APPLIED'
  | 'RECOMMENDATIONS_APPLICATION_ERROR'
  | 'CONTINUOUS_TASK_GENERATION'
  | 'HEALTH_CHECK'
  | 'CONFIG_VALIDATION'
  | 'CONTINUOUS_TASK_SELECTION'
  | 'TASK_SPLIT_RECOMMENDED'
  | 'TASK_MERGE_RECOMMENDED'
  | 'ORCHESTRATION_ERROR'
  | 'GAP_ANALYSIS_COMPLETED'
  | 'HIGH_RISK_TASKS_IDENTIFIED'
  | 'RESOURCE_OPTIMIZATION'
  | 'TASKS_REDISTRIBUTED'
  | 'TASK_RETRY'
  | 'TASK_REASSIGNED'
  | 'TASK_SPLIT_FOR_RECOVERY'
  | 'FALLBACK_TASK_CREATED'
  | 'TASK_SKIPPED'
  | 'LEARNING_INSIGHTS'
  | 'STRATEGY_ADJUSTED';
