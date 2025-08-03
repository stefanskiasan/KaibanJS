import { Task, Team, Agent } from '../../index';
import { OrchestrationContext, TaskGap } from '../core/OrchestrationContext';
import { TASK_STATUS_enum } from '../../utils/enums';

/**
 * Analyzes orchestration context and project state
 */
export class ContextAnalyzer {
  constructor(private team: Team) {}

  /**
   * Analyze current team and project context
   */
  async analyzeCurrentContext(inputs: Record<string, unknown>): Promise<OrchestrationContext> {
    // Handle both full team store and minimal state scenarios
    let teamState;
    if (this.team.store && typeof this.team.store.getState === 'function') {
      teamState = this.team.store.getState();
    } else if (this.team.getTasks && this.team.agents) {
      // Fallback for minimal team object
      teamState = {
        tasks: this.team.getTasks(),
        agents: this.team.agents,
        inputs: inputs || {}
      };
    } else {
      throw new Error('Team object lacks required methods to get state');
    }

    // Parallel execution of independent calculations
    const [
      projectProgress,
      workload,
      projectPhase,
      resourceAvailability,
      timeConstraints,
      qualityRequirements
    ] = await Promise.all([
      this.calculateProjectProgress(),
      this.calculateCurrentWorkload(),
      this.determineProjectPhase(),
      this.assessResourceAvailability(),
      this.assessTimeConstraints(),
      this.assessQualityRequirements()
    ]);

    // Mock metrics - in a real implementation, these would be calculated from project-specific data
    const mockCoverage = 75; // Could represent test coverage, process coverage, etc.
    const mockQuality = 85; // Could represent overall quality, performance, etc.
    
    // Ensure all arrays are properly initialized
    const tasks = Array.isArray(teamState.tasks) ? teamState.tasks : [];
    const agents = Array.isArray(teamState.agents) ? teamState.agents : [];
    
    return {
      activeTasks: tasks.filter(
        (task) => task && task.status === 'DOING'
      ),
      availableAgents: agents.filter(
        (agent) => agent && agent.status !== 'BUSY'
      ),
      projectProgress,
      blockedTasks: tasks.filter(
        (task) => task && task.status === 'BLOCKED'
      ),
      codeCoverage: mockCoverage, // Legacy field for backward compatibility
      processCoverage: mockCoverage, // Domain-agnostic process coverage
      performanceScore: mockQuality, // Legacy field for backward compatibility
      qualityScore: mockQuality, // Domain-agnostic quality score
      workload,
      projectPhase,
      similarTasks: [],
      resourceAvailability,
      timeConstraints,
      qualityRequirements,
      existingTasks: tasks, // All existing tasks in the team
      inputs: inputs || teamState.inputs || {},
    };
  }

