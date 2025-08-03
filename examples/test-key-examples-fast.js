/**
 * Fast Test of Key Orchestration Examples After Null Reference Fixes
 *
 * Tests the most important orchestration examples with shorter timeouts
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Key examples that cover the main orchestration features
const keyExamples = [
  // Key industry examples
  '01-healthcare-orchestration.js',
  '02-finance-orchestration.js',
  
  // Key mode examples
  '02-conservative-mode.js',
  '03-innovative-mode.js',
  '04-learning-mode.js',
  
  // Key feature example
  '05-skills-based-distribution.js',
];

const results = [];

async function runExample(exampleFile, timeout = 45000) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${exampleFile}`);
    console.log('-'.repeat(50));

    const startTime = Date.now();
    let hasNullErrors = false;
    let hasModifyTasksError = false;
    let hasModelError = false;
    let hasGetStateError = false;
    let orchestrationStarted = false;
    let tasksCompleted = false;

    const child = spawn('node', [exampleFile], {
      cwd: path.join(__dirname),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const checkOutput = (output) => {
      // Check for specific null reference errors
      if (
        output.includes('Cannot read properties of null') &&
        output.includes('modifyTasks')
      ) {
        hasModifyTasksError = true;
        hasNullErrors = true;
        console.log('❌ FOUND: modifyTasks null error');
      }
      if (
        output.includes('Cannot read properties of undefined') &&
        output.includes('model')
      ) {
        hasModelError = true;
        hasNullErrors = true;
        console.log('❌ FOUND: model undefined error');
      }
      if (
        output.includes('Cannot read properties of undefined') &&
        output.includes('getState')
      ) {
        hasGetStateError = true;
        hasNullErrors = true;
        console.log('❌ FOUND: getState undefined error');
      }

      // Check for positive progress indicators
      if (
        output.includes('Orchestration Activated') ||
        output.includes('Starting intelligent orchestration')
      ) {
        orchestrationStarted = true;
        console.log('✅ Orchestration started successfully');
      }
      if (
        output.includes('Task adapted successfully') ||
        output.includes('Orchestration completed')
      ) {
        console.log('✅ Task adaptation working');
      }
      if (
        output.includes('WORKFLOW - FINISH') ||
        output.includes('Workflow has successfully completed')
      ) {
        tasksCompleted = true;
        console.log('✅ Workflow completed successfully');
      }
    };

    child.stdout.on('data', (data) => {
      const output = data.toString();
      checkOutput(output);
      // Only show key messages to reduce noise
      if (
        output.includes('🧪') ||
        output.includes('✅') ||
        output.includes('❌') ||
        output.includes('Orchestration') ||
        output.includes('Task adapted') ||
        output.includes('WORKFLOW')
      ) {
        process.stdout.write(output);
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      checkOutput(output);
      // Show all stderr (errors)
      process.stderr.write(output);
    });

    // Shorter timeout for faster testing
    const timeoutHandle = setTimeout(() => {
      child.kill('SIGTERM');
      const duration = Date.now() - startTime;

      let status = 'timeout';
      if (orchestrationStarted && !hasNullErrors) {
        status = 'partial_success';
      } else if (hasNullErrors) {
        status = 'null_error';
      }

      console.log(`⏰ Timeout after ${(duration / 1000).toFixed(1)}s`);
      resolve({
        example: exampleFile,
        status,
        duration,
        hasNullErrors,
        orchestrationStarted,
        tasksCompleted,
        errors: {
          modifyTasks: hasModifyTasksError,
          model: hasModelError,
          getState: hasGetStateError,
        },
      });
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timeoutHandle);
      const duration = Date.now() - startTime;

      let status;
      if (code === 0 && !hasNullErrors) {
        status = 'success';
      } else if (hasNullErrors) {
        status = 'null_error';
      } else if (orchestrationStarted && !hasNullErrors) {
        status = 'partial_success';
      } else {
        status = 'other_error';
      }

      resolve({
        example: exampleFile,
        status,
        code,
        duration,
        hasNullErrors,
        orchestrationStarted,
        tasksCompleted,
        errors: {
          modifyTasks: hasModifyTasksError,
          model: hasModelError,
          getState: hasGetStateError,
        },
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeoutHandle);
      resolve({
        example: exampleFile,
        status: 'spawn_error',
        duration: Date.now() - startTime,
        hasNullErrors,
        orchestrationStarted: false,
        tasksCompleted: false,
        errors: {
          modifyTasks: hasModifyTasksError,
          model: hasModelError,
          getState: hasGetStateError,
        },
        error: error.message,
      });
    });
  });
}

async function testKeyExamples() {
  console.log('🚀 Fast testing of key orchestration examples...\n');
  console.log(
    `Testing ${keyExamples.length} key examples with 45s timeout each\n`
  );

  for (const example of keyExamples) {
    const result = await runExample(example);
    results.push(result);

    // Print immediate result
    const statusEmoji = {
      success: '✅',
      partial_success: '🟡',
      null_error: '❌',
      other_error: '⚠️',
      timeout: '⏰',
      spawn_error: '💥',
    };

    console.log(
      `\n${
        statusEmoji[result.status]
      } ${example}: ${result.status.toUpperCase()}`
    );
    console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
    console.log(
      `   Orchestration Started: ${result.orchestrationStarted ? '✅' : '❌'}`
    );
    console.log(`   Tasks Completed: ${result.tasksCompleted ? '✅' : '❌'}`);

    if (result.hasNullErrors) {
      console.log(`   ❌ NULL ERRORS DETECTED:`);
      if (result.errors.modifyTasks) console.log(`      - modifyTasks error`);
      if (result.errors.model) console.log(`      - model error`);
      if (result.errors.getState) console.log(`      - getState error`);
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FAST TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.status === 'success').length;
  const partialSuccess = results.filter(
    (r) => r.status === 'partial_success'
  ).length;
  const nullErrors = results.filter((r) => r.hasNullErrors).length;
  const orchestrationWorking = results.filter(
    (r) => r.orchestrationStarted
  ).length;

  console.log(`\n📈 Overall Statistics:`);
  console.log(`   ✅ Fully Successful: ${successful}/${keyExamples.length}`);
  console.log(
    `   🟡 Partially Successful: ${partialSuccess}/${keyExamples.length}`
  );
  console.log(
    `   🚀 Orchestration Started: ${orchestrationWorking}/${keyExamples.length}`
  );
  console.log(`   ❌ Null Errors: ${nullErrors}/${keyExamples.length}`);

  console.log(`\n🔍 Null Reference Error Analysis:`);
  const modifyTasksErrors = results.filter((r) => r.errors?.modifyTasks).length;
  const modelErrors = results.filter((r) => r.errors?.model).length;
  const getStateErrors = results.filter((r) => r.errors?.getState).length;

  console.log(`   - modifyTasks errors: ${modifyTasksErrors}`);
  console.log(`   - model property errors: ${modelErrors}`);
  console.log(`   - getState errors: ${getStateErrors}`);

  const workingExamples = successful + partialSuccess;

  if (nullErrors === 0 && orchestrationWorking >= keyExamples.length * 0.8) {
    console.log(
      `\n🎉 SUCCESS: All null reference errors fixed and orchestration working!`
    );
    console.log(
      `   ${workingExamples}/${keyExamples.length} examples working properly`
    );
  } else if (nullErrors === 0) {
    console.log(`\n✅ SUCCESS: All null reference errors fixed!`);
    console.log(
      `   ${orchestrationWorking}/${keyExamples.length} examples started orchestration`
    );
  } else {
    console.log(
      `\n⚠️  ${nullErrors} examples still have null reference errors`
    );
  }

  console.log(`\n📋 Detailed Results:`);
  results.forEach((result) => {
    const statusEmoji = {
      success: '✅',
      partial_success: '🟡',
      null_error: '❌',
      other_error: '⚠️',
      timeout: '⏰',
      spawn_error: '💥',
    };
    console.log(
      `   ${statusEmoji[result.status]} ${result.example} (${(
        result.duration / 1000
      ).toFixed(1)}s) - Orch: ${result.orchestrationStarted ? '✅' : '❌'}`
    );
  });

  return nullErrors === 0;
}

// Run key tests
testKeyExamples()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
