/**
 * Performance Metrics Manager for Intelligent Orchestration
 *
 * This module handles all performance tracking and metrics collection
 * for the orchestration system.
 */
import { OrchestrationMetrics } from './OrchestrationContext';
export declare class PerformanceMetricsManager {
    private performanceMetrics;
    private metricHistory;
    private performanceLogInterval?;
    constructor();
    /**
     * Initialize performance tracking for orchestrator control
     */
    private initializePerformanceTracking;
    /**
     * Update performance metrics for tracking
     */
    updateMetric(metric: string, increment?: number): void;
    /**
     * Get all performance metrics
     */
    getAllMetrics(): Record<string, number>;
    /**
     * Get a specific metric value
     */
    getMetric(metric: string): number;
    /**
     * Get metric history
     */
    getMetricHistory(metric: string): number[];
    /**
     * Calculate error rate from performance metrics
     */
    calculateErrorRate(): number;
    /**
     * Calculate success rate from performance metrics
     */
    calculateSuccessRate(): number;
    /**
     * Get orchestration metrics summary for external reporting
     */
    getOrchestrationMetrics(): {
        performance: Record<string, any>;
        taskStatistics: Record<string, any>;
        systemHealth: Record<string, any>;
    };
    /**
     * Log aggregated performance metrics
     */
    logPerformanceMetrics(): void;
    /**
     * Start periodic performance metrics logging
     */
    startPerformanceMetricsLogging(): void;
    /**
     * Stop performance metrics logging
     */
    stopPerformanceMetricsLogging(): void;
    /**
     * Clear all metrics
     */
    clearMetrics(): void;
    /**
     * Export metrics for analysis
     */
    exportMetrics(): OrchestrationMetrics;
}