  /**
   * Calculate project progress percentage
   */
  calculateProjectProgress(): number {
    const tasks = this.getTeamTasks();
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(
      (task) => task.status === 'DONE'
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  /**
   * Calculate current workload status
   */
  calculateCurrentWorkload(): string {
    const activeTasks = (this.getTeamTasks() || []).filter(
      (task) => task && task.status === 'DOING'
    );
    const totalAgents = this.getTeamAgents().length;

    if (totalAgents === 0) return 'no-agents';
    const ratio = activeTasks.length / totalAgents;

    if (ratio > 2) return 'overloaded';
    if (ratio > 1) return 'high';
    if (ratio > 0.5) return 'balanced';
    return 'light';
  }

  /**
   * Determine current project phase
   */
  determineProjectPhase(): string {
    const progress = this.calculateProjectProgress();

    if (progress < 25) return 'planning';
    if (progress < 50) return 'development';
    if (progress < 75) return 'testing';
    if (progress < 90) return 'refinement';
    return 'completion';
  }

  /**
   * Assess resource availability
   */
  assessResourceAvailability(): string {
    const allAgents = this.team.store.getState().agents;
    const availableAgents = allAgents.filter(
      (agent) => agent.status !== 'BUSY'
    );

    const availabilityRatio = availableAgents.length / allAgents.length;

    if (availabilityRatio > 0.7) return 'high';
    if (availabilityRatio > 0.4) return 'moderate';
    if (availabilityRatio > 0.1) return 'low';
    return 'critical';
  }

  /**
   * Assess time constraints
   */
  assessTimeConstraints(): string {
    // Mock implementation - in reality would analyze project deadlines
    return 'moderate';
  }

  /**
   * Assess quality requirements
   */
  assessQualityRequirements(): string {
    // Mock implementation - in reality would analyze project quality standards
    return 'high';
  }

  /**
   * Calculate workload distribution across agents
   */
  calculateWorkloadDistribution(
    tasks: Task[]
  ): Array<{ agentName: string; assignedTasks: number }> {
    const distribution = new Map<string, number>();

    tasks.forEach((task) => {
      if (task.agent) {
        const agentName = task.agent.name;
        distribution.set(agentName, (distribution.get(agentName) || 0) + 1);
      }
    });

    return Array.from(distribution.entries()).map(([agentName, count]) => ({
      agentName,
      assignedTasks: count,
    }));
  }

  /**
   * Calculate workload per agent
   */
  calculateAgentWorkload(tasks: Task[]): Map<string, number> {
    const workload = new Map<string, number>();

    tasks.forEach((task) => {
      if (task.agent && task.status === TASK_STATUS_enum.DOING) {
        const agentId = task.agent.id;
        workload.set(agentId, (workload.get(agentId) || 0) + 1);
      }
    });

    return workload;
  }

  /**
   * Calculate agent workload score for intelligent distribution
   */
  calculateAgentWorkloadScore(
    agent: Agent,
    context: OrchestrationContext
  ): number {
    const currentTasks = context.activeTasks.filter(
      (task) => task.agent && task.agent.id === agent.id
    );

    const workloadScore = Math.max(0, 100 - currentTasks.length * 20);

    // Factor in agent's current status
    if (agent.status === 'BUSY') {
      return workloadScore * 0.5; // Reduce score if agent is marked as busy
    }

    // Factor in blocked tasks
    const blockedTasks = context.blockedTasks.filter(
      (task) => task.agent && task.agent.id === agent.id
    );
    const blockedPenalty = blockedTasks.length * 10;

    return Math.max(0, workloadScore - blockedPenalty);
  }

  /**
   * Calculate dynamic priority score for a task based on multiple factors
   */
  calculateDynamicPriorityScore(
    task: Task,
    context: OrchestrationContext
  ): number {
    let score = 0;

    // Base priority
    switch (task.priority) {
      case 'high':
        score += 100;
        break;
      case 'medium':
        score += 50;
        break;
      case 'low':
        score += 10;
        break;
    }

    // Deliverable bonus
    if (task.isDeliverable) {
      score += 50;
    }

    // Dependency urgency (tasks that unblock others)
    const dependentTasks = context.existingTasks.filter(
      (t) => t.dependencies && t.dependencies.includes(task.id)
    );
    score += dependentTasks.length * 20;

    // Resource availability consideration
    if (context.resourceAvailability === 'low' && task.agent) {
      const agentWorkload = this.calculateAgentWorkloadScore(
        task.agent,
        context
      );
      if (agentWorkload < 30) {
        score -= 20; // Penalize tasks for overloaded agents
      }
    }

    // Time constraint urgency
    if (context.timeConstraints === 'urgent') {
      const estimatedHours = this.parseEstimatedTime(
        task.resourceRequirements?.estimatedTime || '2 hours'
      );
      if (estimatedHours < 4) {
        score += 30; // Prefer shorter tasks when time is urgent
      }
    }

    // Quality gate requirements
    if (context.qualityRequirements === 'high' && task.qualityGates.length > 0) {
      score += 15;
    }

    return score;
  }

  /**
   * Parse estimated time string to hours
   */
  private parseEstimatedTime(estimatedTime: string): number {
    const match = estimatedTime.match(/(\d+)\s*(hours?|days?|minutes?)/i);
    if (!match) return 2; // Default to 2 hours

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
        return value * 8; // Assuming 8-hour workday
      default:
        return 2;
    }
  }

  /**
   * Helper method to get team tasks
   */
  private getTeamTasks(): Task[] {
    if (this.team.store && typeof this.team.store.getState === 'function') {
      return this.team.store.getState().tasks || [];
    } else if (this.team.getTasks) {
      return this.team.getTasks() || [];
    }
    return [];
  }

  /**
   * Helper method to get team agents
   */
  private getTeamAgents(): Agent[] {
    if (this.team.store && typeof this.team.store.getState === 'function') {
      return this.team.store.getState().agents || [];
    } else if (this.team.agents) {
      return this.team.agents || [];
    }
    return [];
  }
}