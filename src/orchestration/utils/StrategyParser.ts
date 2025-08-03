import { logger } from '../../utils/logger';

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
export class StrategyParser {
  /**
   * Parse orchestration strategy into structured components
   */
  static parseStrategy(strategy: string): ParsedStrategy {
    const result: ParsedStrategy = {
      goals: [],
      priorities: [],
      constraints: [],
      methods: [],
      domainKeywords: [],
      focusAreas: [],
    };

    if (!strategy || strategy.trim().length === 0) {
      return result;
    }

    const lowerStrategy = strategy.toLowerCase();
    
    // Extract goals (words after "goal", "objective", "achieve", "accomplish")
    const goalMatches = strategy.match(/(?:goal|objective|achieve|accomplish)[s]?[\s:]+([^.!?\n]+)/gi);
    if (goalMatches) {
      result.goals = goalMatches.map(match => 
        match.replace(/(?:goal|objective|achieve|accomplish)[s]?[\s:]*/i, '').trim()
      );
    }

    // Extract priorities (words after "prioritize", "focus on", "emphasize")
    const priorityMatches = strategy.match(/(?:prioritize|focus on|emphasize|priority)[s]?[\s:]+([^.!?\n]+)/gi);
    if (priorityMatches) {
      result.priorities = priorityMatches.map(match => 
        match.replace(/(?:prioritize|focus on|emphasize|priority)[s]?[\s:]*/i, '').trim()
      );
    }

    // Extract constraints (words after "constraint", "limit", "restriction", "within")
    const constraintMatches = strategy.match(/(?:constraint|limit|restriction|within)[s]?[\s:]+([^.!?\n]+)/gi);
    if (constraintMatches) {
      result.constraints = constraintMatches.map(match => 
        match.replace(/(?:constraint|limit|restriction|within)[s]?[\s:]*/i, '').trim()
      );
    }

    // Extract methods (words after "using", "through", "via", "by")
    const methodMatches = strategy.match(/(?:using|through|via|by)\s+([^.!?\n,]+)/gi);
    if (methodMatches) {
      result.methods = methodMatches.map(match => 
        match.replace(/(?:using|through|via|by)\s+/i, '').trim()
      );
    }

    // Extract domain keywords
    result.domainKeywords = this.extractDomainKeywords(strategy);

    // Extract focus areas
    result.focusAreas = this.extractFocusAreas(strategy);

    logger.info(`📋 Parsed orchestration strategy:`, {
      goalsCount: result.goals.length,
      prioritiesCount: result.priorities.length,
      domainKeywordsCount: result.domainKeywords.length,
    });

    return result;
  }

  /**
   * Extract domain-specific keywords from strategy
   */
  private static extractDomainKeywords(strategy: string): string[] {
    const keywords: Set<string> = new Set();
    const lowerStrategy = strategy.toLowerCase();

    // IT/Software domain
    const itKeywords = [
      'software', 'code', 'programming', 'api', 'database', 'authentication',
      'frontend', 'backend', 'deployment', 'testing', 'debugging', 'performance'
    ];

    // Restaurant domain
    const restaurantKeywords = [
      'restaurant', 'menu', 'food', 'dining', 'kitchen', 'chef', 'service',
      'inventory', 'customer', 'reservation', 'seasonal', 'cuisine'
    ];

    // Construction domain
    const constructionKeywords = [
      'construction', 'building', 'foundation', 'safety', 'inspection',
      'contractor', 'timeline', 'materials', 'blueprint', 'permit'
    ];

    // Healthcare domain
    const healthcareKeywords = [
      'health', 'medical', 'patient', 'treatment', 'diagnosis', 'care',
      'clinical', 'medication', 'appointment', 'wellness'
    ];

    // Education domain
    const educationKeywords = [
      'education', 'learning', 'teaching', 'student', 'curriculum',
      'assessment', 'course', 'training', 'knowledge', 'skill'
    ];

    // Check all keyword sets
    const allKeywordSets = [
      itKeywords,
      restaurantKeywords,
      constructionKeywords,
      healthcareKeywords,
      educationKeywords
    ];

    allKeywordSets.forEach(keywordSet => {
      keywordSet.forEach(keyword => {
        if (lowerStrategy.includes(keyword)) {
          keywords.add(keyword);
        }
      });
    });

    return Array.from(keywords);
  }

