/**
 * Workflow Result Validation Utilities
 *
 * This module provides comprehensive validation and analysis tools for KaibanJS WorkflowResult objects.
 * It helps validate task execution, analyze performance metrics, and provide detailed reporting
 * for different orchestration modes (basic, conservative, innovative).
 */

/**
 * Validates a WorkflowResult and provides detailed analysis
 * @param {Object} workflowResult - The result from team.start()
 * @param {Object} team - The team instance for accessing state
 * @param {Object} options - Validation options
 * @returns {Object} Detailed validation report
 */
function validateWorkflowResult(workflowResult, team, options = {}) {
  const {
    mode = 'adaptive',
    expectedMinTasks = 1,
    expectedSuccessRate = 50, // percentage
    logLevel: _logLevel = 'detailed', // 'summary', 'detailed', 'verbose'
  } = options;

  const teamState = team.store.getState();
  const tasks = teamState.tasks || [];

  // Basic result validation
  const validation = {
    isValid: true,
    status: null, // Will be set after null check
    executionTime: null,
    errors: [],
    warnings: [],
    summary: {},
    taskAnalysis: {},
    performance: {},
    recommendations: [],
  };

  try {
    // Validate basic structure
    if (!workflowResult) {
      validation.errors.push('WorkflowResult is null or undefined');
      validation.isValid = false;
      return validation;
    }

    // Set status after null check
    validation.status = workflowResult.status;

    if (!workflowResult.status) {
      validation.errors.push('WorkflowResult missing status field');
      validation.isValid = false;
    }

    // Analyze task states
    const completedTasks = tasks.filter((t) => t.status === 'DONE');
    const failedTasks = tasks.filter((t) => t.status === 'ERROR');
    const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
    const inProgressTasks = tasks.filter((t) => t.status === 'DOING');
    const todoTasks = tasks.filter((t) => t.status === 'TODO');

    validation.taskAnalysis = {
      total: tasks.length,
      completed: completedTasks.length,
      failed: failedTasks.length,
      blocked: blockedTasks.length,
      inProgress: inProgressTasks.length,
      todo: todoTasks.length,
      successRate:
        tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
    };

    // Validate task completion expectations
    if (tasks.length < expectedMinTasks) {
      validation.warnings.push(
        `Only ${tasks.length} tasks found, expected at least ${expectedMinTasks}`
      );
    }

    if (validation.taskAnalysis.successRate < expectedSuccessRate) {
      validation.warnings.push(
        `Success rate ${validation.taskAnalysis.successRate.toFixed(
          1
        )}% below expected ${expectedSuccessRate}%`
      );
    }

    // Analyze workflow status
    validation.summary = {
      workflowStatus: workflowResult.status,
      finalResult: workflowResult.result || 'No final result',
      hasStats: !!workflowResult.stats,
      taskExecutionComplete:
        todoTasks.length === 0 && inProgressTasks.length === 0,
      hasFailures: failedTasks.length > 0,
      hasBlockedTasks: blockedTasks.length > 0,
    };

    // Performance analysis
    if (workflowResult.stats) {
      validation.performance = {
        totalTasks: workflowResult.stats.totalTasks || 0,
        completedTasks: workflowResult.stats.completedTasks || 0,
        failedTasks: workflowResult.stats.failedTasks || 0,
        executionTimeMs: workflowResult.stats.executionTime || null,
      };
    }

    // Mode-specific validations
    if (mode === 'conservative') {
      validateConservativeMode(validation, tasks, workflowResult);
    } else if (mode === 'innovative') {
      validateInnovativeMode(validation, tasks, workflowResult);
    } else {
      validateAdaptiveMode(validation, tasks, workflowResult);
    }

    // Generate recommendations
    generateRecommendations(validation, mode);
  } catch (error) {
    validation.errors.push(`Validation error: ${error.message}`);
    validation.isValid = false;
  }

  return validation;
}

/**
 * Conservative mode specific validations
 */
