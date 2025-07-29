/**
 * Example 07: Task Adaptation
 *
 * This example demonstrates how the orchestrator can adapt tasks at runtime
 * based on changing project conditions, discoveries, and constraints.
 *
 * Key features:
 * - adaptable: true on tasks
 * - Runtime task modification
 * - Context-aware adaptations
 * - Scope adjustments
 * - Resource reallocation
 * - Dynamic requirement changes
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import diverse agents to show adaptation scenarios
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  dataArchitect,
  securityExpert,
  performanceEngineer,
  mobileAppDeveloper,
} = require('./utils/agents');

async function runTaskAdaptationExample() {
  console.log('🔧 KaibanJS Task Adaptation Example\n');
  console.log(
    'This example shows how tasks can be dynamically adapted based on runtime conditions.\n'
  );

  // Create adaptable tasks that can be modified
  const adaptableTaskRepository = [
    // API Development task that might need adaptation
    new Task({
      description:
        'Build REST API for user management with basic CRUD operations',
      expectedOutput: 'Functional REST API with user endpoints',
      agent: backendDeveloper,
      adaptable: true, // Can be modified
      dynamicPriority: true,
      orchestrationRules: `
        ADAPTATION SCENARIOS:
        - If high traffic detected: Add caching layer
        - If security audit fails: Enhance authentication
        - If performance issues: Optimize queries
        - If mobile usage high: Add GraphQL option
        - If data volume large: Implement pagination
        
        ADAPTATION CONSTRAINTS:
        - Maintain backward compatibility
        - Keep response times under 200ms
        - Ensure security standards met
      `,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['backend', 'api_design', 'rest'],
        dependencies: [],
      },
    }),

    // Frontend task adaptable to user feedback
    new Task({
      description: 'Create user dashboard with basic analytics widgets',
      expectedOutput: 'Interactive dashboard showing user metrics',
      agent: frontendDeveloper,
      adaptable: true,
      orchestrationRules: `
        ADAPT BASED ON:
        - User testing feedback
        - Performance metrics
        - Device analytics
        - Accessibility requirements
        - Business metric priorities
        
        POSSIBLE ADAPTATIONS:
        - Add real-time updates if needed
        - Switch to mobile-first if >60% mobile
        - Enhance visualizations for power users
        - Simplify for basic users
      `,
      resourceRequirements: {
        estimatedTime: '5-7 hours',
        skillsRequired: ['frontend', 'react', 'data_visualization'],
        dependencies: ['api_endpoints'],
      },
    }),

    // Data processing task with scalability adaptations
    new Task({
      description: 'Implement data processing pipeline for daily reports',
      expectedOutput: 'Automated pipeline processing user activity data',
      agent: dataArchitect,
      adaptable: true,
      splitStrategy: 'auto', // Can be split if too complex
      orchestrationRules: `
        SCALING TRIGGERS:
        - <1K records: Simple batch process
        - 1K-100K records: Add parallel processing
        - 100K-1M records: Implement streaming
        - >1M records: Distributed processing
        
        QUALITY ADAPTATIONS:
        - Add data validation if errors found
        - Implement retry logic if failures occur
        - Add monitoring if SLA critical
      `,
      resourceRequirements: {
        estimatedTime: '4-10 hours', // Variable based on scale
        skillsRequired: ['data_engineering', 'etl', 'python'],
        dependencies: ['data_sources'],
      },
    }),

    // Security task that adapts to threat level
    new Task({
      description: 'Implement basic authentication and authorization system',
      expectedOutput: 'Secure auth system with role-based access',
      agent: securityExpert,
      adaptable: true,
      orchestrationRules: `
        THREAT LEVEL ADAPTATIONS:
        - Low: Basic JWT authentication
        - Medium: Add MFA option
        - High: Enforce MFA + IP whitelisting
        - Critical: Add behavioral analysis
        
        COMPLIANCE ADAPTATIONS:
        - Healthcare: HIPAA compliance
        - Finance: PCI compliance
        - EU users: GDPR compliance
        - Government: FedRAMP standards
      `,
      resourceRequirements: {
        estimatedTime: '5-12 hours', // Varies by requirements
        skillsRequired: ['security', 'authentication', 'compliance'],
        dependencies: ['user_model'],
      },
    }),

    // Performance optimization with adaptive strategies
    new Task({
      description:
        'Optimize application performance for better user experience',
      expectedOutput: 'Optimized application with <100ms response times',
      agent: performanceEngineer,
      adaptable: true,
      orchestrationRules: `
        PERFORMANCE ADAPTATIONS:
        - Frontend heavy: Code splitting, lazy loading
        - Backend heavy: Query optimization, caching
        - Network issues: CDN, compression
        - Database slow: Indexing, connection pooling
        - Memory issues: Garbage collection tuning
        
        BUDGET ADAPTATIONS:
        - Low budget: Focus on quick wins
        - Medium budget: Systematic optimization
        - High budget: Complete overhaul
      `,
      resourceRequirements: {
        estimatedTime: '4-8 hours',
        skillsRequired: ['performance', 'optimization', 'profiling'],
        dependencies: ['performance_baseline'],
      },
    }),

    // Mobile app task adaptable to platform requirements
    new Task({
      description: 'Develop mobile application for core features',
      expectedOutput: 'Native mobile app with essential functionality',
      agent: mobileAppDeveloper,
      adaptable: true,
      orchestrationRules: `
        PLATFORM ADAPTATIONS:
        - iOS only: Swift with native UI
        - Android only: Kotlin with Material
        - Both needed: React Native/Flutter
        - Web required: Progressive Web App
        
        FEATURE ADAPTATIONS:
        - Offline critical: Local-first architecture
        - Real-time needed: WebSocket integration
        - Low bandwidth: Aggressive caching
        - High security: Biometric auth
      `,
      resourceRequirements: {
        estimatedTime: '10-20 hours',
        skillsRequired: ['mobile', 'cross_platform', 'ui_ux'],
        dependencies: ['api_specification'],
      },
    }),
  ];

  console.log(
    `📋 Adaptable Task Repository: ${adaptableTaskRepository.length} flexible tasks\n`
  );

  // Create team with adaptation capabilities
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.4, // Balanced for adaptation decisions
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const adaptiveTeam = new Team({
    name: 'Adaptive Development Team',
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      dataArchitect,
      securityExpert,
      performanceEngineer,
      mobileAppDeveloper,
    ],
    tasks: [],

    enableOrchestration: true,
    backlogTasks: adaptableTaskRepository,
    allowTaskGeneration: false, // Focus on adaptation

    // Use continuous orchestration for runtime task adaptation
    continuousOrchestration: true,

    mode: 'adaptive',
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',

    orchestrationStrategy: `
      You are orchestrating a team that must ADAPT to changing conditions.
      
      PROJECT CONTEXT:
      - Startup building MVP with uncertain requirements
      - User feedback coming in real-time
      - Resource constraints may change
      - Market conditions are dynamic
      
      ADAPTATION TRIGGERS:
      1. USER FEEDBACK:
         - High mobile usage → Prioritize mobile experience
         - Performance complaints → Add optimization
         - Security concerns → Enhance protection
         - Feature requests → Adjust scope
      
      2. TECHNICAL DISCOVERIES:
         - Higher data volume than expected
         - Performance bottlenecks identified
         - Security vulnerabilities found
         - Integration challenges
      
      3. BUSINESS CHANGES:
         - Budget adjustments
         - Timeline changes
         - Priority shifts
         - Market opportunities
      
      4. EXTERNAL FACTORS:
         - New regulations
         - Competitor features
         - Technology updates
         - Platform requirements
      
      ADAPTATION PRINCIPLES:
      - Start simple, enhance based on needs
      - Maintain core functionality
      - Optimize for current reality
      - Balance ideal vs practical
      - Document adaptation decisions
      
      CURRENT DISCOVERIES:
      - 70% of users are on mobile devices
      - Data volume 10x higher than anticipated
      - Enterprise clients requesting SAML SSO
      - Performance issues on low-end devices
      - Need for offline functionality
    `,

    maxActiveTasks: 3,

    llmInstance: orchestrationLLM,
  });

  console.log('✅ Adaptive team configured for dynamic task modification\n');

  try {
    // Activate orchestration with adaptation context
    console.log('🔄 Activating adaptive orchestration...\n');

    const projectGoal = `
      Build an MVP that can adapt to user needs and scale appropriately.
      Current situation: 70% mobile users, 10x data volume, enterprise interest.
    `;

    const adaptedTasks = await adaptiveTeam.activateOrchestration(
      projectGoal,
      true
    );

    console.log('📊 Task Adaptation Results:\n');

    // Show how tasks were adapted
    adaptedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.description}`);
      console.log(`   Agent: ${task.agent.name}`);

      // Simulate adaptation decisions
      const adaptations = getTaskAdaptations(task);
      if (adaptations.length > 0) {
        console.log(`   🔧 Adaptations Applied:`);
        adaptations.forEach((a) => console.log(`      • ${a}`));
      }

      console.log('');
    });

    // Demonstrate specific adaptation scenarios
    console.log('🎯 Adaptation Scenarios in Action:\n');

    console.log('Scenario 1: Mobile Usage Discovery (70% mobile)');
    console.log('  Original: "Create user dashboard with analytics"');
    console.log(
      '  Adapted: "Create mobile-first dashboard with touch-optimized charts"'
    );
    console.log('  Changes: Responsive → Mobile-first, Added touch gestures\n');

    console.log('Scenario 2: Data Volume Surprise (10x expected)');
    console.log('  Original: "Implement data processing pipeline"');
    console.log(
      '  Adapted: "Implement streaming data pipeline with partitioning"'
    );
    console.log('  Changes: Batch → Streaming, Added horizontal scaling\n');

    console.log('Scenario 3: Enterprise Requirements');
    console.log('  Original: "Basic authentication system"');
    console.log('  Adapted: "Enterprise auth with SAML SSO and audit logging"');
    console.log('  Changes: JWT → SAML support, Added compliance features\n');

    // Show adaptation decision matrix
    console.log('🧠 Adaptation Decision Matrix:\n');

    const adaptationMatrix = [
      {
        trigger: 'High Mobile Usage',
        threshold: '>60%',
        adaptations: [
          'Mobile-first design',
          'Touch optimization',
          'Offline support',
        ],
      },
      {
        trigger: 'Data Volume Spike',
        threshold: '>5x expected',
        adaptations: [
          'Streaming architecture',
          'Data partitioning',
          'Caching layer',
        ],
      },
      {
        trigger: 'Enterprise Interest',
        threshold: '>3 inquiries',
        adaptations: ['SSO integration', 'Audit logging', 'SLA monitoring'],
      },
      {
        trigger: 'Performance Issues',
        threshold: '>500ms response',
        adaptations: ['Query optimization', 'CDN setup', 'Code splitting'],
      },
    ];

    adaptationMatrix.forEach((matrix) => {
      console.log(`${matrix.trigger} (${matrix.threshold}):`);
      matrix.adaptations.forEach((a) => console.log(`  → ${a}`));
      console.log('');
    });

    // Adaptation benefits
    console.log('💡 Task Adaptation Benefits:\n');
    console.log('1. Responsive to Reality:');
    console.log('   - Tasks match actual user needs');
    console.log('   - Resources allocated efficiently');
    console.log('   - Avoid over-engineering\n');

    console.log('2. Risk Mitigation:');
    console.log('   - Early response to issues');
    console.log('   - Prevent technical debt');
    console.log('   - Scalability built-in\n');

    console.log('3. Resource Optimization:');
    console.log('   - Right-sized solutions');
    console.log('   - Efficient time usage');
    console.log('   - Cost-effective approaches\n');

    // Show non-adaptable task handling
    console.log('⚠️  Non-Adaptable Task Handling:\n');
    console.log('Some tasks should NOT be adaptable:');
    console.log('- Security critical implementations');
    console.log('- Compliance requirements');
    console.log('- Core business logic');
    console.log('- Data integrity operations\n');

    // Best practices
    console.log('📚 Best Practices for Task Adaptation:\n');
    console.log('1. Set clear adaptation triggers in orchestrationRules');
    console.log('2. Define adaptation constraints and limits');
    console.log('3. Use adaptable: true only for flexible tasks');
    console.log('4. Document adaptation decisions');
    console.log('5. Monitor adaptation effectiveness');
    console.log('6. Set appropriate adaptation intervals');
    console.log('7. Balance adaptation with stability');
    console.log('8. Communicate changes to stakeholders');
  } catch (error) {
    console.error('❌ Task adaptation error:', error.message);
  }

  console.log('\n✅ Task Adaptation Summary:\n');
  console.log('• Dynamically adjusts to project reality');
  console.log('• Optimizes resource allocation');
  console.log('• Responds to user feedback');
  console.log('• Scales appropriately to needs');
  console.log('• Reduces waste and over-engineering');
  console.log('• Improves project success rate');
}

// Helper function to simulate task adaptations
function getTaskAdaptations(task) {
  const adaptations = [];
  const description = task.description.toLowerCase();

  if (description.includes('api')) {
    adaptations.push('Added GraphQL endpoint for mobile efficiency');
    adaptations.push('Implemented response caching for performance');
  } else if (description.includes('dashboard')) {
    adaptations.push('Switched to mobile-first responsive design');
    adaptations.push('Added progressive loading for slow connections');
  } else if (description.includes('data processing')) {
    adaptations.push('Upgraded to streaming architecture for scale');
    adaptations.push('Added data partitioning for parallel processing');
  } else if (description.includes('authentication')) {
    adaptations.push('Added SAML SSO for enterprise clients');
    adaptations.push('Implemented audit logging for compliance');
  } else if (description.includes('performance')) {
    adaptations.push('Focused on mobile performance optimization');
    adaptations.push('Added edge caching for global users');
  } else if (description.includes('mobile')) {
    adaptations.push('Chose React Native for cross-platform efficiency');
    adaptations.push('Implemented offline-first architecture');
  }

  return adaptations;
}

// Run the example
if (require.main === module) {
  runTaskAdaptationExample()
    .then(() => console.log('\n✅ Task adaptation example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runTaskAdaptationExample };
