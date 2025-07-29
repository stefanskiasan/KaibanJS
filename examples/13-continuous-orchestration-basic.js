/**
 * Example 13: Continuous Orchestration Basic
 *
 * This example demonstrates the difference between initial-only and continuous orchestration.
 * It shows:
 * - Side-by-side comparison of both orchestration modes
 * - How continuous orchestration adapts the workflow after each task
 * - Performance and behavior differences
 * - When to use each mode
 *
 * Key concepts:
 * - continuousOrchestration: false (initial-only)
 * - continuousOrchestration: true (continuous)
 * - Task completion analysis and workflow adaptation
 * - Performance trade-offs between modes
 */

require('dotenv').config();
const { Task, Team } = require('kaibanjs');

// Import agents and utilities
const {
  seniorDeveloper,
  frontendDeveloper,
  qaEngineer,
} = require('./utils/agents');

async function runContinuousOrchestrationBasicExample() {
  console.log('🔄 KaibanJS Continuous Orchestration Basic Example\n');
  console.log('Comparing initial-only vs continuous orchestration modes.\n');

  // Create a shared task repository for both teams
  const sharedTaskRepository = [
    new Task({
      description: 'Set up project structure and configuration',
      expectedOutput:
        'Complete project setup with proper folder structure and config files',
      agent: seniorDeveloper,
      adaptable: true,
      resourceRequirements: {
        estimatedTime: '1-2 hours',
        skillsRequired: ['setup', 'configuration'],
        dependencies: [],
      },
    }),
    new Task({
      description: 'Implement user authentication system',
      expectedOutput:
        'Secure authentication with JWT tokens and session management',
      agent: seniorDeveloper,
      adaptable: true,
      dynamicPriority: true,
      orchestrationRules:
        'High priority for security. Can be scaled based on complexity.',
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['backend', 'security', 'database'],
        dependencies: ['project_setup'],
      },
    }),
    new Task({
      description: 'Create responsive user interface',
      expectedOutput: 'Mobile-first responsive UI with modern design',
      agent: frontendDeveloper,
      adaptable: true,
      dynamicPriority: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['frontend', 'css', 'responsive_design'],
        dependencies: ['project_setup'],
      },
    }),
    new Task({
      description: 'Write comprehensive unit tests',
      expectedOutput: 'Complete test suite with >90% coverage',
      agent: qaEngineer,
      adaptable: true,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['testing', 'automation'],
        dependencies: ['authentication', 'ui_components'],
      },
    }),
    new Task({
      description: 'Implement API documentation',
      expectedOutput: 'Interactive API documentation with examples',
      agent: seniorDeveloper,
      adaptable: true,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['documentation', 'api'],
        dependencies: ['authentication'],
      },
    }),
  ];

  // SCENARIO 1: Initial-Only Orchestration (Traditional Mode)
  console.log('📋 Scenario 1: Initial-Only Orchestration');
  console.log('================================\n');

  const initialOnlyTeam = new Team({
    name: 'Initial-Only Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [], // Start empty - orchestrator will select tasks
    enableOrchestration: true,
    continuousOrchestration: false, // 🔑 Initial-only mode
    backlogTasks: sharedTaskRepository,
    allowTaskGeneration: false,
    orchestrationStrategy:
      'Build a secure web application with good user experience',
    mode: 'adaptive',
    maxActiveTasks: 3,
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxRetries: 2,
    },
  });

  try {
    console.log('🤖 Activating initial-only orchestration...\n');

    // Orchestrator runs once at the beginning
    const initialTasks = await initialOnlyTeam.activateOrchestration(
      'Create a minimal viable web application with authentication and basic UI'
    );

    console.log(
      `✅ Initial orchestration selected ${initialTasks.length} tasks:`
    );
    initialTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description.substring(0, 60)}...`);
    });
    console.log(
      '\n📊 Mode: Initial-only - No further orchestration after task completion\n'
    );

    // Note: In a real scenario, you would run team.start() here
    // We're skipping execution to focus on the orchestration differences
  } catch (error) {
    console.error('❌ Initial-only orchestration failed:', error.message);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // SCENARIO 2: Continuous Orchestration (New Enhanced Mode)
  console.log('🔄 Scenario 2: Continuous Orchestration');
  console.log('==============================\n');

  const continuousTeam = new Team({
    name: 'Continuous Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [], // Start empty - orchestrator will select tasks
    enableOrchestration: true,
    continuousOrchestration: true, // 🔑 Continuous mode
    backlogTasks: sharedTaskRepository,
    allowTaskGeneration: true, // Allow AI to generate new tasks
    orchestrationStrategy:
      'Build a secure web application with good user experience',
    mode: 'adaptive',
    maxActiveTasks: 3,
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxRetries: 2,
    },
  });

  try {
    console.log('🤖 Activating continuous orchestration...\n');

    // Orchestrator runs initially AND after each task completion
    const continuousTasks = await continuousTeam.activateOrchestration(
      'Create a minimal viable web application with authentication and basic UI'
    );

    console.log(
      `✅ Initial orchestration selected ${continuousTasks.length} tasks:`
    );
    continuousTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description.substring(0, 60)}...`);
    });
    console.log(
      '\n🔄 Mode: Continuous - AI will analyze and optimize after EACH task completion'
    );
    console.log('   • Can add new tasks based on results');
    console.log('   • Can modify existing tasks');
    console.log('   • Can adjust priorities dynamically');
    console.log('   • Can optimize resource allocation\n');

    // Note: In a real scenario, you would run team.start() here
    // The continuous orchestration would then run after each task completion
  } catch (error) {
    console.error('❌ Continuous orchestration failed:', error.message);
  }

  // Comparison Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 MODE COMPARISON SUMMARY');
  console.log('='.repeat(80));

  console.log(`
┌─────────────────────────┬─────────────────────┬──────────────────────┐
│ Feature                 │ Initial-Only        │ Continuous           │
├─────────────────────────┼─────────────────────┼──────────────────────┤
│ Orchestration Timing    │ Once at start       │ Start + after tasks  │
│ Task Adaptation         │ Static              │ Dynamic              │
│ Resource Usage          │ Lower               │ Higher (+40-60%)     │
│ Execution Speed         │ Faster              │ Slower (+15-25%)     │
│ Workflow Flexibility    │ Fixed               │ Adaptive             │
│ Task Generation         │ Initial only        │ Throughout workflow  │
│ Quality Optimization    │ Good                │ Excellent            │
│ Cost                    │ Lower               │ Higher               │
│ Best For                │ Known workflows     │ Dynamic projects     │
└─────────────────────────┴─────────────────────┴──────────────────────┘
  `);

  console.log('\n🎯 WHEN TO USE EACH MODE:');
  console.log('\n📋 Initial-Only (continuousOrchestration: false):');
  console.log('   ✅ Static workflows with known task sequences');
  console.log('   ✅ Performance-critical applications');
  console.log('   ✅ Budget-conscious projects (lower LLM costs)');
  console.log('   ✅ Batch processing scenarios');
  console.log('   ✅ Production environments with predictable tasks');

  console.log('\n🔄 Continuous (continuousOrchestration: true):');
  console.log('   ✅ Dynamic projects with evolving requirements');
  console.log('   ✅ Exploratory development and research');
  console.log('   ✅ Quality-critical projects needing optimization');
  console.log('   ✅ Complex workflows with interdependent tasks');
  console.log('   ✅ Learning systems that improve over time');

  console.log('\n💡 TIP: You can switch modes at runtime using:');
  console.log('   team.setContinuousOrchestration(true/false)');

  console.log('\n🔄 Continuous Orchestration Basic Example completed!');
}

// Run the example
if (require.main === module) {
  runContinuousOrchestrationBasicExample()
    .then(() => {
      console.log('\n✅ Example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { runContinuousOrchestrationBasicExample };
