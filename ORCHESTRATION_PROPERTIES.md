# KaibanJS Orchestration Properties - Complete Reference

This documentation explains all new properties for intelligent orchestration in KaibanJS in detail.

## 🏗️ Team Properties (ITeamParams)

### `enableOrchestration?: boolean`

**Default:** `false`  
**Type:** Boolean (optional)

**Description:**
The master control flag for all orchestration features. When `false` (default), the team behaves like normal KaibanJS without orchestration.

**Effect:**

- `true`: Enables all intelligent orchestration features
- `false`: Completely disables all orchestration features, normal KaibanJS functionality

**Example:**

```javascript
// Normal KaibanJS (previous behavior)
const normalTeam = new Team({
  name: 'Standard Team',
  agents: [agent1, agent2],
  tasks: [task1, task2, task3],
  // enableOrchestration: false (default)
});

// Intelligent orchestration enabled
const smartTeam = new Team({
  name: 'Smart Team',
  agents: [agent1, agent2],
  tasks: [],
  enableOrchestration: true, // REQUIRED for orchestration
  availableTemplateTasks: templateTasks,
});
```

**Important:** Without this flag, all other orchestration properties are ignored and orchestration methods show warnings or throw errors.

---

### `continuousOrchestration?: boolean`

**Default:** `false`  
**Type:** Boolean (optional)

**Description:**
Controls when orchestration runs during workflow execution. Provides granular control over orchestration timing.

**Effect:**

- **`false`** (default): Orchestration runs only once at the beginning via `activateOrchestration()`
- **`true`**: Orchestration runs at the beginning AND after each task completion for continuous optimization

**Example:**

```javascript
// Initial-only orchestration
const initialOnlyTeam = new Team({
  enableOrchestration: true,
  continuousOrchestration: false, // Default
  availableTemplateTasks: [...],
  // ... other configuration
});

// Continuous orchestration after each task
const continuousTeam = new Team({
  enableOrchestration: true,
  continuousOrchestration: true, // Enables continuous orchestration
  availableTemplateTasks: [...],
  // ... other configuration
});

// Runtime configuration possible
team.setContinuousOrchestration(true); // Enables continuous orchestration
team.setContinuousOrchestration(false); // Disables to initial-only orchestration
```

**Notes:**

- Requires `enableOrchestration: true` to function
- When `false`: Orchestrator analyzes only at the beginning and optimizes the entire workflow once
- When `true`: Orchestrator analyzes after each task completion and can dynamically modify, add or remove tasks
- Can be changed at runtime via `team.setContinuousOrchestration(enabled)`

#### **🎯 Use Cases and Best Practices**

**When to use `continuousOrchestration: false`:**

- **Static workflows**: Known, unchangeable task sequences
- **Performance-critical applications**: Minimal LLM calls for optimal speed
- **Batch processing**: Large amounts of similar tasks without adaptation needs
- **Cost optimization**: Reduced LLM token usage for budget-conscious projects
- **Deterministic workflows**: When predictability is more important than flexibility

**When to use `continuousOrchestration: true`:**

- **Dynamic projects**: Evolving requirements and unknown complexity
- **Exploratory development**: Research projects with changing goals
- **Adaptive workflows**: Tasks heavily depend on previous results
- **Quality-critical projects**: Continuous optimization is more important than speed
- **Learning systems**: Workflows should improve based on experience

**Performance considerations:**

- **Token consumption**: Continuous mode uses ~40-60% more LLM tokens
- **Execution time**: +15-25% longer workflows due to analysis overhead
- **Quality gain**: ~30-50% better task optimization and adaptation
- **Cost-benefit**: Higher LLM costs vs. better project outcomes

---

### `availableTemplateTasks?: Task[]`

**Default:** `[]`  
**Type:** Array of Task objects (optional)

**Description:**
Repository of template tasks that the orchestrator can select, adapt and instantiate.

**Effect:**

- Provides the orchestrator with a library of available tasks
- Tasks with `template: true` are ideal for this repository
- Orchestrator can select these tasks based on project goals

