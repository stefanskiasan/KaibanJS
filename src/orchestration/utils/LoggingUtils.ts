import { logger } from '../../utils/logger';
import { Team } from '../../index';

/**
 * Utility functions for logging orchestration events
 */
export class LoggingUtils {
  /**
   * Log orchestration event with structured data
   */
  static logOrchestrationEvent(
    event: string,
    message: string,
    details?: any,
    team?: Team
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      message,
      details,
    };

    // Store in team's orchestration logs if team is provided
    if (team) {
      const store = team.store.getState();
      if ((store as any).logs) {
        (store as any).logs.push({
          type: 'ORCHESTRATION_EVENT',
          timestamp,
          message: `[${event}] ${message}`,
          metadata: details,
          verbosity: 3,
        });
      }
    }

    // Log to console with appropriate level
    LoggingUtils.logToConsoleWithLevel(event, message, details);
  }

  /**
   * Log to console with appropriate log levels based on event type
   */
  static logToConsoleWithLevel(
    event: string,
    message: string,
    details?: any
  ): void {
    const formattedMessage = `🤖 [Orchestration] ${message}`;

    // Determine log level based on event type
    if (
      event.includes('ERROR') ||
      event.includes('FAILED') ||
      event.includes('CRITICAL')
    ) {
      logger.error(formattedMessage, details);
    } else if (
      event.includes('WARNING') ||
      event.includes('SKIP') ||
      event.includes('RETRY')
    ) {
      logger.warn(formattedMessage, details);
    } else if (
      event.includes('START') ||
      event.includes('COMPLETE') ||
      event.includes('SUCCESS')
    ) {
      logger.info(formattedMessage);
      if (details && Object.keys(details).length > 0) {
        logger.debug('Details:', details);
      }
    } else {
      logger.debug(formattedMessage, details);
    }
  }

  /**
   * Simple logging method
   */
  static log(level: string, message: string, meta?: any): void {
    if (level === 'error') {
      logger.error(message, meta);
    } else if (level === 'warn') {
      logger.warn(message, meta);
    } else if (level === 'info') {
      logger.info(message, meta);
    } else {
      logger.debug(message, meta);
    }
  }

  /**
   * Log performance metrics
   */
  static logPerformanceMetrics(
    operation: string,
    duration: number,
    details?: any
  ): void {
    const message = `${operation} completed in ${duration}ms`;
    
    if (duration > 5000) {
      logger.warn(`⚠️ Slow operation: ${message}`, details);
    } else if (duration > 1000) {
      logger.info(`⏱️ ${message}`, details);
    } else {
      logger.debug(`✅ ${message}`, details);
    }
  }

  /**
   * Log task assignment
   */
  static logTaskAssignment(
    taskTitle: string,
    agentName: string,
    score: number
  ): void {
    logger.info(
      `🎯 Assigned task '${taskTitle}' to agent '${agentName}' (score: ${score})`
    );
  }

  /**
   * Log optimization results
   */
  static logOptimizationResults(
    optimizationType: string,
    before: any,
    after: any
  ): void {
    logger.info(`🔧 ${optimizationType} optimization results:`, {
      before,
      after,
      improvement: this.calculateImprovement(before, after),
    });
  }

  /**
   * Calculate improvement percentage
   */
  private static calculateImprovement(before: any, after: any): string {
    if (typeof before === 'number' && typeof after === 'number') {
      const improvement = ((after - before) / before) * 100;
      return `${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`;
    }
    return 'N/A';
  }
}
