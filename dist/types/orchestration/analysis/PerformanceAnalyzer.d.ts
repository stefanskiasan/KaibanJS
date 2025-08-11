import { Task, Team } from '../../index';
import { OrchestrationMetrics, MetricTrend } from '../core/OrchestrationContext';
/**
 * Analyzes performance metrics and patterns
 */
export declare class PerformanceAnalyzer {
    private team;
    constructor(team: Team);
    /**
     * Analyze metric trends to identify patterns
     */
    analyzeMetricTrends(metrics: OrchestrationMetrics): MetricTrend[];
    /**
     * Analyze task completion time trends
     */
    private analyzeCompletionTimeTrend;
    /**
     * Analyze success rate trends
     */
    private analyzeSuccessRateTrend;
    /**
     * Analyze agent performance trends
     */
    private analyzeAgentPerformanceTrends;
    /**
     * Analyze task complexity trends
     */
    private analyzeComplexityTrends;
    /**
     * Analyze orchestration efficiency
     */
    private analyzeOrchestrationEfficiency;
    /**
     * Identify performance patterns for optimization
     */
    identifyPerformancePatterns(metrics: OrchestrationMetrics): string[];
    /**
     * Calculate variance for a set of numbers
     */
    private calculateVariance;
    /**
     * Detect agent specialization patterns
     */
    private detectAgentSpecializationPattern;
    /**
     * Detect time-based performance patterns
     */
    private detectTimeBasedPattern;
    /**
     * Detect complexity handling patterns
     */
    private detectComplexityPattern;
    /**
     * Detect resource utilization patterns
     */
    private detectUtilizationPattern;
    /**
     * Analyze complexity-success pattern for specific recommendations
     */
    analyzeComplexitySuccessPattern(completedTasks: Task[]): {
        pattern: string;
        recommendation: string;
    };
    /**
     * Group tasks by complexity level
     */
    private groupTasksByComplexity;
    /**
     * Estimate task complexity
     */
    private estimateTaskComplexity;
    /**
     * Parse estimated time string to hours
     */
    private parseEstimatedTime;
    /**
     * Calculate success rates by complexity
     */
    private calculateSuccessRatesByComplexity;
    /**
     * Analyze agent utilization patterns
     */
    analyzeAgentUtilizationPattern(activeTasks: Task[]): {
        pattern: string;
        recommendation: string;
    };
    /**
     * Analyze time-based performance patterns
     */
    analyzeTimeBasedPerformance(metrics: OrchestrationMetrics): {
        pattern: string;
        timeOfDay?: string;
        recommendation: string;
    };
}
