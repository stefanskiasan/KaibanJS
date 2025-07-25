/**
 * KaibanJS Orchestration Demo (JavaScript)
 *
 * Demonstrates the new intelligent orchestration features in JavaScript.
 * This is a simplified version of the TypeScript playground.
 */

const { Agent, Task, Team } = require('kaibanjs');
require('dotenv').config({ path: './.env.local' });

console.log('🚀 KaibanJS Orchestration Demo Starting...\n');

const runDemo = async () => {
  try {
    // Create agents
    const developer = new Agent({
      name: 'Alex Developer',
      role: 'Full-Stack Developer',
      goal: 'Build scalable applications',
      background: 'Expert web developer',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.2,
      },
    });

    const designer = new Agent({
      name: 'Sarah Designer',
      role: 'UI/UX Designer',
      goal: 'Create beautiful interfaces',
      background: 'Design systems expert',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.3,
      },
    });

    // Create existing tasks (foundation work)
    const existingTasks = [
      new Task({
        description: 'Setup development environment',
        expectedOutput: 'Ready development environment',
        agent: developer,
        resourceRequirements: {
          estimatedTime: '2-3 hours',
          skillsRequired: ['devops', 'setup'],
          dependencies: [],
        },
      }),
      new Task({
        description: 'Create initial design wireframes',
        expectedOutput: 'Complete wireframes',
        agent: designer,
        resourceRequirements: {
          estimatedTime: '4 hours',
          skillsRequired: ['ui_design', 'wireframing'],
          dependencies: [],
        },
      }),
    ];

    // Create task repository (AI can choose from these)
    const taskRepository = [
      new Task({
        description: 'Implement user authentication',
        expectedOutput: 'Secure user login system',
        agent: developer,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: ['backend', 'security'],
          dependencies: ['setup'],
        },
      }),
      new Task({
        description: 'Build component library',
        expectedOutput: 'Reusable UI components',
        agent: designer,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '8 hours',
          skillsRequired: ['frontend', 'components'],
          dependencies: ['wireframes'],
        },
      }),
      new Task({
        description: 'Create API endpoints',
        expectedOutput: 'RESTful API',
        agent: developer,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '10 hours',
          skillsRequired: ['backend', 'api'],
          dependencies: ['authentication'],
        },
      }),
    ];

    console.log('📊 Setup complete:');
    console.log(`   - Agents: ${[developer, designer].length}`);
    console.log(`   - Existing tasks: ${existingTasks.length}`);
    console.log(`   - Available templates: ${taskRepository.length}\n`);

    // Demo 1: Traditional KaibanJS (no orchestration)
    console.log('🔴 DEMO 1: Traditional KaibanJS');
    console.log('─'.repeat(50));

    const traditionalTeam = new Team({
      name: 'Traditional Team',
      agents: [developer, designer],
      tasks: existingTasks,
      enableOrchestration: false, // No AI orchestration
      env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' },
    });

    console.log(
      `Traditional team: ${traditionalTeam.getTasks().length} fixed tasks\n`
    );

    // Demo 2: Intelligent Orchestration
    console.log('🟢 DEMO 2: Intelligent Orchestration');
    console.log('─'.repeat(50));

    const orchestratedTeam = new Team({
      name: 'AI-Orchestrated Team',
      agents: [developer, designer],
      tasks: [...existingTasks], // Start with existing
      enableOrchestration: true, // Enable AI orchestration ✨
      availableTasks: taskRepository,
      allowTaskGeneration: true,
      orchestrationStrategy: `
        Build a modern web application with:
        - User authentication
        - Beautiful UI components  
        - RESTful API
        Focus on high quality and user experience.
      `,
      mode: 'adaptive',
      maxActiveTasks: 6,
      env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' },
    });

    console.log('🎯 Starting orchestration...');
    console.log('Watch for orchestration logs above! ☝️\n');

    const result = await orchestratedTeam.activateOrchestration(
      'Build a complete web application with excellent UX',
      true // Build upon existing tasks
    );

    console.log('✅ Orchestration completed!');
    console.log(`📊 Results: ${result.length} total tasks`);
    console.log(
      `   - ${existingTasks.length} existing + ${
        result.length - existingTasks.length
      } new tasks\n`
    );

    // Show final task list
    console.log('📋 Final Task List:');
    result.forEach((task, index) => {
      const isExisting = existingTasks.some(
        (existing) => existing.id === task.id
      );
      const marker = isExisting ? '🔄' : '✨';
      console.log(`   ${index + 1}. ${marker} ${task.description}`);
    });

    // Demo 3: Repository Management
    console.log('\n🔧 DEMO 3: Repository Management');
    console.log('─'.repeat(50));

    const newTask = new Task({
      description: 'Add real-time notifications',
      expectedOutput: 'WebSocket notification system',
      agent: developer,
      template: true,
    });

    console.log('📚 Adding task to repository...');
    orchestratedTeam.addAvailableTasks([newTask]);
    console.log(
      `✅ Repository updated: ${orchestratedTeam.availableTasks.length} tasks`
    );

    console.log('\n⚙️ Updating strategy...');
    orchestratedTeam.updateOrchestrationStrategy(
      'Enhanced with real-time features'
    );
    console.log('✅ Strategy updated');

    console.log('\n🎉 All orchestration features demonstrated!');
    console.log('\nKey Features Shown:');
    console.log('  ✅ enableOrchestration flag');
    console.log('  ✅ Building upon existing tasks');
    console.log('  ✅ AI-driven task selection');
    console.log('  ✅ Gap analysis and smart planning');
    console.log('  ✅ Repository management');
    console.log('  ✅ Comprehensive logging');
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('\nCheck:');
    console.error('- OPENAI_API_KEY in .env.local');
    console.error('- Internet connection');
  }
};

runDemo();
