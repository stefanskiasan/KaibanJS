import { Task, Agent } from '../../index';
import { TaskRecommendation } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';

/**
 * Analyzes tasks and provides recommendations
 */
export class TaskAnalyzer {
  constructor(
    private extractAgentSkills: (agent: Agent) => string[],
    private extractTaskComplexity: (task: Task) => number
  ) {}

  /**
   * Select optimal agent for a task
   */
  selectOptimalAgent(
    task: Task,
    availableAgents: Agent[],
    existingTasks: Task[]
  ): Agent | null {
    logger.info(`🎯 Selecting optimal agent for task: ${task.title}`);

    // If task already has an agent assigned, validate it's available
    if (task.agent) {
      const assignedAgentAvailable = availableAgents.find(a => a.id === task.agent.id);
      if (assignedAgentAvailable) {
        logger.info(`✅ Using pre-assigned agent: ${task.agent.name} for task: ${task.title}`);
        return task.agent;
      }
      logger.warn(`⚠️ Pre-assigned agent ${task.agent.name} not available for task: ${task.title}`);
    }

    const suitableAgents = this.filterSuitableAgents(task, availableAgents);
    
    if (suitableAgents.length === 0) {
      logger.warn(`⚠️ No suitable agents found for task: ${task.title}`);
      return null;
    }

    // Calculate scores for each suitable agent
    const agentScores = suitableAgents.map((agent) => ({
      agent,
      score: this.calculateAgentSuitabilityScore(
        agent,
        task,
        existingTasks
      ),
    }));

    // Sort by score and select the best
    agentScores.sort((a, b) => b.score - a.score);
    const selected = agentScores[0].agent;

    logger.info(
      `✅ Selected agent '${selected.name}' for task '${task.title}' (score: ${agentScores[0].score})`
    );

    return selected;
  }

  /**
   * Filter agents that have required skills for the task
   */
  private filterSuitableAgents(task: Task, agents: Agent[]): Agent[] {
    if (!task.resourceRequirements?.skillsRequired || 
        task.resourceRequirements.skillsRequired.length === 0) {
      return agents; // If no specific skills required, all agents are suitable
    }

    const requiredSkills = new Set(task.resourceRequirements.skillsRequired);

    return agents.filter((agent) => {
      const agentSkills = this.extractAgentSkills(agent);
      // Check if agent has at least one required skill
      return agentSkills.some((skill) => requiredSkills.has(skill));
    });
  }

  /**
   * Calculate suitability score for an agent-task pairing
   */
  private calculateAgentSuitabilityScore(
    agent: Agent,
    task: Task,
    existingTasks: Task[]
  ): number {
    let score = 100; // Base score

    // Factor 1: Skill match
    const skillScore = this.calculateSkillMatchScore(agent, task);
    score += skillScore * 30; // Up to 30 points for skill match

    // Factor 2: Current workload
    const workloadScore = this.calculateWorkloadScore(agent, existingTasks);
    score += workloadScore * 20; // Up to 20 points for low workload

    // Factor 3: Past performance (if available)
    const performanceScore = this.calculatePerformanceScore(agent, task);
    score += performanceScore * 15; // Up to 15 points for good performance

    // Factor 4: Task complexity alignment
    const complexityScore = this.calculateComplexityAlignmentScore(agent, task);
    score += complexityScore * 10; // Up to 10 points for complexity alignment

    return Math.max(0, Math.min(175, score)); // Cap between 0 and 175
  }

  /**
   * Calculate skill match score
   */
  private calculateSkillMatchScore(agent: Agent, task: Task): number {
    if (!task.resourceRequirements?.skillsRequired) return 0.5;

    const requiredSkills = task.resourceRequirements.skillsRequired;
    const agentSkills = this.extractAgentSkills(agent);

    if (requiredSkills.length === 0) return 0.5;

    const matchCount = requiredSkills.filter((skill) => 
      agentSkills.includes(skill)
    ).length;

    return matchCount / requiredSkills.length;
  }

  /**
   * Calculate workload score (lower workload = higher score)
   */
  private calculateWorkloadScore(agent: Agent, existingTasks: Task[]): number {
    const agentTasks = existingTasks.filter(
      (task) => task.agent && task.agent.id === agent.id && task.status === 'DOING'
    );

    // Inverse relationship: fewer tasks = higher score
    if (agentTasks.length === 0) return 1.0;
    if (agentTasks.length === 1) return 0.7;
    if (agentTasks.length === 2) return 0.4;
    if (agentTasks.length === 3) return 0.2;
    return 0; // 4+ tasks = no workload bonus
  }

  /**
   * Calculate performance score based on past tasks
   */
  private calculatePerformanceScore(agent: Agent, task: Task): number {
    // This is a simplified implementation
    // In a real system, you would track agent performance metrics
    return 0.7; // Default moderate performance score
  }

  /**
   * Calculate complexity alignment score
   */
  private calculateComplexityAlignmentScore(agent: Agent, task: Task): number {
    const taskComplexity = this.extractTaskComplexity(task);
    
    // This is a simplified implementation
    // In a real system, you would track agent complexity handling capabilities
    // For now, assume all agents handle medium complexity well
    if (taskComplexity >= 4 && taskComplexity <= 7) return 1.0;
    if (taskComplexity < 4) return 0.8; // Simple tasks
    return 0.6; // Complex tasks
  }

