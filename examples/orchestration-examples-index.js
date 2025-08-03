/**
 * KaibanJS Orchestration Examples Index
 * 
 * This file provides an overview of all industry-specific orchestration examples
 * demonstrating the full capabilities of KaibanJS intelligent orchestration.
 * 
 * Each example showcases:
 * - All orchestration properties from ORCHESTRATION_PROPERTIES.md
 * - Industry-specific custom tools
 * - Real-world workflow scenarios
 * - Input-driven orchestration
 * - Runtime control demonstrations
 */

// Import all orchestration examples
const { runHealthcareOrchestrationExample } = require('./01-healthcare-orchestration');
const { runFinanceOrchestrationExample } = require('./02-finance-orchestration');
const { runEducationOrchestrationExample } = require('./03-education-orchestration');
const { runRetailOrchestrationExample } = require('./04-retail-orchestration');

// Example metadata for easy reference
const ORCHESTRATION_EXAMPLES = {
  healthcare: {
    file: '01-healthcare-orchestration.js',
    title: 'Healthcare - Hospital Operations',
    description: 'Patient care coordination with safety-critical workflows',
    features: [
      'Conservative mode for safety',
      'Skills-based workload distribution',
      'Continuous orchestration for patient care',
      'External validation for procedures',
      'Custom tools: PatientRecordTool, DiagnosisAssistantTool',
    ],
    keyProperties: {
      mode: 'conservative',
      continuousOrchestration: true,
      workloadDistribution: 'skills-based',
      maxActiveTasks: 6,
    },
  },
  
  finance: {
    file: '02-finance-orchestration.js',
    title: 'Finance - Investment Portfolio Management',
    description: 'Risk-aware portfolio optimization with compliance',
    features: [
      'Adaptive mode for market responsiveness',
      'AI-driven task prioritization',
      'Task generation for opportunities',
      'Compliance orchestration rules',
      'Custom tools: MarketAnalysisTool, RiskCalculatorTool',
    ],
    keyProperties: {
      mode: 'adaptive',
      continuousOrchestration: true,
      taskPrioritization: 'ai-driven',
      allowTaskGeneration: true,
    },
  },
  
  education: {
    file: '03-education-orchestration.js',
    title: 'Education - Online Course Development',
    description: 'Adaptive learning content creation and optimization',
    features: [
      'Learning mode for continuous improvement',
      'Auto-split strategies for modular content',
      'Merge-compatible tasks',
      'Analytics-driven adaptation',
      'Custom tools: CurriculumBuilderTool, LearningAnalyticsTool',
    ],
    keyProperties: {
      mode: 'learning',
      continuousOrchestration: true,
      splitStrategy: 'auto',
      maxActiveTasks: 6,
    },
  },
  
  retail: {
    file: '04-retail-orchestration.js',
    title: 'Retail/E-commerce - Inventory & Sales',
    description: 'High-volume operations with dynamic optimization',
    features: [
      'High concurrency for peak periods',
      'Availability-based distribution',
      'Dynamic priority adjustments',
      'Seasonal orchestration',
      'Custom tools: InventoryTrackerTool, PricingOptimizerTool',
    ],
    keyProperties: {
      mode: 'adaptive',
      maxActiveTasks: 8,
      workloadDistribution: 'availability',
      dynamicPriority: true,
    },
  },
};

// Utility function to run all examples
async function runAllOrchestrationExamples() {
  console.log('🚀 KaibanJS Orchestration Examples Showcase\n');
  console.log('Running all industry-specific orchestration examples...\n');
  console.log('=' .repeat(80) + '\n');

  const examples = [
    { name: 'Healthcare', runner: runHealthcareOrchestrationExample },
    { name: 'Finance', runner: runFinanceOrchestrationExample },
    { name: 'Education', runner: runEducationOrchestrationExample },
    { name: 'Retail', runner: runRetailOrchestrationExample },
  ];

  for (const example of examples) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Running ${example.name} Example`);
    console.log(${'='.repeat(80)}\n`);
    
    try {
      await example.runner();
      console.log(`\n✅ ${example.name} example completed successfully`);
    } catch (error) {
      console.error(`\n❌ ${example.name} example failed:`, error.message);
    }
    
    // Add delay between examples
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n' + '='.repeat(80));
  console.log('🎉 All orchestration examples completed!');
  console.log('=' .repeat(80));
}

// Display example summary
function displayOrchestrationSummary() {
  console.log('📚 KaibanJS Orchestration Examples Summary\n');
  
  Object.entries(ORCHESTRATION_EXAMPLES).forEach(([key, example]) => {
    console.log(`\n${example.title}`);
    console.log('-'.repeat(example.title.length));
    console.log(`File: ${example.file}`);
    console.log(`Description: ${example.description}`);
    console.log('\nKey Features:');
    example.features.forEach(feature => console.log(`  • ${feature}`));
    console.log('\nOrchestration Properties:');
    Object.entries(example.keyProperties).forEach(([prop, value]) => {
      console.log(`  • ${prop}: ${value}`);
    });
  });
  
  console.log('\n\n💡 Common Orchestration Properties Demonstrated:');
  console.log('  • enableOrchestration: true (all examples)');
  console.log('  • backlogTasks: Industry-specific task repositories');
  console.log('  • orchestrationStrategy: Detailed industry context');
  console.log('  • llmConfig: Optimized for each use case');
  console.log('  • inputs: Industry-specific context driving decisions');
  
  console.log('\n🔧 Runtime Controls Demonstrated:');
  console.log('  • updateOrchestrationStrategy()');
  console.log('  • updateOrchestrationMode()');
  console.log('  • setContinuousOrchestration()');
  console.log('  • addBacklogTasks()');
  console.log('  • getOrchestrationMetrics()');
  console.log('  • generateDependencyGraph()');
}

// Command-line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      runAllOrchestrationExamples()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Failed to run examples:', error);
          process.exit(1);
        });
      break;
      
    case 'healthcare':
      runHealthcareOrchestrationExample()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Healthcare example failed:', error);
          process.exit(1);
        });
      break;
      
    case 'finance':
      runFinanceOrchestrationExample()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Finance example failed:', error);
          process.exit(1);
        });
      break;
      
    case 'education':
      runEducationOrchestrationExample()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Education example failed:', error);
          process.exit(1);
        });
      break;
      
    case 'retail':
      runRetailOrchestrationExample()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Retail example failed:', error);
          process.exit(1);
        });
      break;
      
    case 'summary':
    default:
      displayOrchestrationSummary();
      console.log('\n\nUsage:');
      console.log('  node orchestration-examples-index.js [command]');
      console.log('\nCommands:');
      console.log('  summary    - Display this summary (default)');
      console.log('  all        - Run all examples');
      console.log('  healthcare - Run healthcare example');
      console.log('  finance    - Run finance example');
      console.log('  education  - Run education example');
      console.log('  retail     - Run retail example');
      break;
  }
}

module.exports = {
  ORCHESTRATION_EXAMPLES,
  runAllOrchestrationExamples,
  displayOrchestrationSummary,
};