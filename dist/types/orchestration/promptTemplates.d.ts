/**
 * Orchestration Prompt Templates
 *
 * This module contains LLM prompt templates for various orchestration tasks.
 * These templates provide structured prompts for task selection, adaptation,
 * generation, and workflow optimization.
 */
import { Task } from '../index';
import { OrchestrationContext, TaskGap } from './core/OrchestrationContext';
/**
 * Template for task selection prompts
 */
export declare class TaskSelectionPromptTemplate {
    static build(context: OrchestrationContext, projectGoal: string, availableTasks: Task[], orchestrationMode?: 'initial' | 'continuous', orchestrationStrategy?: string): string;
}
/**
 * Template for task adaptation prompts
 */
export declare class TaskAdaptationPromptTemplate {
    static build(task: Task, context: OrchestrationContext, instructions: string): string;
}
/**
 * Template for new task generation prompts
 */
export declare class TaskGenerationPromptTemplate {
    static build(gap: TaskGap, context: OrchestrationContext, instructions: string): string;
}
/**
 * Template for workflow optimization prompts
 */
export declare class WorkflowOptimizationPromptTemplate {
    static build(context: OrchestrationContext, performanceIssues: string[], instructions: string): string;
}
/**
 * Template for performance analysis prompts
 */
export declare class PerformanceAnalysisPromptTemplate {
    static build(context: OrchestrationContext, historicalData: any[], instructions: string): string;
}
/**
 * Template for task completion analysis prompts (for continuous orchestration)
 */
export declare class TaskCompletionAnalysisPromptTemplate {
    static build(completedTask: Task, context: OrchestrationContext, taskResult: any, instructions: string): string;
}
/**
 * Main prompt template factory
 */
export declare class OrchestrationPromptFactory {
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