**Example:**

```javascript
const templateTasks = [
  new Task({
    description: 'Implement user authentication',
    expectedOutput: 'Complete auth system',
    agent: developer,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '4-6 hours',
      skillsRequired: ['backend', 'security'],
      dependencies: ['database_setup'],
    },
  }),
  new Task({
    description: 'Create responsive UI components',
    expectedOutput: 'Mobile-first UI components',
    agent: designer,
    adaptable: true,
    template: true,
  }),
];

const team = new Team({
  name: 'Development Team',
  agents: [developer, designer],
  tasks: [],
  enableOrchestration: true,
  availableTemplateTasks: templateTasks, // Task repository
});
```

**Best Practice:** Create reusable template tasks with clear descriptions and resource requirements.

---

### `allowTaskGeneration?: boolean`

**Default:** `false`  
**Type:** Boolean (optional)

**Description:**
Allows the orchestrator to autonomously create new tasks when gaps in the workflow are identified.

**Effect:**

- `true`: Orchestrator can generate new tasks based on project goals
- `false`: Orchestrator can only select from `availableTemplateTasks`

**Example:**

```javascript
const team = new Team({
  name: 'Innovative Team',
  agents: [developer, tester],
  tasks: [],
  enableOrchestration: true,
  availableTemplateTasks: basicTasks,
  allowTaskGeneration: true, // Allows autonomous task creation
  orchestrationStrategy: 'Build a secure web application with modern UI',
});

// The orchestrator could automatically create new tasks like:
// - "Implement API Rate Limiting" (security gap detected)
// - "Create E2E Tests" (testing gap identified)
```

**Use cases:**

- Exploratory projects with unclear requirements
- Adaptive workflows that should evolve
- Teams with high LLM competency

**Caution:** Can lead to unexpected tasks. Use clear `orchestrationStrategy`.

---

### `orchestrationStrategy?: string`

**Default:** `undefined`  
**Type:** String (optional)

**Description:**
Detailed instructions for the LLM-based orchestrator about priorities, working methods and goals.

**Effect:**

- Guides orchestrator decisions in task selection and adaptation
- Influences task generation and prioritization
- Used as context in all LLM prompts

**Example:**

```javascript
const team = new Team({
  name: 'E-Commerce Team',
  agents: [developer, designer, tester],
  tasks: [],
  enableOrchestration: true,
  availableTemplateTasks: ecommerceTasks,
  allowTaskGeneration: true,
  orchestrationStrategy: `
    You are an intelligent orchestrator for an e-commerce development team.
    
    PRIORITIES:
    1. Deliver high-quality software on time
    2. Maintain code quality >85%
    3. Implement mobile-first design
    4. Prioritize security and performance
    
    WORKING METHOD:
    - Prefer proven technologies
    - Implement comprehensive tests
    - Optimize for SEO and conversion
    
    CONSTRAINTS:
    - No experimental frameworks
    - Budget: max 200 developer hours
    - Deadline: 6 weeks
  `,
});
```

**Best Practice:** Be specific about goals, constraints and priorities.

---

### `mode?: 'conservative' | 'adaptive' | 'innovative' | 'learning'`

**Default:** `'adaptive'`  
**Type:** Enum (optional)

**Description:**
Defines the behavior and risk tolerance of the orchestrator.

**Modes in detail:**

#### `'conservative'`

- **Characteristic:** Cautious task selection, strict template adherence
- **Risk tolerance:** Minimal
- **Task adaptation:** Limited, only safety-critical changes
- **Generation:** Very conservative with new tasks
- **Ideal for:** Production environments, critical systems, regulated industries

#### `'adaptive'`

- **Characteristic:** Balanced approach, moderate task adaptation
- **Risk tolerance:** Medium
- **Task adaptation:** Responsive to context changes
- **Generation:** Moderate new task creation
- **Ideal for:** Most development projects, established teams

#### `'innovative'`

