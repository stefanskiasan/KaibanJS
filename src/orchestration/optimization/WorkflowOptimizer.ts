import { Task, Team } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';

/**
 * Optimizes workflow execution and task dependencies
 */
export class WorkflowOptimizer {
  constructor(
    private team: Team,
    private logOrchestrationEvent: (event: string, message: string, details?: any) => void
  ) {}

  /**
   * Optimize task dependencies for better parallelization
   */
  optimizeDependencies(tasks: Task[]): Task[] {
    logger.info('🔗 Optimizing task dependencies for parallelization');

    // Create dependency graph
    const dependencyGraph = this.buildDependencyGraph(tasks);

    // Identify opportunities for parallelization
    const parallelizableGroups = this.identifyParallelizableGroups(
      dependencyGraph
    );

    // Update task properties for parallel execution
    parallelizableGroups.forEach((group) => {
      group.forEach((taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          task.allowParallelExecution = true;
        }
      });
    });

    // Log optimization results
    if (parallelizableGroups.length > 0) {
      this.logOrchestrationEvent(
        'DEPENDENCIES_OPTIMIZED',
        `Identified ${parallelizableGroups.length} groups of tasks that can run in parallel`,
        {
          parallelGroups: parallelizableGroups.length,
          totalParallelTasks: parallelizableGroups.reduce(
            (sum, group) => sum + group.length,
            0
          ),
        }
      );
    }

