import { UseBoundStore, StoreApi } from 'zustand';
import { StructuredTool } from '@langchain/core/tools';
import { ZodSchema, ZodError } from 'zod';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

type ToolResult = string | Record<string, unknown>;
type BaseTool = StructuredTool;

/**
 * Enumeration Definitions.
 *
 * This module defines various enumerations used throughout the KaibanJS library for managing
 * agent statuses, task statuses, workflow states, and other core system states.
 * These enums provide type-safe constants that facilitate clear and consistent state management.
 *
 * @module enums
 */
/**
 * Agent status states throughout their lifecycle
 * @enum {string}
 */
declare enum AGENT_STATUS_enum {
    /** Initial state when agent is set up */
    INITIAL = "INITIAL",
    /** Agent is strategizing (LangChain Callback: llmStart()) */
    THINKING = "THINKING",
    /** Agent completed thinking (LangChain Callback: llmEnd()) */
    THINKING_END = "THINKING_END",
    /** Error during thinking (LangChain Callback: handleLLMError()) */
    THINKING_ERROR = "THINKING_ERROR",
    /** Thought formed (LangChain Callback: llmEnd() with THOUGHT present) */
    THOUGHT = "THOUGHT",
    /** Executing planned action (LangChain Callback: handleAgentAction()) */
    EXECUTING_ACTION = "EXECUTING_ACTION",
    /** Using a tool (LangChain Callback: handleToolStart()) */
    USING_TOOL = "USING_TOOL",
    /** Completed tool usage */
    USING_TOOL_END = "USING_TOOL_END",
    /** Error during tool usage (LangChain Callback: handleToolError()) */
    USING_TOOL_ERROR = "USING_TOOL_ERROR",
    /** Requested tool doesn't exist */
    TOOL_DOES_NOT_EXIST = "TOOL_DOES_NOT_EXIST",
    /** Observing results (LangChain Callback: handleToolEnd()) */
    OBSERVATION = "OBSERVATION",
    /** Task conclusion (LangChain Callback: handleAgentEnd()) */
    FINAL_ANSWER = "FINAL_ANSWER",
    /** All operations completed including outputs */
    TASK_COMPLETED = "TASK_COMPLETED",
    /** Maximum iterations reached */
    MAX_ITERATIONS_ERROR = "MAX_ITERATIONS_ERROR",
    /** Error parsing LLM output */
    ISSUES_PARSING_LLM_OUTPUT = "ISSUES_PARSING_LLM_OUTPUT",
    /** Error parsing schema output */
    OUTPUT_SCHEMA_VALIDATION_ERROR = "OUTPUT_SCHEMA_VALIDATION_ERROR",
    /** Error parsing schema output */
    ISSUES_PARSING_SCHEMA_OUTPUT = "ISSUES_PARSING_SCHEMA_OUTPUT",
    /** Agent is asking itself a question */
    SELF_QUESTION = "SELF_QUESTION",
    /** Starting a new iteration */
    ITERATION_START = "ITERATION_START",
    /** Completed an iteration */
    ITERATION_END = "ITERATION_END",
    /** Error in agentic loop */
    AGENTIC_LOOP_ERROR = "AGENTIC_LOOP_ERROR",
    /** Unexpected LLM output */
    WEIRD_LLM_OUTPUT = "WEIRD_LLM_OUTPUT",
    /** Agent decided to block the task */
    DECIDED_TO_BLOCK_TASK = "DECIDED_TO_BLOCK_TASK",
    /** Task was aborted */
    TASK_ABORTED = "TASK_ABORTED",
    /** Agent is paused */
    PAUSED = "PAUSED",
    /** Agent is resumed */
    RESUMED = "RESUMED"
}
/**
 * Task status states throughout their lifecycle
 * @enum {string}
 */
declare enum TASK_STATUS_enum {
    /** Task is queued for initiation */
    TODO = "TODO",
    /** Task is actively being worked on */
    DOING = "DOING",
    /** Progress halted due to dependencies or obstacles */
    BLOCKED = "BLOCKED",
    /** Task is temporarily paused */
    PAUSED = "PAUSED",
    /** Task is resumed after being paused */
    RESUMED = "RESUMED",
    /** Task requires review or adjustments */
    REVISE = "REVISE",
    /** Task is completed */
    DONE = "DONE",
    /** Task completed but needs validation */
    AWAITING_VALIDATION = "AWAITING_VALIDATION",
    /** Task has been validated */
    VALIDATED = "VALIDATED",
    /** Task has been aborted */
    ABORTED = "ABORTED"
}
/**
 * Workflow status states throughout their lifecycle
 * @enum {string}
 */
declare enum WORKFLOW_STATUS_enum {
    /** Initial workflow state */
    INITIAL = "INITIAL",
    /** Workflow is actively processing */
    RUNNING = "RUNNING",
    /** Workflow is temporarily paused */
    PAUSED = "PAUSED",
    /** Workflow is resumed after being paused */
    RESUMED = "RESUMED",
    /** Workflow is in process of stopping */
    STOPPING = "STOPPING",
    /** Workflow has been stopped */
    STOPPED = "STOPPED",
    /** Workflow encountered an error */
    ERRORED = "ERRORED",
    /** Workflow completed successfully */
    FINISHED = "FINISHED",
    /** Workflow is blocked by dependencies */
    BLOCKED = "BLOCKED"
}
/**
 * Feedback status states
 * @enum {string}
 */
declare enum FEEDBACK_STATUS_enum {
    /** Feedback received but not processed */
    PENDING = "PENDING",
    /** Feedback has been addressed */
    PROCESSED = "PROCESSED"
}
/**
 * Workflow action types
 * @enum {string}
 */
declare enum WORKFLOW_ACTION_enum {
    /** Stop the workflow */
    STOP = "STOP",
    /** Pause the workflow */
    PAUSE = "PAUSE",
    /** Resume the workflow */
    RESUME = "RESUME",
    /** Start the workflow */
    INITIATE = "INITIATE"
}

/**
 * Parsed output from the LLM
 */
interface ParsedLLMOutput {
    action?: string;
    actionInput?: Record<string, unknown> | string | null;
    finalAnswer?: Record<string, unknown> | string;
    isValidOutput?: boolean;
    outputSchema?: ZodSchema | null;
    outputSchemaErrors?: ZodError;
    thought?: string;
    observation?: string;
}
type ThinkingResult = {
    parsedLLMOutput: ParsedLLMOutput;
    llmOutput: string;
    llmUsageStats: {
        inputTokens: number;
        outputTokens: number;
    };
};
/**
 * Metadata about the agent's execution
 */
type AgentLoopMetadata = {
    /** Number of iterations performed */
    iterations: number;
    /** Maximum number of iterations allowed */
    maxAgentIterations: number;
};
/**
 * Result of a successful agent execution
 */
type AgentLoopSuccess = {
    result: ParsedLLMOutput | null;
    error?: never;
    metadata: AgentLoopMetadata;
};
/**
 * Result of a failed agent execution
 */
