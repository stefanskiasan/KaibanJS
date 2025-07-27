/**
 * Comprehensive WorkflowValidator Utility Test Suite
 *
 * This script thoroughly tests the WorkflowValidator utility with various
 * scenarios, edge cases, and mode-specific validations.
 */

require('dotenv').config();
const {
  validateWorkflowResult,
  printValidationReport,
  compareWorkflowResults,
} = require('./utils/workflowValidator');

async function testWorkflowValidator() {
  console.log('🧪 Comprehensive WorkflowValidator Test Suite\n');
  console.log('='.repeat(70));

  const testResults = [];

  // Test 1: Valid Adaptive Mode Workflow
  console.log('\n📊 Test 1: Valid Adaptive Mode Workflow');
  console.log('-'.repeat(50));

  try {
    const validWorkflowResult = {
      status: 'FINISHED',
      result: 'Web application successfully built',
      stats: {
        totalTasks: 4,
        completedTasks: 3,
        failedTasks: 1,
        executionTime: 45000,
      },
    };

    const validTeam = {
      store: {
        getState: () => ({
          tasks: [
            {
              status: 'DONE',
              description: 'Setup project structure',
              agent: { name: 'Developer' },
              adaptable: true,
              result: 'Project created',
            },
            {
              status: 'DONE',
              description: 'Implement authentication',
              agent: { name: 'Backend Dev' },
              adaptable: true,
              result: 'Auth system ready',
            },
            {
              status: 'DONE',
              description: 'Create UI components',
              agent: { name: 'Frontend Dev' },
              adaptable: true,
              result: 'UI components built',
            },
            {
              status: 'ERROR',
              description: 'Deploy to production',
              agent: { name: 'DevOps' },
              adaptable: false,
              result: null,
            },
          ],
        }),
      },
    };

    const validation = validateWorkflowResult(validWorkflowResult, validTeam, {
      mode: 'adaptive',
      expectedMinTasks: 3,
      expectedSuccessRate: 70,
    });

    console.log(
      `✅ Validation Status: ${validation.isValid ? 'VALID' : 'INVALID'}`
    );
    console.log(
      `📊 Success Rate: ${validation.taskAnalysis.successRate.toFixed(1)}%`
    );
    console.log(`⚠️  Warnings: ${validation.warnings.length}`);
    console.log(`❌ Errors: ${validation.errors.length}`);

    testResults.push({
      name: 'Valid Adaptive Workflow',
      passed: validation.isValid && validation.taskAnalysis.successRate === 75,
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    testResults.push({ name: 'Valid Adaptive Workflow', passed: false });
  }

  // Test 2: Conservative Mode with Critical Task Failure
  console.log('\n🛡️ Test 2: Conservative Mode with Critical Task Failure');
  console.log('-'.repeat(50));

  try {
    const conservativeWorkflowResult = {
      status: 'FINISHED',
      result: 'Production deployment completed',
      stats: {
        totalTasks: 3,
        completedTasks: 2,
        failedTasks: 1,
        executionTime: 30000,
      },
    };

    const conservativeTeam = {
      store: {
        getState: () => ({
          tasks: [
            {
              status: 'DONE',
              description: 'Security audit',
              agent: { name: 'Security Expert' },
              adaptable: false,
              result: 'Audit passed',
            },
            {
              status: 'DONE',
              description: 'Performance testing',
              agent: { name: 'QA Engineer' },
              adaptable: true,
              result: 'Tests passed',
            },
            {
              status: 'ERROR',
              description: 'Critical security check',
              agent: { name: 'Security Expert' },
              adaptable: false,
              result: null,
            },
          ],
        }),
      },
    };

    const validation = validateWorkflowResult(
      conservativeWorkflowResult,
      conservativeTeam,
      {
        mode: 'conservative',
        expectedMinTasks: 3,
        expectedSuccessRate: 90,
      }
    );

    console.log(
      `✅ Validation Status: ${validation.isValid ? 'VALID' : 'INVALID'}`
    );
    console.log(
      `📊 Success Rate: ${validation.taskAnalysis.successRate.toFixed(1)}%`
    );
    console.log(
      `🔒 Critical Task Failures: ${
        validation.conservativeAnalysis?.criticalTasksFailed || 'N/A'
      }`
    );
    console.log(`⚠️  Warnings: ${validation.warnings.length}`);
    console.log(`❌ Errors: ${validation.errors.length}`);

    // Should be invalid due to critical task failure
    testResults.push({
      name: 'Conservative Critical Failure',
      passed: !validation.isValid,
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    testResults.push({ name: 'Conservative Critical Failure', passed: false });
  }

  // Test 3: Innovative Mode with High Failure Rate
  console.log('\n🚀 Test 3: Innovative Mode with High Failure Rate');
  console.log('-'.repeat(50));

  try {
    const innovativeWorkflowResult = {
      status: 'FINISHED',
      result: 'Innovation experiments completed',
      stats: {
        totalTasks: 5,
        completedTasks: 2,
        failedTasks: 3,
        executionTime: 60000,
      },
    };

    const innovativeTeam = {
      store: {
        getState: () => ({
          tasks: [
            {
              status: 'DONE',
              description: 'Research AI integration',
              agent: { name: 'AI Researcher' },
              adaptable: true,
              result: 'Research completed',
            },
            {
              status: 'DONE',
              description: 'Blockchain prototype',
              agent: { name: 'Blockchain Dev' },
              adaptable: true,
              result: 'Prototype built',
            },
            {
              status: 'ERROR',
              description: 'Quantum computing experiment',
              agent: { name: 'Quantum Researcher' },
              adaptable: true,
              result: null,
            },
            {
              status: 'ERROR',
              description: 'AR/VR integration',
              agent: { name: 'AR Developer' },
              adaptable: true,
              result: null,
            },
            {
              status: 'ERROR',
              description: 'Neural network training',
              agent: { name: 'ML Engineer' },
              adaptable: true,
              result: null,
            },
          ],
        }),
      },
    };

    const validation = validateWorkflowResult(
      innovativeWorkflowResult,
      innovativeTeam,
      {
        mode: 'innovative',
        expectedMinTasks: 3,
        expectedSuccessRate: 30, // Lower expectation for innovation
      }
    );

    console.log(
      `✅ Validation Status: ${validation.isValid ? 'VALID' : 'INVALID'}`
    );
    console.log(
      `📊 Success Rate: ${validation.taskAnalysis.successRate.toFixed(1)}%`
    );
    console.log(
      `🧪 Experimental Tasks: ${
        validation.innovativeAnalysis?.experimentalTasks || 'N/A'
      }`
    );
    console.log(`⚠️  Warnings: ${validation.warnings.length}`);
    console.log(`❌ Errors: ${validation.errors.length}`);

    // Should be valid despite low success rate due to innovative mode tolerance
    testResults.push({
      name: 'Innovative High Failure',
      passed: validation.isValid,
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    testResults.push({ name: 'Innovative High Failure', passed: false });
  }

  // Test 4: Invalid WorkflowResult (null)
  console.log('\n❌ Test 4: Invalid WorkflowResult (null)');
  console.log('-'.repeat(50));

  try {
    const validation = validateWorkflowResult(null, {
      store: { getState: () => ({ tasks: [] }) },
    });

    console.log(
      `✅ Validation Status: ${validation.isValid ? 'VALID' : 'INVALID'}`
    );
    console.log(`❌ Errors: ${validation.errors.length}`);
    console.log(`Error Message: "${validation.errors[0] || 'No errors'}"`);

    testResults.push({
      name: 'Null WorkflowResult',
      passed: !validation.isValid && validation.errors.length > 0,
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    testResults.push({ name: 'Null WorkflowResult', passed: false });
  }

  // Test 5: WorkflowResult with Missing Status
  console.log('\n❌ Test 5: WorkflowResult with Missing Status');
  console.log('-'.repeat(50));

  try {
    const invalidWorkflowResult = {
      result: 'Some result',
      stats: { totalTasks: 1 },
      // Missing status field
    };

    const validation = validateWorkflowResult(invalidWorkflowResult, {
      store: { getState: () => ({ tasks: [] }) },
    });

    console.log(
      `✅ Validation Status: ${validation.isValid ? 'VALID' : 'INVALID'}`
    );
    console.log(`❌ Errors: ${validation.errors.length}`);
    console.log(`Error Message: "${validation.errors[0] || 'No errors'}"`);

    testResults.push({
      name: 'Missing Status Field',
      passed: !validation.isValid,
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    testResults.push({ name: 'Missing Status Field', passed: false });
  }

  // Test 6: Print Validation Report Test
  console.log('\n📋 Test 6: Print Validation Report');
  console.log('-'.repeat(50));

  try {
    const sampleWorkflowResult = {
      status: 'FINISHED',
      result: 'Sample workflow completed',
      stats: {
        totalTasks: 3,
        completedTasks: 2,
        failedTasks: 1,
      },
    };

    const sampleTeam = {
      store: {
        getState: () => ({
          tasks: [
            {
              status: 'DONE',
              description: 'Task 1',
              agent: { name: 'Agent 1' },
              adaptable: true,
            },
            {
              status: 'DONE',
              description: 'Task 2',
              agent: { name: 'Agent 2' },
              adaptable: false,
            },
            {
              status: 'ERROR',
              description: 'Task 3',
              agent: { name: 'Agent 3' },
              adaptable: true,
            },
          ],
        }),
      },
    };

    const validation = validateWorkflowResult(
      sampleWorkflowResult,
      sampleTeam,
      {
        mode: 'adaptive',
        expectedMinTasks: 2,
        expectedSuccessRate: 60,
      }
    );

    console.log('Testing printValidationReport function:');
    printValidationReport(validation, { logLevel: 'detailed' });

    testResults.push({ name: 'Print Validation Report', passed: true });
  } catch (error) {
    console.log(`❌ Print validation report test failed: ${error.message}`);
    testResults.push({ name: 'Print Validation Report', passed: false });
  }

  // Test 7: Compare Workflow Results
  console.log('\n🔄 Test 7: Compare Workflow Results');
  console.log('-'.repeat(50));

  try {
    const results = [
      {
        name: 'Fast Workflow',
        validation: {
          isValid: true,
          taskAnalysis: { successRate: 85, total: 4, completed: 3 },
          errors: [],
          warnings: [],
        },
      },
      {
        name: 'Slow Workflow',
        validation: {
          isValid: true,
          taskAnalysis: { successRate: 95, total: 5, completed: 5 },
          errors: [],
          warnings: [],
        },
      },
      {
        name: 'Failed Workflow',
        validation: {
          isValid: false,
          taskAnalysis: { successRate: 40, total: 5, completed: 2 },
          errors: ['Critical failure'],
          warnings: ['Low success rate'],
        },
      },
    ];

    console.log('Testing compareWorkflowResults function:');
    compareWorkflowResults(results);

    testResults.push({ name: 'Compare Workflow Results', passed: true });
  } catch (error) {
    console.log(`❌ Compare workflow results test failed: ${error.message}`);
    testResults.push({ name: 'Compare Workflow Results', passed: false });
  }

  // Test Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 WORKFLOW VALIDATOR TEST SUMMARY');
  console.log('='.repeat(70));

  const passedTests = testResults.filter((test) => test.passed).length;
  const totalTests = testResults.length;

  testResults.forEach((test, index) => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${test.name}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log(
    `📊 RESULTS: ${passedTests}/${totalTests} tests passed (${(
      (passedTests / totalTests) *
      100
    ).toFixed(1)}%)`
  );

  if (passedTests === totalTests) {
    console.log('🎉 ALL WORKFLOW VALIDATOR TESTS PASSED!');
    console.log('✅ WorkflowValidator utility is fully functional.');
  } else {
    console.log('⚠️  SOME WORKFLOW VALIDATOR TESTS FAILED!');
    console.log('❌ Please investigate failing tests.');
  }

  return { passedTests, totalTests, results: testResults };
}

// Run WorkflowValidator tests
if (require.main === module) {
  testWorkflowValidator()
    .then(({ passedTests, totalTests }) => {
      process.exit(passedTests === totalTests ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ WorkflowValidator tests failed:', error);
      process.exit(1);
    });
}

module.exports = { testWorkflowValidator };
