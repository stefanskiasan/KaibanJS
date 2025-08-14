/**
 * Orchestration Prompt Templates
 *
 * This module contains LLM prompt templates for various orchestration tasks.
 * These templates provide structured prompts for task selection, adaptation,
 * generation, and workflow optimization.
 */

import { Task } from '../index';
import { OrchestrationContext, TaskGap } from './core/OrchestrationContext';
import { StrategyParser, ParsedStrategy } from './utils/StrategyParser';
import { DomainPromptEnhancer } from './utils/DomainPromptEnhancer';

/**
 * Template for task selection prompts
 */
export class TaskSelectionPromptTemplate {
  static build(
    context: OrchestrationContext,
    projectGoal: string,
    availableTasks: Task[],
    orchestrationMode: 'initial' | 'continuous' = 'initial',
    orchestrationStrategy?: string
  ): string {
    // Parse the orchestration strategy
    const parsedStrategy = orchestrationStrategy 
      ? StrategyParser.parseStrategy(orchestrationStrategy)
      : null;
    
    // Generate strategy-specific instructions
    const strategyInstructions = parsedStrategy 
      ? StrategyParser.generateStrategyInstructions(parsedStrategy, context.inputs || {})
      : '';
    
    const basePrompt = `
# INTELLIGENT TASK SELECTION - ${orchestrationMode.toUpperCase()} MODE

## ORCHESTRATION MODE: ${orchestrationMode.toUpperCase()}
${
  orchestrationMode === 'initial'
    ? `🚀 **INITIAL ORCHESTRATION**: Setting up the complete workflow from the beginning.
     Focus on: Comprehensive planning, dependency resolution, strategic foundation.`
    : `🔄 **CONTINUOUS ORCHESTRATION**: Adapting workflow based on real-time progress.
     Focus on: Incremental improvements, opportunity exploitation, dynamic adjustment.`
}

## PROJECT GOAL
${projectGoal}

${
  context.inputs && Object.keys(context.inputs).length > 0
    ? `## 🎯 USER INPUTS (PRIMARY DECISION FACTOR)
${Object.entries(context.inputs)
  .map(([key, value]) => `- **${key}**: ${JSON.stringify(value)}`)
  .join('\n')}

### 🧠 AUTONOMOUS INPUT ANALYSIS INSTRUCTIONS
**CRITICAL**: You must autonomously analyze the input structure above to understand:
1. **Identify Purpose**: Determine which input fields contain the main request/question
2. **Extract Context**: Find supplementary information (history, session, user data)
3. **Detect Patterns**: Recognize domain-specific data (product IDs, measurements, queries)
4. **No Assumptions**: Do NOT assume field names - analyze actual content to understand purpose
5. **Dynamic Matching**: Match input content with task goals, descriptions, and expected outputs

**EXAMPLE ANALYSIS**:
- If an input contains a question-like string → likely the main query
- If an input contains an array of previous messages → likely conversation history
- If an input contains IDs or codes → likely entity references
- If an input contains user/session identifiers → likely context data

**TASK SELECTION BASED ON INPUTS**:
- Analyze WHAT the inputs are asking for (not just field names)
- Match input content semantically with task goals and expected outputs
- Select tasks that can fulfill the actual request in the inputs
- Adapt task descriptions to specifically address the input content

**REMEMBER**: The input structure is dynamic - you must understand it autonomously!
`
    : ''
}

${
  strategyInstructions
    ? `## 📋 ORCHESTRATION STRATEGY GUIDANCE
${strategyInstructions}

These strategic guidelines should inform your task selection and prioritization decisions.
`
    : ''
}

## CURRENT CONTEXT
- **Active Tasks**: ${context.activeTasks.length}
- **Available Agents**: ${context.availableAgents.map((a) => a.name).join(', ')}
- **Project Progress**: ${context.projectProgress}%
- **Blocked Tasks**: ${context.blockedTasks.length}
- **Process Coverage**: ${context.processCoverage || context.codeCoverage}%
- **Quality Score**: ${context.qualityScore || context.performanceScore}
- **Current Workload**: ${context.workload}
- **Project Phase**: ${context.projectPhase}

## EXISTING TASKS IN TEAM
${
  context.existingTasks.length > 0
    ? context.existingTasks
        .map(
          (task, index) => `
### Existing Task ${index + 1}: ${task.description}
**IDENTIFICATION:**
- **ID**: ${task.id}
${task.title ? `- **Title**: ${task.title}` : ''}
- **Status**: ${task.status}
${task.duration ? `- **Duration So Far**: ${task.duration}ms` : ''}

**ASSIGNMENT & RESOURCES:**
- **Agent**: ${task.agent?.name || 'Unassigned'}
- **Skills Required**: ${
            task.resourceRequirements?.skillsRequired?.join(', ') ||
            'Not specified'
          }
- **Dependencies**: ${
            task.resourceRequirements?.dependencies?.join(', ') || 'None'
          }

**OUTPUT & GOALS:**
- **Expected Output**: ${task.expectedOutput}
${task.goal ? `- **Goal**: ${task.goal}` : ''}
- **Is Deliverable**: ${task.isDeliverable ? 'Yes' : 'No'}

**ORCHESTRATION STATE:**
- **Priority**: ${task.priority || 'medium'}
- **Adaptable**: ${task.adaptable ? 'Yes' : 'No'}
- **Parallel Execution**: ${task.allowParallelExecution ? 'Yes' : 'No'}
${
  task.qualityGates && task.qualityGates.length > 0
    ? `- **Quality Gates**: ${task.qualityGates.join(', ')}`
    : ''
}
${task.result ? `- **Has Result**: Yes (Task has been executed)` : ''}
`
        )
        .join('')
    : '**No existing tasks** - Starting fresh with orchestration'
}

## AVAILABLE TASKS IN REPOSITORY
${(availableTasks || [])
  .map(
    (task, index) => `
### Task ${index + 1}: ${task.description}
**CORE PROPERTIES:**
- **REFERENCE ID**: ${task.referenceId || task.id || `task_${index}`} (USE THIS ID IN YOUR RESPONSE!)
- **ID**: ${task.id}
- **Index**: ${index} (for backward compatibility only - DO NOT USE)
${task.title ? `- **Title**: ${task.title}` : ''}
- **Expected Output**: ${task.expectedOutput}
${task.goal ? `- **Goal**: ${task.goal}` : ''}
- **Is Deliverable**: ${task.isDeliverable ? 'Yes - Final output' : 'No - Intermediate step'}

**RESOURCE & SKILLS:**
- **Agent**: ${task.agent?.name || 'Auto-select'}${
  task.allowAgentReassignment === false ? ' (FIXED - Cannot be reassigned)' : ' (Can be reassigned)'
}
- **Required Skills**: ${
      task.resourceRequirements?.skillsRequired?.join(', ') || 'General'
    }
- **Estimated Time**: ${
      task.resourceRequirements?.estimatedTime || 'Not specified'
    }
- **Dependencies**: ${
      task.resourceRequirements?.dependencies?.join(', ') || 'None'
    }

**ORCHESTRATION SETTINGS:**
- **Priority**: ${task.priority || 'medium'}${task.dynamicPriority ? ' (Dynamic)' : ' (Static)'}
- **Adaptable**: ${task.adaptable ? 'Yes - Can be modified' : 'No - Fixed requirements'}
- **Parallel Execution**: ${task.allowParallelExecution ? 'Yes - Can run in parallel' : 'No - Must run sequentially'}
- **Split Strategy**: ${task.splitStrategy || 'none'}
${
  task.mergeCompatible && task.mergeCompatible.length > 0
    ? `- **Merge Compatible**: ${task.mergeCompatible.join(', ')}`
    : ''
}
${
  task.orchestrationRules
    ? `- **Orchestration Rules**: ${task.orchestrationRules}`
    : ''
}

**SPECIAL ACTIVATION PROPERTIES:**
${(task as any).isFallback ? '- **🚨 IS FALLBACK TASK**: This task handles unanswerable questions' : ''}
${(task as any).activateOnLowRelevance ? '- **🔄 ACTIVATE ON LOW RELEVANCE**: Select this when no other tasks match well' : ''}
${(task as any).isFinalizer ? '- **🏁 IS FINALIZER**: This task must run last to format the output' : ''}
${(task as any).mustRunLast ? '- **⏭️ MUST RUN LAST**: This task should be executed after all others' : ''}

**VALIDATION & QUALITY:**
- **External Validation Required**: ${task.externalValidationRequired ? 'Yes' : 'No'}
${
  task.qualityGates && task.qualityGates.length > 0
    ? `- **Quality Gates**: ${task.qualityGates.join(', ')}`
    : ''
}
${task.referenceId ? `- **Reference ID**: ${task.referenceId}` : ''}

**MATCHING CRITERIA**: Analyze ALL properties above (ID, title, description, goal, expected output, deliverable status, skills, etc.) to match with user inputs.
`
  )
  .join('')}

## ${orchestrationMode.toUpperCase()} SELECTION CRITERIA
${
  orchestrationMode === 'initial'
    ? `### Initial Orchestration Priorities:
1. **Strategic Foundation** (30%): Tasks that establish core project architecture and direction
2. **Dependency Chain Setup** (25%): Tasks that enable downstream work and unblock critical paths
3. **Resource Optimization** (20%): Tasks that optimally utilize available agent skills from the start
4. **Risk Prevention** (15%): Tasks that proactively address known risks and establish quality gates
5. **Comprehensive Coverage** (10%): Tasks that ensure no critical areas are overlooked`
    : `### Continuous Orchestration Priorities:
1. **Opportunity Exploitation** (30%): Tasks that leverage new opportunities revealed by recent work
2. **Dynamic Gap Filling** (25%): Tasks that address gaps discovered during execution
3. **Progress Acceleration** (20%): Tasks that can speed up current bottlenecks or blocked work
4. **Quality Enhancement** (15%): Tasks that improve or validate recent outputs
5. **Adaptive Optimization** (10%): Tasks that optimize workflow based on current performance`
}

## INTELLIGENT TASK SELECTION RULES
When selecting tasks, apply this decision framework:

### 1. **RELEVANCE ASSESSMENT**
First, evaluate if ANY normal tasks can properly handle the user input:
- If user input is clear and domain-relevant → Select appropriate domain tasks
- If user input is unclear, test-like, or outside domain → GO TO FALLBACK MODE

### 2. **FALLBACK MODE ACTIVATION**
Automatically activate fallback mode when:
- User input appears to be a test (single words like "test", "hello", "hi")
- Question is outside the system's knowledge domain
- No normal tasks have high confidence for handling the input
- Input is too vague or ambiguous to process

When in fallback mode:
1. **MUST SELECT** tasks with activateOnLowRelevance=true or isFallback=true
2. **MUST ALSO SELECT** the finalizer task (isFinalizer=true or mustRunLast=true)
3. Set proper dependencies: Finalizer depends on fallback task

### 3. **TASK PROPERTY PRIORITIES**
- Tasks with isFallback=true → Use for unanswerable questions
- Tasks with activateOnLowRelevance=true → Use when confidence is low
- Tasks with isFinalizer=true → ALWAYS include for output formatting
- Tasks with mustRunLast=true → Execute after all other tasks

## EXAMPLE: FALLBACK MODE SELECTION
When you determine that fallback mode is needed (test input, unanswerable question, etc.):

**Selected Tasks Pattern:**
1. Select the task with isFallback=true or activateOnLowRelevance=true
2. Select the task with isFinalizer=true or mustRunLast=true
3. Ensure proper dependency: Finalizer depends on Fallback

**Remember**: The system relies on task properties, not hardcoded names!

## ${orchestrationMode.toUpperCase()} INSTRUCTIONS
${
  orchestrationMode === 'initial'
    ? `### Initial Orchestration Guidelines:
Select tasks to establish a comprehensive, well-structured workflow foundation:
${
  context.existingTasks.length > 0
    ? `- **Comprehensive Integration**: Integrate with the ${
        context.existingTasks.length
      } existing tasks
- **Strategic Enhancement**: Add tasks that strengthen the overall workflow architecture
- **Foundation Building**: Focus on tasks that enable long-term project success
- **Maximum ${Math.max(
        0,
        5 - context.existingTasks.length
      )} strategic additions** recommended`
    : `- **Complete Foundation**: Establish 3-5 core tasks that form the project backbone
- **Dependency Architecture**: Create clear task dependency chains
- **Resource Distribution**: Balance initial workload across all available agents`
}
- **Long-term Vision**: Prioritize tasks that support future workflow expansion
- **Quality Framework**: Include validation and quality assurance tasks from the start
- **Risk Mitigation**: Address potential issues before they become problems`
    : `### Continuous Orchestration Guidelines:
Select tasks that optimize and enhance the current workflow dynamically:
${
  context.existingTasks.length > 0
    ? `- **Incremental Enhancement**: Add 1-3 tasks that build upon recent progress
- **Opportunity Capture**: Leverage insights and opportunities from completed tasks
- **Dynamic Adaptation**: Adjust workflow based on current performance and bottlenecks
- **Smart Additions**: Only add tasks that provide clear immediate or strategic value`
    : `- **Reactive Planning**: Start 1-2 high-impact tasks based on current needs
- **Agile Response**: Focus on tasks that address immediate opportunities or challenges`
}
- **Performance Optimization**: Prioritize tasks that improve current workflow efficiency
- **Quality Enhancement**: Add validation or improvement tasks for recent work
- **Bottleneck Resolution**: Focus on tasks that unblock or accelerate current work`
}

## RESPONSE FORMAT
Respond with a JSON object:

**IMPORTANT**: Use the exact "REFERENCE ID" shown for each task, NOT the index number!
For example, if you see REFERENCE ID: TASK-FALLBACK-001, use that exact ID in your response.

\`\`\`json
{
  "selectedTasks": [
    {
      "taskId": "TASK-FALLBACK-001",  // Use the REFERENCE ID shown for the task!
      "priority": "high|medium|low",
      "reasoning": "Why this task was selected and why now",
      "suggestedAgent": "agent_name or auto_select (IMPORTANT: If task.allowAgentReassignment is false, you MUST use the pre-assigned agent from task.agent)",
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

    // Apply domain-specific enhancements
    return DomainPromptEnhancer.enhancePromptForDomain(basePrompt, context);
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
    // Parse the instructions as orchestration strategy
    const parsedStrategy = instructions 
      ? StrategyParser.parseStrategy(instructions)
      : null;
    
    // Generate strategy-specific adaptation guidance
    const strategyGuidance = parsedStrategy 
      ? StrategyParser.generateStrategyInstructions(parsedStrategy, context.inputs || {})
      : instructions;
    
    const basePrompt = `
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
**Adaptable**: ${task.adaptable ? 'Yes' : 'No'}

## ORCHESTRATION RULES
${
  task.orchestrationRules
    ? `
**IMPORTANT**: The following orchestration rules MUST be followed when adapting this task:
${task.orchestrationRules}

These rules take precedence over general adaptation guidelines.
`
    : 'No specific orchestration rules provided - use general adaptation guidelines.'
}

## CURRENT CONTEXT
- **Available Agents**: ${context.availableAgents
      .map((a) => `${a.name} (${a.role})`)
      .join(', ')}
- **Resource Availability**: ${context.resourceAvailability}
- **Time Constraints**: ${context.timeConstraints}
- **Quality Requirements**: ${context.qualityRequirements}
- **Project Phase**: ${context.projectPhase}
- **Current Workload**: ${context.workload}
${
  context.inputs && Object.keys(context.inputs).length > 0
    ? `
## 🎯 USER INPUTS (CRITICAL ADAPTATION CONTEXT)
${Object.entries(context.inputs)
  .map(([key, value]) => `- **${key}**: ${JSON.stringify(value)}`)
  .join('\n')}

**IMPORTANT**: Adapt the task to align with these user inputs. The adaptation should make the task more relevant to the user's specific context and requirements.`
    : ''
}

## TEAM-LEVEL STRATEGY
${strategyGuidance}

## ADAPTATION GUIDELINES
1. **Agent Assignment**: ${
  task.allowAgentReassignment 
    ? 'Choose the best-suited agent based on skills and availability'
    : 'AGENT IS FIXED - Use the pre-assigned agent (task.agent). DO NOT reassign to another agent.'
}
2. **Scope Adjustment**: Scale complexity based on time constraints and priorities
3. **Skill Matching**: Ensure required skills align with assigned agent capabilities
4. **Quality Standards**: Maintain or improve quality requirements
5. **Timeline Optimization**: Adjust estimates based on current project pressure

## ADAPTATION OPTIONS
- **Split Task**: Break into smaller, parallelizable components
  - Consider if task.splitStrategy is 'auto' or 'manual'
  - Identify natural boundaries for splitting
  - Ensure sub-tasks maintain coherence
- **Merge Opportunity**: Combine with related tasks for efficiency
  - Check task.mergeCompatible array for compatible task IDs
  - Verify merged scope remains manageable
  - Ensure agent can handle combined workload
- **Priority Adjustment**: Increase/decrease based on current needs
- **Agent Reassignment**: ${
  task.allowAgentReassignment 
    ? 'Optimize for skills and workload' 
    : 'NOT ALLOWED - This task must use its pre-assigned agent'
}
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
  "splitRecommendation": {
    "shouldSplit": true|false,
    "reasoning": "Why splitting is or isn't recommended",
    "subTasks": [
      {
        "description": "Sub-task 1 description",
        "estimatedTime": "time estimate",
        "agent": "suggested agent"
      }
    ]
  },
  "mergeRecommendation": {
    "shouldMerge": true|false,
    "mergeWithTaskIds": ["task_id1", "task_id2"],
    "reasoning": "Why merging is or isn't recommended",
    "mergedDescription": "Combined task description if merged"
  },
  "adaptationReasoning": "Detailed explanation of why these adaptations were made",
  "impactAssessment": "How adaptations affect project timeline and quality",
  "riskMitigation": "Measures to address any new risks introduced",
  "alternativeApproaches": "Other adaptation options considered",
  "reviewTriggers": "Conditions that would require task re-adaptation"
}
\`\`\`
`;

