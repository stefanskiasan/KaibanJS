import React, { useState } from 'react';
import { Agent, Task, Team } from 'kaibanjs';

export default {
  title: 'KaibanJS/Orchestration Demo',
  parameters: {
    docs: {
      description: {
        component:
          'Demonstrates the new intelligent orchestration features in KaibanJS.',
      },
    },
  },
};

const OrchestrationComponent = () => {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDemo, setCurrentDemo] = useState('');
  const [results, setResults] = useState({});

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => {
    setLogs([]);
    setResults({});
  };

  // Create agents
  const createAgents = () => {
    return {
      developer: new Agent({
        name: 'Alex Developer',
        role: 'Full-Stack Developer',
        goal: 'Build scalable applications',
        background: 'Expert web developer',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.2,
        },
      }),
      designer: new Agent({
        name: 'Sarah Designer',
        role: 'UI/UX Designer',
        goal: 'Create beautiful interfaces',
        background: 'Design systems expert',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.3,
        },
      }),
      tester: new Agent({
        name: 'Mike Tester',
        role: 'QA Engineer',
        goal: 'Ensure quality',
        background: 'Testing expert',
        llmConfig: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.1,
        },
      }),
    };
  };

  // Create existing tasks
  const createExistingTasks = (agents) => {
    return [
      new Task({
        description: 'Setup development environment',
        expectedOutput: 'Ready development environment',
        agent: agents.developer,
        resourceRequirements: {
          estimatedTime: '2-3 hours',
          skillsRequired: ['devops', 'setup'],
          dependencies: [],
        },
      }),
      new Task({
        description: 'Create design wireframes',
        expectedOutput: 'Complete wireframes',
        agent: agents.designer,
        resourceRequirements: {
          estimatedTime: '4 hours',
          skillsRequired: ['ui_design', 'wireframing'],
          dependencies: [],
        },
      }),
    ];
  };

  // Create task repository
  const createTaskRepository = (agents) => {
    return [
      new Task({
        description: 'Implement user authentication',
        expectedOutput: 'Secure login system',
        agent: agents.developer,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '6-8 hours',
          skillsRequired: ['backend', 'security'],
          dependencies: ['setup'],
        },
      }),
      new Task({
        description: 'Build component library',
        expectedOutput: 'Reusable components',
        agent: agents.designer,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '8 hours',
          skillsRequired: ['frontend', 'components'],
          dependencies: ['wireframes'],
        },
      }),
      new Task({
        description: 'Create comprehensive tests',
        expectedOutput: 'Test suite with 80%+ coverage',
        agent: agents.tester,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '6 hours',
          skillsRequired: ['testing', 'automation'],
          dependencies: ['authentication', 'components'],
        },
      }),
      new Task({
        description: 'Build API endpoints',
        expectedOutput: 'RESTful API',
        agent: agents.developer,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '10 hours',
          skillsRequired: ['backend', 'api'],
          dependencies: ['authentication'],
        },
      }),
    ];
  };

  // Demo 1: Traditional KaibanJS
  const runTraditionalDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('Traditional KaibanJS');
    addLog('🔴 Starting Traditional KaibanJS Demo', 'demo');

    try {
      const agents = createAgents();
      const existingTasks = createExistingTasks(agents);

      const team = new Team({
        name: 'Traditional Team',
        agents: Object.values(agents),
        tasks: existingTasks,
        enableOrchestration: false, // Traditional behavior
        env: { OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '' },
      });

      addLog(
        `✅ Traditional team created with ${team.getTasks().length} fixed tasks`
      );
      addLog(
        `📊 Orchestration: ${team.enableOrchestration ? 'Enabled' : 'Disabled'}`
      );

      setResults((prev) => ({
        ...prev,
        traditional: {
          taskCount: team.getTasks().length,
          orchestration: team.enableOrchestration,
          agents: team.getStore().getState().agents.length,
        },
      }));

      addLog('Traditional workflow uses fixed, predefined tasks', 'success');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }

    setIsRunning(false);
  };

  // Demo 2: Orchestration with Existing Tasks
  const runOrchestrationDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('Intelligent Orchestration');
    addLog('🟢 Starting Intelligent Orchestration Demo', 'demo');

    try {
      const agents = createAgents();
      const existingTasks = createExistingTasks(agents);
      const taskRepository = createTaskRepository(agents);

      addLog(
        `📊 Setup: ${Object.keys(agents).length} agents, ${
          existingTasks.length
        } existing tasks, ${taskRepository.length} templates`
      );

      const team = new Team({
        name: 'AI-Orchestrated Team',
        agents: Object.values(agents),
        tasks: [...existingTasks],
        enableOrchestration: true, // Enable AI orchestration ✨
        availableTasks: taskRepository,
        allowTaskGeneration: true,
        orchestrationStrategy: `
          Build a modern web application with:
          - User authentication and security
          - Beautiful, responsive UI components
          - Comprehensive testing suite
          - RESTful API with proper documentation
          
          Focus on high quality, maintainability, and excellent user experience.
        `,
        mode: 'adaptive',
        maxActiveTasks: 6,
        taskPrioritization: 'ai-driven',
        workloadDistribution: 'skills-based',
        env: { OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '' },
      });

      addLog(
        `🎯 Orchestration enabled with ${team.availableTasks.length} available templates`
      );
      addLog('🤖 Starting AI-driven task orchestration...');
      addLog('Watch for orchestration events below! ⬇️', 'info');

      const result = await team.activateOrchestration(
        'Build a complete, production-ready web application with excellent UX and comprehensive testing',
        true // preserveExistingTasks = true
      );

      addLog(`✅ Orchestration completed successfully!`, 'success');
      addLog(
        `📊 Results: ${result.length} total tasks (${
          existingTasks.length
        } existing + ${result.length - existingTasks.length} new)`
      );

      // Analyze workload distribution
      const workloadMap = new Map();
      result.forEach((task) => {
        const agentName = task.agent?.name || 'Unassigned';
        workloadMap.set(agentName, (workloadMap.get(agentName) || 0) + 1);
      });

      addLog('👥 Workload Distribution:');
      for (const [agentName, taskCount] of workloadMap.entries()) {
        addLog(`   - ${agentName}: ${taskCount} tasks`);
      }

      // Analyze skill coverage
      const skillSet = new Set();
      result.forEach((task) => {
        if (task.resourceRequirements?.skillsRequired) {
          task.resourceRequirements.skillsRequired.forEach((skill) =>
            skillSet.add(skill)
          );
        }
      });

      addLog(`🎯 Skills covered: ${Array.from(skillSet).sort().join(', ')}`);

      setResults((prev) => ({
        ...prev,
        orchestrated: {
          totalTasks: result.length,
          existingTasks: existingTasks.length,
          newTasks: result.length - existingTasks.length,
          workloadDistribution: Object.fromEntries(workloadMap),
          skillsCovered: Array.from(skillSet).sort(),
          tasks: result.map((task) => ({
            description: task.description,
            agent: task.agent?.name,
            skills: task.resourceRequirements?.skillsRequired || [],
          })),
        },
      }));
    } catch (error) {
      addLog(`❌ Orchestration failed: ${error.message}`, 'error');
      addLog('Check your OPENAI_API_KEY in environment variables', 'error');
    }

    setIsRunning(false);
  };

  // Demo 3: Repository Management
  const runRepositoryDemo = async () => {
    setIsRunning(true);
    setCurrentDemo('Repository Management');
    addLog('🔧 Starting Repository Management Demo', 'demo');

    try {
      const agents = createAgents();
      const existingTasks = createExistingTasks(agents);
      const taskRepository = createTaskRepository(agents);

      const team = new Team({
        name: 'Repository Demo Team',
        agents: Object.values(agents),
        tasks: existingTasks,
        enableOrchestration: true,
        availableTasks: taskRepository,
        allowTaskGeneration: false,
        mode: 'conservative',
        env: { OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '' },
      });

      addLog(`📚 Initial repository: ${team.availableTasks.length} tasks`);

      // Add new task to repository
      const newTask = new Task({
        description: 'Implement real-time notifications',
        expectedOutput: 'WebSocket notification system',
        agent: agents.developer,
        adaptable: true,
        template: true,
        resourceRequirements: {
          estimatedTime: '8 hours',
          skillsRequired: ['backend', 'websockets', 'real_time'],
          dependencies: ['authentication'],
        },
      });

      addLog('📚 Adding new task to repository...');
      team.addAvailableTasks([newTask]);
      addLog(
        `✅ Repository updated: ${team.availableTasks.length} tasks available`
      );

      // Update strategy
      addLog('⚙️ Updating orchestration strategy...');
      team.updateOrchestrationStrategy(
        'Enhanced strategy with real-time features for better user engagement'
      );
      addLog('✅ Strategy updated successfully');

      // Update mode
      addLog('🔄 Switching to innovative mode...');
      team.updateOrchestrationMode('innovative');
      addLog('✅ Mode updated to innovative');

      setResults((prev) => ({
        ...prev,
        repository: {
          initialTasks: taskRepository.length,
          finalTasks: team.availableTasks.length,
          newTaskAdded: newTask.description,
          updatedStrategy: true,
          updatedMode: 'innovative',
        },
      }));

      addLog('🎉 Repository management completed successfully!', 'success');
    } catch (error) {
      addLog(`❌ Repository demo failed: ${error.message}`, 'error');
    }

    setIsRunning(false);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error':
        return '#ff6b6b';
      case 'success':
        return '#51cf66';
      case 'demo':
        return '#339af0';
      case 'info':
        return '#868e96';
      default:
        return '#212529';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Monaco, monospace' }}>
      <h1 style={{ color: '#339af0', marginBottom: '20px' }}>
        🚀 KaibanJS Orchestration Demo
      </h1>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Explore the new intelligent orchestration features that enable AI-driven
        task management, gap analysis, and adaptive workflow optimization.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runTraditionalDemo}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          🔴 Traditional KaibanJS
        </button>

        <button
          onClick={runOrchestrationDemo}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#51cf66',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          🟢 Intelligent Orchestration
        </button>

        <button
          onClick={runRepositoryDemo}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#868e96',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          🔧 Repository Management
        </button>

        <button
          onClick={clearLogs}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e03131',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>

      {isRunning && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
          }}
        >
          <strong>🔄 Running: {currentDemo}</strong>
          <div style={{ marginTop: '5px' }}>
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e9ecef',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#339af0',
                  animation: 'progress 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {Object.keys(results).length > 0 && (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#339af0' }}>📊 Results Summary</h3>
          {results.traditional && (
            <div style={{ marginBottom: '10px' }}>
              <strong>🔴 Traditional:</strong> {results.traditional.taskCount}{' '}
              fixed tasks, orchestration{' '}
              {results.traditional.orchestration ? 'enabled' : 'disabled'}
            </div>
          )}
          {results.orchestrated && (
            <div style={{ marginBottom: '10px' }}>
              <strong>🟢 Orchestrated:</strong>{' '}
              {results.orchestrated.totalTasks} total tasks (
              {results.orchestrated.existingTasks} existing +{' '}
              {results.orchestrated.newTasks} new),
              {results.orchestrated.skillsCovered.length} skills covered
            </div>
          )}
          {results.repository && (
            <div>
              <strong>🔧 Repository:</strong> {results.repository.initialTasks}{' '}
              → {results.repository.finalTasks} tasks, mode:{' '}
              {results.repository.updatedMode}
            </div>
          )}
        </div>
      )}

      {/* Logs Display */}
      <div
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          height: '400px',
          overflow: 'auto',
          backgroundColor: '#f8f9fa',
          padding: '10px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#339af0' }}>📝 Execution Logs</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#868e96', fontStyle: 'italic' }}>
            Click a demo button to see orchestration in action...
          </p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: '5px',
                padding: '5px',
                borderLeft: `3px solid ${getLogColor(log.type)}`,
                paddingLeft: '10px',
                backgroundColor:
                  log.type === 'error'
                    ? '#fff5f5'
                    : log.type === 'success'
                    ? '#f3faf3'
                    : log.type === 'demo'
                    ? '#f0f8ff'
                    : 'transparent',
              }}
            >
              <span style={{ color: '#868e96', fontSize: '0.8em' }}>
                [{log.timestamp}]
              </span>{' '}
              <span style={{ color: getLogColor(log.type) }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e7f5ff',
          borderRadius: '5px',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#1971c2' }}>
          💡 Key Features Demonstrated
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>
            <strong>enableOrchestration</strong>: Toggle between traditional and
            AI-driven workflows
          </li>
          <li>
            <strong>Existing Tasks Support</strong>: Build upon foundation work
            instead of starting fresh
          </li>
          <li>
            <strong>Gap Analysis</strong>: AI identifies missing skills and
            suggests complementary tasks
          </li>
          <li>
            <strong>Repository Management</strong>: Dynamic task template
            updates and strategy changes
          </li>
          <li>
            <strong>Comprehensive Logging</strong>: Full visibility into AI
            decision-making process
          </li>
          <li>
            <strong>Adaptive Modes</strong>: Conservative, adaptive, and
            innovative orchestration strategies
          </li>
        </ul>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export const OrchestrationPlayground = () => <OrchestrationComponent />;

OrchestrationPlayground.parameters = {
  docs: {
    description: {
      story:
        'Interactive demonstration of KaibanJS intelligent orchestration features including AI-driven task management, gap analysis, and repository management.',
    },
  },
};
