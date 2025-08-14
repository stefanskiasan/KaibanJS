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

    // AUTONOMOUS INPUT ANALYSIS
    instructions.push('\n### DYNAMIC INPUT ANALYSIS:');
    instructions.push('The following inputs were provided - analyze their content, not just their keys:');
    
    Object.entries(inputs).forEach(([key, value]) => {
      const valueType = Array.isArray(value) ? 'array' : typeof value;
      const valuePreview = this.getValuePreview(value);
      instructions.push(`- **${key}** (${valueType}): ${valuePreview}`);
    });

    instructions.push('\n### INPUT INTERPRETATION GUIDANCE:');
    instructions.push('- Question-like strings → Primary query requiring answer');
    instructions.push('- Arrays of messages → Conversation history for context');
    instructions.push('- Numeric/ID values → Entity references or measurements');
    instructions.push('- User/Session IDs → Context for personalization');
    instructions.push('- Product/Item codes → Specific entity queries');
    
    instructions.push('\n### TASK MATCHING REQUIREMENTS:');
    instructions.push('- Match input CONTENT with task goals and expected outputs');
    instructions.push('- Prioritize tasks that can answer questions found in inputs');
    instructions.push('- Adapt tasks to specifically address input values');
    instructions.push('- Forward ALL inputs to selected tasks for processing');

    // Process each input for specific patterns
    Object.entries(inputs).forEach(([key, value]) => {
      const valueStr = String(value);
      
      // Detect question patterns
      if (this.isQuestion(valueStr)) {
        instructions.push(`\n**DETECTED QUESTION**: "${valueStr}"`);
        instructions.push('→ Select tasks that can answer this specific question');
      }
      
      // Detect product/item references
      if (this.hasProductReference(valueStr)) {
        instructions.push(`\n**DETECTED PRODUCT REFERENCE**: "${valueStr}"`);
        instructions.push('→ Select product-related tasks and adapt them for this specific item');
      }
      
      // Detect measurement/quantity queries
      if (this.hasMeasurement(valueStr)) {
        instructions.push(`\n**DETECTED MEASUREMENT QUERY**: "${valueStr}"`);
        instructions.push('→ Select calculation or measurement tasks');
      }
    });

    return instructions.join('\n');
  }

  /**
   * Get a preview of a value for display
   */
  private static getValuePreview(value: unknown): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (Array.isArray(value)) {
      return `[${value.length} items]${value.length > 0 ? ` - First: ${JSON.stringify(value[0]).substring(0, 50)}...` : ''}`;
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      return `{${keys.length} fields: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
    }
    
    const str = String(value);
    return str.length > 100 ? str.substring(0, 100) + '...' : str;
  }

  /**
   * Check if a string appears to be a question
   */
  private static isQuestion(str: string): boolean {
    if (typeof str !== 'string') return false;
    const questionPatterns = [
      /^(what|where|when|who|why|how|which|can|could|would|should|is|are|do|does|did)\s/i,
      /\?$/,
      /(tell me|show me|find|get|retrieve|fetch|search|lookup|check)\s/i
    ];
    return questionPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Check if a string contains product/item references
   */
  private static hasProductReference(str: string): boolean {
    if (typeof str !== 'string') return false;
    const productPatterns = [
      /\b\d{5,}\b/, // Product codes (5+ digits)
      /\b[A-Z]{2,}-\d+\b/, // Pattern like ABC-123
      /\bproduct\s+\w+/i,
      /\bitem\s+\w+/i,
      /\barticle\s+\w+/i,
      /\bsku\s+\w+/i
    ];
    return productPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Check if a string contains measurements or quantities
   */
  private static hasMeasurement(str: string): boolean {
    if (typeof str !== 'string') return false;
    const measurementPatterns = [
      /\b\d+\s*(mm|cm|m|km|kg|g|l|ml|°C|°F)\b/i,
      /\b(DN|diameter|length|width|height|weight|volume|temperature)\s*\d+/i,
      /\b\d+\s*(meter|kilogram|liter|degree)/i
    ];
    return measurementPatterns.some(pattern => pattern.test(str));
  }
}