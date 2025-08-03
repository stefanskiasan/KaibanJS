import { Task, Team } from '../../index';
import { OrchestrationMetrics, MetricTrend } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';

/**
 * Analyzes performance metrics and patterns
 */
export class PerformanceAnalyzer {
  constructor(private team: Team) {}

  /**
   * Analyze metric trends to identify patterns
   */
  analyzeMetricTrends(metrics: OrchestrationMetrics): MetricTrend[] {
    logger.info('📈 Analyzing metric trends for performance optimization');

    const trends: MetricTrend[] = [];

    // Task completion time trend
    if (metrics.avgTaskCompletionTime > 0) {
      const completionTimeTrend = this.analyzeCompletionTimeTrend(metrics);
      if (completionTimeTrend) trends.push(completionTimeTrend);
    }

    // Success rate trend
    if (metrics.successRate !== null) {
      const successRateTrend = this.analyzeSuccessRateTrend(metrics);
      if (successRateTrend) trends.push(successRateTrend);
    }

    // Agent performance trend
    const agentTrends = this.analyzeAgentPerformanceTrends(metrics);
    trends.push(...agentTrends);

    // Complexity trends
    const complexityTrends = this.analyzeComplexityTrends(metrics);
    trends.push(...complexityTrends);

    // Orchestration efficiency trend
    const efficiencyTrend = this.analyzeOrchestrationEfficiency(metrics);
    if (efficiencyTrend) trends.push(efficiencyTrend);

    return trends;
  }

  /**
   * Analyze task completion time trends
   */
  private analyzeCompletionTimeTrend(
    metrics: OrchestrationMetrics
  ): MetricTrend | null {
    if (!metrics.completionTimeHistory || metrics.completionTimeHistory.length < 3) {
      return null;
    }

    const history = metrics.completionTimeHistory.slice(-5); // Last 5 data points
    const recentAvg = history.slice(-2).reduce((a: number, b: number) => a + b, 0) / 2;
    const previousAvg = history.slice(0, 2).reduce((a: number, b: number) => a + b, 0) / 2;

    const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;

    return {
      metric: 'completion_time',
      direction: changePercent > 10 ? 'increasing' : changePercent < -10 ? 'decreasing' : 'stable',
      confidence: Math.min(0.9, history.length / 10),
      impact: Math.abs(changePercent) > 30 ? 'high' : 'medium',
      recommendation:
        changePercent > 20
          ? 'Task completion times are increasing. Consider workload rebalancing or resource optimization.'
          : changePercent < -20
          ? 'Excellent! Task completion times are improving.'
          : 'Task completion times are stable.',
    };
  }

  /**
   * Analyze success rate trends
   */
  private analyzeSuccessRateTrend(
    metrics: OrchestrationMetrics
  ): MetricTrend | null {
    if (!metrics.successRateHistory || metrics.successRateHistory.length < 3) {
      return null;
    }

    const history = metrics.successRateHistory.slice(-5);
    const recentAvg = history.slice(-2).reduce((a: number, b: number) => a + b, 0) / 2;
    const previousAvg = history.slice(0, 2).reduce((a: number, b: number) => a + b, 0) / 2;

    const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;

    return {
      metric: 'success_rate',
      direction: changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable',
      confidence: Math.min(0.85, history.length / 10),
      impact: (metrics.successRate || 0) < 70 ? 'high' : 'medium',
      recommendation:
        (metrics.successRate || 0) < 70
          ? 'Low success rate detected. Review failed tasks and consider task complexity reduction.'
          : (metrics.successRate || 0) > 90
          ? 'Excellent success rate maintained!'
          : 'Success rate is acceptable but has room for improvement.',
    };
  }