- **Characteristic:** Creative task generation, experimental approaches
- **Risk tolerance:** High
- **Task adaptation:** Extensive adaptations based on goals
- **Generation:** Proactive new task creation
- **Ideal for:** Research & development, startups, new technologies

#### `'learning'`

- **Characteristic:** Continuous improvement, learning from results
- **Risk tolerance:** High
- **Task adaptation:** Evolving strategies based on outcomes
- **Generation:** Experimental tasks for learning purposes
- **Ideal for:** Prototyping, skill development, innovation projects

**Example:**

```javascript
// Conservative team for critical infrastructure
const criticalTeam = new Team({
  name: 'Infrastructure Team',
  agents: [sysAdmin, securityExpert],
  tasks: [],
  enableOrchestration: true,
  mode: 'conservative',
  availableTemplateTasks: securityTasks,
});

// Innovative team for new features
const innovationTeam = new Team({
  name: 'Innovation Lab',
  agents: [researcher, prototyper],
  tasks: [],
  enableOrchestration: true,
  mode: 'innovative',
  allowTaskGeneration: true,
});
```

---

### `maxActiveTasks?: number`

**Default:** `5`  
**Type:** Number (optional)

**Description:**
Limits the maximum number of tasks that can be active simultaneously.

**Effect:**

- Prevents team overload
- Controls workflow parallelism
- Influences orchestrator task selection

**Example:**

```javascript
// Small team with limited capacity
const smallTeam = new Team({
  name: 'Startup Team',
  agents: [fullStackDev],
  tasks: [],
  enableOrchestration: true,
  maxActiveTasks: 2, // Only 2 tasks simultaneously
  availableTemplateTasks: startupTasks,
});

// Large team with high parallelism
const enterpriseTeam = new Team({
  name: 'Enterprise Team',
  agents: [dev1, dev2, dev3, tester1, tester2],
  tasks: [],
  enableOrchestration: true,
  maxActiveTasks: 8, // Up to 8 parallel tasks
  availableTemplateTasks: enterpriseTasks,
});
```

**Recommendation:**

- 1-2 tasks per agent as guideline
- Consider task complexity and dependencies

---

### `taskPrioritization?: 'static' | 'dynamic' | 'ai-driven'`

**Default:** `'dynamic'`  
**Type:** Enum (optional)

**Description:**
Determines how tasks are prioritized.

**Strategies in detail:**

#### `'static'`

- **Behavior:** Fixed priority order based on dependencies
- **Adaptation:** No changes during execution
- **Ideal for:** Predictable workflows, fixed plans

#### `'dynamic'`

- **Behavior:** Priority adjustments based on project phase and context
- **Adaptation:** Moderate adjustments based on project progress
- **Ideal for:** Most development projects

#### `'ai-driven'`

- **Behavior:** LLM-based priority optimization based on project goals
- **Adaptation:** Continuous re-evaluation by AI
- **Ideal for:** Complex projects, adaptive workflows

**Example:**

```javascript
const team = new Team({
  name: 'AI-Optimized Team',
  agents: [developer, designer, tester],
  tasks: [],
  enableOrchestration: true,
  taskPrioritization: 'ai-driven', // AI decides priorities
  orchestrationStrategy: 'Optimize for time-to-market and quality',
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4o',
  },
});
```

---

### `workloadDistribution?: 'balanced' | 'skills-based' | 'availability'`

**Default:** `'balanced'`  
**Type:** Enum (optional)

**Description:**
Controls how tasks are distributed among available agents.

**Distribution strategies:**

#### `'balanced'`

- **Behavior:** Even distribution across all available agents
- **Goal:** Balanced workload
- **Ideal for:** Teams with similar skills

#### `'skills-based'`

- **Behavior:** Optimal assignment of tasks to agent skills
- **Goal:** Maximum efficiency through expertise matching
- **Ideal for:** Specialized teams, complex projects

#### `'availability'`

- **Behavior:** Priority for agents with lower current workload
- **Goal:** Fast task processing
- **Ideal for:** Time-critical projects

**Example:**

