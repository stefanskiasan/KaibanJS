import { Task, Team } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
/**
 * Optimizes workflow execution and task dependencies
 */
export declare class WorkflowOptimizer {
    private team;
    private logOrchestrationEvent;
    constructor(team: Team, logOrchestrationEvent: (event: string, message: string, details?: any) => void);
    /**
     * Optimize task dependencies for better parallelization
     */
    optimizeDependencies(tasks: Task[]): Task[];
    /**
     * Build a dependency graph from tasks
     */
    private buildDependencyGraph;
    /**
     * Identify groups of tasks that can be executed in parallel
     */
    private identifyParallelizableGroups;
    /**
     * Calculate task levels for parallelization
     */
    private calculateLevels;
    /**
     * Identify workflow bottlenecks
     */
    identifyBottlenecks(tasks: Task[], context: OrchestrationContext): {
        criticalPath: string[];
        bottleneckTasks: string[];
        estimatedDuration: number;
    };
    /**
     * Find the critical path in the workflow
     */
    private findCriticalPath;
    /**
     * Find longest path from a given task
     */
    private findLongestPath;
    /**
     * Find tasks that are bottlenecks (many tasks depend on them)
     */
    private findBottleneckTasks;
    /**
     * Calculate total duration for a path
     */
    private calculatePathDuration;
    /**
     * Parse estimated time string to hours
     */
    private parseEstimatedTime;
    /**
     * Generate dependency graph visualization data
     */
    generateDependencyGraph(tasks: Task[]): {
        nodes: Array<{
            id: string;
            label: string;
            type: string;
            status: string;
            agent?: string;
        }>;
        edges: Array<{
            from: string;
            to: string;
            label?: string;
        }>;
        metrics: {
            depth: number;
            parallelism: number;
            criticalPath: string[];
        };
    };
}
