# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KaibanJS is a JavaScript framework for building multi-agent AI systems inspired by Kanban methodology. It provides a structured way to create, orchestrate, and manage AI agents working collaboratively on tasks. The framework uses a Zustand-based state management system and supports multiple LLM providers.

**Latest Enhancement**: The framework now includes **Intelligent Orchestration** capabilities that enable autonomous task management, adaptive workflow optimization, and LLM-powered decision making for truly intelligent multi-agent systems.

## Build and Development Commands

### Building the Project
```bash
npm run build              # Production build with all formats (CJS, UMD, ESM, types)
npm run build:test         # Test build with mocked LLM APIs
npm run dev                # Development build with watch mode
npm run tsc                # TypeScript compilation check
```

### Testing
```bash
npm test                   # Full test suite (build + integration tests)
npm run test:integration   # Integration tests with mocked APIs
npm run test:e2e          # End-to-end tests with real LLM APIs
npm run test:unit         # Unit tests with watch mode
npm run test:prod         # Production test (build + e2e)
npm run test:watch        # Watch mode for integration tests
npm run test:debug        # Debug integration tests
npm run test:unit:debug   # Debug unit tests
npm run test:types        # TypeScript type checking
```

### Code Quality
```bash
npm run lint:check         # Check linting issues
npm run lint:fix          # Fix linting issues automatically
npm run format:check       # Check code formatting
npm run format:fix         # Fix code formatting
```

### Development Playground
```bash
npm run play:react         # Start React playground
npm run play:sb           # Start Storybook
npm run play:node         # Run Node.js playground
```

### CLI and Tools
```bash
npm run cli               # Run KaibanJS CLI
npx kaibanjs@latest init  # Initialize new KaibanJS project
```

## Architecture Overview

### Core Components

**Main Entry Point (`src/index.ts`)**
- Exports three primary classes: `Agent`, `Task`, and `Team`
- Provides the public API for the framework
- Manages state through Zustand stores

**Agent System (`src/agents/`)**
- `BaseAgent`: Abstract base class for all agents
- `ReactChampionAgent`: Default implementation using ReAct pattern
- Agents are wrappers around `BaseAgent` instances with proxy properties
- Support for multiple LLM providers (OpenAI, Anthropic, Google, Mistral, etc.)

**Task System**
- Tasks define work to be completed by agents
- Support for dependencies, parallel execution, and result passing
- Integration with Zod schemas for output validation
- Human-in-the-loop (HITL) functionality with feedback system

**Team Orchestration**
- `Team` class coordinates agents and tasks
- State management through combined Zustand stores
- Workflow execution with deterministic task ordering
- Real-time status updates and logging

### State Management (`src/stores/`)

The framework uses a sophisticated Zustand-based state management system:

- **`teamStore.ts`**: Main orchestrator store handling workflow status, task coordination, and logging
- **`agentStore.ts`**: Manages agent states and actions
- **`taskStore.ts`**: Handles task lifecycle and status updates
- **`workflowLoopStore.ts`**: Controls workflow execution loops

### Key Design Patterns

**Store Factory Pattern**: Each team gets its own isolated store instance, allowing multiple teams to run concurrently without state interference.

**Proxy Pattern**: The `Agent` class proxies property access to its underlying `BaseAgent` instance, providing a clean API while maintaining flexibility.

**Observer Pattern**: Uses Zustand subscriptions for reactive state updates and workflow orchestration.

**Strategy Pattern**: Different agent types and execution strategies can be plugged in through the agent creation system.

## Testing Structure

- **`tests/e2e/`**: End-to-end tests with real/mocked LLM interactions
- **`tests/unit/`**: Unit tests for individual components
- **`tests/integration/`**: Integration tests for workflow execution
- **`tests/utils/`**: Testing utilities including mock LLM API system

The test system includes a sophisticated mock LLM API system (`tests/utils/moscaFetch/`) that can record and replay LLM interactions for deterministic testing.

## Development Guidelines