type AgentLoopError = {
    result?: never;
    error: string;
    metadata: AgentLoopMetadata;
};
/**
 * Combined type representing all possible outcomes of an agent's execution loop
 */
type AgentLoopResult = AgentLoopSuccess | AgentLoopError;
type ThinkingPromise = {
    promise: Promise<ThinkingResult>;
    reject: (error: Error) => void;
};
type ToolCallingPromise = {
    promise: Promise<ToolResult>;
    reject: (error: Error) => void;
};

/**
 * Prompt Templates for Agents.
 *
 * This module provides templates for constructing prompts that are used to interact with language models
 * within the KaibanJS library. These templates ensure that interactions are consistent and properly
 * formatted, facilitating effective communication with LLMs.
 *
 * @module prompts
 */

interface BasePromptParams {
    agent: BaseAgent;
    task: Task;
}
interface SystemMessageParams extends BasePromptParams {
    insights?: string;
}
interface InitialMessageParams extends BasePromptParams {
    context?: string;
}
interface InvalidJsonFeedbackParams extends BasePromptParams {
    llmOutput: string;
}
interface InvalidOutputSchemaParams extends BasePromptParams {
    llmOutput: string;
    outputSchema: ZodSchema | null;
    outputSchemaError?: ZodError;
}
interface ThoughtWithSelfQuestionParams extends BasePromptParams {
    question: string;
    thought: string;
    parsedLLMOutput: ParsedLLMOutput;
}
interface SelfQuestionFeedbackParams extends BasePromptParams {
    question: string;
    parsedLLMOutput: ParsedLLMOutput;
}
interface ThoughtFeedbackParams extends BasePromptParams {
    thought: string;
    parsedLLMOutput: ParsedLLMOutput;
}
interface ToolResultParams extends BasePromptParams {
    toolResult: ToolResult;
    parsedLLMOutput: ParsedLLMOutput;
}
interface ToolErrorParams extends BasePromptParams {
    toolName: string;
    error: Error;
    parsedLLMOutput: ParsedLLMOutput;
}
interface ForceFinalAnswerParams extends BasePromptParams {
    iterations: number;
    maxAgentIterations: number;
}
interface WorkOnFeedbackParams extends BasePromptParams {
    feedback: string;
}
interface ObservationParams extends BasePromptParams {
    parsedLLMOutput: ParsedLLMOutput;
}
interface WeirdOutputParams extends BasePromptParams {
    parsedLLMOutput: ParsedLLMOutput;
}
interface DefaultPrompts {
    SYSTEM_MESSAGE: (params: SystemMessageParams) => string;
    INITIAL_MESSAGE: (params: InitialMessageParams) => string;
    INVALID_JSON_FEEDBACK: (params: InvalidJsonFeedbackParams) => string;
    INVALID_OUTPUT_SCHEMA_FEEDBACK: (params: InvalidOutputSchemaParams) => string;
    THOUGHT_WITH_SELF_QUESTION_FEEDBACK: (params: ThoughtWithSelfQuestionParams) => string;
    THOUGHT_FEEDBACK: (params: ThoughtFeedbackParams) => string;
    SELF_QUESTION_FEEDBACK: (params: SelfQuestionFeedbackParams) => string;
    TOOL_RESULT_FEEDBACK: (params: ToolResultParams) => string;
    TOOL_ERROR_FEEDBACK: (params: ToolErrorParams) => string;
    TOOL_NOT_EXIST_FEEDBACK: (params: ToolErrorParams) => string;
    OBSERVATION_FEEDBACK: (params: ObservationParams) => string;
    WEIRD_OUTPUT_FEEDBACK: (params: WeirdOutputParams) => string;
    FORCE_FINAL_ANSWER_FEEDBACK: (params: ForceFinalAnswerParams) => string;
    WORK_ON_FEEDBACK_FEEDBACK: (params: WorkOnFeedbackParams) => string;
}

/**
 * Agent Utility Functions.
 *
 * This module provides utility functions specifically designed to support agent operations.
 * Functions include retrieving API keys based on agent configurations and handling agent attributes.
 *
 * @module agents
 */

type LangChainChatModel = BaseChatModel;

/**
 * Base Agent Definition.
 *
 * This module defines the BaseAgent class, which serves as the foundational component for all agents
 * within the library. It includes fundamental methods for setting environment variables, managing agent
 * status, and abstract methods for task execution which must be implemented by subclasses to handle
 * specific tasks.
 *
 * @module baseAgent
 */

/** LLM configuration options */
interface LLMConfig {
    /** LLM service provider */
    provider: string;
    /** Model name/version */
    model: string;
    /** Maximum number of retries for failed requests */
    maxRetries: number;
    /** Base URL for API requests */
    apiBaseUrl?: string;
    /** API configuration object */
    configuration?: {
        /** Base path for API requests */
        baseURL: string;
    };
    /** Anthropic API URL */
    anthropicApiUrl?: string;
    /** Google base URL */
    baseUrl?: string;
    /** Mistral endpoint */
    endpoint?: string;
    /** API key */
    apiKey?: string;
    /** temperature */
    temperature?: number;
    /** top_p */
    topP?: number;
    /** frequency_penalty */
    frequencyPenalty?: number;
    /** presence_penalty */
    presencePenalty?: number;
    /** n */
    n?: number;
    /** stream */
    stream?: boolean;
    /** Maximum tokens to generate */
    maxTokens?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
}
/** Environment variables */
interface Env {
    [key: string]: string;
}
/** Base agent constructor parameters */
interface BaseAgentParams {
    /** Agent's unique identifier */
    id?: string;
    /** Agent's name */
    name: string;
    /** Agent's role description */
    role: string;
    /** Agent's goal */
    goal: string;
    /** Agent's background information */
    background: string;
    /** Available tools for the agent */
    tools?: BaseTool[];
    /** LLM configuration */
    llmConfig?: Partial<LLMConfig>;
    /** Maximum number of iterations */
    maxIterations?: number;
    /** Whether to force a final answer */
    forceFinalAnswer?: boolean;
    /** Custom prompt templates */
    promptTemplates?: DefaultPrompts;
    /** Environment variables */
    env?: Env;
    /** Kanban tools to enable */
    kanbanTools?: string[];
    /** LLM instance */
    llmInstance?: LangChainChatModel;
}
/** Base agent class */
declare abstract class BaseAgent {
    /** Unique identifier */
    readonly id: string;
    /** Agent's name */
    readonly name: string;
    /** Agent's role description */
    readonly role: string;
    /** Agent's goal */
    readonly goal: string;
    /** Agent's background information */
    readonly background: string;
    /** Maximum number of iterations */
    readonly maxIterations: number;
    /** Store instance */
    protected store: TeamStore | null;
    /** Environment variables */
    protected env: Env;
    /** System message for LLM */
    llmSystemMessage: string | null;
    /** Whether to force a final answer */
    forceFinalAnswer: boolean;
    /** Prompt templates */
    promptTemplates: DefaultPrompts;
    /** LLM configuration */
    llmConfig: LLMConfig;
    /** Current agent status */
    status: AGENT_STATUS_enum;
    /** Available tools */
    tools: BaseTool[];
    /**
     * Creates a new BaseAgent instance
     * @param params - Agent initialization parameters
     */
    constructor({ id, name, role, goal, background, tools, llmConfig, maxIterations, forceFinalAnswer, promptTemplates, env, }: BaseAgentParams);
    initialize(store: TeamStore, env: Env): void;
    updateEnv(env: Env): void;
    /**
     * Normalizes LLM configuration based on provider
     * @param llmConfig - Raw LLM configuration
     * @returns Normalized LLM configuration
     */
    protected normalizeLlmConfig(llmConfig: Partial<LLMConfig>): LLMConfig;
    /**
     * Sets the store instance
     * @param store - Store instance
     */
    setStore(store: TeamStore): void;
    /**
     * Sets the agent's status
     * @param status - New status
     */
    setStatus(status: AGENT_STATUS_enum): void;
    /**
     * Sets environment variables
     * @param env - Environment variables
     */
    setEnv(env: Env): void;
    /**
     * Process a task
     * @param task - The task to process
     * @param inputs - Optional task inputs
     * @param context - Optional task context
     */
    workOnTask(_task: Task, _inputs?: Record<string, unknown>, _context?: string): Promise<AgentLoopResult>;
    /**
     * Process feedback for a task
     * @param task - The task to process feedback for
     * @param feedbackList - The feedback list
     */
    abstract workOnFeedback(_task: Task, _feedbackList: Array<{
        content: string;
    }>, _context: string): Promise<AgentLoopResult>;
    /**
     * Resume work on a task
     * @param task - Task to resume
     */
    abstract workOnTaskResume(task: Task): Promise<void>;
    /**
     * Reset the agent
     */
    reset(): void;
    abstract getCleanedAgent(): Partial<BaseAgent>;
}