    // Apply domain-specific enhancements
    return DomainPromptEnhancer.enhancePromptForDomain(basePrompt, context);
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
    // Parse the instructions as orchestration strategy
    const parsedStrategy = instructions 
      ? StrategyParser.parseStrategy(instructions)
      : null;
    
    // Generate strategy-specific generation guidance
    const strategyGuidance = parsedStrategy 
      ? StrategyParser.generateStrategyInstructions(parsedStrategy, context.inputs || {})
      : instructions;
    
    const basePrompt = `
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
${
  context.inputs && Object.keys(context.inputs).length > 0
    ? `
## 🎯 USER INPUTS (TASK GENERATION GUIDANCE)
${Object.entries(context.inputs)
  .map(([key, value]) => `- **${key}**: ${JSON.stringify(value)}`)
  .join('\n')}

**CRITICAL**: Generate tasks that specifically address these user inputs. The generated task should be highly relevant to the user's context and help achieve their specific goals.`
    : ''
}

## ORCHESTRATION STRATEGY
${strategyGuidance}

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

    // Apply domain-specific enhancements
    return DomainPromptEnhancer.enhancePromptForDomain(basePrompt, context);
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
    // Parse the instructions as orchestration strategy
    const parsedStrategy = instructions 
      ? StrategyParser.parseStrategy(instructions)
      : null;
    
    // Generate strategy-specific optimization guidance
    const strategyGuidance = parsedStrategy 
      ? StrategyParser.generateStrategyInstructions(parsedStrategy, context.inputs || {})
      : instructions;
    
    const basePrompt = `
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
- **Quality Score**: ${context.qualityScore || context.performanceScore}
- **Process Coverage**: ${context.processCoverage || context.codeCoverage}%

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
${strategyGuidance}

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

    // Apply domain-specific enhancements
    return DomainPromptEnhancer.enhancePromptForDomain(basePrompt, context);
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
    // Parse the instructions as orchestration strategy
    const parsedStrategy = instructions 
      ? StrategyParser.parseStrategy(instructions)
      : null;
    
    // Generate strategy-specific performance guidance
    const strategyGuidance = parsedStrategy 
      ? StrategyParser.generateStrategyInstructions(parsedStrategy, context.inputs || {})
      : instructions;
    
    const basePrompt = `
