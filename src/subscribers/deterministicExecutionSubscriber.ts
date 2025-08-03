import { DepGraph } from 'dependency-graph';
import PQueue from 'p-queue';
import { Task } from '..';
import { CombinedStoresState, TeamStore } from '../stores';
import { TASK_STATUS_enum, WORKFLOW_STATUS_enum } from '../utils/enums';
import {
  TaskCompletionLog,
  TaskStatusLog,
  WorkflowLog,
  WorkflowStatusLog,
} from '../types/logs';

export type DependencyResult = {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  result: string | Record<string, unknown>;
  timestamp: number;
};

type DependencyGraph = DepGraph<string>;

/**
 * Creates a deterministic execution subscriber that manages task execution
 * using a queue and dependency graph.
 *
 * @param teamStore - The team store instance
 * @returns Cleanup function to unsubscribe
 */
export const subscribeDeterministicExecution = (teamStore: TeamStore): void => {
  const taskQueue = new PQueue({ concurrency: 5, autoStart: true });

  // A graph with the pending tasks to execute
  // Every time a task is done, it is removed from the graph
  const executionDepGraph: DependencyGraph = new DepGraph();

  // A graph with the dependencies between tasks
  // This is used to get the context for a task
  const contextDepGraph: DependencyGraph = new DepGraph();

  const _isTaskAgentBusy = (currentTask: Task, tasks: Task[]): boolean => {
    return tasks.some(
      (t) =>
        t.agent &&
        t.id !== currentTask.id &&
        t.agent.id === currentTask.agent.id &&
        t.status === TASK_STATUS_enum.DOING
    );
  };

  /**
   * Get the context for a task from the previous tasks results.
   * Process:
   * 1. Find all tasks that the current task depends on. This is a recursive process.
   * 2. Get the results of the dependencies
   * 3. Return the results as a string
   */
  const _getContextForTask = (
    teamStoreState: CombinedStoresState,
    task: Task
  ): string => {
    const logs = teamStoreState.workflowLogs;
    const resultsFromParentTasks: DependencyResult[] = [];

    // Get all dependencies for the current task
    const dependencies = contextDepGraph.dependantsOf(task.id);

    for (const dependencyId of dependencies) {
      const dependency: Task | undefined = teamStoreState.tasks.find(
        (t) => t.id === dependencyId
      );
      //Find last log for the dependency, latest is needed because it could be feedback in same task.
      const dependencyResultsLogs = [...logs]
        .reverse()
        .find(
          (l) =>
            l.logType === 'TaskStatusUpdate' &&
            (l as TaskStatusLog).taskStatus === TASK_STATUS_enum.DONE &&
            (l as TaskStatusLog).task.id === dependencyId
        ) as TaskCompletionLog | undefined;

      if (!dependencyResultsLogs || !dependency) {
        console.warn(
          `No dependency results found for task ${dependencyId}`,
          dependencies
        );
        continue;
      }

      resultsFromParentTasks.push({
        taskId: dependency.id,
        taskTitle: dependency.title,
        result: dependencyResultsLogs.metadata.result,
        taskDescription: dependency.description,
        timestamp: dependencyResultsLogs.timestamp,
      });
    }

    // Create context string from dependency results
    const taskResults = resultsFromParentTasks
      .map(
        ({ taskDescription, result }) =>
          `Task: ${taskDescription}\nResult: ${
            typeof result === 'object' ? JSON.stringify(result) : result
          }\n`
      )
      .join('\n');

    return taskResults;
  };

  /**
   * Execute the task
   */
  const _executeTask = async (
    teamStoreState: CombinedStoresState,
    task: Task
  ): Promise<void> => {
    const context = _getContextForTask(teamStoreState, task);

    teamStoreState.updateTaskStatus(task.id, TASK_STATUS_enum.DOING);
    return await teamStoreState.workOnTask(task.agent, task, context);
  };

  const _resumeTask = async (
    teamStoreState: CombinedStoresState,
    task: Task
  ): Promise<void> => {
    teamStoreState.updateTaskStatus(task.id, TASK_STATUS_enum.DOING);
    return await teamStoreState.workOnTaskResume(task.agent, task);
  };

  /**
   * Add a task to the execution queue
   */
  const _queueTask = ({
    teamStoreState,
    task,
    highPriority = false,
    resume = false,
  }: {
    teamStoreState: CombinedStoresState;
    task: Task;
    highPriority?: boolean;
    resume?: boolean;
  }): void => {
    taskQueue
      .add(
        () =>
          (resume
            ? _resumeTask(teamStoreState, task)
            : _executeTask(teamStoreState, task)
          ).catch((error) => {
            teamStoreState.handleTaskError({
              agent: task.agent.agentInstance,
              task,
              error,
            });
            teamStoreState.handleWorkflowError(error);
          }),
        { priority: highPriority ? 1 : 0 }
      )
      .catch((error: unknown) => {
        console.error('Error queuing task: ' + error);
        // throw new Error('Error queuing task: ' + error.message);
      });
  };

  /**
   * Initialize the dependency graph with tasks and their dependencies
   */
  const _initializeGraph = (): void => {
    _clearGraph(executionDepGraph);
    _clearGraph(contextDepGraph);

    const tasks = teamStore.getState().tasks;
    tasks.forEach((task) => {
      executionDepGraph.addNode(task.id);
      contextDepGraph.addNode(task.id);
    });

    tasks.forEach((task, index) => {
      const hasDependencies =
        Array.isArray(task.dependencies) && task.dependencies.length > 0;
      if (hasDependencies) {
        task.dependencies.forEach((depReferenceId) => {
          const dep = tasks.find((t) => t.referenceId === depReferenceId);
          if (dep) {
            executionDepGraph.addDependency(dep.id, task.id);
            contextDepGraph.addDependency(dep.id, task.id);
          }
        });
      }

      // for tasks that are not allowed to run in parallel:
      // add dependencies to all previous tasks
      if (!task.allowParallelExecution && index > 0) {
        for (let i = 0; i < index; i++) {
          const previousTask = tasks[i];
          executionDepGraph.addDependency(previousTask.id, task.id);

          // add context dependencies to all non-parallel previous tasks
          if (!hasDependencies && !previousTask.allowParallelExecution) {
            contextDepGraph.addDependency(previousTask.id, task.id);
          }
        }
      }
    });
  };

  // add tasks ready to execute to queue
  const _queueTasksReadyToExecute = (
    teamStoreState: CombinedStoresState
  ): void => {
    const entryNodes = executionDepGraph.entryNodes();
    const allowedStatusesToRun = [
      TASK_STATUS_enum.TODO,
      TASK_STATUS_enum.REVISE,
    ];
    
    // Debug logging
    console.log('[DEBUG] _queueTasksReadyToExecute called');
    console.log('[DEBUG] Graph size:', executionDepGraph.size());
    console.log('[DEBUG] Entry nodes:', entryNodes);
    console.log('[DEBUG] Total tasks:', teamStoreState.tasks.length);
    console.log('[DEBUG] TODO tasks:', teamStoreState.tasks.filter(t => t.status === TASK_STATUS_enum.TODO).map(t => ({ id: t.id, title: t.title, hasAgent: !!t.agent })));
    
    entryNodes.forEach((taskId) => {
      const task = teamStoreState.tasks.find((t) => t.id === taskId);
      if (!task) {
        console.log('[DEBUG] Task not found for ID:', taskId);
        return;
      }

      const isTaskAgentBusy = _isTaskAgentBusy(task, teamStoreState.tasks);
      console.log('[DEBUG] Checking task:', task.id, 'Status:', task.status, 'Agent busy:', isTaskAgentBusy);

      if (
        allowedStatusesToRun.includes(task.status as TASK_STATUS_enum) &&
        !isTaskAgentBusy
      ) {
        console.log('[DEBUG] Queueing task:', task.id);
        _queueTask({ teamStoreState, task });
      }
    });
    
    // Fallback: If graph is empty but we have TODO tasks, queue them directly
    if (entryNodes.length === 0) {
      console.log('[DEBUG] No entry nodes found, checking for orphaned TODO tasks');
      const todoTasks = teamStoreState.tasks.filter(
        t => t.status === TASK_STATUS_enum.TODO && t.agent
      );
      
      if (todoTasks.length > 0) {
        console.log('[DEBUG] Found', todoTasks.length, 'orphaned TODO tasks, reinitializing graph');
        // Reinitialize the graph to include all tasks
        _initializeGraph();
        
        // Try again to get entry nodes
        const newEntryNodes = executionDepGraph.entryNodes();
        console.log('[DEBUG] After reinitialization - Graph size:', executionDepGraph.size(), 'Entry nodes:', newEntryNodes);
        
        // If still no entry nodes, queue tasks without dependencies directly
        if (newEntryNodes.length === 0) {
          console.log('[DEBUG] Still no entry nodes, queueing tasks without dependencies');
          todoTasks.forEach(task => {
            if (!task.dependencies || task.dependencies.length === 0) {
              const isTaskAgentBusy = _isTaskAgentBusy(task, teamStoreState.tasks);
              if (!isTaskAgentBusy) {
                console.log('[DEBUG] Directly queueing task:', task.id);
                _queueTask({ teamStoreState, task });
              }
            }
          });
        }
      }
    }
  };

  const _clearGraph = (graph: DependencyGraph): void => {
    while (graph.size() > 0) {
      for (const node of graph.entryNodes()) {
        graph.removeNode(node);
      }
    }
  };

  const _handleWorkflowStatusUpdate = ({
    currentLog,
    previousLogs,
    state,
  }: {
    currentLog: WorkflowStatusLog;
    previousLogs: WorkflowLog[];
    state: CombinedStoresState;
  }): void => {
    const status = currentLog.workflowStatus;
    const previousLog =
      Array.isArray(previousLogs) && previousLogs.length > 0
        ? previousLogs[previousLogs.length - 1]
        : null;
    const previousStatus =
      previousLog && 'workflowStatus' in previousLog
        ? previousLog.workflowStatus
        : WORKFLOW_STATUS_enum.INITIAL;

    switch (status) {
      case WORKFLOW_STATUS_enum.PAUSED:
        taskQueue.pause();
        break;

      case WORKFLOW_STATUS_enum.RESUMED:
        taskQueue.start();
        break;

      case WORKFLOW_STATUS_enum.RUNNING:
        if (previousStatus === WORKFLOW_STATUS_enum.INITIAL) {
          try {
            _initializeGraph();
            _queueTasksReadyToExecute(state);
          } catch (error) {
            console.error('Error initializing graph', error);
          }
        }
        break;

      case WORKFLOW_STATUS_enum.STOPPED:
        taskQueue.clear();
        _clearGraph(executionDepGraph);
        _clearGraph(contextDepGraph);
        break;
    }
  };

  /**
   * Transform orchestrator recommendations to decisions format
   */
  const _transformRecommendationsToDecisions = (recommendations: any): any => {
    if (!recommendations) {
      return null;
    }

    const decisions: any = {};

    // Map newTasks to addTasks
    if (recommendations.recommendations?.newTasks) {
      decisions.addTasks = recommendations.recommendations.newTasks;
    }

    // Map taskModifications to modifyTasks
    if (recommendations.recommendations?.taskModifications) {
      decisions.modifyTasks = recommendations.recommendations.taskModifications;
    }

    // Map other potential fields
    if (recommendations.recommendations?.removeTasks) {
      decisions.removeTasks = recommendations.recommendations.removeTasks;
    }

    return decisions;
  };

  /**
   * Handle orchestration decisions after task completion
   */
  const _handleOrchestrationTaskCompletion = async (
    completedTask: Task,
    state: CombinedStoresState
  ): Promise<void> => {
    try {
      // Import orchestrator dynamically to avoid circular dependencies
      const { IntelligentOrchestrator } = await import('../orchestration');

      // Create temporary team object for orchestrator
      const tempTeam = {
        enableOrchestration: state.enableOrchestration,
        continuousOrchestration: state.continuousOrchestration,
        backlogTasks: state.backlogTasks || [],
        allowTaskGeneration: state.allowTaskGeneration,
        orchestrationStrategy: state.orchestrationStrategy,
        mode: state.mode || 'adaptive',
        maxActiveTasks: state.maxActiveTasks || 5,
        taskPrioritization: state.taskPrioritization || 'dynamic',
        workloadDistribution: state.workloadDistribution || 'balanced',
        llmConfig: state.llmConfig,
        llmInstance: state.llmInstance,
        getTasks: () => state.tasks,
        agents: state.agents,
        // Add store property for orchestrator compatibility
        store: {
          getState: () => state,
          subscribe: state.subscribe || (() => () => {}),
        },
      } as any;

      const orchestrator = new IntelligentOrchestrator(tempTeam);

      // Let orchestrator analyze task completion and make decisions
      const recommendations =
        await orchestrator.orchestrateTaskCompletion(
          completedTask,
          state.tasks
        );

      // Transform recommendations to decisions format
      const orchestrationDecisions = _transformRecommendationsToDecisions(recommendations);

      // Apply orchestration decisions
      await _applyOrchestrationDecisions(orchestrationDecisions, state);
    } catch (error) {
      console.warn('Orchestration task completion analysis failed:', error);
      // Continue with normal flow if orchestration fails
    }
  };

  /**
   * Apply orchestration decisions to the workflow
   */
  const _applyOrchestrationDecisions = async (
    decisions: any,
    state: CombinedStoresState
  ): Promise<void> => {
    // Validate decisions object
    if (!decisions || typeof decisions !== 'object') {
      console.warn(
        'Invalid orchestration decisions object received:',
        decisions
      );
      return;
    }

    // Handle task modifications - check both possible structures
    const taskModifications =
      decisions.modifyTasks ||
      decisions.recommendations?.taskModifications ||
      [];

    if (Array.isArray(taskModifications) && taskModifications.length > 0) {
      for (const modification of taskModifications) {
        if (!modification || !modification.taskId) {
          console.warn('Invalid task modification object:', modification);
          continue;
        }

        const targetTask = state.tasks.find(
          (t) => t && t.id === modification.taskId
        );
        if (targetTask && modification.changes) {
          // Apply task modifications
          Object.assign(targetTask, modification.changes);
        }
      }
    }

    let graphNeedsUpdate = false;

    if (decisions.addTasks && decisions.addTasks.length > 0) {
      // Add new tasks to the team
      state.addTasks(decisions.addTasks);
      graphNeedsUpdate = true;
    }

    if (decisions.removeTasks && decisions.removeTasks.length > 0) {
      // Remove tasks from workflow
      for (const taskId of decisions.removeTasks) {
        const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          state.tasks.splice(taskIndex, 1);
        }
      }
      graphNeedsUpdate = true;
    }

    // Check if task modifications might have made tasks ready to execute
    let shouldCheckQueue = graphNeedsUpdate;
    
    // If tasks were modified, we should also check the queue
    if (taskModifications && taskModifications.length > 0) {
      shouldCheckQueue = true;
    }

    // If graph was updated, reinitialize
    if (graphNeedsUpdate) {
      console.log('[DEBUG] Graph needs update - reinitializing');
      _initializeGraph();
    }
    
    // If we need to check the queue (new tasks, removed tasks, or modified tasks)
    if (shouldCheckQueue) {
      console.log('[DEBUG] Should check queue - calling _queueTasksReadyToExecute');
      _queueTasksReadyToExecute(state);
    }
  };

  const _handleTaskStatusUpdate = async ({
    currentLog,
    state,
  }: {
    currentLog: TaskStatusLog;
    state: CombinedStoresState;
  }): Promise<void> => {
    const task = currentLog.task;
    const taskStatus = currentLog.taskStatus;

    switch (taskStatus) {
      case TASK_STATUS_enum.DONE:
        executionDepGraph.removeNode(task.id);

        // 🤖 ORCHESTRATION HOOK: Task completion analysis
        if (state.enableOrchestration && state.continuousOrchestration) {
          await _handleOrchestrationTaskCompletion(task, state);
        }

        // Always queue tasks ready to execute after task completion
        // This ensures existing TODO tasks are started even if orchestration didn't add new ones
        _queueTasksReadyToExecute(state);
        
        // Check if all tasks are completed after orchestration
        // This ensures workflow is only marked as finished after orchestrator has run
        if (state.enableOrchestration && state.continuousOrchestration) {
          const allTasksDone = state.tasks.every(
            (t) => t.status === TASK_STATUS_enum.DONE
          );
          
          if (allTasksDone && state.teamWorkflowStatus === WORKFLOW_STATUS_enum.RUNNING) {
            // All tasks are done and workflow is still running, finish it
            state.finishWorkflowAction();
          }
        }
        break;

      case TASK_STATUS_enum.REVISE: {
        const dependencies = contextDepGraph.dependenciesOf(task.id);
        for (const dependency of dependencies) {
          const dependencyTask = state.tasks.find((t) => t.id === dependency);
          if (dependencyTask) {
            state.updateTaskStatus(dependencyTask.id, TASK_STATUS_enum.TODO);
          }
        }
        _initializeGraph();

        state.tasks.forEach((t) => {
          if (!dependencies.includes(t.id)) {
            executionDepGraph.removeNode(t.id);
          }
        });
        _queueTask({ teamStoreState: state, task, highPriority: true });
        break;
      }

      case TASK_STATUS_enum.RESUMED:
        _queueTask({ teamStoreState: state, task, resume: true });
        break;
    }
  };

  // Subscribe to workflow status updates
  teamStore.subscribe(
    (state) => state.workflowLogs,
    // @ts-expect-error: Zustand subscribe overload is not properly typed
    (newLogs: WorkflowLog[], previousLogs: WorkflowLog[]) => {
      if (newLogs.length > previousLogs.length) {
        const currentLog = newLogs[newLogs.length - 1];
        const state = teamStore.getState();

        if (currentLog.logType === 'WorkflowStatusUpdate') {
          _handleWorkflowStatusUpdate({
            currentLog: currentLog as WorkflowStatusLog,
            previousLogs,
            state,
          });
        } else if (currentLog.logType === 'TaskStatusUpdate') {
          // Handle async orchestration
          _handleTaskStatusUpdate({
            currentLog: currentLog as TaskStatusLog,
            state,
          }).catch((error) => {
            console.error('Task status update handling error:', error);
          });
        }
      }
    }
  );
};
