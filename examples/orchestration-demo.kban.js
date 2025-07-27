import { Agent, Task, Team } from 'kaibanjs';
import { ChatOpenAI } from '@langchain/openai';

// Define specialized agents for development team
const architect = new Agent({
  name: 'Alice Architect',
  role: 'Solutions Architect',
  goal: 'Design scalable and maintainable system architectures',
  background:
    'Senior architect with 10+ years experience in enterprise systems, microservices, and cloud architecture',
  tools: [],
});

const fullStackDeveloper = new Agent({
  name: 'Bob Developer',
  role: 'Full-Stack Developer',
  goal: 'Build robust web applications with modern technologies',
  background:
    'Expert in React, Node.js, TypeScript, and cloud deployment with 8+ years experience',
  tools: [],
});

const uiUxDesigner = new Agent({
  name: 'Carol Designer',
  role: 'UI/UX Designer',
  goal: 'Create exceptional user experiences and interfaces',
  background:
    'Design systems specialist focused on accessibility and user-centered design',
  tools: [],
});

const qaEngineer = new Agent({
  name: 'Dave Tester',
  role: 'QA Engineer',
  goal: 'Ensure software quality through comprehensive testing',
  background:
    'Test automation expert with focus on quality assurance and continuous integration',
  tools: [],
});

// Define template tasks for the orchestrator to choose from
const taskRepository = [
  // Architecture & Planning
  new Task({
    description: 'Design system architecture and technical specifications',
    expectedOutput:
      'Complete architectural documentation with diagrams and technology stack decisions',
    agent: architect,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '4-6 hours',
      skillsRequired: ['system_design', 'architecture', 'documentation'],
      dependencies: [],
    },
    orchestrationRules: `
      ARCHITECTURE TASK - Foundation for all development
      
      Adaptation options:
      - Adjust complexity based on project scope
      - Choose between monolith vs microservices
      - Select appropriate database architecture
      
      Critical for: System scalability and maintainability
    `,
  }),

  // Authentication System
  new Task({
    description: 'Implement secure user authentication system',
    expectedOutput:
      'Complete authentication with JWT tokens, login/logout, and password reset',
    agent: fullStackDeveloper,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '6-8 hours',
      skillsRequired: ['backend', 'security', 'authentication', 'jwt'],
      dependencies: ['system_architecture'],
    },
    orchestrationRules: `
      AUTHENTICATION IMPLEMENTATION
      
      Can be adapted for:
      - OAuth2, SAML, or JWT strategies
      - Multi-factor authentication
      - Social login integration
      
      Security: Must follow OWASP guidelines
      Testing: Unit and integration tests required
    `,
  }),

  // Frontend Components
  new Task({
    description: 'Create responsive UI components and user interface',
    expectedOutput: 'Modern, accessible UI components with responsive design',
    agent: uiUxDesigner,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '8-10 hours',
      skillsRequired: [
        'ui_design',
        'responsive_design',
        'accessibility',
        'figma',
      ],
      dependencies: ['authentication_system'],
    },
    orchestrationRules: `
      UI/UX DESIGN TASK
      
      Adaptation possibilities:
      - Mobile-first vs desktop-first approach
      - Component library selection (Material-UI, Chakra, etc.)
      - Design system complexity
      
      Requirements: WCAG 2.1 AA compliance mandatory
    `,
  }),

  // API Development
  new Task({
    description: 'Develop RESTful API endpoints with proper validation',
    expectedOutput:
      'Complete API with CRUD operations, validation, and documentation',
    agent: fullStackDeveloper,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '5-7 hours',
      skillsRequired: ['backend', 'api_design', 'validation', 'documentation'],
      dependencies: ['system_architecture'],
    },
  }),

  // Testing Suite
  new Task({
    description: 'Create comprehensive test suite with automation',
    expectedOutput:
      'Complete testing framework with unit, integration, and E2E tests',
    agent: qaEngineer,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '6-8 hours',
      skillsRequired: ['testing', 'automation', 'ci_cd'],
      dependencies: ['api_endpoints', 'ui_components'],
    },
    orchestrationRules: `
      TESTING IMPLEMENTATION
      
      Must include:
      - Unit tests (>80% coverage)
      - Integration tests for API
      - E2E tests for critical paths
      
      Can be adapted for different testing frameworks
    `,
  }),

  // Database Design
  new Task({
    description: 'Design and implement database schema with migrations',
    expectedOutput:
      'Optimized database schema with proper indexing and relationships',
    agent: fullStackDeveloper,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '4-5 hours',
      skillsRequired: ['database_design', 'sql', 'migrations'],
      dependencies: ['system_architecture'],
    },
  }),

  // Performance Optimization
  new Task({
    description: 'Optimize application performance and implement caching',
    expectedOutput: 'Performance-optimized application with caching strategies',
    agent: fullStackDeveloper,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '3-4 hours',
      skillsRequired: ['performance_optimization', 'caching', 'monitoring'],
      dependencies: ['api_endpoints', 'database_schema'],
    },
  }),

  // Security Implementation
  new Task({
    description: 'Implement security measures and vulnerability scanning',
    expectedOutput:
      'Security-hardened application with vulnerability assessment report',
    agent: qaEngineer,
    adaptable: false, // Security tasks should not be modified
    template: true,
    resourceRequirements: {
      estimatedTime: '4-6 hours',
      skillsRequired: [
        'security_testing',
        'vulnerability_assessment',
        'penetration_testing',
      ],
      dependencies: ['authentication_system', 'api_endpoints'],
    },
    orchestrationRules: `
      CRITICAL SECURITY TASK - NO MODIFICATIONS ALLOWED
      
      This task must be executed exactly as defined:
      - Complete security audit required
      - OWASP Top 10 compliance check
      - Vulnerability scanning mandatory
      
      Priority: Cannot be reduced or delayed
    `,
  }),
];

