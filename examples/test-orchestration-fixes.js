/**
 * Quick Test Script for Orchestration Fixes
 *
 * This script tests if the null safety fixes have resolved the
 * "Cannot read properties of undefined (reading 'filter')" errors.
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');

// Import agents
const {
  seniorDeveloper,
  frontendDeveloper,
  qaEngineer,
} = require('./utils/agents');
const { ChatOpenAI } = require('@langchain/openai');

// Create a minimal task for testing
const testTask = new Task({
  description: 'Test task for orchestration fixes',
  expectedOutput: 'Test completion',
  agent: seniorDeveloper,
  adaptable: true,
});

async function testOrchestrationFixes() {
  console.log('🧪 Testing Orchestration Fixes\n');

  try {
    // Create team with orchestration
    const team = new Team({
      name: 'Fix Test Team',
      agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
      tasks: [],
      enableOrchestration: true,
      backlogTasks: [testTask],
      orchestrationStrategy: 'Test orchestration fixes',
      mode: 'adaptive',
      maxActiveTasks: 1,
      llmInstance: new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.1,
        openAIApiKey: process.env.OPENAI_API_KEY,
        maxRetries: 1,
      }),
    });

    console.log('✅ Team created successfully');

    // Test orchestration activation
    console.log('🎯 Testing orchestration activation...');
    await team.activateOrchestration('Test orchestration fix validation');
    console.log('✅ Orchestration activated successfully');

    // Test workflow execution
    console.log('🚀 Testing workflow execution...');
    const startTime = Date.now();

    // Set a shorter timeout for this test
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Test timeout after 30 seconds')),
        30000
      );
    });

    const workflowPromise = team.start();

    const result = await Promise.race([workflowPromise, timeoutPromise]);

    const duration = Date.now() - startTime;

    console.log('✅ Workflow completed successfully');
    console.log(`⏱️ Execution time: ${duration}ms`);
    console.log(`📊 Status: ${result.status}`);
    console.log(`🎯 Result: ${result.result}`);

    return { success: true, duration, result };
  } catch (error) {
    console.error('❌ Test failed:', error.message);

    // Check if it's specifically the filter error
    if (
      error.message.includes(
        "Cannot read properties of undefined (reading 'filter')"
      )
    ) {
      console.error('🚨 FILTER ERROR STILL EXISTS - More fixes needed');
    }

    return { success: false, error: error.message };
  }
}

// Run the test
if (require.main === module) {
  testOrchestrationFixes()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 ALL TESTS PASSED - Orchestration fixes working!');
        process.exit(0);
      } else {
        console.log('\n💥 TESTS FAILED - More fixes needed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testOrchestrationFixes };
