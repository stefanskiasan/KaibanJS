/**
 * Orchestration Status Subscriber.
 *
 * Monitors changes in orchestration events, logging significant activities and maintaining
 * visibility into the intelligent orchestration process. This includes task selection,
 * adaptation, generation, and workflow optimization events.
 *
 * Usage:
 * Use this subscriber to track orchestration activities, enabling monitoring of AI-driven
 * task management and workflow optimization processes.
 */

import { TeamStore } from '../stores';
import { CombinedStoresState } from '../stores/teamStore.types';
import {
  WorkflowLog,
  OrchestrationStatusLog,
  OrchestrationActivatedLog,
  OrchestrationAnalysisLog,
  OrchestrationCompletedLog,
  TaskSelectionLog,
  TaskAdaptationLog,
  TaskGenerationLog,
  OrchestrationErrorLog,
  WorkflowOptimizationLog,
  TaskRepositoryLog,
  PerformanceMonitoringLog,
  TaskCompletionAnalysisLog,
  OrchestrationDecisionsLog,
} from '../types/logs';
import { logger } from '../utils/logger';

/**
 * Pretty log formatting for orchestration events
 */
const logPrettyOrchestration = (log: OrchestrationStatusLog): void => {
  const timestamp = new Date(log.timestamp).toLocaleTimeString();

  switch (log.orchestrationEvent) {
    case 'ACTIVATED': {
      const activatedLog = log as OrchestrationActivatedLog;
      logger.info(
        `🎯 [${timestamp}] Orchestration Activated\n` +
          `   Goal: ${activatedLog.metadata.projectGoal}\n` +
          `   Mode: ${activatedLog.metadata.mode}\n` +
          `   Existing Tasks: ${activatedLog.metadata.existingTasksCount}\n` +
          `   Backlog Tasks: ${activatedLog.metadata.availableTasksCount}\n` +
          `   Preserve Existing: ${
            activatedLog.metadata.preserveExistingTasks ? '✅' : '❌'
          }\n` +
          `   Task Generation: ${
            activatedLog.metadata.allowTaskGeneration ? '✅' : '❌'
          }`
      );
      break;
    }

    case 'DEACTIVATED': {
      logger.info(
        `⏹️ [${timestamp}] Orchestration Deactivated: ${log.metadata.message}`
      );
      break;
    }

    case 'ANALYSIS_STARTED': {
      const analysisLog = log as OrchestrationAnalysisLog;
      const context = analysisLog.metadata.contextAnalysis;
      logger.info(
        `🔍 [${timestamp}] Context Analysis Started\n` +
          `   📊 Active Tasks: ${context.activeTasks} | Available Agents: ${context.availableAgents}\n` +
          `   📈 Progress: ${context.projectProgress}% | Phase: ${context.projectPhase}\n` +
          `   ⚡ Workload: ${context.workload} | Resources: ${context.resourceAvailability}\n` +
          `   🚧 Blocked Tasks: ${context.blockedTasks}`
      );
      break;
    }

    case 'TASK_SELECTION': {
      const selectionLog = log as TaskSelectionLog;
      const metadata = selectionLog.metadata;
      logger.info(
        `📋 [${timestamp}] Task Selection Complete\n` +
          `   Strategy: ${metadata.selectionStrategy.toUpperCase()}\n` +
          `   Selected: ${metadata.selectedTasksCount} | Skipped: ${metadata.skippedTasksCount}\n` +
          `   Gap Analysis: ${metadata.gapAnalysisPerformed ? '✅' : '❌'}\n` +
          `   🎯 Existing Skills: ${metadata.existingSkillsCovered.join(
            ', '
          )}\n` +
          `   ✨ New Skills Added: ${metadata.newSkillsAdded.join(', ')}`
      );
      break;
    }

    case 'TASK_ADAPTATION': {
      const adaptationLog = log as TaskAdaptationLog;
      const permissions = adaptationLog.metadata.adaptationPermissions;
      logger.info(
        `🔧 [${timestamp}] Task Adaptation\n` +
          `   Task: ${adaptationLog.metadata.taskDescription}\n` +
          `   Modification: ${permissions.canModify ? '✅' : '❌'} (${
            permissions.reason
          })\n` +
          `   Adaptation Level: ${adaptationLog.metadata.adaptationLevel.toUpperCase()}\n` +
          `   Allowed Actions: ${permissions.allowedActions.join(', ')}`
      );
      break;
    }

    case 'TASK_GENERATION': {
      const generationLog = log as TaskGenerationLog;
      logger.info(
        `🏗️ [${timestamp}] Task Generation\n` +
          `   Method: ${generationLog.metadata.generationMethod.toUpperCase()}\n` +
          `   Gaps Identified: ${generationLog.metadata.gapsIdentified.length}\n` +
          `   Tasks Generated: ${generationLog.metadata.tasksGenerated}\n` +
          `   📝 Gap Categories: ${generationLog.metadata.gapsIdentified
            .map((g) => g.category)
            .join(', ')}`
      );
      break;
    }

    case 'OPTIMIZATION_STARTED': {
      const optimizationLog = log as WorkflowOptimizationLog;
      logger.info(
        `⚡ [${timestamp}] Workflow Optimization Started\n` +
          `   Performance Issues: ${optimizationLog.metadata.performanceIssues.join(
            ', '
          )}\n` +
          `   Strategy: ${optimizationLog.metadata.optimizationStrategy}\n` +
          `   Target Metrics: ${Object.entries(
            optimizationLog.metadata.targetMetrics
          )
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')}`
      );
      break;
    }

    case 'COMPLETED': {
      const completedLog = log as OrchestrationCompletedLog;
      const results = completedLog.metadata.results;
      const stats = completedLog.metadata.orchestrationStats;
      logger.info(
        `✅ [${timestamp}] Orchestration Completed\n` +
          `   ⏱️ Duration: ${completedLog.metadata.totalDuration}ms\n` +
          `   📊 Results: ${results.totalTasks} total (${results.existingTasksPreserved} existing + ${results.newTasksAdded} new)\n` +
          `   🏗️ Generated: ${results.tasksGenerated} | Adapted: ${results.tasksAdapted}\n` +
          `   🤖 LLM Calls: ${stats.llmCallsCount} | Fallbacks: ${stats.fallbackOperations}\n` +
          `   🔍 Gap Analysis: ${
            stats.gapAnalysisExecuted ? '✅' : '❌'
          } | Optimizations: ${stats.performanceOptimizations}`
      );
      break;
    }

    case 'ERROR': {
      const errorLog = log as OrchestrationErrorLog;
      logger.error(
        `❌ [${timestamp}] Orchestration Error\n` +
          `   Operation: ${errorLog.metadata.operationFailed}\n` +
          `   Error: ${errorLog.metadata.error}\n` +
          `   Fallback: ${errorLog.metadata.fallbackExecuted ? '✅' : '❌'}\n` +
          `   ${
            errorLog.metadata.partialResults
              ? `Partial Results: ${errorLog.metadata.partialResults.tasksProcessed} tasks processed`
              : 'No partial results'
          }`
      );
      break;
    }

    case 'TASK_REPOSITORY_UPDATE': {
      const repoLog = log as TaskRepositoryLog;
      logger.info(
        `📚 [${timestamp}] Task Repository ${repoLog.metadata.operation}\n` +
          `   Operation: ${repoLog.metadata.operation} ${repoLog.metadata.taskCount} task(s)\n` +
          `   Repository Size: ${repoLog.metadata.repositorySize}\n` +
          `   Affected Tasks: ${repoLog.metadata.affectedTaskIds
            .slice(0, 3)
            .join(', ')}${
            repoLog.metadata.affectedTaskIds.length > 3 ? '...' : ''
          }`
      );
      break;
    }

    case 'PERFORMANCE_MONITORING': {
      const perfLog = log as PerformanceMonitoringLog;
      const metrics = perfLog.metadata.metrics;
      logger.info(
        `📈 [${timestamp}] Performance Monitoring\n` +
          `   📊 Completion Rate: ${metrics.taskCompletionRate}% | Avg Duration: ${metrics.averageTaskDuration}ms\n` +
          `   👥 Agent Utilization: ${metrics.agentUtilization}% | Quality Score: ${metrics.qualityScore}\n` +
          `   🚧 Bottlenecks: ${metrics.bottlenecksDetected.join(', ')}\n` +
          `   💡 Recommendations: ${perfLog.metadata.recommendations
            .slice(0, 2)
            .join(', ')}`
      );
      break;
    }

    case 'TASK_COMPLETION_ANALYSIS': {
      const completionLog = log as TaskCompletionAnalysisLog;
      logger.info(
        `🔍 [${timestamp}] Task Completion Analysis\n` +
          `   Completed Task: ${
            completionLog.metadata.completedTaskTitle ||
            completionLog.metadata.completedTaskId
          }\n` +
          `   Progress: ${
            completionLog.metadata.totalTasks -
            completionLog.metadata.remainingTasks
          }/${completionLog.metadata.totalTasks} tasks completed\n` +
          `   Remaining: ${completionLog.metadata.remainingTasks} tasks`
      );
      break;
    }

    case 'ORCHESTRATION_DECISIONS': {
      const decisionsLog = log as OrchestrationDecisionsLog;
      const metadata = decisionsLog.metadata;
      logger.info(
        `🤖 [${timestamp}] Orchestration Decisions Applied\n` +
          `   Decisions Generated: ${metadata.decisionsGenerated}\n` +
          `   📝 Modified Tasks: ${metadata.modifyTasks}\n` +
          `   ➕ Added Tasks: ${metadata.addTasks}\n` +
          `   ➖ Removed Tasks: ${metadata.removeTasks}\n` +
          `   🎯 Priority Changes: ${metadata.changePriorities}\n` +
          `   ⏱️ Processing Time: ${metadata.processingTime}ms`
      );
      break;
    }

    default:
      logger.info(
        `🔧 [${timestamp}] Orchestration Event: ${
          (log as any).orchestrationEvent
        }\n   ${(log as any).metadata.message}`
      );
  }
};

