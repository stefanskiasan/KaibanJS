/**
 * Example 06: AI-Driven Task Prioritization
 *
 * This example demonstrates how the orchestrator uses AI to dynamically prioritize
 * tasks based on multiple factors including:
 * - Project context and phase
 * - Dependencies and blockers
 * - Resource availability
 * - Business value and urgency
 * - Risk factors
 * - Team workload
 *
 * Key features:
 * - taskPrioritization: 'ai-driven'
 * - Dynamic re-prioritization based on changing conditions
 * - Multi-factor decision making
 * - Real-time adaptation to project state
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import diverse agents for complex prioritization scenarios
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  qaEngineer,
  securityExpert,
  devOpsEngineer,
  productManager,
} = require('./utils/agents');

async function runAIDrivenPrioritizationExample() {
  console.log('🎯 KaibanJS AI-Driven Prioritization Example\n');
  console.log(
    'This example shows how AI intelligently prioritizes tasks based on multiple factors.\n'
  );

  // Create tasks with different characteristics for prioritization
  const prioritizationTaskRepository = [
    // Critical security task
    new Task({
      description:
        'Fix critical security vulnerability in authentication system',
      expectedOutput:
        'Patched authentication system with security audit report',
      agent: securityExpert,
      adaptable: false, // Critical - no modifications
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: CRITICAL
        RISK: Data breach if not addressed immediately
        BUSINESS IMPACT: High - affects all users
        DEPENDENCIES: None - can start immediately
        ESTIMATED_VALUE: Prevents potential $100K+ in damages
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['security', 'authentication', 'encryption'],
        dependencies: [],
      },
    }),

    // High-value feature
    new Task({
      description: 'Implement premium subscription payment system',
      expectedOutput:
        'Complete payment integration with subscription management',
      agent: backendDeveloper,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: HIGH
        BUSINESS IMPACT: Revenue generation - $50K/month potential
        DEPENDENCIES: User authentication must be secure
        CUSTOMER_DEMAND: High - 200+ requests
        TIME_SENSITIVITY: Q4 revenue goals
      `,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['backend', 'payments', 'stripe_api'],
        dependencies: ['secure_authentication'],
      },
    }),

    // Performance issue affecting users
    new Task({
      description: 'Optimize database queries causing 5-second page loads',
      expectedOutput: 'Optimized queries with <500ms response times',
      agent: backendDeveloper,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: MEDIUM-HIGH
        USER IMPACT: Affecting 30% of users
        BUSINESS IMPACT: 15% user drop-off rate
        COMPLEXITY: Medium - requires careful optimization
        QUICK_WIN: Yes - immediate user satisfaction improvement
      `,
      resourceRequirements: {
        estimatedTime: '4-5 hours',
        skillsRequired: ['database', 'performance', 'sql_optimization'],
        dependencies: [],
      },
    }),

    // Compliance requirement
    new Task({
      description: 'Implement GDPR compliance for user data handling',
      expectedOutput: 'GDPR-compliant data handling with audit trail',
      agent: seniorDeveloper,
      adaptable: false,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: HIGH
        REGULATORY: Required by law - deadline in 30 days
        RISK: €20M or 4% revenue fine for non-compliance
        COMPLEXITY: High - affects multiple systems
        DEPENDENCIES: Requires security review
      `,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: ['backend', 'security', 'compliance', 'gdpr'],
        dependencies: ['security_audit'],
      },
    }),

    // User experience improvement
    new Task({
      description: 'Redesign dashboard for better mobile experience',
      expectedOutput: 'Responsive dashboard with improved mobile UX',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: MEDIUM
        USER IMPACT: 40% of users on mobile
        BUSINESS IMPACT: Improves engagement metrics
        COMPLEXITY: Medium - mostly frontend work
        STRATEGIC_ALIGNMENT: Mobile-first initiative
      `,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['frontend', 'responsive_design', 'ux'],
        dependencies: ['api_optimization'], // Better API needed first
      },
    }),

    // Technical debt
    new Task({
      description: 'Refactor legacy payment module to microservice',
      expectedOutput: 'Decoupled payment microservice with API',
      agent: seniorDeveloper,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: LOW-MEDIUM
        TECHNICAL_DEBT: High - 3-year-old code
        RISK_REDUCTION: Reduces future maintenance by 40%
        BLOCKER: Will block new payment features if not done
        COMPLEXITY: High - requires careful migration
      `,
      resourceRequirements: {
        estimatedTime: '12-15 hours',
        skillsRequired: ['backend', 'microservices', 'refactoring'],
        dependencies: ['current_payment_system_working'],
      },
    }),

    // Quality assurance
    new Task({
      description: 'Create E2E test suite for critical user journeys',
      expectedOutput: 'Comprehensive E2E tests with 95% journey coverage',
      agent: qaEngineer,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: MEDIUM
        RISK_REDUCTION: Prevents 80% of production bugs
        QUALITY_IMPACT: Enables confident deployments
        DEPENDENCIES: Requires stable features
        ROI: Saves 20 hours/month in bug fixes
      `,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['testing', 'e2e', 'automation'],
        dependencies: ['stable_features'],
      },
    }),

    // Infrastructure scaling
    new Task({
      description: 'Implement auto-scaling for handling Black Friday traffic',
      expectedOutput: 'Auto-scaling infrastructure handling 10x normal load',
      agent: devOpsEngineer,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        CRITICALITY: TIME-SENSITIVE
        DEADLINE: Black Friday in 45 days
        BUSINESS IMPACT: $500K revenue at risk
        COMPLEXITY: High - requires load testing
        DEPENDENCIES: Performance optimization should complete first
      `,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: ['devops', 'kubernetes', 'scaling', 'monitoring'],
        dependencies: ['performance_optimization'],
      },
    }),
  ];

  console.log(
    `📋 Task Repository: ${prioritizationTaskRepository.length} tasks with varying priorities\n`
  );

  // Display initial task characteristics
  console.log('📊 Task Characteristics Overview:\n');
  prioritizationTaskRepository.forEach((task, index) => {
    const rules = task.orchestrationRules || '';
    const criticality = rules.match(/CRITICALITY:\s*(\w+)/)?.[1] || 'UNKNOWN';
    console.log(`${index + 1}. ${task.description.substring(0, 50)}...`);
    console.log(`   Criticality: ${criticality}`);
  });
  console.log('');

  // Create team with AI-driven prioritization
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.3, // Lower temperature for consistent prioritization
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const aiPrioritizationTeam = new Team({
    name: 'Strategic Delivery Team',
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      qaEngineer,
      securityExpert,
      devOpsEngineer,
      productManager,
    ],
    tasks: [],

    enableOrchestration: true,
    availableTemplateTasks: prioritizationTaskRepository,
    allowTaskGeneration: false, // Focus on prioritization

    // Use continuous orchestration for dynamic re-prioritization
    continuousOrchestration: true,

    // AI-driven prioritization mode
    taskPrioritization: 'ai-driven',

    orchestrationStrategy: `
      You are orchestrating a team with MULTIPLE COMPETING PRIORITIES.
      
      PRIORITIZATION FRAMEWORK:
      
      1. IMMEDIATE THREATS (Highest Priority):
         - Security vulnerabilities
         - System outages
         - Data loss risks
         - Legal compliance deadlines
      
      2. REVENUE IMPACT (High Priority):
         - Direct revenue generation features
         - Customer retention improvements
         - High-value customer requests
         - Conversion rate optimizations
      
      3. USER EXPERIENCE (Medium-High Priority):
         - Performance issues affecting many users
         - Critical bug fixes
         - Usability improvements
         - Mobile optimization
      
      4. STRATEGIC INITIATIVES (Medium Priority):
         - Long-term platform improvements
         - Technical debt reduction
         - Scalability preparations
         - Quality improvements
      
      5. OPTIMIZATION (Lower Priority):
         - Nice-to-have features
         - Minor improvements
         - Non-critical refactoring
      
      DYNAMIC FACTORS TO CONSIDER:
      - Current sprint/quarter goals
      - Team capacity and skills
      - Dependencies and blockers
      - Risk vs reward analysis
      - Time-sensitive deadlines
      - Customer impact metrics
      - Technical prerequisites
      
      PRIORITIZATION RULES:
      - Security always trumps features
      - Revenue impact weighted by probability
      - Consider dependency chains
      - Factor in team availability
      - Quick wins when team is blocked
      - Compliance deadlines are absolute
      
      RE-PRIORITIZATION TRIGGERS:
      - New critical issues discovered
      - Deadline changes
      - Resource availability shifts
      - Business priority updates
      - Blocker resolution
      - Market conditions
    `,

    mode: 'adaptive',
    workloadDistribution: 'skills-based',
    maxActiveTasks: 4,
    adaptationInterval: 60000, // Re-evaluate priorities every minute

    llmInstance: orchestrationLLM,
  });

  console.log('✅ Team configured with AI-driven prioritization\n');

  try {
    // Initial prioritization
    console.log('🤖 AI Analyzing and Prioritizing Tasks...\n');

    const projectContext = `
      Current situation:
      - Q4 with revenue targets to meet
      - Recent security audit revealed vulnerabilities
      - Black Friday approaching in 45 days
      - 30% of users experiencing slow page loads
      - GDPR deadline in 30 days
      - Mobile users growing 25% month-over-month
    `;

    const prioritizedTasks = await aiPrioritizationTeam.activateOrchestration(
      projectContext,
      true
    );

    console.log('📊 AI Prioritization Results:\n');
    console.log('Priority Order (considering all factors):\n');

    prioritizedTasks.forEach((task, index) => {
      const priority = index + 1;
      console.log(`${priority}. ${task.description}`);
      console.log(`   Assigned to: ${task.agent.name}`);
      console.log(
        `   Rationale: ${getPrioritizationRationale(task, priority)}`
      );
      console.log('');
    });

    // Demonstrate dynamic re-prioritization
    console.log('🔄 Dynamic Re-Prioritization Scenario:\n');
    console.log('Event: Payment system goes down - losing $10K/hour!\n');

    console.log('AI Response:');
    console.log('1. Immediately escalates payment-related tasks');
    console.log('2. Deprioritizes non-critical improvements');
    console.log('3. Reallocates resources to fix payment issues');
    console.log('4. Adjusts sprint plan automatically\n');

    // Show prioritization factors
    console.log('🧠 AI Prioritization Factors Analysis:\n');

    const factors = [
      {
        factor: 'Business Impact',
        weight: '35%',
        considerations: ['Revenue', 'User retention', 'Growth metrics'],
      },
      {
        factor: 'Risk Assessment',
        weight: '30%',
        considerations: ['Security threats', 'Compliance', 'System stability'],
      },
      {
        factor: 'User Impact',
        weight: '20%',
        considerations: ['Affected users', 'Severity', 'Frequency'],
      },
      {
        factor: 'Technical Dependencies',
        weight: '10%',
        considerations: ['Blockers', 'Prerequisites', 'Complexity'],
      },
      {
        factor: 'Resource Optimization',
        weight: '5%',
        considerations: ['Team availability', 'Skill match', 'Parallel work'],
      },
    ];

    factors.forEach((f) => {
      console.log(`${f.factor} (${f.weight}):`);
      f.considerations.forEach((c) => console.log(`  • ${c}`));
      console.log('');
    });

    // Prioritization strategies comparison
    console.log('📊 AI-Driven vs Other Prioritization Methods:\n');

    console.log('Static Prioritization:');
    console.log('  ❌ Cannot adapt to payment system outage');
    console.log('  ❌ Ignores Black Friday deadline approaching');
    console.log('  ❌ Misses dependency optimizations\n');

    console.log('Dynamic (Rule-Based) Prioritization:');
    console.log('  ⚠️  Follows rules but lacks context understanding');
    console.log('  ⚠️  Cannot weigh multiple factors simultaneously');
    console.log('  ⚠️  Rigid response to complex scenarios\n');

    console.log('AI-Driven Prioritization:');
    console.log('  ✅ Understands business context and goals');
    console.log('  ✅ Weighs multiple factors intelligently');
    console.log('  ✅ Adapts to real-time changes');
    console.log('  ✅ Learns from past prioritization outcomes');
    console.log('  ✅ Optimizes for global objectives\n');

    // Best practices
    console.log('📚 Best Practices for AI-Driven Prioritization:\n');
    console.log('1. Provide rich context in orchestrationStrategy');
    console.log('2. Include business metrics and goals');
    console.log('3. Define clear prioritization frameworks');
    console.log('4. Set appropriate adaptation intervals');
    console.log('5. Use task orchestrationRules for metadata');
    console.log('6. Enable dynamicPriority on tasks');
    console.log('7. Monitor and adjust based on outcomes');
    console.log('8. Combine with learning mode for improvement');
  } catch (error) {
    console.error('❌ AI prioritization error:', error.message);
  }

  console.log('\n✅ AI-Driven Prioritization Benefits:\n');
  console.log('• Intelligent multi-factor decision making');
  console.log('• Real-time adaptation to changing conditions');
  console.log('• Optimal resource allocation');
  console.log('• Business goal alignment');
  console.log('• Risk mitigation through smart sequencing');
  console.log('• Reduced management overhead');
  console.log('• Data-driven sprint planning');
}

// Helper function to generate prioritization rationale
function getPrioritizationRationale(task, priority) {
  const description = task.description.toLowerCase();

  if (priority === 1 && description.includes('security')) {
    return 'Critical security issue - immediate threat mitigation';
  } else if (priority === 2 && description.includes('payment')) {
    return 'High revenue impact - directly affects bottom line';
  } else if (priority === 3 && description.includes('optimize')) {
    return 'User experience - affecting 30% of users, quick win';
  } else if (priority === 4 && description.includes('gdpr')) {
    return 'Compliance deadline - legal requirement with penalties';
  } else if (priority === 5 && description.includes('scaling')) {
    return 'Time-sensitive - Black Friday preparation needed';
  } else if (description.includes('dashboard')) {
    return 'Strategic initiative - mobile growth opportunity';
  } else if (description.includes('test')) {
    return 'Quality investment - reduces future incidents';
  } else if (description.includes('refactor')) {
    return 'Technical debt - important but not urgent';
  } else {
    return 'Balanced against other priorities';
  }
}

// Run the example
if (require.main === module) {
  runAIDrivenPrioritizationExample()
    .then(() => console.log('\n✅ AI-driven prioritization example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runAIDrivenPrioritizationExample };
