import { OrchestrationContext } from '../orchestration/core/OrchestrationContext';
import { OrchestrationPromptFactory } from '../orchestration/promptTemplates';
import { Task } from '../index';

// Test the enhanced orchestration prompts
export function testOrchestrationEnhancements() {
  console.log('🧪 Testing Orchestration Enhancements\n');

  // Create test context
  const context: OrchestrationContext = {
    availableAgents: [
      { id: '1', name: 'Alex', role: 'Specialist' },
      { id: '2', name: 'Bailey', role: 'Coordinator' }
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
    codeCoverage: 75,
    qualityScore: 90,
    processCoverage: 80,
    inputs: {
      businessType: 'Fine dining restaurant',
      currentSeason: 'Spring',
      priority: 'high',
      focusArea: 'Seasonal menu planning',
    }
  };

  // Test tasks
  const availableTasks: Task[] = [
    {
      id: '1',
      description: 'Plan seasonal menu for spring season',
      expectedOutput: 'Complete menu with pricing',
      status: 'TODO',
      agent: null,
      adaptable: true,
      priority: 'medium',
      resourceRequirements: {
        estimatedTime: '3 hours',
        skillsRequired: ['menu-planning', 'culinary'],
      }
    } as Task,
    {
      id: '2', 
      description: 'Develop authentication system',
      expectedOutput: 'Secure auth implementation',
      status: 'TODO',
      agent: null,
      adaptable: true,
      priority: 'high',
      resourceRequirements: {
        estimatedTime: '5 hours',
        skillsRequired: ['security', 'backend'],
      }
    } as Task,
  ];

  // Test 1: Task Selection with inputs and strategy
  console.log('📍 TEST 1: Task Selection Prompt\n');
  
  const selectionPrompt = OrchestrationPromptFactory.createInitialTaskSelectionPrompt(
    context,
    'Optimize restaurant operations for spring season',
    availableTasks,
    'Goal: Maximize seasonal offerings. Prioritize: fresh ingredients and customer satisfaction. Focus on: spring menu development.'
  );

  // Check for key sections
  const hasUserInputs = selectionPrompt.includes('🎯 USER INPUTS (PRIMARY DECISION FACTOR)');
  const hasStrategy = selectionPrompt.includes('📋 ORCHESTRATION STRATEGY GUIDANCE');
  const hasDomain = selectionPrompt.includes('DOMAIN-SPECIFIC CONSIDERATIONS');

  console.log('✅ User Inputs Section:', hasUserInputs ? 'PRESENT' : 'MISSING');
  console.log('✅ Strategy Section:', hasStrategy ? 'PRESENT' : 'MISSING'); 
  console.log('✅ Domain Section:', hasDomain ? 'PRESENT' : 'MISSING');

  // Extract and display key sections
  if (hasUserInputs) {
    const inputMatch = selectionPrompt.match(/## 🎯 USER INPUTS.*?\n([\s\S]*?)(?=\n##|\n\*\*CRITICAL)/);
    if (inputMatch) {
      console.log('\n📌 User Inputs Content:');
      console.log(inputMatch[1].trim());
    }
  }

  if (hasDomain) {
    const domainMatch = selectionPrompt.match(/## DOMAIN-SPECIFIC CONSIDERATIONS.*?\n([\s\S]*?)(?=\n##)/);
    if (domainMatch) {
      console.log('\n🏢 Domain Content (first 300 chars):');
      console.log(domainMatch[1].trim().substring(0, 300) + '...');
    }
  }

  // Test 2: Different domain (Software)
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

  const softwarePrompt = OrchestrationPromptFactory.createInitialTaskSelectionPrompt(
    softwareContext,
    'Build secure authentication system',
    availableTasks,
    'Goal: Implement robust auth. Prioritize: security best practices. Using: JWT and encryption.'
  );

  const hasSoftwareDomain = softwarePrompt.includes('Software Development');
  console.log('✅ Software Domain Detected:', hasSoftwareDomain ? 'YES' : 'NO');

  // Test 3: Task Adaptation
  console.log('\n\n📍 TEST 3: Task Adaptation Prompt\n');
  
  const adaptationPrompt = OrchestrationPromptFactory.createTaskAdaptationPrompt(
    availableTasks[0],
    context,
    'Adapt for spring season focus'
  );

  const hasAdaptationInputs = adaptationPrompt.includes('🎯 USER INPUTS (CRITICAL ADAPTATION CONTEXT)');
  console.log('✅ Adaptation Inputs:', hasAdaptationInputs ? 'PRESENT' : 'MISSING');

  console.log('\n✅ All enhancement tests completed!');
}

// Run if called directly
if (require.main === module) {
  testOrchestrationEnhancements();
}