/**
 * Custom Error Definitions.
 *
 * This module defines custom error classes for handling specific error scenarios within the KaibanJS library.
 * It includes errors for API invocation failures and more nuanced errors that provide detailed diagnostic information.
 *
 * @module errors
 */
/** Base type for error context data */
type ErrorContext = Record<string, unknown>;
/**
 * Error thrown when LLM API invocation fails
 */
declare class LLMInvocationError extends Error {
    /** Additional context about the error */
    context: ErrorContext;
    /** The original error that caused this error */
    originalError: Error | null;
    /** Suggested steps to resolve the error */
    recommendedAction: string | null;
    constructor(message: string, originalError?: Error | null, recommendedAction?: string | null, context?: ErrorContext);
}
/**
 * Base class for operation abortion errors
 */
declare class AbortError extends Error {
    constructor(message?: string);
}
/**
 * Error thrown when an operation is stopped
 */
declare class StopAbortError extends AbortError {
    constructor(message?: string);
}
declare class TaskBlockError extends Error {
    blockReason: string;
    blockedBy: string;
    isAgentDecision: boolean;
    constructor(message: string, blockReason: string, blockedBy: string, isAgentDecision: boolean);
}

/**
 * LLM Cost Calculation Utilities.
 *
 * This module provides functions for calculating costs associated with using large language models (LLMs)
 * based on token usage and model-specific pricing. It helps in budgeting and monitoring the financial
 * aspects of LLM usage within the KaibanJS library.
 *
 * @module llmCostCalculator
 */

/** LLM usage statistics */
type LLMUsageStats = {
    /** Number of input tokens processed */
    inputTokens: number;
    /** Number of output tokens generated */
    outputTokens: number;
    /** Total number of API calls made */
    callsCount: number;
    /** Number of failed API calls */
    callsErrorCount: number;
    /** Number of parsing errors encountered */
    parsingErrors: number;
};
/** Cost calculation result */
type CostResult = {
    /** Cost for input tokens (-1 if calculation failed) */
    costInputTokens: number;
    /** Cost for output tokens (-1 if calculation failed) */
    costOutputTokens: number;
    /** Total cost (-1 if calculation failed) */
    totalCost: number;
};

type TaskStats = {
    startTime: number;
    endTime: number;
    duration: number;
    llmUsageStats: LLMUsageStats;
    iterationCount: number;
};
type TaskFeedback = {
    content: string;
    status: FEEDBACK_STATUS_enum;
    timestamp: number;
};
type TaskResult = string | Record<string, unknown>;
type NewTaskStatusUpdateLogParams<T extends TaskStatusLog> = {
    agent: BaseAgent | Agent;
    task: Task;
    logDescription: string;
    workflowStatus?: WORKFLOW_STATUS_enum;
    taskStatus?: TASK_STATUS_enum;
    agentStatus?: AGENT_STATUS_enum;
    metadata: T['metadata'];
    logType?: T['logType'];
};
type TaskStoreActions = {
    getTaskStats: (task: Task) => TaskStats;
    handleTaskCompleted: (params: {
        agent: BaseAgent | Agent;
        task: Task;
        result: TaskResult | null;
    }) => void;
    handleTaskError: (params: {
        agent: BaseAgent;
        task: Task;
        error: Error;
    }) => void;
    handleTaskBlocked: (params: {
        task: Task;
        error: TaskBlockError;
    }) => void;
    handleTaskAborted: (params: {
        task: Task;
        error: LLMInvocationError;
    }) => void;
    handleTaskPaused: (params: {
        task: Task;
    }) => void;
    handleTaskResumed: (params: {
        task: Task;
    }) => void;
    handleTaskRevised: (params: {
        task: Task;
        feedback: TaskFeedback;
    }) => void;
    handleTaskValidated: (params: {
        task: Task;
    }) => void;
    prepareTaskStatusUpdateLog: <T extends TaskStatusLog>(params: NewTaskStatusUpdateLogParams<T>) => T;
};
type TaskStoreState = TaskStoreActions;

type Feedback = {
    content: string;
    status: FEEDBACK_STATUS_enum;
    timestamp: number;
};
interface WorkflowStats {
    startTime: number;
    endTime: number;
    duration: number;
    llmUsageStats: {
        inputTokens: number;
        outputTokens: number;
        callsCount: number;
        callsErrorCount: number;
        parsingErrors: number;
    };
    iterationCount: number;
    costDetails: {
        costInputTokens: number;
        costOutputTokens: number;
        totalCost: number;
    };
    teamName: string;
    taskCount: number;
    agentCount: number;
}
interface WorkflowResult {
    status: WORKFLOW_STATUS_enum;
    result: unknown | null;
    stats: WorkflowStats | null;
}
interface BaseWorkflowLog {
    timestamp: number;
    logDescription: string;
    logType: 'WorkflowStatusUpdate' | 'AgentStatusUpdate' | 'TaskStatusUpdate' | 'OrchestrationStatusUpdate';
}

