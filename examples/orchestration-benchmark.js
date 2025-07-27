/**
 * KaibanJS Orchestration Modes Benchmark
 *
 * This script runs comprehensive benchmarks comparing all three orchestration modes:
 * - Basic/Adaptive Mode
 * - Conservative Mode
 * - Innovative Mode
 *
 * It measures performance, validates results, and provides comparative analysis.
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
const {
  validateWorkflowResult,
  printValidationReport,
  compareWorkflowResults,
} = require('./utils/workflowValidator');

// Import agents and tasks
const {
  seniorDeveloper,
  frontendDeveloper,
  qaEngineer,
  securityExpert,
  devOpsEngineer,
  innovationLead,
  aiResearcher,
  blockchainDeveloper,
} = require('./utils/agents');

const {
  implementAuthenticationTask,
  createResponsiveUITask,
  writeUnitTestsTask,
  implementCrudApiTask,
  securityAuditTask,
  setupMonitoringTask,
  dockerizeApplicationTask,
  researchNewTechnologyTask,
  createProofOfConceptTask,
} = require('./utils/tasks');

async function runOrchestrationBenchmark() {
  console.log('🏁 KaibanJS Orchestration Modes Benchmark\n');
  console.log(
    'This benchmark will test all three orchestration modes with the same project goal.'
  );
  console.log(
    'Each mode will be evaluated for performance, task completion, and result quality.\n'
  );

  const projectGoal =
    'Build a secure web application with modern UI, authentication, and comprehensive testing';
  const benchmarkResults = [];

  // Shared task repository for fair comparison
  const sharedTaskRepository = [
    implementAuthenticationTask,
    createResponsiveUITask,
    writeUnitTestsTask,
    implementCrudApiTask,
    securityAuditTask,
    setupMonitoringTask,
    dockerizeApplicationTask,
    researchNewTechnologyTask,
    createProofOfConceptTask,

    // Additional benchmark tasks
    new Task({
      description: 'Implement user profile management',
      expectedOutput: 'Complete user profile system with CRUD operations',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['frontend', 'api_integration'],
        dependencies: ['authentication'],
      },
    }),

    new Task({
      description: 'Set up CI/CD pipeline',
      expectedOutput: 'Automated build and deployment pipeline',
      agent: devOpsEngineer,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['devops', 'automation'],
        dependencies: ['testing'],
      },
    }),
  ];

  console.log(
    `📊 Benchmark Setup: ${sharedTaskRepository.length} tasks available for all modes\n`
  );

  // Test 1: Adaptive/Basic Mode
  console.log('🎯 TEST 1: ADAPTIVE MODE BENCHMARK');
  console.log('='.repeat(50));

  try {
    const adaptiveResult = await runAdaptiveModeBenchmark(
      projectGoal,
      sharedTaskRepository
    );
    benchmarkResults.push({
      name: 'Adaptive Mode',
      ...adaptiveResult,
    });
  } catch (error) {
    console.error('❌ Adaptive mode benchmark failed:', error.message);
    benchmarkResults.push({
      name: 'Adaptive Mode',
      validation: {
        isValid: false,
        errors: [error.message],
        taskAnalysis: { successRate: 0 },
      },
    });
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 2: Conservative Mode
  console.log('🛡️ TEST 2: CONSERVATIVE MODE BENCHMARK');
  console.log('='.repeat(50));

  try {
    const conservativeResult = await runConservativeModeBenchmark(
      projectGoal,
      sharedTaskRepository
    );
    benchmarkResults.push({
      name: 'Conservative Mode',
      ...conservativeResult,
    });
  } catch (error) {
    console.error('❌ Conservative mode benchmark failed:', error.message);
    benchmarkResults.push({
      name: 'Conservative Mode',
      validation: {
        isValid: false,
        errors: [error.message],
        taskAnalysis: { successRate: 0 },
      },
    });
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 3: Innovative Mode
  console.log('🚀 TEST 3: INNOVATIVE MODE BENCHMARK');
  console.log('='.repeat(50));

  try {
    const innovativeResult = await runInnovativeModeBenchmark(
      projectGoal,
      sharedTaskRepository
    );
    benchmarkResults.push({
      name: 'Innovative Mode',
      ...innovativeResult,
    });
  } catch (error) {
    console.error('❌ Innovative mode benchmark failed:', error.message);
    benchmarkResults.push({
      name: 'Innovative Mode',
      validation: {
        isValid: false,
        errors: [error.message],
        taskAnalysis: { successRate: 0 },
      },
    });
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Comparative Analysis
  console.log('📊 COMPARATIVE BENCHMARK RESULTS');
  console.log('='.repeat(50));

  compareWorkflowResults(benchmarkResults);

  // Generate detailed comparison report
  generateComparisonReport(benchmarkResults);

  // Performance summary
  console.log('\n🏆 BENCHMARK SUMMARY:');
  benchmarkResults.forEach((result, index) => {
    const status = result.validation.isValid ? '✅' : '❌';
    console.log(
      `${index + 1}. ${status} ${
        result.name
      }: ${result.validation.taskAnalysis.successRate.toFixed(1)}% success rate`
    );
  });

  console.log('\n✅ Orchestration benchmark completed!');
}

async function runAdaptiveModeBenchmark(projectGoal, taskRepository) {
  const startTime = Date.now();

  const team = new Team({
    name: 'Adaptive Benchmark Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [],
    enableOrchestration: true,
    continuousOrchestration: false,
    availableTemplateTasks: taskRepository,
    allowTaskGeneration: false,
    orchestrationStrategy: `
      Build a modern web application with balanced approach.
      Focus on essential features with good quality.
      Balance speed and reliability.
    `,
    mode: 'adaptive',
    maxActiveTasks: 3,
    taskPrioritization: 'dynamic',
    workloadDistribution: 'balanced',
    llmInstance: new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.3,
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,
    }),
  });

  console.log('🎯 Activating adaptive orchestration...');
  await team.activateOrchestration(projectGoal, true);

  console.log('🚀 Executing adaptive workflow...');
  const workflowResult = await team.start();
  const executionTime = Date.now() - startTime;

  console.log(`✅ Adaptive mode completed in ${executionTime}ms`);

  const validation = validateWorkflowResult(workflowResult, team, {
    mode: 'adaptive',
    expectedMinTasks: 3,
    expectedSuccessRate: 70,
    logLevel: 'detailed',
  });

  printValidationReport(validation);

  return {
    executionTime,
    workflowResult,
    validation,
    team,
  };
}

async function runConservativeModeBenchmark(projectGoal, taskRepository) {
  const startTime = Date.now();

  // Mark critical tasks as non-adaptable for conservative mode
  const conservativeTaskRepository = taskRepository.map((task) => ({
    ...task,
    adaptable:
      task.description.includes('security') ||
      task.description.includes('audit')
        ? false
        : task.adaptable,
  }));

  const team = new Team({
    name: 'Conservative Benchmark Team',
    agents: [seniorDeveloper, securityExpert, qaEngineer, devOpsEngineer],
    tasks: [],
    enableOrchestration: true,
    continuousOrchestration: false,
    availableTemplateTasks: conservativeTaskRepository,
    allowTaskGeneration: false,
    orchestrationStrategy: `
      Production-ready deployment with maximum safety.
      Security and compliance are non-negotiable.
      Prioritize stability over speed.
      Zero tolerance for failures.
    `,
    mode: 'conservative',
    maxActiveTasks: 2,
    taskPrioritization: 'static',
    workloadDistribution: 'balanced',
    llmInstance: new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.1, // Very low for consistency
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxRetries: 3,
    }),
  });

  console.log('🛡️ Activating conservative orchestration...');
  await team.activateOrchestration(projectGoal, true);

  console.log('🚀 Executing conservative workflow...');
  const workflowResult = await team.start();
  const executionTime = Date.now() - startTime;

  console.log(`✅ Conservative mode completed in ${executionTime}ms`);

  const validation = validateWorkflowResult(workflowResult, team, {
    mode: 'conservative',
    expectedMinTasks: 3,
    expectedSuccessRate: 90,
    logLevel: 'detailed',
  });

  printValidationReport(validation);

  return {
    executionTime,
    workflowResult,
    validation,
    team,
  };
}

async function runInnovativeModeBenchmark(projectGoal, taskRepository) {
  const startTime = Date.now();

  const team = new Team({
    name: 'Innovative Benchmark Team',
    agents: [
      innovationLead,
      aiResearcher,
      frontendDeveloper,
      blockchainDeveloper,
    ],
    tasks: [],
    enableOrchestration: true,
    continuousOrchestration: true, // Enable continuous for innovation
    availableTemplateTasks: taskRepository,
    allowTaskGeneration: true, // Allow AI to generate new tasks
    orchestrationStrategy: `
      Revolutionary web application with cutting-edge technologies.
      Explore AI, blockchain, and immersive experiences.
      Prioritize innovation over convention.
      Embrace intelligent experimentation.
    `,
    mode: 'innovative',
    maxActiveTasks: 4,
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',
    adaptationInterval: 120000, // 2 minutes
    llmInstance: new ChatOpenAI({
      modelName: 'gpt-4o', // More powerful model
      temperature: 0.8, // High creativity
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,
    }),
  });

  console.log('🚀 Activating innovative orchestration...');
  await team.activateOrchestration(projectGoal, true);

  console.log('🧪 Executing innovative workflow...');
  const workflowResult = await team.start();
  const executionTime = Date.now() - startTime;

  console.log(`✨ Innovative mode completed in ${executionTime}ms`);

  const validation = validateWorkflowResult(workflowResult, team, {
    mode: 'innovative',
    expectedMinTasks: 3,
    expectedSuccessRate: 50, // Tolerates experimentation failures
    logLevel: 'detailed',
  });

  printValidationReport(validation);

  return {
    executionTime,
    workflowResult,
    validation,
    team,
  };
}

function generateComparisonReport(results) {
  console.log('\n📋 DETAILED COMPARISON REPORT:');
  console.log('='.repeat(70));

  // Performance metrics
  console.log('\n⚡ PERFORMANCE COMPARISON:');
  results.forEach((result) => {
    if (result.executionTime) {
      console.log(`- ${result.name}: ${result.executionTime}ms execution time`);
    }
  });

  // Success rate comparison
  console.log('\n📊 SUCCESS RATE COMPARISON:');
  results.forEach((result) => {
    const rate = result.validation.taskAnalysis.successRate;
    const rateIcon = rate >= 80 ? '🟢' : rate >= 60 ? '🟡' : '🔴';
    console.log(`${rateIcon} ${result.name}: ${rate.toFixed(1)}% success rate`);
  });

  // Task analysis
  console.log('\n📝 TASK ANALYSIS COMPARISON:');
  results.forEach((result) => {
    const analysis = result.validation.taskAnalysis;
    console.log(`\n${result.name}:`);
    console.log(`  - Total Tasks: ${analysis.total}`);
    console.log(`  - Completed: ${analysis.completed}`);
    console.log(`  - Failed: ${analysis.failed}`);
    console.log(`  - Success Rate: ${analysis.successRate.toFixed(1)}%`);
  });

  console.log('\n💡 RECOMMENDATIONS:');
  results.forEach((result) => {
    if (result.validation.recommendations.length > 0) {
      console.log(`\n${result.name}:`);
      result.validation.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  });
}

// Run the benchmark
if (require.main === module) {
  runOrchestrationBenchmark()
    .then(() => console.log('\n🎯 Benchmark suite completed successfully!'))
    .catch((error) => console.error('\n❌ Benchmark suite failed:', error));
}

module.exports = { runOrchestrationBenchmark };
