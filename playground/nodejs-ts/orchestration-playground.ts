/**
 * KaibanJS Orchestration Playground
 *
 * This playground demonstrates the new intelligent orchestration features:
 * - enableOrchestration flag for AI-powered task management
 * - Building upon existing tasks vs starting fresh
 * - Gap analysis and intelligent task selection
 * - Comprehensive orchestration logging
 * - Task repository management
 * - Adaptive orchestration modes
 */

import { Agent, Task, Team } from 'kaibanjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

console.log('🚀 KaibanJS Orchestration Playground Starting...\n');

const runOrchestrationDemo = async () => {
  try {
    // ╔═══════════════════════════════════════════════════════════╗
    // ║                    SETUP AGENTS                          ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log('👥 Creating specialized agents...');

    const developer = new Agent({
      name: 'Alex Developer',
      role: 'Full-Stack Developer',
      goal: 'Build scalable and maintainable applications',
      background: 'Expert in modern web development with 5+ years experience',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.2,
      },
    });

    const designer = new Agent({
      name: 'Sarah Designer',
      role: 'UI/UX Designer',
      goal: 'Create beautiful and user-friendly interfaces',
      background: 'Design systems expert with focus on accessibility',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.3,
      },
    });

    const tester = new Agent({
      name: 'Mike Tester',
      role: 'QA Engineer',
      goal: 'Ensure application quality and reliability',
      background: 'Testing automation and quality assurance specialist',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.1,
      },
    });

    const devops = new Agent({
      name: 'Chris DevOps',
      role: 'DevOps Engineer',
      goal: 'Manage infrastructure and deployment processes',
      background: 'Cloud infrastructure and CI/CD expert',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.1,
      },
    });

    console.log('✅ Agents created successfully\n');

    // ╔═══════════════════════════════════════════════════════════╗
    // ║                 EXISTING TASKS SETUP                     ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log('📋 Setting up existing tasks (foundation work)...');

    const existingTasks = [
      new Task({
        description: 'Setup development environment and project structure',
        expectedOutput: 'Ready-to-use development environment with build tools',
        agent: developer,
        resourceRequirements: {
          estimatedTime: '2-3 hours',
          skillsRequired: ['devops', 'project_setup', 'tooling'],
          dependencies: [],
        },
      }),
      new Task({
        description: 'Create initial UI wireframes and design system',
        expectedOutput: 'Complete wireframes and design system documentation',
        agent: designer,
        resourceRequirements: {
          estimatedTime: '4-5 hours',
          skillsRequired: ['ui_design', 'wireframing', 'design_systems'],
          dependencies: [],
        },
      }),
      new Task({
        description: 'Setup CI/CD pipeline and testing framework',
        expectedOutput: 'Automated testing and deployment pipeline',
        agent: devops,
        resourceRequirements: {
          estimatedTime: '3-4 hours',
          skillsRequired: ['ci_cd', 'testing', 'automation'],
          dependencies: ['project_setup'],
        },
      }),
    ];

    console.log('✅ Existing tasks defined\n');

    // ╔═══════════════════════════════════════════════════════════╗
    // ║               TASK REPOSITORY SETUP                      ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log('📚 Creating task repository (AI can choose from these)...');

    const taskRepository = [
      new Task({
        description: 'Implement user authentication system',
        expectedOutput: 'Secure user login and registration with JWT',
        agent: developer,
        adaptable: true,
        orchestrationRules:
          'Can be adapted based on security requirements and complexity',
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: ['backend', 'security', 'authentication', 'database'],
          dependencies: ['project_setup'],
        },
      }),
      new Task({
        description: 'Build responsive component library',
        expectedOutput: 'Reusable UI components with Storybook documentation',
        agent: designer,
        adaptable: true,
        orchestrationRules:
          'Component complexity can be adjusted based on timeline',
        resourceRequirements: {
          estimatedTime: '8-10 hours',
          skillsRequired: [
            'frontend',
            'component_design',
            'responsive_design',
            'accessibility',
          ],
          dependencies: ['design_system'],
        },
      }),
      new Task({
        description: 'Create RESTful API endpoints',
        expectedOutput: 'Well-documented API with proper error handling',
        agent: developer,
        adaptable: true,
        orchestrationRules:
          'Endpoint complexity can be scaled based on requirements',
        resourceRequirements: {
          estimatedTime: '10-12 hours',
          skillsRequired: [
            'backend',
            'api_design',
            'database',
            'documentation',
          ],
          dependencies: ['authentication'],
        },
      }),
      new Task({
        description: 'Implement comprehensive test suite',
        expectedOutput: 'Automated tests with >80% code coverage',
        agent: tester,
        adaptable: true,
        orchestrationRules:
          'Test coverage can be adjusted based on timeline constraints',
        resourceRequirements: {
          estimatedTime: '8-10 hours',
          skillsRequired: ['testing', 'automation', 'quality_assurance'],
          dependencies: ['api_endpoints', 'components'],
        },
      }),
      new Task({
        description: 'Setup monitoring and logging infrastructure',
        expectedOutput: 'Production monitoring with alerts and dashboards',
        agent: devops,
        adaptable: true,
        orchestrationRules:
          'Monitoring complexity can be scaled based on project size',
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: [
            'monitoring',
            'logging',
            'infrastructure',
            'alerting',
          ],
          dependencies: ['ci_cd_pipeline'],
        },
      }),
      new Task({
        description: 'Implement data visualization dashboard',
        expectedOutput: 'Interactive charts and analytics dashboard',
        agent: developer,
        adaptable: true,
        orchestrationRules:
          'Chart complexity can be adjusted based on data requirements',
        resourceRequirements: {
          estimatedTime: '12-15 hours',
          skillsRequired: [
            'frontend',
            'data_visualization',
            'analytics',
            'charting',
          ],
          dependencies: ['api_endpoints', 'component_library'],
        },
      }),
      new Task({
        description: 'Optimize application performance',
        expectedOutput: 'Performance-optimized application with monitoring',
        agent: developer,
        adaptable: true,
        orchestrationRules:
          'Optimization level can be adjusted based on performance targets',
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: ['performance', 'optimization', 'monitoring'],
          dependencies: ['dashboard', 'testing'],
        },
      }),
      new Task({
        description: 'Implement mobile-responsive design',
        expectedOutput: 'Mobile-optimized user interface',
        agent: designer,
        adaptable: true,
        orchestrationRules:
          'Mobile complexity can be scaled based on target devices',
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: [
            'mobile_design',
            'responsive_design',
            'accessibility',
          ],
          dependencies: ['component_library'],
        },
      }),
    ];

    console.log('✅ Task repository created with 8 backlog tasks\n');

    // ╔═══════════════════════════════════════════════════════════╗
    // ║              DEMO 1: TRADITIONAL KAIBANJS                ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log('🔴 DEMO 1: Traditional KaibanJS (orchestration disabled)');
    console.log('─'.repeat(60));

    const traditionalTeam = new Team({
      name: 'Traditional Development Team',
      agents: [developer, designer, devops],
      tasks: existingTasks,
      enableOrchestration: false, // Traditional behavior
      env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' },
      logLevel: 'info',
    });

    console.log(`📊 Traditional team state:`);
    console.log(
      `   - Orchestration: ${traditionalTeam.enableOrchestration ? '✅' : '❌'}`
    );
    console.log(
      `   - Task count: ${traditionalTeam.getTasks().length} (fixed)`
    );
    console.log(
      `   - Available backlog tasks: ${traditionalTeam.backlogTasks.length}`
    );
    console.log('');

    // ╔═══════════════════════════════════════════════════════════╗
    // ║         DEMO 2: ORCHESTRATION WITH EXISTING TASKS        ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log(
      '🟢 DEMO 2: Intelligent Orchestration (building upon existing tasks)'
    );
    console.log('─'.repeat(60));

    const orchestratedTeam = new Team({
      name: 'AI-Orchestrated Development Team',
      agents: [developer, designer, tester, devops],
      tasks: [...existingTasks], // Start with existing tasks
      enableOrchestration: true, // Enable AI orchestration
      availableTasks: taskRepository,
      allowTaskGeneration: true,
      orchestrationStrategy: `
        Build a complete modern web application with the following requirements:
        
        CORE FEATURES:
        - User authentication and authorization
        - Responsive design with excellent UX
        - RESTful API with proper documentation
        - Comprehensive testing suite
        - Production monitoring and logging
        
        QUALITY STANDARDS:
        - 95%+ test coverage
        - Mobile-first responsive design
        - Performance optimized (< 3s load time)
        - Accessibility compliant (WCAG 2.1 AA)
        - Scalable architecture
        
        PRIORITIES:
        1. Build upon existing foundation work
        2. Ensure high code quality and maintainability
        3. Implement proper error handling and monitoring
        4. Focus on user experience and performance
      `,
      mode: 'adaptive', // AI adapts to changing requirements
      maxActiveTasks: 8,
      taskPrioritization: 'ai-driven',
      workloadDistribution: 'skills-based',
      env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' },
      logLevel: 'info',
    });

    console.log(`📊 Orchestrated team initial state:`);
    console.log(
      `   - Orchestration: ${
        orchestratedTeam.enableOrchestration ? '✅' : '❌'
      }`
    );
    console.log(`   - Initial tasks: ${orchestratedTeam.getTasks().length}`);
    console.log(
      `   - Available backlog tasks: ${orchestratedTeam.backlogTasks.length}`
    );
    console.log(
      `   - Task generation: ${
        orchestratedTeam.allowTaskGeneration ? '✅' : '❌'
      }`
    );
    console.log(`   - Mode: ${orchestratedTeam.mode}`);
    console.log(`   - Max active tasks: ${orchestratedTeam.maxActiveTasks}`);
    console.log('');

    // Start orchestration
    console.log('🎯 Starting intelligent orchestration...');
    console.log('Expected orchestration logs:');
    console.log('  🎯 ACTIVATED - Orchestration startup');
    console.log('  🔍 ANALYSIS_STARTED - Context analysis');
    console.log('  📋 TASK_SELECTION - AI task selection with gap analysis');
    console.log('  🔧 TASK_ADAPTATION - Task modification evaluation');
    console.log('  🏗️ TASK_GENERATION - New task creation (if gaps found)');
    console.log('  ✅ COMPLETED - Final orchestration results');
    console.log('');

    const orchestratedTasks = await orchestratedTeam.activateOrchestration(
      'Build a production-ready modern web application with excellent UX and comprehensive testing',
      true // preserveExistingTasks = true (build upon existing work)
    );

    console.log('\n✅ Orchestration completed!');
    console.log('─'.repeat(60));
    console.log(`📊 Final orchestration results:`);
    console.log(`   - Total tasks: ${orchestratedTasks.length}`);

    // Analyze task breakdown
    const existingCount = existingTasks.length;
    const newCount = orchestratedTasks.length - existingCount;
    console.log(`   - Existing tasks preserved: ${existingCount}`);
    console.log(`   - New tasks added: ${newCount}`);

    // Show workload distribution
    const workloadMap = new Map<string, number>();
    orchestratedTasks.forEach((task) => {
      const agentName = task.agent?.name || 'Unassigned';
      workloadMap.set(agentName, (workloadMap.get(agentName) || 0) + 1);
    });

    console.log(`\n👥 Workload distribution:`);
    for (const [agentName, taskCount] of workloadMap.entries()) {
      console.log(`   - ${agentName}: ${taskCount} tasks`);
    }

    // Show skill coverage
    const skillSet = new Set<string>();
    orchestratedTasks.forEach((task) => {
      if (task.resourceRequirements?.skillsRequired) {
        task.resourceRequirements.skillsRequired.forEach((skill) =>
          skillSet.add(skill)
        );
      }
    });

    console.log(
      `\n🎯 Skills covered: ${Array.from(skillSet).sort().join(', ')}`
    );

    // ╔═══════════════════════════════════════════════════════════╗
    // ║            DEMO 3: TASK REPOSITORY MANAGEMENT            ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log('\n🔧 DEMO 3: Task Repository Management');
    console.log('─'.repeat(60));

    // Add new task to repository
    const newTask = new Task({
      description: 'Implement real-time notifications system',
      expectedOutput: 'Real-time notification system with WebSocket support',
      agent: developer,
      adaptable: true,
      orchestrationRules:
        'Notification complexity can be adjusted based on user requirements',
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['backend', 'websockets', 'real_time', 'notifications'],
        dependencies: ['authentication', 'api_endpoints'],
      },
    });

    console.log('📚 Adding new task to repository...');
    orchestratedTeam.addAvailableTasks([newTask]);
    console.log(
      `✅ Repository updated: ${orchestratedTeam.availableTasks.length} tasks available`
    );

    // Update orchestration strategy
    console.log('\n⚙️ Updating orchestration strategy...');
    orchestratedTeam.updateOrchestrationStrategy(`
      Enhanced strategy: Build a real-time collaborative web application.
      New requirement: Add real-time features for better user engagement.
    `);
    console.log('✅ Strategy updated successfully');

    // Update orchestration mode
    console.log('🔄 Switching to innovative mode...');
    orchestratedTeam.updateOrchestrationMode('innovative');
    console.log('✅ Mode updated to innovative');

    // ╔═══════════════════════════════════════════════════════════╗
    // ║              DEMO 4: FRESH START ORCHESTRATION           ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log('\n🆕 DEMO 4: Fresh Start Orchestration (replace all tasks)');
    console.log('─'.repeat(60));

    const freshTeam = new Team({
      name: 'Fresh Start Team',
      agents: [developer, designer, tester],
      tasks: existingTasks, // We have existing tasks but will replace them
      enableOrchestration: true,
      availableTasks: taskRepository,
      allowTaskGeneration: false, // Only use backlog tasks
      orchestrationStrategy: `
        Build a minimal viable product (MVP) for a task management application.
        Focus on core features and rapid deployment.
      `,
      mode: 'conservative',
      maxActiveTasks: 5,
      env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' },
      logLevel: 'info',
    });

    console.log(
      '🎯 Starting fresh orchestration (replacing existing tasks)...'
    );
    const freshTasks = await freshTeam.activateOrchestration(
      'Build an MVP task management application',
      false // preserveExistingTasks = false (start fresh)
    );

    console.log(`\n✅ Fresh orchestration completed!`);
    console.log(`📊 Results: ${freshTasks.length} tasks selected for MVP`);
    console.log(`🔄 Original ${existingTasks.length} tasks were replaced`);

    // ╔═══════════════════════════════════════════════════════════╗
    // ║                     SUMMARY                               ║
    // ╚═══════════════════════════════════════════════════════════╝

    console.log('\n📈 ORCHESTRATION DEMO SUMMARY');
    console.log('═'.repeat(60));
    console.log('✅ Traditional KaibanJS: Fixed task workflow');
    console.log('✅ Intelligent Orchestration: AI-driven task management');
    console.log('✅ Existing Tasks Support: Build upon foundation work');
    console.log('✅ Gap Analysis: Smart skill-based task selection');
    console.log('✅ Repository Management: Dynamic task template updates');
    console.log(
      '✅ Adaptive Modes: Conservative, adaptive, innovative strategies'
    );
    console.log('✅ Comprehensive Logging: Full visibility into AI decisions');
    console.log('✅ Fresh Start Option: Complete task replacement when needed');
    console.log('\n🎉 All orchestration features demonstrated successfully!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
    console.error('\nPossible causes:');
    console.error('- Missing OPENAI_API_KEY in .env.local');
    console.error('- Network connectivity issues');
    console.error('- Invalid LLM configuration');
  }
};

// Run the orchestration demo
runOrchestrationDemo()
  .then(() => {
    console.log('\n✨ Orchestration Playground completed!');
  })
  .catch((error) => {
    console.error('Playground failed:', error);
  });
