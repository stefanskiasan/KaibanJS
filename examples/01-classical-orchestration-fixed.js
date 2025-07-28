/**
 * Example 01: Classical Orchestration (Fixed Version)
 *
 * This example demonstrates the classical KaibanJS workflow with intelligent orchestration.
 * It shows how to:
 * - Enable orchestration with enableOrchestration: true
 * - Set up a task repository with availableTemplateTasks
 * - Use team.start() for automatic orchestration and execution
 *
 * Key difference from activateOrchestration() approach:
 * - No explicit orchestration call needed
 * - Orchestrator automatically selects tasks during team.start()
 * - Simpler, more intuitive workflow
 *
 * Requirements:
 * - OpenAI API key in .env file
 * - npm install dotenv (if not already installed)
 */

require('dotenv').config();
const { Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');

async function runClassicalOrchestrationExample() {
  console.log('🚀 KaibanJS Classical Orchestration Example (Fixed)\n');
  console.log(
    'This example shows the classical KaibanJS workflow with automatic orchestration.\n'
  );

  // Verify API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('Please set your OpenAI API key in a .env file:');
    console.log('OPENAI_API_KEY=your_api_key_here');
    return;
  }

  // Create agents directly in this file to ensure proper configuration
  const seniorDeveloper = new Agent({
    name: 'Alex Chen',
    role: 'Senior Full-Stack Developer',
    goal: 'Build robust, scalable applications with clean architecture',
    background: `15 years of experience in software development. Expert in:
      - JavaScript/TypeScript, Python, Java
      - React, Node.js, Express, Spring Boot
      - Microservices architecture
      - Database design (PostgreSQL, MongoDB)
      - DevOps practices and CI/CD`,
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxRetries: 2,
    },
  });

  const frontendDeveloper = new Agent({
    name: 'Sarah Martinez',
    role: 'Frontend Developer',
    goal: 'Create beautiful, responsive, and accessible user interfaces',
    background: `8 years specializing in frontend development:
      - React, Vue.js, Angular
      - CSS/SASS, Tailwind CSS
      - Mobile-first responsive design
      - Accessibility (WCAG 2.1)
      - Performance optimization
      - Design systems`,
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.4,
      maxRetries: 2,
    },
  });

  const qaEngineer = new Agent({
    name: 'David Kim',
    role: 'Quality Assurance Engineer',
    goal: 'Ensure software quality through comprehensive testing',
    background: `8 years in quality assurance:
      - Test strategy and planning
      - Automated testing (Selenium, Cypress, Playwright)
      - API testing (Postman, REST Assured)
      - Performance testing (JMeter, k6)
      - Test-driven development
      - Bug tracking and reporting`,
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxRetries: 2,
    },
  });

  // Step 1: Create a task repository
  // These are template tasks that the orchestrator can choose from automatically
  const taskRepository = [
    new Task({
      description: 'Set up project structure and dependencies',
      expectedOutput:
        'Complete project setup with folder structure and npm packages',
      agent: seniorDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '1-2 hours',
        skillsRequired: ['project_setup', 'npm', 'architecture'],
        dependencies: [],
      },
    }),

    new Task({
      description: 'Configure development environment',
      expectedOutput:
        'Development environment with linting, formatting, and git hooks',
      agent: seniorDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '1-2 hours',
        skillsRequired: ['devops', 'tooling'],
        dependencies: ['project_structure'],
      },
    }),

    new Task({
      description: 'Implement secure user authentication system',
      expectedOutput:
        'Complete authentication with JWT tokens, login/logout, and password reset',
      agent: seniorDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['backend', 'security', 'authentication', 'jwt'],
        dependencies: ['project_structure'],
      },
    }),

    new Task({
      description: 'Create responsive UI components',
      expectedOutput: 'Modern, accessible UI components with responsive design',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['ui_design', 'responsive_design', 'accessibility'],
        dependencies: ['authentication_system'],
      },
    }),

    new Task({
      description: 'Create comprehensive test suite',
      expectedOutput:
        'Automated tests with unit, integration, and E2E coverage',
      agent: qaEngineer,
      adaptable: true,
      template: true,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['testing', 'automation', 'ci_cd'],
        dependencies: ['ui_components', 'authentication_system'],
      },
    }),
  ];

  console.log(
    `📚 Task Repository contains ${taskRepository.length} template tasks\n`
  );

  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });

  // Step 2: Create a team with orchestration enabled
  const team = new Team({
    name: 'Classical Development Team',
    agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
    tasks: [], // Start with no tasks - orchestrator will select them automatically

    // IMPORTANT: Enable orchestration for automatic task selection
    enableOrchestration: true,

    // Use initial-only orchestration for predictable classical workflow
    continuousOrchestration: false,

    // Provide the task repository for automatic selection
    availableTemplateTasks: taskRepository,

    // Don't allow new task generation in this classical example
    allowTaskGeneration: false,

    // Provide a clear strategy for the orchestrator
    orchestrationStrategy: `
      You are orchestrating a new web application project using classical workflow.
      
      GOALS:
      1. Set up a solid foundation for development
      2. Implement core features with authentication
      3. Ensure code quality with testing
      
      CONSTRAINTS:
      - Focus on essential features first
      - Ensure each feature has tests
      - Maximum 4 tasks for this sprint
      
      PRIORITIES:
      1. Project setup and structure
      2. Authentication (security first)
      3. Basic UI components
      4. Testing coverage
      
      CLASSICAL APPROACH:
      - Select optimal tasks automatically during execution
      - Follow traditional software development lifecycle
      - Maintain predictable workflow patterns
    `,

    // Use adaptive mode (balanced approach)
    mode: 'adaptive',

    // Limit concurrent tasks
    maxActiveTasks: 2,

    // Use dynamic prioritization
    taskPrioritization: 'dynamic',

    // Balance workload across agents
    workloadDistribution: 'balanced',

    // Provide LLM instance for orchestration
    llmInstance: orchestrationLLM,

    // Ensure environment variables are properly set for agents
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
  });

  console.log('✅ Team created with classical orchestration enabled\n');
  console.log('Team Configuration:');
  console.log(
    `- Agents: ${[seniorDeveloper, frontendDeveloper, qaEngineer]
      .map((a) => a.name)
      .join(', ')}`
  );
  console.log(`- Orchestration Mode: ${team.mode || 'adaptive'}`);
  console.log(`- Max Active Tasks: ${team.maxActiveTasks || 3}`);
  console.log(
    `- Task Prioritization: ${team.taskPrioritization || 'ai-driven'}`
  );
  console.log(
    `- Workload Distribution: ${team.workloadDistribution || 'skills-based'}\n`
  );

  try {
    // Step 3: Start the classical workflow
    // The orchestrator will automatically select and execute optimal tasks
    console.log('🎯 Starting classical orchestration workflow...\n');
    console.log(
      'The orchestrator will automatically:\n' +
        '1. Analyze the project strategy and goals\n' +
        '2. Select optimal tasks from the repository\n' +
        '3. Arrange tasks based on dependencies and priorities\n' +
        '4. Execute the workflow with the selected agents\n'
    );

    // Execute the workflow with automatic orchestration
    console.log('🚀 Executing classical orchestrated workflow...');
    const startTime = Date.now();

    try {
      // Use automatic orchestration - orchestrationStrategy from team config is used automatically
      // The comprehensive orchestrationStrategy in team config provides all guidance needed
      const workflowResult = await team.start();

      // Alternative: You can override with a dynamic projectGoal if needed:
      // const projectGoal = 'Build a secure web application with user authentication and modern UI';
      // const workflowResult = await team.start({}, { projectGoal });
      const executionTime = Date.now() - startTime;

      console.log(
        `✅ Classical workflow completed successfully in ${executionTime}ms!\n`
      );

      // Show what the orchestrator automatically selected and executed
      const teamState = team.store.getState();
      console.log('📊 Orchestrator Automatically Selected:');
      teamState.tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.description}`);
        console.log(`   Agent: ${task.agent.name}`);
        console.log(`   Status: ${task.status}`);
        console.log(
          `   Estimated Time: ${
            task.resourceRequirements?.estimatedTime || 'Not specified'
          }`
        );
        console.log('');
      });

      console.log('🎯 Classical Orchestration Benefits:');
      console.log('1. ✅ No explicit orchestration call needed');
      console.log('2. ✅ Automatic task selection during execution');
      console.log('3. ✅ Simplified workflow management');
      console.log('4. ✅ Traditional software development patterns');
      console.log('5. ✅ Predictable and intuitive behavior\n');

      // Show final results
      console.log('🏆 Workflow Results:');
      if (workflowResult && workflowResult.results) {
        workflowResult.results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.task.description}`);
          console.log(`   Status: ${result.status}`);
          console.log(`   Agent: ${result.task.agent.name}`);
          if (result.result) {
            console.log(`   Output: ${result.result.substring(0, 100)}...`);
          }
          console.log('');
        });
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(
        `❌ Classical workflow execution failed after ${executionTime}ms:`,
        error.message
      );

      // Enhanced error debugging
      console.log('\n🔍 Debugging Information:');
      console.log(`Error Type: ${error.constructor.name}`);
      console.log(`Error Message: ${error.message}`);

      if (error.stack) {
        console.log('Stack Trace (first 5 lines):');
        console.log(error.stack.split('\n').slice(0, 5).join('\n'));
      }

      // Show current task states for debugging
      const teamState = team.store.getState();
      console.log('\n🔍 Current Task States:');
      teamState.tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.status}: ${task.description}`);
        console.log(`   Agent: ${task.agent.name}`);
        console.log(`   Agent has workOnTask: ${typeof task.agent.workOnTask}`);
      });

      // Check agent configurations
      console.log('\n🔍 Agent Configurations:');
      [seniorDeveloper, frontendDeveloper, qaEngineer].forEach((agent) => {
        console.log(`- ${agent.name}:`);
        console.log(`  - workOnTask method: ${typeof agent.workOnTask}`);
        console.log(`  - llmConfig: ${!!agent.llmConfig}`);
        console.log(`  - llmInstance: ${!!agent.llmInstance}`);
      });
    }
  } catch (error) {
    console.error('❌ Classical orchestration error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure OPENAI_API_KEY is set in your .env file');
    console.log('2. Check that enableOrchestration is set to true');
    console.log(
      '3. Verify that availableTemplateTasks contains template tasks'
    );
    console.log('4. Check network connection and API service status');
    console.log('5. Ensure agents have proper LLM configuration');

    // Show current configuration for debugging
    console.log('\nCurrent Configuration:');
    console.log(`- Enable Orchestration: ${team.enableOrchestration}`);
    console.log(
      `- Available Tasks: ${team.availableTemplateTasks?.length || 0}`
    );
    console.log(`- LLM Configured: ${!!team.llmInstance}`);
    console.log(`- API Key Available: ${!!process.env.OPENAI_API_KEY}`);
  }

  // Summary
  console.log('📚 Classical Orchestration Key Takeaways:\n');
  console.log(
    '1. Set enableOrchestration: true to activate automatic orchestration'
  );
  console.log(
    '2. Use continuousOrchestration: false for initial-only mode (classical setup)'
  );
  console.log('3. Provide a task repository with availableTemplateTasks');
  console.log('4. Define a clear orchestrationStrategy to guide the AI');
  console.log(
    '5. Simply call team.start() - orchestration happens automatically!'
  );
  console.log('6. The orchestrator selects optimal tasks during execution');
  console.log('7. No need for explicit activateOrchestration() calls');
  console.log('8. Classical approach follows traditional workflow patterns');
  console.log('9. Ensure all agents have proper LLM configuration');
  console.log('10. Monitor for agent.workOnTask method availability');
}

// Run the example
if (require.main === module) {
  runClassicalOrchestrationExample()
    .then(() => console.log('\n✅ Classical orchestration example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runClassicalOrchestrationExample };
