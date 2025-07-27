import { useState, useEffect, useRef } from 'react';
import './OrchestratorDecisionPanel.css';

const OrchestratorDecisionPanel = ({ team, isActive = false }) => {
  const [decisions, setDecisions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  // Decision types with their configurations
  const decisionTypes = {
    task_selection: { icon: '🎯', label: 'Task Selection', color: '#339af0' },
    task_adaptation: { icon: '🔄', label: 'Task Adaptation', color: '#fd7e14' },
    task_generation: { icon: '✨', label: 'Task Generation', color: '#51cf66' },
    agent_assignment: {
      icon: '👤',
      label: 'Agent Assignment',
      color: '#845ef7',
    },
    priority_change: { icon: '📊', label: 'Priority Change', color: '#ffd43b' },
    workflow_optimization: {
      icon: '⚡',
      label: 'Workflow Optimization',
      color: '#20c997',
    },
    resource_allocation: {
      icon: '📦',
      label: 'Resource Allocation',
      color: '#f783ac',
    },
    gap_analysis: { icon: '🔍', label: 'Gap Analysis', color: '#ff6b6b' },
    strategy_update: { icon: '🎛️', label: 'Strategy Update', color: '#6c757d' },
  };

  // Mock orchestrator decision stream (in real implementation, this would come from the orchestrator)
  useEffect(() => {
    if (!isActive || !team?.enableOrchestration) return;

    // Simulate orchestrator decisions
    const simulateDecisions = () => {
      const mockDecisions = [
        {
          id: Date.now() + Math.random(),
          type: 'gap_analysis',
          timestamp: new Date(),
          title: 'Identified workflow gap',
          description:
            'Missing testing phase after authentication implementation',
          context: {
            analysis:
              'Quality assurance coverage insufficient for security-critical components',
            recommendation:
              'Add comprehensive testing task with security focus',
            confidence: 0.87,
            impact: 'high',
          },
          status: 'completed',
        },
        {
          id: Date.now() + Math.random() + 1,
          type: 'task_generation',
          timestamp: new Date(),
          title: 'Generated new task',
          description:
            'Create comprehensive security tests for authentication system',
          context: {
            reasoning: 'Filling identified gap in quality assurance workflow',
            agent: 'Mike Tester',
            estimatedTime: '4-6 hours',
            dependencies: ['authentication_implementation'],
            confidence: 0.92,
          },
          status: 'completed',
        },
        {
          id: Date.now() + Math.random() + 2,
          type: 'agent_assignment',
          timestamp: new Date(),
          title: 'Optimized agent assignment',
          description: 'Reassigned UI component task based on current workload',
          context: {
            from: 'Alex Developer',
            to: 'Sarah Designer',
            reasoning: 'Better skill match and workload balance',
            confidence: 0.78,
            impact: 'medium',
          },
          status: 'completed',
        },
      ];

      setDecisions((prev) => [...mockDecisions, ...prev].slice(0, 50)); // Keep last 50 decisions
    };

    // Simulate periodic orchestrator activity
    const interval = setInterval(simulateDecisions, 8000);

    // Initial decisions
    setTimeout(simulateDecisions, 1000);

    return () => clearInterval(interval);
  }, [isActive, team]);

  // Auto-scroll to bottom when new decisions arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [decisions, autoScroll]);

  // Filter decisions
  const filteredDecisions = decisions.filter((decision) => {
    if (filter === 'all') return true;
    return decision.type === filter;
  });

  // Get unique decision types from current decisions
  const availableFilters = [...new Set(decisions.map((d) => d.type))];

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString();
  };

  const getDecisionConfig = (type) => {
    return (
      decisionTypes[type] || {
        icon: '🤖',
        label: type.replace('_', ' '),
        color: '#6c757d',
      }
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#51cf66';
    if (confidence >= 0.6) return '#ffd43b';
    return '#ff6b6b';
  };

  const getImpactBadge = (impact) => {
    const impacts = {
      high: { color: '#ff6b6b', label: 'High Impact' },
      medium: { color: '#ffd43b', label: 'Medium Impact' },
      low: { color: '#51cf66', label: 'Low Impact' },
    };
    return impacts[impact] || { color: '#6c757d', label: 'Unknown' };
  };

  if (!team?.enableOrchestration) {
    return (
      <div className="orchestrator-panel disabled">
        <div className="panel-header">
          <h3>🤖 Orchestrator Decision Panel</h3>
          <span className="status-badge disabled">Orchestration Disabled</span>
        </div>
        <p className="disabled-message">
          Enable orchestration on the team to see AI decision-making in
          real-time.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`orchestrator-panel ${isExpanded ? 'expanded' : 'collapsed'}`}
    >
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <h3>🤖 Orchestrator Decision Panel</h3>
          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? '🟢 Active' : '🔴 Inactive'}
          </span>
          <span className="decisions-count">
            {filteredDecisions.length} decisions
          </span>
        </div>
        <div className="header-right">
          <span className="expand-toggle">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="panel-content">
          {/* Controls */}
          <div className="panel-controls">
            <div className="filter-section">
              <label>Filter by type:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types ({decisions.length})</option>
                {availableFilters.map((type) => {
                  const config = getDecisionConfig(type);
                  const count = decisions.filter((d) => d.type === type).length;
                  return (
                    <option key={type} value={type}>
                      {config.label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="control-buttons">
              <button
                className={`control-btn ${autoScroll ? 'active' : ''}`}
                onClick={() => setAutoScroll(!autoScroll)}
                title="Auto-scroll to latest decisions"
              >
                📜 Auto-scroll
              </button>
              <button
                className="control-btn"
                onClick={() => setDecisions([])}
                title="Clear all decisions"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Decision Stream */}
          <div className="decisions-container" ref={logContainerRef}>
            {filteredDecisions.length === 0 ? (
              <div className="empty-decisions">
                <p>No orchestrator decisions yet.</p>
                {!isActive && (
                  <p className="empty-hint">
                    Start a workflow to see AI decision-making in action.
                  </p>
                )}
              </div>
            ) : (
              filteredDecisions.map((decision) => {
                const config = getDecisionConfig(decision.type);
                return (
                  <div key={decision.id} className="decision-item">
                    <div className="decision-header">
                      <div className="decision-type">
                        <span
                          className="type-icon"
                          style={{ color: config.color }}
                        >
                          {config.icon}
                        </span>
                        <span className="type-label">{config.label}</span>
                      </div>
                      <div className="decision-meta">
                        <span className="timestamp">
                          {formatTimestamp(decision.timestamp)}
                        </span>
                        {decision.context?.confidence && (
                          <span
                            className="confidence-badge"
                            style={{
                              backgroundColor: getConfidenceColor(
                                decision.context.confidence
                              ),
                            }}
                          >
                            {Math.round(decision.context.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="decision-content">
                      <h4 className="decision-title">{decision.title}</h4>
                      <p className="decision-description">
                        {decision.description}
                      </p>

                      {decision.context && (
                        <div className="decision-context">
                          {decision.context.reasoning && (
                            <div className="context-item">
                              <strong>Reasoning:</strong>
                              <span>{decision.context.reasoning}</span>
                            </div>
                          )}

                          {decision.context.analysis && (
                            <div className="context-item">
                              <strong>Analysis:</strong>
                              <span>{decision.context.analysis}</span>
                            </div>
                          )}

                          {decision.context.recommendation && (
                            <div className="context-item">
                              <strong>Recommendation:</strong>
                              <span>{decision.context.recommendation}</span>
                            </div>
                          )}

                          {decision.context.agent && (
                            <div className="context-item">
                              <strong>Agent:</strong>
                              <span className="agent-name">
                                {decision.context.agent}
                              </span>
                            </div>
                          )}

                          {decision.context.from && decision.context.to && (
                            <div className="context-item">
                              <strong>Assignment Change:</strong>
                              <span>
                                {decision.context.from} → {decision.context.to}
                              </span>
                            </div>
                          )}

                          {decision.context.estimatedTime && (
                            <div className="context-item">
                              <strong>Estimated Time:</strong>
                              <span>{decision.context.estimatedTime}</span>
                            </div>
                          )}

                          {decision.context.dependencies &&
                            decision.context.dependencies.length > 0 && (
                              <div className="context-item">
                                <strong>Dependencies:</strong>
                                <div className="dependencies-list">
                                  {decision.context.dependencies.map(
                                    (dep, index) => (
                                      <span
                                        key={index}
                                        className="dependency-tag"
                                      >
                                        {dep}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {decision.context.impact && (
                            <div className="context-item">
                              <strong>Impact:</strong>
                              <span
                                className="impact-badge"
                                style={{
                                  backgroundColor: getImpactBadge(
                                    decision.context.impact
                                  ).color,
                                }}
                              >
                                {getImpactBadge(decision.context.impact).label}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel Statistics */}
          <div className="panel-stats">
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Total Decisions:</span>
                <span className="stat-value">{decisions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Decision Types:</span>
                <span className="stat-value">{availableFilters.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Confidence:</span>
                <span className="stat-value">
                  {decisions.length > 0
                    ? Math.round(
                        (decisions
                          .filter((d) => d.context?.confidence)
                          .reduce((acc, d) => acc + d.context.confidence, 0) /
                          decisions.filter((d) => d.context?.confidence)
                            .length) *
                          100
                      ) + '%'
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrchestratorDecisionPanel;