function validateConservativeMode(validation, tasks, _workflowResult) {
  const criticalTasks = tasks.filter((t) => !t.adaptable);
  const adaptableTasks = tasks.filter((t) => t.adaptable);

  validation.conservativeAnalysis = {
    criticalTasks: criticalTasks.length,
    adaptableTasks: adaptableTasks.length,
    criticalTasksCompleted: criticalTasks.filter((t) => t.status === 'DONE')
      .length,
    criticalTasksFailed: criticalTasks.filter((t) => t.status === 'ERROR')
      .length,
  };

  // Critical tasks should not fail in conservative mode
  if (validation.conservativeAnalysis.criticalTasksFailed > 0) {
    validation.errors.push(
      `${validation.conservativeAnalysis.criticalTasksFailed} critical tasks failed - unacceptable in conservative mode`
    );
    validation.isValid = false;
  }

  // Conservative mode should have high predictability
  if (validation.taskAnalysis.successRate < 90) {
    validation.warnings.push(
      'Conservative mode should achieve >90% success rate'
    );
  }
}

/**
 * Innovative mode specific validations
 */
function validateInnovativeMode(validation, tasks, _workflowResult) {
  // In innovative mode, we expect some AI-generated tasks and experimentation
  validation.innovativeAnalysis = {
    experimentalTasks: tasks.filter((t) => t.adaptable).length,
    foundationalTasks: tasks.filter((t) => !t.adaptable).length,
    // Note: Would need task generation tracking to validate AI-generated tasks
  };

  // Innovative mode can tolerate lower success rates due to experimentation
  if (validation.taskAnalysis.successRate < 30) {
    validation.warnings.push(
      'Even in innovative mode, <30% success rate indicates potential issues'
    );
  }

  // High failure rate can be positive in innovation context
  if (validation.taskAnalysis.failed > 0) {
    validation.recommendations.push(
      'Failed experiments provide valuable learning opportunities'
    );
  }
}

/**
 * Adaptive mode specific validations
 */
function validateAdaptiveMode(validation, tasks, _workflowResult) {
  validation.adaptiveAnalysis = {
    adaptableTasks: tasks.filter((t) => t.adaptable).length,
    fixedTasks: tasks.filter((t) => !t.adaptable).length,
    balanceRatio:
      tasks.length > 0
        ? (tasks.filter((t) => t.adaptable).length / tasks.length) * 100
        : 0,
  };

  // Adaptive mode should have a good balance
  if (
    validation.adaptiveAnalysis.balanceRatio < 30 ||
    validation.adaptiveAnalysis.balanceRatio > 90
  ) {
    validation.warnings.push(
      'Adaptive mode works best with 30-90% adaptable tasks'
    );
  }
}

/**
 * Generate mode-specific recommendations
 */
function generateRecommendations(validation, mode) {
  if (validation.taskAnalysis.failed > 0) {
    validation.recommendations.push(
      'Review failed tasks for potential improvements'
    );
  }

  if (validation.taskAnalysis.blocked > 0) {
    validation.recommendations.push(
      'Resolve blocked tasks to complete workflow'
    );
  }

  if (validation.taskAnalysis.successRate < 70) {
    validation.recommendations.push(
      'Consider reviewing task definitions and agent capabilities'
    );
  }

  // Mode-specific recommendations
  switch (mode) {
    case 'conservative':
      if (validation.taskAnalysis.failed > 0) {
        validation.recommendations.push(
          'Conservative mode: Consider additional testing and validation'
        );
      }
      break;
    case 'innovative':
      if (validation.taskAnalysis.successRate > 90) {
        validation.recommendations.push(
          'Innovative mode: Consider more experimental approaches'
        );
      }
      break;
    case 'adaptive':
      validation.recommendations.push(
        'Adaptive mode: Monitor and adjust based on performance patterns'
      );
      break;
  }
}

/**
 * Pretty print a validation report
 */