interface BaseAgentLog extends BaseWorkflowLog {
    task: Task;
    agent: BaseAgent;
    taskStatus: TASK_STATUS_enum;
    agentStatus: AGENT_STATUS_enum;
    workflowStatus?: WORKFLOW_STATUS_enum;
}
interface AgentIterationLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        iterations: number;
        maxAgentIterations: number;
    };
}
interface AgentBlockLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        isAgentDecision: boolean;
        blockReason: string;
        blockedBy: string;
    };
}
interface AgentActionLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        output: ThinkingResult;
        tool: BaseTool;
        toolName: string;
        thought: string;
    };
}
interface AgentStartThinkingLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        messages: Array<{
            type: string;
            content: string;
        }>;
    };
}
interface AgentEndThinkingLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        output: ThinkingResult;
    };
}
interface AgentFinalAnswerLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        output: ParsedLLMOutput;
    };
}
interface AgentThoughtLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        output: ParsedLLMOutput;
    };
}
interface AgentObservationLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        output: ParsedLLMOutput;
    };
}
interface AgentWeirdLLMOutputLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        output: ParsedLLMOutput;
    };
}
interface AgentThinkingErrorLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        error: Error;
    };
}
interface AgentToolStartLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        tool: BaseTool;
        input?: string | Record<string, unknown>;
    };
}
interface AgentToolEndLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        output: ToolResult;
    };
}
interface AgentToolErrorLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        error: Error;
        tool: string;
    };
}
interface AgentToolDoesNotExistLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        toolName: string;
    };
}
interface AgentPausedLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        error?: Error;
    };
}
interface AgentResumedLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        error?: Error;
    };
}
interface AgentTaskAbortedLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        error: Error;
    };
}
interface AgentTaskCompletedLog extends BaseAgentLog {
    logType: 'AgentStatusUpdate';
    agentStatus: AGENT_STATUS_enum;
    metadata: {
        message?: string;
        result: TaskResult;
        iterations: number;
        maxAgentIterations: number;
    };
}
type AgentStatusLog = AgentIterationLog | AgentStartThinkingLog | AgentEndThinkingLog | AgentFinalAnswerLog | AgentThoughtLog | AgentObservationLog | AgentWeirdLLMOutputLog | AgentThinkingErrorLog | AgentToolDoesNotExistLog | AgentToolErrorLog | AgentToolStartLog | AgentToolEndLog | AgentBlockLog | AgentActionLog | AgentPausedLog | AgentResumedLog | AgentTaskAbortedLog | AgentTaskCompletedLog;

interface BaseTaskLog extends BaseWorkflowLog {
    task: Task;
    agent: Agent;
    taskStatus?: TASK_STATUS_enum;
    agentStatus?: AGENT_STATUS_enum;
    workflowStatus?: WORKFLOW_STATUS_enum;
}
interface TaskStartedLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
    };
}
interface TaskCompletionLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
        result: TaskResult;
        output?: ThinkingResult;
        llmUsageStats: LLMUsageStats;
        iterationCount: number;
        duration: number;
        costDetails: CostResult;
    };
}
interface TaskAwaitingValidationLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
        result: TaskResult;
        output?: ThinkingResult;
        llmUsageStats: LLMUsageStats;
        iterationCount: number;
        duration: number;
        costDetails: CostResult;
    };
}
interface TaskErrorLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
        error: Error;
        costDetails: CostResult;
        llmUsageStats: LLMUsageStats;
    };
}
interface TaskBlockedLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
        error: Error;
        costDetails: CostResult;
        llmUsageStats: LLMUsageStats;
    };
}
interface TaskAbortedLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
        error: Error;
        costDetails: CostResult;
        llmUsageStats: LLMUsageStats;
    };
}
interface TaskPausedLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
        error?: Error;
        costDetails: CostResult;
        llmUsageStats: LLMUsageStats;
    };
}
interface TaskResumedLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
    };
}
interface TaskFeedbackLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
        feedback: {
            content: string;
            status: FEEDBACK_STATUS_enum;
            timestamp: number;
        };
    };
}
interface TaskValidatedLog extends BaseTaskLog {
    logType: 'TaskStatusUpdate';
    taskStatus: TASK_STATUS_enum;
    metadata: {
        message?: string;
    };
}
type TaskStatusLog = TaskStartedLog | TaskCompletionLog | TaskAwaitingValidationLog | TaskErrorLog | TaskBlockedLog | TaskAbortedLog | TaskPausedLog | TaskResumedLog | TaskFeedbackLog | TaskValidatedLog;

interface WorkflowInitialLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message: string;
        inputs?: Record<string, unknown> | null;
    };
}
interface WorkflowFinishedLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message?: string;
        result: TaskResult | null;
        teamName: string;
        taskCount: number;
        agentCount: number;
        startTime: number;
        endTime: number;
        duration: number;
        llmUsageStats: LLMUsageStats;
        iterationCount: number;
        costDetails: CostResult;
    };
}
interface WorkflowResumedLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message: string;
        resumedAt: string;
        previousStatus: WORKFLOW_STATUS_enum;
    };
}
interface WorkflowStoppingLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message: string;
        previousStatus: WORKFLOW_STATUS_enum;
    };
}
interface WorkflowStoppedLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message: string;
        previousStatus: WORKFLOW_STATUS_enum;
        tasksReset: number;
    };
}
interface WorkflowErrorLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message?: string;
        error: string;
        errorStack?: string;
    } & WorkflowStats;
}
interface WorkflowOperationErrorLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message?: string;
        error: string;
        errorStack?: string;
    };
}
interface WorkflowRunningLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message?: string;
        inputs?: Record<string, unknown>;
        feedback?: Feedback;
    };
}
interface WorkflowBlockedLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message?: string;
        error: string;
    } & WorkflowStats;
}
interface WorkflowPausedLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message?: string;
        error?: Error;
    };
}
interface WorkflowResumeLog extends BaseWorkflowLog {
    logType: 'WorkflowStatusUpdate';
    workflowStatus: WORKFLOW_STATUS_enum;
    metadata: {
        message?: string;
        error?: Error;
    };
}
type WorkflowStatusLog = WorkflowInitialLog | WorkflowFinishedLog | WorkflowErrorLog | WorkflowOperationErrorLog | WorkflowBlockedLog | WorkflowStoppedLog | WorkflowResumedLog | WorkflowRunningLog | WorkflowStoppingLog | WorkflowPausedLog | WorkflowResumeLog;

/**
 * Orchestration Log Types
 *
 * Defines log types for intelligent orchestration events including
 * task selection, adaptation, generation, and workflow optimization.
 */

