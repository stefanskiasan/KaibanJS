/**
 * Example 10: Enterprise Setup
 *
 * This example demonstrates a comprehensive enterprise configuration with:
 * - Large-scale team coordination
 * - Complex task dependencies
 * - Compliance and governance
 * - Multi-environment workflows
 * - Advanced security requirements
 * - Audit trails and reporting
 *
 * Key features:
 * - Conservative mode with controlled innovation
 * - Extensive task repository
 * - Multiple specialized teams
 * - Governance and compliance focus
 * - Enterprise-grade monitoring
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import all available agents for enterprise team
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  dataArchitect,
  uxDesigner,
  qaEngineer,
  devOpsEngineer,
  securityExpert,
  productManager,
  technicalWriter,
  performanceEngineer,
  mobileAppDeveloper,
  blockchainDeveloper,
  aiResearcher,
  innovationLead,
} = require('./utils/agents');

async function runEnterpriseSetupExample() {
  console.log('🏢 KaibanJS Enterprise Setup Example\n');
  console.log(
    'This example demonstrates orchestration for large enterprise projects.\n'
  );

  // Create comprehensive enterprise task repository
  const enterpriseTaskRepository = [
    // Governance and Compliance Tasks
    new Task({
      description:
        'Establish enterprise governance framework and compliance policies',
      expectedOutput:
        'Complete governance documentation with approval workflows',
      agent: productManager,
      adaptable: false, // Governance must be strict
      orchestrationRules: `
        COMPLIANCE REQUIREMENTS:
        - SOC 2 Type II compliance
        - GDPR and CCPA compliance
        - HIPAA compliance for healthcare data
        - Financial regulations (PCI-DSS)
        
        GOVERNANCE AREAS:
        - Data governance policies
        - Security protocols
        - Change management procedures
        - Audit trail requirements
        - Access control matrices
      `,
      resourceRequirements: {
        estimatedTime: '20-30 hours',
        skillsRequired: ['governance', 'compliance', 'enterprise_architecture'],
        dependencies: [],
      },
    }),

    // Security Architecture
    new Task({
      description: 'Design and implement zero-trust security architecture',
      expectedOutput:
        'Enterprise-grade security infrastructure with zero-trust model',
      agent: securityExpert,
      adaptable: false,
      orchestrationRules: `
        SECURITY LAYERS:
        - Network segmentation
        - Identity and access management (IAM)
        - Multi-factor authentication (MFA)
        - Encryption at rest and in transit
        - Security incident response (SIEM)
        - Vulnerability management
        - Penetration testing framework
        
        ENTERPRISE REQUIREMENTS:
        - Support for 10,000+ users
        - Multiple geographic regions
        - Integration with enterprise SSO
        - Compliance with all regulations
      `,
      resourceRequirements: {
        estimatedTime: '40-50 hours',
        skillsRequired: ['security', 'enterprise_architecture', 'zero_trust'],
        dependencies: ['governance_framework'],
      },
    }),

    // Microservices Architecture
    new Task({
      description:
        'Design scalable microservices architecture for global deployment',
      expectedOutput: 'Complete microservices blueprint with service mesh',
      agent: seniorDeveloper,
      adaptable: true,
      splitStrategy: 'manual', // Can be broken into service-specific tasks
      orchestrationRules: `
        ARCHITECTURE COMPONENTS:
        - Service discovery and registry
        - API gateway and management
        - Service mesh (Istio/Linkerd)
        - Circuit breakers and resilience
        - Distributed tracing
        - Centralized configuration
        
        SCALE REQUIREMENTS:
        - 1M+ requests per minute
        - 99.99% availability SLA
        - <100ms latency globally
        - Auto-scaling capabilities
      `,
      resourceRequirements: {
        estimatedTime: '60-80 hours',
        skillsRequired: ['microservices', 'kubernetes', 'system_design'],
        dependencies: ['security_architecture'],
      },
    }),

    // Data Platform
    new Task({
      description: 'Build enterprise data platform with real-time analytics',
      expectedOutput:
        'Unified data platform supporting batch and stream processing',
      agent: dataArchitect,
      adaptable: true,
      orchestrationRules: `
        DATA PLATFORM FEATURES:
        - Data lake and warehouse
        - Real-time streaming (Kafka)
        - ETL/ELT pipelines
        - Data governance and lineage
        - Self-service analytics
        - ML/AI capabilities
        
        ENTERPRISE SCALE:
        - Petabyte-scale storage
        - Multi-region replication
        - ACID compliance
        - Sub-second query response
      `,
      resourceRequirements: {
        estimatedTime: '80-100 hours',
        skillsRequired: ['big_data', 'data_engineering', 'analytics'],
        dependencies: ['microservices_architecture'],
      },
    }),

    // Global Infrastructure
    new Task({
      description:
        'Implement multi-region cloud infrastructure with disaster recovery',
      expectedOutput: 'Global infrastructure with automated failover and DR',
      agent: devOpsEngineer,
      adaptable: true,
      orchestrationRules: `
        INFRASTRUCTURE REQUIREMENTS:
        - Multi-cloud strategy (AWS/Azure/GCP)
        - Global load balancing
        - Disaster recovery (<15min RTO)
        - Infrastructure as Code (Terraform)
        - Cost optimization
        - Green computing initiatives
        
        REGIONS:
        - Primary: US East, EU West
        - Secondary: Asia Pacific, US West
        - DR sites in each region
      `,
      resourceRequirements: {
        estimatedTime: '60-80 hours',
        skillsRequired: ['cloud_architecture', 'devops', 'disaster_recovery'],
        dependencies: ['security_architecture', 'microservices_architecture'],
      },
    }),

    // Enterprise Frontend Platform
    new Task({
      description:
        'Create unified frontend platform with micro-frontends architecture',
      expectedOutput: 'Scalable frontend platform supporting multiple teams',
      agent: frontendDeveloper,
      adaptable: true,
      orchestrationRules: `
        PLATFORM FEATURES:
        - Micro-frontends architecture
        - Shared component library
        - Design system implementation
        - Multi-brand theming
        - Accessibility (WCAG AAA)
        - Progressive web apps
        - Offline capabilities
        
        PERFORMANCE TARGETS:
        - <1s first contentful paint
        - 100 Lighthouse score
        - Support for IE11+
      `,
      resourceRequirements: {
        estimatedTime: '50-70 hours',
        skillsRequired: ['frontend', 'micro_frontends', 'performance'],
        dependencies: ['design_system'],
      },
    }),

    // Quality Assurance Framework
    new Task({
      description: 'Establish enterprise QA framework with automated testing',
      expectedOutput: 'Comprehensive QA strategy with 95%+ automation',
      agent: qaEngineer,
      adaptable: true,
      orchestrationRules: `
        QA FRAMEWORK:
        - Test automation strategy
        - Performance testing
        - Security testing
        - Chaos engineering
        - Synthetic monitoring
        - A/B testing platform
        
        COVERAGE TARGETS:
        - 95% unit test coverage
        - 85% integration test coverage
        - 100% critical path E2E coverage
        - Continuous security scanning
      `,
      resourceRequirements: {
        estimatedTime: '40-60 hours',
        skillsRequired: ['testing', 'automation', 'performance_testing'],
        dependencies: ['microservices_architecture'],
      },
    }),

    // Documentation and Training
    new Task({
      description: 'Create comprehensive documentation and training programs',
      expectedOutput: 'Enterprise knowledge base with training materials',
      agent: technicalWriter,
      adaptable: true,
      orchestrationRules: `
        DOCUMENTATION AREAS:
        - Architecture documentation
        - API documentation
        - Runbooks and playbooks
        - Training materials
        - Video tutorials
        - Certification programs
        
        LANGUAGES:
        - English (primary)
        - Spanish, French, German
        - Japanese, Chinese
      `,
      resourceRequirements: {
        estimatedTime: '60-80 hours',
        skillsRequired: ['documentation', 'training', 'multilingual'],
        dependencies: ['all_major_components'],
      },
    }),

    // Innovation Lab
    new Task({
      description:
        'Establish innovation lab for emerging technology exploration',
      expectedOutput: 'Innovation framework with POCs and technology roadmap',
      agent: innovationLead,
      adaptable: true,
      orchestrationRules: `
        INNOVATION AREAS:
        - AI/ML integration
        - Blockchain applications
        - IoT and edge computing
        - Quantum readiness
        - AR/VR experiences
        
        INNOVATION PROCESS:
        - Quarterly hackathons
        - POC development
        - Technology evaluation
        - Patent applications
      `,
      resourceRequirements: {
        estimatedTime: '40-50 hours',
        skillsRequired: ['innovation', 'emerging_tech', 'research'],
        dependencies: ['platform_stable'],
      },
    }),
  ];

  console.log(
    `📋 Enterprise Repository: ${enterpriseTaskRepository.length} comprehensive tasks\n`
  );

  // Create enterprise team configuration
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.1, // Very low for consistency in enterprise
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3, // More retries for reliability
  });
  const enterpriseTeam = new Team({
    name: 'Global Enterprise Development Team',
    agents: [
      seniorDeveloper,
      frontendDeveloper,
      backendDeveloper,
      dataArchitect,
      uxDesigner,
      qaEngineer,
      devOpsEngineer,
      securityExpert,
      productManager,
      technicalWriter,
      performanceEngineer,
      mobileAppDeveloper,
      blockchainDeveloper,
      aiResearcher,
      innovationLead,
    ],
    tasks: [],

    enableOrchestration: true,
    backlogTasks: enterpriseTaskRepository,

    // Conservative with controlled innovation
    mode: 'conservative',
    allowTaskGeneration: false, // Strict control in enterprise

    // Use initial-only orchestration for predictable enterprise execution
    continuousOrchestration: false,

    orchestrationStrategy: `
      You are orchestrating a LARGE ENTERPRISE TRANSFORMATION PROJECT.
      
      PROJECT SCOPE:
      - Global financial services platform
      - 10,000+ employees across 50 countries
      - Handling $1B+ daily transactions
      - Strict regulatory requirements
      - 5-year modernization initiative
      
      ENTERPRISE PRIORITIES:
      1. COMPLIANCE & GOVERNANCE (Highest)
         - All regulatory requirements must be met
         - Audit trails for every action
         - Data sovereignty compliance
         - Privacy by design
      
      2. SECURITY & RISK (Critical)
         - Zero-trust architecture
         - Defense in depth
         - Incident response readiness
         - Continuous security monitoring
      
      3. SCALABILITY & RELIABILITY (Essential)
         - 99.99% uptime SLA
         - Global scale from day one
         - Disaster recovery planning
         - Performance at scale
      
      4. INTEGRATION & COMPATIBILITY (Important)
         - Legacy system integration
         - Partner API compatibility
         - Multi-cloud portability
         - Standards compliance
      
      5. INNOVATION & FUTURE-PROOFING (Strategic)
         - Emerging technology adoption
         - Competitive differentiation
         - Digital transformation
         - Sustainability goals
      
      CONSTRAINTS:
      - Budget: $50M over 5 years
      - Timeline: Phase 1 in 18 months
      - Resources: 200+ developers
      - Compliance: Cannot compromise
      
      GOVERNANCE REQUIREMENTS:
      - Architecture review board approval
      - Security sign-off for each component
      - Compliance validation
      - Executive steering committee updates
      
      DELIVERY APPROACH:
      - Phased rollout by region
      - Parallel legacy operation
      - Zero-downtime migrations
      - Continuous validation
      
      SUCCESS METRICS:
      - Regulatory compliance: 100%
      - System availability: 99.99%
      - Security incidents: Zero critical
      - User satisfaction: >90%
      - Cost optimization: 20% reduction
    `,

    taskPrioritization: 'static', // Predictable for enterprise
    workloadDistribution: 'skills-based',
    maxActiveTasks: 8, // Multiple parallel workstreams

    llmInstance: orchestrationLLM,
  });

  console.log(
    '✅ Enterprise team configured with comprehensive orchestration\n'
  );

  console.log('Enterprise Configuration:');
  console.log(`- Team Size: 15 specialists`);
  console.log(`- Mode: Conservative (enterprise-grade)`);
  console.log(`- Task Generation: Disabled (controlled environment)`);
  console.log(`- Prioritization: Static (predictable execution)`);
  console.log(`- Max Parallel Tasks: 8 (multiple workstreams)\n`);

  try {
    // Activate enterprise orchestration
    console.log('🚀 Initiating Enterprise Transformation...\n');

    const enterpriseGoal = `
      Execute Phase 1 of the global financial services platform modernization.
      Focus on compliance, security, and foundational architecture.
      Ensure all enterprise standards and governance requirements are met.
    `;

    const phaseTasks = await enterpriseTeam.activateOrchestration(
      enterpriseGoal,
      true
    );

    console.log(`📊 Phase 1 Execution Plan (${phaseTasks.length} tasks):\n`);

    // Group tasks by workstream
    const workstreams = {
      'Governance & Compliance': [],
      'Security & Infrastructure': [],
      'Platform Development': [],
      'Quality & Operations': [],
      'Innovation & Training': [],
    };

    phaseTasks.forEach((task) => {
      const category = categorizeTask(task);
      workstreams[category].push(task);
    });

    // Display workstreams
    Object.entries(workstreams).forEach(([stream, tasks]) => {
      if (tasks.length > 0) {
        console.log(`${stream}:`);
        tasks.forEach((task, index) => {
          console.log(`  ${index + 1}. ${task.description}`);
          console.log(`     Lead: ${task.agent.name}`);
          console.log(
            `     Duration: ${
              task.resourceRequirements?.estimatedTime || 'TBD'
            }`
          );
        });
        console.log('');
      }
    });

    // Enterprise execution timeline
    console.log('📅 Enterprise Execution Timeline:\n');

    console.log('Phase 1 (Months 1-6): Foundation');
    console.log('  - Governance framework establishment');
    console.log('  - Security architecture implementation');
    console.log('  - Core platform development\n');

    console.log('Phase 2 (Months 7-12): Build');
    console.log('  - Microservices development');
    console.log('  - Data platform creation');
    console.log('  - Quality framework implementation\n');

    console.log('Phase 3 (Months 13-18): Deploy');
    console.log('  - Global infrastructure rollout');
    console.log('  - Integration and migration');
    console.log('  - Training and documentation\n');

    // Risk management
    console.log('⚠️  Enterprise Risk Management:\n');

    const risks = [
      {
        risk: 'Regulatory Compliance Failure',
        impact: 'Critical',
        mitigation:
          'Dedicated compliance team, regular audits, conservative approach',
      },
      {
        risk: 'Security Breach',
        impact: 'Critical',
        mitigation:
          'Zero-trust architecture, continuous monitoring, incident response team',
      },
      {
        risk: 'Legacy System Integration',
        impact: 'High',
        mitigation: 'Phased migration, parallel running, comprehensive testing',
      },
      {
        risk: 'Talent Retention',
        impact: 'Medium',
        mitigation:
          'Training programs, innovation labs, competitive compensation',
      },
    ];

    risks.forEach((r) => {
      console.log(`${r.risk}:`);
      console.log(`  Impact: ${r.impact}`);
      console.log(`  Mitigation: ${r.mitigation}\n`);
    });

    // Governance structure
    console.log('🏛️ Enterprise Governance Structure:\n');

    console.log('Executive Steering Committee');
    console.log('  ├── Architecture Review Board');
    console.log('  ├── Security Council');
    console.log('  ├── Compliance Committee');
    console.log('  └── Innovation Board\n');

    console.log('Approval Gates:');
    console.log('  1. Architecture design approval');
    console.log('  2. Security assessment sign-off');
    console.log('  3. Compliance validation');
    console.log('  4. Performance benchmarks');
    console.log('  5. Business readiness review\n');

    // Success metrics
    console.log('📈 Enterprise Success Metrics:\n');

    console.log('Operational Excellence:');
    console.log('  • System Availability: Target 99.99%');
    console.log('  • Response Time: <100ms globally');
    console.log('  • Error Rate: <0.01%\n');

    console.log('Security & Compliance:');
    console.log('  • Security Incidents: Zero critical');
    console.log('  • Compliance Score: 100%');
    console.log('  • Audit Findings: Zero major\n');

    console.log('Business Value:');
    console.log('  • Cost Reduction: 20% operational');
    console.log('  • Time to Market: 50% faster');
    console.log('  • Customer Satisfaction: >90%\n');

    // Best practices
    console.log('📚 Enterprise Orchestration Best Practices:\n');
    console.log('1. Start with governance and compliance');
    console.log('2. Security-first architecture approach');
    console.log('3. Phased delivery with quick wins');
    console.log('4. Extensive documentation and training');
    console.log('5. Regular architecture reviews');
    console.log('6. Automated compliance checking');
    console.log('7. Continuous stakeholder communication');
    console.log('8. Risk-based decision making');
    console.log('9. Innovation within boundaries');
    console.log('10. Measure everything, optimize continuously');
  } catch (error) {
    console.error('❌ Enterprise orchestration error:', error.message);
  }

  console.log('\n✅ Enterprise Setup Benefits:\n');
  console.log('• Comprehensive governance and compliance');
  console.log('• Enterprise-grade security and reliability');
  console.log('• Scalable architecture for global operations');
  console.log('• Risk mitigation through careful planning');
  console.log('• Innovation within controlled environment');
  console.log('• Clear accountability and oversight');
  console.log('• Predictable, phased delivery');
  console.log('• Long-term sustainability');
}

// Helper function to categorize tasks
function categorizeTask(task) {
  const description = task.description.toLowerCase();

  if (
    description.includes('governance') ||
    description.includes('compliance')
  ) {
    return 'Governance & Compliance';
  } else if (
    description.includes('security') ||
    description.includes('infrastructure')
  ) {
    return 'Security & Infrastructure';
  } else if (
    description.includes('platform') ||
    description.includes('microservice') ||
    description.includes('data')
  ) {
    return 'Platform Development';
  } else if (
    description.includes('qa') ||
    description.includes('testing') ||
    description.includes('monitoring')
  ) {
    return 'Quality & Operations';
  } else {
    return 'Innovation & Training';
  }
}

// Run the example
if (require.main === module) {
  runEnterpriseSetupExample()
    .then(() => console.log('\n✅ Enterprise setup example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runEnterpriseSetupExample };
