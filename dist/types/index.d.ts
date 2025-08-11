/**
 * API module for the Library.
 *
 * This module defines the primary classes used throughout the library, encapsulating
 * the core functionalities of agents, tasks, and team coordination. It serves as the
 * public interface for the library, allowing external applications to interact with
 * and utilize the main features provided.
 *
 * Classes:
 * - Agent: Represents an entity capable of performing tasks using specific AI models.
 *   Agents have properties such as name, role, and the tools they use, and are capable
 *   of executing tasks based on these properties.
 * - Task: Defines a specific activity or job that an agent can perform. Tasks are
 *   characterized by descriptions, expected outcomes, and their deliverability status.
 * - Team: Manages a group of agents and orchestrates the execution of tasks. It is
 *   responsible for coordinating the agents to achieve collective goals effectively.
 */
import { BaseAgent, Env } from './agents';
import { AGENT_STATUS_enum, TASK_STATUS_enum } from './utils/enums';
import { TeamStore } from './stores/teamStore.types';
import { ZodSchema } from 'zod';
import { WorkflowResult, WorkflowStats } from './types/logs';
import { BaseTool } from './tools/baseTool';
import { LangChainChatModel } from './utils/agents';
import { LLMConfig } from './agents/baseAgent';
import { DefaultPrompts } from './utils/prompts';
import { TaskFeedback, TaskResult, TaskStats } from './stores/taskStore.types';
import { AgentLoopResult } from './utils/llm.types';
/**
 * Interface for Agent configuration
 */
export interface IAgentParams {
    type?: string;
    name: string;
    role: string;
    goal: string;
    background: string;
    tools?: BaseTool[];
    llmConfig?: LLMConfig;
    maxIterations?: number;
    forceFinalAnswer?: boolean;
    promptTemplates?: DefaultPrompts;
    llmInstance?: LangChainChatModel;
}
/**
 * Interface for Task configuration
 */
export interface ITaskParams {
    title?: string;
    id?: string;
    description: string;
    expectedOutput: string;
    agent: Agent;
    dependencies?: string[];
    isDeliverable?: boolean;
    externalValidationRequired?: boolean;
    outputSchema?: ZodSchema | null;
    allowParallelExecution?: boolean;
    referenceId?: string;
    adaptable?: boolean;
    orchestrationRules?: string;
    dynamicPriority?: boolean;
    splitStrategy?: 'none' | 'manual' | 'auto';
    mergeCompatible?: string[];
    resourceRequirements?: {
        estimatedTime?: string;
        skillsRequired?: string[];
        dependencies?: string[];
    };
    priority?: 'high' | 'medium' | 'low';
    qualityGates?: string[];
}
/**
 * Interface for Team configuration
 */
export interface ITeamParams {
    name: string;
    agents: Agent[];
    tasks: Task[];
    logLevel?: string;
    inputs?: Record<string, unknown>;
    env?: Env;
    insights?: string;
    memory?: boolean;
    enableOrchestration?: boolean;
    continuousOrchestration?: boolean;
    backlogTasks?: Task[];
    allowTaskGeneration?: boolean;
    orchestrationStrategy?: string;
    mode?: 'conservative' | 'adaptive' | 'innovative' | 'learning';
    maxActiveTasks?: number;
    taskPrioritization?: 'static' | 'dynamic' | 'ai-driven';
    workloadDistribution?: 'balanced' | 'skills-based' | 'availability';
    llmConfig?: LLMConfig;
    llmInstance?: LangChainChatModel;
}
export declare class Agent {
    agentInstance: BaseAgent;
    type: string;
    constructor({ type, ...config }: IAgentParams);
    createAgent(type: string | undefined, config: IAgentParams): BaseAgent;
    workOnTask(task: Task, inputs: Record<string, unknown>, context: string): Promise<AgentLoopResult>;
    workOnTaskResume(task: Task): Promise<void>;
    workOnFeedback(task: Task, feedbackList: Array<{
        content: string;
    }>, context: string): Promise<AgentLoopResult>;
    setStatus(status: AGENT_STATUS_enum): void;
    initialize(store: TeamStore, env: Env): void;
    updateEnv(env: Env): void;
    reset(): void;
    get id(): string;
    get name(): string;
    get role(): string;
    get goal(): string;
    get background(): string;
    get tools(): BaseTool[];
    get status(): string;
    set status(status: AGENT_STATUS_enum);
    get llmConfig(): LLMConfig;
    get llmSystemMessage(): string | null;
    get forceFinalAnswer(): boolean;
    get promptTemplates(): DefaultPrompts;
}
export declare class Task {
    id: string;
    title: string;
    description: string;
    isDeliverable: boolean;
    agent: Agent;
    status: TASK_STATUS_enum;
    result: TaskResult | null;
    stats: TaskStats | null;
    duration: number | null;
    dependencies: string[];
    interpolatedTaskDescription: string | null;
    feedbackHistory: TaskFeedback[];
    externalValidationRequired: boolean;
    outputSchema: ZodSchema | null;
    expectedOutput: string;
    allowParallelExecution: boolean;
    referenceId?: string;
    inputs?: Record<string, unknown>;
    store?: TeamStore;
    adaptable: boolean;
    orchestrationRules?: string;
    dynamicPriority: boolean;
    splitStrategy: 'none' | 'manual' | 'auto';
    mergeCompatible: string[];
    resourceRequirements?: {
        estimatedTime?: string;
        skillsRequired?: string[];
        dependencies?: string[];
    };
    priority: 'high' | 'medium' | 'low';
    qualityGates: string[];
    adaptationHistory?: Array<{
        timestamp: number;
        changes: {
            description?: string;
            priority?: string;
            estimatedTime?: string;
            agent?: string;
            dependencies?: string[];
        };
        reasoning: string;
    }>;
    constructor({ title, id, description, expectedOutput, agent, dependencies, isDeliverable, externalValidationRequired, outputSchema, allowParallelExecution, referenceId, adaptable, orchestrationRules, dynamicPriority, splitStrategy, mergeCompatible, resourceRequirements, priority, qualityGates, }: ITaskParams);
}
/**
 * Represents a team of AI agents working on a set of tasks.
 * This class provides methods to control the workflow, interact with tasks,
 * and observe the state of the team's operations.
 */
