/**
 * Utility file with reusable task templates for KaibanJS orchestration examples
 *
 * This file contains various task templates that can be used with the orchestration system.
 * All tasks are marked as templates and are adaptable by default.
 */

const { Task } = require('kaibanjs');
const agents = require('./agents');

/**
 * Authentication and Security Tasks
 */
const implementAuthenticationTask = new Task({
  description: 'Implement user authentication system',
  expectedOutput:
    'Complete authentication system with JWT tokens, password hashing, and session management',
  agent: agents.backendDeveloper,
  adaptable: true,
  orchestrationRules: `
    SECURITY REQUIREMENTS:
    - Use bcrypt for password hashing
    - Implement JWT with refresh tokens
    - Add rate limiting for login attempts
    - Include password reset functionality
    
    ADAPTATION OPTIONS:
    - Can switch between JWT and session-based auth
    - OAuth providers can be added (Google, GitHub, etc.)
    - 2FA can be included based on requirements
  `,
  resourceRequirements: {
    estimatedTime: '4-6 hours',
    skillsRequired: ['backend', 'security', 'database'],
    dependencies: ['database_setup'],
  },
});

const securityAuditTask = new Task({
  description: 'Perform comprehensive security audit',
  expectedOutput:
    'Detailed security report with vulnerabilities identified and remediation recommendations',
  agent: agents.securityExpert,
  adaptable: false, // Critical task - should not be modified
  orchestrationRules:
    'CRITICAL TASK - No modifications allowed. Must follow OWASP guidelines.',
  resourceRequirements: {
    estimatedTime: '6-8 hours',
    skillsRequired: ['security', 'penetration_testing', 'compliance'],
    dependencies: ['feature_complete'],
  },
});

const implementApiRateLimitingTask = new Task({
  description: 'Implement API rate limiting and throttling',
  expectedOutput:
    'Rate limiting middleware with configurable limits per endpoint',
  agent: agents.backendDeveloper,
  adaptable: true,
  orchestrationRules:
    'Can be adapted for different rate limiting strategies (IP-based, user-based, API key-based)',
  resourceRequirements: {
    estimatedTime: '2-3 hours',
    skillsRequired: ['backend', 'security', 'caching'],
    dependencies: ['api_implementation'],
  },
});

/**
 * Frontend and UI Tasks
 */
const createResponsiveUITask = new Task({
  description: 'Create responsive UI components with modern design',
  expectedOutput:
    'Mobile-first responsive components following design system guidelines',
  agent: agents.frontendDeveloper,
  adaptable: true,
  dynamicPriority: true,
  orchestrationRules: `
    DESIGN REQUIREMENTS:
    - Mobile-first approach
    - Accessibility compliant (WCAG 2.1 AA)
    - Dark mode support
    - Performance optimized
    
    FRAMEWORKS:
    - Can adapt to React, Vue, or Angular
    - CSS framework flexible (Tailwind, Material-UI, etc.)
  `,
  resourceRequirements: {
    estimatedTime: '6-8 hours',
    skillsRequired: ['frontend', 'css', 'responsive_design', 'accessibility'],
    dependencies: ['design_system'],
  },
});

const implementDashboardTask = new Task({
  description: 'Implement analytics dashboard with real-time updates',
  expectedOutput:
    'Interactive dashboard with charts, metrics, and real-time data updates',
  agent: agents.frontendDeveloper,
  adaptable: true,
  splitStrategy: 'auto', // Can be split into smaller components
  orchestrationRules:
    'Can be split into: chart components, data fetching, real-time updates, filters',
  resourceRequirements: {
    estimatedTime: '8-10 hours',
    skillsRequired: ['frontend', 'data_visualization', 'websockets'],
    dependencies: ['api_endpoints', 'design_mockups'],
  },
});

const designSystemTask = new Task({
  description: 'Create comprehensive design system',
  expectedOutput:
    'Complete design system with components, tokens, and documentation',
  agent: agents.uxDesigner,
  adaptable: true,
  orchestrationRules: 'Adapt based on brand guidelines and target audience',
  resourceRequirements: {
    estimatedTime: '10-15 hours',
    skillsRequired: ['design', 'ui_ux', 'accessibility'],
    dependencies: ['brand_guidelines'],
  },
});

/**
 * Backend and API Tasks
 */
const implementCrudApiTask = new Task({
  description: 'Implement CRUD API endpoints for {entity}',
  expectedOutput:
    'RESTful API with Create, Read, Update, Delete operations including validation',
  agent: agents.backendDeveloper,
  adaptable: true,
  orchestrationRules: `
    PLACEHOLDER: {entity} will be replaced with actual entity name
    
    REQUIREMENTS:
    - Input validation
    - Error handling
    - Pagination for list endpoints
    - Filtering and sorting
    - Proper HTTP status codes
    
    ADAPTABLE:
    - Can switch between REST and GraphQL
    - Database can be SQL or NoSQL
  `,
  resourceRequirements: {
    estimatedTime: '3-4 hours',
    skillsRequired: ['backend', 'database', 'api_design'],
    dependencies: ['database_schema'],
  },
});

