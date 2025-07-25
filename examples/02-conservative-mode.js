/**
 * Example 02: Conservative Mode
 *
 * This example demonstrates the conservative orchestration mode, which is ideal for:
 * - Production environments
 * - Critical systems
 * - Regulated industries
 * - Teams that prefer predictable, low-risk approaches
 *
 * Key characteristics:
 * - Strict adherence to predefined templates
 * - No autonomous task generation
 * - Minimal task adaptation
 * - Static prioritization
 * - Focus on stability and predictability
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import specialized agents for a production team
const {
  seniorDeveloper,
  securityExpert,
  qaEngineer,
  devOpsEngineer,
} = require('./utils/agents');

const {
  securityAuditTask,
  writeUnitTestsTask,
  setupMonitoringTask,
  dockerizeApplicationTask,
} = require('./utils/tasks');

async function runConservativeOrchestrationExample() {
  console.log('🛡️  KaibanJS Conservative Mode Orchestration Example\n');
  console.log(
    'This example demonstrates conservative orchestration for production environments.\n'
  );

  // Create production-ready tasks with strict requirements
  const productionTaskRepository = [
    // Security is non-negotiable in conservative mode
    securityAuditTask, // This task has adaptable: false

    // Critical infrastructure tasks
    new Task({
      description: 'Implement comprehensive logging and audit trail',
      expectedOutput:
        'Centralized logging system with tamper-proof audit trails',
      agent: devOpsEngineer,
      adaptable: false, // Critical task - no modifications allowed
      template: true,
      orchestrationRules:
        'CRITICAL: Must comply with regulatory requirements. No modifications.',
      resourceRequirements: {
        estimatedTime: '4-5 hours',
        skillsRequired: ['logging', 'security', 'compliance'],
        dependencies: ['infrastructure_setup'],
      },
    }),

    // Database backup and recovery
    new Task({
      description: 'Set up automated database backup and recovery procedures',
      expectedOutput: 'Automated backup system with tested recovery procedures',
      agent: devOpsEngineer,
      adaptable: false, // Critical for data protection
      template: true,
      orchestrationRules:
        'CRITICAL: Must ensure zero data loss. Follow 3-2-1 backup rule.',
      resourceRequirements: {
        estimatedTime: '5-6 hours',
        skillsRequired: ['database', 'backup', 'disaster_recovery'],
        dependencies: ['database_setup'],
      },
    }),

    // Minimal adaptation allowed for these tasks
    writeUnitTestsTask,
    setupMonitoringTask,
    dockerizeApplicationTask,

    // Health check implementation
    new Task({
      description: 'Implement comprehensive health check endpoints',
      expectedOutput: 'Health check system monitoring all critical services',
      agent: seniorDeveloper,
      adaptable: true, // Some adaptation allowed
      template: true,
      orchestrationRules:
        'Must include database, cache, and external service checks',
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['backend', 'monitoring', 'api_design'],
        dependencies: ['api_implementation'],
      },
    }),
  ];

  console.log(
    `🔒 Production Task Repository: ${productionTaskRepository.length} carefully vetted tasks\n`
  );

  // Debug: Check agents have API keys
  console.log('Debug - Checking agents:');
  console.log(
    'seniorDeveloper apiKey:',
    seniorDeveloper.llmConfig?.apiKey ? 'Present' : 'Missing'
  );
  console.log(
    'securityExpert apiKey:',
    securityExpert.llmConfig?.apiKey ? 'Present' : 'Missing'
  );
  console.log(
    'qaEngineer apiKey:',
    qaEngineer.llmConfig?.apiKey ? 'Present' : 'Missing'
  );
  console.log(
    'devOpsEngineer apiKey:',
    devOpsEngineer.llmConfig?.apiKey ? 'Present' : 'Missing'
  );

  // Create a conservative team configuration
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.1, // Very low temperature for conservative mode
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3, // More retries for reliability
  });
  const productionTeam = new Team({
    name: 'Production Deployment Team',
    agents: [seniorDeveloper, securityExpert, qaEngineer, devOpsEngineer],
    tasks: [], // Start empty, let orchestrator select

    // Enable orchestration
    enableOrchestration: true,

    // Conservative mode - minimal risk
    mode: 'conservative',

    // Use initial-only orchestration for predictable deployment
    continuousOrchestration: false,

    // Provide vetted task repository
    availableTemplateTasks: productionTaskRepository,

    // IMPORTANT: Disable task generation in conservative mode
    allowTaskGeneration: false,

    // Detailed strategy for production deployment
    orchestrationStrategy: `
      You are orchestrating a PRODUCTION deployment for a financial services application.
      
      CRITICAL REQUIREMENTS:
      1. Security is paramount - no compromises
      2. Zero downtime deployment required
      3. Full compliance with financial regulations
      4. Comprehensive audit trails for all operations
      
      CONSTRAINTS:
      - NO experimental features or approaches
      - All changes must be reversible
      - Every feature must have monitoring
      - Minimum 90% test coverage required
      
      PRIORITIES (in strict order):
      1. Security and compliance
      2. Data integrity and backup
      3. Monitoring and observability
      4. Performance and scalability
      
      RISK TOLERANCE: ZERO
      - Do not modify critical tasks marked as non-adaptable
      - Follow all orchestration rules exactly
      - When in doubt, choose the safer option
    `,

    // Static prioritization - predictable order
    taskPrioritization: 'static',

    // Balanced workload - avoid overloading any agent
    workloadDistribution: 'balanced',

    // Limit concurrent tasks for better control
    maxActiveTasks: 2,

    // Conservative LLM settings
    llmInstance: orchestrationLLM,
  });

  console.log('✅ Production team configured with conservative settings\n');
  console.log('Configuration Details:');
  console.log(`- Mode: ${productionTeam.mode} (risk-averse)`);
  console.log(
    `- Task Generation: ${
      productionTeam.allowTaskGeneration ? 'Enabled' : 'Disabled'
    }`
  );
  console.log(`- Prioritization: ${productionTeam.taskPrioritization}`);
  console.log(`- Max Concurrent Tasks: ${productionTeam.maxActiveTasks}`);
  console.log(`- LLM Temperature: 0.1 (deterministic)\n`);

  try {
    // Activate conservative orchestration
    console.log(
      '🎯 Activating conservative orchestration for production deployment...\n'
    );

    const deploymentGoal =
      'Prepare secure production deployment with zero downtime and full compliance';
    const selectedTasks = await productionTeam.activateOrchestration(
      deploymentGoal,
      true
    );

    console.log(
      `\n📋 Conservative Orchestrator selected ${selectedTasks.length} tasks:\n`
    );

    // Display selected tasks with their constraints
    selectedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.description}`);
      console.log(`   Agent: ${task.agent.name} (${task.agent.role})`);
      console.log(
        `   Adaptable: ${
          task.adaptable ? 'Yes (limited)' : 'NO - CRITICAL TASK'
        }`
      );
      if (task.orchestrationRules) {
        console.log(`   Rules: ${task.orchestrationRules.split('\n')[0]}`);
      }
      console.log('');
    });

    // Analyze conservative decisions
    console.log('🔍 Conservative Mode Analysis:\n');
    console.log('The orchestrator in conservative mode:');
    console.log('1. Selected only pre-approved tasks from the repository');
    console.log('2. Prioritized security and compliance tasks first');
    console.log('3. Respected all non-adaptable task constraints');
    console.log('4. Chose a safe, predictable execution order');
    console.log('5. Avoided any experimental or risky approaches\n');

    // Demonstrate what happens if we try to use non-conservative features
    console.log('⚠️  Conservative Mode Restrictions:\n');

    // Try to generate a task (will fail)
    if (!productionTeam.allowTaskGeneration) {
      console.log('❌ Task generation is disabled in conservative mode');
      console.log('   This prevents unpredictable AI-generated tasks\n');
    }

    // Show task adaptation limitations
    const criticalTask = selectedTasks.find((t) => !t.adaptable);
    if (criticalTask) {
      console.log(`❌ Task "${criticalTask.description}" cannot be modified`);
      console.log('   Critical tasks maintain their exact specifications\n');
    }

    // Production safety features
    console.log('🛡️  Production Safety Features:\n');
    console.log('1. All tasks have been pre-vetted by the team');
    console.log('2. Critical tasks are locked against modifications');
    console.log('3. Low LLM temperature ensures consistent decisions');
    console.log('4. Static prioritization provides predictable execution');
    console.log('5. No surprises - everything follows the plan\n');

    // Best practices for conservative mode
    console.log('📚 Best Practices for Conservative Mode:\n');
    console.log(
      '1. Thoroughly test all template tasks before adding to repository'
    );
    console.log('2. Mark security and compliance tasks as non-adaptable');
    console.log('3. Use detailed orchestrationRules for each task');
    console.log('4. Keep LLM temperature low (0.1-0.2) for consistency');
    console.log('5. Disable task generation for production environments');
    console.log('6. Implement comprehensive logging for audit trails');
    console.log('7. Use static prioritization for predictable workflows');
  } catch (error) {
    console.error('❌ Conservative orchestration error:', error.message);

    // In conservative mode, we want detailed error handling
    console.log('\n🚨 Error Handling in Conservative Mode:');
    console.log('1. Log all errors to audit system');
    console.log('2. Trigger alerts to operations team');
    console.log('3. Initiate rollback procedures if needed');
    console.log('4. Document incident for compliance');
  }

  // Summary of conservative mode benefits
  console.log('\n✅ Conservative Mode Benefits:\n');
  console.log('• Predictable and stable task execution');
  console.log('• Reduced risk of unexpected behaviors');
  console.log('• Compliance-friendly with full audit trails');
  console.log('• Ideal for production and regulated environments');
  console.log('• Easy to review and approve workflows');
  console.log('• Consistent results across multiple runs');
}

// Run the example
if (require.main === module) {
  runConservativeOrchestrationExample()
    .then(() => console.log('\n✅ Conservative mode example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runConservativeOrchestrationExample };
