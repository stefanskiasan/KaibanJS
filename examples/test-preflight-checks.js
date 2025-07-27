/**
 * Pre-Flight Checks for Orchestration Testing
 *
 * This script validates that all components are properly configured
 * before running the orchestration tests.
 */

require('dotenv').config();
const { Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');

async function runPreFlightChecks() {
  console.log('🔍 Pre-Flight Checks for Orchestration Testing\n');
  console.log('='.repeat(60));

  const results = {
    apiKey: false,
    agents: false,
    llm: false,
    orchestration: false,
    validation: false,
  };

  // Check 1: API Key Configuration
  console.log('\n🔑 Check 1: API Key Configuration');
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.startsWith('sk-')) {
      console.log('✅ OpenAI API key is configured');
      console.log(`   Key prefix: ${apiKey.substring(0, 10)}...`);
      results.apiKey = true;
    } else {
      console.log('❌ OpenAI API key missing or invalid');
      return results;
    }
  } catch (error) {
    console.log('❌ API key check failed:', error.message);
    return results;
  }

  // Check 2: Agent Creation and Configuration
  console.log('\n👥 Check 2: Agent Creation and Configuration');
  try {
    const testAgent = new Agent({
      name: 'Test Agent',
      role: 'Developer',
      goal: 'Test configuration',
      background: 'Testing agent setup',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.1,
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    // Initialize agent to test LLM connection
    await testAgent.initialize({ OPENAI_API_KEY: process.env.OPENAI_API_KEY });
    console.log('✅ Agent creation and initialization successful');
    console.log(`   Agent: ${testAgent.name} (${testAgent.role})`);
    results.agents = true;
  } catch (error) {
    console.log('❌ Agent setup failed:', error.message);
    return results;
  }

  // Check 3: LLM Instance Creation
  console.log('\n🤖 Check 3: LLM Instance Creation');
  try {
    const llmInstance = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxRetries: 1,
    });

    // Test LLM call
    const testResponse = await llmInstance.invoke(
      'Respond with: "LLM test successful"'
    );
    console.log('✅ LLM instance creation successful');
    console.log(`   Test response: "${testResponse.content}"`);
    results.llm = true;
  } catch (error) {
    console.log('❌ LLM instance failed:', error.message);
    return results;
  }

  // Check 4: Basic Orchestration Setup
  console.log('\n🎯 Check 4: Basic Orchestration Setup');
  try {
    const testAgent = new Agent({
      name: 'Orchestration Test Agent',
      role: 'Developer',
      goal: 'Test orchestration setup',
      background: 'Testing orchestration',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.1,
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    const testTask = new Task({
      description: 'Test task for orchestration',
      expectedOutput: 'Orchestration test result',
      agent: testAgent,
      adaptable: true,
      template: true,
    });

    const testTeam = new Team({
      name: 'Test Team',
      agents: [testAgent],
      tasks: [],
      enableOrchestration: true,
      availableTemplateTasks: [testTask],
      orchestrationStrategy: 'Test strategy',
      llmInstance: new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.2,
        openAIApiKey: process.env.OPENAI_API_KEY,
        maxRetries: 1,
      }),
    });

    console.log('✅ Basic orchestration setup successful');
    console.log(`   Team: ${testTeam.name}`);
    console.log(`   Orchestration enabled: ${testTeam.enableOrchestration}`);
    console.log(
      `   Available tasks: ${testTeam.availableTemplateTasks.length}`
    );
    results.orchestration = true;
  } catch (error) {
    console.log('❌ Orchestration setup failed:', error.message);
    return results;
  }

  // Check 5: WorkflowValidator Utility
  console.log('\n📊 Check 5: WorkflowValidator Utility');
  try {
    const {
      validateWorkflowResult,
      printValidationReport: _printValidationReport,
    } = require('./utils/workflowValidator');

    // Test with mock WorkflowResult
    const mockWorkflowResult = {
      status: 'FINISHED',
      result: 'Test completed successfully',
      stats: {
        totalTasks: 3,
        completedTasks: 2,
        failedTasks: 1,
        executionTime: 5000,
      },
    };

    const mockTeam = {
      store: {
        getState: () => ({
          tasks: [
            {
              status: 'DONE',
              description: 'Task 1',
              agent: { name: 'Agent 1' },
            },
            {
              status: 'DONE',
              description: 'Task 2',
              agent: { name: 'Agent 2' },
            },
            {
              status: 'ERROR',
              description: 'Task 3',
              agent: { name: 'Agent 3' },
            },
          ],
        }),
      },
    };

    const validation = validateWorkflowResult(mockWorkflowResult, mockTeam, {
      mode: 'adaptive',
      expectedMinTasks: 2,
      expectedSuccessRate: 60,
    });

    console.log('✅ WorkflowValidator utility functional');
    console.log(
      `   Validation result: ${validation.isValid ? 'Valid' : 'Invalid'}`
    );
    console.log(
      `   Success rate: ${validation.taskAnalysis.successRate.toFixed(1)}%`
    );
    results.validation = true;
  } catch (error) {
    console.log('❌ WorkflowValidator test failed:', error.message);
    return results;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 PRE-FLIGHT CHECK SUMMARY:');
  console.log('='.repeat(60));

  const checks = [
    { name: 'API Key Configuration', status: results.apiKey },
    { name: 'Agent Setup', status: results.agents },
    { name: 'LLM Instance', status: results.llm },
    { name: 'Orchestration Setup', status: results.orchestration },
    { name: 'WorkflowValidator', status: results.validation },
  ];

  checks.forEach((check, index) => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${check.name}`);
  });

  const allPassed = Object.values(results).every((result) => result);
  console.log('\n' + '='.repeat(60));

  if (allPassed) {
    console.log('🎉 ALL PRE-FLIGHT CHECKS PASSED!');
    console.log('✅ Ready to proceed with orchestration testing.');
  } else {
    console.log('⚠️  SOME PRE-FLIGHT CHECKS FAILED!');
    console.log('❌ Please resolve issues before proceeding.');
  }

  return results;
}

// Run pre-flight checks
if (require.main === module) {
  runPreFlightChecks()
    .then((results) => {
      const allPassed = Object.values(results).every((result) => result);
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Pre-flight checks failed:', error);
      process.exit(1);
    });
}

module.exports = { runPreFlightChecks };
