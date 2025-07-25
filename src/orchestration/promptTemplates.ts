/**
 * Orchestration Prompt Templates
 *
 * This module contains LLM prompt templates for various orchestration tasks.
 * These templates provide structured prompts for task selection, adaptation,
 * generation, and workflow optimization.
 */

import { Task } from '../index';
import { OrchestrationContext, TaskGap } from './intelligentOrchestrator';

/**
 * Template for task selection prompts
 */
export class TaskSelectionPromptTemplate {
  static build(
    context: OrchestrationContext,
    projectGoal: string,
    availableTasks: Task[]
  ): string {
    return `
# INTELLIGENT TASK SELECTION

## PROJECT GOAL
${projectGoal}

## CURRENT CONTEXT
- **Active Tasks**: ${context.activeTasks.length}
- **Available Agents**: ${context.availableAgents.map((a) => a.name).join(', ')}
- **Project Progress**: ${context.projectProgress}%
- **Blocked Tasks**: ${context.blockedTasks.length}
- **Code Coverage**: ${context.codeCoverage}%
- **Performance Score**: ${context.performanceScore}
- **Current Workload**: ${context.workload}
- **Project Phase**: ${context.projectPhase}

## EXISTING TASKS IN TEAM
${
  context.existingTasks.length > 0
    ? context.existingTasks
        .map(
          (task, index) => `
### Existing Task ${index + 1}: ${task.description}
- **Status**: ${task.status}
- **Agent**: ${task.agent?.name || 'Unassigned'}
- **Skills Required**: ${
            task.resourceRequirements?.skillsRequired?.join(', ') ||
            'Not specified'
          }
- **Dependencies**: ${
            task.resourceRequirements?.dependencies?.join(', ') || 'None'
          }
- **Expected Output**: ${task.expectedOutput}
`
        )
        .join('')
    : '**No existing tasks** - Starting fresh with orchestration'
}

## AVAILABLE TASKS IN REPOSITORY
${availableTasks
  .map(
    (task, index) => `
### Task ${index + 1}: ${task.description}
- **Category**: ${
      task.resourceRequirements?.skillsRequired?.join(', ') || 'General'
    }
- **Estimated Time**: ${
      task.resourceRequirements?.estimatedTime || 'Not specified'
    }
- **Required Skills**: ${
      task.resourceRequirements?.skillsRequired?.join(', ') || 'General'
    }
- **Dependencies**: ${
      task.resourceRequirements?.dependencies?.join(', ') || 'None'
    }
- **Adaptable**: ${task.adaptable ? 'Yes' : 'No'}
- **Agent**: ${task.agent?.name || 'Auto-select'}
${task.orchestrationRules ? `- **Rules**: ${task.orchestrationRules}` : ''}
`
  )
  .join('')}

## SELECTION CRITERIA
1. **Strategic Alignment** (25%): Tasks that directly contribute to the project goal
2. **Gap Analysis** (25%): Tasks that fill missing capabilities not covered by existing tasks
3. **Dependency Resolution** (20%): Tasks that unblock other work or have satisfied dependencies
4. **Resource Optimization** (15%): Tasks that match available agent skills and capacity
5. **Risk Mitigation** (10%): Tasks that address critical risks or technical debt
6. **Complementarity** (5%): Tasks that work well with existing tasks

## INSTRUCTIONS
Select the optimal tasks for the current context. Consider:
${
  context.existingTasks.length > 0
    ? `- **Build upon existing work**: Complement the ${
        context.existingTasks.length
      } existing tasks
- **Avoid duplication**: Don't select tasks that overlap significantly with existing ones
- **Fill gaps**: Prioritize tasks that add missing skills or capabilities
- **Maximum ${Math.max(
        0,
        5 - context.existingTasks.length
      )} additional tasks** can be added`
    : `- Maximum ${
        context.activeTasks.length < 3 ? 3 - context.activeTasks.length : 0
      } new tasks can be started`
}
- Prioritize unblocking critical paths
- Balance workload across available agents
- Ensure prerequisite tasks are completed first

## RESPONSE FORMAT
Respond with a JSON object:

\`\`\`json
{
  "selectedTasks": [
    {
      "taskIndex": 0,
      "priority": "high|medium|low",
      "reasoning": "Why this task was selected and why now",
      "suggestedAgent": "agent_name or auto_select",
      "estimatedImpact": "Expected impact on project progress",
      "riskFactors": "Potential risks or challenges",
      "adaptations": "Suggested modifications if allowed"
    }
  ],
  "overallStrategy": "High-level explanation of the selection strategy",
  "expectedOutcomes": "What we expect to achieve with these tasks",
  "riskAssessment": "Overall risks and mitigation strategies",
  "nextReview": "When to reassess task selection (in minutes)"
}
\`\`\`
`;
  }
}