  /**
   * Analyze agent performance trends
   */
  private analyzeAgentPerformanceTrends(
    metrics: OrchestrationMetrics
  ): MetricTrend[] {
    const trends: MetricTrend[] = [];

    if (!metrics.agentPerformance || Object.keys(metrics.agentPerformance).length === 0) {
      return trends;
    }

    // Find underperforming agents
    const underperformers = Object.entries(metrics.agentPerformance)
      .filter(([_, perf]) => perf.successRate < 60)
      .map(([agentId]) => agentId);

    if (underperformers.length > 0) {
      trends.push({
        metric: 'agent_performance',
        direction: 'decreasing',
        confidence: 0.8,
        impact: 'high',
        recommendation: `Agents ${underperformers.join(
          ', '
        )} have low success rates. Consider skill reassignment or additional training.`,
      });
    }

    // Find overloaded agents
    const overloaded = Object.entries(metrics.agentPerformance)
      .filter(([_, perf]) => perf.tasksCompleted > 10 && perf.avgCompletionTime > 5000)
      .map(([agentId]) => agentId);

    if (overloaded.length > 0) {
      trends.push({
        metric: 'agent_workload',
        direction: 'increasing',
        confidence: 0.75,
        impact: 'medium',
        recommendation: `Agents ${overloaded.join(
          ', '
        )} appear overloaded. Consider load balancing.`,
      });
    }

    return trends;
  }

  /**
   * Analyze task complexity trends
   */
  private analyzeComplexityTrends(
    metrics: OrchestrationMetrics
  ): MetricTrend[] {
    const trends: MetricTrend[] = [];

    if (!metrics.complexityMetrics) {
      return trends;
    }

    const { averageComplexity, complexityDistribution, complexitySuccessCorrelation } = metrics.complexityMetrics;

    // High complexity warning
    if (averageComplexity > 7) {
      trends.push({
        metric: 'task_complexity',
        direction: 'increasing',
        confidence: 0.85,
        impact: 'high',
        recommendation:
          'Average task complexity is high. Consider breaking down complex tasks into smaller subtasks.',
      });
    }

    // Complexity imbalance
    const highComplexityRatio = (complexityDistribution.high / (complexityDistribution.low + complexityDistribution.medium + complexityDistribution.high)) || 0;
    if (highComplexityRatio > 0.4) {
      trends.push({
        metric: 'complexity_distribution',
        direction: 'stable',
        confidence: 0.8,
        impact: 'medium',
        recommendation:
          'High ratio of complex tasks. Balance workload with simpler tasks for better flow.',
      });
    }

    // Complexity-success correlation
    if (complexitySuccessCorrelation < -0.5) {
      trends.push({
        metric: 'complexity_success_correlation',
        direction: 'decreasing',
        confidence: 0.9,
        impact: 'high',
        recommendation:
          'Strong negative correlation between complexity and success. Focus on simplifying high-complexity tasks.',
      });
    }

    return trends;
  }

  /**
   * Analyze orchestration efficiency
   */
  private analyzeOrchestrationEfficiency(
    metrics: OrchestrationMetrics
  ): MetricTrend | null {
    if (!metrics.orchestrationOptimizations) {
      return null;
    }

    const { tasksAdapted, tasksGenerated, resourceOptimizations } = metrics.orchestrationOptimizations;
    const totalOptimizations = tasksAdapted + tasksGenerated + resourceOptimizations;

    if (totalOptimizations === 0) {
      return {
        metric: 'orchestration_efficiency',
        direction: 'stable',
        confidence: 0.7,
        impact: 'low',
        recommendation:
          'Orchestration is not actively optimizing. Consider enabling more adaptive features.',
      };
    }

    const efficiency = (metrics.successRate || 0) / Math.max(1, totalOptimizations) * 100;

    return {
      metric: 'orchestration_efficiency',
      direction: efficiency > 50 ? 'increasing' : 'decreasing',
      confidence: 0.8,
      impact: efficiency < 30 ? 'high' : 'medium',
      recommendation:
        efficiency > 70
          ? 'Orchestration is highly efficient!'
          : efficiency > 40
          ? 'Orchestration efficiency is acceptable.'
          : 'Low orchestration efficiency. Review optimization strategies.',
    };
  }

