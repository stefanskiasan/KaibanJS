import { OrchestrationContext } from '../core/OrchestrationContext';

/**
 * Domain-specific prompt enhancements
 */
export class DomainPromptEnhancer {
  /**
   * Enhance prompt with domain-specific criteria based on inputs and context
   */
  static enhancePromptForDomain(
    basePrompt: string,
    context: OrchestrationContext,
    detectedDomain?: string
  ): string {
    // Detect domain from inputs if not provided
    const domain = detectedDomain || this.detectDomain(context.inputs || {});
    
    if (!domain) {
      return basePrompt;
    }

    // Get domain-specific enhancements
    const domainEnhancement = this.getDomainEnhancement(domain, context);
    
    // Insert domain-specific section after the orchestration strategy section
    const enhancedPrompt = basePrompt.replace(
      /## TASK ORCHESTRATION RULES CONSIDERATION/,
      `## DOMAIN-SPECIFIC CONSIDERATIONS (${domain.toUpperCase()})
${domainEnhancement}

## TASK ORCHESTRATION RULES CONSIDERATION`
    );

    return enhancedPrompt;
  }

  /**
   * Detect domain from user inputs
   */
  private static detectDomain(inputs: Record<string, unknown>): string | null {
    // Check explicit domain indicators
    if (inputs.businessType) {
      const businessType = String(inputs.businessType).toLowerCase();
      if (businessType.includes('restaurant')) return 'Restaurant Management';
      if (businessType.includes('construction')) return 'Construction';
      if (businessType.includes('healthcare')) return 'Healthcare';
      if (businessType.includes('education')) return 'Education';
    }

    if (inputs.projectType) {
      const projectType = String(inputs.projectType).toLowerCase();
      if (projectType.includes('software') || projectType.includes('it')) return 'Software Development';
      if (projectType.includes('construction')) return 'Construction';
      if (projectType.includes('medical') || projectType.includes('health')) return 'Healthcare';
    }

    // Check for domain keywords in any input value
    const allValues = Object.values(inputs).map(v => String(v).toLowerCase()).join(' ');
    
    if (allValues.includes('menu') || allValues.includes('food') || allValues.includes('dining')) {
      return 'Restaurant Management';
    }
    if (allValues.includes('building') || allValues.includes('foundation') || allValues.includes('construction')) {
      return 'Construction';
    }
    if (allValues.includes('code') || allValues.includes('api') || allValues.includes('database')) {
      return 'Software Development';
    }
    if (allValues.includes('patient') || allValues.includes('medical') || allValues.includes('health')) {
      return 'Healthcare';
    }
    if (allValues.includes('student') || allValues.includes('course') || allValues.includes('curriculum')) {
      return 'Education';
    }

    return null;
  }

  /**
   * Get domain-specific enhancement text
   */
  private static getDomainEnhancement(domain: string, context: OrchestrationContext): string {
    switch (domain) {
      case 'Restaurant Management':
        return this.getRestaurantEnhancement(context);
      case 'Construction':
        return this.getConstructionEnhancement(context);
      case 'Software Development':
        return this.getSoftwareEnhancement(context);
      case 'Healthcare':
        return this.getHealthcareEnhancement(context);
      case 'Education':
        return this.getEducationEnhancement(context);
      default:
        return '';
    }
  }

  /**
   * Restaurant-specific enhancements
   */
  private static getRestaurantEnhancement(context: OrchestrationContext): string {
    const seasonalConsiderations = context.inputs?.currentSeason 
      ? `- Prioritize seasonal ${context.inputs.currentSeason} menu items and ingredients`
      : '';
    
    return `### Restaurant Operations Priorities:
1. **Customer Experience**: Tasks affecting dining experience take precedence
2. **Food Safety & Quality**: Maintain highest standards for food handling
3. **Inventory Management**: Optimize stock levels to minimize waste
4. **Staff Coordination**: Ensure proper coverage for all service periods
5. **Seasonal Adaptation**: ${seasonalConsiderations || 'Adjust operations based on seasonal demands'}

### Key Performance Indicators:
- Customer satisfaction ratings
- Table turnover efficiency
- Food cost percentage
- Labor cost optimization
- Health inspection readiness`;
  }

  /**
   * Construction-specific enhancements
   */
  private static getConstructionEnhancement(context: OrchestrationContext): string {
    const safetyEmphasis = context.inputs?.safetyFocus 
      ? '**SAFETY IS PARAMOUNT** - All tasks must prioritize worker safety'
      : 'Maintain strict safety standards';
    
    return `### Construction Project Priorities:
1. **Safety First**: ${safetyEmphasis}
2. **Regulatory Compliance**: Ensure all permits and inspections are current
3. **Timeline Management**: Stay on schedule while maintaining quality
4. **Resource Coordination**: Optimize material delivery and subcontractor scheduling
5. **Quality Control**: Regular inspections at each project phase

### Critical Considerations:
- Weather impact on scheduling
- Material availability and lead times
- Subcontractor dependencies
- Building code compliance
- Environmental regulations`;
  }

  /**
   * Software development-specific enhancements
   */
  private static getSoftwareEnhancement(context: OrchestrationContext): string {
    const techStack = context.inputs?.techStack 
      ? `- Focus on ${context.inputs.techStack} technologies`
      : '';
    
    return `### Software Development Priorities:
1. **Code Quality**: Maintain high standards for maintainability
2. **Security**: Implement security best practices from the start
3. **Performance**: Optimize for scalability and efficiency
4. **Testing**: Comprehensive test coverage (unit, integration, E2E)
5. **Documentation**: Keep technical documentation up-to-date

### Technical Considerations:
${techStack}
- Version control best practices
- CI/CD pipeline integration
- Code review processes
- Technical debt management
- API design standards`;
  }

  /**
   * Healthcare-specific enhancements
   */
  private static getHealthcareEnhancement(context: OrchestrationContext): string {
    return `### Healthcare Operations Priorities:
1. **Patient Safety**: All decisions must prioritize patient wellbeing
2. **Regulatory Compliance**: Adhere to HIPAA and healthcare regulations
3. **Clinical Accuracy**: Ensure accuracy in all medical processes
4. **Efficiency**: Optimize patient flow and resource utilization
5. **Privacy & Security**: Protect patient data and confidentiality

### Critical Requirements:
- Medical accuracy and precision
- Regulatory documentation
- Patient communication standards
- Emergency response readiness
- Continuous quality improvement`;
  }

  /**
   * Education-specific enhancements
   */
  private static getEducationEnhancement(context: OrchestrationContext): string {
    return `### Educational Priorities:
1. **Student Success**: Focus on learning outcomes and engagement
2. **Curriculum Alignment**: Ensure content meets educational standards
3. **Accessibility**: Make learning accessible to all students
4. **Assessment Quality**: Fair and effective evaluation methods
5. **Continuous Improvement**: Regular curriculum and method updates

### Key Considerations:
- Different learning styles accommodation
- Technology integration
- Parent/guardian communication
- Professional development for educators
- Student feedback integration`;
  }
}