function printValidationReport(validation, options = {}) {
  const {
    logLevel: _logLevel = 'detailed',
    includeTaskDetails: _includeTaskDetails = true,
  } = options;

  console.log('\n📊 WORKFLOW VALIDATION REPORT\n' + '='.repeat(50));

  // Status overview
  const statusIcon = validation.isValid ? '✅' : '❌';
  console.log(
    `${statusIcon} Overall Status: ${validation.isValid ? 'VALID' : 'INVALID'}`
  );
  console.log(`🔄 Workflow Status: ${validation.status || 'UNKNOWN'}`);

  if (validation.summary.finalResult) {
    console.log(`🎯 Final Result: ${validation.summary.finalResult}`);
  }

  // Task analysis
  console.log('\n📋 TASK ANALYSIS:');
  console.log(`- Total Tasks: ${validation.taskAnalysis.total}`);
  console.log(`- Completed: ${validation.taskAnalysis.completed} ✅`);
  console.log(`- Failed: ${validation.taskAnalysis.failed} ❌`);
  console.log(`- Blocked: ${validation.taskAnalysis.blocked} 🚧`);
  console.log(`- In Progress: ${validation.taskAnalysis.inProgress} 🔄`);
  console.log(`- Todo: ${validation.taskAnalysis.todo} 📝`);
  console.log(
    `- Success Rate: ${validation.taskAnalysis.successRate.toFixed(1)}%`
  );

  // Performance metrics
  if (
    validation.performance &&
    Object.keys(validation.performance).length > 0
  ) {
    console.log('\n⚡ PERFORMANCE METRICS:');
    Object.entries(validation.performance).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        console.log(`- ${key}: ${value}`);
      }
    });
  }

  // Mode-specific analysis
  if (validation.conservativeAnalysis) {
    console.log('\n🛡️ CONSERVATIVE MODE ANALYSIS:');
    console.log(
      `- Critical Tasks: ${validation.conservativeAnalysis.criticalTasks}`
    );
    console.log(
      `- Critical Tasks Completed: ${validation.conservativeAnalysis.criticalTasksCompleted}`
    );
    console.log(
      `- Critical Task Failures: ${validation.conservativeAnalysis.criticalTasksFailed}`
    );
  }

  if (validation.innovativeAnalysis) {
    console.log('\n🚀 INNOVATIVE MODE ANALYSIS:');
    console.log(
      `- Experimental Tasks: ${validation.innovativeAnalysis.experimentalTasks}`
    );
    console.log(
      `- Foundational Tasks: ${validation.innovativeAnalysis.foundationalTasks}`
    );
  }

  if (validation.adaptiveAnalysis) {
    console.log('\n🎯 ADAPTIVE MODE ANALYSIS:');
    console.log(
      `- Adaptable Tasks: ${validation.adaptiveAnalysis.adaptableTasks}`
    );
    console.log(`- Fixed Tasks: ${validation.adaptiveAnalysis.fixedTasks}`);
    console.log(
      `- Balance Ratio: ${validation.adaptiveAnalysis.balanceRatio.toFixed(1)}%`
    );
  }

  // Errors and warnings
  if (validation.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    validation.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    validation.warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }

  // Recommendations
  if (validation.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    validation.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  console.log('\n' + '='.repeat(50));
}

/**
 * Compare multiple workflow results
 */
function compareWorkflowResults(results) {
  console.log('\n📊 WORKFLOW COMPARISON ANALYSIS\n' + '='.repeat(50));

  results.forEach((result, index) => {
    const { name, validation } = result;
    console.log(`\n${index + 1}. ${name.toUpperCase()}:`);
    console.log(`   Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(
      `   Tasks: ${validation.taskAnalysis.total} total, ${validation.taskAnalysis.completed} completed`
    );
    console.log(
      `   Success Rate: ${validation.taskAnalysis.successRate.toFixed(1)}%`
    );
    console.log(
      `   Errors: ${validation.errors.length}, Warnings: ${validation.warnings.length}`
    );
  });

  // Best performing result
  const bestResult = results.reduce((best, current) =>
    current.validation.taskAnalysis.successRate >
    best.validation.taskAnalysis.successRate
      ? current
      : best
  );

  console.log(
    `\n🏆 BEST PERFORMING: ${
      bestResult.name
    } (${bestResult.validation.taskAnalysis.successRate.toFixed(
      1
    )}% success rate)`
  );
  console.log('='.repeat(50));
}

module.exports = {
  validateWorkflowResult,
  printValidationReport,
  compareWorkflowResults,
};