# PERFORMANCE ANALYSIS AND IMPROVEMENT

## CURRENT PERFORMANCE METRICS
- **Task Completion Rate**: ${
      context.activeTasks.length > 0 ? 'Calculating...' : 'No active tasks'
    }
- **Quality Score**: ${context.performanceScore}
- **Process Coverage**: ${context.processCoverage || context.codeCoverage}%
- **Project Progress**: ${context.projectProgress}%
- **Team Utilization**: ${context.workload}

## TREND ANALYSIS
${
  historicalData.length > 0
    ? 'Historical data available for trend analysis'
    : 'No historical data available'
}

## ORCHESTRATION STRATEGY
${strategyGuidance}

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

    // Apply domain-specific enhancements
    return DomainPromptEnhancer.enhancePromptForDomain(basePrompt, context);
  }
}

/**
 * Template for task completion analysis prompts (for continuous orchestration)
 */
export class TaskCompletionAnalysisPromptTemplate {
  static build(
    completedTask: Task,
    context: OrchestrationContext,
    taskResult: any,
    instructions: string
  ): string {
    // Parse the instructions as orchestration strategy
    const parsedStrategy = instructions 
      ? StrategyParser.parseStrategy(instructions)
      : null;
    
    // Generate strategy-specific completion guidance
    const strategyGuidance = parsedStrategy 
      ? StrategyParser.generateStrategyInstructions(parsedStrategy, context.inputs || {})
      : instructions;
    
    const basePrompt = `
# INTELLIGENT TASK COMPLETION ANALYSIS

## COMPLETED TASK ANALYSIS
**Task**: ${completedTask.description}
**Agent**: ${completedTask.agent?.name || 'Unknown'}
**Expected Output**: ${completedTask.expectedOutput}
**Duration**: ${completedTask.duration || 'Not tracked'}
**Result Quality**: ${taskResult ? 'Completed' : 'Failed'}

## TASK RESULT
\`\`\`
${
  typeof taskResult === 'object'
    ? JSON.stringify(taskResult, null, 2)
    : taskResult || 'No result available'
}
\`\`\`

## CURRENT PROJECT STATE
- **Total Tasks**: ${context.existingTasks.length}
- **Active Tasks**: ${context.activeTasks.length}
- **Blocked Tasks**: ${context.blockedTasks.length}
- **Available Agents**: ${context.availableAgents.map((a) => a.name).join(', ')}
- **Project Progress**: ${context.projectProgress}%
- **Current Phase**: ${context.projectPhase}
- **Resource Availability**: ${context.resourceAvailability}

## REMAINING TASKS IN PIPELINE
${(context.existingTasks || [])
  .filter((task) => task && task.status !== 'DONE')
  .map(
    (task, index) => `
### Pending Task ${index + 1}: ${task.description}
- **Status**: ${task.status}
- **Agent**: ${task.agent?.name || 'Unassigned'}
- **Dependencies**: ${
      task.resourceRequirements?.dependencies?.join(', ') || 'None'
    }
- **Expected Output**: ${task.expectedOutput}
`
  )
  .join('')}

## ORCHESTRATION STRATEGY
${strategyGuidance}

## CONTINUOUS ORCHESTRATION ANALYSIS
Analyze the completed task's impact and determine if workflow adjustments are needed:

### 1. **Impact Assessment**
- How does this task completion affect the overall project?
- Are there any dependencies that are now unblocked?
- What new opportunities or risks have emerged?

### 2. **Gap Analysis**
- Are there any missing tasks now evident from the completion?
- Do we need additional validation or follow-up work?
- Are there integration points that require attention?

### 3. **Workflow Optimization**
- Can remaining tasks be optimized based on this completion?
- Should task priorities be adjusted?
- Are there parallel execution opportunities?

### 4. **Quality Assessment**
- Does the result quality suggest process improvements?
- Are there patterns that could improve future tasks?
- Should testing or validation be enhanced?

### 5. **Resource Reallocation**
- Should agent assignments be reconsidered?
- Are there skill gaps that have become apparent?
- Can workload be better distributed?

## INSTRUCTIONS
Based on the completed task analysis, provide actionable recommendations for workflow optimization. Focus on:
- **New Tasks**: Only suggest if critical gaps are identified
- **Task Modifications**: Adjust existing tasks based on new information
- **Priority Changes**: Reorder tasks based on dependencies and learnings
- **Resource Optimization**: Improve agent utilization and skill matching

## RESPONSE FORMAT
Respond with a JSON object:

\`\`\`json
{
  "analysis": {
    "taskImpact": "How this completion affects the overall project",
    "dependenciesUnblocked": ["list", "of", "unblocked", "tasks"],
    "newOpportunities": ["opportunity1", "opportunity2"],
    "identifiedRisks": ["risk1", "risk2"],
    "qualityAssessment": "Assessment of result quality and implications"
  },
  "recommendations": {
    "newTasks": [
      {
        "reason": "Why this task is needed",
        "description": "Task description",
        "priority": "high|medium|low",
        "suggestedAgent": "agent_name or auto_select",
        "estimatedTime": "time estimate",
        "dependencies": ["dependency1", "dependency2"]
      }
    ],
    "taskModifications": [
      {
        "taskId": "existing_task_id",
        "modificationType": "priority|scope|agent|dependencies",
        "newValue": "updated value",
        "reasoning": "Why this change is needed"
      }
    ],
    "priorityAdjustments": [
      {
        "taskId": "task_id",
        "newPriority": "high|medium|low",
        "reasoning": "Why priority should change"
      }
    ],
    "resourceOptimizations": [
      {
        "type": "agent_reassignment|workload_balancing|skill_development",
        "description": "What optimization to apply",
        "expectedBenefit": "Expected improvement"
      }
    ]
  },
  "urgency": "immediate|next_iteration|next_review",
  "confidenceLevel": "high|medium|low",
  "nextReviewTrigger": "When to reassess these recommendations"
}
\`\`\`
`;

    // Apply domain-specific enhancements
    return DomainPromptEnhancer.enhancePromptForDomain(basePrompt, context);
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
  static createTaskCompletionAnalysisPrompt =
    TaskCompletionAnalysisPromptTemplate.build;

  /**
   * Create initial orchestration task selection prompt
   */
  static createInitialTaskSelectionPrompt(
    context: OrchestrationContext,
    projectGoal: string,
    availableTasks: Task[],
    orchestrationStrategy?: string
  ): string {
    return TaskSelectionPromptTemplate.build(
      context,
      projectGoal,
      availableTasks,
      'initial',
      orchestrationStrategy
    );
  }

  /**
   * Create continuous orchestration task selection prompt
   */
  static createContinuousTaskSelectionPrompt(
    context: OrchestrationContext,
    projectGoal: string,
    availableTasks: Task[],
    orchestrationStrategy?: string
  ): string {
    return TaskSelectionPromptTemplate.build(
      context,
      projectGoal,
      availableTasks,
      'continuous',
      orchestrationStrategy
    );
  }
}
