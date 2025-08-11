/**
 * Recovery Service
 *
 * Handles error recovery and fallback strategies
 * for the intelligent orchestration system.
 */
import { Task } from '../../index';
import { RecoveryStrategy, OrchestrationMode } from '../OrchestrationContext';
export declare class RecoveryService {
    private recoveryAttempts;
    private recoveryHistory;
    private mode;
    constructor(mode?: OrchestrationMode);
    /**
     * Handle orchestration error with recovery strategies
     */
    handleOrchestrationError(operation: string, error: Error, context?: any): Promise<any>;
    /**
     * Get available recovery strategies for an operation
     */
    getRecoveryStrategies(operation: string): RecoveryStrategy[];
    /**
     * Predict potential task failures
     */
    predictTaskFailures(tasks: Task[]): Map<string, number>;
    /**
     * Create recovery strategies for high-risk tasks
     */
    createTaskRecoveryStrategies(tasks: Task[], failureProbabilities: Map<string, number>): Map<string, RecoveryStrategy[]>;
    /**
     * Clear recovery history (useful for testing)
     */
    clearRecoveryHistory(): void;
    /**
     * Get recovery statistics
     */
    getRecoveryStatistics(): {
        totalAttempts: number;
        successRate: number;
        recentFailures: number;
    };
    private recoverFromTaskSelectionFailure;
    private recoverFromTaskAdaptationFailure;
    private recoverFromTaskGenerationFailure;
    private recoverFromLLMFailure;
    private genericRecovery;
    private recordRecoveryAttempt;
    private parseEstimatedTime;
}
