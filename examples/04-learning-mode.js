/**
 * Example 04: Learning Mode
 *
 * This example demonstrates the learning orchestration mode, which focuses on:
 * - Continuous improvement based on outcomes
 * - Pattern recognition and adaptation
 * - Knowledge accumulation across tasks
 * - Evolving strategies based on feedback
 * - Long-term optimization
 *
 * Key characteristics:
 * - Learn from successes and failures
 * - Adapt strategies over time
 * - Build knowledge base
 * - Improve task selection accuracy
 * - Optimize team performance
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import a diverse team for learning scenarios
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  qaEngineer,
  dataArchitect,
  technicalWriter,
  productManager,
} = require('./utils/agents');

async function runLearningModeExample() {
  console.log('🧠 KaibanJS Learning Mode Orchestration Example\n');
  console.log(
    'This example demonstrates how the orchestrator learns and improves over time.\n'
  );

  // Create an evolving task repository with feedback mechanisms
  const learningTaskRepository = [
    // Performance optimization task with measurable outcomes
    new Task({
      description: 'Optimize API response times for user endpoints',
      expectedOutput: 'API response times under 200ms with performance metrics',
      agent: backendDeveloper,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        LEARNING OBJECTIVES:
        - Measure baseline performance
        - Track optimization techniques used
        - Record actual improvements
        - Document what worked and what didn't
        
        SUCCESS METRICS:
        - Response time reduction percentage
        - Resource usage improvement
        - User satisfaction scores
      `,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['backend', 'performance', 'monitoring'],
        dependencies: [],
      },
    }),

    // Testing task with quality metrics
    new Task({
      description: 'Implement comprehensive test coverage with quality metrics',
      expectedOutput: 'Test suite with >90% coverage and quality dashboard',
      agent: qaEngineer,
      adaptable: true,
      template: true,
      orchestrationRules: `
        LEARNING AREAS:
        - Test effectiveness vs coverage
        - Bug detection rates
        - Test execution time optimization
        - False positive patterns
      `,
      resourceRequirements: {
        estimatedTime: '5-7 hours',
        skillsRequired: ['testing', 'automation', 'metrics'],
        dependencies: ['feature_implementation'],
      },
    }),

    // Feature development with user feedback
    new Task({
      description: 'Build user dashboard with analytics and feedback tracking',
      expectedOutput: 'Interactive dashboard with user behavior tracking',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      orchestrationRules: `
        FEEDBACK LOOPS:
        - User interaction patterns
        - Feature usage statistics
        - Performance bottlenecks
        - UX improvement opportunities
        
        ITERATE BASED ON:
        - User feedback
        - Usage analytics
        - Performance data
      `,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['frontend', 'analytics', 'ux'],
        dependencies: ['api_endpoints'],
      },
    }),

    // Documentation with effectiveness tracking
    new Task({
      description:
        'Create adaptive documentation that improves based on user queries',
      expectedOutput: 'Self-improving documentation with FAQ generation',
      agent: technicalWriter,
      adaptable: true,
      template: true,
      orchestrationRules: `
        LEARNING METRICS:
        - Most searched topics
        - Unclear sections (high bounce rate)
        - User satisfaction ratings
        - Support ticket reduction
      `,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['documentation', 'analytics', 'user_research'],
        dependencies: [],
      },
    }),

    // Data pipeline with performance learning
    new Task({
      description: 'Design self-optimizing data pipeline with ML-based tuning',
      expectedOutput:
        'Adaptive data pipeline that learns optimal configurations',
      agent: dataArchitect,
      adaptable: true,
      template: true,
      orchestrationRules: `
        OPTIMIZATION TARGETS:
        - Processing speed
        - Resource utilization
        - Error rates
        - Data quality scores
        
        LEARNING APPROACH:
        - Track configuration changes
        - Measure impact
        - Build optimization model
      `,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['data_engineering', 'ml', 'optimization'],
        dependencies: ['infrastructure'],
      },
    }),
  ];

  console.log(
    `📚 Learning Repository: ${learningTaskRepository.length} tasks with feedback mechanisms\n`
  );

  // Create team with learning mode configuration
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o', // Powerful model for pattern recognition
    temperature: 0.5, // Balanced for learning
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const learningTeam = new Team({
    name: 'Continuous Learning Team',
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      qaEngineer,
      dataArchitect,
      technicalWriter,
      productManager,
    ],
    tasks: [],

    // Enable orchestration
    enableOrchestration: true,

    // Learning mode - continuous improvement
    mode: 'learning',

    // Enable continuous orchestration for learning from each task completion
    continuousOrchestration: true,

    availableTemplateTasks: learningTaskRepository,
    allowTaskGeneration: true,

    // Detailed learning strategy
    orchestrationStrategy: `
      You are orchestrating a team focused on CONTINUOUS LEARNING and improvement.
      
      LEARNING PHILOSOPHY:
      1. Every task is an opportunity to learn
      2. Measure everything that matters
      3. Adapt strategies based on outcomes
      4. Share knowledge across the team
      5. Evolve processes continuously
      
      LEARNING OBJECTIVES:
      - Identify patterns in successful tasks
      - Recognize and avoid repeated mistakes
      - Optimize resource allocation over time
      - Build a knowledge base of best practices
      - Improve estimation accuracy
      
      FEEDBACK INTEGRATION:
      - Collect metrics from every task
      - Analyze success and failure patterns
      - Update strategies based on learnings
      - Propagate improvements across similar tasks
      - Generate new tasks to address weaknesses
      
      EVOLUTION CRITERIA:
      - Task completion times vs estimates
      - Quality metrics trends
      - Team satisfaction scores
      - Customer feedback integration
      - Resource utilization efficiency
      
      CONTINUOUS IMPROVEMENT:
      - Weekly retrospectives
      - Metric-driven decisions
      - Hypothesis-driven development
      - A/B testing for approaches
      - Knowledge documentation
    `,

    // AI-driven for maximum learning
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',
    maxActiveTasks: 3,

    // Faster adaptation for learning
    adaptationInterval: 60000, // 1 minute - more frequent learning cycles

    llmInstance: orchestrationLLM,
  });

  console.log('✅ Learning team configured for continuous improvement\n');
  console.log('Learning Configuration:');
  console.log(`- Mode: ${learningTeam.mode} (continuous improvement)`);
  console.log(`- Adaptation Interval: 60 seconds (rapid learning)`);
  console.log(`- Task Generation: Enabled (address gaps)`);
  console.log(`- Prioritization: AI-driven (learns patterns)`);
  console.log(`- Model: gpt-4o (pattern recognition)\n`);

  try {
    // Simulate learning across multiple iterations
    console.log('🔄 Starting learning iterations...\n');

    // Iteration 1: Initial baseline
    console.log('📊 Iteration 1: Establishing Baseline\n');

    const projectGoal = `
      Build a high-performance application with continuous improvement.
      Focus on measuring and learning from every action.
    `;

    const iteration1Tasks = await learningTeam.activateOrchestration(
      projectGoal,
      true
    );

    console.log(
      `Selected ${iteration1Tasks.length} tasks for baseline measurement:\n`
    );
    iteration1Tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.description}`);
      console.log(`   Learning Focus: ${extractLearningFocus(task)}`);
    });

    // Simulate execution and learning
    console.log('\n📈 Simulated Execution Results:\n');

    const learnings = {
      'API optimization': {
        technique: 'Database indexing',
        improvement: '45% response time reduction',
        lesson: 'Index frequently queried fields first',
      },
      'Test coverage': {
        technique: 'Property-based testing',
        improvement: '30% more bugs caught',
        lesson: 'Focus on edge cases over coverage percentage',
      },
      'User dashboard': {
        technique: 'Virtual scrolling',
        improvement: '60% performance boost',
        lesson: 'Optimize for perceived performance',
      },
    };

    Object.entries(learnings).forEach(([area, data]) => {
      console.log(`${area}:`);
      console.log(`  Technique: ${data.technique}`);
      console.log(`  Result: ${data.improvement}`);
      console.log(`  Learning: ${data.lesson}\n`);
    });

    // Iteration 2: Apply learnings
    console.log('📊 Iteration 2: Applying Learnings\n');

    // Update strategy with learnings
    const updatedStrategy =
      learningTeam.orchestrationStrategy +
      `
      
      LEARNINGS FROM ITERATION 1:
      - Database indexing provides significant performance gains
      - Edge case testing is more valuable than coverage percentage
      - Perceived performance matters more than raw metrics
      
      APPLY THESE PATTERNS:
      - Prioritize database optimization tasks
      - Focus testing on boundary conditions
      - Implement progressive enhancement for UX
    `;

    learningTeam.updateOrchestrationStrategy(updatedStrategy);

    console.log('Strategy updated with learnings from iteration 1\n');

    // Show how the system would adapt
    console.log('🧠 Learning Mode Adaptations:\n');
    console.log('1. Task Selection Evolution:');
    console.log('   - Initially: Broad coverage across all areas');
    console.log('   - After learning: Focus on high-impact optimizations');
    console.log('   - Future: Predictive task generation\n');

    console.log('2. Priority Adjustments:');
    console.log('   - Database tasks: Priority ↑ (high ROI discovered)');
    console.log('   - Coverage tasks: Priority ↓ (less impact than expected)');
    console.log('   - UX tasks: Priority ↑ (user satisfaction correlation)\n');

    console.log('3. Resource Allocation:');
    console.log('   - More time allocated to proven techniques');
    console.log('   - Reduced time on low-impact activities');
    console.log('   - Better estimation accuracy over time\n');

    // Demonstrate knowledge accumulation
    console.log('📚 Knowledge Base Growth:\n');

    const knowledgeBase = [
      {
        pattern: 'Performance Optimization',
        insights: [
          'Database indexing: 40-50% improvement typical',
          'Caching strategy: 20-30% improvement',
          'Query optimization: 15-25% improvement',
        ],
        applications: 3,
      },
      {
        pattern: 'Testing Strategy',
        insights: [
          'Property-based testing finds 3x more bugs',
          'Integration tests catch 80% of issues',
          'Unit tests provide fast feedback loops',
        ],
        applications: 2,
      },
      {
        pattern: 'User Experience',
        insights: [
          'Progressive loading improves perception',
          'Optimistic updates reduce perceived latency',
          'Skeleton screens improve engagement',
        ],
        applications: 4,
      },
    ];

    knowledgeBase.forEach((knowledge) => {
      console.log(`${knowledge.pattern}:`);
      knowledge.insights.forEach((insight) => {
        console.log(`  • ${insight}`);
      });
      console.log(`  Applied ${knowledge.applications} times successfully\n`);
    });

    // Learning mode benefits
    console.log('💡 Learning Mode Capabilities:\n');
    console.log('1. Pattern Recognition:');
    console.log('   - Identifies successful strategies');
    console.log('   - Recognizes failure patterns');
    console.log('   - Builds optimization models\n');

    console.log('2. Adaptive Behavior:');
    console.log('   - Updates priorities based on outcomes');
    console.log('   - Adjusts time estimates from history');
    console.log('   - Evolves task selection criteria\n');

    console.log('3. Knowledge Transfer:');
    console.log('   - Shares learnings across tasks');
    console.log('   - Documents best practices');
    console.log('   - Prevents repeated mistakes\n');

    // Best practices
    console.log('📚 Best Practices for Learning Mode:\n');
    console.log('1. Implement comprehensive metrics collection');
    console.log('2. Set clear success criteria for each task');
    console.log('3. Schedule regular retrospectives');
    console.log('4. Document learnings systematically');
    console.log('5. Create feedback loops in all processes');
    console.log('6. Use A/B testing for approach validation');
    console.log('7. Share learnings across team members');
    console.log('8. Iterate strategy based on outcomes');
  } catch (error) {
    console.error('❌ Learning mode error:', error.message);

    console.log('\n💡 Learning from Errors:');
    console.log('- Document error patterns');
    console.log('- Update strategies to prevent recurrence');
    console.log('- Build error handling knowledge base');
    console.log('- Share error learnings with team');
  }

  console.log('\n✅ Learning Mode Benefits:\n');
  console.log('• Continuous improvement over time');
  console.log('• Data-driven decision making');
  console.log('• Knowledge accumulation and sharing');
  console.log('• Adaptive strategies based on outcomes');
  console.log('• Improved estimation accuracy');
  console.log('• Reduced repeated mistakes');
  console.log('• Optimized team performance');
}

// Helper function to extract learning focus
function extractLearningFocus(task) {
  const description = task.description.toLowerCase();

  if (description.includes('optimize') || description.includes('performance')) {
    return 'Performance metrics and optimization techniques';
  } else if (description.includes('test')) {
    return 'Quality metrics and testing effectiveness';
  } else if (
    description.includes('user') ||
    description.includes('dashboard')
  ) {
    return 'User behavior and engagement patterns';
  } else if (description.includes('document')) {
    return 'Documentation effectiveness and user queries';
  } else if (description.includes('data')) {
    return 'Processing efficiency and configuration tuning';
  } else {
    return 'General improvement metrics';
  }
}

// Run the example
if (require.main === module) {
  runLearningModeExample()
    .then(() => console.log('\n✅ Learning mode example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runLearningModeExample };
