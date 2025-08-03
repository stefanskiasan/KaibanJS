// Direct test of prompt template enhancements
const path = require('path');
const { OrchestrationPromptFactory } = require(path.join(__dirname, '..', 'dist', 'bundle.cjs')).orchestration;

function testPromptEnhancements() {
  console.log('🧪 Testing Orchestration Prompt Enhancements\n');

  // Create test context
  const context = {
    availableAgents: [
      { name: 'Alex', role: 'Specialist' },
      { name: 'Bailey', role: 'Coordinator' }
    ],
    activeTasks: [],
    existingTasks: [],
    blockedTasks: [],
    projectProgress: 25,
    resourceAvailability: 'high',
    timeConstraints: 'Q2 2024',
    qualityRequirements: 'high',
    workload: 'moderate',
    projectPhase: 'initial',
    performanceScore: 85,
    processCoverage: 80,
    inputs: {
      businessType: 'Fine dining restaurant',
      currentSeason: 'Spring',
      priority: 'high',
      focusArea: 'Seasonal menu planning',
    }
  };

  // Test tasks
  const availableTasks = [
    {
      description: 'Plan seasonal menu for spring season',
      expectedOutput: 'Complete menu with pricing',
      adaptable: true,
      priority: 'medium',
      resourceRequirements: {
        estimatedTime: '3 hours',
        skillsRequired: ['menu-planning', 'culinary'],
      }
    },
    {
      description: 'Develop authentication system',
      expectedOutput: 'Secure auth implementation',
      adaptable: true,
      priority: 'high',
      resourceRequirements: {
        estimatedTime: '5 hours',
        skillsRequired: ['security', 'backend'],
      }
    },
  ];

  // Test 1: Task Selection with restaurant inputs
  console.log('📍 TEST 1: Restaurant Domain\n');
  
  try {
    const selectionPrompt = OrchestrationPromptFactory.createInitialTaskSelectionPrompt(
      context,
      'Optimize restaurant operations for spring season',
      availableTasks,
      'Goal: Maximize seasonal offerings. Prioritize: fresh ingredients and customer satisfaction.'
    );

    // Check for key sections
    const hasUserInputs = selectionPrompt.includes('🎯 USER INPUTS (PRIMARY DECISION FACTOR)');
    const hasStrategy = selectionPrompt.includes('📋 ORCHESTRATION STRATEGY GUIDANCE');
    const hasDomain = selectionPrompt.includes('DOMAIN-SPECIFIC CONSIDERATIONS');

    console.log('✅ User Inputs Section:', hasUserInputs ? 'PRESENT' : 'MISSING');
    console.log('✅ Strategy Section:', hasStrategy ? 'PRESENT' : 'MISSING'); 
    console.log('✅ Domain Section:', hasDomain ? 'PRESENT' : 'MISSING');

    if (hasUserInputs) {
      console.log('\n📌 User Inputs Found in Prompt:');
      const lines = selectionPrompt.split('\n');
      let inInputSection = false;
      for (const line of lines) {
        if (line.includes('🎯 USER INPUTS')) {
          inInputSection = true;
        } else if (inInputSection && line.startsWith('##')) {
          break;
        } else if (inInputSection && line.trim()) {
          console.log(line);
        }
      }
    }

    if (hasDomain) {
      console.log('\n🏢 Domain Considerations Found:');
      const domainMatch = selectionPrompt.match(/DOMAIN-SPECIFIC CONSIDERATIONS.*?\n([\s\S]{0,300})/);
      if (domainMatch) {
        console.log(domainMatch[1].trim() + '...');
      }
    }
  } catch (error) {
    console.error('Error in Test 1:', error.message);
  }

  // Test 2: Software domain
  console.log('\n\n📍 TEST 2: Software Domain\n');
  
  const softwareContext = {
    ...context,
    inputs: {
      projectType: 'Software Development',
      techStack: 'Node.js, React',
      priority: 'high',
      focusArea: 'Authentication',
    }
  };

  try {
    const softwarePrompt = OrchestrationPromptFactory.createInitialTaskSelectionPrompt(
      softwareContext,
      'Build secure authentication system',
      availableTasks,
      'Goal: Implement robust auth. Prioritize: security best practices.'
    );

    const hasSoftwareDomain = softwarePrompt.includes('Software Development');
    console.log('✅ Software Domain Detected:', hasSoftwareDomain ? 'YES' : 'NO');
    
    // Check strategy parsing
    const hasSecurityPriority = softwarePrompt.includes('security best practices');
    console.log('✅ Strategy Priority Parsed:', hasSecurityPriority ? 'YES' : 'NO');
  } catch (error) {
    console.error('Error in Test 2:', error.message);
  }

  console.log('\n✅ All tests completed!');
}

// Check orchestration namespace
const bundle = require(path.join(__dirname, '..', 'dist', 'bundle.cjs'));
console.log('Available exports:', Object.keys(bundle));

if (bundle.orchestration) {
  console.log('Orchestration namespace contents:', Object.keys(bundle.orchestration));
  
  // Try to get OrchestrationPromptFactory
  const { OrchestrationPromptFactory: Factory } = bundle.orchestration;
  if (Factory) {
    // Replace the top-level variable
    const OrchestrationPromptFactory = Factory;
    testPromptEnhancements();
  } else {
    console.log('❌ OrchestrationPromptFactory not found in orchestration namespace');
  }
} else {
  console.log('❌ orchestration namespace not found');
}