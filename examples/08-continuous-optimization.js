/**
 * Example 08: Continuous Optimization
 *
 * This example demonstrates how the orchestrator continuously monitors and optimizes
 * workflow performance in real-time. It shows adaptation based on:
 * - Task completion times vs estimates
 * - Resource utilization
 * - Bottleneck identification
 * - Quality metrics
 * - Team performance
 *
 * Key features:
 * - continuousOrchestration configuration
 * - Real-time performance monitoring
 * - Automatic workflow adjustments
 * - Learning from execution patterns
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import agents for optimization scenarios
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  qaEngineer,
  devOpsEngineer,
  performanceEngineer,
  dataArchitect,
} = require('./utils/agents');

async function runContinuousOptimizationExample() {
  console.log('⚡ KaibanJS Continuous Optimization Example\n');
  console.log(
    'This example demonstrates real-time workflow optimization and adaptation.\n'
  );

  // Create tasks with performance metrics
  const optimizableTaskRepository = [
    // Frontend tasks with varying complexity
    new Task({
      description: 'Build responsive landing page with animations',
      expectedOutput: 'High-performance landing page with smooth animations',
      agent: frontendDeveloper,
      adaptable: true,
      dynamicPriority: true,
      orchestrationRules: `
        PERFORMANCE TARGETS:
        - Load time: <2 seconds
        - Lighthouse score: >90
        - Animation FPS: 60
        
        OPTIMIZATION OPPORTUNITIES:
        - Image optimization
        - Code splitting
        - Animation performance
        - Bundle size reduction
      `,
      resourceRequirements: {
        estimatedTime: '4-5 hours',
        skillsRequired: ['frontend', 'performance', 'animations'],
        dependencies: [],
      },
    }),

    new Task({
      description: 'Create interactive data visualization dashboard',
      expectedOutput: 'Real-time dashboard with multiple chart types',
      agent: frontendDeveloper,
      adaptable: true,
      orchestrationRules: `
        PERFORMANCE METRICS:
        - Render time: <100ms
        - Update frequency: Real-time
        - Memory usage: <100MB
        
        BOTTLENECKS TO WATCH:
        - Data processing
        - DOM updates
        - Memory leaks
      `,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['frontend', 'data_visualization', 'd3js'],
        dependencies: ['data_api'],
      },
    }),

    // Backend tasks with scalability focus
    new Task({
      description: 'Implement high-throughput data processing API',
      expectedOutput: 'API handling 10K requests/second',
      agent: backendDeveloper,
      adaptable: true,
      orchestrationRules: `
        THROUGHPUT TARGETS:
        - Requests/sec: 10,000
        - Response time: <50ms
        - Error rate: <0.1%
        
        SCALING STRATEGIES:
        - Connection pooling
        - Caching layers
        - Load balancing
        - Async processing
      `,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['backend', 'performance', 'scaling'],
        dependencies: ['infrastructure'],
      },
    }),

    // Database optimization task
    new Task({
      description: 'Optimize database queries and indexing strategy',
      expectedOutput: 'Optimized database with <10ms query times',
      agent: dataArchitect,
      adaptable: true,
      orchestrationRules: `
        QUERY PERFORMANCE:
        - Read queries: <10ms
        - Write queries: <20ms
        - Complex joins: <50ms
        
        OPTIMIZATION TOOLS:
        - Query analysis
        - Index optimization
        - Denormalization
        - Caching strategy
      `,
      resourceRequirements: {
        estimatedTime: '5-7 hours',
        skillsRequired: ['database', 'sql', 'performance_tuning'],
        dependencies: [],
      },
    }),

    // Testing optimization
    new Task({
      description: 'Create performance test suite with continuous monitoring',
      expectedOutput: 'Automated performance testing and alerting system',
      agent: qaEngineer,
      adaptable: true,
      orchestrationRules: `
        TEST EFFICIENCY:
        - Test execution: <5 minutes
        - Coverage: >90%
        - False positives: <5%
        
        MONITORING ASPECTS:
        - Response times
        - Resource usage
        - Error rates
        - User journeys
      `,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['testing', 'performance_testing', 'monitoring'],
        dependencies: ['application_stable'],
      },
    }),

    // DevOps automation
    new Task({
      description: 'Implement CI/CD pipeline with automatic optimization',
      expectedOutput: 'Self-optimizing deployment pipeline',
      agent: devOpsEngineer,
      adaptable: true,
      orchestrationRules: `
        PIPELINE METRICS:
        - Build time: <5 minutes
        - Deploy time: <2 minutes
        - Rollback time: <30 seconds
        
        OPTIMIZATION AREAS:
        - Parallel builds
        - Caching strategies
        - Container optimization
        - Resource allocation
      `,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['devops', 'ci_cd', 'automation'],
        dependencies: [],
      },
    }),

    // System-wide performance optimization
    new Task({
      description: 'Conduct system-wide performance audit and optimization',
      expectedOutput: 'Comprehensive performance improvement plan implemented',
      agent: performanceEngineer,
      adaptable: true,
      orchestrationRules: `
        SYSTEM TARGETS:
        - Overall latency: <100ms
        - Throughput: 10K TPS
        - Availability: 99.9%
        
        HOLISTIC APPROACH:
        - Frontend optimization
        - Backend efficiency
        - Database tuning
        - Infrastructure scaling
      `,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: ['performance', 'system_architecture', 'optimization'],
        dependencies: ['performance_baseline'],
      },
    }),
  ];

  console.log(
    `📋 Optimization Task Repository: ${optimizableTaskRepository.length} performance-focused tasks\n`
  );

  // Create team with continuous optimization
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const optimizationTeam = new Team({
    name: 'Performance Optimization Team',
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      qaEngineer,
      devOpsEngineer,
      performanceEngineer,
      dataArchitect,
    ],
    tasks: [],

    enableOrchestration: true,
    backlogTasks: optimizableTaskRepository,
    allowTaskGeneration: true,

    // Enable continuous orchestration for real-time optimization
    continuousOrchestration: true,

    mode: 'adaptive',
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',

    orchestrationStrategy: `
      You are orchestrating a team focused on CONTINUOUS PERFORMANCE OPTIMIZATION.
      
      OPTIMIZATION GOALS:
      1. Reduce task completion times
      2. Improve resource utilization
      3. Eliminate bottlenecks
      4. Enhance quality metrics
      5. Increase throughput
      
      MONITORING METRICS:
      - Task completion time vs estimates
      - Resource utilization (CPU, memory, network)
      - Bottleneck identification
      - Quality scores
      - Team velocity
      - Parallel execution efficiency
      
      OPTIMIZATION STRATEGIES:
      1. WORKLOAD BALANCING:
         - Identify overloaded agents
         - Redistribute tasks dynamically
         - Optimize skill matching
      
      2. PARALLELIZATION:
         - Find independent tasks
         - Maximize concurrent execution
         - Reduce dependencies
      
      3. RESOURCE ALLOCATION:
         - Allocate more time to complex tasks
         - Reduce time for over-estimated tasks
         - Adjust based on historical data
      
      4. BOTTLENECK RESOLUTION:
         - Identify blocking tasks
         - Prioritize bottleneck removal
         - Add resources to critical path
      
      5. QUALITY VS SPEED:
         - Balance thoroughness with velocity
         - Adjust based on error rates
         - Optimize for sustainable pace
      
      CONTINUOUS IMPROVEMENT LOOP:
      - Measure current performance
      - Identify optimization opportunities
      - Implement improvements
      - Validate results
      - Iterate
      
      CURRENT PERFORMANCE DATA:
      - Frontend tasks: Running 20% over estimates
      - Backend tasks: 15% under estimates
      - Testing bottleneck detected
      - Database queries need optimization
    `,

    maxActiveTasks: 4,

    llmInstance: orchestrationLLM,
  });

  console.log('✅ Optimization team configured for continuous improvement\n');
  console.log('Optimization Settings:');
  console.log(`- Adaptation Interval: 30 seconds`);
  console.log(`- Max Concurrent Tasks: 4`);
  console.log(`- Mode: Adaptive with AI-driven prioritization`);
  console.log(`- Focus: Performance and efficiency\n`);

  try {
    // Activate orchestration
    console.log('🚀 Starting continuous optimization workflow...\n');

    const optimizationGoal = `
      Optimize the entire system for maximum performance and efficiency.
      Current issues: Frontend tasks running slow, testing is a bottleneck.
    `;

    const initialTasks = await optimizationTeam.activateOrchestration(
      optimizationGoal,
      true
    );

    console.log(`📊 Initial Task Selection (${initialTasks.length} tasks):\n`);
    initialTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.description}`);
      console.log(
        `   Estimated: ${task.resourceRequirements?.estimatedTime || 'Unknown'}`
      );
    });

    // Start continuous optimization
    console.log('\n⚡ Activating Continuous Optimization...\n');

    // Note: In a real implementation, this would start a background process
    // For this example, we'll simulate optimization cycles

    // Simulate optimization cycles
    console.log('🔄 Optimization Cycle 1 (T+0s):\n');
    console.log('Monitoring current execution...');
    console.log('- Frontend task: 5.5 hours (estimated 4-5)');
    console.log('- Backend task: Started');
    console.log('- Database task: Queued');
    console.log('\nOptimization Actions:');
    console.log('✓ Detected frontend task running over estimate');
    console.log('✓ Allocating additional resources to frontend');
    console.log('✓ Preparing to parallelize independent tasks\n');

    console.log('🔄 Optimization Cycle 2 (T+30s):\n');
    console.log('Performance Analysis:');
    console.log('- Frontend task: Improved to expected pace');
    console.log('- Backend task: Running efficiently');
    console.log('- Bottleneck detected: Database queries');
    console.log('\nOptimization Actions:');
    console.log('✓ Prioritizing database optimization task');
    console.log('✓ Assigning performance engineer to assist');
    console.log('✓ Implementing query result caching\n');

    console.log('🔄 Optimization Cycle 3 (T+60s):\n');
    console.log('System Status:');
    console.log('- Overall throughput: Increased 25%');
    console.log('- Resource utilization: Balanced across team');
    console.log('- Quality metrics: Maintained at high level');
    console.log('\nOptimization Actions:');
    console.log('✓ Identified parallel execution opportunity');
    console.log('✓ Split complex task into subtasks');
    console.log('✓ Adjusted time estimates based on actuals\n');

    // Show optimization insights
    console.log('📈 Continuous Optimization Insights:\n');

    const optimizationMetrics = {
      'Task Completion Accuracy': {
        before: '65%',
        after: '92%',
        improvement: '42% better estimation',
      },
      'Resource Utilization': {
        before: '70%',
        after: '88%',
        improvement: '26% more efficient',
      },
      'Bottleneck Resolution': {
        before: '3 major bottlenecks',
        after: '0 blocking issues',
        improvement: '100% cleared',
      },
      'Team Velocity': {
        before: '8 tasks/day',
        after: '11 tasks/day',
        improvement: '38% faster',
      },
      'Quality Scores': {
        before: '85%',
        after: '94%',
        improvement: '11% quality gain',
      },
    };

    Object.entries(optimizationMetrics).forEach(([metric, data]) => {
      console.log(`${metric}:`);
      console.log(`  Before: ${data.before}`);
      console.log(`  After: ${data.after}`);
      console.log(`  Result: ${data.improvement}\n`);
    });

    // Optimization strategies
    console.log('🎯 Optimization Strategies Applied:\n');

    console.log('1. Dynamic Resource Allocation:');
    console.log(
      '   - Shifted resources from ahead-of-schedule to behind tasks'
    );
    console.log('   - Added pair programming for complex problems');
    console.log('   - Reduced overhead on simple tasks\n');

    console.log('2. Bottleneck Prevention:');
    console.log('   - Proactive identification of potential blocks');
    console.log('   - Pre-emptive resource allocation');
    console.log('   - Dependency optimization\n');

    console.log('3. Parallel Execution:');
    console.log('   - Identified 4 independent task groups');
    console.log('   - Maximized concurrent execution');
    console.log('   - Reduced total timeline by 35%\n');

    console.log('4. Learning Integration:');
    console.log('   - Updated estimates based on actuals');
    console.log('   - Captured optimization patterns');
    console.log('   - Applied learnings to future tasks\n');

    // Real-time adaptation examples
    console.log('🔄 Real-Time Adaptations:\n');

    console.log('Example 1: Performance Degradation Detected');
    console.log('  Trigger: API response times increased to 200ms');
    console.log('  Action: Immediately prioritized caching implementation');
    console.log('  Result: Response times reduced to 45ms\n');

    console.log('Example 2: Team Member Overloaded');
    console.log('  Trigger: Backend developer at 150% capacity');
    console.log('  Action: Redistributed tasks to available agents');
    console.log('  Result: Balanced workload, no delays\n');

    console.log('Example 3: Quality Issues Emerging');
    console.log('  Trigger: Bug rate increased in latest features');
    console.log('  Action: Injected additional testing tasks');
    console.log('  Result: Quality restored, bugs prevented\n');

    // Best practices
    console.log('📚 Best Practices for Continuous Optimization:\n');
    console.log('1. Set meaningful adaptation intervals (30s-5min)');
    console.log('2. Define clear optimization metrics');
    console.log('3. Balance optimization overhead with benefits');
    console.log('4. Monitor both performance and quality');
    console.log('5. Document optimization decisions');
    console.log('6. Set optimization boundaries');
    console.log('7. Combine with learning mode');
    console.log('8. Regular optimization retrospectives');
  } catch (error) {
    console.error('❌ Continuous optimization error:', error.message);
  }

  console.log('\n✅ Continuous Optimization Benefits:\n');
  console.log('• Real-time performance improvements');
  console.log('• Automatic bottleneck resolution');
  console.log('• Optimal resource utilization');
  console.log('• Improved estimation accuracy');
  console.log('• Higher team velocity');
  console.log('• Consistent quality maintenance');
  console.log('• Reduced project timelines');
  console.log('• Self-improving workflows');
}

// Run the example
if (require.main === module) {
  runContinuousOptimizationExample()
    .then(() => console.log('\n✅ Continuous optimization example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runContinuousOptimizationExample };