interface OrchestrationActivatedLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'ACTIVATED';
    metadata: {
        message: string;
        projectGoal: string;
        preserveExistingTasks: boolean;
        existingTasksCount: number;
        availableTasksCount: number;
        mode: 'conservative' | 'adaptive' | 'innovative' | 'learning';
        allowTaskGeneration: boolean;
        orchestrationStrategy?: string;
    };
}
interface OrchestrationDeactivatedLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'DEACTIVATED';
    metadata: {
        message: string;
        reason: string;
    };
}
interface OrchestrationAnalysisLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'ANALYSIS_STARTED';
    metadata: {
        message: string;
        contextAnalysis: {
            activeTasks: number;
            availableAgents: number;
            projectProgress: number;
            blockedTasks: number;
            workload: string;
            projectPhase: string;
            resourceAvailability: string;
        };
    };
}
interface TaskSelectionLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'TASK_SELECTION';
    metadata: {
        message: string;
        selectionStrategy: 'llm' | 'fallback' | 'gap_analysis';
        selectedTasksCount: number;
        skippedTasksCount: number;
        selectionCriteria: string[];
        gapAnalysisPerformed: boolean;
        existingSkillsCovered: string[];
        newSkillsAdded: string[];
    };
}
interface TaskAdaptationLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'TASK_ADAPTATION';
    metadata: {
        message: string;
        taskId: string;
        taskDescription: string;
        adaptationLevel: 'none' | 'minor' | 'moderate' | 'major';
        adaptationPermissions: {
            canModify: boolean;
            reason: string;
            allowedActions: string[];
        };
        adaptationChanges?: string[];
    };
}
interface TaskGenerationLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'TASK_GENERATION';
    metadata: {
        message: string;
        gapsIdentified: Array<{
            description: string;
            category: string;
            complexity: 'low' | 'medium' | 'high';
            requirements: string[];
        }>;
        tasksGenerated: number;
        generationMethod: 'llm' | 'template' | 'fallback';
    };
}
interface WorkflowOptimizationLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'OPTIMIZATION_STARTED';
    metadata: {
        message: string;
        performanceIssues: string[];
        optimizationStrategy: string;
        targetMetrics: Record<string, number>;
    };
}
interface OrchestrationCompletedLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'COMPLETED';
    metadata: {
        message: string;
        totalDuration: number;
        results: {
            existingTasksPreserved: number;
            newTasksAdded: number;
            tasksGenerated: number;
            tasksAdapted: number;
            totalTasks: number;
        };
        finalWorkloadDistribution: {
            agentName: string;
            assignedTasks: number;
        }[];
        orchestrationStats: {
            llmCallsCount: number;
            fallbackOperations: number;
            gapAnalysisExecuted: boolean;
            performanceOptimizations: number;
        };
    };
}
interface OrchestrationErrorLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'ERROR';
    metadata: {
        message: string;
        error: string;
        errorStack?: string;
        operationFailed: string;
        fallbackExecuted: boolean;
        partialResults?: {
            tasksProcessed: number;
            operationsCompleted: string[];
        };
    };
}
interface TaskRepositoryLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'TASK_REPOSITORY_UPDATE';
    metadata: {
        message: string;
        operation: 'ADD' | 'REMOVE' | 'UPDATE';
        taskCount: number;
        repositorySize: number;
        affectedTaskIds: string[];
    };
}
interface PerformanceMonitoringLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'PERFORMANCE_MONITORING';
    metadata: {
        message: string;
        metrics: {
            taskCompletionRate: number;
            averageTaskDuration: number;
            agentUtilization: number;
            bottlenecksDetected: string[];
            qualityScore: number;
        };
        recommendations: string[];
        nextOptimizationScheduled: number;
    };
}
interface TaskCompletionAnalysisLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'TASK_COMPLETION_ANALYSIS';
    metadata: {
        message: string;
        completedTaskId: string;
        completedTaskTitle?: string;
        totalTasks: number;
        remainingTasks: number;
    };
}
interface OrchestrationDecisionsLog extends BaseWorkflowLog {
    logType: 'OrchestrationStatusUpdate';
    orchestrationEvent: 'ORCHESTRATION_DECISIONS';
    metadata: {
        message: string;
        decisionsGenerated: number;
        modifyTasks: number;
        addTasks: number;
        removeTasks: number;
        changePriorities: number;
        processingTime: number;
    };
}
type OrchestrationStatusLog = OrchestrationActivatedLog | OrchestrationDeactivatedLog | OrchestrationAnalysisLog | TaskSelectionLog | TaskAdaptationLog | TaskGenerationLog | WorkflowOptimizationLog | OrchestrationCompletedLog | OrchestrationErrorLog | TaskRepositoryLog | PerformanceMonitoringLog | TaskCompletionAnalysisLog | OrchestrationDecisionsLog;

type WorkflowLog = WorkflowStatusLog | AgentStatusLog | TaskStatusLog | OrchestrationStatusLog;

type NewAgentStatusUpdateLogParams<T extends AgentStatusLog> = {
    agent: BaseAgent | Agent;
    task: Task;
    logDescription: string;
    workflowStatus?: WORKFLOW_STATUS_enum;
    taskStatus?: TASK_STATUS_enum;
    agentStatus?: AGENT_STATUS_enum;
    metadata: T['metadata'];
    logType?: T['logType'];
};
interface AgentStoreState {
    handleAgentIterationStart: (params: {
        agent: BaseAgent;
        task: Task;
        iterations: number;
        maxAgentIterations: number;
    }) => void;
    handleAgentIterationEnd: (params: {
        agent: BaseAgent;
        task: Task;
        iterations: number;
        maxAgentIterations: number;
    }) => void;
    handleAgentThinkingStart: (params: {
        agent: BaseAgent;
        task: Task;
        messages: Array<{
            type: string;
            content: string;
        }>;
    }) => void;
    handleAgentThinkingEnd: (params: {
        agent: BaseAgent;
        task: Task;
        output: ThinkingResult;
    }) => void;
    handleAgentThinkingError: (params: {
        agent: BaseAgent;
        task: Task;
        error: LLMInvocationError;
    }) => void;
    handleAgentIssuesParsingLLMOutput: (params: {
        agent: BaseAgent;
        task: Task;
        output: ThinkingResult;
        error: LLMInvocationError;
    }) => void;
    handleAgentIssuesParsingSchemaOutput: (params: {
        agent: BaseAgent;
        task: Task;
        output: ThinkingResult;
        error: LLMInvocationError;
    }) => void;
    handleAgentFinalAnswer: (params: {
        agent: BaseAgent;
        task: Task;
        output: ParsedLLMOutput;
    }) => void;
    handleAgentThought: (params: {
        agent: BaseAgent;
        task: Task;
        output: ParsedLLMOutput;
    }) => void;
    handleAgentSelfQuestion: (params: {
        agent: BaseAgent;
        task: Task;
        output: ParsedLLMOutput;
    }) => void;
    handleAgentToolStart: (params: {
        agent: BaseAgent;
        task: Task;
        tool: BaseTool;
        input?: Record<string, unknown> | string;
    }) => void;
    handleAgentToolEnd: (params: {
        agent: BaseAgent;
        task: Task;
        tool: BaseTool;
        output: ToolResult;
    }) => void;
    handleAgentToolError: (params: {
        agent: BaseAgent;
        task: Task;
        tool: BaseTool;
        error: LLMInvocationError;
    }) => void;
    handleAgentToolDoesNotExist: (params: {
        agent: BaseAgent;
        task: Task;
        toolName: string;
    }) => void;
    handleAgentObservation: (params: {
        agent: BaseAgent;
        task: Task;
        output: ParsedLLMOutput;
    }) => void;
    handleWeirdOutput: (params: {
        agent: BaseAgent;
        task: Task;
        output: ParsedLLMOutput;
    }) => void;
    handleAgentLoopError: (params: {
        agent: BaseAgent;
        task: Task;
        error: LLMInvocationError;
        iterations: number;
        maxAgentIterations: number;
    }) => void;
    handleAgentMaxIterationsError: (params: {
        agent: BaseAgent;
        task: Task;
        error: LLMInvocationError;
        iterations: number;
        maxAgentIterations: number;
    }) => void;
    handleAgentTaskCompleted: (params: {
        agent: BaseAgent;
        task: Task;
        result: TaskResult;
        iterations: number;
        maxAgentIterations: number;
    }) => void;
    handleAgentBlockTask: (params: {
        agent: BaseAgent;
        task: Task;
        reason: string;
        metadata: {
            isAgentDecision: boolean;
            blockedBy: string;
        };
    }) => void;
    handleAgentTaskAborted: (params: {
        agent: BaseAgent;
        task: Task;
        error: StopAbortError | LLMInvocationError;
    }) => void;
    handleAgentTaskPaused: (params: {
        task: Task;
    }) => void;
    handleAgentTaskResumed: (params: {
        task: Task;
    }) => void;
    prepareAgentStatusUpdateLog: <T extends AgentStatusLog>(params: NewAgentStatusUpdateLogParams<T>) => T;
}

