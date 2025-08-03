import { Task, Team } from '../../index';
import { OrchestrationContext } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';
import { ContextAnalyzer } from '../analysis/ContextAnalyzer';

/**
 * Handles task selection strategies
 */
export class SelectionStrategy {
  constructor(
    private team: Team,
    private llm: any, // LangChain LLM instance
    private contextAnalyzer: ContextAnalyzer
  ) {}

  /**
   * Select tasks from available options based on context and strategy
   */
  async selectTasks(
    availableTasks: Task[],
    context: OrchestrationContext,
    preserveExisting: boolean
  ): Promise<Task[]> {
    logger.info(`🎯 Selecting optimal tasks from ${availableTasks.length} available options`);

    // If preserving existing tasks, filter them out from selection
    let tasksToSelect = availableTasks;
    if (preserveExisting && context.existingTasks.length > 0) {
      const existingIds = new Set(context.existingTasks.map((t) => t.id));
      tasksToSelect = availableTasks.filter((t) => !existingIds.has(t.id));
      logger.info(`🔄 Preserving ${context.existingTasks.length} existing tasks`);
    }

    if (tasksToSelect.length === 0) {
      logger.info('✅ No new tasks to select');
      return preserveExisting ? context.existingTasks : [];
    }

    // Apply selection strategy based on orchestration mode
    let selectedTasks: Task[];
    
    switch (this.team.mode) {
      case 'conservative':
        selectedTasks = await this.conservativeSelection(tasksToSelect, context);
        break;
      case 'adaptive':
        selectedTasks = await this.adaptiveSelection(tasksToSelect, context);
        break;
      case 'innovative':
        selectedTasks = await this.innovativeSelection(tasksToSelect, context);
        break;
      case 'learning':
        selectedTasks = await this.learningSelection(tasksToSelect, context);
        break;
      default:
        selectedTasks = await this.adaptiveSelection(tasksToSelect, context);
    }

    // Combine with existing tasks if preserving
    if (preserveExisting) {
      selectedTasks = [...context.existingTasks, ...selectedTasks];
    }

    // Apply task prioritization
    selectedTasks = await this.prioritizeTasks(selectedTasks, context);

    logger.info(`✅ Selected ${selectedTasks.length} tasks for execution`);

    return selectedTasks;
  }