### LLM Configuration
- All LLM configurations are normalized through `BaseAgent.normalizeLlmConfig()`
- Environment variables for API keys follow the pattern: `VITE_OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
- The framework supports custom API base URLs for each provider

### Task Result Passing
- Tasks can reference previous task results using `{taskResult:taskN}` syntax
- Results are interpolated during task execution through `interpolateTaskDescriptionV2()`
- Memory management controls whether tasks have access to all previous results

### Error Handling
- Workflow can be in states: INITIAL, RUNNING, FINISHED, ERRORED, BLOCKED, STOPPED
- Comprehensive error logging through workflow logs
- Support for task validation and feedback loops

### Build System
- Uses Rollup for bundling with multiple output formats
- TypeScript compilation with declaration files
- Test environment uses mocked LLM APIs for deterministic testing
- Development builds include source maps

### Tool Integration
- Agents can use LangChain-compatible tools
- Built-in tools include `BaseTool` and `BlockTaskTool`
- Tools are passed to agents during initialization

## Environment Variables

Required for testing and development:
- `OPENAI_API_KEY` or `VITE_OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `MISTRAL_API_KEY`
- `DEEPSEEK_API_KEY`
- `XAI_API_KEY`
- `KAIBAN_TELEMETRY_OPT_OUT` (optional, disables telemetry)

## CLI Tool

The project includes a CLI tool (`xscripts/cli.mjs`) for project initialization and management. It supports creating new KaibanJS projects with proper scaffolding and environment setup.

## Intelligent Orchestration

KaibanJS now includes advanced intelligent orchestration capabilities that enable autonomous task management, adaptive workflow optimization, and LLM-powered decision making. This feature transforms static multi-agent systems into truly intelligent, self-adapting workflows.

### Core Orchestration Concepts

**Task Repository**: A collection of template tasks that the orchestrator can select, adapt, and instantiate based on project needs and context.

**Dynamic Task Adaptation**: The ability to modify task parameters, scope, and requirements at runtime based on changing project conditions.

**Autonomous Task Generation**: LLM-powered creation of new tasks when gaps are identified in the workflow.

**Continuous Optimization**: Real-time monitoring and adjustment of workflow performance and resource allocation.

### Team Configuration for Orchestration

Extended `ITeamParams` interface with orchestration properties:

```typescript
interface ITeamParams {
  // ... existing properties
  
  // Orchestration Extensions
  enableOrchestration?: boolean;              // Enable intelligent orchestration (default: false)
  availableTasks?: Task[];                    // Repository of template tasks
  allowTaskGeneration?: boolean;              // Enable autonomous task creation
  orchestrationStrategy?: string;             // Custom strategy instructions
  mode?: 'conservative' | 'adaptive' | 'innovative' | 'learning';
  maxActiveTasks?: number;                    // Concurrency limit
  taskPrioritization?: 'static' | 'dynamic' | 'ai-driven';
  workloadDistribution?: 'balanced' | 'skills-based' | 'availability';
  adaptationInterval?: number;                // Optimization frequency (ms)
  llmConfig?: LLMConfig;                      // Team-level LLM for orchestration
  llmInstance?: LangChainChatModel;           // Pre-configured LLM instance
}
```

### Task Configuration for Orchestration

Extended `ITaskParams` interface with orchestration attributes:

```typescript
interface ITaskParams {
  // ... existing properties
  
  // Orchestration Extensions
  adaptable?: boolean;                        // Allow runtime modifications
  orchestrationRules?: string;               // Constraints and guidelines
  dynamicPriority?: boolean;                 // Enable priority adjustments
  splitStrategy?: 'none' | 'manual' | 'auto'; // Task decomposition approach
  mergeCompatible?: string[];                // Compatible task IDs for merging
  resourceRequirements?: {
    estimatedTime?: string;
    skillsRequired?: string[];
    dependencies?: string[];
  };
  template?: boolean;                        // Mark as reusable template
}
```

### Basic Usage Example

**Important**: Orchestration features are disabled by default. You must explicitly set `enableOrchestration: true` to use intelligent orchestration.