type PromiseObject = ThinkingPromise | ToolCallingPromise;
interface WorkflowLoopStoreVariables {
    activePromises: Map<string, Set<PromiseObject>>;
}
interface WorkflowLoopStoreVariables {
    activePromises: Map<string, Set<PromiseObject>>;
}
interface WorkflowLoopStoreActions {
    trackPromise: (agentId: string, promiseObj: PromiseObject) => void;
    removePromise: (agentId: string, promiseObj: PromiseObject) => void;
    abortAgentPromises: (agentId: string, action: WORKFLOW_ACTION_enum) => void;
    pauseWorkflow: () => Promise<void>;
    resumeWorkflow: () => Promise<void>;
    stopWorkflow: () => Promise<void>;
}
type WorkflowLoopState = WorkflowLoopStoreVariables & WorkflowLoopStoreActions;

interface TeamStoreState {
    teamWorkflowStatus: WORKFLOW_STATUS_enum;
    workflowResult: TaskResult | null;
    name: string;
    agents: Agent[];
    tasks: Task[];
    workflowLogs: WorkflowLog[];
    inputs: Record<string, unknown>;
    workflowContext: string;
    env: Env;
    logLevel?: string;
    memory: boolean;
    insights: string;
    flowType?: string;
    workflowExecutionStrategy: string;
    workflowController: Record<string, unknown>;
    maxConcurrency: number;
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
    teamInstance?: any;
}
interface TeamStoreActions {
    setInputs: (inputs: Record<string, unknown>) => void;
    setName: (name: string) => void;
    setEnv: (env: Env) => void;
    addAgents: (agents: Agent[]) => void;
    addTasks: (tasks: Task[]) => void;
    updateTaskStatus: (taskId: string, status: TASK_STATUS_enum) => void;
    setWorkflowExecutionStrategy: (strategy: string) => void;
    startWorkflow: (inputs?: Record<string, unknown>, skipTeamStart?: boolean) => Promise<void>;
    resetWorkflowStateAction: () => void;
    finishWorkflowAction: () => void;
    setTeamWorkflowStatus: (status: WORKFLOW_STATUS_enum) => void;
    handleWorkflowError: (error: Error) => void;
    handleWorkflowBlocked: (task: Task, error: Error) => void;
    handleWorkflowAborted: (task: Task, error: Error) => void;
    workOnTask: (agent: Agent, task: Task, context: string) => Promise<void>;
    workOnTaskResume: (agent: Agent, task: Task) => Promise<void>;
    deriveContextFromLogs: (logs: WorkflowLog[], currentTaskId: string) => string;
    provideFeedback: (taskId: string, feedbackContent: string) => Promise<void>;
    validateTask: (taskId: string) => Promise<void | null>;
    clearAll: () => void;
    getWorkflowStats: () => WorkflowStats;
    getTaskResults: () => Record<string, unknown>;
    prepareWorkflowStatusUpdateLog: <T extends WorkflowLog>(params: NewLogParams<T>) => T;
    addWorkflowLog: (log: WorkflowLog) => void;
    setBacklogTasks: (tasks: Task[]) => void;
    addBacklogTask: (task: Task) => void;
    removeBacklogTask: (taskId: string) => void;
    updateOrchestrationMode: (mode: 'conservative' | 'adaptive' | 'innovative' | 'learning') => void;
    updateOrchestrationStrategy: (strategy: string) => void;
    setContinuousOrchestration: (enabled: boolean) => void;
}
type NewLogParams<T extends WorkflowLog> = {
    task?: Task;
    agent?: Agent;
    logDescription: string;
    workflowStatus?: WORKFLOW_STATUS_enum;
    taskStatus?: TASK_STATUS_enum;
    agentStatus?: AGENT_STATUS_enum;
    logType: T['logType'];
    metadata?: T['metadata'];
};
type CombinedStoresState = TaskStoreState & AgentStoreState & WorkflowLoopState & TeamStoreState & TeamStoreActions;
type TeamStore = UseBoundStore<StoreApi<CombinedStoresState>>;

/**
 * Intelligent Orchestrator for KaibanJS
 *
 * This module implements an AI-powered orchestrator that can autonomously:
 * - Select optimal tasks from a repository
 * - Adapt existing tasks to current circumstances
 * - Generate new tasks when gaps are identified
 * - Optimize workflow performance in real-time
 */

/**
 * Intelligent Orchestrator Class
 *
 * Uses LLM-powered decision making to autonomously manage task workflows
 */
