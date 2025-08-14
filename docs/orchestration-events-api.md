# KaibanJS Workflow Events API

## Overview

KaibanJS provides a comprehensive real-time event subscription system for monitoring all workflow phases - from orchestration planning through task execution to final results. This allows external consumers to track activities at any granularity and forward them to frontends via Server-Sent Events (SSE) or WebSockets.

## API Reference

### Event Subscription Methods

KaibanJS offers three subscription methods with different scopes:

1. **`subscribeToOrchestrationEvents`** - Only orchestration planning events
2. **`subscribeToExecutionEvents`** - Task and agent execution events
3. **`subscribeToAllEvents`** - Complete event stream (orchestration + execution + workflow)

### `subscribeToOrchestrationEvents(callback)`

Subscribe to orchestration planning events only.

#### Parameters

- `callback: (event: OrchestrationStatusLog) => void` - Function called when an orchestration event occurs

#### Returns

- `() => void` - Unsubscribe function to stop listening to events

#### Prerequisites

- Orchestration must be enabled (`enableOrchestration: true`)
- LLM configuration must be provided (`llmConfig` or `llmInstance`)

### `subscribeToExecutionEvents(callback)`

Subscribe to task and agent execution events.

#### Parameters

- `callback: (event: TaskStatusLog | AgentStatusLog) => void` - Function called when a task or agent event occurs

#### Returns

- `() => void` - Unsubscribe function to stop listening to events

### `subscribeToAllEvents(callback)`

Subscribe to ALL workflow events for complete visibility.

#### Parameters

- `callback: (event: WorkflowLog) => void` - Function called when any workflow event occurs

#### Returns

- `() => void` - Unsubscribe function to stop listening to events

## Usage Examples

### Complete Event Stream (Recommended)

```javascript
import { Team, Agent, Task } from 'kaibanjs';

// Create team
const team = new Team({
  name: 'Customer Support Team',
  agents: [
    new Agent({
      name: 'Support Agent',
      role: 'Customer Support Specialist',
      goal: 'Resolve customer inquiries',
      background: 'Experienced in customer service'
    })
  ],
  tasks: [],
  enableOrchestration: true,
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4'
  }
});

// Subscribe to ALL events for complete visibility
const unsubscribe = team.subscribeToAllEvents((event) => {
  console.log(`[${event.logType}]`, event);
  
  // Handle different event types
  switch(event.logType) {
    case 'OrchestrationStatusUpdate':
      console.log('Orchestration:', event.orchestrationEvent);
      break;
    case 'TaskStatusUpdate':
      console.log('Task:', event.task?.title, event.taskStatus);
      break;
    case 'AgentStatusUpdate':
      console.log('Agent:', event.agent?.name, event.agentStatus);
      break;
    case 'WorkflowStatusUpdate':
      console.log('Workflow:', event.workflowStatus);
      break;
  }
  
  // Forward to frontend
  sendToFrontend(event);
});

// Start workflow
await team.start({
  message: 'Customer inquiry about refund'
});

// Cleanup
unsubscribe();
```

### Separate Event Subscriptions

```javascript
// Subscribe to different event types separately
const unsubscribeOrch = team.subscribeToOrchestrationEvents((event) => {
  console.log('📋 Orchestration:', event.orchestrationEvent);
  updateOrchestrationUI(event);
});

const unsubscribeExec = team.subscribeToExecutionEvents((event) => {
  if (event.logType === 'TaskStatusUpdate') {
    console.log('✅ Task:', event.task?.title, event.taskStatus);
    updateTaskProgress(event);
  } else if (event.logType === 'AgentStatusUpdate') {
    console.log('🤖 Agent:', event.agent?.name, event.agentStatus);
    updateAgentStatus(event);
  }
});

// Start workflow
await team.start();

// Cleanup all subscriptions
unsubscribeOrch();
unsubscribeExec();
```

### Integration with Server-Sent Events (SSE)

