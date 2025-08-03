/**
 * Systematic Test of All Orchestration Examples After Null Reference Fixes
 *
 * Tests all orchestration examples to ensure the null reference fixes work properly.
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// List of all orchestration examples to test
const examples = [
  // Industry-specific orchestration examples
  '01-healthcare-orchestration.js',
  '02-finance-orchestration.js',
  '03-education-orchestration.js',
  '04-retail-orchestration.js',
  
  // Mode examples
  '02-conservative-mode.js',
  '03-innovative-mode.js',
  '04-learning-mode.js',
  
  // Feature examples
  '05-skills-based-distribution.js',
  '06-ai-driven-prioritization.js',
  '07-task-adaptation.js',
  '08-continuous-optimization.js',
  '09-task-generation.js',
  '10-enterprise-setup.js',
  '11-e-commerce-project.js',
  '12-microservices-architecture.js',
  '14-continuous-vs-initial-comparison.js',
];

const results = [];
let currentExample = 0;

async function runExample(exampleFile) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${exampleFile}`);
    console.log('='.repeat(60));

    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let hasNullErrors = false;
    let hasModifyTasksError = false;
    let hasModelError = false;
    let hasGetStateError = false;

    const child = spawn('node', [exampleFile], {
      cwd: path.join(__dirname),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);

      // Check for specific null reference errors
      if (
        output.includes('Cannot read properties of null') &&
        output.includes('modifyTasks')
      ) {
        hasModifyTasksError = true;
        hasNullErrors = true;
      }
      if (
        output.includes('Cannot read properties of undefined') &&
        output.includes('model')
      ) {
        hasModelError = true;
        hasNullErrors = true;
      }
      if (
        output.includes('Cannot read properties of undefined') &&
        output.includes('getState')
      ) {
        hasGetStateError = true;
        hasNullErrors = true;
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);

      // Check for specific null reference errors in stderr
      if (
        output.includes('Cannot read properties of null') &&
        output.includes('modifyTasks')
      ) {
        hasModifyTasksError = true;
        hasNullErrors = true;
      }
      if (
        output.includes('Cannot read properties of undefined') &&
        output.includes('model')
      ) {
        hasModelError = true;
        hasNullErrors = true;
      }
      if (
        output.includes('Cannot read properties of undefined') &&
        output.includes('getState')
      ) {
        hasGetStateError = true;
        hasNullErrors = true;
      }
    });

    // Set timeout for long-running examples
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({
        example: exampleFile,
        status: 'timeout',
        duration: Date.now() - startTime,
        hasNullErrors,
        errors: {
          modifyTasks: hasModifyTasksError,
          model: hasModelError,
          getState: hasGetStateError,
        },
        stdout: stdout.substring(0, 500) + '...',
        stderr: stderr.substring(0, 500) + '...',
      });
    }, 120000); // 2 minutes timeout

    child.on('close', (code) => {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;

      let status;
      if (code === 0) {
        status = 'success';
      } else if (hasNullErrors) {
        status = 'null_error';
      } else {
        status = 'other_error';
      }

      resolve({
        example: exampleFile,
        status,
        code,
        duration,
        hasNullErrors,
        errors: {
          modifyTasks: hasModifyTasksError,
          model: hasModelError,
          getState: hasGetStateError,
        },
        stdout:
          stdout.length > 1000 ? stdout.substring(0, 1000) + '...' : stdout,
        stderr:
          stderr.length > 1000 ? stderr.substring(0, 1000) + '...' : stderr,
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        example: exampleFile,
        status: 'spawn_error',
        duration: Date.now() - startTime,
        hasNullErrors,
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

async function testAllExamples() {
  console.log('🚀 Starting systematic test of all orchestration examples...\n');
  console.log(`Total examples to test: ${examples.length}\n`);

  for (const example of examples) {
    const result = await runExample(example);
    results.push(result);

    // Print immediate result
    const statusEmoji = {
      success: '✅',
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

    if (result.hasNullErrors) {
      console.log(`   ❌ NULL ERRORS DETECTED:`);
      if (result.errors.modifyTasks) console.log(`      - modifyTasks error`);
      if (result.errors.model) console.log(`      - model error`);
      if (result.errors.getState) console.log(`      - getState error`);
    }

    currentExample++;
    console.log(`\n📊 Progress: ${currentExample}/${examples.length}\n`);
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('🎯 FINAL TEST RESULTS SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter((r) => r.status === 'success').length;
  const nullErrors = results.filter((r) => r.hasNullErrors).length;
  const otherErrors = results.filter((r) => r.status === 'other_error').length;
  const timeouts = results.filter((r) => r.status === 'timeout').length;
  const spawnErrors = results.filter((r) => r.status === 'spawn_error').length;

  console.log(`\n📈 Overall Statistics:`);
  console.log(
    `   ✅ Successful: ${successful}/${examples.length} (${(
      (successful / examples.length) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   ❌ Null Errors: ${nullErrors}/${examples.length} (${(
      (nullErrors / examples.length) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   ⚠️  Other Errors: ${otherErrors}/${examples.length} (${(
      (otherErrors / examples.length) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   ⏰ Timeouts: ${timeouts}/${examples.length} (${(
      (timeouts / examples.length) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   💥 Spawn Errors: ${spawnErrors}/${examples.length} (${(
      (spawnErrors / examples.length) *
      100
    ).toFixed(1)}%)`
  );

  console.log(`\n🔍 Null Reference Error Analysis:`);
  const modifyTasksErrors = results.filter((r) => r.errors?.modifyTasks).length;
  const modelErrors = results.filter((r) => r.errors?.model).length;
  const getStateErrors = results.filter((r) => r.errors?.getState).length;

  console.log(`   - modifyTasks errors: ${modifyTasksErrors}`);
  console.log(`   - model property errors: ${modelErrors}`);
  console.log(`   - getState errors: ${getStateErrors}`);

  if (nullErrors === 0) {
    console.log(`\n🎉 SUCCESS: All null reference errors have been fixed!`);
  } else {
    console.log(
      `\n⚠️  ${nullErrors} examples still have null reference errors`
    );
    console.log(`\nFailed examples:`);
    results
      .filter((r) => r.hasNullErrors)
      .forEach((r) => {
        console.log(`   - ${r.example}: ${r.status}`);
      });
  }

  console.log(`\n📋 Detailed Results:`);
  results.forEach((result) => {
    const statusEmoji = {
      success: '✅',
      null_error: '❌',
      other_error: '⚠️',
      timeout: '⏰',
      spawn_error: '💥',
    };
    console.log(
      `   ${statusEmoji[result.status]} ${result.example} (${(
        result.duration / 1000
      ).toFixed(1)}s)`
    );
  });
}

// Run all tests
testAllExamples()
  .then(() => {
    const nullErrors = results.filter((r) => r.hasNullErrors).length;
    process.exit(nullErrors === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
