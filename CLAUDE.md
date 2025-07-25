# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KaibanJS is a JavaScript framework for building multi-agent AI systems inspired by Kanban methodology. It provides a structured way to create, orchestrate, and manage AI agents working collaboratively on tasks. The framework uses a Zustand-based state management system and supports multiple LLM providers.

**Latest Enhancement**: The framework now includes **Intelligent Orchestration** capabilities that enable autonomous task management, adaptive workflow optimization, and LLM-powered decision making for truly intelligent multi-agent systems.

## Memories

- **Keine fallbacks**: A specific memory or guideline related to handling scenarios without fallback mechanisms. This might indicate a strict requirement for primary solution paths in the framework.

## Build and Development Commands

### Building the Project

```bash
npm run build              # Production build with all formats (CJS, UMD, ESM, types)
npm run build:test         # Test build with mocked LLM APIs
npm run dev                # Development build with watch mode
npm run tsc                # TypeScript compilation check
```

[... rest of the file remains unchanged ...]