```javascript
// Backend server example (Express.js)
app.get('/workflow-events', (req, res) => {
  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Create team and subscribe to ALL events
  const team = createTeam();
  
  const unsubscribe = team.subscribeToAllEvents((event) => {
    // Send ALL events to frontend for complete visibility
    res.write(`data: ${JSON.stringify({
      eventType: event.logType,
      orchestrationEvent: event.orchestrationEvent,
      taskStatus: event.taskStatus,
      agentStatus: event.agentStatus,
      workflowStatus: event.workflowStatus,
      metadata: event.metadata,
      timestamp: event.timestamp,
      task: event.task ? {
        id: event.task.id,
        title: event.task.title,
        status: event.task.status
      } : undefined,
      agent: event.agent ? {
        id: event.agent.id,
        name: event.agent.name,
        status: event.agent.status
      } : undefined
    })}\n\n`);
  });

  // Start workflow
  team.start({ input: req.query.input });

  // Cleanup on disconnect
  req.on('close', () => {
    unsubscribe();
    res.end();
  });
});
```

### Frontend Integration

```javascript
// Frontend client - Complete workflow monitoring
const eventSource = new EventSource('/workflow-events');

eventSource.onmessage = (event) => {
  const workflowEvent = JSON.parse(event.data);
  
  // Handle different event types
  switch(workflowEvent.eventType) {
    case 'OrchestrationStatusUpdate':
      handleOrchestrationEvent(workflowEvent);
      break;
    
    case 'TaskStatusUpdate':
      handleTaskEvent(workflowEvent);
      break;
    
    case 'AgentStatusUpdate':
      handleAgentEvent(workflowEvent);
      break;
    
    case 'WorkflowStatusUpdate':
      handleWorkflowEvent(workflowEvent);
      break;
  }
};

function handleOrchestrationEvent(event) {
  switch(event.orchestrationEvent) {
    case 'ACTIVATED':
      showPhase('🎯 Orchestration Planning...');
      break;
    case 'ANALYSIS_STARTED':
      showPhase('🔍 Analyzing Context...');
      break;
    case 'TASK_SELECTION':
      showPhase(`📋 Selected ${event.metadata.selectedTasksCount} tasks`);
      break;
    case 'COMPLETED':
      showPhase('✅ Orchestration Complete');
      break;
  }
}

function handleTaskEvent(event) {
  const taskInfo = `Task: ${event.task?.title || event.task?.id}`;
  
  switch(event.taskStatus) {
    case 'IN_PROGRESS':
      showPhase(`⚙️ ${taskInfo} - Starting...`);
      break;
    case 'DONE':
      showPhase(`✅ ${taskInfo} - Completed`);
      updateResults(event.metadata?.result);
      break;
    case 'BLOCKED':
      showPhase(`🚧 ${taskInfo} - Blocked`);
      break;
  }
}

function handleAgentEvent(event) {
  const agentInfo = `Agent: ${event.agent?.name}`;
  
  switch(event.agentStatus) {
    case 'THINKING':
      showPhase(`🤔 ${agentInfo} - Thinking...`);
      break;
    case 'ACTING':
      showPhase(`🎬 ${agentInfo} - Taking action...`);
      break;
    case 'DONE':
      showPhase(`✅ ${agentInfo} - Finished`);
      break;
  }
}

function handleWorkflowEvent(event) {
  switch(event.workflowStatus) {
    case 'RUNNING':
      showPhase('🚀 Workflow Started');
      break;
    case 'FINISHED':
      showPhase('🎉 Workflow Complete!');
      displayFinalResult(event.metadata?.result);
      break;
    case 'ERRORED':
      showPhase('❌ Workflow Error');
      showError(event.metadata?.message);
      break;
  }
}
```

## Event Types

### Event Categories

KaibanJS emits four main categories of events:

1. **Orchestration Events** (`OrchestrationStatusUpdate`) - Planning and task selection
2. **Task Events** (`TaskStatusUpdate`) - Task lifecycle and completion
3. **Agent Events** (`AgentStatusUpdate`) - Agent activities and tool usage
4. **Workflow Events** (`WorkflowStatusUpdate`) - Overall workflow status

### Orchestration Events

#### `ACTIVATED`
Orchestration has been activated and initialized.

```typescript
{
  orchestrationEvent: 'ACTIVATED',
  metadata: {
    projectGoal: string,
    mode: 'conservative' | 'adaptive' | 'innovative' | 'learning',
    existingTasksCount: number,
    availableTasksCount: number,
    preserveExistingTasks: boolean,
    allowTaskGeneration: boolean
  }
}
```

#### `DEACTIVATED`
Orchestration has been deactivated.

```typescript
{
  orchestrationEvent: 'DEACTIVATED',
  metadata: {
    message: string
  }
}
```

