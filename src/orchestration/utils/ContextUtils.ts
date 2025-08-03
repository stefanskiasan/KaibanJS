import { Task, Team, Agent } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
import { TASK_STATUS_enum } from '../../utils/enums';

/**
 * Utility functions for building and managing orchestration context
 */
export class ContextUtils {
  /**
   * Build orchestration context for LLM prompts
   */
  static buildOrchestrationContext(team: Team): any {
    const state = team.getStore().getState();
    const tasks = team.getTasks() || [];

    return {
      teamName: team.getStore().getState().name,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === TASK_STATUS_enum.DONE).length,
      activeTasks: tasks.filter((t) => t.status === TASK_STATUS_enum.DOING).length,
      blockedTasks: tasks.filter((t) => t.status === TASK_STATUS_enum.BLOCKED).length,
      todoTasks: tasks.filter((t) => t.status === TASK_STATUS_enum.TODO).length,
      agents: state.agents.map((a) => ({
        name: a.name,
        role: a.role,
        status: a.status,
        currentTasks: tasks.filter(
          (t) => t.agent?.id === a.id && t.status === TASK_STATUS_enum.DOING
        ).length,
      })),
      workflowStatus: (state as any).status || 'running',
      orchestrationMode: team.mode || 'adaptive',
      maxActiveTasks: team.maxActiveTasks || 5,
      taskPrioritization: team.taskPrioritization || 'dynamic',
      workloadDistribution: team.workloadDistribution || 'balanced',
    };
  }

  /**
   * Extract skills from agent profile
   */
  static extractAgentSkills(agent: Agent): string[] {
    const skills: string[] = [];

    // Extract from role
    if (agent.role) {
      const roleSkills = agent.role
        .toLowerCase()
        .split(/[,;\s]+/)
        .filter((s) => s.length > 3);
      skills.push(...roleSkills);
    }

    // Extract from background
    if (agent.background) {
      const backgroundKeywords = [
        'expert',
        'specialist',
        'developer',
        'engineer',
        'designer',
        'analyst',
        'architect',
        'tester',
        'manager',
      ];

      backgroundKeywords.forEach((keyword) => {
        if (agent.background.toLowerCase().includes(keyword)) {
          const match = agent.background
            .toLowerCase()
            .match(new RegExp(`(\\w+)\\s*${keyword}`));
          if (match && match[1]) {
            skills.push(match[1]);
          }
        }
      });
    }

    // Extract from tools
    if (agent.tools && agent.tools.length > 0) {
      agent.tools.forEach((tool) => {
        if (tool.name) {
          skills.push(tool.name.toLowerCase());
        }
      });
    }

    // Deduplicate and return
    return Array.from(new Set(skills));
  }

  /**
   * Calculate skill match score between agent and task
   */
  static calculateSkillMatchScore(agent: Agent, task: Task): number {
    if (!task.resourceRequirements?.skillsRequired) {
      return 50; // Neutral score if no skills specified
    }

    const agentSkills = this.extractAgentSkills(agent);
    const requiredSkills = task.resourceRequirements.skillsRequired;

    if (requiredSkills.length === 0) {
      return 75; // Good score if no specific skills required
    }

    // Count matching skills
    let matchCount = 0;
    requiredSkills.forEach((required) => {
      const requiredLower = required.toLowerCase();
      if (
        agentSkills.some(
          (skill) =>
            skill.includes(requiredLower) || requiredLower.includes(skill)
        )
      ) {
        matchCount++;
      }
    });

    // Calculate percentage match
    const matchPercentage = (matchCount / requiredSkills.length) * 100;

    // Bonus for agents with more skills (versatility)
    const versatilityBonus = Math.min(10, agentSkills.length * 2);

    return Math.min(100, matchPercentage + versatilityBonus);
  }

  /**
   * Calculate project phase based on progress
   */
  static determineProjectPhase(progress: number): string {
    if (progress < 25) return 'planning';
    if (progress < 50) return 'development';
    if (progress < 75) return 'testing';
    if (progress < 90) return 'refinement';
    return 'completion';
  }

  /**
   * Assess resource availability
   */
  static assessResourceAvailability(agents: Agent[]): string {
    const availableAgents = agents.filter((agent) => agent.status !== 'BUSY');
    const availabilityRatio = availableAgents.length / agents.length;

    if (availabilityRatio > 0.7) return 'high';
    if (availabilityRatio > 0.4) return 'moderate';
    if (availabilityRatio > 0.1) return 'low';
    return 'critical';
  }

  /**
   * Calculate current workload status
   */
  static calculateCurrentWorkload(activeTasks: number, totalAgents: number): string {
    if (totalAgents === 0) return 'no-agents';
    const ratio = activeTasks / totalAgents;

    if (ratio > 2) return 'overloaded';
    if (ratio > 1) return 'high';
    if (ratio > 0.5) return 'balanced';
    return 'light';
  }

  /**
   * Create a minimal context for specific operations
   */
  static createMinimalContext(
    activeTasks: Task[],
    availableAgents: Agent[],
    projectProgress: number
  ): Partial<OrchestrationContext> {
    return {
      activeTasks,
      availableAgents,
      projectProgress,
      projectPhase: this.determineProjectPhase(projectProgress),
      resourceAvailability: this.assessResourceAvailability(availableAgents),
      workload: this.calculateCurrentWorkload(activeTasks.length, availableAgents.length),
    };
  }
}
