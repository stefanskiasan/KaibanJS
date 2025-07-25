/**
 * Example 05: Skills-Based Workload Distribution
 *
 * This example demonstrates how the orchestrator intelligently distributes tasks
 * based on agent skills and expertise, ensuring optimal task-agent matching.
 *
 * Key features demonstrated:
 * - workloadDistribution: 'skills-based'
 * - Specialized agents with different expertise
 * - Task requirements matching
 * - Efficient resource utilization
 * - Cross-functional team coordination
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import all specialized agents to show skill diversity
const {
  frontendDeveloper,
  backendDeveloper,
  dataArchitect,
  uxDesigner,
  qaEngineer,
  devOpsEngineer,
  securityExpert,
  mobileAppDeveloper,
} = require('./utils/agents');

async function runSkillsBasedDistributionExample() {
  console.log('🎯 KaibanJS Skills-Based Distribution Example\n');
  console.log(
    'This example shows how tasks are distributed based on agent expertise.\n'
  );

  // Display agent skills
  console.log('👥 Specialized Team Members:\n');
  const agents = [
    frontendDeveloper,
    backendDeveloper,
    dataArchitect,
    uxDesigner,
    qaEngineer,
    devOpsEngineer,
    securityExpert,
    mobileAppDeveloper,
  ];

  agents.forEach((agent) => {
    console.log(`${agent.name} - ${agent.role}`);
    // Extract skills from background (in a real scenario, these would be structured)
    const skillsMatch = agent.background.match(
      /Expert in:|specializing in:|focused on:/g
    );
    if (skillsMatch) {
      console.log(`  Key Skills: ${agent.background.split('\n')[1].trim()}`);
    }
    console.log('');
  });

  // Create diverse tasks requiring different skills
  const crossFunctionalTasks = [
    // Frontend tasks
    new Task({
      description:
        'Implement responsive dashboard with real-time data visualization',
      expectedOutput: 'Interactive dashboard with charts and live updates',
      agent: frontendDeveloper, // Suggested agent, but orchestrator can override
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['react', 'data_visualization', 'd3js', 'websockets'],
        dependencies: ['api_endpoints'],
      },
    }),

    // Backend tasks
    new Task({
      description: 'Design and implement GraphQL API with subscription support',
      expectedOutput:
        'GraphQL API with queries, mutations, and real-time subscriptions',
      agent: backendDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '5-7 hours',
        skillsRequired: ['graphql', 'node.js', 'websockets', 'api_design'],
        dependencies: ['database_schema'],
      },
    }),

    // Data architecture tasks
    new Task({
      description: 'Design scalable data warehouse for analytics',
      expectedOutput:
        'Data warehouse design with ETL pipelines and optimization',
      agent: dataArchitect,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['data_warehousing', 'etl', 'sql', 'big_data'],
        dependencies: [],
      },
    }),

    // UX/UI tasks
    new Task({
      description: 'Create user research plan and conduct usability testing',
      expectedOutput:
        'User research findings and UX improvement recommendations',
      agent: uxDesigner,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['user_research', 'usability_testing', 'figma'],
        dependencies: ['prototype'],
      },
    }),

    // Security tasks
    new Task({
      description: 'Implement OAuth2 with multi-factor authentication',
      expectedOutput: 'Secure authentication system with MFA support',
      agent: securityExpert,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '5-6 hours',
        skillsRequired: ['oauth2', 'security', 'authentication', 'encryption'],
        dependencies: ['user_management'],
      },
    }),

    // DevOps tasks
    new Task({
      description: 'Set up Kubernetes cluster with auto-scaling',
      expectedOutput:
        'Production-ready K8s cluster with monitoring and scaling',
      agent: devOpsEngineer,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: [
          'kubernetes',
          'docker',
          'cloud_infrastructure',
          'monitoring',
        ],
        dependencies: ['containerization'],
      },
    }),

    // Mobile development tasks
    new Task({
      description: 'Develop cross-platform mobile app with offline support',
      expectedOutput:
        'Mobile app for iOS and Android with offline capabilities',
      agent: mobileAppDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: [
          'react_native',
          'mobile_development',
          'offline_storage',
        ],
        dependencies: ['api_specification'],
      },
    }),

    // QA tasks
    new Task({
      description:
        'Create automated E2E test suite with visual regression testing',
      expectedOutput: 'Comprehensive test suite with CI/CD integration',
      agent: qaEngineer,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '5-7 hours',
        skillsRequired: [
          'playwright',
          'test_automation',
          'ci_cd',
          'visual_testing',
        ],
        dependencies: ['feature_complete'],
      },
    }),

    // Cross-functional tasks that could go to multiple agents
    new Task({
      description: 'Implement real-time collaborative editing feature',
      expectedOutput:
        'Multi-user collaborative editing with conflict resolution',
      agent: null, // Let orchestrator decide based on skills
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['websockets', 'frontend', 'backend', 'algorithms'],
        dependencies: [],
      },
    }),

    new Task({
      description: 'Optimize application performance and implement caching',
      expectedOutput: 'Improved performance with <100ms response times',
      agent: null, // Could be backend or DevOps
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: [
          'performance_optimization',
          'caching',
          'redis',
          'monitoring',
        ],
        dependencies: ['load_testing'],
      },
    }),
  ];

  console.log(
    `📋 Task Repository: ${crossFunctionalTasks.length} diverse tasks requiring various skills\n`
  );

  // Create team with skills-based distribution
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const crossFunctionalTeam = new Team({
    name: 'Cross-Functional Product Team',
    agents: agents,
    tasks: [],

    enableOrchestration: true,
    availableTemplateTasks: crossFunctionalTasks,
    allowTaskGeneration: false, // Focus on distribution, not generation

    // Use initial-only orchestration to focus on optimal skill-based distribution
    continuousOrchestration: false,

    // IMPORTANT: Use skills-based distribution
    workloadDistribution: 'skills-based',

    orchestrationStrategy: `
      You are orchestrating a cross-functional team building a complex SaaS platform.
      
      PROJECT SCOPE:
      - Enterprise SaaS application
      - Web, mobile, and API interfaces
      - Real-time collaboration features
      - Advanced analytics and reporting
      - High security requirements
      - Scalability for millions of users
      
      SKILL MATCHING PRIORITIES:
      1. Match task requirements to agent expertise
      2. Consider both primary and secondary skills
      3. Balance workload while respecting specializations
      4. Enable knowledge sharing between experts
      5. Avoid skill mismatches that could compromise quality
      
      COLLABORATION GUIDELINES:
      - Frontend and UX should work closely
      - Backend and Data Architect should coordinate
      - Security Expert should review all components
      - QA should have visibility across all features
      
      CONSTRAINTS:
      - Don't overload any single agent
      - Ensure critical skills are not bottlenecked
      - Consider task dependencies when distributing
    `,

    mode: 'adaptive',
    maxActiveTasks: 6, // More concurrent tasks with specialized team
    taskPrioritization: 'dynamic',

    llmInstance: orchestrationLLM,
  });

  console.log(
    '✅ Cross-functional team configured with skills-based distribution\n'
  );

  try {
    // Activate orchestration with skills focus
    console.log('🎯 Activating skills-based task distribution...\n');

    const projectGoal =
      'Build a comprehensive SaaS platform with web, mobile, and API interfaces';
    const distributedTasks = await crossFunctionalTeam.activateOrchestration(
      projectGoal,
      true
    );

    console.log(`\n📊 Skills-Based Distribution Results:\n`);

    // Analyze the distribution
    const agentTaskCount = {};
    const skillMatches = [];

    distributedTasks.forEach((task, index) => {
      const agentName = task.agent.name;
      agentTaskCount[agentName] = (agentTaskCount[agentName] || 0) + 1;

      console.log(`${index + 1}. ${task.description}`);
      console.log(`   Assigned to: ${agentName} (${task.agent.role})`);

      if (task.resourceRequirements?.skillsRequired) {
        const requiredSkills = task.resourceRequirements.skillsRequired;
        console.log(`   Required Skills: ${requiredSkills.join(', ')}`);

        // Check skill match (simplified - in reality would parse agent.background)
        const agentSkillKeywords = task.agent.background.toLowerCase();
        const matchedSkills = requiredSkills.filter((skill) =>
          agentSkillKeywords.includes(skill.toLowerCase().replace('_', ' '))
        );

        if (matchedSkills.length > 0) {
          console.log(`   ✅ Skill Match: ${matchedSkills.join(', ')}`);
          skillMatches.push({
            task: task.description,
            matches: matchedSkills.length,
          });
        }
      }
      console.log('');
    });

    // Show distribution analytics
    console.log('📈 Distribution Analytics:\n');
    console.log('Tasks per Agent:');
    Object.entries(agentTaskCount).forEach(([agent, count]) => {
      const workload = count <= 1 ? 'Light' : count <= 2 ? 'Moderate' : 'Heavy';
      console.log(`  ${agent}: ${count} tasks (${workload} workload)`);
    });

    console.log('\nSkill Matching Quality:');
    const avgSkillMatch =
      skillMatches.reduce((sum, m) => sum + m.matches, 0) / skillMatches.length;
    console.log(
      `  Average skill matches per task: ${avgSkillMatch.toFixed(1)}`
    );
    console.log(
      `  Tasks with skill matches: ${skillMatches.length}/${distributedTasks.length}`
    );

    // Demonstrate distribution benefits
    console.log('\n💡 Skills-Based Distribution Benefits:\n');
    console.log('1. Optimal Performance:');
    console.log('   - Tasks assigned to experts in required skills');
    console.log('   - Higher quality outputs expected');
    console.log('   - Faster completion with domain expertise\n');

    console.log('2. Balanced Workload:');
    console.log('   - No single agent overwhelmed');
    console.log('   - Parallel execution maximized');
    console.log('   - Bottlenecks minimized\n');

    console.log('3. Skill Development:');
    console.log('   - Agents work in their strength areas');
    console.log('   - Opportunities for skill adjacency');
    console.log('   - Knowledge sharing through collaboration\n');

    // Show what happens with poor skill matching
    console.log('⚠️  Without Skills-Based Distribution:\n');
    console.log('Potential issues with other distribution methods:');
    console.log(
      '- Balanced: Frontend dev might get database optimization tasks'
    );
    console.log('- Availability: Security expert might get UI design tasks');
    console.log('- Random: Complete skill mismatches possible\n');

    // Best practices
    console.log('📚 Best Practices for Skills-Based Distribution:\n');
    console.log('1. Clearly define agent expertise in their background');
    console.log('2. Specify detailed skill requirements for each task');
    console.log('3. Use null agent assignment for flexible tasks');
    console.log('4. Consider both primary and secondary skills');
    console.log('5. Monitor workload balance across specialists');
    console.log('6. Plan for skill gaps and training needs');
    console.log('7. Enable cross-functional collaboration');
    console.log('8. Review and adjust skill mappings regularly');
  } catch (error) {
    console.error('❌ Skills-based distribution error:', error.message);
  }

  console.log('\n✅ Skills-Based Distribution Summary:\n');
  console.log('• Matches tasks to agent expertise automatically');
  console.log('• Improves quality through specialization');
  console.log('• Optimizes team performance and efficiency');
  console.log('• Reduces skill-mismatch errors');
  console.log('• Enables parallel specialized work');
  console.log('• Ideal for cross-functional teams');
}

// Run the example
if (require.main === module) {
  runSkillsBasedDistributionExample()
    .then(() =>
      console.log('\n✅ Skills-based distribution example completed!')
    )
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runSkillsBasedDistributionExample };