#### `ANALYSIS_STARTED`
Context analysis phase has begun.

```typescript
{
  orchestrationEvent: 'ANALYSIS_STARTED',
  metadata: {
    contextAnalysis: {
      activeTasks: number,
      availableAgents: number,
      projectProgress: number,
      projectPhase: string,
      workload: string,
      resourceAvailability: string,
      blockedTasks: number
    }
  }
}
```

### Task Management Events

#### `TASK_SELECTION`
Tasks have been selected for execution.

```typescript
{
  orchestrationEvent: 'TASK_SELECTION',
  metadata: {
    selectionStrategy: string,
    selectedTasksCount: number,
    skippedTasksCount: number,
    gapAnalysisPerformed: boolean,
    existingSkillsCovered: string[],
    newSkillsAdded: string[]
  }
}
```

#### `TASK_ADAPTATION`
A task is being adapted based on context.

```typescript
{
  orchestrationEvent: 'TASK_ADAPTATION',
  metadata: {
    taskDescription: string,
    adaptationLevel: 'minimal' | 'moderate' | 'significant',
    adaptationPermissions: {
      canModify: boolean,
      reason: string,
      allowedActions: string[]
    }
  }
}
```

#### `TASK_GENERATION`
New tasks are being generated.

```typescript
{
  orchestrationEvent: 'TASK_GENERATION',
  metadata: {
    generationMethod: string,
    gapsIdentified: Array<{
      category: string,
      description: string
    }>,
    tasksGenerated: number
  }
}
```

### Optimization Events

#### `OPTIMIZATION_STARTED`
Workflow optimization has begun.

```typescript
{
  orchestrationEvent: 'OPTIMIZATION_STARTED',
  metadata: {
    performanceIssues: string[],
    optimizationStrategy: string,
    targetMetrics: Record<string, any>
  }
}
```

### Completion Events

#### `COMPLETED`
Orchestration has completed successfully.

```typescript
{
  orchestrationEvent: 'COMPLETED',
  metadata: {
    totalDuration: number,
    results: {
      totalTasks: number,
      existingTasksPreserved: number,
      newTasksAdded: number,
      tasksGenerated: number,
      tasksAdapted: number
    },
    orchestrationStats: {
      llmCallsCount: number,
      fallbackOperations: number,
      gapAnalysisExecuted: boolean,
      performanceOptimizations: number
    }
  }
}
```

#### `ERROR`
An error occurred during orchestration.

```typescript
{
  orchestrationEvent: 'ERROR',
  metadata: {
    operationFailed: string,
    error: string,
    fallbackExecuted: boolean,
    partialResults?: {
      tasksProcessed: number
    }
  }
}
```

### Task Execution Events

#### Task Status Updates

```typescript
{
  logType: 'TaskStatusUpdate',
  taskStatus: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'AWAITING_VALIDATION',
  task: {
    id: string,
    title: string,
    description: string,
    status: string,
    agent: Agent
  },
  metadata: {
    message?: string,
    result?: TaskResult,
    duration?: number,
    llmUsageStats?: LLMUsageStats
  }
}
```

#### Task States
- **TODO**: Task is queued for execution
- **IN_PROGRESS**: Task is currently being worked on
- **DONE**: Task completed successfully
- **BLOCKED**: Task cannot proceed (awaiting input/validation)
- **AWAITING_VALIDATION**: Task needs human validation

### Agent Activity Events

#### Agent Status Updates

```typescript
{
  logType: 'AgentStatusUpdate',
  agentStatus: 'IDLE' | 'THINKING' | 'ACTING' | 'DONE' | 'BLOCKED',
  agent: {
    id: string,
    name: string,
    role: string,
    status: string
  },
  task: Task,
  metadata: {
    message?: string,
    iterations?: number,
    toolName?: string,
    toolInput?: string,
    toolResult?: ToolResult,
    output?: ThinkingResult
  }
}
```

#### Agent States
- **IDLE**: Agent is waiting for tasks
- **THINKING**: Agent is processing/reasoning
- **ACTING**: Agent is using tools or taking actions
- **DONE**: Agent completed its work
- **BLOCKED**: Agent needs input or assistance

### Workflow Status Events

#### Workflow Updates