  /**
   * Identify performance patterns for optimization
   */
  identifyPerformancePatterns(metrics: OrchestrationMetrics): string[] {
    const patterns: string[] = [];

    // Pattern 1: Task completion time variations
    if (metrics.completionTimeHistory && metrics.completionTimeHistory.length > 5) {
      const variance = this.calculateVariance(metrics.completionTimeHistory);
      if (variance > 1000) {
        patterns.push('high_completion_time_variance');
      }
    }

    // Pattern 2: Agent specialization effectiveness
    if (metrics.agentPerformance) {
      const specializationPattern = this.detectAgentSpecializationPattern(metrics);
      if (specializationPattern) {
        patterns.push(specializationPattern);
      }
    }

    // Pattern 3: Time-based performance variations
    const timePattern = this.detectTimeBasedPattern(metrics);
    if (timePattern) {
      patterns.push(timePattern);
    }

    // Pattern 4: Complexity handling patterns
    const complexityPattern = this.detectComplexityPattern(metrics);
    if (complexityPattern) {
      patterns.push(complexityPattern);
    }

    // Pattern 5: Resource utilization patterns
    const utilizationPattern = this.detectUtilizationPattern(metrics);
    if (utilizationPattern) {
      patterns.push(utilizationPattern);
    }

    logger.info(`🔍 Identified ${patterns.length} performance patterns`);
    return patterns;
  }

  /**
   * Calculate variance for a set of numbers
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a: number, b: number) => a + b, 0) / numbers.length;
  }

  /**
   * Detect agent specialization patterns
   */
  private detectAgentSpecializationPattern(
    metrics: OrchestrationMetrics
  ): string | null {
    if (!metrics.agentPerformance) return null;

    const performances = Object.values(metrics.agentPerformance);
    const avgSuccessRate =
      performances.reduce((sum, p: any) => sum + p.successRate, 0) / performances.length;

    const highPerformers = performances.filter((p: any) => p.successRate > avgSuccessRate + 20);
    const lowPerformers = performances.filter((p: any) => p.successRate < avgSuccessRate - 20);

    if (highPerformers.length > 0 && lowPerformers.length > 0) {
      return 'agent_performance_disparity';
    }

    if (performances.every((p: any) => Math.abs(p.successRate - avgSuccessRate) < 10)) {
      return 'uniform_agent_performance';
    }

    return null;
  }

  /**
   * Detect time-based performance patterns
   */
  private detectTimeBasedPattern(metrics: OrchestrationMetrics): string | null {
    if (!metrics.completionTimeHistory || metrics.completionTimeHistory.length < 10) {
      return null;
    }

    // Check for progressive improvement
    const firstHalf = metrics.completionTimeHistory.slice(
      0,
      Math.floor(metrics.completionTimeHistory.length / 2)
    );
    const secondHalf = metrics.completionTimeHistory.slice(
      Math.floor(metrics.completionTimeHistory.length / 2)
    );

    const firstAvg = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;

    if (secondAvg < firstAvg * 0.8) {
      return 'progressive_performance_improvement';
    }

    if (secondAvg > firstAvg * 1.2) {
      return 'performance_degradation';
    }

    return null;
  }

  /**
   * Detect complexity handling patterns
   */
  private detectComplexityPattern(metrics: OrchestrationMetrics): string | null {
    if (!metrics.complexityMetrics) return null;

    const { complexitySuccessCorrelation, complexityDistribution } = metrics.complexityMetrics;

    // Strong negative correlation
    if (complexitySuccessCorrelation < -0.7) {
      return 'complexity_averse';
    }

    // Positive correlation (team handles complexity well)
    if (complexitySuccessCorrelation > 0.3) {
      return 'complexity_resilient';
    }

    // Skewed distribution
    const total = complexityDistribution.low + complexityDistribution.medium + complexityDistribution.high;
    if (total > 0) {
      if (complexityDistribution.high / total > 0.5) {
        return 'high_complexity_focus';
      }
      if (complexityDistribution.low / total > 0.6) {
        return 'low_complexity_preference';
      }
    }

    return null;
  }

