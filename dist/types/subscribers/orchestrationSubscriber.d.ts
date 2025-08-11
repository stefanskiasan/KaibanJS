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
import { OrchestrationStatusLog } from '../types/logs';
/**
 * Subscribes to orchestration status updates and logs them appropriately.
 * @param useStore - The store instance to subscribe to
 */
declare const subscribeOrchestrationStatusUpdates: (useStore: TeamStore) => void;
/**
 * Helper function to create orchestration logs
 */
export declare const createOrchestrationLog: (orchestrationEvent: string, message: string, metadata: any) => OrchestrationStatusLog;
export { subscribeOrchestrationStatusUpdates };
