/**
 * Utility functions for parsing various data formats
 */
export declare class ParsingUtils {
    /**
     * Parse estimated time string to hours
     */
    static parseEstimatedTime(timeStr: string): number;
    /**
     * Robust JSON parsing with common issue fixes
     */
    static parseRobustJSON(jsonString: string): any;
    /**
     * Parse LLM response to extract JSON content
     */
    static parseJSONFromResponse(response: string): any;
    /**
     * Parse adaptation response from LLM
     */
    static parseAdaptationResponse(response: string): any;
    /**
     * Parse priority from string to standardized format
     */
    static parsePriority(priority: string): 'high' | 'medium' | 'low';
    /**
     * Parse skills from various formats
     */
    static parseSkills(skills: string | string[] | undefined): string[];
    /**
     * Parse task IDs from various formats
     */
    static parseTaskIds(ids: string | string[] | undefined): string[];
}
