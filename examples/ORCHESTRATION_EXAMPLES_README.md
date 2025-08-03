# KaibanJS Orchestration Examples

This directory contains comprehensive industry-specific examples demonstrating the full capabilities of KaibanJS intelligent orchestration system.

## 🎯 Overview

Each example showcases:
- **All orchestration properties** from `ORCHESTRATION_PROPERTIES.md`
- **Industry-specific custom tools** extending agent capabilities
- **Real-world workflow scenarios** with authentic business logic
- **Input-driven orchestration** where context influences decisions
- **Runtime control demonstrations** showing dynamic adaptability

## 📚 Industry Examples

### 1. Healthcare - Hospital Operations (`01-healthcare-orchestration.js`)
- **Focus**: Patient care coordination with safety-critical workflows
- **Mode**: Conservative (safety-first approach)
- **Key Features**:
  - Custom tools: PatientRecordTool, DiagnosisAssistantTool
  - Skills-based workload distribution for medical specialties
  - External validation for critical procedures
  - Quality gates for protocol compliance
  - Emergency response handling

### 2. Finance - Investment Portfolio Management (`02-finance-orchestration.js`)
- **Focus**: Risk-aware portfolio optimization with regulatory compliance
- **Mode**: Adaptive (market-responsive)
- **Key Features**:
  - Custom tools: MarketAnalysisTool, RiskCalculatorTool
  - AI-driven task prioritization for market conditions
  - Dynamic task generation for opportunities
  - Compliance orchestration rules
  - Real-time market adaptation

### 3. Education - Online Course Development (`03-education-orchestration.js`)
- **Focus**: Adaptive learning content creation and optimization
- **Mode**: Learning (continuous improvement)
- **Key Features**:
  - Custom tools: CurriculumBuilderTool, LearningAnalyticsTool
  - Auto-split strategies for modular content
  - Merge-compatible tasks for integrated experiences
  - Student analytics-driven adaptation
  - Accessibility-first design

### 4. Retail/E-commerce - Inventory & Sales (`04-retail-orchestration.js`)
- **Focus**: High-volume operations with dynamic optimization
- **Mode**: Adaptive (quick market response)
- **Key Features**:
  - Custom tools: InventoryTrackerTool, PricingOptimizerTool
  - High concurrency (8 tasks) for peak periods
  - Availability-based workload distribution
  - Dynamic priority adjustments for trends
  - Seasonal orchestration strategies

## 🚀 Running the Examples

### Prerequisites
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OpenAI API key to .env file
```

### Run Individual Examples
```bash
# Healthcare example
node 01-healthcare-orchestration.js

# Finance example
node 02-finance-orchestration.js

# Education example
node 03-education-orchestration.js

# Retail example
node 04-retail-orchestration.js
```

### Run All Examples
```bash
# Using the index file
node orchestration-examples-index.js all

# View summary of all examples
node orchestration-examples-index.js summary
```

## 🔧 Custom Tools

All examples use industry-specific custom tools defined in `utils/customTools.js`:

### Healthcare Tools
- **PatientRecordTool**: Secure patient data access and updates
- **DiagnosisAssistantTool**: Medical diagnosis support

### Finance Tools
- **MarketAnalysisTool**: Market trend analysis and insights
- **RiskCalculatorTool**: Portfolio risk assessment

### Education Tools
- **CurriculumBuilderTool**: Course structure design
- **LearningAnalyticsTool**: Student performance analysis

### Retail Tools
- **InventoryTrackerTool**: Stock level management
- **PricingOptimizerTool**: Dynamic pricing optimization

## 📋 Key Orchestration Properties Demonstrated

### Team Configuration
- `enableOrchestration`: Always true for orchestration
- `continuousOrchestration`: Adaptive vs. initial-only modes
- `backlogTasks`: Industry-specific task repositories
- `allowTaskGeneration`: Dynamic task creation capability
- `orchestrationStrategy`: Detailed industry context and rules
- `mode`: conservative, adaptive, innovative, or learning
- `maxActiveTasks`: Concurrent task limits (5-8)
- `taskPrioritization`: static, dynamic, or ai-driven
- `workloadDistribution`: balanced, skills-based, or availability

### Task Properties
- `adaptable`: Whether tasks can be modified
- `dynamicPriority`: Priority can change at runtime
- `splitStrategy`: none, manual, or auto
- `mergeCompatible`: Tasks that can be combined
- `orchestrationRules`: Task-specific constraints
- `externalValidationRequired`: Approval needed
- `resourceRequirements`: Time, skills, dependencies
- `qualityGates`: Validation checkpoints

## 💡 Best Practices

1. **Industry Context**: Provide rich industry-specific inputs that influence orchestration decisions
2. **Clear Strategy**: Define comprehensive orchestrationStrategy with goals, constraints, and priorities
3. **Appropriate Mode**: Choose mode based on industry requirements (safety vs. innovation)
4. **Custom Tools**: Create tools that extend agent capabilities for domain tasks
5. **Quality Gates**: Implement validation points for critical operations
6. **Runtime Control**: Use dynamic updates to respond to changing conditions

## 🔄 Orchestration Workflow

1. **Initialization**: Team created with orchestration enabled
2. **Input Context**: Industry-specific inputs provided
3. **Strategy Application**: Orchestrator analyzes goals and constraints
4. **Task Selection**: Appropriate tasks chosen from backlog
5. **Agent Assignment**: Skills-based or availability-based distribution
6. **Execution**: Tasks run with monitoring and adaptation
7. **Continuous Improvement**: Learning from results (if enabled)

## 📊 Metrics and Monitoring

Each example demonstrates:
- `getOrchestrationMetrics()`: Performance and health metrics
- `generateDependencyGraph()`: Task relationship visualization
- Runtime updates based on conditions
- Error handling and recovery strategies

## 🎯 Use Cases

- **Healthcare**: Patient care coordination, staff scheduling, emergency response
- **Finance**: Portfolio management, risk assessment, compliance monitoring
- **Education**: Course development, student analytics, accessibility compliance
- **Retail**: Inventory optimization, dynamic pricing, customer service

## 🤝 Contributing

When adding new industry examples:
1. Follow the established pattern in existing examples
2. Create relevant custom tools in `utils/customTools.js`
3. Demonstrate all major orchestration properties
4. Include industry-specific inputs and context
5. Show runtime adaptability and error handling
6. Update this README with the new example

## 📝 License

These examples are part of the KaibanJS project and follow the same license terms.