```javascript
// Skills-based distribution for specialized team
const specializedTeam = new Team({
  name: 'Specialized Development Team',
  agents: [
    frontendExpert, // UI/UX specialist
    backendExpert, // APIs/Database specialist
    securityExpert, // Security specialist
    devopsExpert, // Deployment specialist
  ],
  tasks: [],
  enableOrchestration: true,
  workloadDistribution: 'skills-based', // Matching by expertise
  availableTemplateTasks: specializedTasks,
});
```

---

### `adaptationInterval?: number`

**Default:** `300000` (5 minutes)  
**Type:** Number in milliseconds (optional)

**Description:**
Defines how often the orchestrator checks workflow performance and makes optimizations.

**Effect:**

- More frequent intervals = More responsive adaptations, higher LLM costs
- Longer intervals = More stable execution, lower costs

**Example:**

```javascript
// High-frequency optimization for critical projects
const criticalProject = new Team({
  name: 'Critical Launch Team',
  agents: [developer, tester, manager],
  tasks: [],
  enableOrchestration: true,
  adaptationInterval: 60000, // Every minute (60 seconds)
  availableTemplateTasks: criticalTasks,
});

// Infrequent optimization for stable projects
const stableProject = new Team({
  name: 'Maintenance Team',
  agents: [developer],
  tasks: [],
  enableOrchestration: true,
  adaptationInterval: 1800000, // Every 30 minutes
  availableTemplateTasks: maintenanceTasks,
});
```

**Recommendation:**

- Development: 5-15 minutes
- Production: 30-60 minutes
- Critical systems: 1-5 minutes

---

### `llmConfig?: LLMConfig`

**Default:** `undefined`  
**Type:** LLMConfig object (optional)

**Description:**
Team-specific LLM configuration for orchestration decisions.

**Effect:**

- Enables separate LLM for orchestration (independent of agent LLMs)
- Supports all KaibanJS LLM providers

**Example:**

```javascript
const team = new Team({
  name: 'AI-Powered Team',
  agents: [developer, tester], // Can use other LLMs
  tasks: [],
  enableOrchestration: true,
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4o', // Powerful model for orchestration
    temperature: 0.2, // Low temperature for consistent decisions
    maxRetries: 3,
  },
  availableTemplateTasks: complexTasks,
});
```

---

### `llmInstance?: LangChainChatModel`

**Default:** `undefined`  
**Type:** LangChain ChatModel (optional)

**Description:**
Pre-configured LLM instance for advanced control over orchestration LLM.

**Example:**

```javascript
import { ChatOpenAI } from 'langchain/chat_models/openai';

const customLLM = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.1,
  maxTokens: 2000,
  // Advanced configuration...
});

const team = new Team({
  name: 'Custom LLM Team',
  agents: [developer],
  tasks: [],
  enableOrchestration: true,
  llmInstance: customLLM, // Pre-configured instance
  availableTemplateTasks: tasks,
});
```

---

## 🎯 Task Properties (ITaskParams)

### `adaptable?: boolean`

**Default:** `false`  
**Type:** Boolean (optional)

**Description:**
Allows the orchestrator to modify this task at runtime.

**Effect:**

- `true`: Task can be adapted (description, agent, scope)
- `false`: Task is immutable

**Example:**

```javascript
// Adaptable task for flexible requirements
const flexibleTask = new Task({
  description: 'Implement user authentication',
  expectedOutput: 'Auth system',
  agent: developer,
  adaptable: true, // Can be adapted
  orchestrationRules: 'Can be adapted for OAuth, JWT or session-based',
});

// Critical immutable task
const criticalTask = new Task({
  description: 'Perform security audit',
  expectedOutput: 'Audit report',
  agent: securityExpert,
  adaptable: false, // NOT changeable
  orchestrationRules: 'CRITICAL - No modifications allowed',
});
```

---

### `orchestrationRules?: string`

**Default:** `undefined`  
**Type:** String (optional)

**Description:**
Specific rules and constraints for this task that the orchestrator must observe.

**Example:**

