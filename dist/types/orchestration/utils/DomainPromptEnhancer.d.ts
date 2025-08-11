import { OrchestrationContext } from '../core/OrchestrationContext';
/**
 * Domain-specific prompt enhancements
 */
export declare class DomainPromptEnhancer {
    /**
     * Enhance prompt with domain-specific criteria based on inputs and context
     */
    static enhancePromptForDomain(basePrompt: string, context: OrchestrationContext, detectedDomain?: string): string;
    /**
     * Detect domain from user inputs
     */
    private static detectDomain;
    /**
     * Get domain-specific enhancement text
     */
    private static getDomainEnhancement;
    /**
     * Restaurant-specific enhancements
     */
    private static getRestaurantEnhancement;
    /**
     * Construction-specific enhancements
     */
    private static getConstructionEnhancement;
    /**
     * Software development-specific enhancements
     */
    private static getSoftwareEnhancement;
    /**
     * Healthcare-specific enhancements
     */
    private static getHealthcareEnhancement;
    /**
     * Education-specific enhancements
     */
    private static getEducationEnhancement;
}
