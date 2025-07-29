# KaibanJS Intelligent Orchestration Examples

This directory contains comprehensive examples demonstrating the intelligent orchestration features of KaibanJS. These examples show how to use AI-powered task management, adaptive workflows, and autonomous task generation to build sophisticated multi-agent systems.

## 🚀 Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment**

   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. **Run Examples**
   ```bash
   node 01-basic-orchestration.js
   ```

## 📚 Examples Overview

### All Examples (✅ Completed)

#### [01-basic-orchestration.js](01-basic-orchestration.js)

**Basic Orchestration Setup**

- Introduction to intelligent orchestration
- Enabling orchestration with `enableOrchestration: true`
- Setting up task repositories
- Using `activateOrchestration()` for AI task selection

**Key Concepts:**

- Task repositories with `backlogTasks`
- Orchestration strategies
- Dynamic task selection
- Team configuration basics

#### [02-conservative-mode.js](02-conservative-mode.js)

**Conservative Mode for Production**

- Risk-averse orchestration for critical systems
- Strict backlog task adherence
- No autonomous task generation
- Static prioritization

**Ideal For:**

- Production environments
- Regulated industries
- Critical systems
- Teams preferring predictability

#### [03-innovative-mode.js](03-innovative-mode.js)

**Innovative Mode for R&D**

- Creative task generation
- High adaptability
- Experimental approaches
- AI-driven exploration

**Ideal For:**

- Research & Development
- Startups
- Innovation labs
- Rapid prototyping

#### [05-skills-based-distribution.js](05-skills-based-distribution.js)

**Skills-Based Task Distribution**

- Intelligent matching of tasks to agent expertise
- Cross-functional team coordination
- Optimal resource utilization
- Workload balancing

**Key Features:**

- `workloadDistribution: 'skills-based'`
- Specialized agent teams
- Skill requirement matching
- Performance optimization

#### [09-task-generation.js](09-task-generation.js)

**Autonomous Task Generation**

- AI identifies workflow gaps
- Generates missing tasks automatically
- Context-aware task creation
- Comprehensive coverage

**Key Features:**

- `allowTaskGeneration: true`
- Gap analysis
- Dynamic workflow expansion
- Adaptive planning

#### [04-learning-mode.js](04-learning-mode.js)

**Learning Mode**

- Continuous improvement based on outcomes
- Pattern recognition and adaptation
- Knowledge accumulation across tasks
- Evolving strategies based on feedback

**Key Features:**

- `mode: 'learning'`
- Performance metric tracking
- Adaptive strategy updates
- Knowledge base building

#### [06-ai-driven-prioritization.js](06-ai-driven-prioritization.js)

**AI-Driven Task Prioritization**

- Dynamic task ordering based on context
- Multi-factor decision making
- Real-time priority adjustments
- Business goal alignment

**Key Features:**

- `taskPrioritization: 'ai-driven'`
- Dynamic re-prioritization
- Risk and value assessment
- Dependency optimization

#### [07-task-adaptation.js](07-task-adaptation.js)

**Task Adaptation**

- Runtime modification of tasks
- Context-aware adaptations
- Scope and resource adjustments
- Response to discoveries

**Key Features:**

- `adaptable: true` on tasks
- Dynamic requirement changes
- Scaling adaptations
- Constraint handling

#### [08-continuous-optimization.js](08-continuous-optimization.js)

**Continuous Optimization**

- Real-time workflow monitoring
- Performance bottleneck detection
- Automatic resource reallocation
- Efficiency improvements

**Key Features:**

- Performance metrics tracking
- Workload balancing
- Quality maintenance

#### [10-enterprise-setup.js](10-enterprise-setup.js)

**Enterprise Configuration**

- Large-scale team coordination
- Complex governance requirements
- Multi-environment workflows
- Compliance and security focus

**Ideal For:**

- Fortune 500 companies
- Regulated industries
- Global organizations
- Complex hierarchies

#### [11-e-commerce-project.js](11-e-commerce-project.js)

**E-Commerce Project**

- Complete online store example
- Product catalog to checkout
- Payment integration
- Mobile apps and analytics

**Features Built:**

- Product management
- Shopping cart
- Payment processing
- Order fulfillment
- Customer analytics

#### [12-microservices-architecture.js](12-microservices-architecture.js)

**Microservices Architecture**

- Service decomposition
- Inter-service communication
- Distributed system patterns
- Container orchestration

**Architecture Patterns:**

- API Gateway
- Service Discovery
- Event-driven communication
- Resilience patterns

## 🛠️ Utility Files

### [utils/agents.js](utils/agents.js)

Pre-configured agent definitions including:

- Development specialists (Frontend, Backend, Full-Stack)
- Technical experts (Security, DevOps, Data Architecture)
- Quality & Design professionals (QA, UX/UI)
- Business roles (Product Manager, Technical Writer)
- Innovation specialists (AI Researcher, Innovation Lead)
- Domain experts (Blockchain, Mobile)

### [utils/tasks.js](utils/tasks.js)

Reusable backlog tasks for:

- Authentication & Security
- Frontend & UI Development
- Backend & API Development
- Testing & Quality Assurance
- DevOps & Infrastructure
- Documentation
- Data & Analytics

