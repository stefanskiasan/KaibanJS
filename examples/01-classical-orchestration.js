/**
 * Example 01: Classical Orchestration
 *
 * This example demonstrates the classical KaibanJS workflow with intelligent orchestration.
 * It shows how to:
 * - Enable orchestration with enableOrchestration: true
 * - Set up a task repository with availableTemplateTasks
 * - Use team.start() for automatic orchestration and execution
 *
 * Key difference from activateOrchestration() approach:
 * - No explicit orchestration call needed
 * - Orchestrator automatically selects tasks during team.start()
 * - Simpler, more intuitive workflow
 *
 * Requirements:
 * - OpenAI API key in .env file
 * - npm install dotenv (if not already installed)
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');

// Import pre-defined agents and tasks from utils
const {
  seniorDeveloper,
  frontendDeveloper,
  qaEngineer,
} = require('./utils/agents');
const {
  implementAuthenticationTask,
  createResponsiveUITask,
  writeUnitTestsTask,
  implementCrudApiTask,
} = require('./utils/tasks');
const {
  validateWorkflowResult,
  printValidationReport,
} = require('./utils/workflowValidator');

async function runClassicalOrchestrationExample() {
  console.log('🚀 KaibanJS Classical Orchestration Example\n');
  console.log(
    'This example shows the classical KaibanJS workflow with automatic orchestration.\n'
  );

  // Step 1: Create a task repository
  // These are template tasks that the orchestrator can choose from automatically
  const taskRepository = [
    // Use predefined tasks from utils
    implementAuthenticationTask,
    createResponsiveUITask,
    writeUnitTestsTask,
    implementCrudApiTask,

    // Create custom tasks for this example
    new Task({
      description: 'Set up project structure and dependencies',
      expectedOutput:
        'Complete project setup with folder structure and npm packages',
      agent: seniorDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '1-2 hours',
        skillsRequired: ['project_setup', 'npm', 'architecture'],
        dependencies: [],
      },
    }),

    new Task({
      description: 'Configure development environment',
      expectedOutput:
        'Development environment with linting, formatting, and git hooks',
      agent: seniorDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '1-2 hours',
        skillsRequired: ['devops', 'tooling'],
        dependencies: ['project_structure'],
      },
    }),
  ];

  console.log(
    `📚 Task Repository contains ${taskRepository.length} template tasks\n`
  );

  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });

  // Step 2: Create a team with orchestration enabled
  const team = new Team({
    name: 'Classical Development Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [], // Start with no tasks - orchestrator will select them automatically

    // IMPORTANT: Enable orchestration for automatic task selection
    enableOrchestration: true,

    // Use initial-only orchestration for predictable classical workflow
    continuousOrchestration: false,

    // Provide the task repository for automatic selection
    availableTemplateTasks: taskRepository,

    // Don't allow new task generation in this classical example
    allowTaskGeneration: false,

    // Provide a clear strategy for the orchestrator
    orchestrationStrategy: `
      You are orchestrating a new web application project using classical workflow.
      
      GOALS:
      1. Set up a solid foundation for development
      2. Implement core features with authentication
      3. Ensure code quality with testing
      
      CONSTRAINTS:
      - Focus on essential features first
      - Ensure each feature has tests
      - Maximum 4 tasks for this sprint
      
      PRIORITIES:
      1. Project setup and structure
      2. Authentication (security first)
      3. Basic UI components
      4. Testing coverage
      
      CLASSICAL APPROACH:
      - Select optimal tasks automatically during execution
      - Follow traditional software development lifecycle
      - Maintain predictable workflow patterns
    `,

    // Use adaptive mode (balanced approach)
    mode: 'adaptive',

    // Limit concurrent tasks
    maxActiveTasks: 2,

    // Use dynamic prioritization
    taskPrioritization: 'dynamic',

    // Balance workload across agents
    workloadDistribution: 'balanced',

    // Provide LLM instance for orchestration
    llmInstance: orchestrationLLM,
  });

  console.log('✅ Team created with classical orchestration enabled\n');
  console.log('Team Configuration:');
  console.log(
    `- Agents: ${[seniorDeveloper, frontendDeveloper, qaEngineer]
      .map((a) => a.name)
      .join(', ')}`
  );
  console.log(`- Orchestration Mode: ${team.mode || 'adaptive'}`);
  console.log(`- Max Active Tasks: ${team.maxActiveTasks || 3}`);
  console.log(
    `- Task Prioritization: ${team.taskPrioritization || 'ai-driven'}`
  );
  console.log(
    `- Workload Distribution: ${team.workloadDistribution || 'skills-based'}\n`
  );

  try {
    // Step 3: Start the classical workflow
    // The orchestrator will automatically select and execute optimal tasks
    console.log('🎯 Starting classical orchestration workflow...\n');
    console.log(
      'The orchestrator will automatically:\n' +
        '1. Analyze the project strategy and goals\n' +
        '2. Select optimal tasks from the repository\n' +
        '3. Arrange tasks based on dependencies and priorities\n' +
        '4. Execute the workflow with the selected agents\n'
    );

    // Execute the workflow with automatic orchestration
    console.log('🚀 Executing classical orchestrated workflow...');
    const startTime = Date.now();

    try {
      const workflowResult = await team.start();
      const executionTime = Date.now() - startTime;

      console.log(
        `✅ Classical workflow completed successfully in ${executionTime}ms!\n`
      );

      // Show what the orchestrator automatically selected and executed
      const teamState = team.store.getState();
      console.log('📊 Orchestrator Automatically Selected:');
      teamState.tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.description}`);
        console.log(`   Agent: ${task.agent.name}`);
        console.log(`   Status: ${task.status}`);
        console.log(
          `   Estimated Time: ${
            task.resourceRequirements?.estimatedTime || 'Not specified'
          }`
        );
        console.log('');
      });

      console.log('🎯 Classical Orchestration Benefits:');
      console.log('1. ✅ No explicit orchestration call needed');
      console.log('2. ✅ Automatic task selection during execution');
      console.log('3. ✅ Simplified workflow management');
      console.log('4. ✅ Traditional software development patterns');
      console.log('5. ✅ Predictable and intuitive behavior\n');

      // Comprehensive workflow validation using our utility
      const validation = validateWorkflowResult(workflowResult, team, {
        mode: 'adaptive',
        expectedMinTasks: 3,
        expectedSuccessRate: 70,
        logLevel: 'detailed',
      });

      // Print detailed validation report
      printValidationReport(validation, {
        logLevel: 'detailed',
        includeTaskDetails: true,
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(
        `❌ Classical workflow execution failed after ${executionTime}ms:`,
        error.message
      );

      // Show current task states for debugging
      const teamState = team.store.getState();
      console.log('\n🔍 Current Task States:');
      teamState.tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.status}: ${task.description}`);
      });
    }

    // Step 4: Demonstrate task repository management
    console.log('📝 Classical Task Repository Management:\n');

    // Add a new task to the repository
    const newTask = new Task({
      description: 'Implement user profile management',
      expectedOutput: 'User profile CRUD operations with avatar upload',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['frontend', 'file_upload'],
        dependencies: ['authentication'],
      },
    });

    team.addAvailableTemplateTasks([newTask]);
    console.log(
      '✅ Added new task to repository: "Implement user profile management"'
    );
    console.log(
      `Repository now contains ${team.availableTemplateTasks.length} tasks\n`
    );

    // Update orchestration strategy
    const updatedStrategy =
      team.orchestrationStrategy + '\n5. User profile functionality';
    team.updateOrchestrationStrategy(updatedStrategy);
    console.log('✅ Updated orchestration strategy to include user profiles\n');

    // Change orchestration mode
    team.updateOrchestrationMode('conservative');
    console.log(
      '✅ Changed orchestration mode to "conservative" for more careful task selection\n'
    );

    // Demonstrate how to restart with new configuration
    console.log('🔄 Classical Workflow Restart Capability:');
    console.log(
      'With the updated repository and strategy, you can call team.start() again'
    );
    console.log(
      'The orchestrator will automatically use the new configuration and tasks\n'
    );
  } catch (error) {
    console.error('❌ Classical orchestration error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure OPENAI_API_KEY is set in your .env file');
    console.log('2. Check that enableOrchestration is set to true');
    console.log(
      '3. Verify that availableTemplateTasks contains template tasks'
    );
    console.log('4. Check network connection and API service status');

    // Show current configuration for debugging
    console.log('\nCurrent Configuration:');
    console.log(`- Enable Orchestration: ${team.enableOrchestration}`);
    console.log(
      `- Available Tasks: ${team.availableTemplateTasks?.length || 0}`
    );
    console.log(`- LLM Configured: ${!!team.llmInstance}`);
  }

  // Summary
  console.log('📚 Classical Orchestration Key Takeaways:\n');
  console.log(
    '1. Set enableOrchestration: true to activate automatic orchestration'
  );
  console.log(
    '2. Use continuousOrchestration: false for initial-only mode (classical setup)'
  );
  console.log('3. Provide a task repository with availableTemplateTasks');
  console.log('4. Define a clear orchestrationStrategy to guide the AI');
  console.log(
    '5. Simply call team.start() - orchestration happens automatically!'
  );
  console.log('6. The orchestrator selects optimal tasks during execution');
  console.log('7. No need for explicit activateOrchestration() calls');
  console.log('8. Classical approach follows traditional workflow patterns');
  console.log(
    '9. Monitor WorkflowResult for execution status and task completion'
  );
  console.log('10. Validate task results and handle errors appropriately');
  console.log(
    '11. You can dynamically update the repository and restart workflows'
  );
}

// Run the example
if (require.main === module) {
  runClassicalOrchestrationExample()
    .then(() => console.log('\n✅ Classical orchestration example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runClassicalOrchestrationExample };
