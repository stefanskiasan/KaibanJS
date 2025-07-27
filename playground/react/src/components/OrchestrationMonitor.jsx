import { useState, useEffect, useRef } from 'react';
import './OrchestrationMonitor.css';

const OrchestrationMonitor = ({ team, isActive = false }) => {
  const [metrics, setMetrics] = useState({
    totalDecisions: 0,
    tokensUsed: 0,
    averageResponseTime: 0,
    successRate: 0,
    costEstimate: 0,
    optimizationScore: 0,
    lastActivity: null,
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [realtimeLogs, setRealtimeLogs] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsContainerRef = useRef(null);

  // Simulate real-time orchestration monitoring
  useEffect(() => {
    if (!isActive || !team?.enableOrchestration) return;

    const updateMetrics = () => {
      const timestamp = new Date();

      // Simulate metrics updates
      setMetrics((prev) => ({
        totalDecisions: prev.totalDecisions + Math.floor(Math.random() * 3),
        tokensUsed: prev.tokensUsed + Math.floor(Math.random() * 200 + 50),
        averageResponseTime: Math.round(Math.random() * 500 + 200),
        successRate: Math.min(0.99, prev.successRate + 0.01),
        costEstimate: prev.costEstimate + (Math.random() * 0.05 + 0.01),
        optimizationScore: Math.min(0.95, prev.optimizationScore + 0.02),
        lastActivity: timestamp,
      }));

      // Add performance data point
      setPerformanceHistory((prev) => {
        const newPoint = {
          timestamp,
          tokensPerMinute: Math.floor(Math.random() * 100 + 20),
          responseTimes: Math.round(Math.random() * 300 + 100),
          successRate: Math.random() * 0.2 + 0.8,
          decisions: Math.floor(Math.random() * 5 + 1),
        };
        return [...prev.slice(-29), newPoint]; // Keep last 30 points
      });

      // Add real-time log
      const logTypes = [
        {
          type: 'task_selection',
          message: 'Selected optimal task from repository',
          level: 'info',
        },
        {
          type: 'adaptation',
          message: 'Adapted task parameters based on context',
          level: 'success',
        },
        {
          type: 'generation',
          message: 'Generated new task to fill workflow gap',
          level: 'success',
        },
        {
          type: 'optimization',
          message: 'Optimized resource allocation',
          level: 'info',
        },
        {
          type: 'error',
          message: 'LLM request timeout, retrying...',
          level: 'warning',
        },
        {
          type: 'recovery',
          message: 'Recovered from temporary service disruption',
          level: 'success',
        },
      ];

      const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)];
      setRealtimeLogs((prev) => [
        {
          id: Date.now() + Math.random(),
          timestamp,
          type: randomLog.type,
          message: randomLog.message,
          level: randomLog.level,
          details: {
            tokensUsed: Math.floor(Math.random() * 150 + 25),
            responseTime: Math.round(Math.random() * 200 + 50),
            confidence: Math.random() * 0.3 + 0.7,
          },
        },
        ...prev.slice(0, 49), // Keep last 50 logs
      ]);
    };

    // Initial update
    updateMetrics();

    // Regular updates
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [isActive, team]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0; // Scroll to top for newest logs
    }
  }, [realtimeLogs, autoScroll]);

  const formatCurrency = (amount) => `$${amount.toFixed(4)}`;
  const formatPercentage = (value) => `${Math.round(value * 100)}%`;
  const formatNumber = (value) => value.toLocaleString();
  const formatTime = (timestamp) => timestamp.toLocaleTimeString();

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'success':
        return '#51cf66';
      case 'warning':
        return '#ffd43b';
      case 'error':
        return '#ff6b6b';
      default:
        return '#339af0';
    }
  };

  // const getMetricTrend = (current, previous) => {
  //   if (!previous) return 'neutral';
  //   return current > previous ? 'up' : current < previous ? 'down' : 'neutral';
  // };

  const renderMetricCard = (
    title,
    value,
    icon,
    trend = 'neutral',
    format = 'number'
  ) => {
    let formattedValue = value;
    if (format === 'percentage') formattedValue = formatPercentage(value);
    else if (format === 'currency') formattedValue = formatCurrency(value);
    else if (format === 'number') formattedValue = formatNumber(value);

    const trendColors = {
      up: '#51cf66',
      down: '#ff6b6b',
      neutral: '#6c757d',
    };

    const trendIcons = {
      up: '↗️',
      down: '↘️',
      neutral: '➡️',
    };

    return (
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-icon">{icon}</span>
          <span className="metric-trend" style={{ color: trendColors[trend] }}>
            {trendIcons[trend]}
          </span>
        </div>
        <div className="metric-content">
          <div className="metric-value">{formattedValue}</div>
          <div className="metric-title">{title}</div>
        </div>
      </div>
    );
  };

  const renderPerformanceChart = () => {
    if (performanceHistory.length === 0) return null;

    const maxTokens = Math.max(
      ...performanceHistory.map((p) => p.tokensPerMinute)
    );
    const maxResponseTime = Math.max(
      ...performanceHistory.map((p) => p.responseTimes)
    );

    return (
      <div className="performance-chart">
        <h4>📈 Performance Trends ({selectedTimeframe})</h4>
        <div className="chart-container">
          <div className="chart-grid">
            {performanceHistory.map((point, index) => {
              const tokenHeight = (point.tokensPerMinute / maxTokens) * 100;
              const responseHeight =
                (point.responseTimes / maxResponseTime) * 100;

              return (
                <div key={index} className="chart-bar-group">
                  <div className="chart-bars">
                    <div
                      className="chart-bar tokens"
                      style={{ height: `${tokenHeight}%` }}
                      title={`Tokens: ${point.tokensPerMinute}/min`}
                    />
                    <div
                      className="chart-bar response"
                      style={{ height: `${responseHeight}%` }}
                      title={`Response: ${point.responseTimes}ms`}
                    />
                  </div>
                  <div className="chart-label">
                    {point.timestamp.toLocaleTimeString().slice(0, 5)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color tokens"></div>
              <span>Tokens/min</span>
            </div>
            <div className="legend-item">
              <div className="legend-color response"></div>
              <span>Response Time</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!team?.enableOrchestration) {
    return (
      <div className="orchestration-monitor disabled">
        <div className="monitor-header">
          <h3>📊 Orchestration Monitor</h3>
          <span className="status-badge disabled">Monitoring Disabled</span>
        </div>
        <p className="disabled-message">
          Enable orchestration to monitor AI decision-making performance and
          metrics.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`orchestration-monitor ${
        isExpanded ? 'expanded' : 'collapsed'
      }`}
    >
      <div
        className="monitor-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-left">
          <h3>📊 Orchestration Monitor</h3>
          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? '🟢 Monitoring' : '🔴 Inactive'}
          </span>
          {metrics.lastActivity && (
            <span className="last-update">
              Last: {formatTime(metrics.lastActivity)}
            </span>
          )}
        </div>
        <div className="header-right">
          <span className="expand-toggle">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* Quick Metrics (Always Visible) */}
      <div className="quick-metrics">
        <div className="metric-summary">
          <span className="summary-item">
            <strong>{formatNumber(metrics.totalDecisions)}</strong> decisions
          </span>
          <span className="summary-item">
            <strong>{formatNumber(metrics.tokensUsed)}</strong> tokens
          </span>
          <span className="summary-item">
            <strong>{formatCurrency(metrics.costEstimate)}</strong> cost
          </span>
          <span className="summary-item">
            <strong>{formatPercentage(metrics.successRate)}</strong> success
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="monitor-content">
          {/* Detailed Metrics Grid */}
          <div className="metrics-grid">
            {renderMetricCard('Total Decisions', metrics.totalDecisions, '🎯')}
            {renderMetricCard('Tokens Used', metrics.tokensUsed, '🎫', 'up')}
            {renderMetricCard(
              'Avg Response Time',
              `${metrics.averageResponseTime}ms`,
              '⏱️'
            )}
            {renderMetricCard(
              'Success Rate',
              metrics.successRate,
              '✅',
              'up',
              'percentage'
            )}
            {renderMetricCard(
              'Cost Estimate',
              metrics.costEstimate,
              '💰',
              'up',
              'currency'
            )}
            {renderMetricCard(
              'Optimization Score',
              metrics.optimizationScore,
              '⚡',
              'up',
              'percentage'
            )}
          </div>

          {/* Controls */}
          <div className="monitor-controls">
            <div className="timeframe-selector">
              <label>Timeframe:</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="5m">Last 5 minutes</option>
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
              </select>
            </div>

            <div className="control-buttons">
              <button
                className={`control-btn ${autoScroll ? 'active' : ''}`}
                onClick={() => setAutoScroll(!autoScroll)}
              >
                📜 Auto-scroll
              </button>
              <button
                className="control-btn"
                onClick={() => setRealtimeLogs([])}
              >
                🗑️ Clear Logs
              </button>
            </div>
          </div>

          {/* Performance Chart */}
          {renderPerformanceChart()}

          {/* Real-time Activity Logs */}
          <div className="activity-logs">
            <h4>🔍 Real-time Activity</h4>
            <div className="logs-container" ref={logsContainerRef}>
              {realtimeLogs.length === 0 ? (
                <div className="empty-logs">
                  <p>
                    No activity logs yet. Start a workflow to see real-time
                    monitoring.
                  </p>
                </div>
              ) : (
                realtimeLogs.map((log) => (
                  <div key={log.id} className="log-entry">
                    <div className="log-header">
                      <span
                        className="log-level"
                        style={{ backgroundColor: getLogLevelColor(log.level) }}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="log-type">
                        {log.type.replace('_', ' ')}
                      </span>
                      <span className="log-time">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="log-message">{log.message}</div>
                    {log.details && (
                      <div className="log-details">
                        <span>Tokens: {log.details.tokensUsed}</span>
                        <span>Response: {log.details.responseTime}ms</span>
                        <span>
                          Confidence: {formatPercentage(log.details.confidence)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="system-health">
            <h4>🏥 System Health</h4>
            <div className="health-grid">
              <div className="health-item">
                <span className="health-label">LLM Service:</span>
                <span className="health-status online">🟢 Online</span>
              </div>
              <div className="health-item">
                <span className="health-label">Token Quota:</span>
                <span className="health-status good">🟡 75% Used</span>
              </div>
              <div className="health-item">
                <span className="health-label">Error Rate:</span>
                <span className="health-status good">🟢 &lt;1%</span>
              </div>
              <div className="health-item">
                <span className="health-label">Avg Latency:</span>
                <span className="health-status good">
                  🟢 {metrics.averageResponseTime}ms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrchestrationMonitor;
