/**
 * Example 14: Continuous vs Initial Orchestration Comparison
 *
 * This example provides a detailed performance and behavior comparison between
 * the two orchestration modes using the same project scenario.
 *
 * Features demonstrated:
 * - Performance metrics comparison
 * - Workflow efficiency analysis
 * - Task optimization differences
 * - Resource usage monitoring
 * - Quality outcome comparison
 * - Best-case scenarios for each mode
 *
 * This example includes simulated metrics to show the differences
 * without actually running full workflows (to save time and costs).
 */

require('dotenv').config();
const { Task, Team } = require('kaibanjs');

// Import agents and utilities
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  qaEngineer,
  devOpsEngineer,
} = require('./utils/agents');

// Simulated performance metrics helper
class OrchestrationMetrics {
  constructor(mode) {
    this.mode = mode;
    this.startTime = Date.now();
    this.llmCalls = 0;
    this.taskOptimizations = 0;
    this.tasksModified = 0;
    this.tasksGenerated = 0;
    this.tasksRemoved = 0;
  }

  logLLMCall() {
    this.llmCalls++;
  }

  logOptimization() {
    this.taskOptimizations++;
  }

  logTaskModification() {
    this.tasksModified++;
  }

  logTaskGeneration() {
    this.tasksGenerated++;
  }

  logTaskRemoval() {
    this.tasksRemoved++;
  }

  getReport() {
    const duration = Date.now() - this.startTime;
    return {
      mode: this.mode,
      duration,
      llmCalls: this.llmCalls,
      taskOptimizations: this.taskOptimizations,
      tasksModified: this.tasksModified,
      tasksGenerated: this.tasksGenerated,
      tasksRemoved: this.tasksRemoved,
      estimatedCost: this.llmCalls * 0.03, // Rough cost estimate
      adaptabilityScore:
        (this.taskOptimizations + this.tasksModified + this.tasksGenerated) /
        10,
    };
  }
}

