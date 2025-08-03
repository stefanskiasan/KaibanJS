/**
 * Example 03: Education Industry - Online Course Development Orchestration
 * 
 * This example demonstrates intelligent orchestration for education including:
 * - Curriculum design and content creation with educational tools
 * - Learning mode for continuous improvement based on student feedback
 * - Adaptive learning paths with continuous orchestration
 * - Auto-split strategies for modular course creation
 * - Student performance analytics integration
 * - Multi-language support and accessibility considerations
 * 
 * Key Features Demonstrated:
 * - Custom tools: CurriculumBuilderTool, LearningAnalyticsTool
 * - Learning mode orchestration for iterative improvement
 * - Task splitting for modular content development
 * - Dynamic priorities based on student needs
 * - Merge-compatible tasks for integrated learning experiences
 */

require('dotenv').config();
const { Agent, Task, Team } = require('kaibanjs');
const { CurriculumBuilderTool, LearningAnalyticsTool } = require('./utils/customTools');

async function runEducationOrchestrationExample() {
  console.log('🎓 Education Orchestration Example - Online Course Development\n');
  console.log('Showcasing adaptive learning workflows and content orchestration.\n');

  // Create specialized education agents with custom tools
  const instructionalDesignerAgent = new Agent({
    name: 'Dr. Emily Rodriguez',
    role: 'Lead Instructional Designer',
    goal: 'Create engaging, effective learning experiences aligned with educational objectives',
    background: 'PhD in Educational Technology with expertise in online learning and curriculum design',
    tools: [new CurriculumBuilderTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.4, // Moderate creativity for educational content
    },
  });

  const contentCreatorAgent = new Agent({
    name: 'James Wilson',
    role: 'Content Developer',
    goal: 'Produce high-quality educational materials across multiple formats',
    background: 'Multimedia specialist with experience in educational video, interactive content, and assessments',
    tools: [],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.5, // Higher creativity for engaging content
    },
  });

  const assessmentSpecialistAgent = new Agent({
    name: 'Dr. Aisha Patel',
    role: 'Assessment Specialist',
    goal: 'Design effective assessments that measure learning outcomes',
    background: 'Educational psychologist specializing in assessment design and learning measurement',
    tools: [new LearningAnalyticsTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
    },
  });

  const accessibilityExpertAgent = new Agent({
    name: 'Maria Santos',
    role: 'Accessibility & Inclusion Expert',
    goal: 'Ensure all content is accessible and inclusive for diverse learners',
    background: 'Specialist in educational accessibility, WCAG compliance, and universal design for learning',
    tools: [],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.2,
    },
  });

  // Create comprehensive education task repository
  const educationTaskRepository = [
    // Curriculum Development Tasks
    new Task({
      title: 'Course Structure Design',
      description: 'Design overall course structure with modules, learning objectives, and progression',
      expectedOutput: 'Complete course blueprint with module breakdown and learning pathways',
      agent: instructionalDesignerAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'high',
      splitStrategy: 'auto', // Can split into module-specific tasks
      orchestrationRules: `
        DESIGN PRINCIPLES:
        - Align with learning objectives
        - Progressive difficulty curve
        - Mix of content types (video, text, interactive)
        - Include practice and assessment
        
        STRUCTURE REQUIREMENTS:
        - Clear learning outcomes per module
        - Prerequisite mapping
        - Time estimates for completion
        - Flexibility for different learning paces
        
        ADAPTATIONS:
        - Adjust based on student level
        - Create alternative pathways
        - Include enrichment opportunities
      `,
      resourceRequirements: {
        estimatedTime: '4-6 hours',
        skillsRequired: ['curriculum-design', 'learning-objectives', 'instructional-design'],
        dependencies: [],
      },
      qualityGates: ['objectives-aligned', 'progression-logical', 'accessibility-considered'],
    }),

    new Task({
      title: 'Content Creation - Video Lectures',
      description: 'Create engaging video lectures for core course concepts',
      expectedOutput: 'High-quality video content with transcripts and supporting materials',
      agent: contentCreatorAgent,
      adaptable: true,
      priority: 'high',
      splitStrategy: 'auto', // Split by topic or module
      mergeCompatible: ['interactive-content', 'practice-exercises'],
      orchestrationRules: `
        VIDEO STANDARDS:
        - 5-10 minute segments for engagement
        - Clear audio and visuals
        - Captions and transcripts required
        - Interactive elements where appropriate
        
        CONTENT GUIDELINES:
        - Start with learning objectives
        - Use real-world examples
        - Include visual aids and animations
        - End with key takeaways
        
        ADAPTATIONS:
        - Multiple explanation styles
        - Vary pace for different topics
        - Include optional deep dives
      `,
      resourceRequirements: {
        estimatedTime: '8-12 hours per module',
        skillsRequired: ['video-production', 'content-creation', 'educational-storytelling'],
        dependencies: ['course-structure', 'learning-objectives'],
      },
    }),

    new Task({
      title: 'Assessment Design',
      description: 'Create formative and summative assessments aligned with learning objectives',
      expectedOutput: 'Complete assessment package with rubrics and answer keys',
      agent: assessmentSpecialistAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'high',
      externalValidationRequired: true, // Academic review required
      orchestrationRules: `
        ASSESSMENT TYPES:
        - Formative: Quizzes, practice problems
        - Summative: Projects, exams
        - Peer assessments
        - Self-reflection activities
        
        DESIGN REQUIREMENTS:
        - Align with Bloom's taxonomy
        - Multiple question types
        - Clear rubrics
        - Immediate feedback where possible
        
        QUALITY STANDARDS:
        - Validity and reliability
        - Fair and unbiased
        - Accessible formats
        - Anti-cheating measures
      `,
      resourceRequirements: {
        estimatedTime: '4-6 hours per module',
        skillsRequired: ['assessment-design', 'psychometrics', 'rubric-creation'],
        dependencies: ['learning-objectives', 'content-creation'],
      },
      qualityGates: ['objectives-aligned', 'rubrics-clear', 'accessibility-verified'],
    }),

    new Task({
      title: 'Interactive Learning Activities',
      description: 'Develop interactive exercises, simulations, and hands-on activities',
      expectedOutput: 'Engaging interactive content that reinforces learning objectives',
      agent: contentCreatorAgent,
      adaptable: true,
      priority: 'medium',
      mergeCompatible: ['video-lectures', 'assessments'],
      orchestrationRules: `
        ACTIVITY TYPES:
        - Interactive simulations
        - Coding exercises (if applicable)
        - Case studies
        - Discussion prompts
        - Collaborative projects
        
        ENGAGEMENT PRINCIPLES:
        - Active learning focus
        - Immediate feedback
        - Progressive difficulty
        - Real-world application
        
        TECHNICAL REQUIREMENTS:
        - Mobile-friendly
        - Low bandwidth options
        - Offline capability where possible
      `,
      resourceRequirements: {
        estimatedTime: '6-8 hours per module',
        skillsRequired: ['interactive-design', 'educational-technology', 'gamification'],
        dependencies: ['course-structure', 'learning-objectives'],
      },
    }),

    new Task({
      title: 'Accessibility Audit',
      description: 'Ensure all course content meets accessibility standards',
      expectedOutput: 'Accessibility report with remediation actions completed',
      agent: accessibilityExpertAgent,
      adaptable: false, // Accessibility standards are fixed
      priority: 'high',
      externalValidationRequired: true,
      orchestrationRules: `
        ACCESSIBILITY REQUIREMENTS (MANDATORY):
        - WCAG 2.1 AA compliance
        - Screen reader compatibility
        - Keyboard navigation
        - Captions and transcripts
        - Color contrast standards
        - Alternative text for images
        
        INCLUSIVE DESIGN:
        - Multiple content formats
        - Flexible pacing options
        - Language simplification options
        - Cultural sensitivity
        
        NO COMPROMISES on accessibility standards
      `,
      resourceRequirements: {
        estimatedTime: '3-4 hours per module',
        skillsRequired: ['accessibility-standards', 'assistive-technology', 'universal-design'],
        dependencies: ['content-creation', 'assessments'],
      },
      qualityGates: ['wcag-compliant', 'screen-reader-tested', 'keyboard-navigable'],
    }),

    new Task({
      title: 'Student Progress Analytics',
      description: 'Analyze learning patterns and optimize course based on student data',
      expectedOutput: 'Analytics report with actionable improvements for course optimization',
      agent: assessmentSpecialistAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'medium',
      orchestrationRules: `
        ANALYTICS FOCUS:
        - Completion rates by module
        - Assessment performance patterns
        - Engagement metrics
        - Time-to-completion analysis
        - Difficulty bottlenecks
        
        INSIGHTS TO GENERATE:
        - Content clarity issues
        - Pacing problems
        - Assessment validity
        - Student satisfaction
        
        CONTINUOUS IMPROVEMENT:
        - A/B testing recommendations
        - Content refinement suggestions
        - Personalization opportunities
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours weekly',
        skillsRequired: ['learning-analytics', 'data-analysis', 'educational-research'],
        dependencies: ['course-launch', 'student-data'],
      },
    }),

    new Task({
      title: 'Multilingual Content Adaptation',
      description: 'Adapt course content for international learners with localization',
      expectedOutput: 'Localized content maintaining educational effectiveness across cultures',
      agent: contentCreatorAgent,
      adaptable: true,
      priority: 'medium',
      splitStrategy: 'manual', // Split by language/region
      orchestrationRules: `
        LOCALIZATION SCOPE:
        - Translation of all text content
        - Cultural adaptation of examples
        - Region-specific case studies
        - Local regulatory compliance
        
        QUALITY REQUIREMENTS:
        - Native speaker review
        - Educational equivalence
        - Cultural sensitivity
        - Technical term consistency
        
        ADAPTATION CONSIDERATIONS:
        - Learning style differences
        - Educational system variations
        - Technology access differences
      `,
      resourceRequirements: {
        estimatedTime: '8-10 hours per language',
        skillsRequired: ['translation', 'cultural-adaptation', 'international-education'],
        dependencies: ['content-finalized', 'assessments-complete'],
      },
    }),
  ];

  // Create education team with learning-focused orchestration
  const educationTeam = new Team({
    name: 'Online Learning Development Team',
    agents: [instructionalDesignerAgent, contentCreatorAgent, assessmentSpecialistAgent, accessibilityExpertAgent],
    tasks: [], // Orchestrator will build curriculum
    
    // ===== Orchestration Configuration =====
    enableOrchestration: true,
    continuousOrchestration: true, // Continuous improvement based on feedback
    backlogTasks: educationTaskRepository,
    allowTaskGeneration: true, // Generate tasks for specific learning needs
    
    orchestrationStrategy: `
      You are orchestrating an educational content development team focused on creating effective, engaging, and accessible online learning experiences.
      
      EDUCATIONAL PHILOSOPHY:
      1. Student-centered design with diverse learning styles support
      2. Active learning through engagement and interaction
      3. Continuous improvement based on learning analytics
      4. Universal accessibility and global reach
      
      DEVELOPMENT PRIORITIES:
      - Phase 1: Curriculum structure and learning objectives
      - Phase 2: Core content creation (videos, readings, activities)
      - Phase 3: Assessment design and validation
      - Phase 4: Accessibility audit and improvements
      - Phase 5: Launch and iterative optimization
      
      QUALITY STANDARDS:
      - Learning objective alignment: 100%
      - Accessibility compliance: WCAG 2.1 AA
      - Student satisfaction target: >85%
      - Completion rate target: >70%
      - Assessment validity: Psychometrically sound
      
      ADAPTIVE STRATEGIES:
      - Personalized learning paths based on prior knowledge
      - Multiple content formats for different preferences
      - Flexible pacing with suggested timelines
      - Remediation and enrichment options
      
      CONTINUOUS IMPROVEMENT:
      - Weekly analytics review
      - Student feedback integration
      - A/B testing for optimization
      - Regular content updates
      
      SPECIAL CONSIDERATIONS:
      - Global audience with varying internet speeds
      - Mobile-first design approach
      - Offline learning capabilities
      - Multi-language support planning
    `,
    
    mode: 'learning', // Continuous improvement mode
    maxActiveTasks: 6, // Multiple parallel content streams
    taskPrioritization: 'dynamic', // Adjust based on student needs
    workloadDistribution: 'skills-based', // Match expertise to content
    
    // LLM configuration for education-aware orchestration
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.4, // Balanced for educational creativity
      maxRetries: 3,
    },
  });

  console.log('✅ Education Team configured with:');
  console.log(`- ${educationTeam.backlogTasks.length} educational task templates`);
  console.log(`- ${educationTeam.agents.length} specialized education professionals`);
  console.log(`- Learning mode for continuous improvement`);
  console.log(`- Auto-split strategy for modular development\n`);

  try {
    // Education-specific inputs that influence orchestration
    const courseInputs = {
      // Course details
      courseName: 'Introduction to Data Science',
      courseLevel: 'beginner', // beginner, intermediate, advanced
      courseDuration: '8 weeks',
      targetAudience: 'Working professionals',
      
      // Learning objectives
      learningObjectives: [
        'Understand data science fundamentals',
        'Apply statistical analysis techniques',
        'Build machine learning models',
        'Visualize and communicate insights',
      ],
      
      // Student demographics
      expectedEnrollment: 500,
      studentLocations: ['North America', 'Europe', 'Asia'],
      primaryLanguage: 'English',
      secondaryLanguages: ['Spanish', 'Mandarin'],
      
      // Educational context
      deliveryFormat: 'self-paced', // self-paced, cohort-based, hybrid
      certificationType: 'professional-certificate',
      accreditationRequired: false,
      
      // Technical requirements
      platformFeatures: ['video-streaming', 'interactive-notebooks', 'peer-review'],
      mobileSupport: true,
      offlineAccess: true,
      
      // Quality metrics
      previousCourseRating: 4.3,
      completionRateTarget: 75,
      satisfactionTarget: 90,
      
      // Constraints
      budgetLimit: 50000,
      launchDeadline: '12 weeks',
      teamAvailability: 'full-time',
      
      // Special requirements
      accessibilityMandatory: true,
      corporatePartnership: true,
      customBranding: false,
    };

    console.log('📚 Course Development Requirements:');
    console.log(`- Course: ${courseInputs.courseName}`);
    console.log(`- Level: ${courseInputs.courseLevel}`);
    console.log(`- Duration: ${courseInputs.courseDuration}`);
    console.log(`- Expected Students: ${courseInputs.expectedEnrollment}`);
    console.log(`- Delivery: ${courseInputs.deliveryFormat}`);
    console.log(`- Languages: ${courseInputs.primaryLanguage} + ${courseInputs.secondaryLanguages.join(', ')}\n`);

    // Start orchestrated workflow with educational context
    console.log('🚀 Starting intelligent education orchestration...\n');
    
    const result = await educationTeam.start(courseInputs, {
      projectGoal: 'Develop a comprehensive, accessible online data science course that engages working professionals and achieves 75%+ completion rate',
      preserveExistingTasks: false,
    });

    console.log('\n✅ Education Orchestration Results:');
    console.log(`- Workflow Status: ${result.status}`);
    console.log(`- Tasks Completed: ${result.stats?.taskCount || 0}`);
    console.log(`- Development Time: ${result.stats?.duration || 'N/A'}`);
    
    // Display orchestrated education tasks
    const orchestratedTasks = educationTeam.getTasks();
    console.log('\n📋 Orchestrated Course Development Tasks:');
    orchestratedTasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title || task.description}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Agent: ${task.agent?.name}`);
      console.log(`   Split Strategy: ${task.splitStrategy || 'none'}`);
      if (task.mergeCompatible?.length) {
        console.log(`   Can merge with: ${task.mergeCompatible.join(', ')}`);
      }
      if (task.resourceRequirements?.estimatedTime) {
        console.log(`   Estimated Time: ${task.resourceRequirements.estimatedTime}`);
      }
    });

    // Demonstrate task splitting for modular development
    console.log('\n\n🔀 Task Splitting Demo:');
    console.log('\nThe orchestrator can automatically split large tasks:');
    console.log('📚 "Create Video Lectures" might be split into:');
    console.log('   - Module 1: Data Science Fundamentals (2 hours)');
    console.log('   - Module 2: Statistical Analysis (3 hours)');
    console.log('   - Module 3: Machine Learning Basics (3 hours)');
    console.log('   - Module 4: Data Visualization (2 hours)');
    
    // Demonstrate learning mode in action
    console.log('\n\n🧠 Learning Mode Demo:');
    console.log('\n📊 Student Analytics Update:');
    console.log('- Module 2 completion rate: 45% (below target)');
    console.log('- Common struggle point: Statistical concepts');
    console.log('- Student feedback: "Need more practice examples"');
    
    console.log('\n✅ Learning Mode Response:');
    console.log('The orchestrator in learning mode will:');
    console.log('1. Prioritize creating additional practice exercises');
    console.log('2. Generate supplementary explanation videos');
    console.log('3. Adjust pacing recommendations');
    console.log('4. A/B test different teaching approaches');

    // Add improvement task based on analytics
    const improvementTask = new Task({
      title: 'Module 2 Enhancement - Statistical Concepts',
      description: 'Create additional resources to improve understanding of statistical concepts',
      expectedOutput: 'Supplementary materials including practice problems and visual explanations',
      agent: contentCreatorAgent,
      priority: 'high',
      adaptable: true,
      orchestrationRules: 'Focus on addressing specific student pain points identified in analytics',
      resourceRequirements: {
        estimatedTime: '4-5 hours',
        skillsRequired: ['statistics', 'educational-content', 'visual-design'],
      },
    });
    
    educationTeam.addBacklogTasks([improvementTask]);
    console.log('\n✅ Added improvement task based on learning analytics');

    // Demonstrate continuous orchestration for student needs
    console.log('\n\n🔄 Continuous Orchestration for Adaptive Learning:');
    
    // Enable continuous orchestration
    educationTeam.setContinuousOrchestration(true);
    console.log('✅ Continuous orchestration enabled');
    console.log('\nAs students progress, the orchestrator will:');
    console.log('- Monitor engagement and completion metrics');
    console.log('- Identify struggling topics in real-time');
    console.log('- Generate remediation content automatically');
    console.log('- Optimize content based on effectiveness');
    console.log('- Personalize learning paths');

    // Get orchestration metrics
    const metrics = await educationTeam.getOrchestrationMetrics();
    if (metrics) {
      console.log('\n\n📊 Educational Development Metrics:');
      console.log(`- Content Creation Efficiency: ${metrics.performance.efficiency || 'N/A'}%`);
      console.log(`- Quality Gate Pass Rate: ${metrics.taskStatistics.qualityRate || 'N/A'}%`);
      console.log(`- Accessibility Compliance: ${metrics.taskStatistics.accessibilityRate || '100'}%`);
      console.log(`- Team Productivity: ${metrics.systemHealth.productivity || 'High'}`);
    }

    // Generate course structure visualization
    const dependencyGraph = await educationTeam.generateDependencyGraph();
    if (dependencyGraph) {
      console.log('\n\n🗺️ Course Development Workflow:');
      console.log(`- Total Development Tasks: ${dependencyGraph.nodes.length}`);
      console.log(`- Task Dependencies: ${dependencyGraph.edges.length}`);
      console.log(`- Parallel Development Streams: ${dependencyGraph.metrics.parallelism}`);
      console.log(`- Critical Path: ${dependencyGraph.metrics.depth} sequential steps`);
    }

    // Demonstrate accessibility focus
    console.log('\n\n♿ Accessibility Integration:');
    console.log('All content automatically checked for:');
    console.log('- Screen reader compatibility');
    console.log('- Keyboard navigation');
    console.log('- Caption accuracy');
    console.log('- Color contrast compliance');
    console.log('- Alternative format availability');

  } catch (error) {
    console.error('❌ Education orchestration error:', error.message);
    
    // Education-specific error handling
    console.log('\n📚 Learning Continuity Protocol:');
    console.log('1. Preserving completed content modules');
    console.log('2. Saving work-in-progress materials');
    console.log('3. Notifying team leads of delays');
    console.log('4. Implementing manual workflow backup');
    console.log('5. Communicating timeline adjustments');
  }

  // Educational insights and best practices
  console.log('\n\n💡 Education Orchestration Insights:');
  
  console.log('\n1. **Learning-Centered Design**:');
  console.log('   - Learning mode enables continuous improvement');
  console.log('   - Student analytics drive task prioritization');
  console.log('   - Adaptive content based on performance data');
  console.log('   - Quality gates ensure educational effectiveness');
  
  console.log('\n2. **Modular Development**:');
  console.log('   - Auto-split strategy for course modules');
  console.log('   - Merge-compatible tasks for integrated experiences');
  console.log('   - Parallel content streams for efficiency');
  console.log('   - Flexible task adaptation for different topics');
  
  console.log('\n3. **Accessibility First**:');
  console.log('   - Non-negotiable accessibility standards');
  console.log('   - Multiple content format requirements');
  console.log('   - Global audience considerations');
  console.log('   - Inclusive design principles');
  
  console.log('\n4. **Continuous Improvement**:');
  console.log('   - Real-time learning analytics integration');
  console.log('   - Dynamic task generation for remediation');
  console.log('   - A/B testing capabilities');
  console.log('   - Iterative content refinement');
  
  console.log('\n5. **Tool Integration**:');
  console.log('   - CurriculumBuilderTool for structured design');
  console.log('   - LearningAnalyticsTool for data-driven decisions');
  console.log('   - Platform integration for delivery');
  console.log('   - Multi-format content support');
}

// Run the education example
if (require.main === module) {
  runEducationOrchestrationExample()
    .then(() => {
      console.log('\n✅ Education orchestration example completed!');
      console.log('\nThis example demonstrated how KaibanJS creates adaptive,');
      console.log('accessible online learning experiences with continuous improvement.');
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { runEducationOrchestrationExample };