```typescript
{
  logType: 'WorkflowStatusUpdate',
  workflowStatus: 'INITIAL' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'ERRORED' | 'BLOCKED',
  metadata: {
    message?: string,
    result?: WorkflowResult,
    duration?: number,
    teamName?: string,
    taskCount?: number,
    agentCount?: number
  }
}
```

#### Workflow States
- **INITIAL**: Workflow initialized but not started
- **RUNNING**: Workflow is actively executing
- **PAUSED**: Workflow temporarily suspended
- **FINISHED**: Workflow completed successfully
- **ERRORED**: Workflow encountered an error
- **BLOCKED**: Workflow blocked awaiting input

### Monitoring Events

#### `PERFORMANCE_MONITORING`
Performance metrics update.

```typescript
{
  orchestrationEvent: 'PERFORMANCE_MONITORING',
  metadata: {
    metrics: {
      taskCompletionRate: number,
      averageTaskDuration: number,
      agentUtilization: number,
      qualityScore: number,
      bottlenecksDetected: string[]
    },
    recommendations: string[]
  }
}
```

#### `TASK_COMPLETION_ANALYSIS`
Individual task completion tracking.

```typescript
{
  orchestrationEvent: 'TASK_COMPLETION_ANALYSIS',
  metadata: {
    completedTaskId: string,
    completedTaskTitle?: string,
    totalTasks: number,
    remainingTasks: number
  }
}
```

## Advanced Usage

### Filtering Events

```javascript
// Only process specific event types
team.subscribeToOrchestrationEvents((event) => {
  const relevantEvents = [
    'ACTIVATED', 
    'TASK_SELECTION', 
    'COMPLETED', 
    'ERROR'
  ];
  
  if (relevantEvents.includes(event.orchestrationEvent)) {
    processEvent(event);
  }
});
```

### Event Aggregation

```javascript
class OrchestrationMonitor {
  constructor(team) {
    this.events = [];
    this.startTime = null;
    
    this.unsubscribe = team.subscribeToOrchestrationEvents((event) => {
      this.events.push(event);
      
      if (event.orchestrationEvent === 'ACTIVATED') {
        this.startTime = event.timestamp;
      }
      
      if (event.orchestrationEvent === 'COMPLETED') {
        this.generateReport();
      }
    });
  }
  
  generateReport() {
    const duration = Date.now() - this.startTime;
    const taskEvents = this.events.filter(e => 
      e.orchestrationEvent.startsWith('TASK_')
    );
    
    console.log({
      totalDuration: duration,
      totalEvents: this.events.length,
      taskOperations: taskEvents.length
    });
  }
  
  cleanup() {
    this.unsubscribe();
  }
}
```

### Error Handling

```javascript
team.subscribeToOrchestrationEvents((event) => {
  try {
    if (event.orchestrationEvent === 'ERROR') {
      // Handle orchestration errors
      console.error('Orchestration error:', event.metadata.error);
      
      // Attempt recovery
      if (!event.metadata.fallbackExecuted) {
        initiateManualRecovery();
      }
    }
    
    // Process other events
    processEvent(event);
    
  } catch (error) {
    console.error('Event processing error:', error);
  }
});
```

## Best Practices

1. **Always Unsubscribe**: Clean up subscriptions when no longer needed to prevent memory leaks
2. **Handle Errors**: Implement error handling for both orchestration errors and event processing
3. **Filter Events**: Only process events relevant to your use case to optimize performance
4. **Batch Updates**: For UI updates, consider batching multiple events to reduce re-renders
5. **Monitor Performance**: Track event frequency and processing time for optimization

## Troubleshooting

### No Events Received

Ensure orchestration is enabled:
```javascript
const team = new Team({
  enableOrchestration: true, // Required
  llmConfig: { ... }         // Required
});
```

### Events Stop Unexpectedly

Check for unhandled errors in your callback:
```javascript
team.subscribeToOrchestrationEvents((event) => {
  try {
    // Your event handling code
  } catch (error) {
    console.error('Event handler error:', error);
  }
});
```

### Memory Leaks

Always store and call the unsubscribe function:
```javascript
const unsubscribe = team.subscribeToOrchestrationEvents(handler);

// When done
unsubscribe();
```

## Related Documentation

- [Orchestration Overview](./orchestration.md)
- [Team Configuration](./team-configuration.md)
- [Task Management](./task-management.md)