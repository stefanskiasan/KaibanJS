/**
 * Performance Metrics Manager for Intelligent Orchestration
 * 
 * This module handles all performance tracking and metrics collection
 * for the orchestration system.
 */

import { logger } from '../../utils/logger';
import { OrchestrationMetrics } from './OrchestrationContext';

export class PerformanceMetricsManager {
  private performanceMetrics: Map<string, number>;
  private metricHistory: Map<string, number[]>;
  private performanceLogInterval?: NodeJS.Timeout;

  constructor() {
    this.performanceMetrics = new Map();
    this.metricHistory = new Map();
    this.initializePerformanceTracking();
  }

  /**
   * Initialize performance tracking for orchestrator control
   */
  private initializePerformanceTracking(): void {
    this.performanceMetrics.set('orchestration_calls', 0);
    this.performanceMetrics.set('successful_operations', 0);
    this.performanceMetrics.set('failed_operations', 0);
    this.performanceMetrics.set('llm_calls', 0);
    this.performanceMetrics.set('llm_failures', 0);
    this.performanceMetrics.set('tasks_generated', 0);
    this.performanceMetrics.set('tasks_adapted', 0);
    this.performanceMetrics.set('priority_adjustments', 0);
    this.performanceMetrics.set('task_splits', 0);
    this.performanceMetrics.set('task_merges', 0);
    this.performanceMetrics.set('tasks_tracked', 0);
    this.performanceMetrics.set('total_execution_time', 0);
  }

  /**
   * Update performance metrics for tracking
   */
  updateMetric(metric: string, increment: number = 1): void {
    const current = this.performanceMetrics.get(metric) || 0;
    this.performanceMetrics.set(metric, current + increment);

    // Track metric history for learning
    if (!this.metricHistory.has(metric)) {
      this.metricHistory.set(metric, []);
    }

    const history = this.metricHistory.get(metric)!;
    history.push(increment);

    // Keep only last 100 values for each metric
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }

  /**
   * Get a specific metric value
   */
  getMetric(metric: string): number {
    return this.performanceMetrics.get(metric) || 0;
  }

  /**
   * Get metric history
   */
  getMetricHistory(metric: string): number[] {
    return this.metricHistory.get(metric) || [];
  }

  /**
   * Calculate error rate from performance metrics
   */
  calculateErrorRate(): number {
    const totalOps = this.performanceMetrics.get('orchestration_operations') || 0;
    const failedOps = this.performanceMetrics.get('failed_operations') || 0;

    return totalOps > 0 ? (failedOps / totalOps) * 100 : 0;
  }

  /**
   * Calculate success rate from performance metrics
   */
  calculateSuccessRate(): number {
    const totalOps = this.performanceMetrics.get('orchestration_operations') || 0;
    const successfulOps = this.performanceMetrics.get('successful_operations') || 0;

    return totalOps > 0 ? (successfulOps / totalOps) * 100 : 100;
  }

  /**
   * Get orchestration metrics summary for external reporting
   */
  getOrchestrationMetrics(): {
    performance: Record<string, any>;
    taskStatistics: Record<string, any>;
    systemHealth: Record<string, any>;
  } {
    const metrics = {
      performance: {
        llmCalls: this.performanceMetrics.get('llm_calls_total') || 0,
        llmFailures: this.performanceMetrics.get('llm_failures') || 0,
        avgResponseTime: this.performanceMetrics.get('llm_response_time') || 0,
        orchestrationCalls: this.performanceMetrics.get('orchestration_calls') || 0,
        continuousOrchestrationCalls: this.performanceMetrics.get('continuous_orchestration_calls') || 0,
      },
      taskStatistics: {
        tasksAnalyzed: this.performanceMetrics.get('tasks_analyzed') || 0,
        tasksSelected: this.performanceMetrics.get('tasks_selected') || 0,
        tasksAdapted: this.performanceMetrics.get('tasks_adapted') || 0,
        tasksGenerated: this.performanceMetrics.get('tasks_generated') || 0,
        tasksRejected: this.performanceMetrics.get('tasks_rejected') || 0,
        tasksSplit: this.performanceMetrics.get('tasks_split') || 0,
        tasksMerged: this.performanceMetrics.get('tasks_merged') || 0,
        tasksTracked: this.performanceMetrics.get('tasks_tracked') || 0,
      },
      systemHealth: {
        errorRate: this.calculateErrorRate(),
        successRate: this.calculateSuccessRate(),
        healthChecksPassed: this.performanceMetrics.get('health_checks_passed') || 0,
        recoveryAttempts: this.performanceMetrics.get('recovery_attempts') || 0,
        fallbackOperations: this.performanceMetrics.get('fallback_operations') || 0,
        lastHealthCheck: this.performanceMetrics.get('last_health_check') || 0,
      },
    };

    return metrics;
  }

