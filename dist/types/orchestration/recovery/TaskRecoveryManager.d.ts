import { Task } from '../../index';
/**
 * Recovery strategy configuration
 */
export interface RecoveryStrategy {
    type: 'retry' | 'reassign' | 'split';
    config: any;
}
/**
 * Task recovery manager for handling task failures
 * Note: This requires LLM to function properly
 */
export declare class TaskRecoveryManager {
    private team;
    private logOrchestrationEvent;
    constructor(team: any, logEventCallback: (event: string, message: string, data: any) => void);
    /**
     * Automated workflow recovery for detected failures
     */
    performWorkflowRecovery(failedTask: Task, failureReason: string): Promise<void>;
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
     * Extract skills from agent background and role
     */
    private extractAgentSkills;
    /**
     * Create recovery strategies for high-risk tasks
     */
    createTaskRecoveryStrategies(tasks: Task[], failureProbabilities: Map<string, number>): Map<string, string[]>;
}
