/**
 * Quick Orchestration Execution Test
 *
 * This is a minimal test to validate that orchestration + team.start() works correctly
 * and produces clean results with proper validation.
 */

require('dotenv').config();
const { Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
const {
  validateWorkflowResult,
  printValidationReport,
} = require('./utils/workflowValidator');

async function testOrchestrationExecution() {
  console.log('🧪 Quick Orchestration Execution Test\n');

  try {
    // Create minimal setup for fast testing
    const developer = new Agent({
      name: 'Test Developer',
      role: 'Full-Stack Developer',
      goal: 'Build applications quickly',
      background: 'Expert developer',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.2,
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    const designer = new Agent({
      name: 'Test Designer',
      role: 'UI Designer',
      goal: 'Create beautiful interfaces',
      background: 'Design expert',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.2,
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    // Create simple task repository
    const taskRepository = [
      new Task({
        description: 'Set up project structure',
        expectedOutput: 'Basic project structure with folders',
        agent: developer,
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '30 minutes',
          skillsRequired: ['setup'],
          dependencies: [],
        },
      }),

      new Task({
        description: 'Create basic UI components',
        expectedOutput: 'Simple UI components for the application',
        agent: designer,
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '1 hour',
          skillsRequired: ['ui', 'components'],
          dependencies: ['setup'],
        },
      }),

      new Task({
        description: 'Implement user authentication',
        expectedOutput: 'Secure login and registration system',
        agent: developer,
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '2 hours',
          skillsRequired: ['backend', 'security'],
          dependencies: ['setup'],
        },
      }),
    ];

    console.log(
      `📋 Created test repository with ${taskRepository.length} tasks`
    );

    // Create team with orchestration
    const team = new Team({
      name: 'Test Team',
      agents: [developer, designer],
      tasks: [],
      enableOrchestration: true,
      continuousOrchestration: false,
      backlogTasks: taskRepository,
      allowTaskGeneration: false,
      orchestrationStrategy:
        'Build a simple web application with authentication and UI components.',
      mode: 'adaptive',
      maxActiveTasks: 2,
      llmInstance: new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.3,
        openAIApiKey: process.env.OPENAI_API_KEY,
        maxRetries: 2,
      }),
    });

    console.log('✅ Team created with orchestration enabled');

    // Step 1: Activate orchestration
    console.log('\n🎯 Step 1: Activating orchestration...');
    const startOrchestrationTime = Date.now();

    const orchestratedTasks = await team.activateOrchestration(
      'Build a simple but secure web application',
      true
    );

    const orchestrationTime = Date.now() - startOrchestrationTime;
    console.log(`✅ Orchestration completed in ${orchestrationTime}ms`);
    console.log(`📊 Selected ${orchestratedTasks.length} tasks for execution`);

    // Step 2: Execute workflow
    console.log('\n🚀 Step 2: Executing workflow...');
    const startExecutionTime = Date.now();

    const workflowResult = await team.start();
    const executionTime = Date.now() - startExecutionTime;

    console.log(`✅ Workflow execution completed in ${executionTime}ms`);
    console.log(`📊 Total time: ${orchestrationTime + executionTime}ms`);

    // Step 3: Validate results
    console.log('\n🔍 Step 3: Validating results...');

    const validation = validateWorkflowResult(workflowResult, team, {
      mode: 'adaptive',
      expectedMinTasks: 2,
      expectedSuccessRate: 60,
      logLevel: 'detailed',
    });

    // Print validation report
    printValidationReport(validation, {
      logLevel: 'detailed',
      includeTaskDetails: true,
    });

    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`- Orchestration: ${orchestrationTime}ms`);
    console.log(`- Execution: ${executionTime}ms`);
    console.log(`- Total: ${orchestrationTime + executionTime}ms`);
    console.log(
      `- Validation: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}`
    );
    console.log(
      `- Success Rate: ${validation.taskAnalysis.successRate.toFixed(1)}%`
    );

    if (validation.isValid && validation.taskAnalysis.successRate >= 60) {
      console.log('\n🎉 ORCHESTRATION EXECUTION TEST PASSED!');
      return true;
    } else {
      console.log('\n❌ ORCHESTRATION EXECUTION TEST FAILED!');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\nDebugging info:');
    console.log('- Check OPENAI_API_KEY in .env file');
    console.log('- Verify network connectivity');
    console.log('- Check API limits and usage');
    return false;
  }
}

// Run the test
if (require.main === module) {
  testOrchestrationExecution()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testOrchestrationExecution };
