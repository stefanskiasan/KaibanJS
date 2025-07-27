import { useState, useMemo } from 'react';
import Spinner from './Spinner';
import './EnhancedTaskBoard.css';

const EnhancedTaskBoard = ({ tasks = [], orchestrationEnabled = false }) => {
  const [expandedTask, setExpandedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showOrchestrationDetails, setShowOrchestrationDetails] =
    useState(true);

  // Categorize tasks by status
  const tasksByStatus = useMemo(() => {
    const categories = {
      'To Do': tasks.filter(
        (task) => task.status === 'pending' || task.status === 'todo'
      ),
      'In Progress': tasks.filter(
        (task) => task.status === 'doing' || task.status === 'in_progress'
      ),
      Review: tasks.filter(
        (task) =>
          task.status === 'review' || task.status === 'awaiting_validation'
      ),
      Blocked: tasks.filter((task) => task.status === 'blocked'),
      Done: tasks.filter(
        (task) => task.status === 'done' || task.status === 'completed'
      ),
    };

    if (filter !== 'all') {
      Object.keys(categories).forEach((status) => {
        categories[status] = categories[status].filter((task) => {
          switch (filter) {
            case 'generated':
              return task.generated || task.orchestratorGenerated;
            case 'adapted':
              return (
                task.adaptationHistory && task.adaptationHistory.length > 0
              );
            case 'template':
              return task.template;
            case 'original':
              return (
                !task.generated &&
                !task.orchestratorGenerated &&
                (!task.adaptationHistory || task.adaptationHistory.length === 0)
              );
            default:
              return true;
          }
        });
      });
    }

    return categories;
  }, [tasks, filter]);

  const getTaskTypeIndicator = (task) => {
    if (task.generated || task.orchestratorGenerated) {
      return {
        icon: '✨',
        label: 'AI Generated',
        color: '#51cf66',
        bgColor: '#d3f9d8',
      };
    }
    if (task.adaptationHistory && task.adaptationHistory.length > 0) {
      return {
        icon: '🔄',
        label: 'Adapted',
        color: '#fd7e14',
        bgColor: '#ffe0b3',
      };
    }
    if (task.template) {
      return {
        icon: '📋',
        label: 'Template',
        color: '#339af0',
        bgColor: '#e7f5ff',
      };
    }
    return {
      icon: '📝',
      label: 'Original',
      color: '#6c757d',
      bgColor: '#f8f9fa',
    };
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low':
        return '#51cf66';
      case 'medium':
        return '#ffd43b';
      case 'high':
        return '#ff6b6b';
      default:
        return '#868e96';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffd43b';
      case 'low':
        return '#51cf66';
      default:
        return '#868e96';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Not available';
    if (typeof duration === 'number') {
      return `${duration.toFixed(1)}s`;
    }
    return duration;
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const renderTaskCard = (task) => {
    const typeIndicator = getTaskTypeIndicator(task);
    const isExpanded = expandedTask === task.id;
    const complexity = task.complexity || task.resourceRequirements?.complexity;
    const priority = task.priority || task.dynamicPriority;

    return (
      <div key={task.id} className="enhanced-task-card">
        <div
          className="task-card-header"
          onClick={() => toggleTaskExpansion(task.id)}
        >
          <div className="task-header-left">
            <div
              className="task-type-indicator"
              style={{
                backgroundColor: typeIndicator.bgColor,
                color: typeIndicator.color,
              }}
            >
              <span className="type-icon">{typeIndicator.icon}</span>
              <span className="type-label">{typeIndicator.label}</span>
            </div>

            <div className="task-title-section">
              <h4 className="task-title">{task.description}</h4>
              {task.agent && (
                <span className="task-agent">👤 {task.agent.name}</span>
              )}
            </div>
          </div>

          <div className="task-header-right">
            <div className="task-badges">
              {complexity && (
                <span
                  className="complexity-badge"
                  style={{ backgroundColor: getComplexityColor(complexity) }}
                >
                  {complexity}
                </span>
              )}

              {priority && (
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(priority) }}
                >
                  {priority}
                </span>
              )}

              <span className={`status-badge status-${task.status}`}>
                {task.status}
                {task.status === 'doing' && (
                  <Spinner color="white" size="small" />
                )}
              </span>
            </div>

            <span className="expand-indicator">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="task-card-details">
            {/* Basic Task Information */}
            <div className="task-detail-section">
              <h5>📋 Task Details</h5>

              {task.expectedOutput && (
                <div className="detail-item">
                  <strong>Expected Output:</strong>
                  <span>{task.expectedOutput}</span>
                </div>
              )}

              {task.duration && (
                <div className="detail-item">
                  <strong>Duration:</strong>
                  <span>{formatDuration(task.duration)}</span>
                </div>
              )}

              {task.resourceRequirements?.estimatedTime && (
                <div className="detail-item">
                  <strong>Estimated Time:</strong>
                  <span>{task.resourceRequirements.estimatedTime}</span>
                </div>
              )}

              {task.resourceRequirements?.skillsRequired && (
                <div className="detail-item">
                  <strong>Required Skills:</strong>
                  <div className="skills-list">
                    {task.resourceRequirements.skillsRequired.map(
                      (skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {task.resourceRequirements?.dependencies &&
                task.resourceRequirements.dependencies.length > 0 && (
                  <div className="detail-item">
                    <strong>Dependencies:</strong>
                    <div className="dependencies-list">
                      {task.resourceRequirements.dependencies.map(
                        (dep, index) => (
                          <span key={index} className="dependency-tag">
                            {dep}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Orchestration Information */}
            {orchestrationEnabled && showOrchestrationDetails && (
              <div className="orchestration-detail-section">
                <h5>🤖 Orchestration Details</h5>

                {task.adaptable !== undefined && (
                  <div className="detail-item">
                    <strong>Adaptable:</strong>
                    <span
                      className={`adaptable-status ${
                        task.adaptable ? 'yes' : 'no'
                      }`}
                    >
                      {task.adaptable ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                )}

                {task.orchestrationRules && (
                  <div className="detail-item">
                    <strong>Orchestration Rules:</strong>
                    <div className="orchestration-rules">
                      {task.orchestrationRules}
                    </div>
                  </div>
                )}

                {task.generated && (
                  <div className="detail-item">
                    <strong>Generation Info:</strong>
                    <div className="generation-info">
                      <span>
                        Generated by: {task.generatedBy || 'AI Orchestrator'}
                      </span>
                      {task.generatedAt && (
                        <span>
                          Generated at:{' '}
                          {new Date(task.generatedAt).toLocaleString()}
                        </span>
                      )}
                      {task.sourceGap && (
                        <span>Source: {task.sourceGap.description}</span>
                      )}
                    </div>
                  </div>
                )}

                {task.adaptationHistory && task.adaptationHistory.length > 0 && (
                  <div className="detail-item">
                    <strong>Adaptation History:</strong>
                    <div className="adaptation-history">
                      {task.adaptationHistory.map((adaptation, index) => (
                        <div key={index} className="adaptation-entry">
                          <div className="adaptation-header">
                            <span className="adaptation-date">
                              {new Date(adaptation.timestamp).toLocaleString()}
                            </span>
                            <span className="adaptation-reason">
                              {adaptation.reason}
                            </span>
                          </div>
                          {adaptation.changes && (
                            <div className="adaptation-changes">
                              {Object.entries(adaptation.changes).map(
                                ([key, value]) => (
                                  <span key={key} className="change-item">
                                    {key}: {JSON.stringify(value)}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Task Results */}
            {task.result && (
              <div className="task-result-section">
                <h5>📊 Results</h5>
                <div className="task-result">
                  {typeof task.result === 'object'
                    ? JSON.stringify(task.result, null, 2)
                    : task.result}
                </div>
              </div>
            )}

            {/* Feedback History */}
            {task.feedbackHistory && task.feedbackHistory.length > 0 && (
              <div className="feedback-section">
                <h5>💬 Feedback History</h5>
                <div className="feedback-list">
                  {task.feedbackHistory.map((feedback, index) => (
                    <div key={index} className="feedback-item">
                      <span className="feedback-content">
                        {feedback.content}
                      </span>
                      <span className="feedback-status">
                        Status: {feedback.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStatusColumn = (status, tasks) => {
    const statusConfig = {
      'To Do': { color: '#6c757d', icon: '📋' },
      'In Progress': { color: '#339af0', icon: '🔄' },
      Review: { color: '#ffd43b', icon: '👀' },
      Blocked: { color: '#ff6b6b', icon: '🚧' },
      Done: { color: '#51cf66', icon: '✅' },
    };

    const config = statusConfig[status] || { color: '#6c757d', icon: '📝' };

    return (
      <div key={status} className="status-column">
        <div className="status-header" style={{ borderColor: config.color }}>
          <span className="status-icon">{config.icon}</span>
          <h3 style={{ color: config.color }}>{status}</h3>
          <span className="task-count">({tasks.length})</span>
        </div>

        <div className="status-tasks">
          {tasks.length === 0 ? (
            <div className="empty-status">
              <p>No tasks in this status</p>
            </div>
          ) : (
            tasks.map(renderTaskCard)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-task-board">
      <div className="task-board-header">
        <div className="header-left">
          <h2>📊 Enhanced Task Board</h2>
          <span className="total-tasks">{tasks.length} total tasks</span>
        </div>

        <div className="board-controls">
          {orchestrationEnabled && (
            <button
              className={`orchestration-toggle ${
                showOrchestrationDetails ? 'active' : ''
              }`}
              onClick={() =>
                setShowOrchestrationDetails(!showOrchestrationDetails)
              }
            >
              🤖 Orchestration Details
            </button>
          )}

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="task-filter"
          >
            <option value="all">All Tasks</option>
            <option value="generated">AI Generated</option>
            <option value="adapted">Adapted</option>
            <option value="template">Templates</option>
            <option value="original">Original</option>
          </select>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="task-statistics">
        <div className="stat-item">
          <span className="stat-icon">✨</span>
          <span className="stat-label">Generated:</span>
          <span className="stat-value">
            {tasks.filter((t) => t.generated || t.orchestratorGenerated).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🔄</span>
          <span className="stat-label">Adapted:</span>
          <span className="stat-value">
            {
              tasks.filter(
                (t) => t.adaptationHistory && t.adaptationHistory.length > 0
              ).length
            }
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📋</span>
          <span className="stat-label">Templates:</span>
          <span className="stat-value">
            {tasks.filter((t) => t.template).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📝</span>
          <span className="stat-label">Original:</span>
          <span className="stat-value">
            {
              tasks.filter(
                (t) =>
                  !t.generated &&
                  !t.orchestratorGenerated &&
                  (!t.adaptationHistory || t.adaptationHistory.length === 0)
              ).length
            }
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) =>
          renderStatusColumn(status, statusTasks)
        )}
      </div>

      {/* Legend */}
      <div className="task-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span
              className="legend-icon"
              style={{ backgroundColor: '#d3f9d8', color: '#51cf66' }}
            >
              ✨
            </span>
            <span>AI Generated Tasks</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-icon"
              style={{ backgroundColor: '#ffe0b3', color: '#fd7e14' }}
            >
              🔄
            </span>
            <span>Adapted Tasks</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-icon"
              style={{ backgroundColor: '#e7f5ff', color: '#339af0' }}
            >
              📋
            </span>
            <span>Template Tasks</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-icon"
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
            >
              📝
            </span>
            <span>Original Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTaskBoard;