  /**
   * Detect resource utilization patterns
   */
  private detectUtilizationPattern(metrics: OrchestrationMetrics): string | null {
    if (!metrics.agentPerformance) return null;

    const utilizationRates = Object.values(metrics.agentPerformance).map(
      (p: any) => p.tasksCompleted
    );

    if (utilizationRates.length === 0) return null;

    const maxUtilization = Math.max(...utilizationRates);
    const minUtilization = Math.min(...utilizationRates);
    const avgUtilization = utilizationRates.reduce((a: number, b: number) => a + b, 0) / utilizationRates.length;

    // Imbalanced utilization
    if (maxUtilization > avgUtilization * 2 && minUtilization < avgUtilization * 0.5) {
      return 'imbalanced_resource_utilization';
    }

    // Underutilization
    if (avgUtilization < 2 && metrics.totalTasks > 10) {
      return 'resource_underutilization';
    }

    // Overutilization
    if (avgUtilization > 10) {
      return 'resource_overutilization';
    }

    return null;
  }

  /**
   * Analyze complexity-success pattern for specific recommendations
   */
  analyzeComplexitySuccessPattern(completedTasks: Task[]): {
    pattern: string;
    recommendation: string;
  } {
    // Group tasks by complexity and calculate success rates
    const complexityGroups = this.groupTasksByComplexity(completedTasks);
    const successRates = this.calculateSuccessRatesByComplexity(complexityGroups);

    // Identify pattern
    if (successRates.high < 50 && successRates.low > 80) {
      return {
        pattern: 'complexity_challenge',
        recommendation:
          'Team struggles with complex tasks. Consider breaking them down or assigning to specialized agents.',
      };
    }

    if (successRates.high > 85 && successRates.medium > 85 && successRates.low > 85) {
      return {
        pattern: 'uniform_excellence',
        recommendation:
          'Team handles all complexity levels well. Consider taking on more challenging tasks.',
      };
    }

    if (successRates.medium < successRates.low && successRates.medium < successRates.high) {
      return {
        pattern: 'medium_complexity_gap',
        recommendation:
          'Medium complexity tasks have lower success rates. Review task estimation and agent assignment.',
      };
    }

    return {
      pattern: 'normal_distribution',
      recommendation: 'Task complexity handling follows expected patterns.',
    };
  }

  /**
   * Group tasks by complexity level
   */
  private groupTasksByComplexity(
    tasks: Task[]
  ): { low: Task[]; medium: Task[]; high: Task[] } {
    const groups = { low: [] as Task[], medium: [] as Task[], high: [] as Task[] };

    tasks.forEach((task) => {
      // Estimate complexity based on various factors
      const complexity = this.estimateTaskComplexity(task);
      if (complexity <= 3) groups.low.push(task);
      else if (complexity <= 7) groups.medium.push(task);
      else groups.high.push(task);
    });

    return groups;
  }

  /**
   * Estimate task complexity
   */
  private estimateTaskComplexity(task: Task): number {
    let complexity = 5; // Base complexity

    // Factor in dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      complexity += task.dependencies.length * 0.5;
    }

    // Factor in description length (proxy for task complexity)
    const descriptionWords = task.description.split(' ').length;
    if (descriptionWords > 50) complexity += 2;
    if (descriptionWords > 100) complexity += 2;

    // Factor in quality gates
    if (task.qualityGates && task.qualityGates.length > 0) {
      complexity += task.qualityGates.length * 0.3;
    }

    // Factor in estimated time
    if (task.resourceRequirements?.estimatedTime) {
      const hours = this.parseEstimatedTime(task.resourceRequirements.estimatedTime);
      if (hours > 8) complexity += 2;
      if (hours > 24) complexity += 2;
    }

