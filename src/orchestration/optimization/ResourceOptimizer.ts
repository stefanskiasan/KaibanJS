import { Task, Team, Agent } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';
import { nanoid } from 'nanoid';

/**
 * Optimizes resource allocation and workload distribution
 */
export class ResourceOptimizer {
  constructor(
    private team: Team,
    private extractTaskComplexity: (task: Task) => number,
    private logOrchestrationEvent: (event: string, message: string, details?: any) => void
  ) {}

  /**
   * Optimize resource utilization across agents
   */
  async optimizeResourceUtilization(
    context: OrchestrationContext,
    tasks: Task[]
  ): Promise<void> {
    logger.info('🎯 Optimizing resource utilization');

    const agents = this.team.store.getState().agents;
    if (agents.length === 0) return;

    // Calculate current workload distribution
    const agentWorkload = new Map<string, number>();
    agents.forEach((agent) => agentWorkload.set(agent.id, 0));

    tasks.forEach((task) => {
      if (task.agent) {
        const load = agentWorkload.get(task.agent.id) || 0;
        agentWorkload.set(task.agent.id, load + 1);
      }
    });

    // Find imbalances
    const avgWorkload =
      Array.from(agentWorkload.values()).reduce((a, b) => a + b, 0) /
      agents.length;
    const imbalancedAgents = Array.from(agentWorkload.entries()).filter(
      ([_, load]) => Math.abs(load - avgWorkload) > avgWorkload * 0.3
    );

    if (imbalancedAgents.length > 0) {
      // Log optimization recommendation
      this.logOrchestrationEvent(
        'RESOURCE_OPTIMIZATION',
        'Detected workload imbalance across agents',
        {
          avgWorkload,
          imbalancedAgents: imbalancedAgents.map(([id, load]) => ({
            agentId: id,
            currentLoad: load,
            deviation:
              (((load - avgWorkload) / avgWorkload) * 100).toFixed(1) + '%',
          })),
          recommendation: 'Consider task redistribution for balanced workload',
        }
      );

      // Attempt automatic redistribution if in adaptive mode
      if (this.team.mode === 'adaptive' || this.team.mode === 'innovative') {
        await this.redistributeTasks(tasks, agentWorkload, avgWorkload);
      }
    }
  }

  /**
   * Redistribute tasks for better load balancing
   */
  private async redistributeTasks(
    tasks: Task[],
    currentWorkload: Map<string, number>,
    targetWorkload: number
  ): Promise<void> {
    logger.info('🔄 Redistributing tasks for better balance');

    // Separate overloaded and underloaded agents
    const overloadedAgents = Array.from(currentWorkload.entries())
      .filter(([_, load]) => load > targetWorkload * 1.2)
      .sort((a, b) => b[1] - a[1]);

    const underloadedAgents = Array.from(currentWorkload.entries())
      .filter(([_, load]) => load < targetWorkload * 0.8)
      .sort((a, b) => a[1] - b[1]);

    let redistributionCount = 0;

    for (const [overloadedId, load] of overloadedAgents) {
      if (load <= targetWorkload * 1.2) break;

      // Find tasks from this agent that can be reassigned
      const agentTasks = tasks.filter(
        (t) => t.agent?.id === overloadedId && t.status === 'TODO'
      );

      for (const task of agentTasks) {
        if (currentWorkload.get(overloadedId)! <= targetWorkload * 1.2) break;

        // Find best underloaded agent for this task
        for (const [underloadedId, underLoad] of underloadedAgents) {
          if (underLoad >= targetWorkload * 0.9) continue;

          const underloadedAgent = this.team.store
            .getState()
            .agents.find((a) => a.id === underloadedId);

          if (underloadedAgent && this.canHandleTask(underloadedAgent, task)) {
            // Reassign task
            task.agent = underloadedAgent;

            // Update workload tracking
            const taskComplexity = this.extractTaskComplexity(task);
            currentWorkload.set(
              overloadedId,
              (currentWorkload.get(overloadedId) || 0) - taskComplexity
            );
            currentWorkload.set(underloadedId, underLoad + taskComplexity);

            redistributionCount++;

            // Re-sort underloaded agents
            underloadedAgents.sort((a, b) => {
              const aLoad = currentWorkload.get(a[0]) || 0;
              const bLoad = currentWorkload.get(b[0]) || 0;
              return aLoad - bLoad;
            });
            break;
          }
        }
      }
    }

    if (redistributionCount > 0) {
      this.logOrchestrationEvent(
        'TASKS_REDISTRIBUTED',
        `Redistributed ${redistributionCount} tasks for better load balancing`,
        { redistributionCount }
      );
    }
  }

  /**
   * Check if an agent can handle a specific task
   */
  private canHandleTask(agent: Agent, task: Task): boolean {
    // Basic compatibility check
    // In a real system, this would check skills, availability, etc.
    return agent.status !== 'BUSY';
  }