  /**
   * Conservative selection: Focus on low-risk, proven tasks
   */
  private async conservativeSelection(
    tasks: Task[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    logger.info('🛽️ Using conservative selection strategy');

    // Filter for lower complexity tasks
    const lowComplexityTasks = tasks.filter((task) => {
      const complexity = this.estimateTaskComplexity(task);
      return complexity <= 5;
    });

    // Prefer tasks with clear dependencies
    const tasksWithDeps = lowComplexityTasks.filter(
      (t) => !t.dependencies || t.dependencies.length <= 2
    );

    // Limit selection based on available resources
    const maxTasks = Math.min(
      this.team.maxActiveTasks,
      context.availableAgents.length * 2
    );

    return tasksWithDeps.slice(0, maxTasks);
  }

  /**
   * Adaptive selection: Balance based on current context
   */
  private async adaptiveSelection(
    tasks: Task[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    logger.info('🔄 Using adaptive selection strategy');

    // Score tasks based on multiple factors
    const scoredTasks = tasks.map((task) => ({
      task,
      score: this.calculateAdaptiveScore(task, context),
    }));

    // Sort by score
    scoredTasks.sort((a, b) => b.score - a.score);

    // Select based on resource availability
    const selectedTasks: Task[] = [];
    const agentWorkload = new Map<string, number>();

    for (const { task } of scoredTasks) {
      if (selectedTasks.length >= this.team.maxActiveTasks) break;

      // Check agent availability
      if (task.agent) {
        const agentId = task.agent.id;
        const currentLoad = agentWorkload.get(agentId) || 0;
        
        if (currentLoad < 3) { // Max 3 tasks per agent
          selectedTasks.push(task);
          agentWorkload.set(agentId, currentLoad + 1);
        }
      }
    }

    return selectedTasks;
  }

  /**
   * Innovative selection: Favor novel approaches and higher complexity
   */
  private async innovativeSelection(
    tasks: Task[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    logger.info('🚀 Using innovative selection strategy');

    // Prefer higher complexity and novel tasks
    const scoredTasks = tasks.map((task) => ({
      task,
      score: this.calculateInnovativeScore(task, context),
    }));

    scoredTasks.sort((a, b) => b.score - a.score);

    // Allow more parallel execution for innovation
    const maxTasks = Math.min(
      this.team.maxActiveTasks * 1.5,
      context.availableAgents.length * 3
    );

    return scoredTasks.slice(0, Math.floor(maxTasks)).map((st) => st.task);
  }

  /**
   * Learning selection: Focus on tasks that provide learning opportunities
   */
  private async learningSelection(
    tasks: Task[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    logger.info('🎓 Using learning selection strategy');

    // Analyze task diversity
    const taskCategories = this.categorizeTasks(tasks);
    const selectedTasks: Task[] = [];

    // Select diverse tasks for learning
    for (const [category, categoryTasks] of taskCategories) {
      if (selectedTasks.length >= this.team.maxActiveTasks) break;
      
      // Take 1-2 tasks from each category
      const tasksFromCategory = categoryTasks
        .sort((a, b) => this.calculateLearningScore(b) - this.calculateLearningScore(a))
        .slice(0, 2);
      
      selectedTasks.push(...tasksFromCategory);
    }

    return selectedTasks.slice(0, this.team.maxActiveTasks);
  }

  /**
   * Calculate adaptive score for task selection
   */
  private calculateAdaptiveScore(task: Task, context: OrchestrationContext): number {
    let score = 0;

    // Priority score
    const priorityScores = { high: 30, medium: 20, low: 10 };
    score += priorityScores[task.priority] || 20;

    // Deliverable bonus
    if (task.isDeliverable) score += 25;

    // INPUT-BASED SCORING: Give significant weight to input alignment
    if (context.inputs && Object.keys(context.inputs).length > 0) {
      score += this.calculateInputAlignmentScore(task, context.inputs) * 2; // Double weight for inputs
    }

    // Resource availability alignment
    if (context.resourceAvailability === 'high') {
      score += 10;
    } else if (context.resourceAvailability === 'low') {
      // Penalize complex tasks when resources are low
      const complexity = this.estimateTaskComplexity(task);
      score -= complexity * 2;
    }

    // Phase alignment
    score += this.calculatePhaseAlignment(task, context.projectPhase);

    // Time constraint consideration
    if (context.timeConstraints === 'urgent') {
      const estimatedHours = this.parseEstimatedTime(
        task.resourceRequirements?.estimatedTime || '2 hours'
      );
      if (estimatedHours > 8) score -= 15;
    }

    // Dynamic priority consideration
    if (task.dynamicPriority) {
      score += this.contextAnalyzer.calculateDynamicPriorityScore(task, context) * 0.3;
    }

    return score;
  }

  /**
   * Calculate innovative score for task selection
   */
  private calculateInnovativeScore(task: Task, context: OrchestrationContext): number {
    let score = this.calculateAdaptiveScore(task, context);

    // Bonus for higher complexity
    const complexity = this.estimateTaskComplexity(task);
    score += complexity * 3;

    // Bonus for tasks with multiple dependencies (complex workflows)
    if (task.dependencies && task.dependencies.length > 2) {
      score += 15;
    }

    // Bonus for adaptable tasks
    if (task.adaptable) score += 10;

    // Bonus for tasks with quality gates (higher standards)
    if (task.qualityGates && task.qualityGates.length > 0) {
      score += task.qualityGates.length * 5;
    }

    return score;
  }

  /**
   * Calculate learning score for a task
   */
  private calculateLearningScore(task: Task): number {
    let score = 0;

    // Variety in skills required
    if (task.resourceRequirements?.skillsRequired) {
      score += task.resourceRequirements.skillsRequired.length * 10;
    }

    // Moderate complexity is best for learning
    const complexity = this.estimateTaskComplexity(task);
    if (complexity >= 4 && complexity <= 7) {
      score += 20;
    }

    // Quality gates provide learning feedback
    if (task.qualityGates) {
      score += task.qualityGates.length * 5;
    }

    return score;
  }

  /**
   * Categorize tasks for diversity analysis
   */
  private categorizeTasks(tasks: Task[]): Map<string, Task[]> {
    const categories = new Map<string, Task[]>();

    tasks.forEach((task) => {
      let category = 'general';

      if (task.description.toLowerCase().includes('implement') || 
          task.description.toLowerCase().includes('create')) {
        category = 'implementation';
      } else if (task.description.toLowerCase().includes('test') || 
                 task.description.toLowerCase().includes('validate')) {
        category = 'testing';
      } else if (task.description.toLowerCase().includes('document')) {
        category = 'documentation';
      } else if (task.description.toLowerCase().includes('review') || 
                 task.description.toLowerCase().includes('analyze')) {
        category = 'analysis';
      } else if (task.description.toLowerCase().includes('deploy') || 
                 task.description.toLowerCase().includes('release')) {
        category = 'deployment';
      }

      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(task);
    });

    return categories;
  }

  /**
   * Prioritize tasks based on current strategy
   */
  private async prioritizeTasks(
    tasks: Task[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    if (this.team.taskPrioritization === 'static') {
      // Simple priority-based sorting
      return tasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        return bPriority - aPriority;
      });
    } else if (this.team.taskPrioritization === 'dynamic') {
      // Dynamic prioritization based on context
      return tasks.sort((a, b) => {
        const aScore = this.contextAnalyzer.calculateDynamicPriorityScore(a, context);
        const bScore = this.contextAnalyzer.calculateDynamicPriorityScore(b, context);
        return bScore - aScore;
      });
    } else if (this.team.taskPrioritization === 'ai-driven') {
      // Use LLM for intelligent prioritization
      return await this.aiDrivenPrioritization(tasks, context);
    }

    return tasks;
  }

  /**
   * AI-driven task prioritization
   */
  private async aiDrivenPrioritization(
    tasks: Task[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    try {
      const taskList = tasks.map((t, i) => 
        `${i + 1}. ${t.title} - ${t.description} (Priority: ${t.priority})`
      ).join('\n');

      const prompt = `
Prioritize these tasks based on the current project context and user inputs:

Tasks:
${taskList}

${context.inputs && Object.keys(context.inputs).length > 0 ? `
USER INPUTS (HIGHEST PRIORITY):
${Object.entries(context.inputs)
  .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
  .join('\n')}

IMPORTANT: Tasks that align with user inputs should be given the highest priority.
` : ''}

Context:
- Project Phase: ${context.projectPhase}
- Progress: ${context.projectProgress}%
- Resource Availability: ${context.resourceAvailability}
- Time Constraints: ${context.timeConstraints}
- Active Tasks: ${context.activeTasks.length}
- Blocked Tasks: ${context.blockedTasks.length}

Provide the task numbers in optimal execution order. User inputs should be the PRIMARY factor in prioritization, followed by dependencies, resource availability, and project goals.

Response format: [1, 3, 2, 4, ...]
`;

      const response = await this.llm.invoke(prompt);
      const orderMatch = response.content.match(/\[(\d+(?:,\s*\d+)*)\]/);
      
      if (orderMatch) {
        const order = orderMatch[1].split(',').map((n: string) => parseInt(n.trim()) - 1);
        const prioritizedTasks: Task[] = [];
        
        order.forEach((index: number) => {
          if (index >= 0 && index < tasks.length) {
            prioritizedTasks.push(tasks[index]);
          }
        });

        // Add any missed tasks
        tasks.forEach((task) => {
          if (!prioritizedTasks.includes(task)) {
            prioritizedTasks.push(task);
          }
        });

        return prioritizedTasks;
      }
    } catch (error) {
      logger.error('Error in AI-driven prioritization:', error);
    }

    // Fallback to dynamic prioritization
    return this.prioritizeTasks(tasks, context);
  }

  /**
   * Calculate phase alignment score
   */
  private calculatePhaseAlignment(task: Task, projectPhase: string): number {
    const description = task.description.toLowerCase();
    
    switch (projectPhase) {
      case 'planning':
        if (description.includes('plan') || description.includes('design')) return 15;
        if (description.includes('implement')) return -10;
        break;
      case 'development':
        if (description.includes('implement') || description.includes('create')) return 15;
        if (description.includes('deploy')) return -10;
        break;
      case 'testing':
        if (description.includes('test') || description.includes('validate')) return 15;
        if (description.includes('plan')) return -10;
        break;
      case 'refinement':
        if (description.includes('optimize') || description.includes('improve')) return 15;
        break;
      case 'completion':
        if (description.includes('document') || description.includes('deploy')) return 15;
        if (description.includes('implement')) return -10;
        break;
    }
    
    return 0;
  }

  /**
   * Estimate task complexity
   */
  private estimateTaskComplexity(task: Task): number {
    let complexity = 5; // Base complexity

    // Dependencies add complexity
    if (task.dependencies) {
      complexity += task.dependencies.length * 0.5;
    }

    // Description length as proxy for complexity
    const descriptionWords = task.description.split(' ').length;
    if (descriptionWords > 50) complexity += 1;
    if (descriptionWords > 100) complexity += 1;

    // Quality gates add complexity
    if (task.qualityGates) {
      complexity += task.qualityGates.length * 0.3;
    }

    // Resource requirements
    if (task.resourceRequirements?.skillsRequired) {
      complexity += task.resourceRequirements.skillsRequired.length * 0.2;
    }

    return Math.min(10, Math.max(1, Math.round(complexity)));
  }

  /**
   * Parse estimated time to hours
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
   * Calculate how well a task aligns with user inputs
   */
  private calculateInputAlignmentScore(task: Task, inputs: Record<string, unknown>): number {
    let score = 0;
    const taskDescription = task.description.toLowerCase();
    const taskTitle = (task.title || '').toLowerCase();
    
    // Check each input for relevance to the task
    for (const [key, value] of Object.entries(inputs)) {
      const keyLower = key.toLowerCase();
      
      // Direct keyword matching
      if (taskDescription.includes(keyLower) || taskTitle.includes(keyLower)) {
        score += 15;
      }
      
      // Value matching (if value is string)
      if (typeof value === 'string') {
        const valueLower = value.toLowerCase();
        if (taskDescription.includes(valueLower) || taskTitle.includes(valueLower)) {
          score += 20;
        }
        
        // Partial matching for longer values
        const words = valueLower.split(/\s+/);
        for (const word of words) {
          if (word.length > 3 && (taskDescription.includes(word) || taskTitle.includes(word))) {
            score += 5;
          }
        }
      }
      
      // Special handling for specific input types
      if (key === 'priority' && value === task.priority) {
        score += 10;
      }
      
      if (key === 'projectType' || key === 'businessType' || key === 'domain') {
        // Domain-specific matching
        const domain = String(value).toLowerCase();
        if (task.resourceRequirements?.skillsRequired?.some(skill => 
          skill.toLowerCase().includes(domain) || domain.includes(skill.toLowerCase())
        )) {
          score += 15;
        }
      }
      
      // Temporal alignment (deadlines, seasons, etc.)
      if ((key.includes('deadline') || key.includes('time') || key.includes('season')) && 
          taskDescription.includes(String(value).toLowerCase())) {
        score += 10;
      }
    }
    
    return Math.min(score, 50); // Cap at 50 to prevent over-weighting
  }
}