    return Math.min(10, Math.max(1, Math.round(complexity)));
  }

  /**
   * Parse estimated time string to hours
   */
  private parseEstimatedTime(estimatedTime: string): number {
    const match = estimatedTime.match(/(\d+)\s*(hours?|days?|minutes?)/i);
    if (!match) return 2;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'minute':
      case 'minutes':
        return value / 60;
      case 'hour':
      case 'hours':
        return value;
      case 'day':
      case 'days':
        return value * 8;
      default:
        return 2;
    }
  }

  /**
   * Calculate success rates by complexity
   */
  private calculateSuccessRatesByComplexity(complexityGroups: {
    low: Task[];
    medium: Task[];
    high: Task[];
  }): { low: number; medium: number; high: number } {
    const calculateRate = (tasks: Task[]) => {
      if (tasks.length === 0) return 100;
      const successful = tasks.filter((t) => t.status === 'DONE' && (t.result as any)?.success).length;
      return (successful / tasks.length) * 100;
    };

    return {
      low: calculateRate(complexityGroups.low),
      medium: calculateRate(complexityGroups.medium),
      high: calculateRate(complexityGroups.high),
    };
  }

  /**
   * Analyze agent utilization patterns
   */
  analyzeAgentUtilizationPattern(activeTasks: Task[]): {
    pattern: string;
    recommendation: string;
  } {
    const agentTaskCount = new Map<string, number>();

    activeTasks.forEach((task) => {
      if (task.agent) {
        const agentId = task.agent.id;
        agentTaskCount.set(agentId, (agentTaskCount.get(agentId) || 0) + 1);
      }
    });

    const counts = Array.from(agentTaskCount.values());
    if (counts.length === 0) {
      return {
        pattern: 'no_active_tasks',
        recommendation: 'No active tasks. System is idle.',
      };
    }

    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const avg = counts.reduce((a: number, b: number) => a + b, 0) / counts.length;

    if (max > avg * 2) {
      return {
        pattern: 'agent_overload',
        recommendation:
          'Some agents are overloaded. Consider redistributing tasks for better balance.',
      };
    }

    if (min === 0 && counts.length > 1) {
      return {
        pattern: 'idle_agents',
        recommendation: 'Some agents are idle. Optimize task distribution.',
      };
    }

    if (Math.abs(max - min) <= 1) {
      return {
        pattern: 'balanced_distribution',
        recommendation: 'Agent workload is well balanced.',
      };
    }

    return {
      pattern: 'moderate_imbalance',
      recommendation: 'Minor workload imbalance detected. Monitor for optimization opportunities.',
    };
  }

  /**
   * Analyze time-based performance patterns
   */
  analyzeTimeBasedPerformance(metrics: OrchestrationMetrics): {
    pattern: string;
    timeOfDay?: string;
    recommendation: string;
  } {
    // This is a simplified implementation
    // In a real system, you would analyze actual timestamps

    if (!metrics.completionTimeHistory || metrics.completionTimeHistory.length < 10) {
      return {
        pattern: 'insufficient_data',
        recommendation: 'Not enough data to analyze time-based patterns.',
      };
    }

    // Analyze completion time variations
    const times = metrics.completionTimeHistory;
    const avgTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    const variance = this.calculateVariance(times);

    if (variance > avgTime * 0.5) {
      return {
        pattern: 'high_time_variance',
        recommendation:
          'Task completion times vary significantly. Investigate causes of inconsistency.',
      };
    }

    // Check for trends
    const firstQuarter = times.slice(0, Math.floor(times.length / 4));
    const lastQuarter = times.slice(-Math.floor(times.length / 4));
    const firstAvg = firstQuarter.reduce((a: number, b: number) => a + b, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((a: number, b: number) => a + b, 0) / lastQuarter.length;

    if (lastAvg < firstAvg * 0.7) {
      return {
        pattern: 'improving_performance',
        recommendation: 'Performance is improving over time. Continue current practices.',
      };
    }

    if (lastAvg > firstAvg * 1.3) {
      return {
        pattern: 'degrading_performance',
        recommendation:
          'Performance is degrading. Review recent changes and system resources.',
      };
    }

    return {
      pattern: 'stable_performance',
      recommendation: 'Performance is stable over time.',
    };
  }
}
