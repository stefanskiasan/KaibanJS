/**
 * Example 01: Basic Orchestration
 *
 * This example demonstrates the basic setup of intelligent orchestration in KaibanJS.
 * It shows how to:
 * - Enable orchestration with enableOrchestration: true
 * - Set up a task repository with availableTemplateTasks
 * - Use activateOrchestration() to let AI select and arrange tasks
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

async function runBasicOrchestrationExample() {
  console.log('🚀 KaibanJS Basic Orchestration Example\n');
  console.log(
    'This example shows how to enable and use basic orchestration features.\n'
  );

  // Step 1: Create a task repository
  // These are template tasks that the orchestrator can choose from
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
    name: 'Agile Development Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [], // Start with no tasks - orchestrator will select them

    // IMPORTANT: Enable orchestration
    enableOrchestration: true,

    // Use initial-only orchestration for predictable basic workflow
    continuousOrchestration: false,

    // Provide the task repository
    availableTemplateTasks: taskRepository,

    // Don't allow new task generation in this basic example
    allowTaskGeneration: false,

    // Provide a clear strategy for the orchestrator
    orchestrationStrategy: `
      You are orchestrating a new web application project.
      
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

  console.log('✅ Team created with orchestration enabled\n');
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
    // Step 3: Activate orchestration
    // The orchestrator will analyze the project goal and select appropriate tasks
    console.log('🎯 Activating orchestration...\n');

    const projectGoal =
      'Build a secure web application with user authentication and modern UI';
    const orchestratedTasks = await team.activateOrchestration(
      projectGoal,
      true // preserveExistingTasks (not relevant here since we start with no tasks)
    );

    console.log(
      `\n✨ Orchestrator selected ${orchestratedTasks.length} tasks:\n`
    );

    orchestratedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.description}`);
      console.log(`   Agent: ${task.agent.name}`);
      console.log(
        `   Estimated Time: ${
          task.resourceRequirements?.estimatedTime || 'Not specified'
        }`
      );
      console.log(
        `   Skills Required: ${
          task.resourceRequirements?.skillsRequired?.join(', ') ||
          'Not specified'
        }`
      );
      console.log('');
    });

    // Step 4: Show the orchestration decisions
    console.log('📊 Orchestration Analysis:');
    console.log('The orchestrator analyzed the project goal and:');
    console.log('1. Identified the need for project setup first');
    console.log('2. Prioritized authentication as a security-critical feature');
    console.log('3. Included UI components for user interaction');
    console.log('4. Added testing to ensure code quality\n');

    // Step 5: Start the workflow
    console.log('▶️  Starting workflow execution...\n');

    // Execute the orchestrated tasks
    console.log('🚀 Executing orchestrated workflow...');
    const startTime = Date.now();

    try {
      const workflowResult = await team.start();
      const executionTime = Date.now() - startTime;

      console.log(
        `✅ Workflow completed successfully in ${executionTime}ms!\n`
      );

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
        `❌ Workflow execution failed after ${executionTime}ms:`,
        error.message
      );

      // Show current task states for debugging
      const teamState = team.store.getState();
      console.log('\n🔍 Current Task States:');
      teamState.tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.status}: ${task.description}`);
      });
    }

    // Step 6: Demonstrate task repository management
    console.log('📝 Task Repository Management:\n');

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
  } catch (error) {
    console.error('❌ Orchestration error:', error.message);
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
  console.log('📚 Key Takeaways:\n');
  console.log(
    '1. Set enableOrchestration: true to activate intelligent orchestration'
  );
  console.log(
    '2. Use continuousOrchestration: false for initial-only mode (basic setup)'
  );
  console.log('3. Provide a task repository with availableTemplateTasks');
  console.log('4. Define a clear orchestrationStrategy to guide the AI');
  console.log(
    '5. Use activateOrchestration() to let AI select and arrange tasks'
  );
  console.log(
    '6. Call team.start() to actually execute the orchestrated workflow'
  );
  console.log(
    '7. The orchestrator considers project goals, agent skills, and constraints'
  );
  console.log('8. You can dynamically update the task repository and strategy');
  console.log(
    '9. Monitor WorkflowResult for execution status and task completion'
  );
  console.log('10. Validate task results and handle errors appropriately');
}

// Run the example
if (require.main === module) {
  runBasicOrchestrationExample()
    .then(() => console.log('\n✅ Example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runBasicOrchestrationExample };