  /**
   * Calculate workload distribution across agents
   */
  calculateWorkloadDistribution(
    tasks: Task[]
  ): Array<{ agentName: string; assignedTasks: number }> {
    const distribution = new Map<string, number>();

    tasks.forEach((task) => {
      const agentName = task.agent?.name || 'Unassigned';
      distribution.set(agentName, (distribution.get(agentName) || 0) + 1);
    });

    return Array.from(distribution.entries()).map(
      ([agentName, assignedTasks]) => ({
        agentName,
        assignedTasks,
      })
    );
  }

  /**
   * Calculate agent workload score for intelligent distribution
   */
  calculateAgentWorkloadScore(
    agent: Agent,
    context: OrchestrationContext
  ): number {
    const currentTasks = context.activeTasks.filter(
      (task) => task.agent?.id === agent.id
    );

    const workloadScore = Math.max(0, 100 - currentTasks.length * 20);

    // Factor in agent's current status
    if (agent.status === 'BUSY') {
      return workloadScore * 0.5; // Reduce score if agent is marked as busy
    }

    // Factor in blocked tasks
    const blockedTasks = context.blockedTasks.filter(
      (task) => task.agent?.id === agent.id
    );
    const blockedPenalty = blockedTasks.length * 10;

    return Math.max(0, workloadScore - blockedPenalty);
  }

  /**
   * Find optimal agent for a task using intelligent workload distribution
   */
  findOptimalAgent(
    task: Task,
    context: OrchestrationContext
  ): Agent | null {
    const agents = context.availableAgents.filter(
      (agent) => agent.status !== 'BUSY'
    );

    if (agents.length === 0) return null;

    // Calculate suitability scores for each agent
    const agentScores = agents.map((agent) => {
      let score = 100;

      // Factor 1: Current workload (30 points)
      const workloadScore = this.calculateAgentWorkloadScore(agent, context);
      score += workloadScore * 0.3;

      // Factor 2: Skill match (40 points)
      const skillMatch = this.calculateSkillMatch(agent, task);
      score += skillMatch * 40;

      // Factor 3: Past performance (20 points)
      // This would normally use historical data
      const performanceScore = 0.7; // Mock value
      score += performanceScore * 20;

      // Factor 4: Agent specialization (10 points)
      const specializationScore = this.calculateSpecializationScore(
        agent,
        task
      );
      score += specializationScore * 10;

      return { agent, score };
    });

    // Sort by score and return the best agent
    agentScores.sort((a, b) => b.score - a.score);

    if (agentScores.length > 0 && agentScores[0].score > 50) {
      logger.info(
        `🎯 Selected agent '${agentScores[0].agent.name}' for task '${task.title}' (score: ${agentScores[0].score})`
      );
      return agentScores[0].agent;
    }

    // Fallback to least loaded agent
    const leastLoadedAgent = agents.reduce((prev, curr) => {
      const prevLoad = context.activeTasks.filter(
        (t) => t.agent?.id === prev.id
      ).length;
      const currLoad = context.activeTasks.filter(
        (t) => t.agent?.id === curr.id
      ).length;
      return currLoad < prevLoad ? curr : prev;
    });

    return leastLoadedAgent;
  }

  /**
   * Calculate skill match between agent and task
   */
  private calculateSkillMatch(agent: Agent, task: Task): number {
    // This is a simplified implementation
    // In a real system, you would compare agent skills with task requirements
    const taskKeywords = task.description.toLowerCase().split(' ');
    const agentKeywords = [
      agent.role.toLowerCase(),
      agent.goal.toLowerCase(),
      agent.background.toLowerCase(),
    ].join(' ').split(' ');

    const matchCount = taskKeywords.filter((keyword) =>
      agentKeywords.includes(keyword)
    ).length;

    return Math.min(1, matchCount / Math.max(taskKeywords.length, 1));
  }

  /**
   * Calculate agent specialization score
   */
  private calculateSpecializationScore(agent: Agent, task: Task): number {
    // Check if agent role matches task type
    const taskDesc = task.description.toLowerCase();
    const agentRole = agent.role.toLowerCase();

    if (
      (agentRole.includes('develop') && taskDesc.includes('implement')) ||
      (agentRole.includes('test') && taskDesc.includes('test')) ||
      (agentRole.includes('design') && taskDesc.includes('design')) ||
      (agentRole.includes('document') && taskDesc.includes('document'))
    ) {
      return 1.0;
    }

    return 0.5;
  }

  /**
   * Analyze agent utilization pattern
   */
  analyzeAgentUtilizationPattern(): { imbalanceScore: number } {
    const agentWorkloads = new Map<string, number>();

    this.team.store.getState().tasks.forEach((task) => {
      if (task.agent && task.status === 'DOING') {
        agentWorkloads.set(
          task.agent.id,
          (agentWorkloads.get(task.agent.id) || 0) + 1
        );
      }
    });

    if (agentWorkloads.size === 0) return { imbalanceScore: 0 };

    const loads = Array.from(agentWorkloads.values());
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
    const variance =
      loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) /
      loads.length;
    const stdDev = Math.sqrt(variance);

    return { imbalanceScore: stdDev / (avgLoad || 1) };
  }
}
