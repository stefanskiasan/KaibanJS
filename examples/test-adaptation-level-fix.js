require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');

// Import agents from utils
const {
  seniorDeveloper,
  frontendDeveloper,
  qaEngineer,
} = require('./utils/agents');

async function testAdaptationLevelFix() {
  console.log('🧪 Testing adaptationLevel fix...\n');

  // Create adaptable tasks
  const adaptableTask1 = new Task({
    description: 'Research market trends for Q4 planning',
    expectedOutput: 'Comprehensive market analysis report',
    agent: seniorDeveloper,
    adaptable: true,
    priority: 'medium',
    template: true,
    resourceRequirements: {
      estimatedTime: '4 hours',
      skillsRequired: ['research', 'analysis'],
    },
  });

  const adaptableTask2 = new Task({
    description: 'Plan project timeline and milestones',
    expectedOutput: 'Detailed project timeline with milestones',
    agent: frontendDeveloper,
    adaptable: true,
    priority: 'high',
    template: true,
    orchestrationRules: 'phase: planning',
  });

  // Create team with orchestration enabled
  const team = new Team({
    name: 'Adaptation Test Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [],
    enableOrchestration: true,
    availableTemplateTasks: [adaptableTask1, adaptableTask2],
    mode: 'adaptive',
    orchestrationStrategy:
      'Focus on efficient task adaptation and resource optimization',
    llmInstance: new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.3,
    }),
  });

  // Store original console methods to capture orchestration logs
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const logMessages = [];

  const captureLog = (...args) => {
    const message = args.join(' ');
    logMessages.push(message);
    originalLog(...args);
  };

  console.log = captureLog;
  console.info = captureLog;
  console.warn = captureLog;

  try {
    console.log('Starting team workflow with orchestration...');
    const _result = await team.start();

    // Restore original console methods
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;

    // Look for adaptation success messages in logs
    const adaptationLogs = logMessages.filter((msg) =>
      msg.includes('Task adapted successfully')
    );

    console.log('\n✅ Test Results:');
    console.log(`- Found ${adaptationLogs.length} task adaptation logs`);

    // Check if adaptationLevel is no longer undefined
    let foundUndefined = false;
    adaptationLogs.forEach((log, index) => {
      console.log(`\n📋 Adaptation Log ${index + 1}:`);
      try {
        // Extract JSON from log message
        const jsonMatch = log.match(/\{.*\}/);
        if (jsonMatch) {
          const logData = JSON.parse(jsonMatch[0]);
          console.log(`   - Task ID: ${logData.taskId}`);
          console.log(`   - Adaptation Level: ${logData.adaptationLevel}`);
          console.log(`   - Split Recommended: ${logData.splitRecommended}`);
          console.log(`   - Merge Recommended: ${logData.mergeRecommended}`);

          if (logData.adaptationLevel === undefined) {
            foundUndefined = true;
            console.log('   ❌ adaptationLevel is still undefined!');
          } else {
            console.log(
              `   ✅ adaptationLevel is properly set: "${logData.adaptationLevel}"`
            );
          }
        }
      } catch (_e) {
        console.log(`   - Raw log: ${log}`);
      }
    });

    if (foundUndefined) {
      console.log(
        '\n❌ Test FAILED: Some adaptationLevel values are still undefined'
      );
      return false;
    } else if (adaptationLogs.length > 0) {
      console.log(
        '\n✅ Test PASSED: All adaptationLevel values are properly set'
      );
      return true;
    } else {
      console.log('\n⚠️  Test INCONCLUSIVE: No adaptation logs found');
      return false;
    }
  } catch (error) {
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testAdaptationLevelFix()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