## 🔑 Key Orchestration Properties

### Team Configuration

```javascript
const team = new Team({
  // Basic setup
  name: 'Team Name',
  agents: [agent1, agent2],
  tasks: [], // Can start empty

  // Orchestration features
  enableOrchestration: true, // Required to activate
  backlogTasks: taskRepository, // Backlog tasks for AI selection
  allowTaskGeneration: true, // Enable AI task creation
  orchestrationStrategy: '...', // Guide AI decisions

  // Orchestration modes
  mode: 'conservative', // or 'adaptive', 'innovative', 'learning'

  // Task management
  maxActiveTasks: 3,
  taskPrioritization: 'ai-driven', // or 'static', 'dynamic'
  workloadDistribution: 'skills-based', // or 'balanced', 'availability'

  // LLM configuration
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4o-mini', // or 'gpt-4o' for complex tasks
    temperature: 0.3,
    maxRetries: 2,
  },
});
```

### Task Configuration

```javascript
const task = new Task({
  description: 'Task description',
  expectedOutput: 'Expected deliverable',
  agent: agent, // or null for orchestrator to decide

  // Orchestration properties
  adaptable: true, // Allow runtime modifications
  dynamicPriority: true, // Allow priority adjustments
  splitStrategy: 'auto', // or 'manual', 'none'
  orchestrationRules: '...', // Constraints and guidelines

  // Resource requirements
  resourceRequirements: {
    estimatedTime: '4-6 hours',
    skillsRequired: ['skill1', 'skill2'],
    dependencies: ['other_task_id'],
  },
});
```

## 🎯 Orchestration Modes

### Conservative Mode

- **Risk Level:** Low
- **Task Generation:** Disabled
- **Adaptation:** Minimal
- **Use Cases:** Production, critical systems

### Adaptive Mode (Default)

- **Risk Level:** Medium
- **Task Generation:** Optional
- **Adaptation:** Moderate
- **Use Cases:** Most development projects

### Innovative Mode

- **Risk Level:** High
- **Task Generation:** Encouraged
- **Adaptation:** Extensive
- **Use Cases:** R&D, startups, prototypes

### Learning Mode

- **Risk Level:** High
- **Task Generation:** Enabled
- **Adaptation:** Continuous
- **Use Cases:** Experimental projects

## 💡 Best Practices

### 1. Environment Setup

- Use `gpt-4o-mini` for cost-effective testing
- Use `gpt-4o` for production or complex orchestration
- Adjust temperature based on needs (0.1-0.3 for consistency, 0.7-0.9 for creativity)

### 2. Task Repository Design

- Create reusable backlog tasks
- Include clear `resourceRequirements`
- Use `orchestrationRules` for constraints
- Mark critical tasks as `adaptable: false`

### 3. Agent Configuration

- Define clear expertise in agent backgrounds
- Use specialized agents for skills-based distribution
- Balance team composition

### 4. Orchestration Strategy

- Be specific about goals and constraints
- Include priorities and trade-offs
- Guide AI decision-making
- Update strategy as project evolves

### 5. Mode Selection

- Start with adaptive mode
- Use conservative for production
- Try innovative for new projects
- Enable learning for long-term improvement

## 🔍 Troubleshooting

### Common Issues

1. **"Orchestration is not enabled"**

   - Set `enableOrchestration: true` in team configuration

2. **"No tasks selected"**

   - Check `backlogTasks` has backlog tasks
   - Verify orchestration strategy is clear
   - Ensure agents match task requirements

3. **"Task generation not working"**

   - Set `allowTaskGeneration: true`
   - Use capable LLM model (gpt-4o recommended)
   - Provide comprehensive project goals

4. **"High API costs"**
   - Use `gpt-4o-mini` for development
   - Reduce LLM temperature
   - Limit `maxActiveTasks`

## 📊 Performance Tips

1. **Token Optimization**

   - Keep orchestration strategies concise
   - Use structured task descriptions
   - Batch operations when possible

2. **Parallel Execution**

   - Set appropriate `maxActiveTasks`
   - Use skills-based distribution
   - Minimize task dependencies

3. **Cost Management**
   - Monitor LLM usage
   - Use conservative mode for routine tasks
   - Cache orchestration decisions
   - Adjust adaptation intervals

## 🚀 Next Steps

1. Start with [01-basic-orchestration.js](01-basic-orchestration.js)
2. Try different modes based on your needs
3. Experiment with task generation
4. Build your own task repositories
5. Customize orchestration strategies

## 📖 Additional Resources

- [Main KaibanJS Documentation](../README.md)
- [Orchestration Properties Reference](../ORCHESTRATION_PROPERTIES.md)
- [API Documentation](../docs/api.md)
- [GitHub Repository](https://github.com/kaiban-ai/kaibanjs)

## 🤝 Contributing

We welcome contributions! Please:

1. Add new examples demonstrating unique features
2. Improve existing examples with better practices
3. Report issues or suggest enhancements
4. Share your orchestration strategies

## 📝 License

These examples are part of the KaibanJS project and follow the same license terms.