```javascript
import { Agent, Task, Team } from 'kaibanjs';

// Standard KaibanJS workflow (without orchestration)
/*
const normalTeam = new Team({
  name: 'Standard Team',
  agents: [agent1, agent2],
  tasks: [task1, task2, task3]  // Predefined static tasks
  // enableOrchestration: false (default)
});
*/

// Create agents
const developer = new Agent({
  name: 'Senior Developer',
  role: 'Full-Stack Developer',
  goal: 'Build robust, scalable applications',
  background: 'Expert in modern web technologies',
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4o',
    maxRetries: 2
  }
});

// Create template tasks for the repository
const templateTasks = [
  new Task({
    description: 'Implement user authentication system',
    expectedOutput: 'Complete authentication with JWT tokens',
    agent: developer,
    adaptable: true,
    template: true,
    orchestrationRules: 'Prioritize security, can be scaled based on requirements',
    resourceRequirements: {
      estimatedTime: '4-6 hours',
      skillsRequired: ['backend', 'security', 'database'],
      dependencies: ['database_setup']
    }
  }),
  new Task({
    description: 'Create responsive user interface',
    expectedOutput: 'Mobile-first responsive UI components',
    agent: developer,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '6-8 hours',
      skillsRequired: ['frontend', 'css', 'responsive_design'],
      dependencies: ['design_system']
    }
  })
];

// Create team with orchestration capabilities
const team = new Team({
  name: 'Smart Development Team',
  agents: [developer],
  tasks: [], // Start with empty task list
  enableOrchestration: true, // REQUIRED: Enable intelligent orchestration
  availableTasks: templateTasks,
  allowTaskGeneration: true,
  orchestrationStrategy: 'Build a complete web application with focus on user experience and security',
  mode: 'adaptive',
  maxActiveTasks: 3,
  taskPrioritization: 'ai-driven',
  workloadDistribution: 'skills-based',
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4o',
    maxRetries: 1
  }
});

// Activate intelligent orchestration
async function runIntelligentWorkflow() {
  try {
    // Let the orchestrator select and adapt tasks based on the project goal
    const orchestratedTasks = await team.activateOrchestration(
      'Create a secure web application with user authentication and modern UI'
    );
    
    console.log(`Orchestrator selected ${orchestratedTasks.length} tasks`);
    
    // Start continuous optimization (optional)
    await team.startContinuousOptimization();
    
    // Execute the workflow
    const result = await team.start();
    console.log('Workflow completed:', result);
  } catch (error) {
    console.error('Orchestration error:', error);
  }
}

runIntelligentWorkflow();
```

### Advanced Orchestration Features

#### Dynamic Task Management

```javascript
// Add new template tasks to the repository
const additionalTasks = [
  new Task({
    description: 'Implement API rate limiting',
    expectedOutput: 'Rate limiting middleware with Redis backend',
    agent: developer,
    adaptable: true,
    template: true,
    orchestrationRules: 'Critical for production, non-negotiable security requirement'
  })
];

team.addAvailableTasks(additionalTasks);

// Update orchestration strategy
team.updateOrchestrationStrategy(
  'Enhanced security focus - implement comprehensive protection measures'
);

// Change orchestration mode
team.updateOrchestrationMode('conservative'); // More careful task selection
```

#### Orchestration Modes

- **`conservative`**: Cautious task selection, strict adherence to templates, minimal risk-taking
- **`adaptive`**: Balanced approach, moderate task adaptation, responsive to context changes
- **`innovative`**: Creative task generation, experimental approaches, higher risk tolerance
- **`learning`**: Continuous improvement focus, learning from outcomes, evolving strategies

#### Task Prioritization Strategies

- **`static`**: Fixed priority order based on dependencies
- **`dynamic`**: Priority adjustments based on project phase and context
- **`ai-driven`**: LLM-powered priority optimization based on project goals

#### Workload Distribution Methods

- **`balanced`**: Even distribution across available agents
- **`skills-based`**: Optimal matching of tasks to agent capabilities
- **`availability`**: Priority to agents with lighter current workload

### IntelligentOrchestrator Class

The core orchestration engine provides several key capabilities:

```typescript
class IntelligentOrchestrator {
  // Main orchestration method
  async orchestrateWorkflow(projectGoal: string): Promise<Task[]>
  
  // Continuous optimization
  async startContinuousOptimization(): Promise<void>
  
  // Context analysis and decision making
  private async analyzeWorkflowContext(): Promise<OrchestrationContext>
  private async selectOptimalTasks(context: OrchestrationContext, goal: string): Promise<Task[]>
  private async adaptTaskForContext(task: Task, context: OrchestrationContext): Promise<Task>
  private async generateAdditionalTasks(context: OrchestrationContext, gaps: TaskGap[]): Promise<Task[]>
}
```

### Orchestration Context

The orchestrator analyzes comprehensive workflow context:

