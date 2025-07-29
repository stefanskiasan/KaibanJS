/**
 * Example 15: Runtime Orchestration Control
 *
 * This example demonstrates how to dynamically control orchestration behavior
 * during workflow execution using the setContinuousOrchestration() method.
 *
 * Features demonstrated:
 * - Runtime switching between orchestration modes
 * - Phase-based orchestration control
 * - Performance vs quality trade-offs
 * - Dynamic team reconfiguration
 * - Context-aware orchestration decisions
 * - Hybrid orchestration strategies
 *
 * Use cases:
 * - Project phase transitions (exploration → production)
 * - Resource availability changes
 * - Quality vs speed requirements
 * - Emergency response scenarios
 * - Budget-conscious optimization
 */

require('dotenv').config();
const { Task, Team } = require('kaibanjs');

// Import agents and utilities
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  qaEngineer,
  productManager: projectManager,
} = require('./utils/agents');

async function runRuntimeOrchestrationControlExample() {
  console.log('🎛️  KaibanJS Runtime Orchestration Control Example\n');
  console.log(
    'Demonstrating dynamic orchestration mode switching during workflow execution.\n'
  );

  // Create a comprehensive task repository for different project phases
  const projectTaskRepository = [
    // Exploration Phase Tasks
    new Task({
      description: 'Research and prototype new feature concepts',
      expectedOutput:
        'Feature concept validation and technical feasibility report',
      agent: seniorDeveloper,
      adaptable: true,
      dynamicPriority: true,
      orchestrationRules: 'Exploration phase - high adaptability needed',
      resourceRequirements: {
        estimatedTime: '3-5 hours',
        skillsRequired: ['research', 'prototyping', 'innovation'],
        dependencies: [],
        phase: 'exploration',
      },
    }),

    new Task({
      description: 'Design user experience wireframes and user flows',
      expectedOutput: 'Complete UX design with user journey mapping',
      agent: frontendDeveloper,
      adaptable: true,
      orchestrationRules: 'Creative phase - allow AI to explore alternatives',
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['ux_design', 'user_research', 'wireframing'],
        dependencies: ['concept_validation'],
        phase: 'exploration',
      },
    }),

    // Development Phase Tasks
    new Task({
      description: 'Implement core application architecture',
      expectedOutput: 'Robust, scalable application foundation',
      agent: backendDeveloper,
      adaptable: false, // Less adaptable in production phase
      orchestrationRules:
        'Production phase - prioritize stability and efficiency',
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['backend', 'architecture', 'scalability'],
        dependencies: ['design_approved'],
        phase: 'development',
      },
    }),

    new Task({
      description: 'Build responsive frontend components',
      expectedOutput: 'Production-ready UI components with testing',
      agent: frontendDeveloper,
      adaptable: false,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['frontend', 'responsive_design', 'components'],
        dependencies: ['architecture_complete'],
        phase: 'development',
      },
    }),

    // Quality Assurance Tasks
    new Task({
      description: 'Create comprehensive test suite and quality gates',
      expectedOutput: 'Complete testing framework with >95% coverage',
      agent: qaEngineer,
      adaptable: false,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['testing', 'quality_assurance', 'automation'],
        dependencies: ['components_complete'],
        phase: 'quality',
      },
    }),

    // Deployment Tasks
    new Task({
      description: 'Configure production deployment and monitoring',
      expectedOutput: 'Production-ready deployment with monitoring',
      agent: seniorDeveloper,
      adaptable: false,
      resourceRequirements: {
        estimatedTime: '2-4 hours',
        skillsRequired: ['deployment', 'monitoring', 'production'],
        dependencies: ['testing_complete'],
        phase: 'deployment',
      },
    }),
  ];

  // Project phase configuration
  const projectPhases = {
    exploration: {
      name: 'Exploration & Research',
      continuousOrchestration: true, // High adaptability
      mode: 'innovative',
      allowTaskGeneration: true,
      maxActiveTasks: 2,
      description: 'Discovery phase with high flexibility and AI creativity',
    },
    development: {
      name: 'Core Development',
      continuousOrchestration: false, // More predictable
      mode: 'adaptive',
      allowTaskGeneration: false,
      maxActiveTasks: 4,
      description: 'Structured development with balanced efficiency',
    },
    quality: {
      name: 'Quality Assurance',
      continuousOrchestration: true, // Adaptive quality control
      mode: 'conservative',
      allowTaskGeneration: true, // Allow additional tests if needed
      maxActiveTasks: 3,
      description: 'Quality-focused with selective adaptability',
    },
    deployment: {
      name: 'Production Deployment',
      continuousOrchestration: false, // Minimize risks
      mode: 'conservative',
      allowTaskGeneration: false,
      maxActiveTasks: 2,
      description: 'Stable and predictable deployment process',
    },
  };

  // Create team with initial configuration
  const adaptiveTeam = new Team({
    name: 'Runtime Adaptive Development Team',
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      qaEngineer,
      projectManager,
    ],
    tasks: [],

    // Initial configuration (Exploration phase)
    enableOrchestration: true,
    continuousOrchestration: true,
    backlogTasks: projectTaskRepository,
    allowTaskGeneration: true,
    mode: 'innovative',
    maxActiveTasks: 2,

    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',

    orchestrationStrategy: `
      You are managing a dynamic software project that transitions through multiple phases.
      Each phase has different requirements for orchestration behavior:
      
      CURRENT PHASE: Will be updated dynamically
      
      ORCHESTRATION PRINCIPLES:
      - Adapt orchestration style to project phase requirements
      - Balance quality, speed, and innovation based on context
      - Optimize resource allocation for current objectives
      - Maintain workflow continuity during transitions
      
      PHASE-SPECIFIC BEHAVIORS:
      - Exploration: Maximum creativity and adaptability
      - Development: Balanced efficiency and quality
      - Quality: Conservative with selective improvements
      - Deployment: Minimal risk, maximum stability
    `,

    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxRetries: 2,
    },
  });

  console.log('✅ Adaptive team created with runtime control capabilities\n');

  // Simulate project execution with phase transitions
  try {
    // PHASE 1: EXPLORATION
    console.log('🔬 PHASE 1: EXPLORATION & RESEARCH');
    console.log('═'.repeat(50));
    console.log(`Mode: ${projectPhases.exploration.mode}`);
    console.log(
      `Continuous Orchestration: ${projectPhases.exploration.continuousOrchestration}`
    );
    console.log(
      `Task Generation: ${projectPhases.exploration.allowTaskGeneration}`
    );
    console.log(`Description: ${projectPhases.exploration.description}\n`);

    // Configure for exploration phase
    adaptiveTeam.updateOrchestrationMode(projectPhases.exploration.mode);
    adaptiveTeam.setContinuousOrchestration(
      projectPhases.exploration.continuousOrchestration
    );

    const explorationGoal =
      'Explore innovative solutions and validate feasibility of new product features';

    const explorationTasks = await adaptiveTeam.activateOrchestration(
      explorationGoal
    );

    console.log(
      `🎯 AI selected ${explorationTasks.length} tasks for exploration:`
    );
    explorationTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description}`);
    });

    console.log('\n📊 Exploration Phase Characteristics:');
    console.log('   • High creativity and innovation focus');
    console.log('   • Continuous AI optimization after each discovery');
    console.log('   • AI can generate new research tasks dynamically');
    console.log('   • Emphasis on learning and validation');

    // Simulate phase transition
    console.log('\n⏰ Phase transition triggered: Moving to Development\n');

    // PHASE 2: DEVELOPMENT
    console.log('🏗️  PHASE 2: CORE DEVELOPMENT');
    console.log('═'.repeat(50));
    console.log(`Mode: ${projectPhases.development.mode}`);
    console.log(
      `Continuous Orchestration: ${projectPhases.development.continuousOrchestration}`
    );
    console.log(
      `Task Generation: ${projectPhases.development.allowTaskGeneration}`
    );
    console.log(`Description: ${projectPhases.development.description}\n`);

    // Runtime reconfiguration for development phase
    adaptiveTeam.updateOrchestrationMode(projectPhases.development.mode);
    adaptiveTeam.setContinuousOrchestration(
      projectPhases.development.continuousOrchestration
    );

    const developmentGoal =
      'Build robust, scalable application based on validated concepts';

    // Note: In real implementation, this would build upon previous phase results
    const developmentTasks = await adaptiveTeam.activateOrchestration(
      developmentGoal
    );

    console.log(
      `🎯 AI selected ${developmentTasks.length} tasks for development:`
    );
    developmentTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description}`);
    });

    console.log('\n📊 Development Phase Characteristics:');
    console.log('   • Initial-only orchestration for predictable workflow');
    console.log('   • Balanced approach between innovation and efficiency');
    console.log('   • Focus on scalable, maintainable implementation');
    console.log('   • Higher concurrency for faster delivery');

    // Emergency scenario demonstration
    console.log(
      '\n🚨 EMERGENCY SCENARIO: Critical bug detected in production!'
    );
    console.log(
      '   Switching to continuous orchestration for rapid response...\n'
    );

    // Runtime switch for emergency
    adaptiveTeam.setContinuousOrchestration(true);
    adaptiveTeam.updateOrchestrationMode('learning');

    console.log('🔄 Emergency Response Mode Activated:');
    console.log('   • Continuous orchestration: ENABLED');
    console.log('   • Mode: learning (rapid adaptation)');
    console.log('   • Priority: immediate issue resolution');
    console.log('   • AI will continuously analyze and adapt strategy');

    // Simulate emergency resolution
    console.log('   • AI analyzing bug impact...');
    console.log('   • Dynamically prioritizing hotfix tasks...');
    console.log('   • Reallocating resources to critical path...');
    console.log('   • Issue resolved! Returning to development phase.\n');

    // Return to development configuration
    adaptiveTeam.setContinuousOrchestration(
      projectPhases.development.continuousOrchestration
    );
    adaptiveTeam.updateOrchestrationMode(projectPhases.development.mode);

    // PHASE 3: QUALITY ASSURANCE
    console.log('🔍 PHASE 3: QUALITY ASSURANCE');
    console.log('═'.repeat(50));
    console.log(`Mode: ${projectPhases.quality.mode}`);
    console.log(
      `Continuous Orchestration: ${projectPhases.quality.continuousOrchestration}`
    );
    console.log(
      `Task Generation: ${projectPhases.quality.allowTaskGeneration}`
    );
    console.log(`Description: ${projectPhases.quality.description}\n`);

    // Configure for quality phase
    adaptiveTeam.updateOrchestrationMode(projectPhases.quality.mode);
    adaptiveTeam.setContinuousOrchestration(
      projectPhases.quality.continuousOrchestration
    );

    const qualityGoal =
      'Ensure comprehensive testing and quality validation before production';

    const qualityTasks = await adaptiveTeam.activateOrchestration(qualityGoal);

    console.log(
      `🎯 AI selected ${qualityTasks.length} tasks for quality assurance:`
    );
    qualityTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description}`);
    });

    console.log('\n📊 Quality Phase Characteristics:');
    console.log('   • Conservative approach with selective improvements');
    console.log('   • Continuous orchestration for quality optimization');
    console.log('   • AI can add tests if coverage gaps detected');
    console.log('   • Focus on reliability and risk mitigation');

    // PHASE 4: DEPLOYMENT
    console.log('\n🚀 PHASE 4: PRODUCTION DEPLOYMENT');
    console.log('═'.repeat(50));
    console.log(`Mode: ${projectPhases.deployment.mode}`);
    console.log(
      `Continuous Orchestration: ${projectPhases.deployment.continuousOrchestration}`
    );
    console.log(
      `Task Generation: ${projectPhases.deployment.allowTaskGeneration}`
    );
    console.log(`Description: ${projectPhases.deployment.description}\n`);

    // Configure for deployment phase
    adaptiveTeam.updateOrchestrationMode(projectPhases.deployment.mode);
    adaptiveTeam.setContinuousOrchestration(
      projectPhases.deployment.continuousOrchestration
    );

    const deploymentGoal =
      'Deploy to production with maximum stability and monitoring';

    const deploymentTasks = await adaptiveTeam.activateOrchestration(
      deploymentGoal
    );

    console.log(
      `🎯 AI selected ${deploymentTasks.length} tasks for deployment:`
    );
    deploymentTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.description}`);
    });

    console.log('\n📊 Deployment Phase Characteristics:');
    console.log('   • Most conservative approach - minimal risks');
    console.log('   • Initial-only orchestration for predictable deployment');
    console.log('   • No task generation - stick to proven procedures');
    console.log('   • Focus on stability and monitoring');
  } catch (error) {
    console.error('❌ Runtime orchestration control error:', error.message);
  }

  // RUNTIME CONTROL PATTERNS
  console.log('\n' + '═'.repeat(80));
  console.log('🎛️  RUNTIME ORCHESTRATION CONTROL PATTERNS');
  console.log('═'.repeat(80));

  console.log('\n📋 Common Control Patterns:\n');

  console.log('1. PHASE-BASED CONTROL:');
  console.log('   team.setContinuousOrchestration(true);  // Exploration');
  console.log('   team.setContinuousOrchestration(false); // Development');
  console.log('   team.setContinuousOrchestration(true);  // Quality');
  console.log('   team.setContinuousOrchestration(false); // Deployment\n');

  console.log('2. RESOURCE-BASED CONTROL:');
  console.log('   if (availableTokens > threshold) {');
  console.log('     team.setContinuousOrchestration(true);');
  console.log('   } else {');
  console.log('     team.setContinuousOrchestration(false);');
  console.log('   }\n');

  console.log('3. PERFORMANCE-BASED CONTROL:');
  console.log('   if (taskVelocity < targetVelocity) {');
  console.log('     team.setContinuousOrchestration(true); // Optimize');
  console.log('   } else {');
  console.log('     team.setContinuousOrchestration(false); // Maintain');
  console.log('   }\n');

  console.log('4. EMERGENCY RESPONSE:');
  console.log('   if (criticalIssueDetected) {');
  console.log('     team.setContinuousOrchestration(true);');
  console.log('     team.updateOrchestrationMode("learning");');
  console.log('   }\n');

  // BEST PRACTICES
  console.log('📚 Best Practices for Runtime Control:\n');

  console.log('✅ DO:');
  console.log('• Plan orchestration strategy for each project phase');
  console.log('• Switch modes based on clear criteria and metrics');
  console.log('• Document orchestration decisions and rationale');
  console.log('• Monitor the impact of orchestration changes');
  console.log('• Use continuous mode for exploration and quality phases');
  console.log('• Use initial-only mode for predictable production phases');
  console.log(
    '• Test orchestration configuration changes in safe environments'
  );
  console.log('• Maintain orchestration state history for analysis\n');

  console.log("❌ DON'T:");
  console.log(
    '• Switch orchestration modes too frequently (causes instability)'
  );
  console.log('• Change modes without clear business justification');
  console.log('• Use continuous orchestration when budget is critical concern');
  console.log('• Switch to initial-only during complex problem-solving phases');
  console.log('• Ignore the cost implications of continuous orchestration');
  console.log('• Change modes during critical task execution');
  console.log('• Use innovative mode for safety-critical deployments\n');

  // DECISION MATRIX
  console.log('🎯 ORCHESTRATION MODE DECISION MATRIX:\n');

  console.log(`
┌─────────────────────┬─────────────────┬─────────────────┬────────────────────┐
│ Scenario            │ Continuous      │ Mode            │ Task Generation    │
├─────────────────────┼─────────────────┼─────────────────┼────────────────────┤
│ Project Start       │ true            │ innovative      │ true               │
│ Requirements Clear  │ false           │ adaptive        │ false              │
│ Bug Fixing          │ true            │ learning        │ true               │
│ Production Deploy   │ false           │ conservative    │ false              │
│ Performance Issues  │ true            │ adaptive        │ true               │
│ Budget Constraints  │ false           │ conservative    │ false              │
│ Quality Problems    │ true            │ conservative    │ true               │
│ Routine Maintenance │ false           │ conservative    │ false              │
└─────────────────────┴─────────────────┴─────────────────┴────────────────────┘
  `);

  // MONITORING RECOMMENDATIONS
  console.log('\n📊 Monitoring Orchestration Effectiveness:\n');
  console.log('1. Track orchestration overhead vs benefits');
  console.log('2. Monitor task completion accuracy improvements');
  console.log('3. Measure team velocity changes');
  console.log('4. Assess quality improvements from continuous optimization');
  console.log('5. Calculate cost-benefit ratio for different modes');
  console.log('6. Document successful orchestration patterns');
  console.log('7. Track emergency response effectiveness');
  console.log('8. Monitor team satisfaction with orchestration decisions');

  console.log('\n🎛️  Runtime Orchestration Control Example completed!');
}

// Run the example
if (require.main === module) {
  runRuntimeOrchestrationControlExample()
    .then(() => {
      console.log(
        '\n✅ Runtime orchestration control example completed successfully!'
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error(
        '\n❌ Runtime orchestration control example failed:',
        error
      );
      process.exit(1);
    });
}

module.exports = { runRuntimeOrchestrationControlExample };