  /**
   * Extract focus areas from strategy
   */
  private static extractFocusAreas(strategy: string): string[] {
    const focusAreas: string[] = [];
    
    // Look for specific patterns
    const patterns = [
      /focus(?:ing|ed)?\s+on\s+([^.!?\n,]+)/gi,
      /concentrate(?:ing|d)?\s+on\s+([^.!?\n,]+)/gi,
      /emphasis\s+on\s+([^.!?\n,]+)/gi,
      /key\s+areas?:\s*([^.!?\n]+)/gi,
      /main\s+concerns?:\s*([^.!?\n]+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = strategy.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const area = match.replace(pattern, '$1').trim();
          if (area && !focusAreas.includes(area)) {
            focusAreas.push(area);
          }
        });
      }
    });

    return focusAreas;
  }

  /**
   * Generate strategy-specific instructions for prompts
   */
  static generateStrategyInstructions(
    parsedStrategy: ParsedStrategy,
    inputs: Record<string, unknown>
  ): string {
    const instructions: string[] = [];

    // Add goal-based instructions
    if (parsedStrategy.goals.length > 0) {
      instructions.push(`PRIMARY GOALS:\n${parsedStrategy.goals.map(g => `- ${g}`).join('\n')}`);
    }

    // Add priority-based instructions
    if (parsedStrategy.priorities.length > 0) {
      instructions.push(`KEY PRIORITIES:\n${parsedStrategy.priorities.map(p => `- ${p}`).join('\n')}`);
    }

    // Add constraint-based instructions
    if (parsedStrategy.constraints.length > 0) {
      instructions.push(`CONSTRAINTS TO RESPECT:\n${parsedStrategy.constraints.map(c => `- ${c}`).join('\n')}`);
    }

    // Add method-based instructions
    if (parsedStrategy.methods.length > 0) {
      instructions.push(`PREFERRED METHODS:\n${parsedStrategy.methods.map(m => `- ${m}`).join('\n')}`);
    }

    // Add domain-specific guidance
    if (parsedStrategy.domainKeywords.length > 0) {
      const domainContext = this.identifyDomain(parsedStrategy.domainKeywords);
      if (domainContext) {
        instructions.push(`DOMAIN CONTEXT: ${domainContext}`);
      }
    }

    // Add input-based customization
    if (inputs && Object.keys(inputs).length > 0) {
      const inputInstructions = this.generateInputBasedInstructions(inputs, parsedStrategy);
      if (inputInstructions) {
        instructions.push(inputInstructions);
      }
    }

    return instructions.join('\n\n');
  }

  /**
   * Identify primary domain from keywords
   */
  private static identifyDomain(keywords: string[]): string | null {
    const domainScores: Record<string, number> = {
      'IT/Software Development': 0,
      'Restaurant Management': 0,
      'Construction': 0,
      'Healthcare': 0,
      'Education': 0,
    };

    // Score each domain based on keyword matches
    keywords.forEach(keyword => {
      if (['software', 'code', 'api', 'database', 'frontend', 'backend'].includes(keyword)) {
        domainScores['IT/Software Development']++;
      }
      if (['restaurant', 'menu', 'food', 'dining', 'kitchen', 'chef'].includes(keyword)) {
        domainScores['Restaurant Management']++;
      }
      if (['construction', 'building', 'foundation', 'safety', 'inspection'].includes(keyword)) {
        domainScores['Construction']++;
      }
      if (['health', 'medical', 'patient', 'treatment', 'care'].includes(keyword)) {
        domainScores['Healthcare']++;
      }
      if (['education', 'learning', 'teaching', 'student', 'curriculum'].includes(keyword)) {
        domainScores['Education']++;
      }
    });

    // Find domain with highest score
    let maxScore = 0;
    let primaryDomain: string | null = null;

    Object.entries(domainScores).forEach(([domain, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryDomain = domain;
      }
    });

    return primaryDomain;
  }

  /**
   * Generate instructions based on user inputs and strategy
   */
  private static generateInputBasedInstructions(
    inputs: Record<string, unknown>,
    parsedStrategy: ParsedStrategy
  ): string {
    const instructions: string[] = ['USER CONTEXT ALIGNMENT:'];

    // Process each input
    Object.entries(inputs).forEach(([key, value]) => {
      const valueStr = String(value);
      
      // Special handling for specific input types
      if (key === 'businessType' || key === 'projectType') {
        instructions.push(`- Optimize all decisions for ${valueStr} domain`);
      } else if (key === 'priority' && value === 'high') {
        instructions.push(`- Apply URGENT prioritization to all selections`);
      } else if (key === 'currentPhase' || key === 'projectPhase') {
        instructions.push(`- Align tasks with ${valueStr} phase requirements`);
      } else if (key.includes('deadline') || key.includes('time')) {
        instructions.push(`- Consider time constraint: ${valueStr}`);
      } else if (key === 'focusArea') {
        instructions.push(`- Concentrate efforts on: ${valueStr}`);
      }
    });

    return instructions.join('\n');
  }
}