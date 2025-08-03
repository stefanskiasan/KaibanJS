/**
 * Orchestration Module Exports
 *
 * This module provides intelligent orchestration capabilities for KaibanJS
 */

export { IntelligentOrchestrator } from './intelligentOrchestrator';
export type {
  OrchestrationContext,
  TaskGap,
  TaskModificationPermissions,
} from './core/OrchestrationContext';
export { OrchestrationPromptFactory } from './promptTemplates';