export declare class Team {
    store: TeamStore;
    enableOrchestration: boolean;
    continuousOrchestration: boolean;
    backlogTasks: Task[];
    allowTaskGeneration: boolean;
    orchestrationStrategy?: string;
    mode: 'conservative' | 'adaptive' | 'innovative' | 'learning';
    maxActiveTasks: number;
    taskPrioritization: 'static' | 'dynamic' | 'ai-driven';
    workloadDistribution: 'balanced' | 'skills-based' | 'availability';
    llmConfig?: LLMConfig;
    llmInstance?: LangChainChatModel;
    /**
     * Creates a new Team instance.
     *
     * @param config - The configuration object for the team.
     */
    constructor({ name, agents, tasks, logLevel, inputs, env, insights, memory, enableOrchestration, continuousOrchestration, backlogTasks, allowTaskGeneration, orchestrationStrategy, mode, maxActiveTasks, taskPrioritization, workloadDistribution, llmConfig, llmInstance, }: ITeamParams);
    /**
     * Pauses the team's workflow.
     * This method temporarily halts the workflow, allowing for manual intervention or adjustments.
     */
    pause(): Promise<void>;
    /**
     * Resumes the team's workflow.
     * This method continues the workflow after it has been paused.
     */
    resume(): Promise<void>;
    /**
     * Stops the team's workflow.
     * This method stops the workflow, preventing unknown further task execution.
     */
    stop(): Promise<void>;
    /**
     * Starts the team's workflow.
     * This method initiates the process of agents working on tasks.
     *
     * @param inputs - Optional inputs to override or supplement the initial inputs.
     * @param options - Optional configuration for automatic orchestration.
     * @param options.projectGoal - The project goal for orchestration. If not provided, uses orchestrationStrategy as fallback.
     * @param options.preserveExistingTasks - Whether to keep existing tasks when orchestrating (default: true).
     * @returns A promise that resolves when the workflow completes or rejects on error.
     */
    start(inputs?: Record<string, unknown>, options?: {
        projectGoal?: string;
        preserveExistingTasks?: boolean;
    }): Promise<WorkflowResult>;
    /**
     * Provides direct access to the underlying store.
     * This method is intended for advanced users who need more control over the state.
     * More DX friendly for NodeJS Developers
     *
     * @returns The store object.
     */
    getStore(): TeamStore;
    /**
     * Provides direct access to the underlying store.
     * This method is intended for advanced users who need more control over the state.
     * More DX friendly for React Developers
     *
     * @returns The store object.
     */
    useStore(): TeamStore;
    /**
     * Enhanced subscribeToChanges to listen for specific properties
     *
     * @param listener - Function to call when properties change
     * @param properties - Array of property names to monitor
     * @returns Unsubscribe function
     */
    subscribeToChanges(listener: (changes: Record<string, unknown>) => void, properties?: string[]): () => void;
    /**
     * Provides feedback on a specific task.
     * This method is crucial for the Human-in-the-Loop (HITL) functionality,
     * allowing for human intervention and guidance in the AI workflow.
     *
     * @param taskId - The ID of the task to provide feedback on.
     * @param feedbackContent - The feedback to be incorporated into the task.
     */
    provideFeedback(taskId: string, feedbackContent: string): void;
    /**
     * Marks a task as validated.
     * This method is used in the HITL process to approve a task that required validation.
     *
     * @param taskId - The ID of the task to be marked as validated.
     */
    validateTask(taskId: string): void;
    /**
     * Subscribes to changes in the workflow status.
     * This method allows real-time monitoring of the overall workflow progress.
     *
     * @param callback - A function to be called when the workflow status changes.
     * @returns A function to unsubscribe from the status changes.
     */
    onWorkflowStatusChange(callback: (status: string) => void): () => void;
    /**
     * Retrieves tasks filtered by a specific status.
     *
     * @param status - The status to filter tasks by. Should be one of TASK_STATUS_enum values.
     * @returns An array of tasks with the specified status.
     */
    getTasksByStatus(status: string): Task[];
    /**
     * Retrieves the current status of the workflow.
     * This method provides a snapshot of the workflow's current state.
     *
     * @returns The current workflow status.
     */
    getWorkflowStatus(): string;
    /**
     * Retrieves the final result of the workflow.
     * This method should be called only after the workflow has finished.
     *
     * @returns The workflow result if finished, null otherwise.
     */
    getWorkflowResult(): unknown;
    /**
     * Retrieves all tasks in the team's workflow.
     * This method provides a comprehensive view of all tasks and their current states.
     *
     * @returns An array of all tasks.
     */
    getTasks(): Task[];
    /**
     * Retrieves the workflow completion statistics.
     * This method finds the completion log in the workflow logs and returns the associated statistics.
     *
     * @returns The workflow completion statistics, or null if no completion log is found.
     */
    getWorkflowStats(): WorkflowStats | null;
    /**
     * Activate intelligent orchestration for this team.
     * This creates an orchestrator instance and starts autonomous task management.
     *
     * @param projectGoal - The overall goal for the orchestrator to optimize towards
     * @param preserveExistingTasks - Whether to keep existing tasks and build upon them (default: true)
     * @returns Promise resolving to the orchestrated tasks
     */
    activateOrchestration(projectGoal: string, preserveExistingTasks: boolean | undefined, inputs: Record<string, unknown>): Promise<Task[]>;
    /**
     * Add tasks to the backlog task repository.
     * These tasks can be selected and adapted by the orchestrator.
     *
     * @param tasks - Array of backlog tasks to add to the repository
     */
    addBacklogTasks(tasks: Task[]): void;
    /**
     * Remove a task from the backlog task repository.
     *
     * @param taskId - ID of the task to remove
     */
    removeBacklogTask(taskId: string): void;
    /**
     * Update the orchestration strategy.
     *
     * @param strategy - New orchestration strategy instructions
     */
    updateOrchestrationStrategy(strategy: string): void;
    /**
     * Update the orchestration mode.
     *
     * @param mode - New orchestration mode
     */
    updateOrchestrationMode(mode: 'conservative' | 'adaptive' | 'innovative' | 'learning'): void;
    /**
     * Enable or disable continuous orchestration.
     * Controls whether orchestration runs only at the beginning or also after each task completion.
     *
     * @param enabled - True to enable continuous orchestration, false for initial-only
     */
    setContinuousOrchestration(enabled: boolean): void;
    /**
     * Get orchestration performance metrics.
     * Returns detailed metrics about orchestration operations, task statistics, and system health.
     *
     * @returns Orchestration metrics summary or null if orchestration is not enabled
     */
    getOrchestrationMetrics(): Promise<{
        performance: Record<string, any>;
        taskStatistics: Record<string, any>;
        systemHealth: Record<string, any>;
    } | null>;
    /**
     * Generate task dependency graph visualization data.
     * Returns nodes, edges, and metrics for visualizing task dependencies.
     *
     * @param tasks - Optional array of tasks to visualize (defaults to current team tasks)
     * @returns Dependency graph data or null if orchestration is not enabled
     */
    generateDependencyGraph(tasks?: Task[]): Promise<{
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
    } | null>;
}
export * as orchestration from './orchestration';
