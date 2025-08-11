/**
 * Performance Monitor Service
 *
 * Handles performance tracking, metrics collection, and monitoring
 * for the intelligent orchestration system.
 */
import { Task } from '../../index';
import { TaskPerformanceHistory, PerformanceInsights, OrchestrationEventType } from '../OrchestrationContext';
export declare class PerformanceMonitorService {
    private performanceMetrics;
    private taskPerformanceHistory;
    private metricHistory;
    private performanceLogInterval?;
    private eventCallbacks;
    constructor();
    /**
     * Initialize performance tracking metrics
     */
    private initializePerformanceTracking;
    /**
     * Update a performance metric
     */
    updatePerformanceMetric(metric: string, increment?: number): void;
    /**
     * Track task performance for learning and optimization
     */
    trackTaskPerformance(task: Task, success: boolean, duration?: number): void;
    /**
     * Get task performance score
     */
    getTaskPerformanceScore(task: Task): number;
    /**
     * Calculate error rate from metrics
     */
    calculateErrorRate(): number;
    /**
     * Calculate success rate from metrics
     */
    calculateSuccessRate(): number;
    /**
     * Get comprehensive orchestration metrics
     */
    getOrchestrationMetrics(): {
        performance: Record<string, any>;
        taskStatistics: Record<string, any>;
        systemHealth: Record<string, any>;
    };
    /**
     * Get performance insights and recommendations
     */
    getPerformanceInsights(): PerformanceInsights;
    /**
     * Log comprehensive performance metrics
     */
    logPerformanceMetrics(): void;
    /**
     * Start periodic performance metrics logging
     */
    private startPerformanceMetricsLogging;
    /**
     * Stop performance metrics logging
     */
    stopPerformanceMetricsLogging(): void;
    /**
     * Initialize task performance tracking
     */
    initializeTaskPerformance(task: Task): void;
    /**
     * Get current performance metrics as a simple object
     */
    getCurrentMetrics(): Record<string, number>;
    /**
     * Get current performance metrics as Map for LearningService compatibility
     */
    getCurrentMetricsAsMap(): Map<string, number>;
    /**
     * Get task performance history
     */
    getTaskPerformanceHistory(): Map<string, TaskPerformanceHistory>;
    /**
     * Add event listener
     */
    addEventListener(eventType: OrchestrationEventType, callback: Function): void;
    /**
     * Remove event listener
     */
    removeEventListener(eventType: OrchestrationEventType, callback: Function): void;
    /**
     * Emit performance event
     */
    private emitEvent;
    /**
     * Clean up resources
     */
    destroy(): void;
    /**
     * Reset all metrics (useful for testing)
     */
    resetMetrics(): void;
    /**
     * Generate a unique key for task performance tracking
     */
    private getTaskPerformanceKey;
    /**
     * Simple string hashing function
     */
    private hashString;
    /**
     * Calculate recency weight for performance scoring
     */
    private calculateRecencyWeight;
    /**
     * Analyze performance trend from metric history
     */
    private analyzePerformanceTrend;
    /**
     * Calculate recent performance changes
     */
    private calculateRecentChanges;
    /**
     * Generate performance recommendations
     */
    private generateRecommendations;
}