```javascript
const task = new Task({
  description: 'Implement payment system',
  expectedOutput: 'Secure payment system',
  agent: developer,
  adaptable: true,
  orchestrationRules: `
    SECURITY RULES:
    - PCI DSS compliance required
    - No credit card data stored locally
    - End-to-end encryption mandatory
    
    ADAPTATION OPTIONS:
    - Provider can be chosen (Stripe, PayPal)
    - Currency support adaptable
    - Mobile payment optional
    
    CONSTRAINTS:
    - No experimental payment APIs
    - Security team audit required
  `,
});
```

---

### `dynamicPriority?: boolean`

**Default:** `false`  
**Type:** Boolean (optional)

**Description:**
Allows the orchestrator to dynamically adjust the priority of this task.

**Example:**

```javascript
const adaptiveTask = new Task({
  description: 'Optimize database performance',
  expectedOutput: 'Improved DB performance',
  agent: dba,
  dynamicPriority: true, // Priority can change
  orchestrationRules: 'Priority increases when performance issues occur',
});
```

---

### `splitStrategy?: 'none' | 'manual' | 'auto'`

**Default:** `'none'`  
**Type:** Enum (optional)

**Description:**
Defines whether and how a task can be split into smaller tasks.

**Strategies:**

- `'none'`: Task remains unsplit
- `'manual'`: Splitting only on explicit request
- `'auto'`: Orchestrator can automatically split

**Example:**

```javascript
const complexTask = new Task({
  description: 'Create complete e-commerce platform',
  expectedOutput: 'Functional e-commerce website',
  agent: developer,
  splitStrategy: 'auto', // Can be automatically split
  orchestrationRules: 'Split into: Frontend, Backend, Payment, Admin Panel',
});
```

---

### `mergeCompatible?: string[]`

**Default:** `[]`  
**Type:** Array of task IDs (optional)

**Description:**
List of task IDs that this task can be merged with.

**Example:**

```javascript
const uiTask = new Task({
  description: 'Create login UI',
  expectedOutput: 'Login interface',
  agent: frontendDev,
  mergeCompatible: ['register-ui-task', 'profile-ui-task'], // Compatible UI tasks
});
```

---

### `resourceRequirements?: object`

**Default:** `undefined`  
**Type:** Object (optional)

**Description:**
Detailed information about required resources for this task.

**Structure:**

```typescript
{
  estimatedTime?: string;      // Estimated processing time
  skillsRequired?: string[];   // Required skills
  dependencies?: string[];     // Task dependencies
}
```

**Example:**

```javascript
const complexTask = new Task({
  description: 'Implement microservice architecture',
  expectedOutput: 'Microservice system',
  agent: architect,
  resourceRequirements: {
    estimatedTime: '2-3 weeks',
    skillsRequired: [
      'microservices',
      'docker',
      'kubernetes',
      'api_design',
      'system_architecture',
    ],
    dependencies: [
      'database_design',
      'infrastructure_setup',
      'security_framework',
    ],
  },
});
```

---

### `template?: boolean`

**Default:** `false`  
**Type:** Boolean (optional)

**Description:**
Marks the task as a reusable template for the `availableTemplateTasks` repository.

**Example:**

```javascript
const templateTask = new Task({
  description: 'Implement CRUD operations for {entity}',
  expectedOutput: 'Complete CRUD API for {entity}',
  agent: backendDev,
  template: true, // Reusable template
  adaptable: true, // Can be adapted for different entities
  resourceRequirements: {
    estimatedTime: '1-2 days',
    skillsRequired: ['backend', 'database', 'api_design'],
  },
});
```

---

## 💡 Property Interactions and Best Practices

### Recommended Combinations

#### Conservative Setup

```javascript
const conservativeTeam = new Team({
  name: 'Production Team',
  agents: [seniorDev, tester],
  tasks: [],
  enableOrchestration: true,
  mode: 'conservative',
  taskPrioritization: 'static',
  workloadDistribution: 'balanced',
  maxActiveTasks: 3,
  allowTaskGeneration: false,
});
```

#### Innovative Setup

