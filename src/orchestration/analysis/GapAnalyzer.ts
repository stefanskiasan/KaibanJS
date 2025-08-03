import { Task, Agent } from '../../index';
import { OrchestrationContext, TaskGap } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';

/**
 * Analyzes gaps in task coverage and workflow
 */
export class GapAnalyzer {
  constructor(
    private availableTasks: Task[],
    private extractAgentSkills: (agent: Agent) => string[]
  ) {}

  /**
   * Identify gaps in task coverage with comprehensive analysis
   */
  async identifyTaskGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): Promise<TaskGap[]> {
    const gaps: TaskGap[] = [];

    // Analyze skill gaps
    const skillGaps = this.analyzeSkillGaps(context, selectedTasks);
    gaps.push(...skillGaps);

    // Analyze workflow gaps
    const workflowGaps = this.analyzeWorkflowGaps(context, selectedTasks);
    gaps.push(...workflowGaps);

    // Analyze quality gaps
    const qualityGaps = this.analyzeQualityGaps(context, selectedTasks);
    gaps.push(...qualityGaps);

    // Analyze resource gaps
    const resourceGaps = this.analyzeResourceGaps(context, selectedTasks);
    gaps.push(...resourceGaps);

    // Analyze dependency gaps
    const dependencyGaps = this.analyzeDependencyGaps(context, selectedTasks);
    gaps.push(...dependencyGaps);

    // Sort gaps by priority
    gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      );
    });

    logger.info(`🔍 Identified ${gaps.length} task gaps in workflow`);

    return gaps;
  }

  /**
   * Analyze skill gaps in the current workflow
   */
  private analyzeSkillGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): TaskGap[] {
    const gaps: TaskGap[] = [];

    // Collect all required skills
    const requiredSkills = new Set<string>();
    selectedTasks.forEach((task) => {
      if (task.resourceRequirements?.skillsRequired) {
        task.resourceRequirements.skillsRequired.forEach((skill) =>
          requiredSkills.add(skill)
        );
      }
    });

    // Collect available skills from agents
    const availableSkills = new Set<string>();
    context.availableAgents.forEach((agent) => {
      const skills = this.extractAgentSkills(agent);
      skills.forEach((skill) => availableSkills.add(skill));
    });

    // Identify missing skills
    const missingSkills = Array.from(requiredSkills).filter(
      (skill) => !availableSkills.has(skill)
    );

    // Create gap for each missing skill
    missingSkills.forEach((skill) => {
      gaps.push({
        category: 'skill',
        description: `Missing skill expertise: ${skill}`,
        estimatedComplexity: 'medium',
        requirements: [skill],
        priority: 'high',
        dependencies: [],
      });
    });

    return gaps;
  }

  /**
   * Analyze workflow gaps
   */
  private analyzeWorkflowGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): TaskGap[] {
    const gaps: TaskGap[] = [];

    // Check for testing tasks
    const hasTestingTasks = selectedTasks.some(
      (task) =>
        task.description.toLowerCase().includes('test') ||
        task.description.toLowerCase().includes('validate')
    );

    if (!hasTestingTasks && context.projectPhase === 'development') {
      gaps.push({
        category: 'workflow',
        description: 'Missing testing and validation tasks',
        estimatedComplexity: 'medium',
        requirements: ['testing', 'quality-assurance'],
        priority: 'high',
        dependencies: [],
      });
    }

    // Check for documentation tasks
    const hasDocumentationTasks = selectedTasks.some(
      (task) =>
        task.description.toLowerCase().includes('document') ||
        task.description.toLowerCase().includes('readme')
    );

    if (!hasDocumentationTasks && context.projectProgress > 50) {
      gaps.push({
        category: 'workflow',
        description: 'Missing documentation tasks',
        estimatedComplexity: 'low',
        requirements: ['documentation', 'technical-writing'],
        priority: 'medium',
        dependencies: [],
      });
    }

    // Check for review tasks
    const hasReviewTasks = selectedTasks.some((task) =>
      task.description.toLowerCase().includes('review')
    );

    if (!hasReviewTasks && context.projectPhase === 'testing') {
      gaps.push({
        category: 'workflow',
        description: 'Missing code review and quality assurance tasks',
        estimatedComplexity: 'medium',
        requirements: ['code-review', 'quality-assurance'],
        priority: 'high',
        dependencies: [],
      });
    }

    return gaps;
  }

  /**
   * Analyze quality gaps
   */
  private analyzeQualityGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): TaskGap[] {
    const gaps: TaskGap[] = [];

    // Check for quality gates implementation
    const tasksWithQualityGates = selectedTasks.filter(
      (task) => task.qualityGates && task.qualityGates.length > 0
    );

    if (
      tasksWithQualityGates.length < selectedTasks.length * 0.3 &&
      context.qualityRequirements === 'high'
    ) {
      gaps.push({
        category: 'quality',
        description: 'Insufficient quality gates implementation',
        estimatedComplexity: 'medium',
        requirements: ['quality-assurance', 'testing'],
        priority: 'high',
        dependencies: [],
      });
    }

    // Check for optimization tasks (domain-agnostic)
    const qualityScore = context.qualityScore || context.performanceScore;
    if (qualityScore < 70 && context.projectPhase !== 'planning') {
      const hasOptimizationTasks = selectedTasks.some((task) =>
        task.description.toLowerCase().includes('optimi') || 
        task.description.toLowerCase().includes('improve') ||
        task.description.toLowerCase().includes('enhance')
      );

      if (!hasOptimizationTasks) {
        gaps.push({
          category: 'quality',
          description: 'Missing optimization or improvement tasks',
          estimatedComplexity: 'high',
          requirements: ['optimization', 'improvement', 'quality-enhancement'],
          priority: 'medium',
          dependencies: [],
        });
      }
    }

    return gaps;
  }

  /**
   * Analyze resource gaps
   */
  private analyzeResourceGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): TaskGap[] {
    const gaps: TaskGap[] = [];

    // Check for resource overallocation
    const agentWorkload = new Map<string, number>();
    selectedTasks.forEach((task) => {
      if (task.agent) {
        const agentId = task.agent.id;
        agentWorkload.set(agentId, (agentWorkload.get(agentId) || 0) + 1);
      }
    });

    // Identify overloaded agents
    const overloadedAgents = Array.from(agentWorkload.entries()).filter(
      ([_, taskCount]) => taskCount > 3
    );

    if (overloadedAgents.length > 0 && context.resourceAvailability !== 'high') {
      gaps.push({
        category: 'resource',
        description: 'Resource load balancing needed',
        estimatedComplexity: 'medium',
        requirements: ['task-coordination', 'resource-management'],
        priority: 'high',
        dependencies: [],
      });
    }

    // Check for underutilized agents
    const underutilizedAgents = context.availableAgents.filter((agent) => {
      const taskCount = agentWorkload.get(agent.id) || 0;
      return taskCount === 0;
    });

    if (underutilizedAgents.length > context.availableAgents.length * 0.3) {
      gaps.push({
        category: 'resource',
        description: 'Underutilized team members - additional tasks needed',
        estimatedComplexity: 'medium',
        requirements: [],
        priority: 'medium',
        dependencies: [],
      });
    }

    return gaps;
  }

  /**
   * Analyze dependency gaps
   */
  private analyzeDependencyGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): TaskGap[] {
    const gaps: TaskGap[] = [];

    // Check for orphaned dependencies
    const allTaskIds = new Set(selectedTasks.map((task) => task.id));
    const missingDependencies = new Set<string>();

    selectedTasks.forEach((task) => {
      if (task.dependencies) {
        task.dependencies.forEach((depId) => {
          if (!allTaskIds.has(depId)) {
            // Check if dependency exists in available tasks
            const depInAvailable = this.availableTasks.find(
              (t) => t.id === depId || t.referenceId === depId
            );
            if (!depInAvailable) {
              missingDependencies.add(depId);
            }
          }
        });
      }
    });

    if (missingDependencies.size > 0) {
      gaps.push({
        category: 'dependency',
        description: `Missing dependency tasks: ${Array.from(
          missingDependencies
        ).join(', ')}`,
        estimatedComplexity: 'medium',
        requirements: Array.from(missingDependencies),
        priority: 'high',
        dependencies: [],
      });
    }

    // Check for circular dependencies (simplified check)
    const hasPotentialCircular = selectedTasks.some((task) => {
      if (!task.dependencies) return false;
      return task.dependencies.some((depId) => {
        const depTask = selectedTasks.find(
          (t) => t.id === depId || t.referenceId === depId
        );
        return (
          depTask &&
          depTask.dependencies &&
          depTask.dependencies.includes(task.id)
        );
      });
    });

    if (hasPotentialCircular) {
      gaps.push({
        category: 'dependency',
        description: 'Potential circular dependencies detected',
        estimatedComplexity: 'high',
        requirements: ['architecture', 'task-planning'],
        priority: 'high',
        dependencies: [],
      });
    }

    return gaps;
  }
}