  /**
   * Analyze similar completed tasks to generate recommendations
   */
  async generateTaskRecommendations(
    newTasks: Task[],
    completedTasks: Task[]
  ): Promise<TaskRecommendation[]> {
    const recommendations: TaskRecommendation[] = [];

    for (const newTask of newTasks) {
      const similarTasks = this.findSimilarTasks(newTask, completedTasks);
      
      if (similarTasks.length > 0) {
        const recommendation = this.analyzeTaskPatterns(newTask, similarTasks);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations;
  }

  /**
   * Find tasks similar to the given task
   */
  private findSimilarTasks(targetTask: Task, tasks: Task[]): Task[] {
    return tasks.filter((task) => {
      // Skip if same task
      if (task.id === targetTask.id) return false;

      // Check for similar keywords in description
      const targetWords = new Set(
        targetTask.description.toLowerCase().split(/\s+/)
      );
      const taskWords = new Set(
        task.description.toLowerCase().split(/\s+/)
      );

      const commonWords = Array.from(targetWords).filter((word) => 
        taskWords.has(word) && word.length > 3 // Ignore short words
      );

      // Consider similar if >30% word overlap
      const similarity = commonWords.length / targetWords.size;
      return similarity > 0.3;
    });
  }

  /**
   * Analyze patterns in similar tasks
   */
  private analyzeTaskPatterns(
    newTask: Task,
    similarTasks: Task[]
  ): TaskRecommendation | null {
    // Analyze completion times
    const completedSimilar = similarTasks.filter((t) => t.status === 'DONE');
    if (completedSimilar.length === 0) return null;

    // Calculate average duration
    const avgDuration = completedSimilar.reduce((sum, task) => 
      sum + (task.duration || 0), 0
    ) / completedSimilar.length;

    // Find most successful agent
    const agentSuccess = new Map<string, { success: number; total: number }>();
    completedSimilar.forEach((task) => {
      if (task.agent) {
        const agentId = task.agent.id;
        const current = agentSuccess.get(agentId) || { success: 0, total: 0 };
        current.total++;
        if ((task.result as any)?.success) current.success++;
        agentSuccess.set(agentId, current);
      }
    });

    // Find best performing agent
    let bestAgent: string | null = null;
    let bestSuccessRate = 0;
    agentSuccess.forEach((stats, agentId) => {
      const successRate = stats.success / stats.total;
      if (successRate > bestSuccessRate) {
        bestSuccessRate = successRate;
        bestAgent = agentId;
      }
    });

    // Check for common issues
    const failedTasks = similarTasks.filter(
      (t) => (t.result && !(t.result as any).success)
    );
    const commonIssues = this.extractCommonIssues(failedTasks);

    return {
      taskId: newTask.id,
      basedOnTasks: similarTasks.map((t) => t.id),
      estimatedDuration: Math.round(avgDuration),
      recommendedAgent: bestAgent,
      potentialIssues: commonIssues,
      confidence: Math.min(0.9, similarTasks.length / 10), // Higher confidence with more data
    };
  }

  /**
   * Extract common issues from failed tasks
   */
  private extractCommonIssues(failedTasks: Task[]): string[] {
    if (failedTasks.length === 0) return [];

    // This is a simplified implementation
    // In a real system, you would analyze error messages and patterns
    const issues: string[] = [];

    // Check for timeout issues
    const timeoutTasks = failedTasks.filter((t) => 
      (t.result as any)?.error?.toLowerCase().includes('timeout')
    );
    if (timeoutTasks.length > failedTasks.length * 0.3) {
      issues.push('High timeout risk - consider increasing time allocation');
    }

    // Check for dependency issues
    const dependencyTasks = failedTasks.filter((t) => 
      t.dependencies && t.dependencies.length > 2
    );
    if (dependencyTasks.length > failedTasks.length * 0.4) {
      issues.push('Complex dependencies - ensure proper task sequencing');
    }

    return issues;
  }

  /**
   * Analyze task for potential issues before execution
   */
  analyzeTaskRisks(task: Task, context: {
    existingTasks: Task[];
    availableAgents: Agent[];
  }): string[] {
    const risks: string[] = [];

    // Risk 1: Missing dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      const taskIds = new Set(context.existingTasks.map((t) => t.id));
      const missingDeps = task.dependencies.filter((dep) => !taskIds.has(dep));
      if (missingDeps.length > 0) {
        risks.push(`Missing dependencies: ${missingDeps.join(', ')}`);
      }
    }

    // Risk 2: No suitable agent
    const suitableAgents = this.filterSuitableAgents(task, context.availableAgents);
    if (suitableAgents.length === 0) {
      risks.push('No agents with required skills available');
    }

    // Risk 3: High complexity
    const complexity = this.extractTaskComplexity(task);
    if (complexity > 8) {
      risks.push('High complexity task - consider breaking down');
    }

    // Risk 4: Resource constraints
    if (task.resourceRequirements?.estimatedTime) {
      const hours = this.parseEstimatedTime(task.resourceRequirements.estimatedTime);
      if (hours > 24) {
        risks.push('Long duration task - may block other work');
      }
    }

    // Risk 5: Quality gate requirements
    if (task.qualityGates && task.qualityGates.length > 5) {
      risks.push('Many quality gates - increased failure risk');
    }

    return risks;
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
}
