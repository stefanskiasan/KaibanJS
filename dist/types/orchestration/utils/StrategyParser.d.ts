/**
 * Parsed strategy components
 */
export interface ParsedStrategy {
    goals: string[];
    priorities: string[];
    constraints: string[];
    methods: string[];
    domainKeywords: string[];
    focusAreas: string[];
}
/**
 * Utility class for parsing and analyzing orchestration strategies
 */
export declare class StrategyParser {
    /**
     * Parse orchestration strategy into structured components
     */
    static parseStrategy(strategy: string): ParsedStrategy;
    /**
     * Extract domain-specific keywords from strategy
     */
    private static extractDomainKeywords;
    /**
     * Extract focus areas from strategy
     */
    private static extractFocusAreas;
    /**
     * Generate strategy-specific instructions for prompts
     */
    static generateStrategyInstructions(parsedStrategy: ParsedStrategy, inputs: Record<string, unknown>): string;
    /**
     * Identify primary domain from keywords
     */
    private static identifyDomain;
    /**
     * Generate instructions based on user inputs and strategy
     */
    private static generateInputBasedInstructions;
}