    return tasks;
  }

  /**
   * Build a dependency graph from tasks
   */
  private buildDependencyGraph(
    tasks: Task[]
  ): Map<string, { dependencies: string[]; dependents: string[] }> {
    const graph = new Map<
      string,
      { dependencies: string[]; dependents: string[] }
    >();

    // Initialize graph nodes
    tasks.forEach((task) => {
      graph.set(task.id, {
        dependencies: task.dependencies || [],
        dependents: [],
      });
    });

    // Build dependents relationships
    tasks.forEach((task) => {
      if (task.dependencies) {
        task.dependencies.forEach((depId) => {
          const depNode = graph.get(depId);
          if (depNode) {
            depNode.dependents.push(task.id);
          }
        });
      }
    });

    return graph;
  }

  /**
   * Identify groups of tasks that can be executed in parallel
   */
  private identifyParallelizableGroups(
    graph: Map<string, { dependencies: string[]; dependents: string[] }>
  ): string[][] {
    const groups: string[][] = [];
    const visited = new Set<string>();
    const levels = this.calculateLevels(graph);

    // Group tasks by level (tasks at same level can run in parallel)
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, taskId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(taskId);
    });

    // Convert to array and filter out single-task groups
    levelGroups.forEach((group) => {
      if (group.length > 1) {
        groups.push(group);
      }
    });

    return groups;
  }

  /**
   * Calculate task levels for parallelization
   */
  private calculateLevels(
    graph: Map<string, { dependencies: string[]; dependents: string[] }>
  ): Map<string, number> {
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    // Helper function for DFS
    const calculateLevel = (taskId: string): number => {
      if (levels.has(taskId)) {
        return levels.get(taskId)!;
      }

      if (visited.has(taskId)) {
        // Circular dependency detected
        return 0;
      }

      visited.add(taskId);

      const node = graph.get(taskId);
      if (!node || node.dependencies.length === 0) {
        levels.set(taskId, 0);
        return 0;
      }

      const maxDepLevel = Math.max(
        ...node.dependencies.map((depId) => calculateLevel(depId))
      );

      const level = maxDepLevel + 1;
      levels.set(taskId, level);
      return level;
    };

    // Calculate levels for all tasks
    graph.forEach((_, taskId) => {
      calculateLevel(taskId);
    });

    return levels;
  }

  /**
   * Identify workflow bottlenecks
   */
  identifyBottlenecks(tasks: Task[], context: OrchestrationContext): {
    criticalPath: string[];
    bottleneckTasks: string[];
    estimatedDuration: number;
  } {
    const graph = this.buildDependencyGraph(tasks);
    const criticalPath = this.findCriticalPath(tasks, graph);
    const bottleneckTasks = this.findBottleneckTasks(tasks, graph);

    // Calculate estimated duration
    const estimatedDuration = this.calculatePathDuration(criticalPath, tasks);

    if (criticalPath.length > 0) {
      this.logOrchestrationEvent(
        'BOTTLENECKS_IDENTIFIED',
        `Found critical path with ${criticalPath.length} tasks`,
        {
          criticalPathLength: criticalPath.length,
          bottleneckCount: bottleneckTasks.length,
          estimatedDuration,
        }
      );
    }

    return {
      criticalPath,
      bottleneckTasks,
      estimatedDuration,
    };
  }

  /**
   * Find the critical path in the workflow
   */
  private findCriticalPath(
    tasks: Task[],
    graph: Map<string, { dependencies: string[]; dependents: string[] }>
  ): string[] {
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const durations = new Map<string, number>();
    const paths = new Map<string, string[]>();

    // Calculate task durations (simplified - uses estimated time)
    tasks.forEach((task) => {
      const hours = this.parseEstimatedTime(
        task.resourceRequirements?.estimatedTime || '2 hours'
      );
      durations.set(task.id, hours);
    });

    // Find tasks with no dependents (end tasks)
    const endTasks = Array.from(graph.entries())
      .filter(([_, node]) => node.dependents.length === 0)
      .map(([taskId]) => taskId);

    let longestPath: string[] = [];
    let maxDuration = 0;

    // Find longest path from each end task
    endTasks.forEach((endTask) => {
      const { path, duration } = this.findLongestPath(
        endTask,
        graph,
        durations
      );
      if (duration > maxDuration) {
        maxDuration = duration;
        longestPath = path;
      }
    });

    return longestPath;
  }

  /**
   * Find longest path from a given task
   */
  private findLongestPath(
    taskId: string,
    graph: Map<string, { dependencies: string[]; dependents: string[] }>,
    durations: Map<string, number>
  ): { path: string[]; duration: number } {
    const memo = new Map<string, { path: string[]; duration: number }>();

    const dfs = (currentId: string): { path: string[]; duration: number } => {
      if (memo.has(currentId)) {
        return memo.get(currentId)!;
      }

      const node = graph.get(currentId);
      const currentDuration = durations.get(currentId) || 0;

      if (!node || node.dependencies.length === 0) {
        const result = { path: [currentId], duration: currentDuration };
        memo.set(currentId, result);
        return result;
      }

      let maxSubPath: string[] = [];
      let maxSubDuration = 0;

      node.dependencies.forEach((depId) => {
        const { path, duration } = dfs(depId);
        if (duration > maxSubDuration) {
          maxSubDuration = duration;
          maxSubPath = path;
        }
      });

      const result = {
        path: [...maxSubPath, currentId],
        duration: maxSubDuration + currentDuration,
      };
      memo.set(currentId, result);
      return result;
    };

    return dfs(taskId);
  }

  /**
   * Find tasks that are bottlenecks (many tasks depend on them)
   */
  private findBottleneckTasks(
    tasks: Task[],
    graph: Map<string, { dependencies: string[]; dependents: string[] }>
  ): string[] {
    const bottlenecks: string[] = [];
    const avgDependents =
      Array.from(graph.values()).reduce(
        (sum, node) => sum + node.dependents.length,
        0
      ) / graph.size;

    graph.forEach((node, taskId) => {
      // A task is a bottleneck if many tasks depend on it
      if (node.dependents.length > avgDependents * 1.5) {
        bottlenecks.push(taskId);
      }
    });

    return bottlenecks;
  }

  /**
   * Calculate total duration for a path
   */
  private calculatePathDuration(path: string[], tasks: Task[]): number {
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    let totalDuration = 0;

    path.forEach((taskId) => {
      const task = taskMap.get(taskId);
      if (task?.resourceRequirements?.estimatedTime) {
        totalDuration += this.parseEstimatedTime(
          task.resourceRequirements.estimatedTime
        );
      }
    });

    return totalDuration;
  }

  /**
   * Parse estimated time string to hours
   */
  private parseEstimatedTime(estimatedTime: string): number {
    const match = estimatedTime.match(/(\d+)\s*(hours?|days?|minutes?)/i);
    if (!match) return 2;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'minute':
      case 'minutes':
        return value / 60;
      case 'hour':
      case 'hours':
        return value;
      case 'day':
      case 'days':
        return value * 8;
      default:
        return 2;
    }
  }

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
  } {
    // Create nodes
    const nodes = tasks.map((task) => ({
      id: task.id,
      label: task.title || task.description.slice(0, 30) + '...',
      type: task.isDeliverable ? 'deliverable' : 'task',
      status: task.status,
      agent: task.agent?.name,
    }));

    // Create edges
    const edges: Array<{ from: string; to: string; label?: string }> = [];
    tasks.forEach((task) => {
      if (task.dependencies) {
        task.dependencies.forEach((depId) => {
          edges.push({
            from: depId,
            to: task.id,
            label: 'depends on',
          });
        });
      }
    });

    // Calculate metrics
    const graph = this.buildDependencyGraph(tasks);
    const levels = this.calculateLevels(graph);
    const depth = Math.max(...Array.from(levels.values())) + 1;

    // Calculate parallelism (max tasks at any level)
    const levelCounts = new Map<number, number>();
    levels.forEach((level) => {
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    });
    const parallelism = Math.max(...Array.from(levelCounts.values()));

    // Find critical path
    const { criticalPath } = this.identifyBottlenecks(tasks, {} as OrchestrationContext);

    return {
      nodes,
      edges,
      metrics: {
        depth,
        parallelism,
        criticalPath,
      },
    };
  }
}
