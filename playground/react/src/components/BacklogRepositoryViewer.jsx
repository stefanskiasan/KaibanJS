import { useState, useMemo } from 'react';
import './BacklogRepositoryViewer.css';

const BacklogRepositoryViewer = ({
  team,
  onTaskSelect = null,
  onAddToWorkflow = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [expandedTask, setExpandedTask] = useState(null);

  // Get available backlog tasks from team
  const backlogTasks = team?.backlogTasks || [];

  // Extract unique categories and complexities
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    backlogTasks.forEach((task) => {
      if (task.category) cats.add(task.category);
    });
    return Array.from(cats);
  }, [backlogTasks]);

  const complexities = useMemo(() => {
    const complexes = new Set(['all']);
    backlogTasks.forEach((task) => {
      if (task.complexity) complexes.add(task.complexity);
      if (task.resourceRequirements?.complexity) {
        complexes.add(task.resourceRequirements.complexity);
      }
    });
    return Array.from(complexes);
  }, [backlogTasks]);

  // Filter backlog tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return backlogTasks.filter((task) => {
      const matchesSearch =
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.expectedOutput?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || task.category === selectedCategory;
      const taskComplexity =
        task.complexity || task.resourceRequirements?.complexity || 'unknown';
      const matchesComplexity =
        selectedComplexity === 'all' || taskComplexity === selectedComplexity;

      return matchesSearch && matchesCategory && matchesComplexity;
    });
  }, [backlogTasks, searchTerm, selectedCategory, selectedComplexity]);

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

  const getSkillsBadges = (skills) => {
    if (!skills || !Array.isArray(skills)) return null;
    return skills.map((skill, index) => (
      <span key={index} className="skill-badge">
        {skill}
      </span>
    ));
  };

  const formatEstimatedTime = (time) => {
    if (!time) return 'Not specified';
    return time;
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <div className="backlog-repository-viewer">
      <div className="repository-header">
        <h3>📚 Backlog Repository</h3>
        <p className="repository-subtitle">
          {backlogTasks.length} available backlog tasks
        </p>
      </div>

      {/* Filters and Search */}
      <div className="repository-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedComplexity}
            onChange={(e) => setSelectedComplexity(e.target.value)}
            className="filter-select"
          >
            {complexities.map((comp) => (
              <option key={comp} value={comp}>
                {comp === 'all' ? 'All Complexities' : comp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {filteredTasks.length} of {backlogTasks.length} tasks
        </span>
        {(searchTerm ||
          selectedCategory !== 'all' ||
          selectedComplexity !== 'all') && (
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedComplexity('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Backlog Tasks List */}
      <div className="backlog-tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No backlog tasks found matching your criteria.</p>
            {backlogTasks.length === 0 && (
              <p className="empty-hint">
                Enable orchestration and add backlog tasks to the team to see
                them here.
              </p>
            )}
          </div>
        ) : (
          filteredTasks.map((task, index) => {
            const taskId = task.id || `task-${index}`;
            const isExpanded = expandedTask === taskId;
            const complexity =
              task.complexity ||
              task.resourceRequirements?.complexity ||
              'unknown';
            const estimatedTime = task.resourceRequirements?.estimatedTime;
            const skillsRequired =
              task.resourceRequirements?.skillsRequired || [];
            const dependencies = task.resourceRequirements?.dependencies || [];

            return (
              <div key={taskId} className="backlog-task-card">
                <div
                  className="task-header"
                  onClick={() => toggleTaskExpansion(taskId)}
                >
                  <div className="task-title-section">
                    <h4 className="task-title">{task.description}</h4>
                    {task.category && (
                      <span className="task-category">{task.category}</span>
                    )}
                  </div>

                  <div className="task-metadata">
                    <span
                      className="complexity-badge"
                      style={{
                        backgroundColor: getComplexityColor(complexity),
                      }}
                    >
                      {complexity}
                    </span>
                    <span className="expand-indicator">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="task-details">
                    {task.expectedOutput && (
                      <div className="detail-section">
                        <strong>Expected Output:</strong>
                        <p>{task.expectedOutput}</p>
                      </div>
                    )}

                    {task.agent && (
                      <div className="detail-section">
                        <strong>Assigned Agent:</strong>
                        <span className="agent-name">
                          {task.agent.name} ({task.agent.role})
                        </span>
                      </div>
                    )}

                    {estimatedTime && (
                      <div className="detail-section">
                        <strong>Estimated Time:</strong>
                        <span>{formatEstimatedTime(estimatedTime)}</span>
                      </div>
                    )}

                    {skillsRequired.length > 0 && (
                      <div className="detail-section">
                        <strong>Required Skills:</strong>
                        <div className="skills-container">
                          {getSkillsBadges(skillsRequired)}
                        </div>
                      </div>
                    )}

                    {dependencies.length > 0 && (
                      <div className="detail-section">
                        <strong>Dependencies:</strong>
                        <div className="dependencies-container">
                          {dependencies.map((dep, depIndex) => (
                            <span key={depIndex} className="dependency-badge">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.adaptable !== undefined && (
                      <div className="detail-section">
                        <strong>Adaptable:</strong>
                        <span
                          className={`adaptable-status ${
                            task.adaptable ? 'adaptable' : 'fixed'
                          }`}
                        >
                          {task.adaptable ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                    )}

                    {task.orchestrationRules && (
                      <div className="detail-section">
                        <strong>Orchestration Rules:</strong>
                        <div className="orchestration-rules">
                          {task.orchestrationRules}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="task-actions">
                      {onTaskSelect && (
                        <button
                          className="action-btn select-btn"
                          onClick={() => onTaskSelect(task)}
                        >
                          🔍 View Details
                        </button>
                      )}
                      {onAddToWorkflow && (
                        <button
                          className="action-btn add-btn"
                          onClick={() => onAddToWorkflow(task)}
                        >
                          ➕ Add to Workflow
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Repository Statistics */}
      <div className="repository-stats">
        <h4>📊 Repository Statistics</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Backlog Tasks:</span>
            <span className="stat-value">{backlogTasks.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Categories:</span>
            <span className="stat-value">{categories.length - 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Complexity Levels:</span>
            <span className="stat-value">{complexities.length - 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Adaptable Tasks:</span>
            <span className="stat-value">
              {backlogTasks.filter((t) => t.adaptable).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogRepositoryViewer;