const implementWebSocketsTask = new Task({
  description: 'Implement real-time communication with WebSockets',
  expectedOutput: 'WebSocket server with room management and event handling',
  agent: agents.backendDeveloper,
  adaptable: true,
  orchestrationRules:
    'Can adapt to Socket.io, native WebSockets, or other real-time solutions',
  resourceRequirements: {
    estimatedTime: '4-5 hours',
    skillsRequired: ['backend', 'websockets', 'real_time'],
    dependencies: ['server_setup'],
  },
});

const optimizeDatabaseTask = new Task({
  description: 'Optimize database performance',
  expectedOutput:
    'Optimized database with improved query performance and proper indexing',
  agent: agents.dataArchitect,
  adaptable: true,
  dynamicPriority: true,
  orchestrationRules:
    'Priority increases if performance issues detected. Adapt based on database type.',
  resourceRequirements: {
    estimatedTime: '4-6 hours',
    skillsRequired: ['database', 'performance', 'indexing'],
    dependencies: ['database_setup', 'performance_metrics'],
  },
});

/**
 * Testing and Quality Assurance Tasks
 */
const writeUnitTestsTask = new Task({
  description: 'Write comprehensive unit tests',
  expectedOutput: 'Unit test suite with >80% code coverage',
  agent: agents.qaEngineer,
  adaptable: true,
  orchestrationRules: `
    COVERAGE REQUIREMENTS:
    - Minimum 80% code coverage
    - Test edge cases
    - Mock external dependencies
    
    FRAMEWORKS:
    - Jest for JavaScript/TypeScript
    - pytest for Python
    - JUnit for Java
  `,
  resourceRequirements: {
    estimatedTime: '4-6 hours',
    skillsRequired: ['testing', 'unit_testing', 'mocking'],
    dependencies: ['feature_implementation'],
  },
});

const createE2ETestsTask = new Task({
  description: 'Create end-to-end test suite',
  expectedOutput: 'E2E tests covering critical user journeys',
  agent: agents.qaEngineer,
  adaptable: true,
  orchestrationRules:
    'Adapt test scenarios based on user stories. Use Playwright, Cypress, or Selenium.',
  resourceRequirements: {
    estimatedTime: '6-8 hours',
    skillsRequired: ['testing', 'e2e_testing', 'automation'],
    dependencies: ['feature_complete', 'test_environment'],
  },
});

const performanceTestingTask = new Task({
  description: 'Conduct performance testing and optimization',
  expectedOutput:
    'Performance test report with bottlenecks identified and optimization recommendations',
  agent: agents.qaEngineer,
  adaptable: true,
  dynamicPriority: true,
  orchestrationRules:
    'Priority based on user load. Tools: JMeter, k6, or Gatling.',
  resourceRequirements: {
    estimatedTime: '4-5 hours',
    skillsRequired: ['testing', 'performance_testing', 'monitoring'],
    dependencies: ['deployment_ready'],
  },
});

/**
 * DevOps and Infrastructure Tasks
 */
const setupCiCdTask = new Task({
  description: 'Setup CI/CD pipeline',
  expectedOutput:
    'Automated CI/CD pipeline with build, test, and deployment stages',
  agent: agents.devOpsEngineer,
  adaptable: true,
  orchestrationRules: `
    PLATFORMS:
    - GitHub Actions
    - GitLab CI
    - Jenkins
    - CircleCI
    
    STAGES:
    - Build
    - Test (unit, integration, E2E)
    - Security scanning
    - Deployment (staging, production)
  `,
  resourceRequirements: {
    estimatedTime: '4-6 hours',
    skillsRequired: ['devops', 'ci_cd', 'automation'],
    dependencies: ['repository_setup', 'test_suite'],
  },
});

const dockerizeApplicationTask = new Task({
  description: 'Dockerize application with multi-stage builds',
  expectedOutput:
    'Optimized Docker images with docker-compose for local development',
  agent: agents.devOpsEngineer,
  adaptable: true,
  orchestrationRules:
    'Adapt for different application types. Include development and production configurations.',
  resourceRequirements: {
    estimatedTime: '3-4 hours',
    skillsRequired: ['docker', 'containerization', 'devops'],
    dependencies: ['application_structure'],
  },
});

const setupMonitoringTask = new Task({
  description: 'Setup monitoring and alerting system',
  expectedOutput: 'Complete monitoring setup with dashboards and alert rules',
  agent: agents.devOpsEngineer,
  adaptable: true,
  orchestrationRules:
    'Can use Prometheus/Grafana, ELK stack, or cloud-native solutions',
  resourceRequirements: {
    estimatedTime: '5-6 hours',
    skillsRequired: ['monitoring', 'logging', 'alerting'],
    dependencies: ['deployment_complete'],
  },
});

/**
 * Documentation and Communication Tasks
 */
const writeApiDocumentationTask = new Task({
  description: 'Write comprehensive API documentation',
  expectedOutput:
    'Complete API documentation with examples, schemas, and authentication guides',
  agent: agents.technicalWriter,
  adaptable: true,
  orchestrationRules:
    'Use OpenAPI/Swagger specification. Include code examples in multiple languages.',
  resourceRequirements: {
    estimatedTime: '4-5 hours',
    skillsRequired: ['documentation', 'api_design', 'technical_writing'],
    dependencies: ['api_complete'],
  },
});

