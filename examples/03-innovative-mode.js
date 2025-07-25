/**
 * Example 03: Innovative Mode
 *
 * This example demonstrates the innovative orchestration mode, which is ideal for:
 * - Research & Development projects
 * - Startups and innovation labs
 * - Exploring new technologies
 * - Creative problem-solving
 * - Rapid prototyping
 *
 * Key characteristics:
 * - Autonomous task generation enabled
 * - High adaptability for tasks
 * - Experimental approaches encouraged
 * - AI-driven prioritization
 * - Higher risk tolerance for innovation
 */

require('dotenv').config();
const { Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import innovation-focused agents
const {
  innovationLead,
  aiResearcher,
  frontendDeveloper,
  mobileAppDeveloper,
  blockchainDeveloper,
} = require('./utils/agents');

const {
  researchNewTechnologyTask,
  createProofOfConceptTask,
} = require('./utils/tasks');

async function runInnovativeOrchestrationExample() {
  console.log('🚀 KaibanJS Innovative Mode Orchestration Example\n');
  console.log(
    'This example demonstrates innovative orchestration for R&D and creative projects.\n'
  );

  // Create a minimal task repository focused on exploration
  // In innovative mode, we rely more on AI generation
  const innovationTaskRepository = [
    // Research and exploration tasks
    researchNewTechnologyTask,
    createProofOfConceptTask,

    // Innovation-specific tasks
    new Task({
      description: 'Explore emerging AI/ML capabilities for the application',
      expectedOutput:
        'Report on applicable AI technologies with implementation recommendations',
      agent: aiResearcher,
      adaptable: true,
      template: true,
      dynamicPriority: true,
      orchestrationRules: `
        EXPLORATION AREAS:
        - Large Language Models integration
        - Computer Vision applications
        - Predictive analytics
        - Natural language processing
        - Recommendation systems
        
        INNOVATION FOCUS:
        - Prioritize cutting-edge over proven
        - Consider experimental APIs
        - Explore open source innovations
      `,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['ai_ml', 'research', 'prototyping'],
        dependencies: [],
      },
    }),

    new Task({
      description: 'Design innovative user experience with AI-powered features',
      expectedOutput: 'Futuristic UI/UX design incorporating AI interactions',
      agent: frontendDeveloper,
      adaptable: true,
      template: true,
      splitStrategy: 'auto',
      orchestrationRules: `
        INNOVATION TARGETS:
        - Voice and gesture interfaces
        - Predictive UI elements
        - Personalized experiences
        - Augmented reality features
        - Real-time collaboration
        
        BE BOLD: Push boundaries of conventional UI
      `,
      resourceRequirements: {
        estimatedTime: '6-8 hours',
        skillsRequired: ['frontend', 'ui_ux', 'ai_integration'],
        dependencies: ['ai_research'],
      },
    }),

    new Task({
      description:
        'Prototype blockchain integration for decentralized features',
      expectedOutput: 'Working prototype demonstrating blockchain capabilities',
      agent: blockchainDeveloper,
      adaptable: true,
      template: true,
      orchestrationRules:
        'Explore DeFi, NFTs, smart contracts, or other Web3 innovations',
      resourceRequirements: {
        estimatedTime: '5-7 hours',
        skillsRequired: ['blockchain', 'web3', 'smart_contracts'],
        dependencies: [],
      },
    }),
  ];

  console.log(
    `🧪 Innovation Repository: ${innovationTaskRepository.length} seed tasks for exploration\n`
  );
  console.log(
    'Note: In innovative mode, AI will generate additional tasks as needed!\n'
  );

  // Create an innovative team configuration
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o', // More capable model for innovation
    temperature: 0.8, // High temperature for creativity
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const innovationTeam = new Team({
    name: 'Innovation Lab Team',
    agents: [
      innovationLead,
      aiResearcher,
      frontendDeveloper,
      mobileAppDeveloper,
      blockchainDeveloper,
    ],
    tasks: [], // Start empty

    // Enable orchestration
    enableOrchestration: true,

    // Innovative mode - high creativity and risk tolerance
    mode: 'innovative',

    // Use continuous orchestration for maximum creativity and adaptation
    continuousOrchestration: true,

    // Seed task repository (will be expanded by AI)
    availableTemplateTasks: innovationTaskRepository,

    // IMPORTANT: Enable autonomous task generation
    allowTaskGeneration: true,

    // Creative and open-ended strategy
    orchestrationStrategy: `
      You are orchestrating an INNOVATION LAB working on the next generation of applications.
      
      MISSION:
      Create groundbreaking solutions that leverage emerging technologies to solve problems
      in ways that haven't been done before.
      
      INNOVATION PRINCIPLES:
      1. Question conventional approaches
      2. Combine technologies in unexpected ways
      3. Prioritize user delight over convention
      4. Explore the art of the possible
      5. Fail fast, learn faster
      
      AREAS TO EXPLORE:
      - AI/ML integration for intelligent features
      - Blockchain for decentralization and trust
      - AR/VR for immersive experiences
      - IoT for connected ecosystems
      - Quantum computing readiness
      - Edge computing capabilities
      
      CONSTRAINTS (minimal):
      - Prototypes should be demonstrable
      - Focus on potential over polish
      - Document innovative approaches
      
      BE CREATIVE:
      - Generate new tasks for unexplored areas
      - Combine multiple emerging technologies
      - Think 5 years ahead
      - Challenge assumptions
      - Surprise and delight
    `,

    // AI-driven prioritization for dynamic adaptation
    taskPrioritization: 'ai-driven',

    // Skills-based distribution to leverage expertise
    workloadDistribution: 'skills-based',

    // Allow more concurrent experiments
    maxActiveTasks: 4,

    // Shorter adaptation interval for rapid iteration
    adaptationInterval: 120000, // 2 minutes

    // More powerful LLM for creative tasks
    llmInstance: orchestrationLLM,
  });

  console.log('✅ Innovation team configured for maximum creativity\n');
  console.log('Configuration Details:');
  console.log(`- Mode: ${innovationTeam.mode} (high risk tolerance)`);
  console.log(
    `- Task Generation: ${
      innovationTeam.allowTaskGeneration ? 'Enabled' : 'Disabled'
    } 🎨`
  );
  console.log(`- Prioritization: ${innovationTeam.taskPrioritization}`);
  console.log(`- Max Concurrent Tasks: ${innovationTeam.maxActiveTasks}`);
  console.log(`- LLM Model: gpt-4o (powerful)`);
  console.log(`- LLM Temperature: 0.8 (creative)\n`);

  try {
    // Activate innovative orchestration
    console.log(
      '🎯 Activating innovative orchestration for next-gen application...\n'
    );

    const innovationGoal = `
      Create a revolutionary application that combines AI, blockchain, and immersive 
      technologies to redefine how users interact with digital services. Think beyond 
      current limitations and imagine what's possible in 2-5 years.
    `;

    const generatedTasks = await innovationTeam.activateOrchestration(
      innovationGoal,
      true
    );

    console.log(
      `\n✨ Innovative Orchestrator created ${generatedTasks.length} tasks:\n`
    );

    // Display tasks, highlighting generated ones
    let generatedCount = 0;
    generatedTasks.forEach((task, index) => {
      const isGenerated = !innovationTaskRepository.find(
        (t) => t.id === task.id
      );
      if (isGenerated) generatedCount++;

      console.log(
        `${index + 1}. ${isGenerated ? '🆕 ' : ''}${task.description}`
      );
      console.log(`   Agent: ${task.agent.name}`);
      console.log(
        `   Innovative Aspects: ${
          task.adaptable ? 'Highly adaptable' : 'Fixed approach'
        }`
      );
      if (isGenerated) {
        console.log(
          `   ⚡ This task was AI-generated based on the innovation goal!`
        );
      }
      console.log('');
    });

    console.log(`📊 Innovation Metrics:`);
    console.log(`- Original tasks: ${innovationTaskRepository.length}`);
    console.log(`- AI-generated tasks: ${generatedCount}`);
    console.log(`- Total innovation tasks: ${generatedTasks.length}\n`);

    // Demonstrate gap analysis
    console.log('🔍 Innovation Gap Analysis:\n');
    console.log('The AI identified and filled these innovation gaps:');
    console.log('1. User experience beyond traditional interfaces');
    console.log('2. Cross-technology integration opportunities');
    console.log('3. Future-proofing with emerging standards');
    console.log('4. Novel monetization models');
    console.log('5. Sustainability and social impact features\n');

    // Show task adaptation in action
    console.log('🔧 Task Adaptation Examples:\n');

    const adaptedTask = generatedTasks.find((t) =>
      t.description.includes('AI')
    );
    if (adaptedTask) {
      console.log(`Original: "${adaptedTask.description}"`);
      console.log('The orchestrator might adapt this to:');
      console.log('- Include latest GPT-4 vision capabilities');
      console.log('- Integrate with multiple AI providers');
      console.log('- Add real-time learning features\n');
    }

    // Innovation mode capabilities
    console.log('💡 Innovation Mode Capabilities:\n');
    console.log('1. Autonomous Task Generation:');
    console.log('   - AI creates tasks for unexplored opportunities');
    console.log('   - Fills gaps in innovation coverage');
    console.log('   - Suggests cross-functional experiments\n');

    console.log('2. High Adaptability:');
    console.log('   - Tasks evolve based on discoveries');
    console.log('   - Pivot quickly when better paths emerge');
    console.log('   - Combine tasks for synergistic innovations\n');

    console.log('3. Creative Problem Solving:');
    console.log('   - High LLM temperature encourages novel solutions');
    console.log('   - AI-driven prioritization finds optimal paths');
    console.log('   - Skills-based distribution maximizes expertise\n');

    // Best practices for innovative mode
    console.log('📚 Best Practices for Innovative Mode:\n');
    console.log('1. Start with a bold, open-ended goal');
    console.log('2. Keep initial task repository minimal - let AI expand');
    console.log('3. Use powerful LLM models (gpt-4o or better)');
    console.log('4. Set high temperature (0.7-0.9) for creativity');
    console.log('5. Enable task generation and high adaptability');
    console.log('6. Shorter adaptation intervals for rapid iteration');
    console.log('7. Document all experiments and learnings');
    console.log('8. Be prepared for unexpected directions');
  } catch (error) {
    console.error('❌ Innovation orchestration error:', error.message);

    console.log('\n💡 Innovation Mode Tips:');
    console.log('- Errors are learning opportunities');
    console.log('- Failed experiments provide valuable insights');
    console.log('- Adjust strategy based on discoveries');
    console.log('- Keep iterating and exploring');
  }

  // Innovation mode benefits
  console.log('\n🚀 Innovation Mode Benefits:\n');
  console.log('• Discovers unexplored opportunities');
  console.log('• Generates novel solutions autonomously');
  console.log('• Adapts quickly to new insights');
  console.log('• Encourages creative risk-taking');
  console.log('• Ideal for R&D and startups');
  console.log("• Pushes boundaries of what's possible");
  console.log('• Creates competitive advantages');
}

// Run the example
if (require.main === module) {
  runInnovativeOrchestrationExample()
    .then(() => console.log('\n✅ Innovation mode example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runInnovativeOrchestrationExample };