declare class IntelligentOrchestrator {
    private team;
    private availableTasks;
    private orchestrationStrategy;
    private mode;
    private llm;
    private conversationHistory;
    private performanceMetrics;
    private taskAdaptationHistory;
    private taskPerformanceHistory;
    private splitStrategyPreference;
    private llmCache;
    private cacheTimeout;
    private adaptationTimeout;
    private recoveryManager;
    private contextAnalyzer;
    private gapAnalyzer;
    private performanceAnalyzer;
    private taskAnalyzer;
    private adaptationStrategy;
    private generationStrategy;
    private selectionStrategy;
    private resourceOptimizer;
    private workflowOptimizer;
    constructor(team: Team);
    /**
     * Handle orchestration errors - fail fast, no fallbacks
     */
    private handleOrchestrationError;
    /**
     * Ensure LLM is initialized (lazy initialization)
     */
    private ensureLLMInitialized;
    /**
     * Validate LLM connection with a simple test call
     */
    private validateLLMConnection;
    /**
     * Initialize LLM instance for the orchestrator
     */
    private initializeLLM;
    /**
     * Create LLM instance from configuration
     */
    private createLLMFromConfig;
    /**
     * Main orchestration method
     * Analyzes context and optimally arranges tasks
     * @param projectGoal - The overall goal for the orchestrator to optimize towards
     * @param preserveExistingTasks - Whether to keep existing tasks and build upon them (default: true)
     * @param inputs - User-provided inputs from team.start()
     */
    orchestrateWorkflow(projectGoal: string, preserveExistingTasks: boolean | undefined, inputs: Record<string, unknown>): Promise<Task[]>;
    /**
     * Analyze current team and project context
     */
    private analyzeCurrentContext;
    /**
     * Select optimal tasks from available repository
     * Performs gap analysis considering existing tasks
     */
    private selectOptimalTasks;
    /**
     * Generate additional tasks if gaps are identified
     */
    private generateAdditionalTasks;
    /**
     * Adapt tasks to current context and circumstances
     */
    private adaptTasksToContext;
    /**
     * Evaluate whether a task can be modified by the orchestrator
     */
    private evaluateTaskModificationPermissions;
    /**
     * Performance optimization: Batch adapt multiple tasks
     */
    private batchAdaptTasks;
    /**
     * Adapt a single task based on current context
     */
    private adaptTask;
    private parseAdaptationResponse;
    /**
     * Validate task against its orchestration rules and current context
     */
    private validateTaskAgainstRules;
    private compareWorkload;
    private applyTaskAdaptations;
    /**
     * Update team's task list with orchestrated tasks (replaces all tasks)
     */
    private updateTeamTasks;
    /**
     * Apply dynamic priority ordering to tasks based on current context
     */
    private applyDynamicPriorityOrdering;
    /**
     * Calculate dynamic priority score for a task based on multiple factors
     */
    private calculateDynamicPriorityScore;
    /**
     * Process task split recommendation
     */
    private processSplitRecommendation;
    /**
     * Process task merge recommendation
     */
    private processMergeRecommendation;
    /**
     * Apply priority adjustments from continuous orchestration recommendations
     */
    private applyPriorityAdjustments;
    /**
     * Add new orchestrated tasks to existing team tasks
     * Prevents duplicates and maintains existing tasks
     */
    private addOrchestrationTasks;
    /**
     * Helper method to log orchestration events
     */
    private logOrchestrationEvent;
    /**
     * Log to console with appropriate log levels based on event type
     */
    private logToConsoleWithLevel;
    /**
     * Calculate error rate from performance metrics
     */
    private calculateErrorRate;
    /**
     * Calculate success rate from performance metrics
     */
    private calculateSuccessRate;
    /**
     * Get orchestration metrics summary for external reporting
     */
    getOrchestrationMetrics(): {
        performance: Record<string, any>;
        taskStatistics: Record<string, any>;
        systemHealth: Record<string, any>;
    };
    /**
     * Analyze skill gaps in the current workflow
     */
    private analyzeSkillGaps;
    /**
     * Analyze workflow gaps
     */
    private analyzeWorkflowGaps;
    /**
     * Analyze quality gaps
     */
    private analyzeQualityGaps;
    /**
     * Analyze resource gaps
     */
    private analyzeResourceGaps;
    /**
     * Analyze dependency gaps
     */
    private analyzeDependencyGaps;
    /**
     * Prioritize gaps based on impact and context
     */
    private prioritizeGaps;
    /**
     * Infer skills from agent role and background
     */
    private inferAgentSkills;
    /**
     * Parse estimated time string to hours
     */
    private parseEstimatedTime;
    /**
     * Calculate workload per agent
     */
    private calculateAgentWorkload;
    /**
     * Calculate workload distribution across agents
     */
    private calculateWorkloadDistribution;
    /**
     * Identify gaps in task coverage with comprehensive analysis
     */
    private identifyTaskGaps;
    /**
     * Generate a new task for an identified gap
     */
    private generateTaskForGap;
    private calculateProjectProgress;
    private calculateCurrentWorkload;
    private determineProjectPhase;
    /**
     * Calculate agent workload score for intelligent distribution
     */
    private calculateAgentWorkloadScore;
    /**
     * Match agent skills to task requirements
     */
    private calculateSkillMatchScore;
    /**
     * Extract skills from agent profile
     */
    private extractAgentSkills;
    /**
     * Find optimal agent for a task using intelligent workload distribution
     */
    private findOptimalAgent;
    /**
     * Calculate overall agent score for task assignment
     */
    private calculateAgentScore;
    /**
     * Calculate agent affinity for certain task types
     */
    private calculateAgentAffinityScore;
    /**
     * Calculate agent performance score based on historical data
     */
    private calculateAgentPerformanceScore;
    /**
     * Track task performance for learning
     */
    private trackTaskPerformance;
    /**
     * Initialize task performance tracking
     */
    private initializeTaskPerformance;
    /**
     * Get performance score for a template task
     */
    private getTaskPerformanceScore;
    /**
     * Generate a key for task performance tracking
     */
    private getTaskPerformanceKey;
    /**
     * Simple string hash for consistent keys
     */
    private hashString;
    /**
     * Calculate recency weight for performance scores
     */
    private calculateRecencyWeight;
    /**
     * Apply performance-based learning to task selection
     */
    private applyPerformanceBasedFiltering;
    /**
     * Predict potential task failures based on historical data and current context
     */
    private predictTaskFailures;
    /**
     * Generate task dependency graph visualization data
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
     * Calculate dependency graph metrics
     */
    private calculateGraphMetrics;
    /**
     * Find the critical path in the task dependency graph
     */
    private findCriticalPath;
    /**
     * Get performance insights for orchestration decisions
     */
    private getPerformanceInsights;
    private assessResourceAvailability;
    private assessTimeConstraints;
    private assessQualityRequirements;
    /**
     * Optimize resource utilization across agents
     */
    private optimizeResourceUtilization;
    /**
     * Redistribute tasks for better load balancing
     */
    private redistributeTasks;
    /**
     * Check if agent can handle a specific task
     */
    private canAgentHandleTask;
    /**
     * Automated workflow recovery for detected failures
     */
    private performWorkflowRecovery;
    /**
     * Robust JSON parsing with common issue fixes
     */
    private parseRobustJSON;
    /**
     * Handle task completion for continuous orchestration
     * This method is called after each task completion when continuousOrchestration is enabled
     */
    orchestrateTaskCompletion(completedTask: Task, allTasks: Task[]): Promise<any>;
    private generateTaskCompletionRecommendations;
    /**
     * Apply task completion recommendations to the workflow
     */
    private applyTaskCompletionRecommendations;
    /**
     * Generate new tasks specifically for continuous orchestration optimization
     */
    private generateContinuousOptimizationTasks;
    /**
     * Monitor orchestrator performance and health
     */
    private performHealthCheck;
    /**
     * Update performance metrics for tracking
     */
    private updatePerformanceMetric;
    /**
     * Validate orchestration configuration for edge cases
     */
    private validateOrchestrationConfig;
    /**
     * Get orchestrator control status and recommendations
     */
    getControlStatus(): Promise<{
        status: 'healthy' | 'warning' | 'error';
        healthCheck: any;
        configValidation: any;
        recommendations: string[];
    }>;
    /**
     * Select tasks specifically for continuous orchestration optimization
     */
    private selectContinuousOptimizationTasks;
    /**
     * Enhanced performance learning algorithm
     */
    private learnFromPerformanceHistory;
    /**
     * Analyze metric trends
     */
    private analyzeMetricTrends;
    /**
     * Identify performance patterns
     */
    private identifyPerformancePatterns;
    /**
     * Adjust strategies based on learning
     */
    private adjustStrategiesBasedOnLearning;
    /**
     * Helper method to analyze complexity vs success pattern
     */
    private analyzeComplexitySuccessPattern;
    /**
     * Helper method to analyze agent utilization pattern
     */
    private analyzeAgentUtilizationPattern;
    /**
     * Helper method to analyze time-based performance
     */
    private analyzeTimeBasedPerformance;
    /**
     * Adjust task split strategy
     */
    private adjustTaskSplitStrategy;
    /**
     * Estimate task complexity
     */
    private estimateTaskComplexity;
    /**
     * Identify high-risk tasks based on various factors
     */
    private identifyHighRiskTasks;
    /**
     * Simple logging method
     */
    private log;
    /**
     * Build orchestration context for LLM prompts
     */
    private buildOrchestrationContext;
    /**
     * Call LLM with proper error handling and retries
     */
    private callLLM;
    /**
     * Performance optimization: Generate hash for prompt caching
     */
    private hashPrompt;
    /**
     * Performance optimization: Clean expired cache entries
     */
    private cleanExpiredCache;
}

