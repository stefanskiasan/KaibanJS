import { Agent as _Agent, Task, Team } from 'kaibanjs';
import { ChatOpenAI } from '@langchain/openai';

// Define agents
const seniorDeveloper = new _Agent({
  name: 'Alex',
  role: 'Senior Developer',
  goal: 'Architect and implement robust software solutions with best practices.',
  background:
    'Full-stack developer with expertise in system design and code quality.',
  tools: [],
});

const frontendDeveloper = new _Agent({
  name: 'Sam',
  role: 'Frontend Developer',
  goal: 'Create intuitive and responsive user interfaces.',
  background:
    'UI/UX specialist with strong skills in modern frontend frameworks.',
  tools: [],
});

const qaEngineer = new _Agent({
  name: 'Jordan',
  role: 'QA Engineer',
  goal: 'Ensure software quality through comprehensive testing strategies.',
  background:
    'Quality assurance expert focused on automated testing and code reliability.',
  tools: [],
});

// Define tasks
const setupProjectTask = new Task({
  description: 'Set up project structure and dependencies',
  expectedOutput:
    'Complete project setup with folder structure and npm packages',
  agent: seniorDeveloper,
  adaptable: true,
  resourceRequirements: {
    estimatedTime: '1-2 hours',
    skillsRequired: ['project_setup', 'npm', 'architecture'],
    dependencies: [],
  },
});

const implementAuthTask = new Task({
  description: 'Implement user authentication system',
  expectedOutput: 'Secure authentication with login/logout functionality',
  agent: seniorDeveloper,
  adaptable: true,
  resourceRequirements: {
    estimatedTime: '3-4 hours',
    skillsRequired: ['authentication', 'security', 'backend'],
    dependencies: ['project_structure'],
  },
});

const createUITask = new Task({
  description: 'Create responsive user interface components',
  expectedOutput: 'Modern, accessible UI components with responsive design',
  agent: frontendDeveloper,
  adaptable: true,
  resourceRequirements: {
    estimatedTime: '2-3 hours',
    skillsRequired: ['frontend', 'css', 'accessibility'],
    dependencies: ['project_structure'],
  },
});

const writeTestsTask = new Task({
  description: 'Write comprehensive unit and integration tests',
  expectedOutput: 'Test suite with high coverage and reliable test cases',
  agent: qaEngineer,
  adaptable: true,
  resourceRequirements: {
    estimatedTime: '2-3 hours',
    skillsRequired: ['testing', 'automation'],
    dependencies: ['authentication', 'ui_components'],
  },
});

// Create orchestration LLM
const orchestrationLLM = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.3,
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
});

// Create team with orchestration
const team = new Team({
  name: 'Agile Development Team',
  agents: [seniorDeveloper, frontendDeveloper, qaEngineer],
  tasks: [],

  // Enable intelligent orchestration
  enableOrchestration: true,
  continuousOrchestration: false,
  allowTaskGeneration: false,

  // Available backlog tasks for orchestration
  backlogTasks: [
    setupProjectTask,
    implementAuthTask,
    createUITask,
    writeTestsTask,
  ],

  // Orchestration strategy
  orchestrationStrategy: `
    Build a secure web application with modern architecture.
    
    GOALS:
    1. Establish solid project foundation
    2. Implement secure authentication
    3. Create user-friendly interface
    4. Ensure code quality with testing
    
    CONSTRAINTS:
    - Focus on essential features
    - Maximum 4 tasks per sprint
    - Security-first approach
    
    PRIORITIES:
    1. Project setup and architecture
    2. Authentication and security
    3. User interface components  
    4. Testing and quality assurance
  `,

  // Configuration
  mode: 'adaptive',
  maxActiveTasks: 2,
  taskPrioritization: 'dynamic',
  workloadDistribution: 'balanced',
  llmInstance: orchestrationLLM,

  // Project goal for orchestration
  inputs: {
    projectGoal:
      'Build a secure web application with user authentication and modern UI',
  },

  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
  },
});

export default team;

/******************************************************************
 *                                                                  *
 *        🎯 KaibanJS Intelligent Orchestration Example 🎯        *
 *                                                                *
 * This example demonstrates:                                     *
 *                                                                *
 *   🧠 AI-powered task selection and prioritization             *
 *   🔄 Adaptive workflow orchestration                          *
 *   👥 Multi-agent collaboration with role specialization       *
 *   📋 Template-based task management                           *
 *   ⚡ Dynamic resource allocation and scheduling               *
 *                                                                *
 * To run this example:                                          *
 *                                                                *
 *   1. Set OPENAI_API_KEY in your environment                   *
 *   2. Import and use: team.activateOrchestration()            *
 *   3. Execute workflow: team.start()                          *
 *                                                                *
 * The orchestrator will intelligently select and arrange        *
 * tasks based on your project goals and constraints.           *
 *                                                                *
 * Learn more at https://kaibanjs.com                          *
 *                                                                *
 ******************************************************************/