/**
 * Template for task adaptation prompts
 */
export class TaskAdaptationPromptTemplate {
  static build(
    task: Task,
    context: OrchestrationContext,
    instructions: string
  ): string {
    return `
# INTELLIGENT TASK ADAPTATION

## TASK TO ADAPT
**Description**: ${task.description}
**Current Agent**: ${task.agent?.name || 'Auto-select'}
**Estimated Time**: ${
      task.resourceRequirements?.estimatedTime || 'Not specified'
    }
**Required Skills**: ${
      task.resourceRequirements?.skillsRequired?.join(', ') || 'General'
    }
**Current Priority**: Medium (default)
**Template**: ${task.template ? 'Yes' : 'No'}
**Adaptable**: ${task.adaptable ? 'Yes' : 'No'}

## ORCHESTRATION RULES
${task.orchestrationRules || 'No specific rules provided'}

## CURRENT CONTEXT
- **Available Agents**: ${context.availableAgents
      .map((a) => `${a.name} (${a.role})`)
      .join(', ')}
- **Resource Availability**: ${context.resourceAvailability}
- **Time Constraints**: ${context.timeConstraints}
- **Quality Requirements**: ${context.qualityRequirements}
- **Project Phase**: ${context.projectPhase}
- **Current Workload**: ${context.workload}

## TEAM-LEVEL INSTRUCTIONS
${instructions}

## ADAPTATION GUIDELINES
1. **Agent Assignment**: Choose the best-suited agent based on skills and availability
2. **Scope Adjustment**: Scale complexity based on time constraints and priorities
3. **Skill Matching**: Ensure required skills align with assigned agent capabilities
4. **Quality Standards**: Maintain or improve quality requirements
5. **Timeline Optimization**: Adjust estimates based on current project pressure

## ADAPTATION OPTIONS
- **Split Task**: Break into smaller, parallelizable components
- **Merge Opportunity**: Combine with related tasks for efficiency
- **Priority Adjustment**: Increase/decrease based on current needs
- **Agent Reassignment**: Optimize for skills and workload
- **Scope Modification**: Adjust deliverables based on constraints
- **Quality Level**: Adapt quality gates based on project phase

## INSTRUCTIONS
Adapt the task to current circumstances while respecting orchestration rules.
${
  task.adaptable
    ? 'Full adaptation allowed.'
    : 'WARNING: This task has limited adaptability. Respect the constraints.'
}

## RESPONSE FORMAT
Respond with a JSON object:

\`\`\`json
{
  "adaptedTask": {
    "description": "Adapted task description",
    "agent": "optimal_agent_name or auto_select",
    "priority": "high|medium|low",
    "estimatedTime": "adjusted time estimate",
    "requiredSkills": ["skill1", "skill2"],
    "adaptationLevel": "minor|moderate|major",
    "qualityGates": ["gate1", "gate2"]
  },
  "adaptationReasoning": "Detailed explanation of why these adaptations were made",
  "impactAssessment": "How adaptations affect project timeline and quality",
  "riskMitigation": "Measures to address any new risks introduced",
  "alternativeApproaches": "Other adaptation options considered",
  "reviewTriggers": "Conditions that would require task re-adaptation"
}
\`\`\`
`;
  }
}

/**
 * Template for new task generation prompts
 */