```javascript
const innovativeTeam = new Team({
  name: 'R&D Team',
  agents: [researcher, prototyper],
  tasks: [],
  enableOrchestration: true,
  mode: 'innovative',
  taskPrioritization: 'ai-driven',
  workloadDistribution: 'skills-based',
  maxActiveTasks: 5,
  allowTaskGeneration: true,
  adaptationInterval: 120000,
});
```

### Common Use Cases

1. **Agile Development:** `mode: 'adaptive'`, `taskPrioritization: 'dynamic'`
2. **Critical Systems:** `mode: 'conservative'`, `allowTaskGeneration: false`
3. **Research:** `mode: 'learning'`, `allowTaskGeneration: true`
4. **Maintenance:** Longer `adaptationInterval`, `mode: 'conservative'`

### Troubleshooting

**Problem:** Orchestration not working  
**Solution:** Check if `enableOrchestration: true` is set

**Problem:** Too many tasks generated  
**Solution:** Set `allowTaskGeneration: false` or clarify `orchestrationStrategy`

**Problem:** Poor task assignment  
**Solution:** Switch to `workloadDistribution: 'skills-based'`

**Problem:** High LLM costs  
**Solution:** Set `continuousOrchestration: false` and use `mode: 'conservative'`

**Problem:** Workflow too slow  
**Solution:** Set `continuousOrchestration: false` for static task sequences

**Problem:** Tasks not optimally adapted  
**Solution:** Enable `continuousOrchestration: true` for dynamic optimization

## 🚀 Migration Guide

### From Version 0.21.x to 0.22.x

#### Minimal Breaking Changes

```javascript
// Old version (still works)
const team = new Team({
  enableOrchestration: true,
  availableTasks: templateTasks, // ⚠️ Deprecated
});

// New version (Recommended)
const team = new Team({
  enableOrchestration: true,
  continuousOrchestration: false, // New parameter (optional)
  availableTemplateTasks: templateTasks, // Renamed for clarity
});
```

#### Step-by-step Migration

1. **Step 1**: Leave existing code unchanged (backward compatible)
2. **Step 2**: Rename `availableTasks` → `availableTemplateTasks`
3. **Step 3**: Explicitly set `continuousOrchestration: false` (match previous behavior)
4. **Step 4**: Test with `continuousOrchestration: true` for better optimization

#### Performance Comparison

| Feature            | Initial-Only | Continuous      |
| ------------------ | ------------ | --------------- |
| LLM tokens         | Baseline     | +40-60%         |
| Execution time     | Baseline     | +15-25%         |
| Task optimization  | One-time     | After each task |
| Adaptability       | Static       | Dynamic         |
| Cost               | Low          | Medium-High     |
| Quality            | Good         | Very good       |

## 📊 Best Practices Summary

### For Beginners

```javascript
// Simple start - initial orchestration only
const beginnerTeam = new Team({
  enableOrchestration: true,
  continuousOrchestration: false, // Simpler and cheaper
  mode: 'conservative',
  availableTemplateTasks: basicTasks,
});
```

### For Advanced Users

```javascript
// Balanced approach - adaptive orchestration
const advancedTeam = new Team({
  enableOrchestration: true,
  continuousOrchestration: true, // Better optimization
  mode: 'adaptive',
  taskPrioritization: 'ai-driven',
  availableTemplateTasks: complexTasks,
});
```

### For Experts

```javascript
// Full control - maximum flexibility
const expertTeam = new Team({
  enableOrchestration: true,
  continuousOrchestration: true,
  mode: 'innovative',
  allowTaskGeneration: true,
  taskPrioritization: 'ai-driven',
  workloadDistribution: 'skills-based',
  adaptationInterval: 60000, // Frequent optimization
  availableTemplateTasks: expertTasks,
});

// Runtime adjustment based on project phase
if (projectPhase === 'exploration') {
  expertTeam.setContinuousOrchestration(true);
} else if (projectPhase === 'production') {
  expertTeam.setContinuousOrchestration(false);
}
```