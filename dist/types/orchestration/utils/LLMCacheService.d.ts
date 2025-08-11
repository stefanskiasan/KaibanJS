/**
 * LLM Cache Service
 *
 * Handles caching of LLM responses to improve performance and reduce API calls.
 */
export declare class LLMCacheService {
    private cache;
    private cacheTimeout;
    private maxCacheSize;
    private hitCount;
    private missCount;
    constructor(cacheTimeout?: number, maxCacheSize?: number);
    /**
     * Get cached response for a prompt
     */
    get(prompt: string): any | null;
    /**
     * Store response in cache
     */
    set(prompt: string, response: any): void;
    /**
     * Clear all cached entries
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        hitCount: number;
        missCount: number;
        hitRate: number;
        maxSize: number;
        timeout: number;
    };
    /**
     * Clean expired entries
     */
    cleanExpiredEntries(): void;
    /**
     * Update cache configuration
     */
    updateConfig(cacheTimeout?: number, maxCacheSize?: number): void;
    /**
     * Get cache memory usage estimation
     */
    getMemoryUsage(): {
        estimatedSizeKB: number;
        entries: number;
    };
    /**
     * Destroy cache service and cleanup
     */
    destroy(): void;
    private cleanupInterval?;
    private startPeriodicCleanup;
    private hashPrompt;
    private evictOldestEntries;
}