async function runOrchestrationComparisonExample() {
  console.log('⚖️  KaibanJS Orchestration Mode Comparison\n');
  console.log(
    'Detailed analysis of Initial-Only vs Continuous orchestration modes.\n'
  );

  // Create a comprehensive task repository for e-commerce project
  const ecommerceTaskRepository = [
    new Task({
      description: 'Set up project infrastructure and CI/CD pipeline',
      expectedOutput: 'Complete DevOps setup with automated deployment',
      agent: devOpsEngineer,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['devops', 'cicd', 'infrastructure'],
        complexity: 'high',
      },
    }),
    new Task({
      description: 'Design and implement user authentication system',
      expectedOutput: 'Secure auth with JWT, OAuth, and role-based access',
      agent: backendDeveloper,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['backend', 'security', 'database'],
        complexity: 'high',
      },
    }),
    new Task({
      description: 'Create product catalog and inventory management',
      expectedOutput: 'Complete product management system with search',
      agent: backendDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['backend', 'database', 'api'],
        complexity: 'high',
      },
    }),
    new Task({
      description: 'Build responsive e-commerce UI with shopping cart',
      expectedOutput: 'Modern, mobile-first e-commerce interface',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: ['frontend', 'ui/ux', 'responsive'],
        complexity: 'high',
      },
    }),
    new Task({
      description: 'Implement payment processing and order management',
      expectedOutput: 'Secure payment system with order tracking',
      agent: backendDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['backend', 'payments', 'security'],
        complexity: 'high',
      },
    }),
    new Task({
      description: 'Create comprehensive test suite and QA automation',
      expectedOutput: 'Automated testing with >95% coverage',
      agent: qaEngineer,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['testing', 'automation', 'qa'],
        complexity: 'medium',
      },
    }),
    new Task({
      description: 'Implement admin dashboard and analytics',
      expectedOutput: 'Complete admin interface with business metrics',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['frontend', 'data-visualization', 'admin'],
        complexity: 'medium',
      },
    }),
  ];

  const projectGoal =
    'Build a complete e-commerce platform with modern architecture, security, and user experience';

  // Test both modes with the same configuration
  const baseConfig = {
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      qaEngineer,
      devOpsEngineer,
    ],
    tasks: [],
    enableOrchestration: true,
    availableTemplateTasks: ecommerceTaskRepository,
    allowTaskGeneration: true,
    orchestrationStrategy:
      'Focus on scalability, security, and user experience',
    mode: 'adaptive',
    maxActiveTasks: 4,
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxRetries: 2,
    },
  };

  // COMPARISON 1: Initial-Only Orchestration
  console.log('📊 TEST 1: Initial-Only Orchestration Analysis');
  console.log('='.repeat(60));

  const initialMetrics = new OrchestrationMetrics('Initial-Only');

  const initialTeam = new Team({
    ...baseConfig,
    name: 'E-commerce Initial-Only Team',
    continuousOrchestration: false,
  });

  try {
    console.log('🤖 Running initial-only orchestration...\n');

    initialMetrics.logLLMCall(); // Initial orchestration call
    const initialTasks = await initialTeam.activateOrchestration(projectGoal);

    console.log(
      `✅ Selected ${initialTasks.length} tasks for initial workflow:`
    );
    initialTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description}`);
    });

    // Simulate workflow characteristics
    console.log('\n📈 Initial-Only Mode Characteristics:');
    console.log('   • Fixed task sequence determined at start');
    console.log('   • No adaptation based on intermediate results');
    console.log('   • Predictable resource usage and timeline');
    console.log('   • Lower computational overhead');

    initialMetrics.logOptimization(); // Initial optimization only
  } catch (error) {
    console.error('❌ Initial-only orchestration failed:', error.message);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // COMPARISON 2: Continuous Orchestration
  console.log('📊 TEST 2: Continuous Orchestration Analysis');
  console.log('='.repeat(60));

  const continuousMetrics = new OrchestrationMetrics('Continuous');

  const continuousTeam = new Team({
    ...baseConfig,
    name: 'E-commerce Continuous Team',
    continuousOrchestration: true,
  });

  try {
    console.log('🤖 Running continuous orchestration...\n');

    continuousMetrics.logLLMCall(); // Initial orchestration call
    const continuousTasks = await continuousTeam.activateOrchestration(
      projectGoal
    );

    console.log(
      `✅ Selected ${continuousTasks.length} tasks for adaptive workflow:`
    );
    continuousTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description}`);
    });

    // Simulate continuous orchestration behavior
    console.log('\n🔄 Continuous Mode Characteristics:');
    console.log('   • Dynamic task adaptation after each completion');
    console.log('   • AI-driven workflow optimization throughout');
    console.log('   • Task generation based on intermediate results');
    console.log('   • Intelligent priority and dependency adjustment');

    // Simulate task completion analysis cycles
    const simulatedTaskCompletions = continuousTasks.length;
    for (let i = 0; i < simulatedTaskCompletions; i++) {
      continuousMetrics.logLLMCall(); // Task completion analysis
      continuousMetrics.logOptimization();

      // Simulate various orchestration decisions
      if (Math.random() > 0.7) continuousMetrics.logTaskGeneration();
      if (Math.random() > 0.6) continuousMetrics.logTaskModification();
      if (Math.random() > 0.9) continuousMetrics.logTaskRemoval();
    }
  } catch (error) {
    console.error('❌ Continuous orchestration failed:', error.message);
  }

  // PERFORMANCE COMPARISON
  console.log('\n' + '='.repeat(80));
  console.log('📊 DETAILED PERFORMANCE COMPARISON');
  console.log('='.repeat(80));

  const initialReport = initialMetrics.getReport();
  const continuousReport = continuousMetrics.getReport();

  // Performance metrics table
  console.log(`
┌─────────────────────────┬─────────────────────┬──────────────────────┬─────────────┐
│ Metric                  │ Initial-Only        │ Continuous           │ Difference  │
├─────────────────────────┼─────────────────────┼──────────────────────┼─────────────┤
│ LLM Calls               │ ${String(initialReport.llmCalls).padEnd(
    19
  )} │ ${String(continuousReport.llmCalls).padEnd(20)} │ +${
    continuousReport.llmCalls - initialReport.llmCalls
  }x         │
│ Task Optimizations      │ ${String(initialReport.taskOptimizations).padEnd(
    19
  )} │ ${String(continuousReport.taskOptimizations).padEnd(20)} │ +${
    continuousReport.taskOptimizations - initialReport.taskOptimizations
  }          │
│ Tasks Modified          │ ${String(initialReport.tasksModified).padEnd(
    19
  )} │ ${String(continuousReport.tasksModified).padEnd(20)} │ +${
    continuousReport.tasksModified - initialReport.tasksModified
  }          │
│ Tasks Generated         │ ${String(initialReport.tasksGenerated).padEnd(
    19
  )} │ ${String(continuousReport.tasksGenerated).padEnd(20)} │ +${
    continuousReport.tasksGenerated - initialReport.tasksGenerated
  }          │
│ Estimated Cost ($)      │ $${String(
    initialReport.estimatedCost.toFixed(2)
  ).padEnd(18)} │ $${String(continuousReport.estimatedCost.toFixed(2)).padEnd(
    19
  )} │ +${(
    ((continuousReport.estimatedCost - initialReport.estimatedCost) /
      initialReport.estimatedCost) *
    100
  ).toFixed(0)}%        │
│ Adaptability Score      │ ${String(
    initialReport.adaptabilityScore.toFixed(1)
  ).padEnd(19)} │ ${String(
    continuousReport.adaptabilityScore.toFixed(1)
  ).padEnd(20)} │ +${(
    continuousReport.adaptabilityScore - initialReport.adaptabilityScore
  ).toFixed(1)}        │
└─────────────────────────┴─────────────────────┴──────────────────────┴─────────────┘
  `);

  // SCENARIO ANALYSIS
  console.log('\n🎯 SCENARIO-BASED RECOMMENDATIONS:');
  console.log('\n1️⃣  STARTUP E-COMMERCE (Limited Budget):');
  console.log('   Recommendation: Initial-Only');
  console.log('   Reason: Lower costs, faster execution, predictable outcomes');
  console.log('   Best for: MVP development, known requirements');

  console.log('\n2️⃣  ENTERPRISE E-COMMERCE (Quality Focus):');
  console.log('   Recommendation: Continuous');
  console.log(
    '   Reason: Superior optimization, adaptive to complex requirements'
  );
  console.log('   Best for: Large-scale platforms, evolving features');

  console.log('\n3️⃣  MAINTENANCE & UPDATES:');
  console.log('   Recommendation: Initial-Only');
  console.log(
    '   Reason: Predictable changes, cost-effective for routine updates'
  );
  console.log('   Best for: Bug fixes, minor enhancements, batch updates');

  console.log('\n4️⃣  RESEARCH & PROTOTYPING:');
  console.log('   Recommendation: Continuous');
  console.log(
    '   Reason: Unknown requirements, need for exploration and adaptation'
  );
  console.log('   Best for: Innovation projects, experimental features');

  // QUALITY METRICS COMPARISON
  console.log('\n📈 QUALITY IMPACT ANALYSIS:');
  console.log('\n📋 Initial-Only Strengths:');
  console.log('   ✅ Consistent execution time');
  console.log('   ✅ Predictable resource usage');
  console.log('   ✅ Lower operational complexity');
  console.log('   ✅ Suitable for well-defined projects');
  console.log('   ✅ Cost-effective for standard workflows');

  console.log('\n🔄 Continuous Strengths:');
  console.log('   ✅ Superior task optimization');
  console.log('   ✅ Adaptive to changing requirements');
  console.log('   ✅ Intelligent task generation');
  console.log('   ✅ Better handling of complex dependencies');
  console.log('   ✅ Learning and improvement over time');

  // DECISION MATRIX
  console.log('\n🤔 DECISION MATRIX:');
  console.log('\nChoose Initial-Only if:');
  console.log('   • Budget constraints are primary concern');
  console.log('   • Requirements are well-defined and stable');
  console.log('   • Fast execution is critical');
  console.log('   • Team has limited LLM tokens');
  console.log('   • Working on maintenance or routine updates');

  console.log('\nChoose Continuous if:');
  console.log('   • Quality and optimization are top priorities');
  console.log('   • Requirements may evolve during development');
  console.log('   • Complex interdependencies between tasks');
  console.log('   • Budget allows for higher LLM usage');
  console.log('   • Working on innovative or exploratory projects');

  // HYBRID APPROACH
  console.log('\n🔄 HYBRID APPROACH SUGGESTION:');
  console.log('   Start with: Initial-Only for project setup');
  console.log('   Switch to: Continuous for complex development phases');
  console.log('   Return to: Initial-Only for final testing and deployment');
  console.log('   Implementation: team.setContinuousOrchestration(true/false)');

  console.log('\n⚖️  Orchestration Mode Comparison completed!');
  console.log(
    '\n💡 Key Takeaway: Choose the mode that best fits your project phase,'
  );
  console.log(
    '   budget constraints, and quality requirements. You can always switch!'
  );
}

// Run the example
if (require.main === module) {
  runOrchestrationComparisonExample()
    .then(() => {
      console.log('\n✅ Comparison analysis completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Comparison analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { runOrchestrationComparisonExample };
