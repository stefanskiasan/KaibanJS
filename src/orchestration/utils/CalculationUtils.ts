import { Task, Agent } from '../../index';
import { TASK_STATUS_enum } from '../../utils/enums';

/**
 * Utility functions for various calculations
 */
export class CalculationUtils {
  /**
   * Calculate recency weight for performance scores
   */
  static calculateRecencyWeight(lastUpdated: number): number {
    const daysSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate < 1) return 1.0; // Today
    if (daysSinceUpdate < 7) return 0.9; // This week
    if (daysSinceUpdate < 30) return 0.7; // This month
    if (daysSinceUpdate < 90) return 0.5; // This quarter
    return 0.3; // Older data
  }

  /**
   * Calculate agent affinity for certain task types
   */
  static calculateAgentAffinityScore(agent: Agent, task: Task): number {
    // Simple affinity based on role matching task description
    const roleKeywords = (agent.role || '').toLowerCase().split(/[\s,]+/);
    const taskKeywords = (task.description || '').toLowerCase().split(/[\s,]+/);

    const matchingKeywords = roleKeywords.filter((keyword) =>
      taskKeywords.includes(keyword)
    );

    // Return a score between 0 and 1 based on keyword matches
    return Math.min(1, matchingKeywords.length / Math.max(roleKeywords.length, 1));
  }

  /**
   * Calculate agent performance score based on historical data
   */
  static calculateAgentPerformanceScore(
    agent: Agent,
    completedTasks: Task[]
  ): number {
    // Calculate based on task completion history
    const agentTasks = completedTasks.filter(
      (task) => task.agent?.id === agent.id && task.status === TASK_STATUS_enum.DONE
    );

    if (agentTasks.length === 0) {
      return 50; // Default score for agents with no history
    }

    const successfulTasks = agentTasks.filter(
      (task) => task.result && (task.result as any).success
    );

    const successRate = (successfulTasks.length / agentTasks.length) * 100;

    // Factor in completion time performance
    const avgCompletionTime = agentTasks.reduce(
      (sum, task) => sum + (task.duration || 0),
      0
    ) / agentTasks.length;

    // Normalize completion time score (assuming 2 hours is average)
    const timeScore = Math.max(0, 100 - (avgCompletionTime / 7200000) * 50);

    // Combine success rate and time score
    return (successRate * 0.7 + timeScore * 0.3);
  }

  /**
   * Calculate overall agent score for task assignment
   */
  static calculateAgentScore(
    agent: Agent,
    task: Task,
    context: {
      workloadScore: number;
      skillMatchScore: number;
      performanceScore: number;
      affinityScore: number;
    }
  ): number {
    // Weighted combination of different factors
    const weights = {
      workload: 0.3, // 30% - Current workload
      skills: 0.3, // 30% - Skill match
      performance: 0.25, // 25% - Historical performance
      affinity: 0.15, // 15% - Task type affinity
    };

    const score =
      context.workloadScore * weights.workload +
      context.skillMatchScore * weights.skills +
      context.performanceScore * weights.performance +
      context.affinityScore * weights.affinity;

    return Math.round(score);
  }

  /**
   * Calculate task complexity based on various factors
   */
  static calculateTaskComplexity(task: Task): number {
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
      const hours = this.parseEstimatedTimeToHours(task.resourceRequirements.estimatedTime);
      if (hours > 8) complexity += 2;
      if (hours > 24) complexity += 2;
    }

    // Factor in skill requirements
    if (task.resourceRequirements?.skillsRequired) {
      complexity += task.resourceRequirements.skillsRequired.length * 0.2;
    }

    return Math.min(10, Math.max(1, Math.round(complexity)));
  }

  /**
   * Parse estimated time to hours (helper method)
   */
  private static parseEstimatedTimeToHours(estimatedTime: string): number {
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
   * Calculate variance for a set of numbers
   */
  static calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calculate standard deviation
   */
  static calculateStandardDeviation(numbers: number[]): number {
    return Math.sqrt(this.calculateVariance(numbers));
  }

  /**
   * Calculate percentile
   */
  static calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}