```typescript
interface OrchestrationContext {
  activeTasks: Task[];                        // Currently executing tasks
  availableAgents: Agent[];                   // Agents ready for work
  projectProgress: number;                    // Completion percentage
  blockedTasks: Task[];                       // Tasks waiting for dependencies
  codeCoverage: number;                       // Quality metrics
  performanceScore: number;                   // System performance rating
  workload: 'low' | 'medium' | 'high';       // Current team capacity
  projectPhase: 'planning' | 'development' | 'testing' | 'deployment';
  similarTasks: Task[];                       // Related completed tasks
  resourceAvailability: 'low' | 'medium' | 'high';
  timeConstraints: 'relaxed' | 'moderate' | 'tight';
  qualityRequirements: 'low' | 'medium' | 'high';
}
```

### LLM Integration for Orchestration

The orchestrator uses sophisticated prompt templates for decision making:

- **Task Selection**: Analyze available tasks and select optimal candidates
- **Task Adaptation**: Modify tasks based on current context and constraints  
- **Task Generation**: Create new tasks to fill identified workflow gaps
- **Workflow Optimization**: Continuous improvement recommendations

### Error Handling and Fallbacks

The orchestration system includes robust error handling:

```typescript
// Orchestration must be explicitly enabled
if (!this.enableOrchestration) {
  throw new Error('Orchestration is not enabled for this team. Set enableOrchestration: true in team configuration.');
}

// Graceful degradation when LLM is unavailable
if (!this.llmConfig && !this.llmInstance) {
  // Fallback to heuristic-based task selection
  return this.fallbackTaskSelection(availableTasks, maxTasks);
}

// Respect task adaptation constraints
if (!task.adaptable) {
  console.warn('Task adaptation requested but not allowed:', task.id);
  return task; // Return unchanged
}

// Handle task generation permissions
if (!this.team.allowTaskGeneration) {
  console.log('Task generation not allowed for this team');
  return []; // Return empty array
}
```

### State Management Extensions

The orchestration features extend the existing Zustand stores:

```typescript
// Extended TeamStoreState
interface TeamStoreState {
  // ... existing properties
  
  // Orchestration State
  enableOrchestration: boolean;
  availableTasks: Task[];
  allowTaskGeneration: boolean;
  orchestrationStrategy?: string;
  mode: 'conservative' | 'adaptive' | 'innovative' | 'learning';
  maxActiveTasks: number;
  taskPrioritization: 'static' | 'dynamic' | 'ai-driven';
  workloadDistribution: 'balanced' | 'skills-based' | 'availability';
  adaptationInterval: number;
  llmConfig?: LLMConfig;
  llmInstance?: LangChainChatModel;
}

// Extended Actions
interface TeamStoreActions {
  // ... existing actions
  
  // Orchestration Actions
  setAvailableTasks: (tasks: Task[]) => void;
  addAvailableTask: (task: Task) => void;
  removeAvailableTask: (taskId: string) => void;
  updateOrchestrationMode: (mode: OrchestrationMode) => void;
  updateOrchestrationStrategy: (strategy: string) => void;
}
```

### Integration with Existing Workflow

The orchestration features are designed to be backward-compatible:

- **Default Behavior**: Teams without `enableOrchestration: true` work exactly as before
- **Explicit Activation**: Orchestration features are completely disabled by default and require explicit opt-in
- **Graceful Warnings**: Orchestration methods show warnings when called on teams without orchestration enabled
- **Zero Impact**: Existing KaibanJS workflows are unaffected and continue to work normally
- **Sensible Defaults**: Tasks without orchestration properties use sensible defaults when orchestration is enabled

### Testing Orchestration Features

Comprehensive test suite covers all orchestration capabilities:

```bash
npm run test:unit                    # Includes orchestration unit tests
```

Key test areas:
- Team configuration with orchestration properties
- Task adaptation and generation logic
- State management for orchestration features
- Error handling and fallback mechanisms
- Integration with existing KaibanJS workflow

The orchestration tests include scenarios for:
- Basic orchestration setup and configuration
- Task repository management
- Dynamic task adaptation based on context
- Autonomous task generation for identified gaps
- Continuous optimization workflows
- Error handling when LLM is unavailable

### Performance Considerations

- **Lazy Loading**: Orchestration components are dynamically imported to reduce bundle size
- **Caching**: Task analysis results are cached to improve performance
- **Debouncing**: Continuous optimization uses configurable intervals to prevent excessive LLM calls
- **Fallback Strategies**: Heuristic-based approaches when LLM is unavailable or slow