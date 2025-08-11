/**
 * Dependency Graph Service
 *
 * Handles dependency analysis and graph operations for task orchestration.
 */
import { Task } from '../../index';
import { DependencyGraph, GraphMetrics } from '../OrchestrationContext';
export declare class DependencyGraphService {
    /**
     * Generate dependency graph from tasks with metrics for Team.generateDependencyGraph compatibility
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
    /**
     * Generate internal dependency graph structure for service usage
     */
    generateInternalDependencyGraph(tasks: Task[]): DependencyGraph;
    /**
     * Calculate graph metrics
     */
    calculateGraphMetrics(graph: DependencyGraph): GraphMetrics;
    /**
     * Validate dependency graph for cycles
     */
    validateGraph(graph: DependencyGraph): {
        isValid: boolean;
        cycles: string[][];
    };
    /**
     * Get tasks that can be executed in parallel
     */
    getParallelExecutableNodes(graph: DependencyGraph): string[][];
    /**
     * Optimize task order based on dependencies
     */
    optimizeExecutionOrder(graph: DependencyGraph): string[];
    private calculateLevels;
    private findCriticalPath;
}
