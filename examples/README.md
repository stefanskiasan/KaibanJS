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
   # Run individual industry example
   node 01-healthcare-orchestration.js
   
   # Or use the index to see all examples
   node orchestration-examples-index.js summary
   ```

## 📚 Examples Overview

### Industry-Specific Orchestration Examples

#### [01-healthcare-orchestration.js](01-healthcare-orchestration.js)

**Healthcare - Hospital Operations**

- Patient care coordination with safety-critical workflows
- Conservative mode for medical safety
- Skills-based workload distribution for specialties
- Custom tools: PatientRecordTool, DiagnosisAssistantTool

**Key Features:**

- External validation for critical procedures
- Quality gates for protocol compliance
- Emergency response handling
- Continuous orchestration for patient care

#### [02-finance-orchestration.js](02-finance-orchestration.js)

**Finance - Investment Portfolio Management**

- Risk-aware portfolio optimization with compliance
- AI-driven task prioritization for market conditions
- Dynamic task generation for opportunities
- Custom tools: MarketAnalysisTool, RiskCalculatorTool

**Key Features:**

- Compliance orchestration rules
- Real-time market adaptation
- External validation for high-value transactions
- Security-focused orchestration

#### [03-education-orchestration.js](03-education-orchestration.js)

**Education - Online Course Development**

- Adaptive learning content creation
- Learning mode for continuous improvement
- Auto-split strategies for modular content
- Custom tools: CurriculumBuilderTool, LearningAnalyticsTool

**Key Features:**

- Student analytics-driven adaptation
- Merge-compatible tasks for integrated experiences
- Accessibility-first design
- Multi-language support planning

#### [04-retail-orchestration.js](04-retail-orchestration.js)

**Retail/E-commerce - Inventory & Sales Management**

- High-volume operations with dynamic optimization
- Availability-based workload distribution
- Dynamic priority adjustments for trends
- Custom tools: InventoryTrackerTool, PricingOptimizerTool

**Key Features:**

- High concurrency (8 tasks) for peak periods
- Seasonal orchestration strategies
- Real-time pricing optimization
- Customer experience focus

#### [orchestration-examples-index.js](orchestration-examples-index.js)

**Central Hub for All Industry Examples**

- Run all examples sequentially
- View summary of all industry examples
- Easy command-line interface
- Comprehensive overview of features

**Usage:**
```bash
node orchestration-examples-index.js [command]
# Commands: summary, all, healthcare, finance, education, retail
```

### Orchestration Mode Examples

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

### [utils/customTools.js](utils/customTools.js)

Industry-specific custom tools including:

- **Healthcare**: PatientRecordTool, DiagnosisAssistantTool
- **Finance**: MarketAnalysisTool, RiskCalculatorTool
- **Education**: CurriculumBuilderTool, LearningAnalyticsTool
- **Retail**: InventoryTrackerTool, PricingOptimizerTool
- **Manufacturing**: ProductionSchedulerTool, QualityInspectorTool
- **Legal**: DocumentAnalyzerTool, CaseTimelineTool
- **Marketing**: ContentGeneratorTool, AnalyticsDashboardTool
- **Construction**: BlueprintAnalyzerTool, SafetyComplianceTool

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

1. Explore industry examples:
   - [Healthcare](01-healthcare-orchestration.js) for safety-critical workflows
   - [Finance](02-finance-orchestration.js) for compliance and risk management
   - [Education](03-education-orchestration.js) for adaptive learning
   - [Retail](04-retail-orchestration.js) for high-volume operations
2. Try different orchestration modes (conservative, adaptive, innovative, learning)
3. Create custom tools for your industry using [customTools.js](utils/customTools.js) as reference
4. Build domain-specific task repositories
5. Customize orchestration strategies for your use case

## 📖 Additional Resources

- [Main KaibanJS Documentation](../README.md)
- [Orchestration Properties Reference](../ORCHESTRATION_PROPERTIES.md)
- [Orchestration Examples Guide](ORCHESTRATION_EXAMPLES_README.md)
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
