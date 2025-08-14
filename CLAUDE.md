# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KaibanJS is a JavaScript framework for building multi-agent AI systems inspired by Kanban methodology. It provides a structured way to create, orchestrate, and manage AI agents working collaboratively on tasks. The framework uses a Zustand-based state management system and supports multiple LLM providers.

**Latest Enhancement**: The framework now includes **Intelligent Orchestration** capabilities that enable autonomous task management, adaptive workflow optimization, and LLM-powered decision making for truly intelligent multi-agent systems.

## Memories

- **Keine fallbacks**: A specific memory or guideline related to handling scenarios without fallback mechanisms. This might indicate a strict requirement for primary solution paths in the framework.
- **ResponseFormatter Fix**: Der ResponseFormatter Task muss IMMER als letzter Task laufen. Konfiguration mit `isFinalizer: true`, `mustRunLast: true`, `priority: 999` und `dependencies: ['*']`.
- **Logging System**: Strukturiertes JSON-Logging implementiert für AI-basiertes Debugging. Logs werden im `logs/` Verzeichnis gespeichert mit Session-IDs.

## Build and Development Commands

### Building the Project

```bash
npm run build              # Production build with all formats (CJS, UMD, ESM, types)
npm run build:test         # Test build with mocked LLM APIs
npm run dev                # Development build with watch mode
npm run tsc                # TypeScript compilation check
```

## Logging System (KaibanJS Implementation)

### Overview
The KaibanJS implementation in `/Users/asanstefanski/KundenProjekte/chatbot_sam/fission/nodes/kaibanjs_main` includes a comprehensive logging system for debugging multi-agent orchestration.

### Key Components

1. **Logger Module** (`utils/logger.js`):
   - Structured JSON logging for AI analysis
   - Automatic log file creation in `logs/` directory
   - Session-based log files with unique IDs
   - Event-based logging for all orchestration phases

2. **Event Types**:
   - `TEAM_INIT`: Team initialization with agents and configuration
   - `INPUT_RECEIVED`: Incoming request details
   - `ORCHESTRATION_DECISION`: Task selection and reasoning
   - `TASK_EXECUTION`: Individual task execution tracking
   - `AGENT_ACTIVITY`: Agent-specific operations
   - `TOOL_USAGE`: Tool invocations by agents
   - `FINAL_RESULT`: Final response and metadata
   - `ERROR`: Error tracking with stack traces

3. **Integration Points**:
   - `index.js`: Main entry point with logger initialization
   - `projectGoal.js`: Orchestration strategy with ResponseFormatter rules
   - `backlog/index.js`: Task registry with finalizer marking
   - `backlog/formatter/format_response/index.js`: ResponseFormatter task configuration

### Debugging with Logs

When debugging orchestration issues:

1. **Check log files** in the `logs/` directory
2. **Look for task execution order** - ResponseFormatter should always be last
3. **Verify orchestration decisions** - which tasks were selected and why
4. **Track agent activities** - what each agent did
5. **Analyze errors** - full stack traces are logged

### Important Configuration

**ResponseFormatter Task** must always run last:
```javascript
{
  isFinalizer: true,
  mustRunLast: true,
  priority: 999,
  dependencies: ['*'],
  adaptable: false
}
```

**Orchestration Strategy** (`projectGoal.js`):
- Explicit rules for ResponseFormatter execution
- Input parameter mapping (message, question, history)
- Task relevance scoring and selection
- Parallelization strategies

[... rest of the file remains unchanged ...]