/**
 * Test for Orchestration Null Reference Fixes
 *
 * This script tests the fixes for:
 * 1. "Cannot read properties of null (reading 'modifyTasks')" error
 * 2. "Cannot read properties of undefined (reading 'model')" error
 * 3. "Cannot read properties of undefined (reading 'getState')" error
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');

// Import agents from utils
const {
  seniorDeveloper,
  frontendDeveloper,
  qaEngineer,
} = require('./utils/agents');

async function testOrchestrationNullFixes() {
  console.log('🧪 Testing orchestration null reference fixes...\n');

  // Create adaptable tasks that might trigger continuous orchestration
  const adaptableTask1 = new Task({
    description: 'Create a proof of concept for the new feature',
    expectedOutput: 'Working proof of concept with basic functionality',
    agent: seniorDeveloper,
    adaptable: true,
    priority: 'high',
    template: true,
    resourceRequirements: {
      estimatedTime: '3 hours',
      skillsRequired: ['development', 'prototyping'],
    },
  });

  const adaptableTask2 = new Task({
    description: 'Design user interface mockups',
    expectedOutput: 'UI mockups and design specifications',
    agent: frontendDeveloper,
    adaptable: true,
    priority: 'medium',
    template: true,
    orchestrationRules: 'phase: design',
  });

  const adaptableTask3 = new Task({
    description: 'Create comprehensive test plan',
    expectedOutput: 'Detailed test plan with test cases',
    agent: qaEngineer,
    adaptable: true,
    priority: 'medium',
    template: true,
  });

  // Create team with orchestration enabled AND continuous orchestration
  const team = new Team({
    name: 'Null Fix Test Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [],
    enableOrchestration: true,
    continuousOrchestration: true, // This should trigger the problematic code paths
    availableTemplateTasks: [adaptableTask1, adaptableTask2, adaptableTask3],
    mode: 'adaptive',
    orchestrationStrategy:
      'Focus on rapid prototyping and iterative development',
    llmInstance: new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.3,
    }),
  });

  // Monitor for specific error messages
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  let errorsCaught = [];
  let warningsCaught = [];

  console.error = (...args) => {
    const message = args.join(' ');
    errorsCaught.push(message);
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    warningsCaught.push(message);
    originalConsoleWarn(...args);
  };

  try {
    console.log('Starting team workflow with continuous orchestration...');
    const _result = await team.start();

    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;

    console.log('\n✅ Test Results:');
    console.log(`- Workflow completed successfully`);
    console.log(`- Total errors caught: ${errorsCaught.length}`);
    console.log(`- Total warnings caught: ${warningsCaught.length}`);

    // Check for specific fixed errors
    const modifyTasksErrors = errorsCaught.filter(
      (msg) =>
        msg.includes('modifyTasks') ||
        msg.includes('Cannot read properties of null')
    );

    const modelErrors = errorsCaught.filter(
      (msg) =>
        msg.includes('Cannot read properties of undefined') &&
        msg.includes('model')
    );

    const getStateErrors = errorsCaught.filter(
      (msg) =>
        msg.includes('Cannot read properties of undefined') &&
        msg.includes('getState')
    );

    console.log('\n📊 Specific Error Analysis:');
    console.log(`- modifyTasks errors: ${modifyTasksErrors.length}`);
    console.log(`- model property errors: ${modelErrors.length}`);
    console.log(`- getState errors: ${getStateErrors.length}`);

    if (modifyTasksErrors.length > 0) {
      console.log('\n❌ modifyTasks errors still occurring:');
      modifyTasksErrors.forEach((error) => console.log(`   ${error}`));
    }

    if (modelErrors.length > 0) {
      console.log('\n❌ model property errors still occurring:');
      modelErrors.forEach((error) => console.log(`   ${error}`));
    }

    if (getStateErrors.length > 0) {
      console.log('\n❌ getState errors still occurring:');
      getStateErrors.forEach((error) => console.log(`   ${error}`));
    }

    const totalFixedErrors =
      modifyTasksErrors.length + modelErrors.length + getStateErrors.length;

    if (totalFixedErrors === 0) {
      console.log(
        '\n✅ SUCCESS: All targeted null reference errors have been fixed!'
      );
      return true;
    } else {
      console.log(`\n⚠️  ${totalFixedErrors} targeted errors still occurring`);
      return false;
    }
  } catch (error) {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;

    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testOrchestrationNullFixes()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
