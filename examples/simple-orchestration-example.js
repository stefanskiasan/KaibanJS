/**
 * KaibanJS Simple Orchestration Example
 *
 * This example shows the simplest way to get started with intelligent orchestration.
 * Compare traditional vs. orchestrated workflows in one file.
 */

const { Agent, Task, Team } = require('kaibanjs');
require('dotenv').config();

console.log('🚀 KaibanJS Simple Orchestration Example\n');

async function runExample() {
  try {
    // Create agents
    const developer = new Agent({
      name: 'Alex Developer',
      role: 'Full-Stack Developer',
      goal: 'Build great applications',
      background: 'Experienced developer',
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
      background: 'Design expert',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.3,
      },
    });

    // Some existing tasks we already have
    const existingTasks = [
      new Task({
        description: 'Setup project structure',
        expectedOutput: 'Ready project with build tools',
        agent: developer,
      }),
      new Task({
        description: 'Create wireframes',
        expectedOutput: 'Complete wireframes',
        agent: designer,
      }),
    ];

    // Task repository - tasks AI can choose from
    const taskRepository = [
      new Task({
        description: 'Implement user authentication',
        expectedOutput: 'Working login system',
        agent: developer,
        adaptable: true,
        template: true,
      }),
      new Task({
        description: 'Build responsive UI components',
        expectedOutput: 'Reusable UI components',
        agent: designer,
        adaptable: true,
        template: true,
      }),
      new Task({
        description: 'Add user dashboard',
        expectedOutput: 'User dashboard with analytics',
        agent: developer,
        adaptable: true,
        template: true,
      }),
    ];

    console.log('📊 Setup:');
    console.log(`- ${existingTasks.length} existing tasks`);
    console.log(`- ${taskRepository.length} available templates`);
    console.log(`- ${[developer, designer].length} agents\n`);

    // ====== TRADITIONAL KAIBANJS ======
    console.log('🔴 TRADITIONAL: Fixed tasks, no AI orchestration');
    console.log('─'.repeat(50));

    const traditionalTeam = new Team({
      name: 'Traditional Team',
      agents: [developer, designer],
      tasks: existingTasks,
      enableOrchestration: false, // Traditional behavior
      env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
    });

    console.log(
      `Traditional team: ${traditionalTeam.getTasks().length} fixed tasks\n`
    );

    // ====== INTELLIGENT ORCHESTRATION ======
    console.log('🟢 INTELLIGENT: AI selects and adapts tasks');
    console.log('─'.repeat(50));

    const orchestratedTeam = new Team({
      name: 'AI-Orchestrated Team',
      agents: [developer, designer],
      tasks: [...existingTasks], // Start with existing
      enableOrchestration: true, // 🤖 Enable AI orchestration
      availableTasks: taskRepository,
      allowTaskGeneration: true,
      orchestrationStrategy: `
        Build a modern web application with:
        - User authentication
        - Beautiful, responsive UI
        - User dashboard
        Focus on quality and user experience.
      `,
      mode: 'adaptive',
      env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
    });

    console.log('🎯 Starting orchestration...');
    console.log('AI will analyze gaps and select optimal tasks...\n');

    const result = await orchestratedTeam.activateOrchestration(
      'Build a complete web application with excellent UX',
      true // Build upon existing tasks
    );

    console.log('✅ Orchestration completed!');
    console.log(`📊 Results: ${result.length} total tasks`);
    console.log(`- ${existingTasks.length} existing tasks preserved`);
    console.log(
      `- ${result.length - existingTasks.length} new tasks added by AI\n`
    );

    console.log('📋 Final Task List:');
    result.forEach((task, index) => {
      const isExisting = existingTasks.some(
        (existing) => existing.id === task.id
      );
      const marker = isExisting ? '🔄 (existing)' : '✨ (AI selected)';
      console.log(`${index + 1}. ${marker} ${task.description}`);
      console.log(`   → Agent: ${task.agent.name}`);
    });

    console.log('\n🎉 Key Differences:');
    console.log('Traditional: You manually define all tasks');
    console.log(
      'Orchestrated: AI analyzes your goals and selects optimal tasks'
    );
    console.log('Result: Smarter workflows with gap analysis!\n');

    // Optional: Show repository management
    console.log('📚 Bonus: Dynamic Repository Management');
    console.log('─'.repeat(30));

    const newTask = new Task({
      description: 'Add real-time notifications',
      expectedOutput: 'WebSocket notification system',
      agent: developer,
      template: true,
    });

    orchestratedTeam.addAvailableTasks([newTask]);
    console.log(`✅ Added new task to repository`);
    console.log(
      `📊 Repository now has ${orchestratedTeam.availableTasks.length} templates`
    );
  } catch (error) {
    console.error('❌ Example failed:', error.message);
    console.log('\nMake sure you have:');
    console.log('- OPENAI_API_KEY in your environment');
    console.log('- Internet connection');
  }
}

// Run the example
runExample();