/**
 * Core Types and Interfaces for Intelligent Orchestration
 *
 * This module contains the core type definitions and interfaces used throughout
 * the intelligent orchestration system.
 */

/**
 * Context information for orchestrator decision-making
 */
interface OrchestrationContext {
    activeTasks: Task[];
    availableAgents: Agent[];
    projectProgress: number;
    blockedTasks: Task[];
    codeCoverage: number;
    processCoverage?: number;
    performanceScore: number;
    qualityScore?: number;
    workload: string;
    projectPhase: string;
    similarTasks: Task[];
    newPriorities?: string[];
    resourceAvailability: string;
    timeConstraints: string;
    qualityRequirements: string;
    existingTasks: Task[];
    inputs?: Record<string, unknown>;
}
/**
 * Task gap information for new task generation
 */
interface TaskGap {
    id?: string;
    description: string;
    category: string;
    estimatedComplexity: 'low' | 'medium' | 'high';
    requirements: string[];
    dependencies: string[];
    priority?: 'high' | 'medium' | 'low';
    suggestedSolution?: string;
}
/**
 * Task modification permissions
 */
interface TaskModificationPermissions {
    canModify: boolean;
    reason: string;
    allowedActions: string[];
}

/**
 * Orchestration Prompt Templates
 *
 * This module contains LLM prompt templates for various orchestration tasks.
 * These templates provide structured prompts for task selection, adaptation,
 * generation, and workflow optimization.
 */

/**
 * Template for task selection prompts
 */
declare class TaskSelectionPromptTemplate {
    static build(context: OrchestrationContext, projectGoal: string, availableTasks: Task[], orchestrationMode?: 'initial' | 'continuous', orchestrationStrategy?: string): string;
}
/**
 * Template for task adaptation prompts
 */
declare class TaskAdaptationPromptTemplate {
    static build(task: Task, context: OrchestrationContext, instructions: string): string;
}
/**
 * Template for new task generation prompts
 */
declare class TaskGenerationPromptTemplate {
    static build(gap: TaskGap, context: OrchestrationContext, instructions: string): string;
}
/**
 * Template for workflow optimization prompts
 */
declare class WorkflowOptimizationPromptTemplate {
    static build(context: OrchestrationContext, performanceIssues: string[], instructions: string): string;
}
/**
 * Template for performance analysis prompts
 */
declare class PerformanceAnalysisPromptTemplate {
    static build(context: OrchestrationContext, historicalData: any[], instructions: string): string;
}
/**
 * Template for task completion analysis prompts (for continuous orchestration)
 */
declare class TaskCompletionAnalysisPromptTemplate {
    static build(completedTask: Task, context: OrchestrationContext, taskResult: any, instructions: string): string;
}
/**
 * Main prompt template factory
 */
declare class OrchestrationPromptFactory {
    static createTaskSelectionPrompt: typeof TaskSelectionPromptTemplate.build;
    static createTaskAdaptationPrompt: typeof TaskAdaptationPromptTemplate.build;
    static createTaskGenerationPrompt: typeof TaskGenerationPromptTemplate.build;
    static createWorkflowOptimizationPrompt: typeof WorkflowOptimizationPromptTemplate.build;
    static createPerformanceAnalysisPrompt: typeof PerformanceAnalysisPromptTemplate.build;
    static createTaskCompletionAnalysisPrompt: typeof TaskCompletionAnalysisPromptTemplate.build;
    /**
     * Create initial orchestration task selection prompt
     */
    static createInitialTaskSelectionPrompt(context: OrchestrationContext, projectGoal: string, availableTasks: Task[], orchestrationStrategy?: string): string;
    /**
     * Create continuous orchestration task selection prompt
     */
    static createContinuousTaskSelectionPrompt(context: OrchestrationContext, projectGoal: string, availableTasks: Task[], orchestrationStrategy?: string): string;
}

/**
 * Orchestration Module Exports
 *
 * This module provides intelligent orchestration capabilities for KaibanJS
 */

type index_d_IntelligentOrchestrator = IntelligentOrchestrator;
declare const index_d_IntelligentOrchestrator: typeof IntelligentOrchestrator;
type index_d_OrchestrationContext = OrchestrationContext;
type index_d_OrchestrationPromptFactory = OrchestrationPromptFactory;
declare const index_d_OrchestrationPromptFactory: typeof OrchestrationPromptFactory;
type index_d_TaskGap = TaskGap;
type index_d_TaskModificationPermissions = TaskModificationPermissions;
declare namespace index_d {
  export { index_d_IntelligentOrchestrator as IntelligentOrchestrator, type index_d_OrchestrationContext as OrchestrationContext, index_d_OrchestrationPromptFactory as OrchestrationPromptFactory, type index_d_TaskGap as TaskGap, type index_d_TaskModificationPermissions as TaskModificationPermissions };
}

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

/**
 * Interface for Agent configuration
 */
interface IAgentParams {
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
interface ITaskParams {
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
    goal?: string;
    qualityGates?: string[];
    allowAgentReassignment?: boolean;
}
/**
 * Interface for Team configuration
 */
interface ITeamParams {
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
declare class Agent {
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
declare class Task {
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
    goal?: string;
    qualityGates: string[];
    allowAgentReassignment: boolean;
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
    constructor({ title, id, description, expectedOutput, agent, dependencies, isDeliverable, externalValidationRequired, outputSchema, allowParallelExecution, referenceId, adaptable, orchestrationRules, dynamicPriority, splitStrategy, mergeCompatible, resourceRequirements, priority, goal, qualityGates, allowAgentReassignment, }: ITaskParams);
}
/**
 * Represents a team of AI agents working on a set of tasks.
 * This class provides methods to control the workflow, interact with tasks,
 * and observe the state of the team's operations.
 */
declare class Team {
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

export { Agent, type IAgentParams, type ITaskParams, type ITeamParams, Task, Team, index_d as orchestration };
