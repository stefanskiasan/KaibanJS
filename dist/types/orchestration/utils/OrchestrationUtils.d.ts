/**
 * Orchestration Utilities
 *
 * Shared utility functions for the orchestration system.
 */
import { Task } from '../../index';
export declare class OrchestrationUtils {
    /**
     * Parse estimated time from string to hours
     */
    static parseEstimatedTime(timeStr: string): number;
    /**
     * Generate a hash string from input
     */
    static hashString(str: string): string;
    /**
     * Deep clone an object
     */
    static deepClone<T>(obj: T): T;
    /**
     * Validate JSON structure safely
     */
    static parseRobustJSON(jsonString: string): any;
    /**
     * Estimate task complexity
     */
    static estimateTaskComplexity(task: Task | string): number;
    /**
     * Calculate recency weight for time-based scoring
     */
    static calculateRecencyWeight(lastUpdated: number, halfLifeDays?: number): number;
    /**
     * Normalize score to 0-100 range
     */
    static normalizeScore(score: number, min?: number, max?: number): number;
    /**
     * Compare two version strings
     */
    static compareVersions(version1: string, version2: string): number;
    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean;
    /**
     * Debounce function calls
     */
    static debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * Throttle function calls
     */
    static throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * Sleep/delay utility
     */
    static sleep(ms: number): Promise<void>;
    /**
     * Retry function with exponential backoff
     */
    static retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
}
