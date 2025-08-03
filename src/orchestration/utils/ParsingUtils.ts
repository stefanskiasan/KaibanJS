import { logger } from '../../utils/logger';

/**
 * Utility functions for parsing various data formats
 */
export class ParsingUtils {
  /**
   * Parse estimated time string to hours
   */
  static parseEstimatedTime(timeStr: string): number {
    const safeTimeStr = timeStr || '';
    const hourMatch = safeTimeStr.match(/(\d+)\s*(hours?|hrs?)/i);
    const dayMatch = safeTimeStr.match(/(\d+)\s*(days?)/i);
    const minuteMatch = safeTimeStr.match(/(\d+)\s*(minutes?|mins?)/i);

    if (hourMatch) {
      return parseInt(hourMatch[1]);
    } else if (dayMatch) {
      return parseInt(dayMatch[1]) * 8; // Assuming 8-hour workday
    } else if (minuteMatch) {
      return parseInt(minuteMatch[1]) / 60;
    }

    // Default to 2 hours if no match
    return 2;
  }

  /**
   * Robust JSON parsing with common issue fixes
   */
  static parseRobustJSON(jsonString: string): any {
    // Clean and fix common JSON issues
    let cleanedJson = jsonString;

    // Fix single quotes to double quotes
    cleanedJson = cleanedJson.replace(/'/g, '"');

    // Fix trailing commas
    cleanedJson = cleanedJson.replace(/,\s*}/g, '}');
    cleanedJson = cleanedJson.replace(/,\s*]/g, ']');

    // Fix unquoted keys
    cleanedJson = cleanedJson.replace(/(\w+):/g, '"$1":');

    // Fix boolean and null values
    cleanedJson = cleanedJson.replace(/:\s*True/g, ': true');
    cleanedJson = cleanedJson.replace(/:\s*False/g, ': false');
    cleanedJson = cleanedJson.replace(/:\s*None/g, ': null');

    try {
      return JSON.parse(cleanedJson);
    } catch (e) {
      logger.error('Failed to parse JSON after cleanup:', e);
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Parse LLM response to extract JSON content
   */
  static parseJSONFromResponse(response: string): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return this.parseRobustJSON(jsonMatch[0]);
    } catch (error) {
      logger.error('Error parsing JSON from response:', error);
      return null;
    }
  }

  /**
   * Parse adaptation response from LLM
   */
  static parseAdaptationResponse(response: string): any {
    try {
      // Validate input
      if (!response || typeof response !== 'string') {
        return {
          adapted: false,
          reasoning: 'Invalid response format',
        };
      }

      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        // If no JSON found, look for key information in text
        const adapted = response.toLowerCase().includes('adapt') || 
                       response.toLowerCase().includes('modify');
        return {
          adapted,
          reasoning: adapted ? 'Task adaptation suggested' : 'No adaptation needed',
        };
      }

      // Parse JSON with error handling
      try {
        const parsed = this.parseRobustJSON(jsonMatch[0]);
        return {
          adapted: parsed.adapted || false,
          description: parsed.description,
          priority: parsed.priority,
          estimatedTime: parsed.estimatedTime,
          reasoning: parsed.reasoning || 'No reasoning provided',
        };
      } catch (jsonError) {
        logger.warn('Failed to parse adaptation JSON, using fallback:', jsonError);
        return {
          adapted: false,
          reasoning: 'Failed to parse adaptation response',
        };
      }
    } catch (error) {
      logger.error('Error in parseAdaptationResponse:', error);
      return {
        adapted: false,
        reasoning: 'Error processing adaptation response',
      };
    }
  }

  /**
   * Parse priority from string to standardized format
   */
  static parsePriority(priority: string): 'high' | 'medium' | 'low' {
    const normalized = priority.toLowerCase().trim();
    if (normalized === 'high' || normalized === 'critical' || normalized === 'urgent') {
      return 'high';
    }
    if (normalized === 'low' || normalized === 'minor' || normalized === 'trivial') {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Parse skills from various formats
   */
  static parseSkills(skills: string | string[] | undefined): string[] {
    if (!skills) return [];
    
    if (Array.isArray(skills)) {
      return skills;
    }
    
    // Handle comma-separated string
    if (typeof skills === 'string') {
      return skills.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    
    return [];
  }

  /**
   * Parse task IDs from various formats
   */
  static parseTaskIds(ids: string | string[] | undefined): string[] {
    if (!ids) return [];
    
    if (Array.isArray(ids)) {
      return ids;
    }
    
    // Handle comma-separated string
    if (typeof ids === 'string') {
      return ids.split(/[,;\s]+/).map(id => id.trim()).filter(id => id.length > 0);
    }
    
    return [];
  }
}