  /**
   * Log aggregated performance metrics
   */
  logPerformanceMetrics(): void {
    const metrics = {
      llmPerformance: {
        totalCalls: this.performanceMetrics.get('llm_calls_total') || 0,
        avgResponseTime: this.performanceMetrics.get('llm_response_time') || 0,
        failures: this.performanceMetrics.get('llm_failures') || 0,
      },
      taskOperations: {
        analyzed: this.performanceMetrics.get('tasks_analyzed') || 0,
        selected: this.performanceMetrics.get('tasks_selected') || 0,
        adapted: this.performanceMetrics.get('tasks_adapted') || 0,
        generated: this.performanceMetrics.get('tasks_generated') || 0,
        rejected: this.performanceMetrics.get('tasks_rejected') || 0,
      },
      orchestrationEfficiency: {
        avgDecisionTime: this.performanceMetrics.get('avg_decision_time') || 0,
        contextAnalysisTime: this.performanceMetrics.get('context_analysis_time') || 0,
        totalOrchestrationTime: this.performanceMetrics.get('total_orchestration_time') || 0,
      },
      systemHealth: {
        errorRate: this.calculateErrorRate(),
        successRate: this.calculateSuccessRate(),
        recoveryAttempts: this.performanceMetrics.get('recovery_attempts') || 0,
        fallbackOperations: this.performanceMetrics.get('fallback_operations') || 0,
      },
    };

    logger.info('📊 Performance Metrics Summary', metrics);
  }

  /**
   * Start periodic performance metrics logging
   */
  startPerformanceMetricsLogging(): void {
    // Log metrics every 5 minutes
    this.performanceLogInterval = setInterval(() => {
      this.logPerformanceMetrics();
    }, 5 * 60 * 1000);

    // Also log on first start
    setTimeout(() => {
      this.logPerformanceMetrics();
    }, 30000); // After 30 seconds
  }

  /**
   * Stop performance metrics logging
   */
  stopPerformanceMetricsLogging(): void {
    if (this.performanceLogInterval) {
      clearInterval(this.performanceLogInterval);
      this.performanceLogInterval = undefined;
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.performanceMetrics.clear();
    this.metricHistory.clear();
    this.initializePerformanceTracking();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): OrchestrationMetrics {
    // Calculate derived metrics
    const totalTasks = this.getMetric('tasks_tracked');
    const successfulTasks = this.getMetric('successful_operations');
    const avgCompletionTime = totalTasks > 0 ? this.getMetric('total_execution_time') / totalTasks : 0;
    const successRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : null;
    
    return {
      orchestration_calls: this.getMetric('orchestration_calls'),
      successful_operations: this.getMetric('successful_operations'),
      failed_operations: this.getMetric('failed_operations'),
      llm_calls: this.getMetric('llm_calls'),
      llm_failures: this.getMetric('llm_failures'),
      tasks_generated: this.getMetric('tasks_generated'),
      tasks_adapted: this.getMetric('tasks_adapted'),
      priority_adjustments: this.getMetric('priority_adjustments'),
      task_splits: this.getMetric('task_splits'),
      task_merges: this.getMetric('task_merges'),
      tasks_tracked: this.getMetric('tasks_tracked'),
      total_execution_time: this.getMetric('total_execution_time'),
      avgTaskCompletionTime: avgCompletionTime,
      successRate: successRate,
      completionTimeHistory: [],
      successRateHistory: [],
      agentPerformance: {},
      complexityMetrics: {
        averageComplexity: 5,
        complexityDistribution: {
          low: 0,
          medium: 0,
          high: 0,
        },
        complexitySuccessCorrelation: 0,
      },
      orchestrationOptimizations: {
        tasksAdapted: this.getMetric('tasks_adapted'),
        tasksGenerated: this.getMetric('tasks_generated'),
        resourceOptimizations: 0,
      },
      totalTasks: totalTasks,
    };
  }
}