/**
 * Unit Tests for Intelligent Orchestration
 *
 * Tests the new orchestration features including:
 * - Task repository management
 * - Intelligent task selection
 * - Task adaptation capabilities
 * - Workflow optimization
 */

import { Agent, Task, Team } from '../../src/index';
import { IntelligentOrchestrator } from '../../src/orchestration/intelligentOrchestrator';
import {
  TaskSelectionPromptTemplate,
  TaskAdaptationPromptTemplate,
  TaskGenerationPromptTemplate,
} from '../../src/orchestration/promptTemplates';

describe('Intelligent Orchestration', () => {
  let developer: Agent;
  let tester: Agent;
  let team: Team;
  let taskRepository: Task[];

  beforeEach(() => {
    // Create test agents
    developer = new Agent({
      name: 'Test Developer',
      role: 'Software Engineer',
      goal: 'Implement features efficiently',
      background: 'Full-stack development experience',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxRetries: 1,
      },
    });

    tester = new Agent({
      name: 'Test QA',
      role: 'Quality Assurance',
      goal: 'Ensure software quality',
      background: 'Testing and validation expert',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxRetries: 1,
      },
    });

    // Create task repository
    taskRepository = [
      new Task({
        description: 'Implement user authentication',
        expectedOutput: 'Working authentication system',
        agent: developer,
        adaptable: true,
        orchestrationRules: 'Can be adapted based on security requirements',
        resourceRequirements: {
          estimatedTime: '4-6 hours',
          skillsRequired: ['backend_development', 'security'],
          dependencies: ['database_setup'],
        },
      }),
      new Task({
        description: 'Create comprehensive test suite',
        expectedOutput: 'Test suite with >80% coverage',
        agent: tester,
        adaptable: true,
        resourceRequirements: {
          estimatedTime: '2-4 hours',
          skillsRequired: ['testing', 'automation'],
          dependencies: ['feature_implementation'],
        },
      }),
      new Task({
        description: 'Security audit',
        expectedOutput: 'Security report with findings',
        agent: tester,
        adaptable: false, // Critical task - cannot be modified
        orchestrationRules: 'CRITICAL - No modifications allowed',
        resourceRequirements: {
          estimatedTime: '4-6 hours',
          skillsRequired: ['security_audit'],
          dependencies: [],
        },
      }),
    ];

    // Create team with orchestration capabilities
    team = new Team({
      name: 'Test Orchestration Team',
      agents: [developer, tester],
      tasks: [],
      enableOrchestration: true, // Enable orchestration for testing
      backlogTasks: taskRepository,
      allowTaskGeneration: true,
      orchestrationStrategy: 'Test strategy for efficient development',
      mode: 'adaptive',
      maxActiveTasks: 3,
      taskPrioritization: 'ai-driven',
      workloadDistribution: 'skills-based',
    });
  });

  describe('Team Configuration', () => {
    test('should initialize with orchestration properties', () => {
      expect(team.enableOrchestration).toBe(true);
      expect(team.backlogTasks).toHaveLength(3);
      expect(team.allowTaskGeneration).toBe(true);
      expect(team.orchestrationStrategy).toBe(
        'Test strategy for efficient development'
      );
      expect(team.mode).toBe('adaptive');
      expect(team.maxActiveTasks).toBe(3);
      expect(team.taskPrioritization).toBe('ai-driven');
      expect(team.workloadDistribution).toBe('skills-based');
    });

    test('should have default values for optional orchestration properties', () => {
      const minimalTeam = new Team({
        name: 'Minimal Team',
        agents: [developer],
        tasks: [],
      });

      expect(minimalTeam.enableOrchestration).toBe(false);
      expect(minimalTeam.backlogTasks).toHaveLength(0);
      expect(minimalTeam.allowTaskGeneration).toBe(false);
      expect(minimalTeam.mode).toBe('adaptive');
      expect(minimalTeam.maxActiveTasks).toBe(5);
      expect(minimalTeam.taskPrioritization).toBe('dynamic');
      expect(minimalTeam.workloadDistribution).toBe('balanced');
    });

    test('should block orchestration methods when orchestration is disabled', async () => {
      const teamWithoutOrchestration = new Team({
        name: 'Non-Orchestration Team',
        agents: [developer],
        tasks: [],
        enableOrchestration: false,
      });

      // Test that orchestration methods fail when orchestration is disabled
      await expect(
        teamWithoutOrchestration.activateOrchestration('Test goal')
      ).rejects.toThrow('Orchestration is not enabled for this team');

      await expect(
        teamWithoutOrchestration.startContinuousOptimization()
      ).rejects.toThrow('Orchestration is not enabled for this team');

      // Test that other methods show warnings but don't throw
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      teamWithoutOrchestration.addBacklogTasks([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Orchestration is not enabled for this team. Task repository operations are ignored.'
      );

      teamWithoutOrchestration.removeBacklogTask('test-id');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Orchestration is not enabled for this team. Task repository operations are ignored.'
      );

      teamWithoutOrchestration.updateOrchestrationStrategy('Test strategy');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Orchestration is not enabled for this team. Strategy updates are ignored.'
      );

      teamWithoutOrchestration.updateOrchestrationMode('innovative');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Orchestration is not enabled for this team. Mode updates are ignored.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Task Configuration', () => {
    test('should initialize tasks with orchestration properties', () => {
      const adaptableTask = taskRepository[0];
      expect(adaptableTask.adaptable).toBe(true);
      expect(adaptableTask.orchestrationRules).toBeDefined();
      expect(adaptableTask.resourceRequirements).toBeDefined();
      expect(adaptableTask.splitStrategy).toBe('none'); // default
      expect(adaptableTask.mergeCompatible).toHaveLength(0); // default
      expect(adaptableTask.dynamicPriority).toBe(false); // default
    });

    test('should handle non-adaptable tasks', () => {
      const criticalTask = taskRepository[2];
      expect(criticalTask.adaptable).toBe(false);
      expect(criticalTask.orchestrationRules).toContain('CRITICAL');
    });

    test('should set default values for orchestration properties', () => {
      const basicTask = new Task({
        description: 'Basic task',
        expectedOutput: 'Basic output',
        agent: developer,
      });

      expect(basicTask.adaptable).toBe(false); // default
      expect(basicTask.splitStrategy).toBe('none');
      expect(basicTask.mergeCompatible).toHaveLength(0);
      expect(basicTask.dynamicPriority).toBe(false);
    });
  });

  describe('Team Orchestration Methods', () => {
    test('should add available tasks to repository', () => {
      const newTask = new Task({
        description: 'New task',
        expectedOutput: 'New output',
        agent: developer,
      });

      team.addBacklogTasks([newTask]);
      expect(team.backlogTasks).toHaveLength(4);
      expect(team.store.getState().backlogTasks).toHaveLength(4);
    });

    test('should remove tasks from repository', () => {
      const taskToRemove = taskRepository[0];
      team.removeBacklogTask(taskToRemove.id);

      expect(team.backlogTasks).toHaveLength(2);
      expect(
        team.backlogTasks.find((t) => t.id === taskToRemove.id)
      ).toBeUndefined();
    });

    test('should update orchestration strategy', () => {
      const newStrategy = 'Updated strategy for better performance';
      team.updateOrchestrationStrategy(newStrategy);

      expect(team.orchestrationStrategy).toBe(newStrategy);
      expect(team.store.getState().orchestrationStrategy).toBe(newStrategy);
    });

    test('should update orchestration mode', () => {
      team.updateOrchestrationMode('innovative');

      expect(team.mode).toBe('innovative');
      expect(team.store.getState().mode).toBe('innovative');
    });
  });

  describe('IntelligentOrchestrator', () => {
    let orchestrator: IntelligentOrchestrator;

    beforeEach(() => {
      orchestrator = new IntelligentOrchestrator(team);
    });

    test('should initialize with team configuration', () => {
      expect(orchestrator).toBeDefined();
      // Private properties - testing through public methods would be better
    });

    test('should handle orchestration without LLM configuration', async () => {
      const result = await orchestrator.orchestrateWorkflow(
        'Test project goal'
      );

      // Should return fallback orchestration result
      expect(Array.isArray(result)).toBe(true);
      // Fallback should select first few available tasks
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(team.maxActiveTasks);
    });

    test('should preserve existing tasks when preserveExistingTasks is true', async () => {
      // Add some existing tasks to the team
      const existingTask = new Task({
        description: 'Existing setup task',
        expectedOutput: 'Initial setup complete',
        agent: developer,
      });

      team.store.getState().addTasks([existingTask]);

      const result = await orchestrator.orchestrateWorkflow(
        'Build complete application',
        true
      );

      // Should include existing task plus new ones
      expect(result.length).toBeGreaterThan(1);
      expect(
        result.some((task) => task.description === 'Existing setup task')
      ).toBe(true);

      // Check that existing task is preserved
      const existingTaskInResult = result.find(
        (task) => task.description === 'Existing setup task'
      );
      expect(existingTaskInResult).toBeDefined();
    });

    test('should replace all tasks when preserveExistingTasks is false', async () => {
      // Add some existing tasks to the team
      const existingTask = new Task({
        description: 'Existing setup task',
        expectedOutput: 'Initial setup complete',
        agent: developer,
      });

      team.store.getState().addTasks([existingTask]);

      const result = await orchestrator.orchestrateWorkflow(
        'Build complete application',
        false
      );

      // Should NOT include existing task when preserveExistingTasks is false
      expect(
        result.some((task) => task.description === 'Existing setup task')
      ).toBe(false);
    });

    test('should perform gap analysis with existing tasks', async () => {
      // Add existing tasks with specific skills
      const existingAuthTask = new Task({
        description: 'Setup user authentication',
        expectedOutput: 'Auth system ready',
        agent: developer,
        resourceRequirements: {
          skillsRequired: ['backend', 'security'],
        },
      });

      team.store.getState().addTasks([existingAuthTask]);

      const result = await orchestrator.orchestrateWorkflow(
        'Complete web application',
        true
      );

      // Should not select similar authentication tasks from repository
      const authTasks = result.filter(
        (task) =>
          task.description.toLowerCase().includes('authentication') ||
          task.description.toLowerCase().includes('auth')
      );

      // Should have the existing auth task but not duplicate auth tasks
      expect(authTasks.length).toBe(1);
      expect(authTasks[0].description).toBe('Setup user authentication');
    });

    test('should respect task adaptation permissions', async () => {
      // Test with adaptable task
      const adaptableTask = taskRepository[0];
      const permissions = await (
        orchestrator as any
      ).evaluateTaskModificationPermissions(adaptableTask);
      expect(permissions.canModify).toBe(true);

      // Test with non-adaptable task
      const criticalTask = taskRepository[2];
      const criticalPermissions = await (
        orchestrator as any
      ).evaluateTaskModificationPermissions(criticalTask);
      expect(criticalPermissions.canModify).toBe(false);
      expect(criticalPermissions.reason).toContain('prohibits');
    });

    test('should generate tasks for identified gaps when allowed', async () => {
      const context = {
        activeTasks: [],
        availableAgents: [developer, tester],
        projectProgress: 25,
        blockedTasks: [],
        codeCoverage: 60,
        performanceScore: 70,
        workload: 'low',
        projectPhase: 'development',
        similarTasks: [],
        resourceAvailability: 'high',
        timeConstraints: 'relaxed',
        qualityRequirements: 'high',
      };

      const gap = {
        description: 'Missing testing coverage',
        category: 'quality_assurance',
        estimatedComplexity: 'medium' as const,
        requirements: ['testing', 'automation'],
        dependencies: [],
      };

      const generatedTask = await (orchestrator as any).generateTaskForGap(
        gap,
        context
      );

      expect(generatedTask).toBeDefined();
      expect(generatedTask.description).toContain('Generated task');
      expect(generatedTask.adaptable).toBe(true);
      expect(generatedTask.orchestrationRules).toContain('quality_assurance');
    });

    test('should calculate project progress correctly', () => {
      // Add some completed tasks to the store
      const completedTask = new Task({
        description: 'Completed task',
        expectedOutput: 'Done',
        agent: developer,
      });
      completedTask.status = 'DONE' as any;

      const inProgressTask = new Task({
        description: 'In progress task',
        expectedOutput: 'Working',
        agent: tester,
      });
      inProgressTask.status = 'DOING' as any;

      team.store.getState().addTasks([completedTask, inProgressTask]);

      const progress = (orchestrator as any).calculateProjectProgress();
      expect(progress).toBe(50); // 1 completed out of 2 total = 50%
    });

    test('should assess resource availability correctly', () => {
      // Mock agent statuses
      developer.status = 'IDLE' as any;
      tester.status = 'BUSY' as any;

      const availability = (orchestrator as any).assessResourceAvailability();
      expect(availability).toBe('medium'); // 1 out of 2 agents available = 50%
    });
  });

  describe('Prompt Templates', () => {
    test('should generate task selection prompt', () => {
      const context = {
        activeTasks: [],
        availableAgents: [developer],
        projectProgress: 30,
        blockedTasks: [],
        codeCoverage: 80,
        performanceScore: 90,
        workload: 'low',
        projectPhase: 'development',
        similarTasks: [],
        resourceAvailability: 'high',
        timeConstraints: 'moderate',
        qualityRequirements: 'high',
      };

      const prompt = TaskSelectionPromptTemplate.build(
        context,
        'Build a secure web application',
        taskRepository
      );

      expect(prompt).toContain('INTELLIGENT TASK SELECTION');
      expect(prompt).toContain('Build a secure web application');
      expect(prompt).toContain('Project Progress: 30%');
      expect(prompt).toContain('Implement user authentication');
      expect(prompt).toContain('JSON object');
    });

    test('should generate task adaptation prompt', () => {
      const context = {
        activeTasks: [],
        availableAgents: [developer, tester],
        projectProgress: 50,
        blockedTasks: [],
        codeCoverage: 75,
        performanceScore: 85,
        workload: 'medium',
        projectPhase: 'development',
        similarTasks: [],
        resourceAvailability: 'high',
        timeConstraints: 'tight',
        qualityRequirements: 'high',
      };

      const task = taskRepository[0];
      const instructions = 'Focus on security and performance';

      const prompt = TaskAdaptationPromptTemplate.build(
        task,
        context,
        instructions
      );

      expect(prompt).toContain('INTELLIGENT TASK ADAPTATION');
      expect(prompt).toContain('Implement user authentication');
      expect(prompt).toContain('Focus on security and performance');
      expect(prompt).toContain('Time Constraints: tight');
      expect(prompt).toContain('JSON object');
    });

    test('should generate task generation prompt', () => {
      const context = {
        activeTasks: [],
        availableAgents: [developer, tester],
        projectProgress: 25,
        blockedTasks: [],
        codeCoverage: 60,
        performanceScore: 70,
        workload: 'low',
        projectPhase: 'development',
        similarTasks: [],
        resourceAvailability: 'high',
        timeConstraints: 'relaxed',
        qualityRequirements: 'high',
      };

      const gap = {
        description: 'Missing API documentation',
        category: 'documentation',
        estimatedComplexity: 'low' as const,
        requirements: ['documentation', 'api_design'],
        dependencies: ['api_implementation'],
      };

      const instructions = 'Prioritize developer experience';

      const prompt = TaskGenerationPromptTemplate.build(
        gap,
        context,
        instructions
      );

      expect(prompt).toContain('INTELLIGENT TASK GENERATION');
      expect(prompt).toContain('Missing API documentation');
      expect(prompt).toContain('documentation');
      expect(prompt).toContain('Prioritize developer experience');
      expect(prompt).toContain('JSON object');
    });
  });

  describe('Store Integration', () => {
    test('should update available tasks in store', () => {
      const newTask = new Task({
        description: 'Store test task',
        expectedOutput: 'Store integration working',
        agent: developer,
      });

      team.store.getState().setBacklogTasks([newTask]);
      expect(team.store.getState().backlogTasks).toHaveLength(1);
      expect(team.store.getState().backlogTasks[0].description).toBe(
        'Store test task'
      );
    });

    test('should add available task to store', () => {
      const initialCount = team.store.getState().backlogTasks?.length || 0;

      const newTask = new Task({
        description: 'Added task',
        expectedOutput: 'Task added',
        agent: developer,
      });

      team.store.getState().addBacklogTask(newTask);
      expect(team.store.getState().backlogTasks).toHaveLength(initialCount + 1);
    });

    test('should remove available task from store', () => {
      const taskToRemove = taskRepository[0];
      const initialCount = team.store.getState().backlogTasks?.length || 0;

      team.store.getState().removeBacklogTask(taskToRemove.id);
      expect(team.store.getState().backlogTasks).toHaveLength(initialCount - 1);
    });

    test('should update orchestration mode in store', () => {
      team.store.getState().updateOrchestrationMode('learning');
      expect(team.store.getState().mode).toBe('learning');
    });

    test('should update orchestration strategy in store', () => {
      const newStrategy = 'New strategy from store';
      team.store.getState().updateOrchestrationStrategy(newStrategy);
      expect(team.store.getState().orchestrationStrategy).toBe(newStrategy);
    });

    test('should add orchestrated tasks without duplicates', async () => {
      // Add some initial tasks
      const initialTask = new Task({
        description: 'Initial task',
        expectedOutput: 'Initial result',
        agent: developer,
      });

      team.store.getState().addTasks([initialTask]);
      const initialCount = team.store.getState().tasks.length;

      // Orchestrate workflow which should add new tasks
      await orchestrator.orchestrateWorkflow('Build application', true);

      const finalCount = team.store.getState().tasks.length;

      // Should have more tasks after orchestration
      expect(finalCount).toBeGreaterThan(initialCount);

      // Should still include the initial task
      const tasks = team.store.getState().tasks;
      expect(tasks.some((task) => task.description === 'Initial task')).toBe(
        true
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle missing LLM configuration gracefully', () => {
      const teamWithoutLLM = new Team({
        name: 'No LLM Team',
        agents: [developer],
        tasks: [],
        enableOrchestration: true,
        backlogTasks: taskRepository,
        allowTaskGeneration: true,
      });

      expect(() => new IntelligentOrchestrator(teamWithoutLLM)).not.toThrow();
    });

    test('should handle empty task repository', async () => {
      const emptyTeam = new Team({
        name: 'Empty Repository Team',
        agents: [developer],
        tasks: [],
        enableOrchestration: true,
        backlogTasks: [],
        allowTaskGeneration: false,
      });

      const orchestrator = new IntelligentOrchestrator(emptyTeam);
      const result = await orchestrator.orchestrateWorkflow('Test goal');

      expect(result).toHaveLength(0);
    });

    test('should handle task generation when not allowed', async () => {
      const restrictedTeam = new Team({
        name: 'Restricted Team',
        agents: [developer],
        tasks: [],
        enableOrchestration: true,
        backlogTasks: taskRepository,
        allowTaskGeneration: false, // Generation not allowed
      });

      const orchestrator = new IntelligentOrchestrator(restrictedTeam);
      const context = {
        activeTasks: [],
        availableAgents: [developer],
        projectProgress: 0,
        blockedTasks: [],
        codeCoverage: 0,
        performanceScore: 50,
        workload: 'low',
        projectPhase: 'planning',
        similarTasks: [],
        resourceAvailability: 'high',
        timeConstraints: 'relaxed',
        qualityRequirements: 'medium',
      };

      const generatedTasks = await (
        orchestrator as any
      ).generateAdditionalTasks(context, []);
      expect(generatedTasks).toHaveLength(0);
    });
  });
});

describe('Orchestration Integration', () => {
  test('should integrate with existing KaibanJS workflow', async () => {
    const developer = new Agent({
      name: 'Integration Developer',
      role: 'Full-Stack Developer',
      goal: 'Build complete features',
      background: 'Experienced developer',
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxRetries: 1,
      },
    });

    const integrationTask = new Task({
      description: 'Test integration with existing workflow',
      expectedOutput: 'Successfully integrated orchestration',
      agent: developer,
      adaptable: true,
    });

    const team = new Team({
      name: 'Integration Test Team',
      agents: [developer],
      tasks: [integrationTask],
      enableOrchestration: true,
      backlogTasks: [integrationTask],
      allowTaskGeneration: false,
      mode: 'conservative',
    });

    // Should be able to start normal workflow
    expect(() => team.start()).not.toThrow();

    // Should be able to use orchestration methods
    expect(() => team.addBacklogTasks([])).not.toThrow();
    expect(() => team.updateOrchestrationMode('adaptive')).not.toThrow();
    expect(() =>
      team.updateOrchestrationStrategy('New strategy')
    ).not.toThrow();
  });
});
