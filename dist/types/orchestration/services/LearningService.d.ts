/**
 * Learning Service
 *
 * Handles learning and optimization from performance history
 * for the intelligent orchestration system.
 */
import { LearningPattern, OrchestrationMode, SplitStrategyPreference } from '../OrchestrationContext';
export declare class LearningService {
    private learningHistory;
    private patterns;
    private mode;
    constructor(mode?: OrchestrationMode);
    /**
     * Learn from performance history and adjust strategies
     */
    learnFromPerformanceHistory(performanceMetrics: Map<string, number>): void;
    /**
     * Get learning-based recommendations
     */
    getRecommendations(): LearningPattern[];
    /**
     * Adjust task split strategy based on learning
     */
    adjustTaskSplitStrategy(currentPreference: SplitStrategyPreference, complexitySuccessPattern: {
        successRate: number;
        complexity: string;
    }): SplitStrategyPreference;
    /**
     * Record learning data point
     */
    recordLearningData(category: string, data: any): void;
    /**
     * Update learning mode
     */
    updateMode(mode: OrchestrationMode): void;
    private analyzeMetricTrends;
    private identifyPerformancePatterns;
}