const createUserGuideTask = new Task({
  description: 'Create user guide and tutorials',
  expectedOutput:
    'User-friendly documentation with step-by-step tutorials and screenshots',
  agent: agents.technicalWriter,
  adaptable: true,
  orchestrationRules: 'Adapt tone and complexity based on target audience',
  resourceRequirements: {
    estimatedTime: '6-8 hours',
    skillsRequired: ['documentation', 'technical_writing', 'user_experience'],
    dependencies: ['feature_complete', 'ui_finalized'],
  },
});

/**
 * Data and Analytics Tasks
 */
const implementDataPipelineTask = new Task({
  description: 'Implement data processing pipeline',
  expectedOutput:
    'Scalable data pipeline with ETL processes and data validation',
  agent: agents.dataArchitect,
  adaptable: true,
  splitStrategy: 'auto',
  orchestrationRules:
    'Can be split into: data ingestion, transformation, loading, validation',
  resourceRequirements: {
    estimatedTime: '8-10 hours',
    skillsRequired: ['data_engineering', 'etl', 'big_data'],
    dependencies: ['data_sources_identified'],
  },
});

const createAnalyticsDashboardTask = new Task({
  description: 'Create business analytics dashboard',
  expectedOutput:
    'Interactive dashboard with KPIs, trends, and actionable insights',
  agent: agents.frontendDeveloper,
  adaptable: true,
  mergeCompatible: ['data_visualization_task', 'reporting_task'],
  orchestrationRules:
    'Can merge with other visualization tasks. Use D3.js, Chart.js, or BI tools.',
  resourceRequirements: {
    estimatedTime: '6-8 hours',
    skillsRequired: ['frontend', 'data_visualization', 'analytics'],
    dependencies: ['data_pipeline', 'kpi_definitions'],
  },
});

/**
 * Special Purpose Tasks
 */
const researchNewTechnologyTask = new Task({
  description: 'Research and evaluate {technology} for project suitability',
  expectedOutput:
    'Technology evaluation report with pros, cons, and implementation recommendations',
  agent: agents.innovationLead,
  adaptable: true,
  orchestrationRules:
    'PLACEHOLDER: {technology} will be replaced. High adaptability for different tech.',
  resourceRequirements: {
    estimatedTime: '3-4 hours',
    skillsRequired: ['research', 'analysis', 'technical_evaluation'],
    dependencies: [],
  },
});

const createProofOfConceptTask = new Task({
  description: 'Create proof of concept for {feature}',
  expectedOutput:
    'Working POC demonstrating feasibility and basic implementation',
  agent: agents.seniorDeveloper,
  adaptable: true,
  dynamicPriority: true,
  orchestrationRules:
    'PLACEHOLDER: {feature} will be replaced. Priority based on business value.',
  resourceRequirements: {
    estimatedTime: '4-6 hours',
    skillsRequired: ['prototyping', 'full_stack', 'problem_solving'],
    dependencies: ['requirements_defined'],
  },
});

/**
 * Microservices and Architecture Tasks
 */
const designMicroserviceTask = new Task({
  description: 'Design microservice architecture for {domain}',
  expectedOutput:
    'Microservice design with API contracts, data models, and communication patterns',
  agent: agents.seniorDeveloper,
  adaptable: true,
  splitStrategy: 'manual',
  orchestrationRules: `
    PLACEHOLDER: {domain} will be replaced with business domain
    
    INCLUDES:
    - Service boundaries
    - API design
    - Data ownership
    - Communication patterns (sync/async)
    - Error handling strategy
  `,
  resourceRequirements: {
    estimatedTime: '4-6 hours',
    skillsRequired: ['microservices', 'architecture', 'api_design'],
    dependencies: ['domain_analysis'],
  },
});

/**
 * Export all tasks and helper functions
 */
module.exports = {
  // Authentication and Security
  implementAuthenticationTask,
  securityAuditTask,
  implementApiRateLimitingTask,

  // Frontend and UI
  createResponsiveUITask,
  implementDashboardTask,
  designSystemTask,

  // Backend and API
  implementCrudApiTask,
  implementWebSocketsTask,
  optimizeDatabaseTask,

  // Testing and QA
  writeUnitTestsTask,
  createE2ETestsTask,
  performanceTestingTask,

  // DevOps and Infrastructure
  setupCiCdTask,
  dockerizeApplicationTask,
  setupMonitoringTask,

  // Documentation
  writeApiDocumentationTask,
  createUserGuideTask,

  // Data and Analytics
  implementDataPipelineTask,
  createAnalyticsDashboardTask,

  // Special Purpose
  researchNewTechnologyTask,
  createProofOfConceptTask,
  designMicroserviceTask,

  // Helper function to create custom task from template
  createTaskFromTemplate: (template, overrides) => {
    return new Task({
      ...template,
      ...overrides,
    });
  },
};
