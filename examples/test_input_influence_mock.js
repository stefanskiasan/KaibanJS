const { Agent, Task, Team } = require('../dist/bundle.cjs');

// Mock LLM response for testing
class MockLLM {
  async invoke(prompt) {
    console.log('\n📤 LLM Prompt Preview (first 500 chars):');
    console.log(prompt.substring(0, 500) + '...\n');
    
    // Check if inputs are prominently displayed in the prompt
    const hasUserInputs = prompt.includes('🎯 USER INPUTS (PRIMARY DECISION FACTOR)');
    const hasStrategy = prompt.includes('📋 ORCHESTRATION STRATEGY GUIDANCE');
    const hasDomainConsiderations = prompt.includes('DOMAIN-SPECIFIC CONSIDERATIONS');
    
    console.log('✅ User Inputs Section Present:', hasUserInputs);
    console.log('✅ Strategy Section Present:', hasStrategy);
    console.log('✅ Domain Considerations Present:', hasDomainConsiderations);
    
    // Return a mock response
    return JSON.stringify({
      selectedTasks: [
        {
          taskIndex: 0,
          priority: 'high',
          reasoning: 'Selected based on user inputs',
          suggestedAgent: 'auto_select',
          estimatedImpact: 'High impact on project',
          riskFactors: 'Low risk',
          adaptations: 'None needed'
        }
      ],
      overallStrategy: 'Focusing on user input priorities',
      expectedOutcomes: 'Aligned with user goals',
      riskAssessment: 'Low risk',
      nextReview: '30'
    });
  }
}

// Override the team's LLM with our mock
Team.prototype._initializeLLM = function() {
  this.llm = new MockLLM();
};

async function testInputInfluence() {
  console.log('🧪 Testing Input Influence on Orchestration\n');
  
  // Create simple agents
  const agent1 = new Agent({
    name: 'Alex',
    role: 'General Specialist',
    goal: 'Complete assigned tasks efficiently',
  });

  const agent2 = new Agent({
    name: 'Bailey', 
    role: 'Task Coordinator',
    goal: 'Coordinate and execute complex tasks',
  });

  // Create test tasks
  const tasks = [
    new Task({
      description: 'Plan seasonal menu for spring season',
      expectedOutput: 'Complete seasonal menu with pricing',
      agent: agent1,
    }),
    new Task({
      description: 'Develop software authentication system',
      expectedOutput: 'Secure authentication implementation',
      agent: agent2,
    }),
  ];

  // Test 1: Restaurant inputs
  console.log('\n📍 TEST 1: Restaurant Business Inputs');
  console.log('====================================');
  
  const restaurantTeam = new Team({
    name: 'Restaurant Team',
    agents: [agent1, agent2],
    tasks: tasks,
    inputs: {
      businessType: 'Fine dining restaurant',
      currentSeason: 'Spring',
      priority: 'high',
      focusArea: 'Seasonal menu planning',
    },
    env: {
      OPENAI_API_KEY: 'mock-key'
    }
  });

  restaurantTeam.options = {
    enableIntelligentOrchestration: true,
    orchestrationStrategy: 'Goal: Optimize restaurant operations. Prioritize: seasonal menu planning and customer satisfaction. Focus on: spring ingredients and dining experience.',
  };

  try {
    await restaurantTeam.start();
    console.log('✅ Restaurant test completed\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: Software inputs
  console.log('\n📍 TEST 2: Software Development Inputs');
  console.log('=====================================');
  
  const softwareTeam = new Team({
    name: 'Software Team',
    agents: [agent1, agent2],
    tasks: tasks,
    inputs: {
      projectType: 'Software Development',
      techStack: 'Node.js, React, PostgreSQL',
      priority: 'high',
      focusArea: 'Authentication and Security',
    },
    env: {
      OPENAI_API_KEY: 'mock-key'
    }
  });

  softwareTeam.options = {
    enableIntelligentOrchestration: true,
    orchestrationStrategy: 'Goal: Build secure software system. Prioritize: authentication and data protection. Using: modern security practices and encryption.',
  };

  try {
    await softwareTeam.start();
    console.log('✅ Software test completed\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testInputInfluence().catch(console.error);