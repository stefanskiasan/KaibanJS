/**
 * Example 09: Autonomous Task Generation
 *
 * This example demonstrates how the orchestrator can autonomously generate new tasks
 * when it identifies gaps in the workflow. This is particularly useful for:
 * - Projects with evolving requirements
 * - Discovering overlooked aspects
 * - Filling skill or coverage gaps
 * - Adaptive workflows
 *
 * Key features:
 * - allowTaskGeneration: true
 * - Gap analysis and identification
 * - Context-aware task creation
 * - Integration with existing workflow
 */

require('dotenv').config();
const { Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  qaEngineer,
  securityExpert,
  technicalWriter,
} = require('./utils/agents');

async function runTaskGenerationExample() {
  console.log('🤖 KaibanJS Autonomous Task Generation Example\n');
  console.log(
    'This example shows how AI can identify gaps and generate missing tasks.\n'
  );

  // Start with a minimal task set - intentionally incomplete
  const minimalTaskRepository = [
    new Task({
      description: 'Build user registration form',
      expectedOutput: 'Complete registration form with validation',
      agent: frontendDeveloper,
      adaptable: true,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['frontend', 'forms', 'validation'],
        dependencies: [],
      },
    }),

    new Task({
      description: 'Create user database schema',
      expectedOutput: 'Database tables for user management',
      agent: backendDeveloper,
      adaptable: true,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['database', 'sql', 'schema_design'],
        dependencies: [],
      },
    }),

    new Task({
      description: 'Implement basic user API endpoints',
      expectedOutput: 'REST API for user CRUD operations',
      agent: backendDeveloper,
      adaptable: true,
      resourceRequirements: {
        estimatedTime: '4-5 hours',
        skillsRequired: ['backend', 'api', 'rest'],
        dependencies: ['database_schema'],
      },
    }),
  ];

  console.log('📋 Initial Task Repository (Intentionally Incomplete):\n');
  minimalTaskRepository.forEach((task, index) => {
    console.log(`${index + 1}. ${task.description}`);
  });
  console.log('\n⚠️  Notice: Many important aspects are missing!\n');

  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o', // More capable model for task generation
    temperature: 0.6, // Balanced creativity
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });

  // Create team with task generation enabled
  const team = new Team({
    name: 'Adaptive Development Team',
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      qaEngineer,
      securityExpert,
      technicalWriter,
    ],
    tasks: [],

    // Enable orchestration
    enableOrchestration: true,

    // Use continuous orchestration for ongoing task generation
    continuousOrchestration: true,

    // Start with minimal tasks
    backlogTasks: minimalTaskRepository,

    // IMPORTANT: Enable autonomous task generation
    allowTaskGeneration: true,

    // Detailed strategy to guide task generation
    orchestrationStrategy: `
      You are building a COMPLETE user management system for a web application.
      
      SYSTEM REQUIREMENTS:
      1. User registration and authentication
      2. User profiles and settings
      3. Password management and recovery
      4. Role-based access control
      5. Security and compliance
      6. Testing and documentation
      
      GAP ANALYSIS PRIORITIES:
      - Security: Authentication, authorization, encryption
      - User Experience: Login, profile management, password reset
      - Quality: Testing, error handling, validation
      - Operations: Logging, monitoring, deployment
      - Documentation: API docs, user guides
      
      WHEN GENERATING TASKS:
      - Identify missing critical features
      - Consider security implications
      - Ensure comprehensive test coverage
      - Include operational concerns
      - Don't forget documentation
      
      CONSTRAINTS:
      - Generated tasks must be specific and actionable
      - Each task should have clear deliverables
      - Assign to the most appropriate agent
      - Consider dependencies between tasks
    `,

    mode: 'adaptive',
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',
    maxActiveTasks: 4,

    llmInstance: orchestrationLLM,
  });

  console.log('✅ Team configured with task generation enabled\n');

  try {
    // Activate orchestration - AI will identify gaps and generate tasks
    console.log('🔍 Activating orchestration with gap analysis...\n');

    const projectGoal =
      'Build a complete, secure user management system with all necessary features';
    const allTasks = await team.activateOrchestration(projectGoal, true);

    // Separate original and generated tasks
    const originalTaskIds = minimalTaskRepository.map((t) => t.id);
    const generatedTasks = allTasks.filter(
      (t) => !originalTaskIds.includes(t.id)
    );
    const originalTasks = allTasks.filter((t) =>
      originalTaskIds.includes(t.id)
    );

    console.log('\n📊 Task Generation Results:\n');
    console.log(`Original tasks: ${originalTasks.length}`);
    console.log(`Generated tasks: ${generatedTasks.length}`);
    console.log(`Total tasks: ${allTasks.length}\n`);

    // Show generated tasks with gap analysis
    if (generatedTasks.length > 0) {
      console.log('🆕 AI-Generated Tasks (Gap Filling):\n');

      generatedTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.description}`);
        console.log(`   Assigned to: ${task.agent.name}`);
        console.log(`   Gap Filled: ${identifyGapCategory(task)}`);
        if (task.resourceRequirements?.skillsRequired) {
          console.log(
            `   Skills: ${task.resourceRequirements.skillsRequired.join(', ')}`
          );
        }
        console.log('');
      });
    }

    // Analyze gaps that were identified
    console.log('🔍 Gap Analysis Summary:\n');
    const gapCategories = analyzeGaps(originalTasks, generatedTasks);

    Object.entries(gapCategories).forEach(([category, tasks]) => {
      if (tasks.length > 0) {
        console.log(`${category}:`);
        tasks.forEach((task) => {
          console.log(`  - ${task}`);
        });
        console.log('');
      }
    });

    // Show the complete workflow
    console.log('📋 Complete Workflow (Original + Generated):\n');
    allTasks.forEach((task, index) => {
      const isGenerated = !originalTaskIds.includes(task.id);
      console.log(
        `${index + 1}. ${isGenerated ? '🆕 ' : '📌 '}${task.description}`
      );
    });

    // Demonstrate task generation intelligence
    console.log('\n🧠 Task Generation Intelligence:\n');
    console.log('The AI orchestrator:');
    console.log('1. Analyzed the project goal comprehensively');
    console.log('2. Identified missing critical components');
    console.log('3. Generated specific tasks to fill gaps');
    console.log('4. Assigned tasks to appropriate specialists');
    console.log('5. Maintained logical dependencies');
    console.log('6. Ensured complete feature coverage\n');

    // Example of gap-filling logic
    console.log('💡 Example Gap-Filling Logic:\n');
    console.log('Original: User registration form → Gap: No login form');
    console.log('Generated: "Implement secure login form with remember me"\n');
    console.log('Original: Basic API endpoints → Gap: No authentication');
    console.log('Generated: "Implement JWT authentication middleware"\n');
    console.log('Original: No testing tasks → Gap: Quality assurance');
    console.log('Generated: "Create comprehensive test suite for auth flow"\n');

    // Best practices for task generation
    console.log('📚 Best Practices for Task Generation:\n');
    console.log('1. Start with core tasks, let AI fill gaps');
    console.log('2. Provide comprehensive project goals');
    console.log('3. Include all specialists in the team');
    console.log('4. Use detailed orchestration strategy');
    console.log('5. Set appropriate LLM temperature (0.5-0.7)');
    console.log('6. Review generated tasks for relevance');
    console.log('7. Iterate based on results');
    console.log('8. Monitor for over-generation');

    // When to use task generation
    console.log('\n🎯 When to Use Task Generation:\n');
    console.log('✅ Good Use Cases:');
    console.log('  - New project domains');
    console.log('  - Comprehensive system building');
    console.log('  - Discovering edge cases');
    console.log('  - Filling expertise gaps');
    console.log('  - Compliance requirements\n');

    console.log('❌ Avoid When:');
    console.log('  - Fixed scope projects');
    console.log('  - Regulated environments');
    console.log('  - Limited resources');
    console.log('  - Well-defined workflows');
  } catch (error) {
    console.error('❌ Task generation error:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('- Ensure allowTaskGeneration is true');
    console.log('- Use a capable LLM model (gpt-4o recommended)');
    console.log('- Provide clear project goals');
    console.log('- Check API rate limits');
  }

  console.log('\n✅ Task Generation Benefits:\n');
  console.log('• Discovers overlooked requirements');
  console.log('• Ensures comprehensive coverage');
  console.log('• Adapts to project complexity');
  console.log('• Saves planning time');
  console.log('• Reduces human blind spots');
  console.log('• Creates more complete solutions');
}

// Helper function to identify gap categories
function identifyGapCategory(task) {
  const description = task.description.toLowerCase();

  if (
    description.includes('auth') ||
    description.includes('security') ||
    description.includes('password')
  ) {
    return 'Security & Authentication';
  } else if (description.includes('test') || description.includes('qa')) {
    return 'Quality Assurance';
  } else if (
    description.includes('document') ||
    description.includes('guide')
  ) {
    return 'Documentation';
  } else if (description.includes('monitor') || description.includes('log')) {
    return 'Operations & Monitoring';
  } else if (
    description.includes('ui') ||
    description.includes('ux') ||
    description.includes('frontend')
  ) {
    return 'User Interface';
  } else if (description.includes('api') || description.includes('endpoint')) {
    return 'API Development';
  } else {
    return 'Feature Enhancement';
  }
}

// Helper function to analyze gaps
function analyzeGaps(originalTasks, generatedTasks) {
  return {
    'Security Gaps': [
      'No authentication mechanism',
      'Missing password encryption',
      'No session management',
      'Missing CSRF protection',
    ].filter((gap) =>
      generatedTasks.some((t) =>
        t.description.toLowerCase().includes(gap.split(' ')[1])
      )
    ),

    'Testing Gaps': [
      'No unit tests',
      'Missing integration tests',
      'No security testing',
      'Missing load testing',
    ].filter((_gap) =>
      generatedTasks.some((t) => t.description.toLowerCase().includes('test'))
    ),

    'Documentation Gaps': [
      'No API documentation',
      'Missing user guides',
      'No deployment docs',
      'Missing architecture docs',
    ].filter((_gap) =>
      generatedTasks.some((t) => t.description.toLowerCase().includes('doc'))
    ),

    'Feature Gaps': [
      'No password reset',
      'Missing user profiles',
      'No email verification',
      'Missing role management',
    ].filter((_gap) => generatedTasks.length > 0),
  };
}

// Run the example
if (require.main === module) {
  runTaskGenerationExample()
    .then(() => console.log('\n✅ Task generation example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runTaskGenerationExample };
