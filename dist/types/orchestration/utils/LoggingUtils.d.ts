import { Team } from '../../index';
/**
 * Utility functions for logging orchestration events
 */
export declare class LoggingUtils {
    /**
     * Log orchestration event with structured data
     */
    static logOrchestrationEvent(event: string, message: string, details?: any, team?: Team): void;
    /**
     * Log to console with appropriate log levels based on event type
     */
    static logToConsoleWithLevel(event: string, message: string, details?: any): void;
    /**
     * Simple logging method
     */
    static log(level: string, message: string, meta?: any): void;
    /**
     * Log performance metrics
     */
    static logPerformanceMetrics(operation: string, duration: number, details?: any): void;
    /**
     * Log task assignment
     */
    static logTaskAssignment(taskTitle: string, agentName: string, score: number): void;
    /**
     * Log optimization results
     */
    static logOptimizationResults(optimizationType: string, before: any, after: any): void;
    /**
     * Calculate improvement percentage
     */
    private static calculateImprovement;
}