export class TaskGenerationPromptTemplate {
  static build(
    gap: TaskGap,
    context: OrchestrationContext,
    instructions: string
  ): string {
    return `
# INTELLIGENT TASK GENERATION

## IDENTIFIED GAP
**Description**: ${gap.description}
**Category**: ${gap.category}
**Estimated Complexity**: ${gap.estimatedComplexity}
**Required Skills**: ${gap.requirements.join(', ')}
**Dependencies**: ${gap.dependencies.join(', ') || 'None'}

## CURRENT TEAM CONTEXT
- **Available Agents**: ${context.availableAgents
      .map((a) => `${a.name} (${a.role})`)
      .join(', ')}
- **Current Workload**: ${context.workload}
- **Project Phase**: ${context.projectPhase}
- **Quality Requirements**: ${context.qualityRequirements}
- **Resource Availability**: ${context.resourceAvailability}

## ORCHESTRATION STRATEGY
${instructions}

## GENERATION GUIDELINES
1. **Gap Analysis**: Ensure the new task addresses the identified gap completely
2. **Team Integration**: Design task to fit seamlessly with current workflow
3. **Skill Utilization**: Leverage available team skills optimally
4. **Quality Alignment**: Match current project quality standards
5. **Timeline Consideration**: Respect project deadlines and constraints

## TASK DESIGN PRINCIPLES
- **Atomic Responsibility**: Single, clear purpose and outcome
- **Testable Deliverables**: Measurable success criteria
- **Resource Efficiency**: Optimal use of available skills and time
- **Risk Awareness**: Consider and mitigate potential complications
- **Future Adaptation**: Design for potential future modifications

## INSTRUCTIONS
Generate a comprehensive task that fills the identified gap while integrating
seamlessly with the current team workflow and project requirements.

## RESPONSE FORMAT
Respond with a JSON object:

\`\`\`json
{
  "generatedTask": {
    "description": "Detailed task description addressing the gap",
    "expectedOutput": "Clear definition of deliverables",
    "agent": "optimal_agent_name or auto_select",
    "category": "task category",
    "priority": "high|medium|low",
    "estimatedTime": "realistic time estimate",
    "requiredSkills": ["skill1", "skill2"],
    "dependencies": ["dependency1", "dependency2"],
    "acceptanceCriteria": ["criterion1", "criterion2"],
    "qualityGates": ["gate1", "gate2"],
    "riskFactors": ["risk1", "risk2"],
    "adaptable": true,
    "orchestrationRules": "Specific rules for this generated task"
  },
  "gapAnalysis": "How this task addresses the identified gap",
  "integrationStrategy": "How this task fits with existing workflow",
  "successMetrics": "How to measure task success",
  "fallbackOptions": "Alternative approaches if primary approach fails",
  "reviewSchedule": "When to reassess this generated task"
}
\`\`\`
`;
  }
}

/**
 * Template for workflow optimization prompts
 */
export class WorkflowOptimizationPromptTemplate {
  static build(
    context: OrchestrationContext,
    performanceIssues: string[],
    instructions: string
  ): string {
    return `
# WORKFLOW OPTIMIZATION ANALYSIS

## CURRENT PERFORMANCE ISSUES
${performanceIssues
  .map((issue) => `- **${issue}**: Requires immediate attention`)
  .join('\n')}

## WORKFLOW METRICS
- **Active Tasks**: ${context.activeTasks.length}
- **Blocked Tasks**: ${context.blockedTasks.length}
- **Available Agents**: ${context.availableAgents.length}
- **Project Progress**: ${context.projectProgress}%
- **Performance Score**: ${context.performanceScore}
- **Code Coverage**: ${context.codeCoverage}%

## BOTTLENECK ANALYSIS
${
  context.blockedTasks.length > 0
    ? `
### Blocked Tasks
${context.blockedTasks.map((task) => `- ${task.description}`).join('\n')}
`
    : 'No blocked tasks identified'
}

## RESOURCE UTILIZATION
- **Workload Distribution**: ${context.workload}
- **Agent Availability**: ${context.resourceAvailability}
- **Skill Coverage**: Analyzing based on active tasks

## ORCHESTRATION STRATEGY
${instructions}

## OPTIMIZATION OBJECTIVES
1. **Eliminate Blockers**: Remove impediments to workflow progress
2. **Balance Workload**: Distribute tasks optimally across agents
3. **Improve Throughput**: Increase task completion rate
4. **Enhance Quality**: Maintain or improve deliverable quality
5. **Reduce Waste**: Eliminate redundant or low-value activities

## OPTIMIZATION STRATEGIES
- **Task Reordering**: Adjust task sequence for better flow
- **Resource Reallocation**: Redistribute agents based on priorities
- **Parallel Processing**: Identify tasks that can run concurrently
- **Dependency Breaking**: Reduce task interdependencies
- **Skill Development**: Address skill gaps through task assignment
- **Quality Gates**: Optimize review and approval processes

## INSTRUCTIONS
Analyze the current workflow and provide specific optimization recommendations
that address the identified performance issues while maintaining quality standards.

## RESPONSE FORMAT
Respond with a JSON object:

\`\`\`json
{
  "optimizations": [
    {
      "type": "task_reordering|resource_reallocation|parallel_processing|dependency_breaking",
      "priority": "high|medium|low",
      "description": "Specific optimization action",
      "expectedImpact": "Quantified improvement expected",
      "implementation": "Step-by-step implementation plan",
      "riskFactors": "Potential risks and mitigation strategies",
      "timeframe": "Implementation timeline",
      "successMetrics": "How to measure optimization success"
    }
  ],
  "bottleneckResolution": "Strategy for addressing current bottlenecks",
  "resourceOptimization": "How to better utilize available resources",
  "qualityImpact": "Effect on quality metrics and deliverables",
  "performanceProjection": "Expected performance improvements",
  "monitoringPlan": "How to track optimization effectiveness",
  "rollbackStrategy": "Plan if optimizations don't work as expected"
}
\`\`\`
`;
  }
}

