/**
 * Example 01: Healthcare Industry - Hospital Operations Orchestration
 * 
 * This example demonstrates intelligent orchestration for healthcare operations including:
 * - Patient care coordination with custom medical tools
 * - Conservative mode for safety-critical operations  
 * - Skills-based workload distribution for medical specialties
 * - Continuous orchestration for adaptive patient care
 * - Resource requirements and quality gates for medical tasks
 * - Custom healthcare inputs affecting orchestration decisions
 * 
 * Key Features Demonstrated:
 * - Custom tools: PatientRecordTool, DiagnosisAssistantTool
 * - All orchestration properties from ORCHESTRATION_PROPERTIES.md
 * - Healthcare-specific orchestration strategy
 * - Dynamic priority adjustments for emergencies
 * - External validation for critical procedures
 */

require('dotenv').config();
const { Agent, Task, Team } = require('kaibanjs');
const { PatientRecordTool, DiagnosisAssistantTool } = require('./utils/customTools');

async function runHealthcareOrchestrationExample() {
  console.log('🏥 Healthcare Orchestration Example - Hospital Operations\n');
  console.log('This example shows how KaibanJS orchestrates complex healthcare workflows.\n');

  // Create specialized healthcare agents with custom tools
  const doctorAgent = new Agent({
    name: 'Dr. Sarah Chen',
    role: 'Chief Medical Officer',
    goal: 'Ensure high-quality patient care and medical decision making',
    background: 'Board-certified physician with 15 years experience in internal medicine and hospital administration',
    tools: [new DiagnosisAssistantTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.2, // Lower temperature for medical decisions
    },
  });

  const nurseAgent = new Agent({
    name: 'Nurse Manager Johnson',
    role: 'Head Nurse',
    goal: 'Coordinate patient care and manage nursing staff efficiently',
    background: 'Registered nurse with expertise in patient care coordination and staff management',
    tools: [new PatientRecordTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
    },
  });

  const adminAgent = new Agent({
    name: 'Administrator Williams',
    role: 'Healthcare Administrator',
    goal: 'Optimize hospital operations and resource allocation',
    background: 'Healthcare administration specialist focused on efficiency and compliance',
    tools: [new PatientRecordTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.4,
    },
  });

  const labTechAgent = new Agent({
    name: 'Lab Tech Rodriguez',
    role: 'Laboratory Specialist',
    goal: 'Provide accurate and timely diagnostic test results',
    background: 'Clinical laboratory scientist with expertise in diagnostic testing',
    tools: [],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.2,
    },
  });

  // Create comprehensive healthcare task repository
  const healthcareTaskRepository = [
    // Patient Assessment Tasks
    new Task({
      title: 'Initial Patient Assessment',
      description: 'Conduct comprehensive initial assessment for newly admitted patients',
      expectedOutput: 'Complete patient assessment with vital signs, medical history, and initial diagnosis',
      agent: doctorAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'high',
      externalValidationRequired: true, // Senior doctor review required
      orchestrationRules: `
        CRITICAL RULES:
        - Must be completed within 30 minutes for emergency cases
        - Requires verification of patient identity
        - Must include allergy and medication history
        - Emergency cases take absolute priority
        
        ADAPTATION ALLOWED:
        - Assessment depth based on patient condition
        - Additional specialists can be consulted
        - Can be expedited for critical cases
      `,
      resourceRequirements: {
        estimatedTime: '30-60 minutes',
        skillsRequired: ['medical-assessment', 'diagnosis', 'patient-communication'],
        dependencies: [],
      },
      qualityGates: ['identity-verification', 'vital-signs-recorded', 'history-documented'],
    }),

    new Task({
      title: 'Medication Administration',
      description: 'Administer prescribed medications following safety protocols',
      expectedOutput: 'Medications administered safely with proper documentation',
      agent: nurseAgent,
      adaptable: false, // Medication protocols are strict
      priority: 'high',
      externalValidationRequired: true,
      orchestrationRules: `
        SAFETY PROTOCOLS (NON-NEGOTIABLE):
        - Double-check patient identity
        - Verify medication, dose, route, and time
        - Check for allergies and interactions
        - Document administration immediately
        
        NO ADAPTATIONS ALLOWED for medication protocols
      `,
      resourceRequirements: {
        estimatedTime: '15-30 minutes',
        skillsRequired: ['medication-administration', 'safety-protocols', 'documentation'],
        dependencies: ['patient-assessment', 'prescription-verification'],
      },
      qualityGates: ['identity-verified', 'prescription-checked', 'allergies-reviewed', 'documented'],
    }),

    new Task({
      title: 'Diagnostic Testing',
      description: 'Perform required diagnostic tests and analyze results',
      expectedOutput: 'Complete diagnostic test results with preliminary analysis',
      agent: labTechAgent,
      adaptable: true,
      dynamicPriority: true,
      splitStrategy: 'auto', // Can be split into multiple specific tests
      orchestrationRules: `
        TESTING PRIORITIES:
        - STAT orders processed immediately
        - Critical values reported within 15 minutes
        - Routine tests within standard timeframes
        
        ADAPTATIONS:
        - Test order can be modified based on initial results
        - Additional tests can be recommended
        - Can batch non-urgent tests for efficiency
      `,
      resourceRequirements: {
        estimatedTime: '1-4 hours',
        skillsRequired: ['laboratory-testing', 'result-analysis', 'quality-control'],
        dependencies: ['patient-assessment', 'test-orders'],
      },
    }),

    new Task({
      title: 'Patient Monitoring',
      description: 'Continuous monitoring of patient vital signs and condition',
      expectedOutput: 'Regular monitoring reports with alerts for any concerning changes',
      agent: nurseAgent,
      adaptable: true,
      dynamicPriority: true,
      mergeCompatible: ['medication-administration', 'patient-care'],
      orchestrationRules: `
        MONITORING FREQUENCY:
        - ICU patients: Every 15 minutes
        - Critical: Every 30 minutes  
        - Stable: Every 2-4 hours
        
        ESCALATION:
        - Any abnormal vitals trigger immediate doctor notification
        - Trending deterioration requires intervention
      `,
      resourceRequirements: {
        estimatedTime: 'Continuous',
        skillsRequired: ['vital-signs-monitoring', 'patient-assessment', 'alert-recognition'],
        dependencies: ['patient-admission'],
      },
    }),

    new Task({
      title: 'Discharge Planning',
      description: 'Coordinate patient discharge with appropriate follow-up care',
      expectedOutput: 'Complete discharge plan with medications, instructions, and follow-up appointments',
      agent: adminAgent,
      adaptable: true,
      priority: 'medium',
      splitStrategy: 'manual',
      orchestrationRules: `
        DISCHARGE REQUIREMENTS:
        - Medical clearance from attending physician
        - Medication reconciliation completed
        - Follow-up appointments scheduled
        - Patient education provided
        
        ADAPTATIONS:
        - Home health services if needed
        - Special transportation arrangements
        - Language-specific instructions
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['care-coordination', 'documentation', 'patient-education'],
        dependencies: ['medical-clearance', 'medication-reconciliation'],
      },
    }),

    new Task({
      title: 'Emergency Response',
      description: 'Rapid response to medical emergencies and code situations',
      expectedOutput: 'Stabilized patient with complete emergency response documentation',
      agent: doctorAgent,
      adaptable: false,
      dynamicPriority: true,
      priority: 'high',
      externalValidationRequired: false, // No time for external validation in emergencies
      orchestrationRules: `
        EMERGENCY PROTOCOLS:
        - Immediate response required
        - All other tasks suspended
        - Follow ACLS/BLS protocols
        - Rapid decision making authorized
        
        NO ADAPTATIONS during active emergency response
      `,
      resourceRequirements: {
        estimatedTime: 'Immediate - 1 hour',
        skillsRequired: ['emergency-medicine', 'rapid-response', 'team-coordination'],
        dependencies: [],
      },
      qualityGates: ['patient-stabilized', 'team-debriefed', 'incident-documented'],
    }),

    new Task({
      title: 'Staff Scheduling',
      description: 'Create and optimize staff schedules ensuring adequate coverage',
      expectedOutput: 'Optimized staff schedule meeting all coverage requirements',
      agent: adminAgent,
      adaptable: true,
      priority: 'medium',
      orchestrationRules: `
        SCHEDULING CONSTRAINTS:
        - Maintain nurse-to-patient ratios
        - Ensure specialty coverage 24/7
        - Account for staff certifications
        - Balance workload fairly
        
        ADAPTATIONS:
        - Adjust for unexpected absences
        - Increase staffing for high census
        - Specialty requirements for complex cases
      `,
      resourceRequirements: {
        estimatedTime: '2-4 hours',
        skillsRequired: ['staff-management', 'scheduling', 'resource-optimization'],
        dependencies: ['census-data', 'staff-availability'],
      },
    }),
  ];

  // Create healthcare team with comprehensive orchestration configuration
  const hospitalTeam = new Team({
    name: 'Hospital Operations Team',
    agents: [doctorAgent, nurseAgent, adminAgent, labTechAgent],
    tasks: [], // Start empty - orchestrator will select based on inputs
    
    // ===== Orchestration Configuration =====
    enableOrchestration: true,
    continuousOrchestration: true, // Adaptive to changing patient needs
    backlogTasks: healthcareTaskRepository,
    allowTaskGeneration: true, // Can create new tasks for unexpected situations
    
    orchestrationStrategy: `
      You are orchestrating a hospital operations team focused on patient safety and care quality.
      
      CRITICAL PRIORITIES:
      1. Patient safety is paramount - never compromise on safety protocols
      2. Emergency cases always take precedence over routine care
      3. Maintain strict medication administration protocols
      4. Ensure proper staff-to-patient ratios at all times
      
      OPERATIONAL GOALS:
      - Minimize patient wait times while maintaining quality
      - Optimize resource utilization across departments
      - Ensure compliance with healthcare regulations
      - Maintain high patient satisfaction scores
      
      CONSTRAINTS:
      - Limited ICU beds require careful patient prioritization
      - Staff must not exceed 12-hour shifts
      - All critical decisions require appropriate validation
      - Budget constraints on overtime and resources
      
      QUALITY METRICS:
      - Patient safety incidents: Zero tolerance
      - Average patient wait time: <2 hours for non-emergency
      - Medication error rate: <0.01%
      - Patient satisfaction: >90%
      
      ADAPTATION RULES:
      - Immediately re-prioritize for emergency cases
      - Scale resources based on patient acuity
      - Consider creating specialized tasks for complex cases
      - Balance efficiency with thoroughness
    `,
    
    mode: 'conservative', // Safety-first approach for healthcare
    maxActiveTasks: 6, // Handle multiple patients simultaneously
    taskPrioritization: 'ai-driven', // Dynamic prioritization based on patient acuity
    workloadDistribution: 'skills-based', // Match medical specialties to tasks
    
    // LLM configuration for healthcare-aware orchestration
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.2, // Low temperature for consistent medical decisions
      maxRetries: 3,
    },
  });

  console.log('✅ Hospital Operations Team configured with:');
  console.log(`- ${hospitalTeam.backlogTasks.length} healthcare-specific tasks`);
  console.log(`- ${Object.keys(hospitalTeam).filter(k => k.includes('Agent')).length} specialized medical agents`);
  console.log(`- Conservative orchestration mode for safety`);
  console.log(`- Continuous adaptation to patient needs\n`);

  try {
    // Healthcare-specific inputs that influence orchestration
    const hospitalInputs = {
      // Current hospital state
      currentCensus: 145,
      icuOccupancy: 85, // percentage
      edWaitTime: 3.5, // hours
      
      // Staffing levels
      doctorCount: 12,
      nurseCount: 48,
      nursePatientRatio: '1:4',
      
      // Patient acuity
      criticalPatients: 8,
      emergencyAdmissions: 3,
      routinePatients: 134,
      
      // Time context
      shift: 'day', // day, evening, night
      dayOfWeek: 'Monday',
      
      // Special circumstances
      fluSeason: true,
      codeBlueActive: false,
      masscasualtyEvent: false,
      
      // Compliance requirements
      jointCommissionVisit: false,
      mandatoryTrainingDue: true,
    };

    console.log('🏥 Current Hospital Status:');
    console.log(`- Census: ${hospitalInputs.currentCensus} patients`);
    console.log(`- ICU Occupancy: ${hospitalInputs.icuOccupancy}%`);
    console.log(`- ED Wait Time: ${hospitalInputs.edWaitTime} hours`);
    console.log(`- Critical Patients: ${hospitalInputs.criticalPatients}`);
    console.log(`- Emergency Admissions: ${hospitalInputs.emergencyAdmissions}\n`);

    // Start orchestrated workflow with healthcare context
    console.log('🚀 Starting intelligent healthcare orchestration...\n');
    
    const result = await hospitalTeam.start(hospitalInputs, {
      projectGoal: 'Optimize patient care delivery while maintaining safety standards and managing current high census with limited ICU capacity',
      preserveExistingTasks: false,
    });

    console.log('\n✅ Healthcare Orchestration Results:');
    console.log(`- Workflow Status: ${result.status}`);
    console.log(`- Tasks Completed: ${result.stats?.taskCount || 0}`);
    console.log(`- Execution Time: ${result.stats?.duration || 'N/A'}`);
    
    // Display orchestrated healthcare tasks
    const orchestratedTasks = hospitalTeam.getTasks();
    console.log('\n📋 Orchestrated Healthcare Tasks:');
    orchestratedTasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title || task.description}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Agent: ${task.agent?.name}`);
      console.log(`   Validation Required: ${task.externalValidationRequired ? 'Yes' : 'No'}`);
      if (task.resourceRequirements?.estimatedTime) {
        console.log(`   Estimated Time: ${task.resourceRequirements.estimatedTime}`);
      }
    });

    // Demonstrate runtime orchestration control
    console.log('\n\n🔧 Runtime Orchestration Control Demo:');
    
    // Simulate emergency situation
    console.log('\n🚨 EMERGENCY: Code Blue in ICU!');
    hospitalTeam.updateOrchestrationStrategy(
      hospitalTeam.orchestrationStrategy + '\n\nIMMEDIATE: Code Blue response required - all emergency protocols activated!'
    );
    
    // Switch to more aggressive mode for emergency
    hospitalTeam.updateOrchestrationMode('adaptive');
    console.log('✅ Switched to adaptive mode for emergency response');
    
    // Add emergency-specific task
    const codeBlueTask = new Task({
      title: 'Code Blue Response - ICU',
      description: 'Immediate response to cardiac arrest in ICU',
      expectedOutput: 'Patient stabilized or resuscitation outcome documented',
      agent: doctorAgent,
      priority: 'high',
      adaptable: false,
      externalValidationRequired: false,
      resourceRequirements: {
        estimatedTime: 'Immediate',
        skillsRequired: ['ACLS', 'emergency-response'],
      },
    });
    
    hospitalTeam.addBacklogTasks([codeBlueTask]);
    console.log('✅ Added Code Blue emergency task to backlog');
    
    // Get orchestration metrics
    const metrics = await hospitalTeam.getOrchestrationMetrics();
    if (metrics) {
      console.log('\n📊 Orchestration Performance Metrics:');
      console.log(`- Task Success Rate: ${metrics.taskStatistics.successRate || 'N/A'}%`);
      console.log(`- Average Task Duration: ${metrics.performance.avgTaskDuration || 'N/A'}`);
      console.log(`- System Health: ${metrics.systemHealth.status || 'N/A'}`);
    }

    // Generate dependency visualization
    const dependencyGraph = await hospitalTeam.generateDependencyGraph();
    if (dependencyGraph) {
      console.log('\n🔗 Task Dependency Analysis:');
      console.log(`- Total Tasks: ${dependencyGraph.nodes.length}`);
      console.log(`- Dependencies: ${dependencyGraph.edges.length}`);
      console.log(`- Max Parallel Tasks: ${dependencyGraph.metrics.parallelism}`);
      console.log(`- Critical Path Length: ${dependencyGraph.metrics.depth} steps`);
    }

  } catch (error) {
    console.error('❌ Healthcare orchestration error:', error.message);
    
    // Healthcare-specific error handling
    console.log('\n🚨 Emergency Protocol Activated:');
    console.log('1. Reverting to manual task assignment');
    console.log('2. Notifying charge nurse for coverage');
    console.log('3. Activating backup contingency plans');
    console.log('4. Documenting system issue for review');
  }

  // Healthcare-specific insights
  console.log('\n\n💡 Healthcare Orchestration Insights:');
  console.log('\n1. **Safety-First Approach**:');
  console.log('   - Conservative mode prevents risky adaptations');
  console.log('   - External validation for critical procedures');
  console.log('   - Quality gates ensure protocol compliance');
  
  console.log('\n2. **Dynamic Priority Management**:');
  console.log('   - Emergency cases automatically prioritized');
  console.log('   - AI-driven prioritization based on acuity');
  console.log('   - Continuous re-evaluation of priorities');
  
  console.log('\n3. **Specialized Resource Allocation**:');
  console.log('   - Skills-based distribution matches expertise');
  console.log('   - Workload balanced across specialties');
  console.log('   - Prevents staff burnout with smart scheduling');
  
  console.log('\n4. **Regulatory Compliance**:');
  console.log('   - Built-in quality gates for safety');
  console.log('   - Documentation requirements enforced');
  console.log('   - Audit trail for all decisions');
  
  console.log('\n5. **Custom Healthcare Tools**:');
  console.log('   - PatientRecordTool for secure data access');
  console.log('   - DiagnosisAssistantTool for clinical support');
  console.log('   - Integration with hospital systems');
}

// Run the healthcare example
if (require.main === module) {
  runHealthcareOrchestrationExample()
    .then(() => {
      console.log('\n✅ Healthcare orchestration example completed!');
      console.log('\nThis example demonstrated how KaibanJS can handle complex healthcare');
      console.log('workflows with safety, compliance, and patient care as top priorities.');
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { runHealthcareOrchestrationExample };