// Configure LLM for orchestration
const orchestrationLLM = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.3,
  openAIApiKey:
    import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
  maxRetries: 2,
});

// Create intelligent orchestration team
const team = new Team({
  name: 'Intelligent Development Team',
  agents: [architect, fullStackDeveloper, uiUxDesigner, qaEngineer],
  tasks: [], // Start empty - orchestrator will select optimal tasks

  // CORE ORCHESTRATION CONFIGURATION
  enableOrchestration: true,
  continuousOrchestration: true, // Enable continuous optimization
  availableTemplateTasks: taskRepository,
  allowTaskGeneration: true, // Allow AI to create new tasks when needed

  // ORCHESTRATION STRATEGY
  orchestrationStrategy: `
    You are orchestrating a modern web application development project.
    
    GOALS:
    1. Build a secure, scalable web application
    2. Implement best practices for code quality and testing
    3. Create an exceptional user experience
    4. Ensure system maintainability and documentation
    
    PRIORITIES:
    1. Security and authentication (non-negotiable)
    2. User experience and accessibility
    3. System architecture and scalability
    4. Code quality and testing coverage
    
    CONSTRAINTS:
    - Timeline: 6-8 weeks for MVP
    - Team: 4 specialists with different expertise
    - Budget: $150k development budget
    - Compliance: WCAG 2.1 AA, GDPR compliance required
    
    APPROACH:
    - Start with solid architectural foundation
    - Prioritize security-critical features first
    - Implement iterative development with testing
    - Focus on maintainable, documented code
    - Ensure mobile-first responsive design
  `,

  // ORCHESTRATION BEHAVIOR
  mode: 'adaptive', // Balanced approach between innovation and stability
  maxActiveTasks: 3, // Limit concurrent tasks for focused development
  taskPrioritization: 'ai-driven', // Let AI optimize task priorities
  workloadDistribution: 'skills-based', // Match tasks to agent expertise
  adaptationInterval: 300000, // Review and adapt every 5 minutes

  // LLM CONFIGURATION
  llmInstance: orchestrationLLM,

  // ENVIRONMENT VARIABLES
  env: {
    OPENAI_API_KEY:
      import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
    // Add other environment variables as needed
  },
});

export default team;

/******************************************************************
 *                                                                *
 *    🚀 KaibanJS Intelligent Orchestration Demo 🚀             *
 *                                                                *
 * This example showcases the power of AI-driven orchestration:   *
 *                                                                *
 *   🧠 AI selects optimal tasks from repository                 *
 *   ⚡ Continuous optimization during execution                 *
 *   🎯 Adaptive task prioritization and scheduling             *
 *   🛡️ Security-first approach with compliance                *
 *   📊 Skills-based workload distribution                      *
 *   🔄 Dynamic task adaptation based on project needs          *
 *                                                                *
 * How to use:                                                    *
 *   1. Set your OPENAI_API_KEY in environment                   *
 *   2. Call team.activateOrchestration('Your project goal')     *
 *   3. Run team.start() to execute the orchestrated workflow    *
 *                                                                *
 * The orchestrator will:                                         *
 *   - Analyze your project goal                                  *
 *   - Select optimal tasks from the repository                   *
 *   - Adapt tasks based on project requirements                  *
 *   - Continuously optimize the workflow                         *
 *   - Ensure security and quality standards                      *
 *                                                                *
 * Learn more at https://kaibanjs.com                           *
 *                                                                *
 ******************************************************************/
