import React, { useState } from 'react';
import { Agent, Task, Team } from 'kaibanjs';

// Import all new orchestration components
import BacklogRepositoryViewer from '../components/BacklogRepositoryViewer';
import OrchestratorDecisionPanel from '../components/OrchestratorDecisionPanel';
import OrchestrationModeSelector from '../components/OrchestrationModeSelector';
import ContinuousOrchestrationToggle from '../components/ContinuousOrchestrationToggle';
import EnhancedTaskBoard from '../components/EnhancedTaskBoard';
import OrchestrationMonitor from '../components/OrchestrationMonitor';

export default {
  title: 'KaibanJS/Enhanced Orchestration Demo',
  parameters: {
    docs: {
      description: {
        component:
          'Comprehensive demonstration of all new orchestration UI components integrated together.',
      },
    },
  },
};

const EnhancedOrchestrationComponent = () => {
  const [orchestrationEnabled, _setOrchestrationEnabled] = useState(true);
  const [continuousOrchestration, setContinuousOrchestration] = useState(false);
  const [orchestrationMode, setOrchestrationMode] = useState('adaptive');
  const [workflowActive, setWorkflowActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Create comprehensive agents for demo
  const createAgents = () => {
    return {
      architect: new Agent({
        name: 'Alice Architect',
        role: 'Solutions Architect',
        goal: 'Design scalable system architecture',
        background: 'Enterprise architecture specialist',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o',
          temperature: 0.2,
        },
      }),
      developer: new Agent({
        name: 'Bob Developer',
        role: 'Full-Stack Developer',
        goal: 'Implement robust applications',
        background: 'Expert in modern web technologies',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.3,
        },
      }),
      designer: new Agent({
        name: 'Carol Designer',
        role: 'UX/UI Designer',
        goal: 'Create exceptional user experiences',
        background: 'Design systems and accessibility expert',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.4,
        },
      }),
      tester: new Agent({
        name: 'Dave Tester',
        role: 'QA Engineer',
        goal: 'Ensure software quality',
        background: 'Automated testing and quality assurance',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.1,
        },
      }),
      security: new Agent({
        name: 'Eve Security',
        role: 'Security Engineer',
        goal: 'Implement security best practices',
        background: 'Cybersecurity and compliance specialist',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o',
          temperature: 0.1,
        },
      }),
    };
  };

  // Create comprehensive task repository
  const createTaskRepository = (agents) => {
    return [
      // Architecture Tasks
      new Task({
        description: 'Design system architecture',
        expectedOutput: 'Comprehensive architecture documentation',
        agent: agents.architect,
        category: 'architecture',
        complexity: 'high',
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '8-12 hours',
          skillsRequired: ['system_design', 'architecture', 'scalability'],
          dependencies: ['requirements_analysis'],
        },
        orchestrationRules: `
          ARCHITECTURE DESIGN TASK

          Adaptation options:
          - Adjust scope based on project complexity
          - Focus on specific architectural patterns
          - Scale from microservices to monolith based on team size
          
          Quality criteria: Scalability, maintainability, performance
          Dependencies: Must follow requirements analysis
        `,
      }),

      // Development Tasks
      new Task({
        description: 'Implement user authentication system',
        expectedOutput: 'Secure authentication with JWT tokens',
        agent: agents.developer,
        category: 'development',
        complexity: 'medium',
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: ['backend', 'security', 'authentication'],
          dependencies: ['architecture_design'],
        },
        orchestrationRules: `
          AUTHENTICATION IMPLEMENTATION

          Can be adapted for:
          - OAuth2, SAML, or JWT strategies
          - Multi-factor authentication requirements
          - Social login integration
          
          Security: PCI compliance required
          Testing: Unit and integration tests mandatory
        `,
      }),

      new Task({
        description: 'Build responsive user interface',
        expectedOutput: 'Mobile-first responsive UI components',
        agent: agents.designer,
        category: 'design',
        complexity: 'medium',
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '10-12 hours',
          skillsRequired: ['ui_design', 'responsive_design', 'accessibility'],
          dependencies: ['wireframes', 'design_system'],
        },
      }),

      // Testing Tasks
      new Task({
        description: 'Create comprehensive test suite',
        expectedOutput: 'Automated tests with 90%+ coverage',
        agent: agents.tester,
        category: 'testing',
        complexity: 'high',
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '8-10 hours',
          skillsRequired: ['testing', 'automation', 'quality_assurance'],
          dependencies: ['implementation_complete'],
        },
      }),

      // Security Tasks (Critical - No modifications allowed)
      new Task({
        description: 'Perform security audit and penetration testing',
        expectedOutput: 'Security audit report with vulnerability assessment',
        agent: agents.security,
        category: 'security',
        complexity: 'high',
        adaptable: false, // Critical security task
        resourceRequirements: {
          estimatedTime: '12-16 hours',
          skillsRequired: [
            'security_audit',
            'penetration_testing',
            'compliance',
          ],
          dependencies: ['authentication_system', 'deployment_ready'],
        },
        orchestrationRules: `
          CRITICAL SECURITY AUDIT - NO MODIFICATIONS ALLOWED
          
          This task must be executed exactly as defined:
          - Cannot change scope or reduce thoroughness
          - Must include all security domains
          - Compliance with industry standards required
          
          On blocking: Escalate to security team immediately
          Priority: Cannot be reduced or delayed
        `,
      }),

      // DevOps Tasks
      new Task({
        description: 'Setup CI/CD pipeline',
        expectedOutput: 'Automated deployment pipeline',
        agent: agents.developer,
        category: 'devops',
        complexity: 'medium',
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '4-6 hours',
          skillsRequired: ['devops', 'ci_cd', 'automation'],
          dependencies: ['testing_complete'],
        },
      }),

      // Performance Tasks
      new Task({
        description: 'Optimize application performance',
        expectedOutput: 'Performance optimization report and improvements',
        agent: agents.developer,
        category: 'performance',
        complexity: 'medium',
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: ['performance_optimization', 'profiling', 'caching'],
          dependencies: ['initial_implementation'],
        },
      }),
    ];
  };

  // Create mock existing tasks with orchestration metadata
  const createExistingTasks = (agents) => {
    return [
      new Task({
        description: 'Setup development environment',
        expectedOutput: 'Ready development environment',
        agent: agents.developer,
        status: 'completed',
        duration: 120.5,
        result:
          'Development environment configured with Docker, Node.js, and required dependencies',
        resourceRequirements: {
          estimatedTime: '2 hours',
          skillsRequired: ['devops', 'setup'],
        },
      }),
      new Task({
        description: 'Create project wireframes',
        expectedOutput: 'Complete wireframes and user flows',
        agent: agents.designer,
        status: 'in_progress',
        generated: false,
        adaptationHistory: [
          {
            timestamp: new Date(Date.now() - 3600000),
            reason: 'Added mobile-first approach based on user analytics',
            changes: {
              description: 'Enhanced with mobile-first wireframes',
              estimatedTime: '6 hours (was 4 hours)',
            },
          },
        ],
        resourceRequirements: {
          estimatedTime: '6 hours',
          skillsRequired: ['wireframing', 'user_experience'],
        },
      }),
      new Task({
        description: 'Implement real-time notifications system',
        expectedOutput: 'WebSocket-based notification system',
        agent: agents.developer,
        status: 'pending',
        generated: true,
        orchestratorGenerated: true,
        generatedBy: 'AI Orchestrator',
        generatedAt: new Date(Date.now() - 1800000),
        sourceGap: {
          description: 'Identified missing real-time communication capability',
        },
        resourceRequirements: {
          estimatedTime: '8 hours',
          skillsRequired: ['websockets', 'real_time', 'backend'],
          dependencies: ['authentication_system'],
        },
      }),
      new Task({
        description: 'API endpoint security hardening',
        expectedOutput: 'Secured API endpoints with rate limiting',
        agent: agents.security,
        status: 'review',
        adaptable: false,
        complexity: 'high',
        priority: 'high',
        resourceRequirements: {
          estimatedTime: '4 hours',
          skillsRequired: ['api_security', 'rate_limiting'],
        },
        feedbackHistory: [
          {
            content: 'Add OAuth2 scope validation',
            status: 'pending',
          },
        ],
      }),
    ];
  };

  // Create enhanced team with all orchestration features
  const createEnhancedTeam = () => {
    const agents = createAgents();
    const taskRepository = createTaskRepository(agents);
    const existingTasks = createExistingTasks(agents);

    return new Team({
      name: 'Enhanced Orchestration Demo Team',
      agents: Object.values(agents),
      tasks: existingTasks,

      // Core Orchestration Settings
      enableOrchestration: orchestrationEnabled,
      continuousOrchestration: continuousOrchestration,
      backlogTasks: taskRepository,
      allowTaskGeneration: true,

      // Orchestration Strategy
      orchestrationStrategy: `
        Build a modern, secure web application with exceptional user experience.
        
        PRIORITIES:
        1. Security and compliance (non-negotiable)
        2. User experience and accessibility
        3. Performance and scalability
        4. Code quality and maintainability
        
        CONSTRAINTS:
        - Timeline: 8 weeks
        - Team: 5 specialists
        - Budget: $200k
        - Compliance: SOC2, GDPR
        
        FOCUS AREAS:
        - Mobile-first responsive design
        - Real-time communication features
        - Comprehensive testing and security
        - Automated deployment pipeline
      `,

      // Mode and Configuration
      mode: orchestrationMode,
      maxActiveTasks: 6,
      taskPrioritization: 'ai-driven',
      workloadDistribution: 'skills-based',

      // LLM Configuration for Orchestrator
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 4000,
      },

      env: { OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '' },
    });
  };

  const team = createEnhancedTeam();

  const handleModeChange = (newMode) => {
    setOrchestrationMode(newMode);
    // In real implementation, update team.mode
    console.log(`Orchestration mode changed to: ${newMode}`);
  };

  const handleContinuousToggle = (enabled) => {
    setContinuousOrchestration(enabled);
    // In real implementation, update team.continuousOrchestration
    console.log(`Continuous orchestration ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleTaskSelect = (task) => {
    console.log('Selected task:', task);
    // In real implementation, show task details or add to workflow
  };

  const handleAddToWorkflow = (task) => {
    console.log('Adding task to workflow:', task);
    // In real implementation, add task to team.tasks
  };

  const startWorkflow = async () => {
    setWorkflowActive(true);
    console.log('Starting enhanced orchestration workflow...');

    // Simulate workflow activity
    setTimeout(() => {
      console.log('Workflow completed successfully!');
      setWorkflowActive(false);
    }, 10000);
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'repository', label: '📚 Repository', icon: '📚' },
    { id: 'taskboard', label: '📋 Task Board', icon: '📋' },
    { id: 'decisions', label: '🤖 Decisions', icon: '🤖' },
    { id: 'monitoring', label: '📈 Monitoring', icon: '📈' },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#339af0', marginBottom: '10px' }}>
          🚀 Enhanced KaibanJS Orchestration
        </h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Complete UI suite for intelligent multi-agent orchestration
        </p>
      </div>

      {/* Control Panel */}
      <div
        style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dee2e6',
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>
          🎛️ Control Panel
        </h3>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={startWorkflow}
            disabled={workflowActive}
            style={{
              padding: '12px 24px',
              backgroundColor: workflowActive ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: workflowActive ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {workflowActive ? '🔄 Workflow Running...' : '▶️ Start Workflow'}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              background: 'white',
              borderRadius: '6px',
              border: '1px solid #ced4da',
            }}
          >
            <span style={{ fontWeight: '500' }}>Orchestration:</span>
            <span
              style={{
                color: orchestrationEnabled ? '#28a745' : '#dc3545',
                fontWeight: '600',
              }}
            >
              {orchestrationEnabled ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              background: 'white',
              borderRadius: '6px',
              border: '1px solid #ced4da',
            }}
          >
            <span style={{ fontWeight: '500' }}>Mode:</span>
            <span
              style={{
                color: '#339af0',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {orchestrationMode}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #e9ecef',
            gap: '5px',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: selectedTab === tab.id ? '#339af0' : 'transparent',
                color: selectedTab === tab.id ? 'white' : '#6c757d',
                borderRadius: '6px 6px 0 0',
                fontWeight: selectedTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {selectedTab === 'overview' && (
          <div>
            <h2 style={{ color: '#339af0', marginBottom: '20px' }}>
              📊 Orchestration Overview
            </h2>

            <OrchestrationModeSelector
              team={team}
              currentMode={orchestrationMode}
              onModeChange={handleModeChange}
              disabled={!orchestrationEnabled}
            />

            <ContinuousOrchestrationToggle
              team={team}
              enabled={continuousOrchestration}
              onToggle={handleContinuousToggle}
              disabled={!orchestrationEnabled}
            />

            <div
              style={{
                background: '#e7f5ff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #339af0',
                marginTop: '20px',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#1971c2' }}>
                💡 Enhanced Features Overview
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#495057' }}>
                <li>
                  <strong>Template Repository:</strong> Browse and manage
                  reusable task templates
                </li>
                <li>
                  <strong>AI Decision Panel:</strong> Real-time insights into
                  orchestrator decisions
                </li>
                <li>
                  <strong>Enhanced Task Board:</strong> Visual workflow with
                  adaptation indicators
                </li>
                <li>
                  <strong>Performance Monitoring:</strong> Track metrics, costs,
                  and system health
                </li>
                <li>
                  <strong>Mode Selection:</strong> Choose from conservative,
                  adaptive, innovative, or learning modes
                </li>
                <li>
                  <strong>Continuous Optimization:</strong> Real-time workflow
                  improvements
                </li>
              </ul>
            </div>
          </div>
        )}

        {selectedTab === 'repository' && (
          <div>
            <h2 style={{ color: '#339af0', marginBottom: '20px' }}>
              📚 Template Repository
            </h2>
            <BacklogRepositoryViewer
              team={team}
              onTaskSelect={handleTaskSelect}
              onAddToWorkflow={handleAddToWorkflow}
            />
          </div>
        )}

        {selectedTab === 'taskboard' && (
          <div>
            <h2 style={{ color: '#339af0', marginBottom: '20px' }}>
              📋 Enhanced Task Board
            </h2>
            <EnhancedTaskBoard
              tasks={team.getTasks()}
              orchestrationEnabled={orchestrationEnabled}
            />
          </div>
        )}

        {selectedTab === 'decisions' && (
          <div>
            <h2 style={{ color: '#339af0', marginBottom: '20px' }}>
              🤖 Orchestrator Decisions
            </h2>
            <OrchestratorDecisionPanel team={team} isActive={workflowActive} />
          </div>
        )}

        {selectedTab === 'monitoring' && (
          <div>
            <h2 style={{ color: '#339af0', marginBottom: '20px' }}>
              📈 Real-time Monitoring
            </h2>
            <OrchestrationMonitor team={team} isActive={workflowActive} />
          </div>
        )}
      </div>

      {/* Footer Information */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>
          🔧 Implementation Status
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
          }}
        >
          <div
            style={{
              padding: '10px',
              background: 'white',
              borderRadius: '4px',
            }}
          >
            <strong style={{ color: '#28a745' }}>
              ✅ Template Repository Viewer
            </strong>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '0.9em',
                color: '#6c757d',
              }}
            >
              Browse, search, and filter available task templates
            </p>
          </div>
          <div
            style={{
              padding: '10px',
              background: 'white',
              borderRadius: '4px',
            }}
          >
            <strong style={{ color: '#28a745' }}>
              ✅ Orchestrator Decision Panel
            </strong>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '0.9em',
                color: '#6c757d',
              }}
            >
              Real-time AI decision tracking and analysis
            </p>
          </div>
          <div
            style={{
              padding: '10px',
              background: 'white',
              borderRadius: '4px',
            }}
          >
            <strong style={{ color: '#28a745' }}>✅ Mode Selector</strong>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '0.9em',
                color: '#6c757d',
              }}
            >
              Choose orchestration behavior and risk tolerance
            </p>
          </div>
          <div
            style={{
              padding: '10px',
              background: 'white',
              borderRadius: '4px',
            }}
          >
            <strong style={{ color: '#28a745' }}>
              ✅ Continuous Orchestration
            </strong>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '0.9em',
                color: '#6c757d',
              }}
            >
              Toggle real-time optimization and monitoring
            </p>
          </div>
          <div
            style={{
              padding: '10px',
              background: 'white',
              borderRadius: '4px',
            }}
          >
            <strong style={{ color: '#28a745' }}>✅ Enhanced Task Board</strong>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '0.9em',
                color: '#6c757d',
              }}
            >
              Kanban view with adaptation and generation indicators
            </p>
          </div>
          <div
            style={{
              padding: '10px',
              background: 'white',
              borderRadius: '4px',
            }}
          >
            <strong style={{ color: '#28a745' }}>✅ Performance Monitor</strong>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '0.9em',
                color: '#6c757d',
              }}
            >
              Real-time metrics, costs, and system health
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnhancedOrchestrationPlayground = () => (
  <EnhancedOrchestrationComponent />
);

EnhancedOrchestrationPlayground.parameters = {
  docs: {
    description: {
      story:
        'Complete demonstration of the enhanced KaibanJS orchestration UI suite including template repository, decision tracking, mode selection, continuous optimization, enhanced task board, and real-time monitoring.',
    },
  },
};
