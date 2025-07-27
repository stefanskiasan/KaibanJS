import { useState } from 'react';
import './OrchestrationModeSelector.css';

const OrchestrationModeSelector = ({
  team: _team,
  currentMode = 'adaptive',
  onModeChange = null,
  disabled = false,
}) => {
  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [showDetails, setShowDetails] = useState(false);

  // Mode configurations with detailed descriptions
  const modes = {
    conservative: {
      icon: '🛡️',
      label: 'Conservative',
      color: '#6c757d',
      description: 'Minimal risk, strict template adherence',
      characteristics: [
        'Cautious task selection and modification',
        'Strict adherence to existing templates',
        'Limited task generation capabilities',
        'Focus on proven, stable workflows',
        'Suitable for production environments',
      ],
      riskLevel: 'Low',
      adaptability: 'Limited',
      innovation: 'Minimal',
      useCases: [
        'Production systems',
        'Regulated industries',
        'Critical infrastructure',
        'Compliance-heavy projects',
      ],
      performance: {
        speed: 'Fast',
        predictability: 'High',
        resourceUsage: 'Low',
      },
    },
    adaptive: {
      icon: '⚖️',
      label: 'Adaptive',
      color: '#339af0',
      description: 'Balanced approach with moderate flexibility',
      characteristics: [
        'Responsive to context changes',
        'Moderate task adaptation capabilities',
        'Balanced risk-taking approach',
        'Evidence-based decision making',
        'Good for most development projects',
      ],
      riskLevel: 'Medium',
      adaptability: 'Moderate',
      innovation: 'Balanced',
      useCases: [
        'Standard development projects',
        'Established teams',
        'Iterative development',
        'Business applications',
      ],
      performance: {
        speed: 'Balanced',
        predictability: 'Good',
        resourceUsage: 'Medium',
      },
    },
    innovative: {
      icon: '🚀',
      label: 'Innovative',
      color: '#51cf66',
      description: 'Creative exploration with experimental approaches',
      characteristics: [
        'Extensive task generation and adaptation',
        'Experimental workflow strategies',
        'High tolerance for uncertainty',
        'Focus on novel solutions',
        'Ideal for R&D and startups',
      ],
      riskLevel: 'High',
      adaptability: 'Extensive',
      innovation: 'High',
      useCases: [
        'Research & Development',
        'Startup environments',
        'New technology exploration',
        'Creative projects',
      ],
      performance: {
        speed: 'Variable',
        predictability: 'Lower',
        resourceUsage: 'High',
      },
    },
    learning: {
      icon: '🧠',
      label: 'Learning',
      color: '#845ef7',
      description: 'Continuous improvement through experimentation',
      characteristics: [
        'Learns from workflow outcomes',
        'Iterative strategy refinement',
        'Experimental task variations',
        'Long-term optimization focus',
        'Self-improving capabilities',
      ],
      riskLevel: 'High',
      adaptability: 'Evolving',
      innovation: 'Experimental',
      useCases: [
        'Skill development projects',
        'Prototyping phases',
        'Innovation labs',
        'Continuous improvement',
      ],
      performance: {
        speed: 'Slow initially',
        predictability: 'Variable',
        resourceUsage: 'High',
      },
    },
  };

  const handleModeChange = (newMode) => {
    setSelectedMode(newMode);
    if (onModeChange && !disabled) {
      onModeChange(newMode);
    }
  };

  const getCurrentModeConfig = () => {
    return modes[selectedMode] || modes.adaptive;
  };

  return (
    <div className="orchestration-mode-selector">
      <div className="mode-selector-header">
        <h3>⚙️ Orchestration Mode</h3>
        <button
          className="details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Current Mode Display */}
      <div className="current-mode-display">
        <div className="current-mode-info">
          <span
            className="mode-icon"
            style={{ color: getCurrentModeConfig().color }}
          >
            {getCurrentModeConfig().icon}
          </span>
          <div className="mode-text">
            <h4>{getCurrentModeConfig().label}</h4>
            <p>{getCurrentModeConfig().description}</p>
          </div>
        </div>

        {!disabled && (
          <div className="mode-metrics">
            <div className="metric">
              <span className="metric-label">Risk:</span>
              <span
                className={`metric-value risk-${getCurrentModeConfig().riskLevel.toLowerCase()}`}
              >
                {getCurrentModeConfig().riskLevel}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Adaptability:</span>
              <span className="metric-value">
                {getCurrentModeConfig().adaptability}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Innovation:</span>
              <span className="metric-value">
                {getCurrentModeConfig().innovation}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selection Buttons */}
      {!disabled && (
        <div className="mode-selection-grid">
          {Object.entries(modes).map(([modeKey, modeConfig]) => (
            <button
              key={modeKey}
              className={`mode-button ${
                selectedMode === modeKey ? 'selected' : ''
              }`}
              onClick={() => handleModeChange(modeKey)}
              style={{
                borderColor:
                  selectedMode === modeKey ? modeConfig.color : '#dee2e6',
                backgroundColor:
                  selectedMode === modeKey ? `${modeConfig.color}15` : 'white',
              }}
            >
              <div className="mode-button-header">
                <span
                  className="mode-button-icon"
                  style={{ color: modeConfig.color }}
                >
                  {modeConfig.icon}
                </span>
                <span className="mode-button-label">{modeConfig.label}</span>
              </div>
              <p className="mode-button-description">
                {modeConfig.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Detailed Mode Information */}
      {showDetails && (
        <div className="mode-details">
          <div className="mode-details-grid">
            {Object.entries(modes).map(([modeKey, modeConfig]) => (
              <div
                key={modeKey}
                className={`mode-detail-card ${
                  selectedMode === modeKey ? 'active' : ''
                }`}
              >
                <div className="mode-detail-header">
                  <span
                    className="detail-icon"
                    style={{ color: modeConfig.color }}
                  >
                    {modeConfig.icon}
                  </span>
                  <h4>{modeConfig.label} Mode</h4>
                </div>

                <div className="mode-detail-content">
                  <div className="detail-section">
                    <h5>Key Characteristics</h5>
                    <ul>
                      {modeConfig.characteristics.map((char, index) => (
                        <li key={index}>{char}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h5>Performance Profile</h5>
                    <div className="performance-metrics">
                      <div className="perf-metric">
                        <span>Speed:</span>
                        <span>{modeConfig.performance.speed}</span>
                      </div>
                      <div className="perf-metric">
                        <span>Predictability:</span>
                        <span>{modeConfig.performance.predictability}</span>
                      </div>
                      <div className="perf-metric">
                        <span>Resource Usage:</span>
                        <span>{modeConfig.performance.resourceUsage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Best Use Cases</h5>
                    <ul className="use-cases">
                      {modeConfig.useCases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Comparison Chart */}
      {showDetails && (
        <div className="mode-comparison">
          <h4>📊 Mode Comparison</h4>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Risk Level</th>
                  <th>Adaptability</th>
                  <th>Innovation</th>
                  <th>Speed</th>
                  <th>Predictability</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(modes).map(([modeKey, modeConfig]) => (
                  <tr
                    key={modeKey}
                    className={selectedMode === modeKey ? 'selected-row' : ''}
                  >
                    <td>
                      <span style={{ color: modeConfig.color }}>
                        {modeConfig.icon} {modeConfig.label}
                      </span>
                    </td>
                    <td
                      className={`risk-${modeConfig.riskLevel.toLowerCase()}`}
                    >
                      {modeConfig.riskLevel}
                    </td>
                    <td>{modeConfig.adaptability}</td>
                    <td>{modeConfig.innovation}</td>
                    <td>{modeConfig.performance.speed}</td>
                    <td>{modeConfig.performance.predictability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disabled State Message */}
      {disabled && (
        <div className="disabled-message">
          <p>Mode selection is disabled when orchestration is not enabled.</p>
        </div>
      )}
    </div>
  );
};

export default OrchestrationModeSelector;