/**
 * Subscribes to orchestration status updates and logs them appropriately.
 * @param useStore - The store instance to subscribe to
 */
const subscribeOrchestrationStatusUpdates = (useStore: TeamStore): void => {
  useStore.subscribe(
    (state: CombinedStoresState) => state.workflowLogs,
    // @ts-expect-error: Zustand subscribe overload is not properly typed
    (newLogs: WorkflowLog[], previousLogs: WorkflowLog[]) => {
      if (newLogs.length > previousLogs.length) {
        const newLog = newLogs[newLogs.length - 1];

        // Check if this is an orchestration log
        if (newLog.logType === 'OrchestrationStatusUpdate') {
          const orchestrationLog = newLog as OrchestrationStatusLog;
          logPrettyOrchestration(orchestrationLog);
        }
      }
    }
  );
};

/**
 * Helper function to create orchestration logs
 */
export const createOrchestrationLog = (
  orchestrationEvent: string,
  message: string,
  metadata: any
): OrchestrationStatusLog => {
  return {
    timestamp: Date.now(),
    logDescription: message,
    logType: 'OrchestrationStatusUpdate',
    orchestrationEvent: orchestrationEvent as any,
    metadata: {
      message,
      ...metadata,
    },
  } as OrchestrationStatusLog;
};

export { subscribeOrchestrationStatusUpdates };
