/**
 * Intelligent Orchestrator for KaibanJS
 *
 * This module implements an AI-powered orchestrator that can autonomously:
 * - Select optimal tasks from a repository
 * - Adapt existing tasks to current circumstances
 * - Generate new tasks when gaps are identified
 * - Optimize workflow performance in real-time
 */

import { Agent, Task, Team } from '../index';
import { LLMConfig } from '../agents/baseAgent';
import { LangChainChatModel } from '../utils/agents';
import { logger } from '../utils/logger';
import { createOrchestrationLog } from '../subscribers/orchestrationSubscriber';
import { OrchestrationPromptFactory } from './promptTemplates';
import { TASK_STATUS_enum } from '../utils/enums';
import {
  OrchestrationContext,
  TaskGap,
  TaskModificationPermissions,
  TaskPerformanceHistory,
  TaskAdaptationHistory,
  OrchestrationMode,
  SplitStrategyPreference,
  OrchestrationMetrics,
  LLMCacheEntry,
  RecoveryStrategy,
  AgentWorkload,
  DependencyGraphNode,
  DependencyGraphEdge,
  DependencyGraphMetrics,
  PerformanceInsights,
  HealthCheckResult,
  ControlStatus,
  ConfigValidationResult,
  TaskCompletionRecommendations
} from './core/OrchestrationContext';
import { PerformanceMetricsManager } from './core/OrchestrationMetrics';
import { TaskRecoveryManager } from './recovery';

// Import analysis modules
import { ContextAnalyzer, GapAnalyzer, PerformanceAnalyzer, TaskAnalyzer } from './analysis';

// Import strategy modules
import { AdaptationStrategy, GenerationStrategy, SelectionStrategy } from './strategies';

// Import optimization modules
import { ResourceOptimizer, WorkflowOptimizer } from './optimization';

// Import utility modules
import { ParsingUtils, CalculationUtils, LoggingUtils, ContextUtils } from './utils';

// Static imports for LLM providers (browser-compatible)
let ChatOpenAI: any;
let ChatAnthropic: any;
let ChatGoogleGenerativeAI: any;

// Dynamic imports for browser compatibility
const loadLLMProviders = async () => {
  try {
    // Try to load each provider individually to handle partial failures
    if (!ChatOpenAI) {
      try {
        const openai = await import('@langchain/openai');
        ChatOpenAI = openai.ChatOpenAI;
        logger.debug('OpenAI provider loaded successfully');
      } catch (error) {
        logger.warn('OpenAI provider could not be loaded:', error);
      }
    }
    
    if (!ChatAnthropic) {
      try {
        const anthropic = await import('@langchain/anthropic');
        ChatAnthropic = anthropic.ChatAnthropic;
        logger.debug('Anthropic provider loaded successfully');
      } catch (error) {
        logger.warn('Anthropic provider could not be loaded:', error);
      }
    }
    
    if (!ChatGoogleGenerativeAI) {
      try {
        const google = await import('@langchain/google-genai');
        ChatGoogleGenerativeAI = google.ChatGoogleGenerativeAI;
        logger.debug('Google provider loaded successfully');
      } catch (error) {
        logger.warn('Google provider could not be loaded:', error);
      }
    }
  } catch (error) {
    logger.error('Unexpected error loading LLM providers:', error);
  }
};

/**
 * Intelligent Orchestrator Class
 *
 * Uses LLM-powered decision making to autonomously manage task workflows
 */
export class IntelligentOrchestrator {
  private team: Team;
  private availableTasks: Task[];
  private orchestrationStrategy: string;
  private mode: OrchestrationMode;
  private llm: LangChainChatModel | null;
  private conversationHistory: any[];
  private performanceMetrics: PerformanceMetricsManager;
  private taskAdaptationHistory: TaskAdaptationHistory[];
  private taskPerformanceHistory: Map<string, TaskPerformanceHistory>;
  private splitStrategyPreference: SplitStrategyPreference = 'moderate';

  // Performance optimization fields
  private llmCache: Map<string, LLMCacheEntry>;
  private cacheTimeout: number;
  private adaptationTimeout: number;
  
  // Recovery management
  private recoveryManager: TaskRecoveryManager;
  
  // Analysis modules
  private contextAnalyzer: ContextAnalyzer;
  private gapAnalyzer: GapAnalyzer;
  private performanceAnalyzer: PerformanceAnalyzer;
  private taskAnalyzer: TaskAnalyzer;
  
  // Strategy modules (initialized after LLM)
  private adaptationStrategy!: AdaptationStrategy;
  private generationStrategy!: GenerationStrategy;
  private selectionStrategy!: SelectionStrategy;
  
  // Optimization modules
  private resourceOptimizer: ResourceOptimizer;
  private workflowOptimizer: WorkflowOptimizer;

  constructor(team: Team) {
    this.team = team;
    this.availableTasks = team.backlogTasks || [];
    this.orchestrationStrategy = team.orchestrationStrategy || '';
    this.mode = team.mode || 'adaptive';
    this.llm = null; // Will be initialized lazily in ensureLLMInitialized()
    this.conversationHistory = [];
    this.performanceMetrics = new PerformanceMetricsManager();
    this.taskAdaptationHistory = [];
    this.taskPerformanceHistory = new Map();

    // Performance optimization: LLM response cache
    this.llmCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.adaptationTimeout = 30 * 1000; // 30 seconds per adaptation

    // Initialize recovery manager
    this.recoveryManager = new TaskRecoveryManager(
      team,
      (event, message, data) => this.logOrchestrationEvent(event, message, data)
    );
    
    // Initialize analysis modules
    this.contextAnalyzer = new ContextAnalyzer(team);
    this.gapAnalyzer = new GapAnalyzer(
      this.availableTasks,
      (agent) => ContextUtils.extractAgentSkills(agent)
    );
    this.performanceAnalyzer = new PerformanceAnalyzer(team);
    this.taskAnalyzer = new TaskAnalyzer(
      (agent) => ContextUtils.extractAgentSkills(agent),
      (task) => CalculationUtils.calculateTaskComplexity(task)
    );
    
    // Note: Strategy modules will be initialized after LLM is initialized
    // since they require LLM instance
    
    // Initialize optimization modules
    this.resourceOptimizer = new ResourceOptimizer(
      team,
      (task) => CalculationUtils.calculateTaskComplexity(task),
      (event, message, data) => this.logOrchestrationEvent(event, message, data)
    );
    this.workflowOptimizer = new WorkflowOptimizer(
      team,
      (event, message, data) => this.logOrchestrationEvent(event, message, data)
    );

    // Start performance metrics logging interval (every 5 minutes)
    this.performanceMetrics.startPerformanceMetricsLogging();

    // Performance optimization: Clean cache every 10 minutes
    setInterval(() => this.cleanExpiredCache(), 10 * 60 * 1000);
  }


  /**
   * Handle orchestration errors - fail fast, no fallbacks
   */
  private async handleOrchestrationError(
    operation: string,
    error: Error,
    context?: any
  ): Promise<any> {
    this.performanceMetrics.updateMetric('failed_operations', 1);

    logger.error(`Orchestration error in ${operation}:`, error.message);

    // Log detailed error information
    this.logOrchestrationEvent(
      'ORCHESTRATION_ERROR',
      `Orchestration error during ${operation}`,
      {
        operation,
        error: error.message,
        errorStack: error.stack,
        context: context ? JSON.stringify(context).substring(0, 500) : null,
        performanceMetrics: this.performanceMetrics.getAllMetrics(),
        recoveryAttempt: false,
      }
    );

    // Always throw error - no recovery attempts
    throw new Error(
      `Orchestration failed in ${operation}: ${error.message}. Orchestrator requires LLM to function.`
    );
  }








