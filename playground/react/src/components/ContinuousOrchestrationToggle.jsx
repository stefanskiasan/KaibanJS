import { useState, useEffect } from 'react';
import './ContinuousOrchestrationToggle.css';

const ContinuousOrchestrationToggle = ({
  team: _team,
  enabled = false,
  onToggle = null,
  disabled = false,
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [showDetails, setShowDetails] = useState(false);
  const [orchestrationStats, setOrchestrationStats] = useState({
    totalOptimizations: 0,
    lastOptimization: null,
    averageInterval: 0,
    tokensUsed: 0,
    effectivenessScore: 0,
  });

  // Mock orchestration statistics (in real implementation, get from team store)
  useEffect(() => {
    if (isEnabled && !disabled) {
      const interval = setInterval(() => {
        setOrchestrationStats((prev) => ({
          totalOptimizations: prev.totalOptimizations + 1,
          lastOptimization: new Date(),
          averageInterval: Math.round(Math.random() * 300 + 120), // 120-420 seconds
          tokensUsed: prev.tokensUsed + Math.round(Math.random() * 150 + 50),
          effectivenessScore: Math.min(0.95, prev.effectivenessScore + 0.02),
        }));
      }, 10000); // Update every 10 seconds for demo

      return () => clearInterval(interval);
    }
  }, [isEnabled, disabled]);

  const handleToggle = () => {
    if (!disabled) {
      const newState = !isEnabled;
      setIsEnabled(newState);
      if (onToggle) {
        onToggle(newState);
      }
    }
  };

  // const formatDuration = (seconds) => {
  //   if (seconds < 60) return `${seconds}s`;
  //   if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  //   return `${Math.round(seconds / 3600)}h`;
  // };

  const getEffectivenessColor = (score) => {
    if (score >= 0.8) return '#51cf66';
    if (score >= 0.6) return '#ffd43b';
    if (score >= 0.4) return '#fd7e14';
    return '#ff6b6b';
  };

  const continuousOrchestrationInfo = {
    benefits: [
      'Real-time workflow optimization',
      'Adaptive task prioritization',
      'Dynamic resource reallocation',
      'Continuous quality improvement',
      'Proactive bottleneck detection',
    ],
    considerations: [
      'Higher LLM token consumption',
      'Increased processing overhead',
      'More frequent task updates',
      'Variable workflow predictability',
    ],
    costImpact: {
      tokenIncrease: '40-60%',
      performanceGain: '25-35%',
      responseTime: '+15-25%',
    },
  };

  return (
    <div className="continuous-orchestration-toggle">
      <div className="toggle-header">
        <div className="toggle-main">
          <div className="toggle-info">
            <h3>🔄 Continuous Orchestration</h3>
            <p className="toggle-description">
              Enable real-time workflow optimization and adaptive task
              management
            </p>
          </div>

          <div className="toggle-controls">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={handleToggle}
                disabled={disabled}
              />
              <span className="slider"></span>
            </label>
            <span
              className={`status-label ${isEnabled ? 'enabled' : 'disabled'}`}
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <button
          className="details-button"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Status Information */}
      <div className="status-info">
        {isEnabled ? (
          <div className="enabled-status">
            <div className="status-grid">
              <div className="status-item">
                <span className="status-icon">⚡</span>
                <div className="status-content">
                  <span className="status-label">Optimizations</span>
                  <span className="status-value">
                    {orchestrationStats.totalOptimizations}
                  </span>
                </div>
              </div>

              <div className="status-item">
                <span className="status-icon">🕐</span>
                <div className="status-content">
                  <span className="status-label">Last Optimization</span>
                  <span className="status-value">
                    {orchestrationStats.lastOptimization
                      ? orchestrationStats.lastOptimization.toLocaleTimeString()
                      : 'None yet'}
                  </span>
                </div>
              </div>

              <div className="status-item">
                <span className="status-icon">📊</span>
                <div className="status-content">
                  <span className="status-label">Effectiveness</span>
                  <span
                    className="status-value"
                    style={{
                      color: getEffectivenessColor(
                        orchestrationStats.effectivenessScore
                      ),
                    }}
                  >
                    {Math.round(orchestrationStats.effectivenessScore * 100)}%
                  </span>
                </div>
              </div>

              <div className="status-item">
                <span className="status-icon">🎯</span>
                <div className="status-content">
                  <span className="status-label">Tokens Used</span>
                  <span className="status-value">
                    {orchestrationStats.tokensUsed.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="disabled-status">
            <div className="disabled-info">
              <span className="disabled-icon">⏸️</span>
              <div className="disabled-text">
                <p>
                  <strong>Orchestration Paused</strong>
                </p>
                <p>
                  Enable continuous orchestration for real-time optimization
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="details-section">
          <div className="details-grid">
            {/* Benefits */}
            <div className="detail-card benefits">
              <h4>✅ Benefits</h4>
              <ul>
                {continuousOrchestrationInfo.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            {/* Considerations */}
            <div className="detail-card considerations">
              <h4>⚠️ Considerations</h4>
              <ul>
                {continuousOrchestrationInfo.considerations.map(
                  (consideration, index) => (
                    <li key={index}>{consideration}</li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Cost Impact */}
          <div className="cost-impact">
            <h4>💰 Performance & Cost Impact</h4>
            <div className="impact-grid">
              <div className="impact-item">
                <span className="impact-label">Token Usage Increase:</span>
                <span className="impact-value increase">
                  +{continuousOrchestrationInfo.costImpact.tokenIncrease}
                </span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Performance Gain:</span>
                <span className="impact-value positive">
                  +{continuousOrchestrationInfo.costImpact.performanceGain}
                </span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Response Time Overhead:</span>
                <span className="impact-value increase">
                  {continuousOrchestrationInfo.costImpact.responseTime}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="configuration-options">
            <h4>⚙️ Configuration</h4>
            <div className="config-grid">
              <div className="config-item">
                <label>Optimization Interval:</label>
                <select disabled={disabled || !isEnabled}>
                  <option value="60">1 minute</option>
                  <option value="300" selected>
                    5 minutes
                  </option>
                  <option value="600">10 minutes</option>
                  <option value="1800">30 minutes</option>
                </select>
              </div>

              <div className="config-item">
                <label>Optimization Sensitivity:</label>
                <select disabled={disabled || !isEnabled}>
                  <option value="conservative">Conservative</option>
                  <option value="balanced" selected>
                    Balanced
                  </option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <div className="config-item">
                <label>Auto-adaptation:</label>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled={disabled || !isEnabled}
                />
                <span>Enable smart interval adjustment</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations">
            <h4>💡 Recommendations</h4>
            <div className="recommendation-list">
              {!isEnabled ? (
                <div className="recommendation-item">
                  <span className="rec-icon">🚀</span>
                  <div className="rec-content">
                    <strong>Enable for Dynamic Projects:</strong>
                    <p>
                      Best suited for projects with evolving requirements and
                      complex workflows
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="recommendation-item">
                    <span className="rec-icon">📈</span>
                    <div className="rec-content">
                      <strong>Monitor Token Usage:</strong>
                      <p>Keep track of LLM costs with frequent optimizations</p>
                    </div>
                  </div>
                  <div className="recommendation-item">
                    <span className="rec-icon">⏱️</span>
                    <div className="rec-content">
                      <strong>Adjust Intervals:</strong>
                      <p>
                        Use longer intervals for stable workflows to reduce
                        overhead
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disabled State Message */}
      {disabled && (
        <div className="disabled-message">
          <p>
            Continuous orchestration requires orchestration to be enabled on the
            team.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContinuousOrchestrationToggle;
