import { Task, Team, Agent } from '../../index';
import { OrchestrationContext, TaskGap } from '../core/OrchestrationContext';
import { logger } from '../../utils/logger';
import { nanoid } from 'nanoid';
import { TaskAnalyzer } from '../analysis/TaskAnalyzer';
import { GapAnalyzer } from '../analysis/GapAnalyzer';

/**
 * Handles task generation strategies
 */
export class GenerationStrategy {
  constructor(
    private team: Team,
    private llm: any, // LangChain LLM instance
    private taskAnalyzer: TaskAnalyzer,
    private gapAnalyzer?: GapAnalyzer
  ) {}

  /**
   * Generate additional tasks if gaps are identified
   */
  async generateAdditionalTasks(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): Promise<Task[]> {
    logger.info('🔍 Analyzing for task generation opportunities');

    // Check if task generation is allowed
    if (!this.team.allowTaskGeneration) {
      logger.info('❌ Task generation is disabled for this team');
      return [];
    }

    try {
      // Use the comprehensive GapAnalyzer if available, otherwise fall back to basic analysis
      const gaps = this.gapAnalyzer 
        ? await this.gapAnalyzer.identifyTaskGaps(context, selectedTasks)
        : await this.identifyGaps(context, selectedTasks);

      if (gaps.length === 0) {
        logger.info('✅ No significant gaps identified');
        return [];
      }

      logger.info(`🕳️ Found ${gaps.length} gaps that may require new tasks`);

      // Prioritize gaps
      const prioritizedGaps = this.prioritizeGaps(gaps, context);

      // Generate tasks for top priority gaps in parallel
      const topGaps = prioritizedGaps.slice(0, 3); // Limit to top 3 gaps
      const newTasks = await Promise.all(
        topGaps.map(gap => this.generateTaskForGap(gap, context))
      );

      // Filter out any null results
      const validNewTasks = newTasks.filter((task): task is Task => task !== null);

      logger.info(`✅ Generated ${validNewTasks.length} new tasks to fill gaps`);

      return validNewTasks;
    } catch (error) {
      logger.error('❌ Error generating additional tasks:', error);
      return [];
    }
  }

  /**
   * Identify gaps in the current task set
   */
  private async identifyGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): Promise<TaskGap[]> {
    const gaps: TaskGap[] = [];

    // Gap 1: Check for missing quality assurance
    if (!selectedTasks.some((t) => t.description.toLowerCase().includes('test') || 
                                   t.description.toLowerCase().includes('quality'))) {
      gaps.push({
        category: 'quality',
        description: 'No quality assurance or testing tasks found',
        estimatedComplexity: 'medium',
        requirements: ['testing', 'quality-assurance'],
        dependencies: [],
        priority: 'high',
      });
    }

    // Gap 2: Check for missing documentation
    if (context.projectProgress > 50 && 
        !selectedTasks.some((t) => t.description.toLowerCase().includes('document'))) {
      gaps.push({
        category: 'documentation',
        description: 'Documentation tasks missing for mature project',
        estimatedComplexity: 'low',
        requirements: ['documentation', 'technical-writing'],
        dependencies: [],
        priority: 'medium',
      });
    }

    // Gap 3: Check for integration tasks
    const implementationTasks = selectedTasks.filter((t) => 
      t.description.toLowerCase().includes('implement') || 
      t.description.toLowerCase().includes('create')
    );
    
    if (implementationTasks.length > 2 && 
        !selectedTasks.some((t) => t.description.toLowerCase().includes('integrat'))) {
      gaps.push({
        category: 'integration',
        description: 'Multiple implementations without integration task',
        estimatedComplexity: 'high',
        requirements: ['integration', 'architecture'],
        dependencies: [],
        priority: 'high',
      });
    }

    return gaps;
  }

  /**
   * Prioritize gaps based on impact and context
   */
  private prioritizeGaps(
    gaps: TaskGap[],
    context: OrchestrationContext
  ): TaskGap[] {
    return gaps.sort((a, b) => {
      // Priority weight
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      let scoreA = priorityWeight[a.priority as keyof typeof priorityWeight] || 1;
      let scoreB = priorityWeight[b.priority as keyof typeof priorityWeight] || 1;

      // INPUT-BASED PRIORITIZATION
      if (context.inputs && Object.keys(context.inputs).length > 0) {
        scoreA += this.calculateGapInputAlignment(a, context.inputs) * 2;
        scoreB += this.calculateGapInputAlignment(b, context.inputs) * 2;
      }

      // Context modifiers
      if (context.timeConstraints === 'urgent') {
        // Prefer simpler tasks when time is limited
        const complexityWeight = { low: 1, medium: 2, high: 3 };
        scoreA -= (complexityWeight[a.estimatedComplexity] || 2) * 0.5;
        scoreB -= (complexityWeight[b.estimatedComplexity] || 2) * 0.5;
      }

      if (context.qualityRequirements === 'high' && a.category === 'quality') {
        scoreA += 2;
      }
      if (context.qualityRequirements === 'high' && b.category === 'quality') {
        scoreB += 2;
      }

      return scoreB - scoreA;
    });
  }

  /**
   * Calculate how well a gap aligns with user inputs
   */
  private calculateGapInputAlignment(gap: TaskGap, inputs: Record<string, unknown>): number {
    let score = 0;
    const gapDescription = gap.description.toLowerCase();
    const gapCategory = gap.category.toLowerCase();
    
    for (const [key, value] of Object.entries(inputs)) {
      const keyLower = key.toLowerCase();
      const valueLower = String(value).toLowerCase();
      
      // Check if gap relates to input keys or values
      if (gapDescription.includes(keyLower) || gapCategory.includes(keyLower)) {
        score += 3;
      }
      
      if (gapDescription.includes(valueLower) || gap.requirements.some(req => 
        req.toLowerCase().includes(valueLower)
      )) {
        score += 4;
      }
      
      // Special handling for domain-specific inputs
      if ((key === 'projectType' || key === 'businessType' || key === 'domain') && 
          gap.requirements.some(req => req.toLowerCase().includes(valueLower))) {
        score += 5;
      }
    }
    
    return score;
  }

  /**
   * Generate a new task for an identified gap
   */
  private async generateTaskForGap(
    gap: TaskGap,
    context: OrchestrationContext
  ): Promise<Task | null> {
    logger.info(`🎯 Generating task for gap: ${gap.description}`);

    try {
      const prompt = `
Generate a specific task to address this gap in the project workflow:

Gap: ${gap.description}
Category: ${gap.category}
Required Skills: ${gap.requirements.join(', ') || 'general'}
Complexity: ${gap.estimatedComplexity}

Project Context:
- Current Phase: ${context.projectPhase}
- Progress: ${context.projectProgress}%
- Time Constraints: ${context.timeConstraints}
- Quality Requirements: ${context.qualityRequirements}
${context.inputs && Object.keys(context.inputs).length > 0 ? `- User Inputs: ${JSON.stringify(context.inputs)}` : ''}

Provide the task details in this JSON format:
{
  "title": "concise task title",
  "description": "detailed task description",
  "expectedOutput": "specific deliverable or outcome",
  "priority": "high|medium|low",
  "estimatedTime": "time estimate",
  "requiredSkills": ["skill1", "skill2"],
  "dependencies": ["list any task IDs this depends on, or empty array"]
}
`;

      const response = await this.llm.invoke(prompt);
      const taskDetails = this.parseTaskGeneration(response.content);

      if (!taskDetails) {
        logger.warn('⚠️ Could not parse generated task details');
        return null;
      }

      // Find suitable agent
      const suitableAgent = await this.findSuitableAgent(
        taskDetails.requiredSkills,
        context.availableAgents
      );

      if (!suitableAgent) {
        logger.warn('⚠️ No suitable agent found for generated task');
        return null;
      }

      // Create the new task
      const newTask = new Task({
        id: nanoid(),
        title: taskDetails.title,
        description: taskDetails.description,
        expectedOutput: taskDetails.expectedOutput,
        agent: suitableAgent,
        priority: taskDetails.priority as 'high' | 'medium' | 'low',
        resourceRequirements: {
          estimatedTime: taskDetails.estimatedTime,
          skillsRequired: taskDetails.requiredSkills,
        },
        dependencies: taskDetails.dependencies,
        adaptable: true,
        isDeliverable: gap.category === 'deliverable',
      });

      logger.info(`✅ Generated new task: ${newTask.title}`);

      return newTask;
    } catch (error) {
      logger.error(`❌ Error generating task for gap:`, error);
      return null;
    }
  }

  /**
   * Find a suitable agent for the required skills
   */
  private async findSuitableAgent(
    requiredSkills: string[],
    availableAgents: Agent[]
  ): Promise<Agent | null> {
    // Create a dummy task for agent selection
    const dummyTask = new Task({
      id: 'temp',
      description: 'Temporary task for agent selection',
      expectedOutput: 'N/A',
      agent: availableAgents[0], // Temporary assignment
      resourceRequirements: {
        skillsRequired: requiredSkills,
      },
    });

    return this.taskAnalyzer.selectOptimalAgent(
      dummyTask,
      availableAgents,
      []
    );
  }

  /**
   * Parse task generation response
   */
  private parseTaskGeneration(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Generated Task',
        description: parsed.description || 'Task generated to fill identified gap',
        expectedOutput: parsed.expectedOutput || 'Complete the task successfully',
        priority: parsed.priority || 'medium',
        estimatedTime: parsed.estimatedTime || '2-3 hours',
        requiredSkills: parsed.requiredSkills || [],
        dependencies: parsed.dependencies || [],
      };
    } catch (error) {
      logger.error('Error parsing task generation response:', error);
      return null;
    }
  }

  /**
   * Generate continuous optimization tasks
   */
  async generateContinuousOptimizationTasks(
    recommendedTasks: any[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    const newTasks: Task[] = [];

    for (const recommendation of recommendedTasks) {
      try {
        const taskPrompt = `
Create a specific optimization task based on this recommendation:

Recommendation: ${recommendation.description}
Type: ${recommendation.type}
Priority: ${recommendation.priority}
Context: ${recommendation.context || 'General optimization'}

Project Status:
- Phase: ${context.projectPhase}
- Progress: ${context.projectProgress}%
- Performance Score: ${context.performanceScore}

Generate a task in JSON format:
{
  "title": "clear, action-oriented title",
  "description": "detailed description with specific steps",
  "expectedOutput": "measurable outcome",
  "priority": "high|medium|low",
  "estimatedTime": "realistic time estimate",
  "requiredSkills": ["required skills"]
}
`;

        const response = await this.llm.invoke(taskPrompt);
        const taskDetails = this.parseTaskGeneration(response.content);

        if (taskDetails) {
          // Find suitable agent
          const agent = await this.findSuitableAgent(
            taskDetails.requiredSkills,
            context.availableAgents
          );

          if (agent) {
            const newTask = new Task({
              id: nanoid(),
              title: taskDetails.title,
              description: taskDetails.description,
              expectedOutput: taskDetails.expectedOutput,
              agent: agent,
              priority: taskDetails.priority as 'high' | 'medium' | 'low',
              resourceRequirements: {
                estimatedTime: taskDetails.estimatedTime,
                skillsRequired: taskDetails.requiredSkills,
              },
              adaptable: true,
              dynamicPriority: true,
            });

            newTasks.push(newTask);
            logger.info(`✅ Generated optimization task: ${newTask.title}`);
          }
        }
      } catch (error) {
        logger.error('Error generating optimization task:', error);
      }
    }

    return newTasks;
  }
}