/**
 * Template for performance analysis prompts
 */
export class PerformanceAnalysisPromptTemplate {
  static build(
    context: OrchestrationContext,
    historicalData: any[],
    instructions: string
  ): string {
    return `
# PERFORMANCE ANALYSIS AND IMPROVEMENT

## CURRENT PERFORMANCE METRICS
- **Task Completion Rate**: ${
      context.activeTasks.length > 0 ? 'Calculating...' : 'No active tasks'
    }
- **Quality Score**: ${context.performanceScore}
- **Code Coverage**: ${context.codeCoverage}%
- **Project Progress**: ${context.projectProgress}%
- **Team Utilization**: ${context.workload}

## TREND ANALYSIS
${
  historicalData.length > 0
    ? 'Historical data available for trend analysis'
    : 'No historical data available'
}

## ORCHESTRATION STRATEGY
${instructions}

## PERFORMANCE DIMENSIONS
1. **Velocity**: Task completion speed and throughput
2. **Quality**: Deliverable quality and defect rates
3. **Efficiency**: Resource utilization and waste reduction
4. **Predictability**: Estimation accuracy and delivery consistency
5. **Adaptability**: Response to changing requirements

## ANALYSIS OBJECTIVES
- Identify performance patterns and trends
- Detect bottlenecks and inefficiencies
- Recommend specific improvements
- Establish performance baselines
- Create actionable optimization plan

## INSTRUCTIONS
Perform comprehensive performance analysis and provide data-driven
recommendations for improvement.

## RESPONSE FORMAT
Respond with a JSON object:

\`\`\`json
{
  "performanceAssessment": {
    "overall_score": "0-100",
    "velocity_score": "0-100",
    "quality_score": "0-100",
    "efficiency_score": "0-100",
    "predictability_score": "0-100"
  },
  "keyFindings": [
    {
      "area": "performance area",
      "finding": "specific observation",
      "impact": "business impact",
      "confidence": "high|medium|low"
    }
  ],
  "improvementRecommendations": [
    {
      "recommendation": "specific improvement action",
      "expectedImpact": "quantified improvement",
      "effort": "high|medium|low",
      "timeline": "implementation timeframe",
      "priority": "high|medium|low"
    }
  ],
  "performanceTargets": {
    "velocity_target": "specific target",
    "quality_target": "specific target",
    "efficiency_target": "specific target"
  },
  "monitoringStrategy": "How to track improvements",
  "nextReview": "When to reassess performance"
}
\`\`\`
`;
  }
}

/**
 * Main prompt template factory
 */
export class OrchestrationPromptFactory {
  static createTaskSelectionPrompt = TaskSelectionPromptTemplate.build;
  static createTaskAdaptationPrompt = TaskAdaptationPromptTemplate.build;
  static createTaskGenerationPrompt = TaskGenerationPromptTemplate.build;
  static createWorkflowOptimizationPrompt =
    WorkflowOptimizationPromptTemplate.build;
  static createPerformanceAnalysisPrompt =
    PerformanceAnalysisPromptTemplate.build;
}