  /**
   * Ensure LLM is initialized (lazy initialization)
   */
  private async ensureLLMInitialized(): Promise<void> {
    if (!this.llm) {
      try {
        this.llm = await this.initializeLLM(this.team);
        
        if (!this.llm) {
          const errorMsg = 'LLM initialization failed. Orchestrator requires LLM to function. ' +
            'Please provide llmInstance or llmConfig when creating the team. ' +
            `Team has llmInstance: ${!!this.team?.llmInstance}, ` +
            `Team has llmConfig: ${!!this.team?.llmConfig}`;
          logger.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        logger.info('LLM initialized successfully, testing connection...');
        
        // Validate LLM connection before proceeding
        await this.validateLLMConnection(this.llm);
        
        logger.info('LLM connection validated, initializing strategy modules');
        
        // Initialize strategy modules that require LLM
        this.adaptationStrategy = new AdaptationStrategy(this.team, this.llm);
        this.generationStrategy = new GenerationStrategy(this.team, this.llm, this.taskAnalyzer, this.gapAnalyzer);
        this.selectionStrategy = new SelectionStrategy(this.team, this.llm, this.contextAnalyzer);
      } catch (error) {
        logger.error('Failed to initialize LLM in ensureLLMInitialized:', error);
        throw error;
      }
    }
  }

  /**
   * Validate LLM connection with a simple test call
   */
  private async validateLLMConnection(llm: LangChainChatModel): Promise<void> {
    try {
      logger.info('🔍 Testing LLM connection...');
      
      const testPrompt = 'Test connection. Respond with: OK';
      const startTime = Date.now();
      
      const response = await llm.invoke(testPrompt);
      const duration = Date.now() - startTime;
      
      if (!response || !response.content) {
        throw new Error('LLM returned empty response during connection test');
      }
      
      logger.info(`✅ LLM connection successful! Response time: ${duration}ms`);
      logger.debug('LLM test response:', response.content.toString().substring(0, 100));
      
    } catch (error) {
      const errorMsg = `❌ LLM connection test failed: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMsg);
      throw new Error(`LLM connection validation failed. ${errorMsg}. Please check your API key and network connection.`);
    }
  }

  /**
   * Initialize LLM instance for the orchestrator
   */
  private async initializeLLM(team: Team): Promise<LangChainChatModel | null> {
    try {
      // Load LLM providers first (browser-compatible)
      await loadLLMProviders();
      
      // Check if team has the expected structure
      if (!team) {
        logger.warn('Team object is null or undefined in initializeLLM');
        return null;
      }
      
      // Log the team structure for debugging
      logger.debug('Team structure in initializeLLM:', {
        hasLLMInstance: !!team.llmInstance,
        hasLLMConfig: !!team.llmConfig,
        llmConfigProvider: team.llmConfig?.provider,
        teamKeys: Object.keys(team || {}).slice(0, 10) // First 10 keys to avoid log spam
      });

      if (team.llmInstance) {
        logger.info('🔧 Using provided LLM instance');
        logger.debug('LLM instance details:', {
          constructor: team.llmInstance.constructor.name,
          hasInvoke: typeof team.llmInstance.invoke === 'function'
        });
        return team.llmInstance;
      }

      if (team.llmConfig) {
        logger.info(`🔧 Creating LLM from config - Provider: ${team.llmConfig.provider}, Model: ${team.llmConfig.model}`);
        logger.debug('LLM config details:', {
          provider: team.llmConfig.provider,
          model: team.llmConfig.model,
          temperature: team.llmConfig.temperature,
          maxRetries: team.llmConfig.maxRetries,
          hasApiKey: !!team.llmConfig.apiKey
        });
        return this.createLLMFromConfig(team.llmConfig);
      }

      // No LLM configuration - return null and let ensureLLMInitialized throw error
      logger.warn('No LLM instance or config found in team object');
      return null;
    } catch (error) {
      logger.error('Error in initializeLLM:', error);
      throw error;
    }
  }

  /**
   * Create LLM instance from configuration
   */
  private createLLMFromConfig(config: LLMConfig): LangChainChatModel {
    // Check if required provider is loaded
    if (config.provider === 'openai' && !ChatOpenAI) {
      throw new Error(
        'OpenAI provider not loaded. This may be due to a module loading issue in the browser environment.'
      );
    }
    if (config.provider === 'anthropic' && !ChatAnthropic) {
      throw new Error(
        'Anthropic provider not loaded. This may be due to a module loading issue in the browser environment.'
      );
    }
    if (config.provider === 'google' && !ChatGoogleGenerativeAI) {
      throw new Error(
        'Google provider not loaded. This may be due to a module loading issue in the browser environment.'
      );
    }

    // Get API key from config or environment (same logic as classical agents)
    const getApiKey = (provider: string): string => {
      // First, check if config.apiKey is provided
      if (config.apiKey) {
        // Check if it's an ENV placeholder (starts with 'ENV_')
        if (config.apiKey.startsWith('ENV_')) {
          // Extract the env var name: 'ENV_OPENAI_API_KEY' -> 'OPENAI_API_KEY'
          const envVarName = config.apiKey.substring(4); // Remove 'ENV_' prefix

          // Look up in team.env object (same as classical agents)
          const teamEnv = this.team.store?.getState?.()?.env || {};
          const envValue = teamEnv[envVarName];

          if (envValue && envValue !== config.apiKey) {
            logger.info(
              `🔑 Resolved ENV placeholder ${config.apiKey} -> ${envVarName}`
            );
            return envValue;
          }

          // Fallback: try browser environment or process.env
          if (
            typeof window !== 'undefined' &&
            (window as any).ENV?.[envVarName]
          ) {
            return (window as any).ENV[envVarName];
          }

          if (typeof process !== 'undefined' && process.env?.[envVarName]) {
            return process.env[envVarName];
          }

          logger.warn(
            `⚠️ ENV placeholder ${config.apiKey} could not be resolved. Using as literal value.`
          );
          return config.apiKey; // Use as-is if can't resolve
        }

        // It's a direct API key, use it
        return config.apiKey;
      }

      // Fallback: try to get from environment variables (original logic)
      const envKeys: Record<string, string[]> = {
        openai: ['OPENAI_API_KEY', 'VITE_OPENAI_API_KEY'],
        anthropic: ['ANTHROPIC_API_KEY'],
        google: ['GOOGLE_API_KEY'],
      };

      const keys = envKeys[provider] || [];
      for (const key of keys) {
        // Try team env first
        const teamEnv = this.team.store?.getState?.()?.env || {};
        if (teamEnv[key]) return teamEnv[key];

        // Try process.env
        if (typeof process !== 'undefined' && process.env?.[key]) {
          return process.env[key];
        }
      }

      throw new Error(
        `No API key found for provider '${provider}'. Check environment variables: ${keys.join(
          ', '
        )}`
      );
    };

    try {
      logger.info(`🚀 Creating ${config.provider} LLM instance...`);
      
      switch (config.provider) {
        case 'openai': {
          const apiKey = config.apiKey || getApiKey('openai');
          const modelName = config.model || 'gpt-4o-mini';
          logger.info(`🔑 Using OpenAI with model: ${modelName}`);
          
          // GPT-5 models don't support temperature parameter - only default 1.0
          // and use maxCompletionTokens instead of maxTokens
          const isGPT5 = modelName.startsWith('gpt-5') || modelName.startsWith('o3');
          
          const openAIConfig: any = {
            modelName: modelName,
            openAIApiKey: apiKey,
            maxRetries: config.maxRetries || 2,
            ...(config.configuration && {
              configuration: config.configuration,
            }),
          };
          
          // Handle GPT-5 specific parameters
          if (isGPT5) {
            // GPT-5 uses maxCompletionTokens instead of maxTokens
            // Set default of 16384 tokens for orchestration responses to prevent truncation
            openAIConfig.maxCompletionTokens = config.maxTokens || 16384;
            // GPT-5 doesn't support temperature parameter - only default 1.0
          } else {
            // Regular models support temperature and maxTokens
            if (config.temperature !== undefined) {
              openAIConfig.temperature = config.temperature || 0.3;
            }
            if (config.maxTokens) {
              openAIConfig.maxTokens = config.maxTokens;
            }
          }
          
          return new ChatOpenAI(openAIConfig);
        }

        case 'anthropic': {
          const apiKey = config.apiKey || getApiKey('anthropic');
          return new ChatAnthropic({
            model: config.model || 'claude-3-sonnet-20240229',
            temperature: config.temperature || 0.3,
            anthropicApiKey: apiKey,
            maxRetries: config.maxRetries || 2,
          });
        }

        case 'google': {
          const apiKey = config.apiKey || getApiKey('google');
          return new ChatGoogleGenerativeAI({
            modelName: config.model || 'gemini-pro',
            temperature: config.temperature || 0.3,
            apiKey: apiKey,
            maxRetries: config.maxRetries || 2,
          });
        }

        default:
          throw new Error(`Unsupported LLM provider: ${config.provider}`);
      }
    } catch (error) {
      logger.error(
        `Failed to create LLM instance for provider '${config.provider}':`,
        error
      );
      throw error;
    }
  }

  /**
   * Main orchestration method
   * Analyzes context and optimally arranges tasks
   * @param projectGoal - The overall goal for the orchestrator to optimize towards
   * @param preserveExistingTasks - Whether to keep existing tasks and build upon them (default: true)
   * @param inputs - User-provided inputs from team.start()
   */
  async orchestrateWorkflow(
    projectGoal: string,
    preserveExistingTasks: boolean = true,
    inputs: Record<string, unknown>
  ): Promise<Task[]> {
    const startTime = Date.now();
    this.updatePerformanceMetric('orchestration_calls', 1);

    try {
      // Initialize LLM and log activation in parallel
      const [_] = await Promise.all([
        this.ensureLLMInitialized(),
        (async () => {
          logger.info(
            `🎯 Starting intelligent orchestration for goal: ${projectGoal}`
          );
          
          // Log orchestration activation
          this.logOrchestrationEvent(
            'ACTIVATED',
            'Intelligent orchestration activated',
            {
              projectGoal,
              preserveExistingTasks,
              existingTasksCount: this.team.getTasks().length,
              availableTasksCount: this.availableTasks.length,
              mode: this.mode,
              allowTaskGeneration: this.team.allowTaskGeneration,
              orchestrationStrategy: this.orchestrationStrategy,
            }
          );
        })()
      ]);

      // Analyze current context
      const contextStartTime = Date.now();
      const context = await this.contextAnalyzer.analyzeCurrentContext(inputs);
      this.updatePerformanceMetric(
        'context_analysis_time',
        Date.now() - contextStartTime
      );

      // Pass inputs directly to context without any pre-filtering
      // The LLM will decide based on task properties whether to use fallback tasks

      // Log context analysis
      this.logOrchestrationEvent(
        'ANALYSIS_STARTED',
        'Analyzing current team and project context',
        {
          contextAnalysis: {
            activeTasks: context.activeTasks.length,
            availableAgents: context.availableAgents.length,
            projectProgress: context.projectProgress,
            blockedTasks: context.blockedTasks.length,
            workload: context.workload,
            projectPhase: context.projectPhase,
            resourceAvailability: context.resourceAvailability,
          },
        }
      );

      if (preserveExistingTasks) {
        logger.info(
          `📋 Building upon ${context.existingTasks.length} existing tasks`
        );
      }

      // Select optimal tasks from repository (considering existing tasks)
      const selectionStartTime = Date.now();
      const selectedTasks = await this.selectOptimalTasks(
        context,
        projectGoal,
        'initial'
      );
      this.updatePerformanceMetric(
        'task_selection_time',
        Date.now() - selectionStartTime
      );
      this.updatePerformanceMetric('tasks_selected', selectedTasks.length);

      // Generate new tasks if necessary and allowed
      const generationStartTime = Date.now();
      const generatedTasks = await this.generationStrategy.generateAdditionalTasks(
        context,
        selectedTasks
      );
      this.updatePerformanceMetric(
        'task_generation_time',
        Date.now() - generationStartTime
      );
      this.updatePerformanceMetric('tasks_generated', generatedTasks.length);

      // Adapt tasks to current circumstances (using batch processing for parallelization)
      const adaptationStartTime = Date.now();
      const newTasks = await this.adaptationStrategy.batchAdaptTasks([
        ...selectedTasks,
        ...generatedTasks,
      ]);
      this.updatePerformanceMetric(
        'task_adaptation_time',
        Date.now() - adaptationStartTime
      );
      this.updatePerformanceMetric('tasks_adapted', newTasks.length);

      // Predict potential failures and create recovery strategies
      const failurePredictionStart = Date.now();
      const failureProbabilities = this.predictTaskFailures(newTasks);
      const recoveryStrategies = this.recoveryManager.createTaskRecoveryStrategies(
        newTasks,
        failureProbabilities
      );
      this.updatePerformanceMetric(
        'failure_prediction_time',
        Date.now() - failurePredictionStart
      );

      // Log high-risk tasks
      const highRiskTasks = Array.from(failureProbabilities.entries())
        .filter(([_, prob]) => prob > 0.3)
        .map(([taskId, prob]) => {
          const task = newTasks.find((t) => t.id === taskId);
          return {
            taskId,
            description: task?.description || 'Unknown',
            failureProbability: Math.round(prob * 100),
            recoveryStrategies: recoveryStrategies.get(taskId) || [],
          };
        });

      if (highRiskTasks.length > 0) {
        this.logOrchestrationEvent(
          'HIGH_RISK_TASKS_IDENTIFIED',
          'High-risk tasks identified with recovery strategies',
          {
            highRiskCount: highRiskTasks.length,
            totalTasks: newTasks.length,
            riskDetails: highRiskTasks,
          }
        );
      }

      // Perform resource optimization
      await this.resourceOptimizer.optimizeResourceUtilization(context, newTasks);

      const endTime = Date.now();
      const duration = endTime - startTime;
      this.updatePerformanceMetric('successful_operations', 1);
      this.updatePerformanceMetric('total_orchestration_time', duration);

      if (preserveExistingTasks) {
        // Add only new tasks to existing ones
        this.addOrchestrationTasks(newTasks);
        const allTasks = [...context.existingTasks, ...newTasks];

        // Log completion
        this.logOrchestrationEvent(
          'COMPLETED',
          'Orchestration completed successfully',
          {
            totalDuration: duration,
            results: {
              existingTasksPreserved: context.existingTasks.length,
              newTasksAdded: newTasks.length,
              tasksGenerated: generatedTasks.length,
              tasksAdapted: newTasks.filter((task) => task && task.adaptable)
                .length,
              totalTasks: allTasks.length,
            },
            finalWorkloadDistribution:
              this.resourceOptimizer.calculateWorkloadDistribution(allTasks),
            orchestrationStats: {
              llmCallsCount: this.conversationHistory.length,
              llmOperationsOnly: true,
              gapAnalysisExecuted: true,
              performanceOptimizations: 0,
            },
          }
        );

        logger.info(
          `✅ Orchestration complete. Total: ${allTasks.length} tasks (${context.existingTasks.length} existing + ${newTasks.length} new).`
        );
        return allTasks;
      } else {
        // Replace all tasks (original behavior)
        this.updateTeamTasks(newTasks);

        // Log completion
        this.logOrchestrationEvent(
          'COMPLETED',
          'Orchestration completed with task replacement',
          {
            totalDuration: duration,
            results: {
              existingTasksPreserved: 0,
              newTasksAdded: newTasks.length,
              tasksGenerated: generatedTasks.length,
              tasksAdapted: newTasks.filter((task) => task && task.adaptable)
                .length,
              totalTasks: newTasks.length,
            },
            finalWorkloadDistribution:
              this.resourceOptimizer.calculateWorkloadDistribution(newTasks),
            orchestrationStats: {
              llmCallsCount: this.conversationHistory.length,
              llmOperationsOnly: true,
              gapAnalysisExecuted: true,
              performanceOptimizations: 0,
            },
          }
        );

        logger.info(
          `✅ Orchestration complete. Arranged ${newTasks.length} tasks.`
        );
        return newTasks;
      }
    } catch (error) {
      logger.error('❌ Orchestration failed:', error);

      // Log error and fail fast - no recovery attempts
      await this.handleOrchestrationError(
        'workflow_orchestration',
        error instanceof Error ? error : new Error(String(error)),
        {
          projectGoal,
          preserveExistingTasks,
          existingTasksCount: this.team.getTasks().length,
        }
      );

      // This line will never be reached as handleOrchestrationError always throws
      return [];
    }
  }

  /**
   * Analyze current team and project context
   */
  private async analyzeCurrentContext(inputs: Record<string, unknown>): Promise<OrchestrationContext> {
    const teamState = this.team.store.getState();

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

    return {
      activeTasks: (teamState.tasks || []).filter(
        (task) => task && task.status === 'DOING'
      ),
      availableAgents: (teamState.agents || []).filter(
        (agent) => agent && agent.status !== 'BUSY'
      ),
      projectProgress,
      blockedTasks: (teamState.tasks || []).filter(
        (task) => task && task.status === 'BLOCKED'
      ),
      codeCoverage: 75, // Mock value - would be calculated from project metrics
      performanceScore: 85, // Mock value - would be calculated from project metrics
      workload,
      projectPhase,
      similarTasks: [],
      resourceAvailability,
      timeConstraints,
      qualityRequirements,
      existingTasks: teamState.tasks || [], // All existing tasks in the team
      inputs: inputs || teamState.inputs || {},
    };
  }

  /**
   * Select optimal tasks from available repository
   * Performs gap analysis considering existing tasks
   */
  private async selectOptimalTasks(
    context: OrchestrationContext,
    projectGoal: string,
    orchestrationMode: 'initial' | 'continuous' = 'initial'
  ): Promise<Task[]> {
    // Let the LLM handle all task selection intelligently
    // The LLM will select fallback tasks when needed based on task properties

    if (!this.llm) {
      this.updatePerformanceMetric('failed_operations', 1);
      throw new Error(
        'LLM is required for intelligent orchestration. Please provide llmInstance or llmConfig when creating the team.'
      );
    }

    const operationStartTime = Date.now();

    try {
      // Use appropriate prompt template based on orchestration mode
      const prompt =
        orchestrationMode === 'initial'
          ? OrchestrationPromptFactory.createInitialTaskSelectionPrompt(
              context,
              projectGoal,
              this.availableTasks,
              this.orchestrationStrategy
            )
          : OrchestrationPromptFactory.createContinuousTaskSelectionPrompt(
              context,
              projectGoal,
              this.availableTasks,
              this.orchestrationStrategy
            );

      const llmStartTime = Date.now();
      const response = await this.llm.invoke(prompt);
      const content = response.content.toString();
      this.updatePerformanceMetric('llm_calls', 1);
      this.updatePerformanceMetric(
        'llm_response_time',
        Date.now() - llmStartTime
      );

      // Parse structured JSON response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error(
          `LLM response did not contain valid JSON. Response: ${content.substring(
            0,
            200
          )}`
        );
      }

      const responseData = JSON.parse(jsonMatch[1]);
      
      // Debug logging to understand LLM response
      logger.info('🔍 LLM Response Data:', {
        selectedTasksCount: responseData.selectedTasks?.length || 0,
        selectedTaskIds: responseData.selectedTasks?.map((s: any) => s.taskId || s.taskIndex) || [],
        overallStrategy: responseData.overallStrategy?.substring(0, 100)
      });
      
      // Debug: Log initial selection
      logger.info('🔍 Processing selected tasks:', {
        taskIds: responseData.selectedTasks.map((s: any) => s.taskId || `index:${s.taskIndex}`),
        availableTasksCount: this.availableTasks?.length || 0
      });

      let selectedTasks = responseData.selectedTasks
        .filter(
          (selection: any) => {
            // Support both ID-based and index-based selection for backward compatibility
            if (selection.taskId) {
              // Find task by reference ID
              const taskExists = this.availableTasks?.some((t: any) => 
                t.referenceId === selection.taskId || t.id === selection.taskId
              );
              if (!taskExists) {
                logger.warn(`🚫 Task ID ${selection.taskId} not found`);
              }
              return taskExists;
            } else if (selection.taskIndex !== undefined) {
              // Fallback to index-based selection
              const isValid = selection.taskIndex >= 0 &&
                this.availableTasks &&
                selection.taskIndex < this.availableTasks.length;
              if (!isValid) {
                logger.warn(`🚫 Task index ${selection.taskIndex} is out of bounds or invalid`);
              }
              return isValid;
            }
            return false;
          }
        )
        .map((selection: any) => {
          let task;
          if (selection.taskId) {
            // Find task by reference ID or regular ID
            task = this.availableTasks.find((t: any) => 
              t.referenceId === selection.taskId || t.id === selection.taskId
            );
            logger.info(`📋 Mapped task by ID ${selection.taskId}:`, {
              title: task?.title || task?.description?.substring(0, 50),
              agent: task?.agent?.name || 'unknown',
              referenceId: task?.referenceId
            });
          } else {
            // Fallback to index-based selection
            task = this.availableTasks[selection.taskIndex];
            logger.info(`📋 Mapped task at index ${selection.taskIndex}:`, {
              title: task?.title || task?.description?.substring(0, 50),
              agent: task?.agent?.name || 'unknown',
              referenceId: task?.referenceId
            });
          }
          // Apply priority from LLM recommendation if task supports dynamic priority
          if (task && task.dynamicPriority && selection.priority) {
            task.priority = selection.priority;
          }
          return task;
        })
        .filter(
          (task: Task) => {
            if (!task) {
              logger.warn('🚫 Task is null or undefined, filtering out');
              return false;
            }
            const isValid = this.validateTaskAgainstRules(task, context);
            if (!isValid) {
              logger.warn(`🚫 Task failed validation: ${task.title || task.description?.substring(0, 50)}`);
            } else {
              logger.info(`✅ Task passed validation: ${task.title || task.description?.substring(0, 50)}`);
            }
            return isValid;
          }
        );

      // Apply performance-based learning if in learning mode
      if (this.mode === 'learning' || this.team.mode === 'learning') {
        selectedTasks = this.applyPerformanceBasedFiltering(selectedTasks);

        // Get performance insights
        const insights = this.getPerformanceInsights();
        if (insights.recommendations.length > 0) {
          logger.info(
            '📊 Performance insights:',
            insights.recommendations.join('; ')
          );
        }
      }

      // Post-process selected tasks to ensure proper dependencies
      // If we have both a fallback task and a finalizer, set dependencies
      const fallbackTask = selectedTasks.find((task: any) => 
        task.isFallback === true || task.activateOnLowRelevance === true
      );
      const finalizerTask = selectedTasks.find((task: any) =>
        task.isFinalizer === true || task.mustRunLast === true
      );
      
      if (fallbackTask && finalizerTask && fallbackTask.id !== finalizerTask.id) {
        // Ensure the finalizer depends on the fallback task
        if (!finalizerTask.dependencies || finalizerTask.dependencies.length === 0) {
          finalizerTask.dependencies = [fallbackTask.id || fallbackTask.referenceId || 'fallback'];
          logger.info(`🔗 Set finalizer to depend on fallback task: ${finalizerTask.dependencies[0]}`);
        }
      }
      
      logger.info(
        `🤖 LLM selected ${selectedTasks.length} tasks (${orchestrationMode} mode) with strategy: ${responseData.overallStrategy}`
      );
      logger.info(`🎯 Expected outcomes: ${responseData.expectedOutcomes}`);

      // Update conversation history with structured data
      this.conversationHistory.push({
        prompt,
        response: content,
        selectedTasks: selectedTasks.length,
        strategy: responseData.overallStrategy,
        expectedOutcomes: responseData.expectedOutcomes,
        orchestrationMode,
      });

      // Track performance metrics
      this.updatePerformanceMetric('task_selection_success', 1);
      this.updatePerformanceMetric(
        'selection_operation_time',
        Date.now() - operationStartTime
      );

      return selectedTasks;
    } catch (error) {
      logger.error('LLM task selection failed:', error);
      this.updatePerformanceMetric('failed_operations', 1);
      this.updatePerformanceMetric('task_selection_failures', 1);

      // Log error and fail fast
      await this.handleOrchestrationError(
        'task_selection',
        error instanceof Error ? error : new Error(String(error)),
        {
          context,
          projectGoal,
          orchestrationMode,
          availableTasksCount: this.availableTasks.length,
        }
      );
      
      // This line will never be reached as handleOrchestrationError always throws
      return [];
    }
  }

  /**
   * Generate additional tasks if gaps are identified
   */
  private async generateAdditionalTasks(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): Promise<Task[]> {
    const operationStartTime = Date.now();

    if (!this.team.allowTaskGeneration) {
      this.updatePerformanceMetric('task_generation_skipped', 1);
      return [];
    }

    // Identify gaps in task coverage
    const gapAnalysisStart = Date.now();
    const gaps = await this.gapAnalyzer.identifyTaskGaps(context, selectedTasks);
    this.updatePerformanceMetric(
      'gap_analysis_time',
      Date.now() - gapAnalysisStart
    );
    this.updatePerformanceMetric('gaps_identified', gaps.length);

    if (gaps.length === 0) {
      this.updatePerformanceMetric('no_gaps_found', 1);
      return [];
    }

    // Parallel task generation for all gaps
    const taskGenerationPromises = gaps.map(async (gap) => {
      const taskGenStart = Date.now();
      try {
        const newTask = await this.generateTaskForGap(gap, context);
        this.updatePerformanceMetric(
          'individual_task_generation_time',
          Date.now() - taskGenStart
        );
        return { success: true, task: newTask, gap };
      } catch (error) {
        logger.warn(
          `Failed to generate task for gap: ${gap.description}`,
          error
        );
        return { success: false, task: null, gap, error };
      }
    });

    const taskGenerationResults = await Promise.all(taskGenerationPromises);
    
    const generatedTasks: Task[] = [];
    let taskGenerationSuccesses = 0;
    let taskGenerationFailures = 0;

    taskGenerationResults.forEach(result => {
      if (result.success && result.task) {
        generatedTasks.push(result.task);
        taskGenerationSuccesses++;
      } else {
        taskGenerationFailures++;
      }
    });

    this.updatePerformanceMetric(
      'task_generation_successes',
      taskGenerationSuccesses
    );
    this.updatePerformanceMetric(
      'task_generation_failures',
      taskGenerationFailures
    );

    // Log task generation
    this.logOrchestrationEvent('TASK_GENERATION', 'Task generation completed', {
      gapsIdentified: gaps.map((gap) => ({
        description: gap.description,
        category: gap.category,
        complexity: gap.estimatedComplexity,
        requirements: gap.requirements,
      })),
      tasksGenerated: generatedTasks.length,
      generationMethod: this.llm ? 'llm' : 'template',
    });

    // Track final generation performance
    this.updatePerformanceMetric(
      'generation_operation_time',
      Date.now() - operationStartTime
    );
    this.updatePerformanceMetric(
      'generation_success_rate',
      gaps.length > 0 ? (taskGenerationSuccesses / gaps.length) * 100 : 100
    );

    return generatedTasks;
  }

  /**
   * Adapt tasks to current context and circumstances
   */
  private async adaptTasksToContext(tasks: Task[]): Promise<Task[]> {
    const operationStartTime = Date.now();
    const adaptedTasks: Task[] = [];
    let adaptationsPerformed = 0;
    let adaptationsSkipped = 0;

    for (const task of tasks) {
      const permissions = await this.evaluateTaskModificationPermissions(task);

      // Log task adaptation
      this.logOrchestrationEvent(
        'TASK_ADAPTATION',
        'Task adaptation evaluation',
        {
          taskId: task.id,
          taskDescription: task.description,
          adaptationLevel: permissions.canModify ? 'minor' : 'none',
          adaptationPermissions: permissions,
          adaptationChanges: permissions.canModify
            ? ['optimization', 'agent_assignment']
            : [],
        }
      );

      if (permissions.canModify) {
        const adaptationStart = Date.now();
        const adaptedTask = await this.adaptTask(task);
        this.updatePerformanceMetric(
          'individual_adaptation_time',
          Date.now() - adaptationStart
        );
        adaptedTasks.push(adaptedTask);
        adaptationsPerformed++;
      } else {
        // Task cannot be modified, use as-is
        adaptedTasks.push(task);
        adaptationsSkipped++;
        logger.debug(
          `Task ${task.id} cannot be modified: ${permissions.reason}`
        );
      }
    }

    // Track adaptation performance metrics
    this.updatePerformanceMetric(
      'adaptation_operation_time',
      Date.now() - operationStartTime
    );
    this.updatePerformanceMetric('adaptations_performed', adaptationsPerformed);
    this.updatePerformanceMetric('adaptations_skipped', adaptationsSkipped);
    this.updatePerformanceMetric(
      'adaptation_rate',
      tasks.length > 0 ? (adaptationsPerformed / tasks.length) * 100 : 0
    );

    return adaptedTasks;
  }

  /**
   * Evaluate whether a task can be modified by the orchestrator
   */
  private async evaluateTaskModificationPermissions(
    task: Task
  ): Promise<TaskModificationPermissions> {
    // Check task-level permission
    if (task.adaptable === false) {
      return {
        canModify: false,
        reason: 'Task explicitly prohibits orchestrator modifications',
        allowedActions: ['scheduling', 'resource_coordination', 'monitoring'],
      };
    }

    return {
      canModify: true,
      reason: 'Full modification permissions granted',
      allowedActions: ['modify', 'split', 'merge', 'reassign', 'reprioritize'],
    };
  }

  /**
   * Performance optimization: Batch adapt multiple tasks
   */
  private async batchAdaptTasks(tasks: Task[]): Promise<Task[]> {
    if (tasks.length === 0) return tasks;

    // Separate adaptable and non-adaptable tasks
    const adaptableTasks = tasks.filter((task) => task && task.adaptable);
    const nonAdaptableTasks = tasks.filter((task) => task && !task.adaptable);

    if (adaptableTasks.length === 0) {
      return tasks; // Return original if no adaptable tasks
    }

    // Performance: If only 1-2 tasks, use individual adaptation
    if (adaptableTasks.length <= 2) {
      const adaptedTasks = await Promise.all(
        adaptableTasks.map((task) => this.adaptTask(task))
      );
      return [...adaptedTasks, ...nonAdaptableTasks];
    }

    // For larger batches, use batch processing with dynamic batch size
    const totalTasks = adaptableTasks.length;
    const batchSize = totalTasks > 20 ? 10 : totalTasks > 10 ? 5 : 3; // Dynamic batch sizing
    const batches: Task[][] = [];

    for (let i = 0; i < adaptableTasks.length; i += batchSize) {
      batches.push(adaptableTasks.slice(i, i + batchSize));
    }

    const allAdaptedTasks: Task[] = [];

    // Process batches with controlled parallelism
    const maxConcurrentBatches = 2; // Process up to 2 batches simultaneously
    
    for (let i = 0; i < batches.length; i += maxConcurrentBatches) {
      const concurrentBatches = batches.slice(i, i + maxConcurrentBatches);
      
      const batchPromises = concurrentBatches.map(async (batch) => {
        const batchResults = await Promise.all(
          batch.map((task) => this.adaptTask(task))
        );
        return batchResults;
      });
      
      const results = await Promise.all(batchPromises);
      results.forEach(batchResults => allAdaptedTasks.push(...batchResults));

      // Small delay between batch groups to prevent rate limiting
      if (i + maxConcurrentBatches < batches.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return [...allAdaptedTasks, ...nonAdaptableTasks];
  }

  /**
   * Adapt a single task based on current context
   */
  private async adaptTask(task: Task): Promise<Task> {
    // Check if task is adaptable
    if (!task.adaptable) {
      this.log('info', 'Task is not adaptable, returning as-is', {
        taskId: task.id,
      });
      return task;
    }

    try {
      // Validate task before adaptation
      if (!task || !task.id) {
        throw new Error('Invalid task: task object or ID is missing');
      }

      // Build context for adaptation
      const context = ContextUtils.buildOrchestrationContext(this.team);
      if (!context) {
        throw new Error('Failed to build orchestration context');
      }

      const adaptationPrompt =
        OrchestrationPromptFactory.createTaskAdaptationPrompt(
          task,
          context,
          this.team.orchestrationStrategy || ''
        );

      // Call LLM for adaptation recommendations with timeout
      const adaptationPromise = this.callLLM(adaptationPrompt);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Task adaptation timeout')),
          this.adaptationTimeout
        );
      });

      const response = await Promise.race([adaptationPromise, timeoutPromise]);
      if (!response) {
        throw new Error('No response received from LLM');
      }

      const adaptationResult = ParsingUtils.parseAdaptationResponse(response);

      if (!adaptationResult || !adaptationResult.adaptedTask) {
        this.log('warn', 'No valid adaptation recommendations received', {
          taskId: task.id,
          hasResponse: !!response,
          hasAdaptationResult: !!adaptationResult,
        });
        return task;
      }

      // Apply adaptations based on orchestration rules
      const adaptedTask = this.applyTaskAdaptations(
        task,
        adaptationResult.adaptedTask
      );

      // Handle split recommendations
      if (
        adaptationResult.splitRecommendation?.shouldSplit &&
        task.splitStrategy !== 'none'
      ) {
        this.processSplitRecommendation(
          task,
          adaptationResult.splitRecommendation
        );
      }

      // Handle merge recommendations
      if (
        adaptationResult.mergeRecommendation?.shouldMerge &&
        task.mergeCompatible.length > 0
      ) {
        this.processMergeRecommendation(
          task,
          adaptationResult.mergeRecommendation
        );
      }

      // Log adaptation
      this.log('info', 'Task adapted successfully', {
        taskId: task.id,
        adaptationLevel: adaptationResult.adaptedTask?.adaptationLevel,
        changes: adaptationResult.adaptationReasoning,
        splitRecommended: adaptationResult.splitRecommendation?.shouldSplit,
        mergeRecommended: adaptationResult.mergeRecommendation?.shouldMerge,
      });

      // Track adaptation in history
      this.taskAdaptationHistory.push({
        taskId: task.id,
        timestamp: Date.now(),
        adaptationLevel: adaptationResult.adaptedTask?.adaptationLevel,
        reasoning: adaptationResult.adaptationReasoning,
      });

      // Update performance metrics
      this.updatePerformanceMetric('tasks_adapted');

      return adaptedTask;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log('error', 'Task adaptation failed', {
        taskId: task?.id || 'unknown',
        error: errorMessage,
        taskTitle: task?.title || 'unknown',
        availableTasksCount: this.availableTasks?.length || 0,
        hasTeam: !!this.team,
        hasContext: !!this.buildOrchestrationContext,
      });

      // Log to console for debugging
      console.log('Task adaptation failed', {
        taskId: task?.id || 'unknown',
        error: errorMessage,
      });

      // Return original task if adaptation fails
      return task || null;
    }
  }

  private parseAdaptationResponse(response: string): any {
    try {
      // Validate input
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response: must be a non-empty string');
      }

      // Extract JSON from LLM response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error('No JSON found in adaptation response');
      }
      return JSON.parse(jsonMatch[1]);
    } catch (error) {
      this.log('error', 'Failed to parse adaptation response', {
        error: error instanceof Error ? error.message : String(error),
        response: response ? response.substring(0, 200) + '...' : 'null',
      });
      return null;
    }
  }

  /**
   * Validate task against its orchestration rules and current context
   */
  private validateTaskAgainstRules(
    task: Task,
    context: OrchestrationContext
  ): boolean {
    if (!task.orchestrationRules) {
      return true; // No rules to validate against
    }

    const rules = (typeof task.orchestrationRules === 'string' ? task.orchestrationRules : '').toLowerCase();

    // Check phase-specific rules
    if (rules.includes('phase:')) {
      const phaseMatch = rules.match(/phase:\s*(\w+)/);
      if (phaseMatch) {
        const requiredPhase = phaseMatch[1];
        if (
          (context.projectPhase || '').toLowerCase() !==
          (requiredPhase || '').toLowerCase()
        ) {
          this.log('info', `Task ${task.id} skipped due to phase mismatch`, {
            requiredPhase,
            currentPhase: context.projectPhase,
          });
          return false;
        }
      }
    }

    // Check dependency rules
    if (rules.includes('requires:')) {
      const requiresMatch = rules.match(/requires:\s*([^,\s]+)/g);
      if (requiresMatch) {
        for (const requirement of requiresMatch) {
          const reqName = requirement.replace('requires:', '').trim();
          const reqSatisfied = context.existingTasks.some(
            (t) =>
              t.status === 'DONE' &&
              ((t.description || '').toLowerCase().includes(reqName) ||
                (t.title || '').toLowerCase().includes(reqName))
          );
          if (!reqSatisfied) {
            this.log(
              'info',
              `Task ${task.id} skipped due to unsatisfied requirement: ${reqName}`
            );
            return false;
          }
        }
      }
    }

    // Check resource availability rules
    if (rules.includes('min_agents:')) {
      const minAgentsMatch = rules.match(/min_agents:\s*(\d+)/);
      if (minAgentsMatch) {
        const minAgents = parseInt(minAgentsMatch[1]);
        if (context.availableAgents.length < minAgents) {
          this.log(
            'info',
            `Task ${task.id} skipped due to insufficient agents`,
            {
              required: minAgents,
              available: context.availableAgents.length,
            }
          );
          return false;
        }
      }
    }

    // Check workload rules
    if (rules.includes('max_workload:')) {
      const workloadMatch = rules.match(/max_workload:\s*(\w+)/);
      if (workloadMatch) {
        const maxWorkload = workloadMatch[1];
        if (this.compareWorkload(context.workload, maxWorkload) > 0) {
          this.log('info', `Task ${task.id} skipped due to high workload`);
          return false;
        }
      }
    }

    return true;
  }

  private compareWorkload(current: string, max: string): number {
    const levels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf((current || '').toLowerCase());
    const maxIndex = levels.indexOf((max || '').toLowerCase());
    return currentIndex - maxIndex;
  }

  private applyTaskAdaptations(originalTask: Task, adaptations: any): Task {
    // Create a new task with adaptations
    const adaptedTask = Object.assign(
      Object.create(Object.getPrototypeOf(originalTask)),
      originalTask
    );

    // Apply safe adaptations while respecting orchestration rules
    if (adaptations.description) {
      // Check if description change is allowed by orchestration rules
      if (
        !originalTask.orchestrationRules ||
        !(typeof originalTask.orchestrationRules === 'string' ? originalTask.orchestrationRules : '')
          .toLowerCase()
          .includes('fixed description')
      ) {
        adaptedTask.description = adaptations.description;
      }
    }

    if (adaptations.agent) {
      // First check the new allowAgentReassignment property
      if (originalTask.allowAgentReassignment === false) {
        // Agent reassignment is explicitly forbidden
        this.log(
          'warn',
          'Agent reassignment blocked by allowAgentReassignment=false',
          {
            taskId: adaptedTask.id,
            attemptedAgent: adaptations.agent,
            fixedAgent: originalTask.agent.name,
          }
        );
        // Keep the original agent
        adaptedTask.agent = originalTask.agent;
      } else if (
        // Also check orchestration rules for backward compatibility
        !originalTask.orchestrationRules ||
        !(typeof originalTask.orchestrationRules === 'string' ? originalTask.orchestrationRules : '')
          .toLowerCase()
          .includes('fixed agent')
      ) {
        // Agent reassignment is allowed
        // Try to find the suggested agent
        const suggestedAgent = this.team
          .getStore()
          .getState()
          .agents.find((a) => a.name === adaptations.agent);

        if (suggestedAgent) {
          // Use intelligent workload distribution to verify if this is the best choice
          const context = ContextUtils.buildOrchestrationContext(this.team);
          const optimalAgent = this.resourceOptimizer.findOptimalAgent(adaptedTask, context);

          if (optimalAgent) {
            adaptedTask.agent = optimalAgent;

            if (optimalAgent.id !== suggestedAgent.id) {
              this.log(
                'info',
                'Overrode LLM agent suggestion with optimal agent',
                {
                  taskId: adaptedTask.id,
                  suggestedAgent: suggestedAgent.name,
                  optimalAgent: optimalAgent.name,
                }
              );
            }
          } else {
            adaptedTask.agent = suggestedAgent;
          }
        }
      } else {
        // Agent reassignment blocked by orchestration rules
        this.log(
          'warn',
          'Agent reassignment blocked by orchestration rules',
          {
            taskId: adaptedTask.id,
            attemptedAgent: adaptations.agent,
            fixedAgent: originalTask.agent.name,
          }
        );
        adaptedTask.agent = originalTask.agent;
      }
    }

    if (adaptations.priority && originalTask.dynamicPriority) {
      // Store priority for later use (will implement priority system in Phase 1, Task 8)
      adaptedTask.priority = adaptations.priority;
    }

    if (adaptations.estimatedTime && adaptedTask.resourceRequirements) {
      adaptedTask.resourceRequirements.estimatedTime =
        adaptations.estimatedTime;
    }

    if (adaptations.requiredSkills && adaptedTask.resourceRequirements) {
      adaptedTask.resourceRequirements.skillsRequired =
        adaptations.requiredSkills;
    }

    if (adaptations.qualityGates) {
      // Store quality gates for later validation
      adaptedTask.qualityGates = adaptations.qualityGates;
    }

    // CRITICAL: Forward inputs from context to adapted task
    const context = ContextUtils.buildOrchestrationContext(this.team);
    if (context && context.inputs) {
      adaptedTask.inputs = context.inputs;
      this.log('debug', 'Forwarded inputs to adapted task', {
        taskId: adaptedTask.id,
        inputKeys: Object.keys(context.inputs),
      });
    }

    return adaptedTask;
  }

  /**
   * Update team's task list with orchestrated tasks (replaces all tasks)
   */
  private updateTeamTasks(tasks: Task[]): void {
    // Apply dynamic priority ordering before updating team tasks
    const prioritizedTasks = this.applyDynamicPriorityOrdering(tasks);
    this.team.store.getState().addTasks(prioritizedTasks);
  }

  /**
   * Apply dynamic priority ordering to tasks based on current context
   */
  private applyDynamicPriorityOrdering(tasks: Task[]): Task[] {
    const context = ContextUtils.buildOrchestrationContext(this.team);

    return tasks.sort((a, b) => {
      // First, sort by explicit priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriorityScore = priorityOrder[a.priority] || 2;
      const bPriorityScore = priorityOrder[b.priority] || 2;

      if (aPriorityScore !== bPriorityScore) {
        return bPriorityScore - aPriorityScore;
      }

      // For tasks with same priority, apply dynamic scoring
      if (a.dynamicPriority || b.dynamicPriority) {
        const aScore = this.calculateDynamicPriorityScore(a, context);
        const bScore = this.calculateDynamicPriorityScore(b, context);
        return bScore - aScore;
      }

      // Maintain original order for tasks without dynamic priority
      return 0;
    });
  }

  /**
   * Calculate dynamic priority score for a task based on multiple factors
   */
  private calculateDynamicPriorityScore(
    task: Task,
    context: OrchestrationContext
  ): number {
    let score = 0;

    // Factor 1: Dependencies satisfaction (30 points)
    if (task.dependencies && task.dependencies.length > 0) {
      const existingTasks = Array.isArray(context.existingTasks) ? context.existingTasks : [];
      const satisfiedDeps = (task.dependencies || []).filter((dep) =>
        existingTasks.some(
          (t) => t && t.referenceId === dep && t.status === 'DONE'
        )
      ).length;
      score += (satisfiedDeps / task.dependencies.length) * 30;
    } else {
      score += 30; // No dependencies = ready to go
    }

    // Factor 2: Agent availability (20 points)
    if (task.agent && context.availableAgents) {
      const availableAgents = Array.isArray(context.availableAgents) ? context.availableAgents : [];
      const assignedAgent = availableAgents.find(
        (a) => a && a.id === task.agent.id
      );
      if (assignedAgent) {
        score += 20;
      }
    }

    // Factor 3: Skills match (20 points)
    if (task.resourceRequirements?.skillsRequired && task.agent) {
      const agentSkills = (task.agent?.role || '')
        .toLowerCase()
        .split(/[\s,]+/);
      const requiredSkills = task.resourceRequirements.skillsRequired;
      const matchingSkills = (requiredSkills || []).filter((skill) =>
        (agentSkills || []).some(
          (agentSkill) =>
            skill &&
            agentSkill &&
            (skill || '').toLowerCase().includes(agentSkill)
        )
      ).length;
      score += (matchingSkills / requiredSkills.length) * 20;
    }

    // Factor 4: Project phase alignment (15 points)
    if (task.orchestrationRules) {
      const rules = (typeof task.orchestrationRules === 'string' ? task.orchestrationRules : '').toLowerCase();
      if (
        rules.includes(`phase: ${(context.projectPhase || '').toLowerCase()}`)
      ) {
        score += 15;
      }
    }

    // Factor 5: Workload balance (15 points)
    if (task.agent && task.agent.id) {
      // Ensure activeTasks is an array
      const activeTasks = Array.isArray(context.activeTasks) ? context.activeTasks : [];
      const agentTaskCount = activeTasks.filter(
        (t) => t && t.agent && t.agent.id === task.agent.id
      ).length;
      if (agentTaskCount === 0) {
        score += 15; // Agent is free
      } else if (agentTaskCount === 1) {
        score += 8; // Agent has light load
      }
    }

    // Bonus: Critical path tasks
    if ((typeof task.orchestrationRules === 'string' ? task.orchestrationRules : '').toLowerCase().includes('critical')) {
      score += 10;
    }

    // Bonus: Blocking other tasks
    const existingTasksForBlocking = Array.isArray(context.existingTasks) ? context.existingTasks : [];
    const blocksOthers = existingTasksForBlocking.some((t) =>
      t && t.dependencies && t.dependencies.includes(task.referenceId || task.id)
    );
    if (blocksOthers) {
      score += 10;
    }

    return score;
  }

  /**
   * Process task split recommendation
   */
  private processSplitRecommendation(
    originalTask: Task,
    splitRecommendation: any
  ): void {
    if (
      !splitRecommendation.subTasks ||
      splitRecommendation.subTasks.length === 0
    ) {
      return;
    }

    this.log('info', 'Processing task split recommendation', {
      originalTaskId: originalTask.id,
      subTaskCount: splitRecommendation.subTasks.length,
      reasoning: splitRecommendation.reasoning,
    });

    // Track split operation
    this.updatePerformanceMetric('task_splits', 1);

    // Store split recommendation for later application
    // In a real implementation, this would create new tasks and update the workflow
    const _splitRecord = {
      originalTaskId: originalTask.id,
      subTasks: splitRecommendation.subTasks,
      timestamp: Date.now(),
      applied: false, // Would be set to true when actually applied
    };

    // For now, just log the recommendation
    // Full implementation would involve creating new Task instances
    this.logOrchestrationEvent(
      'TASK_SPLIT_RECOMMENDED',
      'Task splitting recommended by orchestrator',
      {
        originalTaskId: originalTask.id,
        originalDescription: originalTask.description,
        subTaskCount: splitRecommendation.subTasks.length,
        subTasks: splitRecommendation.subTasks.map((st: any) => ({
          description: st.description,
          estimatedTime: st.estimatedTime,
          agent: st.agent,
        })),
        reasoning: splitRecommendation.reasoning,
      }
    );
  }

  /**
   * Process task merge recommendation
   */
  private processMergeRecommendation(
    task: Task,
    mergeRecommendation: any
  ): void {
    if (
      !mergeRecommendation.mergeWithTaskIds ||
      mergeRecommendation.mergeWithTaskIds.length === 0
    ) {
      return;
    }

    this.log('info', 'Processing task merge recommendation', {
      taskId: task.id,
      mergeWithTaskIds: mergeRecommendation.mergeWithTaskIds,
      reasoning: mergeRecommendation.reasoning,
    });

    // Track merge operation
    this.updatePerformanceMetric('task_merges', 1);

    // Validate merge compatibility
    const validMergeTargets = (
      mergeRecommendation.mergeWithTaskIds || []
    ).filter(
      (targetId: string) =>
        targetId && (task.mergeCompatible || []).includes(targetId)
    );

    if (validMergeTargets.length === 0) {
      this.log('warn', 'No valid merge targets found in mergeCompatible list', {
        taskId: task.id,
        requestedMerges: mergeRecommendation.mergeWithTaskIds,
        allowedMerges: task.mergeCompatible,
      });
      return;
    }

    // Store merge recommendation for later application
    const _mergeRecord = {
      taskId: task.id,
      mergeWithTaskIds: validMergeTargets,
      mergedDescription: mergeRecommendation.mergedDescription,
      timestamp: Date.now(),
      applied: false,
    };

    this.logOrchestrationEvent(
      'TASK_MERGE_RECOMMENDED',
      'Task merging recommended by orchestrator',
      {
        taskId: task.id,
        taskDescription: task.description,
        mergeWithTaskIds: validMergeTargets,
        mergedDescription: mergeRecommendation.mergedDescription,
        reasoning: mergeRecommendation.reasoning,
      }
    );
  }

  /**
   * Apply priority adjustments from continuous orchestration recommendations
   */
  private applyPriorityAdjustments(adjustments: any[], allTasks: Task[]): void {
    for (const adjustment of adjustments) {
      const task = allTasks.find((t) => t.id === adjustment.taskId);
      if (task && task.dynamicPriority) {
        const oldPriority = task.priority;
        task.priority = adjustment.newPriority;

        this.log('info', 'Applied dynamic priority adjustment', {
          taskId: task.id,
          taskDescription: task.description.substring(0, 50),
          oldPriority,
          newPriority: adjustment.newPriority,
          reasoning: adjustment.reasoning,
        });

        // Track priority change
        this.updatePerformanceMetric('priority_adjustments', 1);
      }
    }

    // Re-sort tasks after priority adjustments
    const teamState = this.team.store.getState();
    const updatedTasks = this.applyDynamicPriorityOrdering(teamState.tasks);
    this.updateTeamTasks(updatedTasks);
  }

  /**
   * Add new orchestrated tasks to existing team tasks
   * Prevents duplicates and maintains existing tasks
   */
  private addOrchestrationTasks(newTasks: Task[]): void {
    const teamState = this.team.store.getState();
    const existingTaskIds = new Set(teamState.tasks.map((task) => task.id));

    // Filter out any tasks that already exist to prevent duplicates
    const uniqueNewTasks = (newTasks || []).filter(
      (task) => task && task.id && !existingTaskIds.has(task.id)
    );

    if (uniqueNewTasks.length > 0) {
      logger.info(`➕ Adding ${uniqueNewTasks.length} new orchestrated tasks`);
      teamState.addTasks(uniqueNewTasks);
    } else {
      logger.info(`ℹ️ No new unique tasks to add`);
    }
  }

  /**
   * Helper method to log orchestration events
   */
  private logOrchestrationEvent(
    event: string,
    message: string,
    metadata: any
  ): void {
    try {
      // More robust team/store checking
      if (!this.team || !this.team.store || typeof this.team.store.getState !== 'function') {
        logger.warn(
          'Cannot log orchestration event: team or store not properly initialized'
        );
        return;
      }

      // Safely get team state
      let teamState = null;
      let orchestratorId = 'unknown';
      let availableAgents = 0;

      try {
        teamState = this.team.store.getState();
        orchestratorId = teamState?.name || 'unknown';
        availableAgents = teamState?.agents?.length || 0;
      } catch (stateError) {
        logger.warn(
          'Could not access team state for orchestration logging:',
          stateError
        );
      }

      // Enhance metadata with context information
      const enhancedMetadata = {
        ...metadata,
        timestamp: Date.now(),
        orchestratorId,
        mode: this.team.mode || 'unknown',
        performanceMetrics: {
          llmCalls: this.performanceMetrics.getMetric('llm_calls_total'),
          tasksAnalyzed: this.performanceMetrics.getMetric('tasks_analyzed'),
          decisionsGenerated: this.performanceMetrics.getMetric('decisions_generated'),
          errorRate: this.calculateErrorRate(),
          successRate: this.calculateSuccessRate(),
        },
        contextSnapshot: {
          totalTasks: this.team.getTasks ? this.team.getTasks().length : 0,
          activeTasks: this.team.getTasks
            ? (this.team.getTasks() || []).filter(
                (t) => t && t.status === 'DOING'
              ).length
            : 0,
          completedTasks: this.team.getTasks
            ? this.team.getTasks().filter((t) => t && t.status === 'DONE')
                .length
            : 0,
          availableAgents,
        },
      };

      const log = createOrchestrationLog(event, message, enhancedMetadata);

      // Safely add workflow log
      if (teamState && typeof teamState.addWorkflowLog === 'function') {
        teamState.addWorkflowLog(log);
      } else {
        logger.warn(
          'Cannot add workflow log: addWorkflowLog method not available'
        );
      }

      // Also log important events to console with appropriate levels
      this.logToConsoleWithLevel(event, message, metadata);
    } catch (error) {
      logger.warn('Failed to log orchestration event:', error);
    }
  }

  /**
   * Log to console with appropriate log levels based on event type
   */
  private logToConsoleWithLevel(
    event: string,
    message: string,
    metadata: any
  ): void {
    const errorEvents = [
      'ERROR',
      'ORCHESTRATION_ERROR',
      'RECOVERY_FAILED',
      'GENERIC_RECOVERY',
    ];
    const warnEvents = [
      'FALLBACK_TASK_SELECTION',
      'FALLBACK_TASK_ADAPTATION',
      'FALLBACK_TASK_GENERATION',
    ];
    const infoEvents = [
      'ACTIVATED',
      'COMPLETED',
      'TASK_SELECTION',
      'CONTINUOUS_OPTIMIZATION',
    ];

    if (errorEvents.includes(event)) {
      logger.error(`🚨 [Orchestration] ${message}`, metadata);
    } else if (warnEvents.includes(event)) {
      logger.warn(`⚠️ [Orchestration] ${message}`, metadata);
    } else if (infoEvents.includes(event)) {
      logger.info(`✅ [Orchestration] ${message}`, metadata);
    } else {
      logger.debug(`🔍 [Orchestration] ${message}`, metadata);
    }
  }

  /**
   * Calculate error rate from performance metrics
   */
  private calculateErrorRate(): number {
    return this.performanceMetrics.calculateErrorRate();
  }

  /**
   * Calculate success rate from performance metrics
   */
  private calculateSuccessRate(): number {
    return this.performanceMetrics.calculateSuccessRate();
  }


  /**
   * Get orchestration metrics summary for external reporting
   */
  public getOrchestrationMetrics(): {
    performance: Record<string, any>;
    taskStatistics: Record<string, any>;
    systemHealth: Record<string, any>;
  } {
    return this.performanceMetrics.getOrchestrationMetrics();
  }

  /**
   * Analyze skill gaps in the current workflow
   */
  private analyzeSkillGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): TaskGap[] {
    const gaps: TaskGap[] = [];
    const requiredSkills = new Set<string>();
    const availableSkills = new Set<string>();

    // Collect required skills from selected tasks
    selectedTasks.forEach((task) => {
      if (task.resourceRequirements?.skillsRequired) {
        task.resourceRequirements.skillsRequired.forEach((skill) =>
          requiredSkills.add(skill)
        );
      }
    });

    // Collect available skills from agents
    context.availableAgents.forEach((agent) => {
      // Assuming agent has skills property or we can infer from role
      const agentSkills = this.inferAgentSkills(agent);
      agentSkills.forEach((skill) => availableSkills.add(skill));
    });

    // Identify missing skills
    requiredSkills.forEach((skill) => {
      if (!availableSkills.has(skill)) {
        gaps.push({
          id: `skill_gap_${skill}`,
          description: `Missing required skill: ${skill}`,
          category: 'skill_gap',
          estimatedComplexity: 'medium',
          requirements: [skill],
          dependencies: [],
          priority: 'high',
          suggestedSolution: `Assign agent with ${skill} skill or provide training`,
        });
      }
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

    // Check for missing validation tasks
    const hasValidation = selectedTasks.some(
      (task) =>
        (task.description || '').toLowerCase().includes('test') ||
        (task.description || '').toLowerCase().includes('validate') ||
        (task.description || '').toLowerCase().includes('review')
    );

    if (!hasValidation && selectedTasks.length > 2) {
      gaps.push({
        id: 'workflow_gap_validation',
        description: 'Missing validation/testing phase in workflow',
        category: 'workflow_gap',
        estimatedComplexity: 'medium',
        requirements: ['testing', 'quality_assurance'],
        dependencies: [],
        priority: 'high',
        suggestedSolution: 'Add testing or review tasks to ensure quality',
      });
    }

    // Check for missing documentation tasks
    const hasDocumentation = selectedTasks.some(
      (task) =>
        (task.description || '').toLowerCase().includes('document') ||
        (task.description || '').toLowerCase().includes('readme')
    );

    if (!hasDocumentation && context.projectProgress > 50) {
      gaps.push({
        id: 'workflow_gap_documentation',
        description: 'Missing documentation phase for completed work',
        category: 'workflow_gap',
        estimatedComplexity: 'low',
        requirements: ['documentation', 'technical_writing'],
        dependencies: [],
        priority: 'medium',
        suggestedSolution: 'Add documentation tasks to capture knowledge',
      });
    }

    // Check for missing deployment/release tasks
    const hasDeployment = selectedTasks.some(
      (task) =>
        (task.description || '').toLowerCase().includes('deploy') ||
        (task.description || '').toLowerCase().includes('release')
    );

    if (!hasDeployment && context.projectProgress > 80) {
      gaps.push({
        id: 'workflow_gap_deployment',
        description: 'Missing deployment/release phase',
        category: 'workflow_gap',
        estimatedComplexity: 'high',
        requirements: ['deployment', 'devops'],
        dependencies: [],
        priority: 'high',
        suggestedSolution: 'Add deployment tasks for production readiness',
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

    if (context.codeCoverage < 70) {
      gaps.push({
        id: 'quality_gap_coverage',
        description: `Low code coverage (${context.codeCoverage}%) - need more tests`,
        category: 'quality_gap',
        estimatedComplexity: 'high',
        requirements: ['testing', 'test_automation'],
        dependencies: [],
        priority: 'high',
        suggestedSolution: 'Increase test coverage to at least 70%',
      });
    }

    if (context.performanceScore < 60) {
      gaps.push({
        id: 'quality_gap_performance',
        description: `Performance score below threshold (${context.performanceScore})`,
        category: 'quality_gap',
        estimatedComplexity: 'high',
        requirements: ['performance_optimization', 'profiling'],
        dependencies: [],
        priority: 'medium',
        suggestedSolution: 'Optimize performance bottlenecks',
      });
    }

    // Check for security review
    const hasSecurityReview = selectedTasks.some(
      (task) =>
        (task.description || '').toLowerCase().includes('security') ||
        (task.description || '').toLowerCase().includes('audit')
    );

    if (!hasSecurityReview && context.projectPhase === 'production') {
      gaps.push({
        id: 'quality_gap_security',
        description: 'Missing security review for production phase',
        category: 'quality_gap',
        estimatedComplexity: 'high',
        requirements: ['security', 'audit'],
        dependencies: [],
        priority: 'high',
        suggestedSolution: 'Add security audit before production deployment',
      });
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

    // Calculate total estimated time
    const totalEstimatedHours = selectedTasks.reduce((sum, task) => {
      const hours = ParsingUtils.parseEstimatedTime(
        task.resourceRequirements?.estimatedTime || '2 hours'
      );
      return sum + hours;
    }, 0);

    const availableHours = context.availableAgents.length * 8; // Assume 8 hours per agent

    if (totalEstimatedHours > availableHours * 1.5) {
      gaps.push({
        id: 'resource_gap_capacity',
        description: `Insufficient capacity: ${totalEstimatedHours}h needed vs ${availableHours}h available`,
        category: 'resource_gap',
        estimatedComplexity: 'high',
        requirements: ['resource_optimization', 'task_prioritization'],
        dependencies: [],
        priority: 'high',
        suggestedSolution: 'Prioritize critical tasks or add more resources',
      });
    }

    // Check for workload imbalance
    const agentWorkload = this.calculateAgentWorkload(selectedTasks);
    const maxWorkload = Math.max(...agentWorkload.values());
    const minWorkload = Math.min(...agentWorkload.values());

    if (maxWorkload > minWorkload * 2 && agentWorkload.size > 1) {
      gaps.push({
        id: 'resource_gap_balance',
        description: 'Workload imbalance detected between agents',
        category: 'resource_gap',
        estimatedComplexity: 'medium',
        requirements: ['workload_balancing'],
        dependencies: [],
        priority: 'medium',
        suggestedSolution: 'Redistribute tasks for better balance',
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
    const taskIds = new Set(selectedTasks.map((t) => t.referenceId || t.id));

    // Check for missing dependencies
    selectedTasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((dep) => {
          if (!taskIds.has(dep)) {
            gaps.push({
              id: `dependency_gap_${dep}`,
              description: `Missing dependency: ${dep} required by ${task.description}`,
              category: 'dependency_gap',
              estimatedComplexity: 'medium',
              requirements: ['dependency_resolution'],
              dependencies: [dep],
              priority: 'high',
              suggestedSolution: `Add task for dependency ${dep}`,
            });
          }
        });
      }
    });

    return gaps;
  }

  /**
   * Prioritize gaps based on impact and context
   */
  private prioritizeGaps(
    gaps: TaskGap[],
    context: OrchestrationContext
  ): TaskGap[] {
    return gaps
      .map((gap) => {
        let priorityScore = 0;

        // Score based on category
        switch (gap.category) {
          case 'dependency_gap':
            priorityScore += 5;
            break;
          case 'skill_gap':
            priorityScore += 4;
            break;
          case 'quality_gap':
            priorityScore += 3;
            break;
          case 'workflow_gap':
            priorityScore += 2;
            break;
          case 'resource_gap':
            priorityScore += 1;
            break;
        }

        // Adjust based on project phase
        if (
          context.projectPhase === 'production' &&
          gap.category === 'quality_gap'
        ) {
          priorityScore += 3;
        }

        // Adjust based on complexity
        if (gap.estimatedComplexity === 'high') {
          priorityScore += 2;
        }

        // Set priority based on score
        gap.priority =
          priorityScore >= 5 ? 'high' : priorityScore >= 3 ? 'medium' : 'low';

        return gap;
      })
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (
          priorityOrder[b.priority || 'low'] -
          priorityOrder[a.priority || 'low']
        );
      });
  }

  /**
   * Infer skills from agent role and background
   */
  private inferAgentSkills(agent: Agent): string[] {
    const skills: string[] = [];
    const roleLower = (agent.role || '').toLowerCase();

    // Basic skill inference - let the LLM handle domain-specific skills
    if (roleLower.includes('developer') || roleLower.includes('engineer')) {
      skills.push('programming', 'debugging', 'architecture');
    }
    if (roleLower.includes('test') || roleLower.includes('qa')) {
      skills.push('testing', 'quality_assurance', 'test_automation');
    }
    if (roleLower.includes('design')) {
      skills.push('ui_design', 'ux_design', 'frontend_development');
    }
    if (roleLower.includes('security')) {
      skills.push('security', 'audit', 'vulnerability_assessment');
    }
    if (roleLower.includes('devops') || roleLower.includes('ops')) {
      skills.push('deployment', 'devops', 'infrastructure');
    }
    if (roleLower.includes('manager') || roleLower.includes('lead')) {
      skills.push('project_management', 'coordination', 'planning');
    }

    // For domain-specific roles, the LLM will handle skill matching during orchestration
    // This avoids hardcoding and allows flexible skill inference
    return skills;
  }

  /**
   * Parse estimated time string to hours
   */
  private parseEstimatedTime(timeStr: string): number {
    const safeTimeStr = timeStr || '';
    const hourMatch = safeTimeStr.match(/(\d+)\s*(hours?|hrs?)/i);
    const minMatch = safeTimeStr.match(/(\d+)\s*(minutes?|mins?)/i);

    let hours = 0;
    if (hourMatch) {
      hours += parseInt(hourMatch[1]);
    }
    if (minMatch) {
      hours += parseInt(minMatch[1]) / 60;
    }

    return hours || 2; // Default 2 hours
  }

  /**
   * Calculate workload per agent
   */
  private calculateAgentWorkload(tasks: Task[]): Map<string, number> {
    const workload = new Map<string, number>();

    tasks.forEach((task) => {
      const agentName = task.agent?.name || 'unassigned';
      const hours = ParsingUtils.parseEstimatedTime(
        task.resourceRequirements?.estimatedTime || '2 hours'
      );
      workload.set(agentName, (workload.get(agentName) || 0) + hours);
    });

    return workload;
  }

  /**
   * Calculate workload distribution across agents
   */
  private calculateWorkloadDistribution(
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
   * Identify gaps in task coverage with comprehensive analysis
   */
  private async identifyTaskGaps(
    context: OrchestrationContext,
    selectedTasks: Task[]
  ): Promise<TaskGap[]> {
    const gaps: TaskGap[] = [];

    // Perform comprehensive gap analysis
    const skillGaps = this.analyzeSkillGaps(context, selectedTasks);
    gaps.push(...skillGaps);

    const workflowGaps = this.analyzeWorkflowGaps(context, selectedTasks);
    gaps.push(...workflowGaps);

    const qualityGaps = this.analyzeQualityGaps(context, selectedTasks);
    gaps.push(...qualityGaps);

    const resourceGaps = this.analyzeResourceGaps(context, selectedTasks);
    gaps.push(...resourceGaps);

    const dependencyGaps = this.analyzeDependencyGaps(context, selectedTasks);
    gaps.push(...dependencyGaps);

    // Prioritize gaps based on impact
    const prioritizedGaps = this.prioritizeGaps(gaps, context);

    // Log comprehensive gap analysis
    this.logOrchestrationEvent(
      'GAP_ANALYSIS_COMPLETED',
      'Comprehensive gap analysis completed',
      {
        totalGaps: prioritizedGaps.length,
        gapsByCategory: {
          skills: skillGaps.length,
          workflow: workflowGaps.length,
          quality: qualityGaps.length,
          resources: resourceGaps.length,
          dependencies: dependencyGaps.length,
        },
        gapDetails: prioritizedGaps.slice(0, 5).map((gap) => ({
          id: gap.id,
          description: gap.description,
          category: gap.category,
          priority: gap.priority,
          complexity: gap.estimatedComplexity,
        })),
      }
    );

    return prioritizedGaps;
  }

  /**
   * Generate a new task for an identified gap
   */
  private async generateTaskForGap(
    gap: TaskGap,
    context: OrchestrationContext
  ): Promise<Task | null> {
    if (!this.llm) {
      throw new Error(
        'LLM is required for task generation. Please provide llmInstance or llmConfig when creating the team.'
      );
    }

    try {
      // Use professional prompt template
      const prompt = OrchestrationPromptFactory.createTaskGenerationPrompt(
        gap,
        context,
        this.team.orchestrationStrategy ||
          'Intelligent task generation based on project requirements'
      );

      const response = await this.llm.invoke(prompt);
      const content = response.content.toString();

      // Parse structured JSON response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error(
          `LLM response did not contain valid JSON. Response: ${content.substring(
            0,
            200
          )}`
        );
      }

      const responseData = JSON.parse(jsonMatch[1]);
      const taskData = responseData.generatedTask;

      // Create initial task with temporary agent assignment
      const tempAgent =
        context.availableAgents.find(
          (agent) =>
            (agent.role || '')
              .toLowerCase()
              .includes((taskData.agent || '').toLowerCase()) ||
            (agent.name || '')
              .toLowerCase()
              .includes((taskData.agent || '').toLowerCase())
        ) ||
        context.availableAgents[0] ||
        this.team.store.getState().agents[0];

      const newTask = new Task({
        description: taskData.description,
        expectedOutput: taskData.expectedOutput,
        agent: tempAgent,
        adaptable: taskData.adaptable,
        orchestrationRules: taskData.orchestrationRules,
        resourceRequirements: {
          estimatedTime: taskData.estimatedTime,
          skillsRequired: taskData.requiredSkills,
          dependencies: taskData.dependencies,
        },
      });

      // Find optimal agent using intelligent workload distribution
      const optimalAgent = this.resourceOptimizer.findOptimalAgent(newTask, context);
      if (optimalAgent && optimalAgent.id !== tempAgent.id) {
        newTask.agent = optimalAgent;
        this.log('info', 'Reassigned task to optimal agent', {
          taskDescription: newTask.description.substring(0, 50),
          fromAgent: tempAgent.name,
          toAgent: optimalAgent.name,
        });
      }

      logger.info(
        `🤖 Generated task: ${taskData.description.substring(0, 50)}...`
      );
      logger.info(`📋 Gap analysis: ${responseData.gapAnalysis}`);
      logger.info(
        `🔗 Integration strategy: ${responseData.integrationStrategy}`
      );

      return newTask;
    } catch (error) {
      logger.error('LLM task generation failed:', error);
      throw new Error(
        `Task generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Helper methods for context analysis

  private calculateProjectProgress(): number {
    const tasks = this.team.store.getState().tasks;
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(
      (task) => task.status === 'DONE'
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  private calculateCurrentWorkload(): string {
    const activeTasks = (this.team.store.getState().tasks || []).filter(
      (task) => task && task.status === 'DOING'
    );
    const totalAgents = this.team.store.getState().agents.length;

    if (totalAgents === 0) return 'unknown';

    const tasksPerAgent = activeTasks.length / totalAgents;

    if (tasksPerAgent > 2) return 'high';
    if (tasksPerAgent > 1) return 'medium';
    return 'low';
  }

  private determineProjectPhase(): string {
    const progress = this.calculateProjectProgress();

    if (progress < 25) return 'planning';
    if (progress < 75) return 'development';
    if (progress < 95) return 'testing';
    return 'deployment';
  }

  /**
   * Calculate agent workload score for intelligent distribution
   */
  private calculateAgentWorkloadScore(
    agent: Agent,
    context: OrchestrationContext
  ): number {
    let score = 100; // Start with perfect score

    // Factor 1: Current task count (-20 points per active task)
    const activeTasks = (context.activeTasks || []).filter(
      (t) => t && t.agent?.id === agent.id
    ).length;
    score -= activeTasks * 20;

    // Factor 2: Blocked tasks (-15 points per blocked task)
    const blockedTasks = (context.blockedTasks || []).filter(
      (t) => t && t.agent?.id === agent.id
    ).length;
    score -= blockedTasks * 15;

    // Factor 3: Recent completion rate (track last 5 completions)
    // This would need historical data - for now, use a placeholder
    const recentCompletionRate = 0.8; // 80% completion rate
    score += (recentCompletionRate - 0.5) * 30; // +15 points for 80% rate

    // Factor 4: Agent availability status
    if (agent.status === 'BUSY') {
      score -= 30;
    } else if (agent.status === 'IDLE') {
      score += 10;
    }

    return Math.max(0, score); // Don't go below 0
  }

  /**
   * Match agent skills to task requirements
   */
  private calculateSkillMatchScore(agent: Agent, task: Task): number {
    if (!task.resourceRequirements?.skillsRequired) {
      return 50; // Neutral score if no skills specified
    }

    const agentSkills = ContextUtils.extractAgentSkills(agent);
    const requiredSkills = task.resourceRequirements.skillsRequired;

    // Calculate exact matches
    const exactMatches = requiredSkills.filter((skill) =>
      agentSkills.some(
        (agentSkill) => agentSkill.toLowerCase() === skill.toLowerCase()
      )
    ).length;

    // Calculate partial matches (skill contained in role/background)
    const partialMatches = requiredSkills.filter(
      (skill) =>
        !agentSkills.some(
          (agentSkill) =>
            (agentSkill || '').toLowerCase() === (skill || '').toLowerCase()
        ) &&
        ((agent.role || '')
          .toLowerCase()
          .includes((skill || '').toLowerCase()) ||
          (agent.background || '')
            .toLowerCase()
            .includes((skill || '').toLowerCase()))
    ).length;

    const totalRequired = requiredSkills.length;
    const matchScore =
      (exactMatches * 100 + partialMatches * 50) / totalRequired;

    return matchScore;
  }

  /**
   * Extract skills from agent profile
   */
  private extractAgentSkills(agent: Agent): string[] {
    const skills: string[] = [];

    // Extract from role (split by common delimiters)
    const roleSkills = (agent.role || '').toLowerCase().split(/[\s,&/]+/);
    skills.push(...roleSkills);

    // Extract key technical terms from background
    const technicalTerms =
      (agent.background || '').match(
        /\b(javascript|typescript|python|react|vue|angular|node|database|api|frontend|backend|fullstack|devops|security|testing|qa)\b/gi
      ) || [];
    skills.push(...technicalTerms.map((t) => t.toLowerCase()));

    // Remove duplicates
    return [...new Set(skills)];
  }

  /**
   * Find optimal agent for a task using intelligent workload distribution
   */
  private findOptimalAgent(
    task: Task,
    context: OrchestrationContext
  ): Agent | null {
    const availableAgents = context.availableAgents;
    if (availableAgents.length === 0) return null;

    // If task already has an assigned agent and they're available, prefer them
    if (task.agent && availableAgents.find((a) => a.id === task.agent.id)) {
      const currentAgentScore = this.calculateAgentScore(
        task.agent,
        task,
        context
      );
      // Only reassign if another agent is significantly better (20+ points)
      const threshold = currentAgentScore + 20;

      const betterAgent = availableAgents.find(
        (agent) =>
          agent.id !== task.agent.id &&
          this.calculateAgentScore(agent, task, context) > threshold
      );

      return betterAgent || task.agent;
    }

    // Calculate scores for all available agents
    const agentScores = availableAgents.map((agent) => ({
      agent,
      score: this.calculateAgentScore(agent, task, context),
    }));

    // Sort by score (highest first)
    agentScores.sort((a, b) => b.score - a.score);

    // Log top candidates for transparency
    this.log('info', 'Agent selection scores for task', {
      taskId: task.id,
      taskDescription: task.description.substring(0, 50),
      topCandidates: agentScores.slice(0, 3).map((as) => ({
        agentName: as.agent.name,
        score: as.score,
      })),
    });

    return agentScores[0]?.agent || null;
  }

  /**
   * Calculate overall agent score for task assignment
   */
  private calculateAgentScore(
    agent: Agent,
    task: Task,
    context: OrchestrationContext
  ): number {
    // Weight factors
    const SKILL_WEIGHT = 0.4;
    const WORKLOAD_WEIGHT = 0.3;
    const AFFINITY_WEIGHT = 0.2;
    const PERFORMANCE_WEIGHT = 0.1;

    // Calculate individual scores
    const skillScore = ContextUtils.calculateSkillMatchScore(agent, task);
    const workloadScore = this.resourceOptimizer.calculateAgentWorkloadScore(agent, context);
    const affinityScore = this.calculateAgentAffinityScore(agent, task);
    const performanceScore = this.calculateAgentPerformanceScore(agent);

    // Weighted total
    const totalScore =
      skillScore * SKILL_WEIGHT +
      workloadScore * WORKLOAD_WEIGHT +
      affinityScore * AFFINITY_WEIGHT +
      performanceScore * PERFORMANCE_WEIGHT;

    return totalScore;
  }

  /**
   * Calculate agent affinity for certain task types
   */
  private calculateAgentAffinityScore(agent: Agent, task: Task): number {
    // Simple affinity based on role matching task description
    const roleKeywords = (agent.role || '').toLowerCase().split(/[\s,]+/);
    const taskKeywords = (task.description || '').toLowerCase().split(/[\s,]+/);

    const matchingKeywords = roleKeywords.filter(
      (keyword) => taskKeywords.includes(keyword) && keyword.length > 3
    ).length;

    return Math.min(100, matchingKeywords * 25);
  }

  /**
   * Calculate agent performance score based on historical data
   */
  private calculateAgentPerformanceScore(agent: Agent): number {
    // Calculate based on task completion history
    const teamState = this.team.store.getState();
    const completedTasks = teamState.tasks.filter(
      (t) => t.agent?.id === agent.id && t.status === 'DONE'
    );

    if (completedTasks.length === 0) {
      return 75; // Default score for new agents
    }

    // Simple success rate calculation
    const totalTasks = teamState.tasks.filter(
      (t) => t.agent?.id === agent.id
    ).length;
    const successRate = (completedTasks.length / totalTasks) * 100;

    return Math.min(100, successRate);
  }

  /**
   * Track task performance for learning
   */
  private trackTaskPerformance(
    task: Task,
    success: boolean,
    duration?: number
  ): void {
    const key = this.getTaskPerformanceKey(task);
    const existing = this.taskPerformanceHistory.get(key) || {
      successRate: 0,
      averageDuration: 0,
      completions: 0,
      failures: 0,
      lastUpdated: Date.now(),
    };

    if (success) {
      existing.completions++;
      if (duration) {
        existing.averageDuration =
          (existing.averageDuration * (existing.completions - 1) + duration) /
          existing.completions;
      }
    } else {
      existing.failures++;
    }

    existing.successRate =
      (existing.completions / (existing.completions + existing.failures)) * 100;
    existing.lastUpdated = Date.now();

    this.taskPerformanceHistory.set(key, existing);

    // Update performance metrics
    this.updatePerformanceMetric('tasks_tracked', 1);

    // Trigger learning analysis if in learning mode
    const total = existing.completions + existing.failures;
    if (this.team.mode === 'learning' && total % 5 === 0) {
      this.learnFromPerformanceHistory();
    }
  }

  /**
   * Initialize task performance tracking
   */
  private initializeTaskPerformance(task: Task): void {
    const key = this.getTaskPerformanceKey(task);

    if (!this.taskPerformanceHistory.has(key)) {
      this.taskPerformanceHistory.set(key, {
        successRate: 0,
        averageDuration: 0,
        completions: 0,
        failures: 0,
        lastUpdated: Date.now(),
      });
    }
  }

  /**
   * Get performance score for a template task
   */
  private getTaskPerformanceScore(task: Task): number {
    const key = this.getTaskPerformanceKey(task);
    const performance = this.taskPerformanceHistory.get(key);

    if (!performance) {
      return 50; // Neutral score for unknown tasks
    }

    // Weight success rate and recency
    const recencyWeight = CalculationUtils.calculateRecencyWeight(performance.lastUpdated);
    const score = performance.successRate * recencyWeight;

    return Math.min(100, score);
  }

  /**
   * Generate a key for task performance tracking
   */
  private getTaskPerformanceKey(task: Task): string {
    // Use description hash for backlog tasks, or ID for specific tasks
    const isBacklogTask =
      this.availableTasks && this.availableTasks.some((t) => t.id === task.id);
    if (isBacklogTask) {
      return `template_${this.hashString(task.description)}`;
    }
    return `task_${task.id}`;
  }

  /**
   * Simple string hash for consistent keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Calculate recency weight for performance scores
   */
  private calculateRecencyWeight(lastUpdated: number): number {
    const daysSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);

    // Linear decay: 100% weight for today, 50% after 30 days
    const weight = Math.max(0.5, 1 - daysSinceUpdate / 60);

    return weight;
  }

  /**
   * Apply performance-based learning to task selection
   */
  private applyPerformanceBasedFiltering(tasks: Task[]): Task[] {
    // Sort tasks by performance score
    return tasks.sort((a, b) => {
      const scoreA = this.getTaskPerformanceScore(a);
      const scoreB = this.getTaskPerformanceScore(b);

      // Higher performance scores first
      return scoreB - scoreA;
    });
  }

  /**
   * Predict potential task failures based on historical data and current context
   */
  private predictTaskFailures(tasks: Task[]): Map<string, number> {
    const failureProbabilities = new Map<string, number>();

    tasks.forEach((task) => {
      let failureProbability = 0;

      // Check historical performance
      const taskKey = this.getTaskPerformanceKey(task);
      const perfData = this.taskPerformanceHistory.get(taskKey);

      if (perfData) {
        // Base failure probability on historical failure rate
        const historicalFailureRate =
          perfData.failures / (perfData.completions + perfData.failures);
        failureProbability = historicalFailureRate * 0.4; // 40% weight for history
      }

      // Check agent workload
      if (task.agent) {
        const agentTasks = tasks.filter((t) => t.agent?.id === task.agent?.id);
        if (agentTasks.length > 3) {
          failureProbability += 0.2; // Agent overload increases failure risk
        }
      }

      // Check task complexity
      const complexity = task.resourceRequirements?.estimatedTime || '2 hours';
      const hours = ParsingUtils.parseEstimatedTime(complexity);
      if (hours > 8) {
        failureProbability += 0.15; // Complex tasks more likely to fail
      }

      // Check missing dependencies
      if (task.dependencies && task.dependencies.length > 2) {
        failureProbability += 0.1; // More dependencies = higher risk
      }

      // Check skill match
      if (task.agent && task.resourceRequirements?.skillsRequired) {
        const agentSkills = this.inferAgentSkills(task.agent);
        const requiredSkills = task.resourceRequirements.skillsRequired;
        const matchingSkills = requiredSkills.filter((skill) =>
          agentSkills.includes(skill)
        );

        if (matchingSkills.length < requiredSkills.length) {
          failureProbability += 0.15; // Skill mismatch increases failure risk
        }
      }

      failureProbabilities.set(task.id, Math.min(failureProbability, 0.9));
    });

    return failureProbabilities;
  }


  /**
   * Generate task dependency graph visualization data
   */
  public generateDependencyGraph(tasks: Task[]): {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      status: string;
      agent?: string;
    }>;
    edges: Array<{ from: string; to: string; label?: string }>;
    metrics: { depth: number; parallelism: number; criticalPath: string[] };
  } {
    const nodes: Array<{
      id: string;
      label: string;
      type: string;
      status: string;
      agent?: string;
    }> = [];
    const edges: Array<{ from: string; to: string; label?: string }> = [];

    // Create nodes
    tasks.forEach((task) => {
      nodes.push({
        id: task.id,
        label:
          task.description.substring(0, 50) +
          (task.description.length > 50 ? '...' : ''),
        type: task.resourceRequirements?.skillsRequired?.[0] || 'general',
        status: task.status,
        agent: task.agent?.name,
      });
    });

    // Create edges based on dependencies
    tasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          // Find the task with matching referenceId or id
          const depTask = tasks.find(
            (t) => t.referenceId === depId || t.id === depId
          );
          if (depTask) {
            edges.push({
              from: depTask.id,
              to: task.id,
              label: 'depends on',
            });
          }
        });
      }
    });

    // Calculate metrics
    const metrics = this.calculateGraphMetrics(tasks, edges);

    return { nodes, edges, metrics };
  }

  /**
   * Calculate dependency graph metrics
   */
  private calculateGraphMetrics(
    tasks: Task[],
    edges: Array<{ from: string; to: string }>
  ): { depth: number; parallelism: number; criticalPath: string[] } {
    // Build adjacency list
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    tasks.forEach((task) => {
      graph.set(task.id, []);
      inDegree.set(task.id, 0);
    });

    edges.forEach((edge) => {
      graph.get(edge.from)?.push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    });

    // Calculate depth using topological sort
    let depth = 0;
    const queue: string[] = [];
    const levels = new Map<string, number>();

    // Find all nodes with no dependencies
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
        levels.set(nodeId, 0);
      }
    });

    let maxParallelism = queue.length;
    const visited = new Set<string>();

    while (queue.length > 0) {
      const levelSize = queue.length;
      maxParallelism = Math.max(maxParallelism, levelSize);

      for (let i = 0; i < levelSize; i++) {
        const current = queue.shift()!;
        visited.add(current);
        const currentLevel = levels.get(current) || 0;
        depth = Math.max(depth, currentLevel);

        // Process all dependent nodes
        graph.get(current)?.forEach((neighbor) => {
          inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);

          if (inDegree.get(neighbor) === 0) {
            queue.push(neighbor);
            levels.set(neighbor, currentLevel + 1);
          }
        });
      }
    }

    // Find critical path (longest path in DAG)
    const criticalPath = this.findCriticalPath(tasks, graph, levels);

    return {
      depth: depth + 1,
      parallelism: maxParallelism,
      criticalPath,
    };
  }

  /**
   * Find the critical path in the task dependency graph
   */
  private findCriticalPath(
    tasks: Task[],
    graph: Map<string, string[]>,
    levels: Map<string, number>
  ): string[] {
    // Simple heuristic: find the path through highest levels
    const path: string[] = [];
    let maxLevel = 0;
    let currentNode: string | null = null;

    // Find the node at the highest level
    levels.forEach((level, nodeId) => {
      if (level > maxLevel) {
        maxLevel = level;
        currentNode = nodeId;
      }
    });

    // Backtrack to find the path
    while (currentNode) {
      path.unshift(currentNode);

      // Find parent with highest level
      let parentNode: string | null = null;
      let parentLevel = -1;

      tasks.forEach((task) => {
        if (graph.get(task.id)?.includes(currentNode!)) {
          const taskLevel = levels.get(task.id) || 0;
          if (taskLevel > parentLevel) {
            parentLevel = taskLevel;
            parentNode = task.id;
          }
        }
      });

      currentNode = parentNode;
    }

    return path;
  }

  /**
   * Get performance insights for orchestration decisions
   */
  private getPerformanceInsights(): {
    highPerformingTasks: string[];
    lowPerformingTasks: string[];
    recommendations: string[];
  } {
    const insights = {
      highPerformingTasks: [] as string[],
      lowPerformingTasks: [] as string[],
      recommendations: [] as string[],
    };

    // Analyze task performance history
    this.taskPerformanceHistory.forEach((perf, key) => {
      if (perf.successRate > 80) {
        insights.highPerformingTasks.push(key);
      } else if (
        perf.successRate < 50 &&
        perf.completions + perf.failures > 2
      ) {
        insights.lowPerformingTasks.push(key);
      }
    });

    // Generate recommendations
    if (insights.lowPerformingTasks.length > 0) {
      insights.recommendations.push(
        'Consider revising or removing low-performing task templates'
      );
    }

    if (insights.highPerformingTasks.length > 3) {
      insights.recommendations.push(
        'Prioritize high-performing tasks for critical operations'
      );
    }

    return insights;
  }

  private assessResourceAvailability(): string {
    const allAgents = this.team.store.getState().agents;
    const availableAgents = allAgents.filter(
      (agent) => agent.status !== 'BUSY'
    );
    const totalAgents = allAgents.length;

    if (totalAgents === 0) return 'none';

    const availabilityRatio = availableAgents.length / totalAgents;

    if (availabilityRatio > 0.75) return 'high';
    if (availabilityRatio > 0.5) return 'medium';
    return 'low';
  }

  private assessTimeConstraints(): string {
    // Mock implementation - in reality would analyze project deadlines
    return 'moderate';
  }

  private assessQualityRequirements(): string {
    // Mock implementation - in reality would analyze project quality standards
    return 'high';
  }

  /**
   * Optimize resource utilization across agents
   */
  private async optimizeResourceUtilization(
    context: OrchestrationContext,
    tasks: Task[]
  ): Promise<void> {
    const agents = context.availableAgents;

    // Calculate agent workload
    const agentWorkload = new Map<string, number>();
    agents.forEach((agent) => {
      const assignedTasks = tasks.filter((t) => t.agent.id === agent.id);
      const estimatedLoad = assignedTasks.reduce((sum, task) => {
        const complexity = this.estimateTaskComplexity(task);
        return sum + complexity;
      }, 0);
      agentWorkload.set(agent.id, estimatedLoad);
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
        'Resource utilization optimization recommended',
        {
          avgWorkload,
          imbalancedAgents: imbalancedAgents.map(([id, load]) => ({
            agentId: id,
            currentLoad: load,
            variance:
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
    const overloadedAgents = Array.from(currentWorkload.entries())
      .filter(([_, load]) => load > targetWorkload * 1.2)
      .sort((a, b) => b[1] - a[1]);

    const underloadedAgents = Array.from(currentWorkload.entries())
      .filter(([_, load]) => load < targetWorkload * 0.8)
      .sort((a, b) => a[1] - b[1]);

    let redistributionCount = 0;

    for (const [overloadedId, load] of overloadedAgents) {
      if (underloadedAgents.length === 0) break;

      // Find tasks that can be moved
      const movableTasks = tasks.filter(
        (task) =>
          task.agent.id === overloadedId &&
          task.adaptable &&
          task.status === TASK_STATUS_enum.TODO
      );

      for (const task of movableTasks) {
        if (load <= targetWorkload * 1.1) break;

        const [underloadedId, underLoad] = underloadedAgents[0];
        const underloadedAgent = this.team.store
          .getState()
          .agents.find((a) => a.id === underloadedId);

        if (
          underloadedAgent &&
          this.canAgentHandleTask(underloadedAgent, task)
        ) {
          // Move task
          task.agent = this.team.store
            .getState()
            .agents.find((a) => a.agentInstance.id === underloadedId)!;

          // Update workloads
          const taskComplexity = this.estimateTaskComplexity(task);
          currentWorkload.set(overloadedId, load - taskComplexity);
          currentWorkload.set(underloadedId, underLoad + taskComplexity);

          redistributionCount++;

          // Re-sort underloaded agents
          underloadedAgents.sort(
            (a, b) =>
              (currentWorkload.get(a[0]) || 0) -
              (currentWorkload.get(b[0]) || 0)
          );
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
   * Check if agent can handle a specific task
   */
  private canAgentHandleTask(agent: Agent, task: Task): boolean {
    // Check if agent has required skills
    if (task.resourceRequirements?.skillsRequired) {
      const agentSkills = ContextUtils.extractAgentSkills(agent);
      const hasRequiredSkills = task.resourceRequirements.skillsRequired.every(
        (skill) => agentSkills.includes(skill)
      );

      if (!hasRequiredSkills) return false;
    }

    // Check if agent role matches task requirements
    const taskDescription = (task.description || '').toLowerCase();
    const agentRole = (agent.role || '').toLowerCase();

    // Basic role matching
    if (taskDescription.includes('frontend') && !agentRole.includes('frontend'))
      return false;
    if (taskDescription.includes('backend') && !agentRole.includes('backend'))
      return false;
    if (taskDescription.includes('security') && !agentRole.includes('security'))
      return false;

    return true;
  }

  /**
   * Automated workflow recovery for detected failures
   */
  private async performWorkflowRecovery(
    failedTask: Task,
    failureReason: string
  ): Promise<void> {
    await this.recoveryManager.performWorkflowRecovery(failedTask, failureReason);
  }







  /**
   * Robust JSON parsing with common issue fixes
   */
  private parseRobustJSON(jsonString: string): any {
    // Clean and fix common JSON issues
    let cleanedJson = jsonString;

    // Fix single quotes to double quotes for property names and values
    cleanedJson = cleanedJson.replace(/(\w+):/g, '"$1":'); // Fix unquoted property names
    cleanedJson = cleanedJson.replace(/:\s*'([^']*)'/g, ': "$1"'); // Fix single-quoted values
    cleanedJson = cleanedJson.replace(
      /:\s*([^",[\]{}\s]+)(?=\s*[,}])/g,
      ': "$1"'
    ); // Fix unquoted string values

    // Handle boolean and null values properly
    cleanedJson = cleanedJson.replace(/:\s*"(true|false|null)"/g, ': $1');

    // Try to parse the cleaned JSON first
    try {
      return JSON.parse(cleanedJson);
    } catch (_cleanError) {
      // If cleaned JSON still fails, try with the original
      logger.warn('Cleaned JSON parsing failed, trying original');
      return JSON.parse(jsonString);
    }
  }

  /**
   * Handle task completion for continuous orchestration
   * This method is called after each task completion when continuousOrchestration is enabled
   */
  async orchestrateTaskCompletion(
    completedTask: Task,
    allTasks: Task[]
  ): Promise<any> {
    if (!this.team.enableOrchestration || !this.team.continuousOrchestration) {
      this.updatePerformanceMetric('continuous_orchestration_skipped', 1);
      return null;
    }

    const startTime = Date.now();
    this.updatePerformanceMetric('continuous_orchestration_calls', 1);
    
    // Ensure LLM is initialized for continuous orchestration
    try {
      await this.ensureLLMInitialized();
    } catch (error) {
      logger.warn('LLM initialization failed for continuous orchestration:', error);
      this.updatePerformanceMetric('continuous_orchestration_skipped', 1);
      return null;
    }

    // Track task performance for learning
    const success = completedTask.status === 'DONE';
    const duration = completedTask.duration || undefined;
    this.trackTaskPerformance(completedTask, success, duration);

    logger.info(
      `🎯 Orchestrating post-completion analysis for task: ${completedTask.description.substring(
        0,
        50
      )}...`
    );

    try {
      // Log continuous orchestration start
      this.logOrchestrationEvent(
        'CONTINUOUS_ORCHESTRATION_STARTED',
        'Continuous orchestration triggered by task completion',
        {
          completedTaskId: completedTask.id,
          completedTaskDescription: completedTask.description,
          totalTasks: allTasks.length,
          triggeredBy: 'task_completion',
          orchestrationMode: 'continuous',
        }
      );

      // Analyze current context including the completed task
      const contextAnalysisStart = Date.now();
      const context = await this.contextAnalyzer.analyzeCurrentContext({});
      this.updatePerformanceMetric(
        'continuous_context_analysis_time',
        Date.now() - contextAnalysisStart
      );

      // Add the completed task result to context for analysis
      context.existingTasks = allTasks;

      // Generate intelligent recommendations based on task completion
      const recommendationStart = Date.now();
      const recommendations = await this.generateTaskCompletionRecommendations(
        completedTask,
        context
      );
      this.updatePerformanceMetric(
        'recommendation_generation_time',
        Date.now() - recommendationStart
      );

      const endTime = Date.now();
      const duration = endTime - startTime;
      this.updatePerformanceMetric('continuous_orchestration_success', 1);
      this.updatePerformanceMetric('continuous_orchestration_time', duration);

      // Log successful completion of continuous orchestration
      this.logOrchestrationEvent(
        'CONTINUOUS_ORCHESTRATION_COMPLETED',
        'Continuous orchestration analysis completed',
        {
          completedTaskId: completedTask.id,
          analysisResults: {
            taskImpact:
              recommendations.analysis?.taskImpact || 'No impact analysis',
            newTasksRecommended:
              recommendations.recommendations?.newTasks?.length || 0,
            modificationsRecommended:
              recommendations.recommendations?.taskModifications?.length || 0,
            priorityAdjustments:
              recommendations.recommendations?.priorityAdjustments?.length || 0,
            resourceOptimizations:
              recommendations.recommendations?.resourceOptimizations?.length ||
              0,
            urgencyLevel: recommendations.urgency || 'not_specified',
            confidenceLevel: recommendations.confidenceLevel || 'unknown',
          },
          duration: duration,
          success: true,
        }
      );

      // Provide summary for logging
      const newTasksCount =
        recommendations.recommendations?.newTasks?.length || 0;
      const modificationsCount =
        recommendations.recommendations?.taskModifications?.length || 0;
      const totalRecommendations = newTasksCount + modificationsCount;

      if (totalRecommendations > 0) {
        logger.info(
          `✅ Continuous orchestration complete. Generated ${totalRecommendations} recommendations (${newTasksCount} new tasks, ${modificationsCount} modifications)`
        );
      } else {
        logger.info(
          `ℹ️ Continuous orchestration complete. No additional actions needed.`
        );
      }

      return recommendations;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.updatePerformanceMetric('continuous_orchestration_failures', 1);
      this.updatePerformanceMetric('failed_operations', 1);

      logger.error('Continuous orchestration failed:', error);

      // Log continuous orchestration error
      this.logOrchestrationEvent(
        'CONTINUOUS_ORCHESTRATION_ERROR',
        'Continuous orchestration failed during task completion analysis',
        {
          completedTaskId: completedTask.id,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          duration: duration,
          fallbackApplied: false,
        }
      );

      // Return null to indicate no recommendations generated due to error
      return null;
    }
  }

  private async generateTaskCompletionRecommendations(
    completedTask: Task,
    context: OrchestrationContext
  ): Promise<any> {
    // Double-check LLM is initialized (this should already be done by ensureLLMInitialized)
    if (!this.llm) {
      logger.error('LLM is null in generateTaskCompletionRecommendations despite ensureLLMInitialized call');
      
      // Try one more time to initialize
      try {
        await this.ensureLLMInitialized();
      } catch (error) {
        logger.error('Emergency LLM initialization also failed:', error);
        throw new Error(
          'LLM is required for generating task completion recommendations. Please configure an LLM for the orchestrator.'
        );
      }
      
      // Check again after emergency initialization
      if (!this.llm) {
        throw new Error(
          'LLM is required for generating task completion recommendations. Please configure an LLM for the orchestrator.'
        );
      }
    }

    const operationStartTime = Date.now();

    try {
      // Get the task result from the completed task
      const taskResult = completedTask.result;

      // Use professional prompt template for task completion analysis
      const prompt =
        OrchestrationPromptFactory.createTaskCompletionAnalysisPrompt(
          completedTask,
          context,
          taskResult,
          this.team.orchestrationStrategy ||
            'Intelligent continuous orchestration based on task completion analysis'
        );

      const llmStartTime = Date.now();
      const response = await this.llm.invoke(prompt);
      const content = response.content.toString();
      this.updatePerformanceMetric('llm_calls', 1);
      this.updatePerformanceMetric(
        'llm_response_time',
        Date.now() - llmStartTime
      );

      // Parse structured JSON response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        logger.warn(
          `Task completion analysis response did not contain valid JSON. Response: ${content.substring(
            0,
            200
          )}`
        );
        // Return minimal recommendations if parsing fails
        return {
          analysis: {
            taskImpact: 'Task completed successfully',
            dependenciesUnblocked: [],
            newOpportunities: [],
            identifiedRisks: [],
            qualityAssessment: 'Task result processed',
          },
          recommendations: {
            newTasks: [],
            taskModifications: [],
            priorityAdjustments: [],
            resourceOptimizations: [],
          },
          urgency: 'next_review',
          confidenceLevel: 'low',
        };
      }

      const analysisData = JSON.parse(jsonMatch[1]);

      // Log the analysis results
      logger.info(
        `🤖 Task completion analysis for: ${completedTask.description.substring(
          0,
          50
        )}...`
      );
      logger.info(
        `📊 Impact: ${analysisData.analysis?.taskImpact || 'Not assessed'}`
      );
      logger.info(
        `🔄 Recommended actions: ${
          analysisData.recommendations?.newTasks?.length || 0
        } new tasks, ${
          analysisData.recommendations?.taskModifications?.length || 0
        } modifications`
      );
      logger.info(`⚡ Urgency: ${analysisData.urgency || 'Not specified'}`);

      // Apply recommendations if they have high urgency and confidence
      if (
        analysisData.urgency === 'immediate' &&
        analysisData.confidenceLevel === 'high'
      ) {
        await this.applyTaskCompletionRecommendations(
          analysisData.recommendations,
          context
        );
      }

      // Log task completion analysis event
      this.logOrchestrationEvent(
        'TASK_COMPLETION_ANALYSIS',
        'Task completion analysis completed',
        {
          completedTaskId: completedTask.id,
          completedTaskDescription: completedTask.description,
          analysis: analysisData.analysis,
          recommendationsCount: {
            newTasks: analysisData.recommendations?.newTasks?.length || 0,
            taskModifications:
              analysisData.recommendations?.taskModifications?.length || 0,
            priorityAdjustments:
              analysisData.recommendations?.priorityAdjustments?.length || 0,
            resourceOptimizations:
              analysisData.recommendations?.resourceOptimizations?.length || 0,
          },
          urgency: analysisData.urgency,
          confidenceLevel: analysisData.confidenceLevel,
          nextReviewTrigger: analysisData.nextReviewTrigger,
        }
      );

      // Update conversation history with structured data
      this.conversationHistory.push({
        type: 'task_completion_analysis',
        prompt,
        response: content,
        completedTaskId: completedTask.id,
        analysis: analysisData.analysis,
        recommendations: analysisData.recommendations,
        timestamp: new Date(),
      });

      // Track successful completion analysis
      this.updatePerformanceMetric('recommendation_generation_success', 1);
      this.updatePerformanceMetric(
        'recommendation_operation_time',
        Date.now() - operationStartTime
      );

      return analysisData;
    } catch (error) {
      logger.error('Task completion analysis failed:', error);
      this.updatePerformanceMetric('recommendation_generation_failures', 1);
      this.updatePerformanceMetric('failed_operations', 1);

      // Log error event
      this.logOrchestrationEvent(
        'TASK_COMPLETION_ANALYSIS_ERROR',
        'Task completion analysis failed',
        {
          completedTaskId: completedTask.id,
          error: error instanceof Error ? error.message : String(error),
          fallbackApplied: false,
        }
      );

      // Throw error - orchestrator requires LLM to function
      throw new Error(
        `Task completion analysis failed: ${
          error instanceof Error ? error.message : String(error)
        }. Orchestrator requires LLM to function.`
      );
    }
  }

  /**
   * Apply task completion recommendations to the workflow
   */
  private async applyTaskCompletionRecommendations(
    recommendations: any,
    context: OrchestrationContext
  ): Promise<void> {
    if (!recommendations) return;

    const appliedActions: string[] = [];

    try {
      // Apply new tasks if any
      if (recommendations.newTasks && recommendations.newTasks.length > 0) {
        for (const newTaskData of recommendations.newTasks) {
          if (this.team.allowTaskGeneration) {
            // Generate new tasks based on continuous orchestration recommendations
            const newTasks = await this.generateContinuousOptimizationTasks(
              [newTaskData],
              context
            );

            if (newTasks.length > 0) {
              this.addOrchestrationTasks(newTasks);
              appliedActions.push(
                `Added ${
                  newTasks.length
                } new optimization task(s): ${newTaskData.description.substring(
                  0,
                  50
                )}...`
              );
            }
          }
        }
      }

      // Apply task modifications
      if (
        recommendations.taskModifications &&
        recommendations.taskModifications.length > 0
      ) {
        const teamState = this.team.store.getState();
        for (const modification of recommendations.taskModifications) {
          const task = teamState.tasks.find(
            (t) => t.id === modification.taskId
          );
          if (task && task.adaptable) {
            // Apply modifications based on type
            switch (modification.modificationType) {
              case 'priority':
                if (task.dynamicPriority && modification.newValue) {
                  task.priority = modification.newValue as
                    | 'high'
                    | 'medium'
                    | 'low';
                  appliedActions.push(
                    `Modified task priority to ${
                      modification.newValue
                    }: ${task.description.substring(0, 50)}...`
                  );
                }
                break;
              case 'agent': {
                const newAgent = context.availableAgents.find(
                  (a) =>
                    a.name.toLowerCase() ===
                    modification.newValue?.toLowerCase()
                );
                if (newAgent) {
                  task.agent = newAgent;
                  appliedActions.push(
                    `Reassigned task agent: ${task.description.substring(
                      0,
                      50
                    )}...`
                  );
                }
                break;
              }
            }
          }
        }
      }

      if (appliedActions.length > 0) {
        logger.info(
          `🚀 Applied ${appliedActions.length} task completion recommendations`
        );
        appliedActions.forEach((action) => logger.info(`   • ${action}`));

        // Log applied recommendations
        this.logOrchestrationEvent(
          'RECOMMENDATIONS_APPLIED',
          'Task completion recommendations applied',
          {
            actionsApplied: appliedActions,
            recommendationsCount: appliedActions.length,
            applicationType: 'automatic',
          }
        );
      }
    } catch (error) {
      logger.error('Failed to apply task completion recommendations:', error);
      this.logOrchestrationEvent(
        'RECOMMENDATIONS_APPLICATION_ERROR',
        'Failed to apply task completion recommendations',
        {
          error: error instanceof Error ? error.message : String(error),
          partialActionsApplied: appliedActions,
        }
      );
    }
  }

  /**
   * Generate new tasks specifically for continuous orchestration optimization
   */
  private async generateContinuousOptimizationTasks(
    recommendedTasks: any[],
    context: OrchestrationContext
  ): Promise<Task[]> {
    const newTasks: Task[] = [];

    for (const taskData of recommendedTasks) {
      try {
        // Find the best agent for this optimization task
        const agent =
          context.availableAgents.find(
            (a) =>
              a.name.toLowerCase() === taskData.suggestedAgent?.toLowerCase() ||
              a.role
                .toLowerCase()
                .includes(taskData.suggestedAgent?.toLowerCase() || '')
          ) ||
          context.availableAgents[0] ||
          this.team.store.getState().agents[0];

        const newTask = new Task({
          description: taskData.description,
          expectedOutput:
            taskData.expectedOutput ||
            `${taskData.description} - optimized for continuous workflow`,
          agent: agent,
          adaptable: true,
          resourceRequirements: {
            estimatedTime: taskData.estimatedTime || '1-2 hours',
            skillsRequired: taskData.requiredSkills || [],
            dependencies: taskData.dependencies || [],
          },
          orchestrationRules: `
            CONTINUOUS OPTIMIZATION TASK
            
            Generated through continuous orchestration analysis.
            
            Priority: ${taskData.priority || 'medium'}
            Reason: ${taskData.reason || 'Workflow optimization'}
            
            This task should:
            - Integrate smoothly with existing workflow
            - Provide measurable improvement to project progress
            - Be completed efficiently without disrupting other tasks
            
            Success criteria:
            - Task completion contributes to overall project goals
            - No negative impact on existing task performance
            - Clear deliverable that can be validated
          `,
        });

        newTasks.push(newTask);

        logger.info(
          `📋 Generated continuous optimization task: ${taskData.description.substring(
            0,
            50
          )}...`
        );
      } catch (error) {
        logger.error(`Failed to generate continuous optimization task:`, error);
        continue;
      }
    }

    // Log task generation for continuous orchestration
    if (newTasks.length > 0) {
      this.logOrchestrationEvent(
        'CONTINUOUS_TASK_GENERATION',
        'New tasks generated through continuous orchestration',
        {
          tasksGenerated: newTasks.length,
          generationType: 'continuous_optimization',
          recommendationSource: 'task_completion_analysis',
          taskDescriptions: newTasks.map((task) => task.description),
        }
      );
    }

    return newTasks;
  }

  /**
   * Monitor orchestrator performance and health
   */
  private async performHealthCheck(): Promise<{
    healthy: boolean;
    metrics: Record<string, number>;
    recommendations: string[];
  }> {
    const metrics = this.performanceMetrics.getAllMetrics();
    const recommendations: string[] = [];
    let healthy = true;

    // Check LLM failure rate
    const llmFailureRate =
      metrics.llm_calls > 0
        ? (metrics.llm_failures / metrics.llm_calls) * 100
        : 0;

    if (llmFailureRate > 20) {
      healthy = false;
      recommendations.push(
        'High LLM failure rate detected - consider checking LLM configuration'
      );
    }

    // Check overall operation success rate
    const totalOperations =
      metrics.successful_operations + metrics.failed_operations;
    const successRate =
      totalOperations > 0
        ? (metrics.successful_operations / totalOperations) * 100
        : 100;

    if (successRate < 80) {
      healthy = false;
      recommendations.push(
        'Low operation success rate - review orchestration strategy'
      );
    }

    // Check task generation efficiency
    if (metrics.tasks_generated === 0 && this.team.allowTaskGeneration) {
      recommendations.push(
        'No tasks generated despite allowTaskGeneration enabled - review gap analysis'
      );
    }

    // Check adaptation rate
    if (metrics.tasks_adapted === 0 && metrics.orchestration_calls > 0) {
      recommendations.push(
        'No tasks adapted - consider enabling more adaptable tasks'
      );
    }

    // Log health check results
    this.logOrchestrationEvent(
      'HEALTH_CHECK',
      'Orchestrator health check completed',
      {
        healthy,
        metrics,
        recommendations,
        llmFailureRate: Math.round(llmFailureRate * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
      }
    );

    return { healthy, metrics, recommendations };
  }

  /**
   * Update performance metrics for tracking
   */
  private updatePerformanceMetric(metric: string, increment: number = 1): void {
    this.performanceMetrics.updateMetric(metric, increment);
  }

  /**
   * Validate orchestration configuration for edge cases
   */
  private validateOrchestrationConfig(): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check LLM configuration
    if (!this.llm && this.team.enableOrchestration) {
      errors.push('Orchestration enabled but no LLM configured');
    }

    // Check available tasks
    if (!this.availableTasks || this.availableTasks.length === 0) {
      warnings.push(
        'No backlog tasks available - orchestrator cannot select tasks'
      );
    }

    // Check adaptable tasks ratio
    const adaptableTasks = (this.availableTasks || []).filter(
      (task) => task && task.adaptable
    );
    const adaptableRatio =
      this.availableTasks && this.availableTasks.length > 0
        ? (adaptableTasks.length / this.availableTasks.length) * 100
        : 0;

    if (adaptableRatio < 50 && this.availableTasks && this.availableTasks.length > 0) {
      const nonAdaptableTasks = (this.availableTasks || []).filter(
        (task) => task && !task.adaptable
      );
      
      warnings.push(
        `⚠️ Low ratio of adaptable tasks (${adaptableTasks.length}/${this.availableTasks.length} = ${Math.round(adaptableRatio)}%) - orchestrator flexibility limited. Consider marking more tasks as adaptable to allow dynamic adjustments based on user inputs and context.`
      );
      
      // Log some examples of non-adaptable tasks for developer awareness
      if (nonAdaptableTasks.length > 0) {
        const examples = nonAdaptableTasks.slice(0, 3).map(t => t.title || t.description.substring(0, 50));
        logger.warn('Examples of non-adaptable tasks:', examples);
      }
    } else if (adaptableRatio < 30 && this.availableTasks && this.availableTasks.length > 0) {
      warnings.push(
        `⚠️ Critical: Very low ratio of adaptable tasks (${Math.round(adaptableRatio)}%) - orchestrator cannot effectively optimize workflow. Most tasks are rigid and cannot be adjusted.`
      );
    }

    // Check orchestration strategy
    if (
      !this.orchestrationStrategy ||
      this.orchestrationStrategy.trim().length < 50
    ) {
      warnings.push(
        'Orchestration strategy is too brief - provide more detailed guidance'
      );
    }

    // Check team configuration
    const teamState = this.team.store.getState();
    if (teamState.agents.length === 0) {
      errors.push('No agents available for task assignment');
    }

    // Check mode compatibility
    if (this.mode === 'innovative' && !this.team.allowTaskGeneration) {
      warnings.push(
        'Innovative mode without task generation may limit orchestrator effectiveness'
      );
    }

    const valid = errors.length === 0;

    // Log validation results
    this.logOrchestrationEvent(
      'CONFIG_VALIDATION',
      'Orchestration configuration validation completed',
      {
        valid,
        warnings,
        errors,
        adaptableRatio: Math.round(adaptableRatio * 100) / 100,
        configuredMode: this.mode,
        llmConfigured: !!this.llm,
      }
    );

    return { valid, warnings, errors };
  }

  /**
   * Get orchestrator control status and recommendations
   */
  async getControlStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    healthCheck: any;
    configValidation: any;
    recommendations: string[];
  }> {
    const healthCheck = await this.performHealthCheck();
    const configValidation = this.validateOrchestrationConfig();

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    const allRecommendations = [
      ...healthCheck.recommendations,
      ...configValidation.warnings,
      ...configValidation.errors,
    ];

    if (!configValidation.valid || !healthCheck.healthy) {
      status = configValidation.errors.length > 0 ? 'error' : 'warning';
    }

    return {
      status,
      healthCheck,
      configValidation,
      recommendations: allRecommendations,
    };
  }

  /**
   * Select tasks specifically for continuous orchestration optimization
   */
  private async selectContinuousOptimizationTasks(
    context: OrchestrationContext,
    optimizationGoal: string
  ): Promise<Task[]> {
    if (!this.availableTasks || this.availableTasks.length === 0) {
      logger.info(
        'No tasks available in repository for continuous optimization'
      );
      return [];
    }

    try {
      // Use continuous orchestration task selection
      const selectedTasks = await this.selectOptimalTasks(
        context,
        optimizationGoal,
        'continuous'
      );

      // Log continuous task selection
      this.logOrchestrationEvent(
        'CONTINUOUS_TASK_SELECTION',
        'Tasks selected for continuous orchestration optimization',
        {
          tasksSelected: selectedTasks.length,
          selectionMode: 'continuous_optimization',
          optimizationGoal: optimizationGoal,
          taskDescriptions: selectedTasks.map((task) => task.description),
        }
      );

      return selectedTasks;
    } catch (error) {
      logger.error('Continuous task selection failed:', error);
      return [];
    }
  }

  /**
   * Enhanced performance learning algorithm
   */
  private learnFromPerformanceHistory(): void {
    if (this.team.mode !== 'learning') return;

    // Analyze metric trends
    const trends = this.analyzeMetricTrends();

    // Identify patterns
    const patterns = this.identifyPerformancePatterns();

    // Adjust strategies based on learning
    this.adjustStrategiesBasedOnLearning(trends, patterns);
  }

  /**
   * Analyze metric trends
   */
  private analyzeMetricTrends(): Map<
    string,
    { trend: 'improving' | 'declining' | 'stable'; rate: number }
  > {
    const trends = new Map<
      string,
      { trend: 'improving' | 'declining' | 'stable'; rate: number }
    >();

    // Get all metrics
    const allMetrics = this.performanceMetrics.getAllMetrics();
    
    // Analyze each metric's history
    Object.keys(allMetrics).forEach((metric) => {
      const history = this.performanceMetrics.getMetricHistory(metric);
      if (history.length < 10) return;

      // Calculate moving averages
      const recentAvg = history.slice(-10).reduce((a, b) => a + b, 0) / 10;
      const historicalAvg =
        history.slice(0, -10).reduce((a, b) => a + b, 0) /
        (history.length - 10);

      const changeRate = (recentAvg - historicalAvg) / historicalAvg;

      let trend: 'improving' | 'declining' | 'stable';
      if (changeRate > 0.1) {
        trend =
          metric.includes('time') || metric.includes('duration')
            ? 'declining'
            : 'improving';
      } else if (changeRate < -0.1) {
        trend =
          metric.includes('time') || metric.includes('duration')
            ? 'improving'
            : 'declining';
      } else {
        trend = 'stable';
      }

      trends.set(metric, { trend, rate: Math.abs(changeRate) });
    });

    return trends;
  }

  /**
   * Identify performance patterns
   */
  private identifyPerformancePatterns(): Array<{
    pattern: string;
    confidence: number;
    recommendation: string;
  }> {
    const patterns: Array<{
      pattern: string;
      confidence: number;
      recommendation: string;
    }> = [];

    // Pattern: Task success vs complexity
    const complexitySuccessRatio = this.analyzeComplexitySuccessPattern();
    if (complexitySuccessRatio.confidence > 0.7) {
      patterns.push({
        pattern: 'complexity-success-correlation',
        confidence: complexitySuccessRatio.confidence,
        recommendation:
          complexitySuccessRatio.highComplexitySuccess < 0.5
            ? 'Consider breaking down complex tasks'
            : 'Current complexity handling is effective',
      });
    }

    // Pattern: Agent utilization imbalance
    const utilizationPattern = this.analyzeAgentUtilizationPattern();
    if (utilizationPattern.imbalanceScore > 0.3) {
      patterns.push({
        pattern: 'agent-utilization-imbalance',
        confidence: 0.9,
        recommendation: 'Optimize task distribution across agents',
      });
    }

    // Pattern: Time-based performance
    const timePattern = this.analyzeTimeBasedPerformance();
    if (timePattern.variance > 0.2) {
      patterns.push({
        pattern: 'time-based-performance-variance',
        confidence: 0.8,
        recommendation:
          'Performance varies by time - consider scheduling optimizations',
      });
    }

    return patterns;
  }

  /**
   * Adjust strategies based on learning
   */
  private adjustStrategiesBasedOnLearning(
    trends: Map<
      string,
      { trend: 'improving' | 'declining' | 'stable'; rate: number }
    >,
    patterns: Array<{
      pattern: string;
      confidence: number;
      recommendation: string;
    }>
  ): void {
    // Log learning insights
    if (patterns.length > 0) {
      this.logOrchestrationEvent(
        'LEARNING_INSIGHTS',
        'Performance patterns identified',
        {
          trends: Array.from(trends.entries()).map(([metric, data]) => ({
            metric,
            ...data,
          })),
          patterns: patterns.map((p) => ({
            pattern: p.pattern,
            confidence: p.confidence,
            recommendation: p.recommendation,
          })),
        }
      );
    }

    // Apply automatic adjustments in learning mode
    patterns.forEach((pattern) => {
      if (pattern.confidence > 0.8) {
        switch (pattern.pattern) {
          case 'complexity-success-correlation':
            if (pattern.recommendation.includes('breaking down')) {
              // Automatically adjust split strategy for new tasks
              this.adjustTaskSplitStrategy('aggressive');
            }
            break;

          case 'agent-utilization-imbalance':
            // Switch to skills-based distribution
            if (this.team.workloadDistribution !== 'skills-based') {
              this.team.workloadDistribution = 'skills-based';
              logger.info('🔄 Switched to skills-based workload distribution');
            }
            break;

          case 'time-based-performance-variance': {
            // Removed timer-based optimization - using continuous orchestration pattern instead
            // This learning insight is noted but no timer-based action needed
            logger.info(
              '📈 Performance variance detected - using continuous orchestration for optimization'
            );
            break;
          }
        }
      }
    });
  }

  /**
   * Helper method to analyze complexity vs success pattern
   */
  private analyzeComplexitySuccessPattern(): {
    confidence: number;
    highComplexitySuccess: number;
  } {
    let _lowComplexitySuccess = 0;
    let lowComplexityTotal = 0;
    let highComplexitySuccess = 0;
    let highComplexityTotal = 0;

    this.taskPerformanceHistory.forEach((perf, key) => {
      const [taskType] = key.split('::');
      const complexity = this.estimateTaskComplexity(taskType);

      if (complexity < 2) {
        lowComplexityTotal += perf.completions + perf.failures;
        _lowComplexitySuccess += perf.completions;
      } else {
        highComplexityTotal += perf.completions + perf.failures;
        highComplexitySuccess += perf.completions;
      }
    });

    const confidence =
      lowComplexityTotal + highComplexityTotal > 10 ? 0.9 : 0.5;
    const highSuccessRate =
      highComplexityTotal > 0 ? highComplexitySuccess / highComplexityTotal : 0;

    return { confidence, highComplexitySuccess: highSuccessRate };
  }

  /**
   * Helper method to analyze agent utilization pattern
   */
  private analyzeAgentUtilizationPattern(): { imbalanceScore: number } {
    const agentWorkloads = new Map<string, number>();

    this.team.getTasks().forEach((task) => {
      const load = agentWorkloads.get(task.agent.id) || 0;
      agentWorkloads.set(task.agent.id, load + 1);
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

  /**
   * Helper method to analyze time-based performance
   */
  private analyzeTimeBasedPerformance(): { variance: number } {
    const timeMetrics = this.performanceMetrics.getMetricHistory('orchestration_duration');

    if (timeMetrics.length < 5) return { variance: 0 };

    const avg = timeMetrics.reduce((a, b) => a + b, 0) / timeMetrics.length;
    const variance =
      timeMetrics.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) /
      timeMetrics.length;
    const coefficientOfVariation = Math.sqrt(variance) / avg;

    return { variance: coefficientOfVariation };
  }

  /**
   * Adjust task split strategy
   */
  private adjustTaskSplitStrategy(
    strategy: 'conservative' | 'moderate' | 'aggressive'
  ): void {
    this.splitStrategyPreference = strategy;

    this.logOrchestrationEvent(
      'STRATEGY_ADJUSTED',
      `Task split strategy adjusted to ${strategy} based on learning`,
      { newStrategy: strategy }
    );
  }

  /**
   * Estimate task complexity
   */
  private estimateTaskComplexity(task: Task | string): number {
    const taskType =
      typeof task === 'string' ? task : task.description.toLowerCase();
    const keywords = taskType.toLowerCase();

    if (
      keywords.includes('complex') ||
      keywords.includes('architecture') ||
      keywords.includes('integration')
    ) {
      return 3;
    } else if (
      keywords.includes('implement') ||
      keywords.includes('develop') ||
      keywords.includes('create')
    ) {
      return 2;
    } else {
      return 1;
    }
  }

  /**
   * Identify high-risk tasks based on various factors
   */
  private async identifyHighRiskTasks(
    context: OrchestrationContext,
    tasks: Task[]
  ): Promise<Array<Task & { riskScore?: number; riskFactors?: string[] }>> {
    const highRiskTasks: Array<
      Task & { riskScore?: number; riskFactors?: string[] }
    > = [];

    for (const task of tasks) {
      const riskFactors: string[] = [];
      let riskScore = 0;

      // Check task complexity
      const complexity = this.estimateTaskComplexity(task);
      if (complexity > 2) {
        riskFactors.push('High complexity');
        riskScore += 0.3;
      }

      // Check dependencies
      if (task.dependencies.length > 3) {
        riskFactors.push('Many dependencies');
        riskScore += 0.2;
      }

      // Check agent availability
      if (task.agent.status === 'BUSY') {
        riskFactors.push('Agent busy');
        riskScore += 0.2;
      }

      // Check historical performance
      const performance = this.getTaskPerformanceScore(task);
      if (performance < 40) {
        riskFactors.push('Poor historical performance');
        riskScore += 0.3;
      }

      // Check skill requirements
      if (
        task.resourceRequirements?.skillsRequired &&
        task.resourceRequirements.skillsRequired.length > 0
      ) {
        const agentSkills = ContextUtils.extractAgentSkills(task.agent);
        const missingSkills = task.resourceRequirements.skillsRequired.filter(
          (skill) => !agentSkills.includes(skill)
        );

        if (missingSkills.length > 0) {
          riskFactors.push(`Missing skills: ${missingSkills.join(', ')}`);
          riskScore += 0.2 * missingSkills.length;
        }
      }

      // Mark as high-risk if score exceeds threshold
      if (riskScore > 0.5) {
        const riskyTask = task as Task & {
          riskScore?: number;
          riskFactors?: string[];
        };
        riskyTask.riskScore = riskScore;
        riskyTask.riskFactors = riskFactors;
        highRiskTasks.push(riskyTask);
      }
    }

    return highRiskTasks;
  }

  /**
   * Simple logging method
   */
  private log(level: string, message: string, meta?: any): void {
    if (level === 'error') {
      logger.error(message, meta);
    } else if (level === 'warn') {
      logger.warn(message, meta);
    } else {
      logger.info(message, meta);
    }
  }

  /**
   * Build orchestration context for LLM prompts
   */
  private buildOrchestrationContext(): any {
    const state = this.team.getStore().getState();
    const tasks = this.team.getTasks() || [];
    const agents = state.agents || [];

    const completedTasks = tasks.filter(
      (t) => t && t.status === TASK_STATUS_enum.DONE
    );
    const activeTasks = tasks.filter(
      (t) =>
        t &&
        (t.status === TASK_STATUS_enum.DOING ||
          t.status === TASK_STATUS_enum.BLOCKED)
    );
    const todoTasks = tasks.filter(
      (t) => t && t.status === TASK_STATUS_enum.TODO
    );

    return {
      teamName: this.team.getStore().getState().name,
      projectStatus: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        activeTasks: activeTasks.length,
        todoTasks: todoTasks.length,
        progressPercentage:
          tasks.length > 0
            ? Math.round((completedTasks.length / tasks.length) * 100)
            : 0,
      },
      availableAgents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: agent.status,
        skills: agent.background,
        currentTasks: tasks.filter(
          (t) =>
            t &&
            t.agent &&
            t.agent.id === agent.id &&
            t.status === TASK_STATUS_enum.DOING
        ).length,
      })),
      workflowStatus: state.teamWorkflowStatus,
      orchestrationMode: this.mode,
      allowTaskGeneration: this.team.allowTaskGeneration,
      maxActiveTasks: this.team.maxActiveTasks,
      taskPrioritization: this.team.taskPrioritization,
      workloadDistribution: this.team.workloadDistribution,
      performanceMetrics: this.performanceMetrics.getAllMetrics(),
      taskHistory: {
        adaptations: this.taskAdaptationHistory.slice(-10),
        performance: Array.from(this.taskPerformanceHistory.entries()).slice(
          -10
        ),
      },
      inputs: state.inputs || {},
    };
  }

  /**
   * Call LLM with proper error handling and retries
   */
  private async callLLM(prompt: string): Promise<string> {
    if (!this.llm) {
      throw new Error('LLM not initialized');
    }

    // Performance optimization: Check cache first
    const promptHash = this.hashPrompt(prompt);
    const cached = this.llmCache.get(promptHash);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      logger.info('🚀 Using cached LLM response');
      return cached.response;
    }

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`🤖 Calling LLM (attempt ${attempt}/${maxRetries})`);

        const response = await this.llm.invoke([
          {
            role: 'system',
            content:
              'You are an intelligent task orchestrator for a multi-agent AI system.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ]);

        if (response && response.content) {
          const result =
            typeof response.content === 'string'
              ? response.content
              : JSON.stringify(response.content);

          // Cache the response for future use
          this.llmCache.set(promptHash, {
            response: result,
            timestamp: Date.now(),
          });

          return result;
        }

        throw new Error('Empty response from LLM');
      } catch (error) {
        lastError = error;
        logger.warn(
          `LLM call failed (attempt ${attempt}/${maxRetries}):`,
          error
        );

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `LLM call failed after ${maxRetries} attempts: ${
        lastError?.message || 'Unknown error'
      }`
    );
  }

  /**
   * Performance optimization: Generate hash for prompt caching
   */
  private hashPrompt(prompt: string): string {
    // Simple hash function for prompt caching
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Performance optimization: Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.llmCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.llmCache.delete(key);
      }
    }
  }
}
