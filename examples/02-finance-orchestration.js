/**
 * Example 02: Finance Industry - Investment Portfolio Management Orchestration
 * 
 * This example demonstrates intelligent orchestration for financial operations including:
 * - Risk assessment and portfolio optimization with custom financial tools
 * - AI-driven task prioritization for market-responsive strategies
 * - Adaptive mode with real-time market adjustments
 * - Task generation for emerging investment opportunities
 * - Compliance checks and regulatory requirements
 * - Security-focused orchestration for sensitive financial data
 * 
 * Key Features Demonstrated:
 * - Custom tools: MarketAnalysisTool, RiskCalculatorTool
 * - Dynamic task generation based on market conditions
 * - External validation for high-value transactions
 * - Compliance orchestration rules
 * - Real-time priority adjustments
 */

require('dotenv').config();
const { Agent, Task, Team } = require('kaibanjs');
const { MarketAnalysisTool, RiskCalculatorTool } = require('./utils/customTools');

async function runFinanceOrchestrationExample() {
  console.log('💰 Finance Orchestration Example - Investment Portfolio Management\n');
  console.log('Demonstrating secure, compliant financial workflow orchestration.\n');

  // Create specialized finance agents with custom tools
  const portfolioManagerAgent = new Agent({
    name: 'Patricia Goldman',
    role: 'Senior Portfolio Manager',
    goal: 'Maximize returns while managing risk within client parameters',
    background: 'CFA with 20 years experience in portfolio management and asset allocation',
    tools: [new MarketAnalysisTool(), new RiskCalculatorTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.2, // Low temperature for financial decisions
    },
  });

  const riskAnalystAgent = new Agent({
    name: 'Robert Chen',
    role: 'Chief Risk Officer',
    goal: 'Identify, assess, and mitigate portfolio risks',
    background: 'Quantitative analyst specializing in risk modeling and compliance',
    tools: [new RiskCalculatorTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.1, // Very low for risk assessment
    },
  });

  const complianceOfficerAgent = new Agent({
    name: 'Sarah Thompson',
    role: 'Compliance Officer',
    goal: 'Ensure all transactions meet regulatory requirements',
    background: 'Legal and compliance expert with focus on SEC and international regulations',
    tools: [],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.1,
    },
  });

  const tradingAnalystAgent = new Agent({
    name: 'Michael Zhang',
    role: 'Trading Analyst',
    goal: 'Execute trades efficiently while minimizing market impact',
    background: 'Algorithmic trading specialist with expertise in market microstructure',
    tools: [new MarketAnalysisTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
    },
  });

  // Create comprehensive finance task repository
  const financeTaskRepository = [
    // Portfolio Analysis Tasks
    new Task({
      title: 'Daily Portfolio Review',
      description: 'Comprehensive review of portfolio performance and risk metrics',
      expectedOutput: 'Portfolio performance report with risk analysis and recommendations',
      agent: portfolioManagerAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'high',
      externalValidationRequired: false,
      orchestrationRules: `
        REVIEW REQUIREMENTS:
        - Must be completed before market open
        - Include overnight market movements
        - Flag any positions exceeding risk limits
        - Identify rebalancing opportunities
        
        ADAPTATIONS:
        - Deeper analysis for volatile market conditions
        - Fast-track review if major market events
        - Additional focus on concentrated positions
      `,
      resourceRequirements: {
        estimatedTime: '1-2 hours',
        skillsRequired: ['portfolio-analysis', 'risk-assessment', 'market-knowledge'],
        dependencies: ['market-data-feed'],
      },
      qualityGates: ['data-accuracy-verified', 'risk-limits-checked', 'performance-calculated'],
    }),

    new Task({
      title: 'Risk Assessment and Stress Testing',
      description: 'Conduct comprehensive risk analysis and stress test portfolio',
      expectedOutput: 'Risk report with VaR, stress test results, and mitigation recommendations',
      agent: riskAnalystAgent,
      adaptable: true,
      priority: 'high',
      splitStrategy: 'auto', // Can split by asset class or risk type
      orchestrationRules: `
        RISK ANALYSIS REQUIREMENTS:
        - Calculate Value at Risk (95% and 99% confidence)
        - Run stress tests for major market scenarios
        - Assess correlation risks
        - Check concentration limits
        
        STRESS SCENARIOS:
        - Market crash (-20%)
        - Interest rate spike (+200bps)
        - Currency devaluation
        - Sector-specific shocks
        
        ADAPTATIONS:
        - Additional scenarios based on current events
        - Deeper dive into high-risk positions
        - Custom stress tests for client concerns
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['quantitative-analysis', 'risk-modeling', 'statistics'],
        dependencies: ['portfolio-data', 'market-data'],
      },
      qualityGates: ['models-validated', 'data-quality-assured', 'results-cross-checked'],
    }),

    new Task({
      title: 'Compliance Review',
      description: 'Ensure all holdings and transactions meet regulatory requirements',
      expectedOutput: 'Compliance certification with any violations flagged for remediation',
      agent: complianceOfficerAgent,
      adaptable: false, // Compliance rules are strict
      priority: 'high',
      externalValidationRequired: true, // Legal review required
      orchestrationRules: `
        COMPLIANCE CHECKS (MANDATORY):
        - SEC regulations compliance
        - International regulatory requirements
        - Client mandate adherence
        - Insider trading restrictions
        - Position limits and concentration rules
        
        NO ADAPTATIONS for regulatory requirements
        
        REPORTING:
        - Document all violations
        - Propose remediation actions
        - Set deadlines for corrections
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['regulatory-knowledge', 'legal-compliance', 'documentation'],
        dependencies: ['transaction-history', 'position-report'],
      },
      qualityGates: ['all-regulations-checked', 'violations-documented', 'remediation-planned'],
    }),

    new Task({
      title: 'Market Opportunity Analysis',
      description: 'Identify and evaluate new investment opportunities',
      expectedOutput: 'Investment recommendations with risk/return analysis',
      agent: portfolioManagerAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'medium',
      orchestrationRules: `
        OPPORTUNITY SCANNING:
        - Sector rotation opportunities
        - Undervalued securities
        - Arbitrage possibilities
        - Emerging market trends
        
        EVALUATION CRITERIA:
        - Risk-adjusted returns
        - Correlation with existing portfolio
        - Liquidity considerations
        - Time horizon alignment
        
        ADAPTATIONS:
        - Focus shifts based on market conditions
        - Deeper analysis for larger opportunities
        - Fast-track evaluation for time-sensitive trades
      `,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['market-analysis', 'valuation', 'research'],
        dependencies: ['market-data', 'research-reports'],
      },
    }),

    new Task({
      title: 'Trade Execution Planning',
      description: 'Plan and optimize trade execution to minimize market impact',
      expectedOutput: 'Detailed execution plan with timing and order routing strategy',
      agent: tradingAnalystAgent,
      adaptable: true,
      priority: 'high',
      mergeCompatible: ['order-management', 'settlement-planning'],
      orchestrationRules: `
        EXECUTION PLANNING:
        - Analyze liquidity patterns
        - Determine optimal order sizing
        - Select execution venues
        - Plan timing to minimize impact
        
        CONSIDERATIONS:
        - Market depth and volume
        - Volatility forecasts
        - Correlation with market movements
        - Transaction cost analysis
        
        ADAPTATIONS:
        - Adjust for market conditions
        - Split large orders over time
        - Use algorithmic execution for complex trades
      `,
      resourceRequirements: {
        estimatedTime: '1-2 hours',
        skillsRequired: ['trading', 'market-microstructure', 'algorithms'],
        dependencies: ['approved-trades', 'market-conditions'],
      },
    }),

    new Task({
      title: 'Client Reporting',
      description: 'Generate comprehensive performance and risk reports for clients',
      expectedOutput: 'Client-ready reports with performance attribution and outlook',
      agent: portfolioManagerAgent,
      adaptable: true,
      priority: 'medium',
      splitStrategy: 'manual', // Can split by client segment
      orchestrationRules: `
        REPORT CONTENTS:
        - Performance vs benchmarks
        - Risk metrics and attribution
        - Transaction summary
        - Market commentary
        - Forward-looking outlook
        
        CLIENT CUSTOMIZATION:
        - Tailor depth to client sophistication
        - Highlight relevant concerns
        - Include requested analytics
        
        QUALITY STANDARDS:
        - Accuracy verification required
        - Clear visualizations
        - Regulatory disclosures included
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['reporting', 'communication', 'data-visualization'],
        dependencies: ['performance-data', 'risk-analysis', 'market-commentary'],
      },
    }),

    new Task({
      title: 'Rebalancing Analysis',
      description: 'Analyze portfolio drift and recommend rebalancing trades',
      expectedOutput: 'Rebalancing recommendations with tax and cost considerations',
      agent: portfolioManagerAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'medium',
      externalValidationRequired: true, // Large rebalances need approval
      orchestrationRules: `
        REBALANCING TRIGGERS:
        - Asset allocation drift >5%
        - Risk limit breaches
        - Strategic allocation changes
        - Tax loss harvesting opportunities
        
        ANALYSIS REQUIREMENTS:
        - Calculate drift from targets
        - Estimate transaction costs
        - Consider tax implications
        - Minimize portfolio disruption
        
        CONSTRAINTS:
        - Respect minimum trade sizes
        - Consider liquidity constraints
        - Avoid wash sale rules
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['portfolio-construction', 'tax-awareness', 'optimization'],
        dependencies: ['current-positions', 'target-allocation', 'tax-lots'],
      },
    }),
  ];

  // Create finance team with sophisticated orchestration configuration
  const investmentTeam = new Team({
    name: 'Investment Management Team',
    agents: [portfolioManagerAgent, riskAnalystAgent, complianceOfficerAgent, tradingAnalystAgent],
    tasks: [], // Orchestrator will select based on market conditions
    
    // ===== Orchestration Configuration =====
    enableOrchestration: true,
    continuousOrchestration: true, // Adapt to market changes
    backlogTasks: financeTaskRepository,
    allowTaskGeneration: true, // Generate tasks for new opportunities
    
    orchestrationStrategy: `
      You are orchestrating an investment management team focused on generating superior risk-adjusted returns while maintaining strict compliance.
      
      INVESTMENT PHILOSOPHY:
      1. Risk management is paramount - protect capital first
      2. Compliance with all regulations is non-negotiable
      3. Seek alpha through disciplined analysis and execution
      4. Maintain portfolio liquidity for client needs
      
      OPERATIONAL PRIORITIES:
      - Morning: Portfolio review and risk assessment before market open
      - Trading hours: Monitor positions and execute approved trades
      - Afternoon: Analysis, research, and planning
      - End of day: Compliance checks and client reporting
      
      RISK PARAMETERS:
      - Maximum portfolio VaR: 2% at 95% confidence
      - Single position limit: 5% of portfolio
      - Sector concentration limit: 25%
      - Minimum liquidity: 80% in assets tradeable within 3 days
      
      COMPLIANCE REQUIREMENTS:
      - All trades require pre-trade compliance check
      - Daily position limit verification
      - Weekly regulatory reporting
      - Monthly client mandate review
      
      PERFORMANCE TARGETS:
      - Outperform benchmark by 200bps annually
      - Sharpe ratio > 1.2
      - Maximum drawdown < 10%
      - Tracking error < 4%
      
      ADAPTATION RULES:
      - Increase risk analysis frequency during market volatility
      - Generate opportunity tasks when markets dislocate
      - Expedite rebalancing when limits are breached
      - Enhance reporting during significant events
    `,
    
    mode: 'adaptive', // Balance between caution and opportunity
    maxActiveTasks: 5, // Multiple parallel analyses
    taskPrioritization: 'ai-driven', // Respond to market conditions
    workloadDistribution: 'skills-based', // Match expertise to tasks
    
    // LLM configuration for finance-aware orchestration
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.15, // Very low temperature for financial consistency
      maxRetries: 3,
    },
  });

  console.log('✅ Investment Management Team configured with:');
  console.log(`- ${investmentTeam.backlogTasks.length} financial task templates`);
  console.log(`- ${investmentTeam.agents.length} specialized finance professionals`);
  console.log(`- Adaptive orchestration for market responsiveness`);
  console.log(`- AI-driven prioritization for opportunities\n`);

  try {
    // Finance-specific inputs that influence orchestration
    const marketInputs = {
      // Market conditions
      marketVolatility: 'high', // low, medium, high, extreme
      vixLevel: 28.5,
      marketTrend: 'bearish',
      
      // Portfolio metrics
      portfolioValue: 125000000, // $125M AUM
      currentCash: 8500000, // $8.5M cash
      portfolioVaR: 1.8, // % at 95% confidence
      sharpeRatio: 1.15,
      
      // Risk parameters
      riskTolerance: 'medium', // client risk tolerance
      investmentHorizon: 'long-term', // short, medium, long-term
      maxDrawdownLimit: 10, // percentage
      
      // Market opportunities
      sectorRotation: true,
      emergingOpportunities: ['technology-correction', 'energy-rebound'],
      
      // Compliance status
      regulatoryChanges: false,
      pendingAudits: false,
      clientMandateUpdates: true,
      
      // Time context
      tradingDay: true,
      quarterEnd: false,
      taxYearEnd: false,
      
      // External factors
      fedMeeting: true,
      economicDataRelease: 'CPI',
      geopoliticalEvents: ['trade-negotiations'],
    };

    console.log('📊 Current Market Environment:');
    console.log(`- Market Volatility: ${marketInputs.marketVolatility.toUpperCase()}`);
    console.log(`- VIX Level: ${marketInputs.vixLevel}`);
    console.log(`- Market Trend: ${marketInputs.marketTrend}`);
    console.log(`- Portfolio Value: $${(marketInputs.portfolioValue / 1000000).toFixed(1)}M`);
    console.log(`- Current VaR: ${marketInputs.portfolioVaR}%`);
    console.log(`- Fed Meeting Today: ${marketInputs.fedMeeting ? 'Yes' : 'No'}\n`);

    // Start orchestrated workflow with market context
    console.log('🚀 Starting intelligent finance orchestration...\n');
    
    const result = await investmentTeam.start(marketInputs, {
      projectGoal: 'Navigate high volatility market conditions while protecting capital and identifying opportunistic trades in technology sector correction',
      preserveExistingTasks: false,
    });

    console.log('\n✅ Finance Orchestration Results:');
    console.log(`- Workflow Status: ${result.status}`);
    console.log(`- Tasks Completed: ${result.stats?.taskCount || 0}`);
    console.log(`- Execution Time: ${result.stats?.duration || 'N/A'}`);
    
    // Display orchestrated finance tasks
    const orchestratedTasks = investmentTeam.getTasks();
    console.log('\n📋 Orchestrated Finance Tasks:');
    orchestratedTasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title || task.description}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Agent: ${task.agent?.name}`);
      console.log(`   External Validation: ${task.externalValidationRequired ? 'Required' : 'Not required'}`);
      if (task.resourceRequirements?.estimatedTime) {
        console.log(`   Estimated Time: ${task.resourceRequirements.estimatedTime}`);
      }
    });

    // Demonstrate dynamic task generation for opportunities
    console.log('\n\n🎯 Dynamic Task Generation Demo:');
    console.log('\n💡 Market Alert: Technology sector down 5% - potential buying opportunity!');
    
    // Simulate the orchestrator generating a new opportunity task
    if (investmentTeam.allowTaskGeneration) {
      console.log('✅ Orchestrator is authorized to generate new tasks');
      console.log('🤖 AI has identified opportunity and may create:');
      console.log('   - "Technology Sector Deep Dive Analysis"');
      console.log('   - "Tech Stock Screening for Value Opportunities"');
      console.log('   - "Risk/Reward Analysis for Tech Sector Entry"');
    }

    // Demonstrate compliance integration
    console.log('\n\n🛡️ Compliance Integration Demo:');
    
    // Update strategy for stricter compliance
    console.log('\n📋 New Regulation: Enhanced disclosure requirements for derivatives');
    investmentTeam.updateOrchestrationStrategy(
      investmentTeam.orchestrationStrategy + '\n\nURGENT: New derivative disclosure rules require immediate portfolio review and documentation update.'
    );
    console.log('✅ Orchestration strategy updated for new compliance requirements');
    
    // Add compliance-specific task
    const derivativeComplianceTask = new Task({
      title: 'Derivative Position Compliance Review',
      description: 'Review all derivative positions for new disclosure requirements',
      expectedOutput: 'Complete derivative disclosure report meeting new regulations',
      agent: complianceOfficerAgent,
      priority: 'high',
      adaptable: false,
      externalValidationRequired: true,
      resourceRequirements: {
        estimatedTime: '4-5 hours',
        skillsRequired: ['derivative-knowledge', 'regulatory-compliance'],
      },
    });
    
    investmentTeam.addBacklogTasks([derivativeComplianceTask]);
    console.log('✅ Added urgent compliance task to backlog');

    // Get orchestration metrics
    const metrics = await investmentTeam.getOrchestrationMetrics();
    if (metrics) {
      console.log('\n\n📊 Orchestration Performance Metrics:');
      console.log(`- Task Success Rate: ${metrics.taskStatistics.successRate || 'N/A'}%`);
      console.log(`- Average Completion Time: ${metrics.performance.avgTaskDuration || 'N/A'}`);
      console.log(`- Compliance Check Pass Rate: ${metrics.taskStatistics.complianceRate || '100'}%`);
      console.log(`- System Health: ${metrics.systemHealth.status || 'Optimal'}`);
    }

    // Generate dependency visualization for risk management
    const dependencyGraph = await investmentTeam.generateDependencyGraph();
    if (dependencyGraph) {
      console.log('\n\n🔗 Risk Management Workflow Analysis:');
      console.log(`- Total Tasks: ${dependencyGraph.nodes.length}`);
      console.log(`- Dependencies: ${dependencyGraph.edges.length}`);
      console.log(`- Parallel Execution Capacity: ${dependencyGraph.metrics.parallelism}`);
      console.log(`- Critical Path: ${dependencyGraph.metrics.criticalPath.join(' → ')}`);
    }

    // Demonstrate continuous orchestration adaptation
    console.log('\n\n🔄 Continuous Orchestration in Action:');
    console.log('As tasks complete, the orchestrator will:');
    console.log('- Reassess market conditions');
    console.log('- Adjust priorities based on new data');
    console.log('- Generate follow-up tasks for findings');
    console.log('- Ensure compliance at each step');

  } catch (error) {
    console.error('❌ Finance orchestration error:', error.message);
    
    // Finance-specific error handling
    console.log('\n🚨 Risk Management Protocol Activated:');
    console.log('1. Freezing all trading activities');
    console.log('2. Initiating manual override procedures');
    console.log('3. Notifying Chief Risk Officer');
    console.log('4. Documenting system failure for audit trail');
    console.log('5. Activating business continuity plan');
  }

  // Finance-specific insights and best practices
  console.log('\n\n💡 Finance Orchestration Insights:');
  
  console.log('\n1. **Risk-First Architecture**:');
  console.log('   - Low LLM temperature (0.15) for consistent decisions');
  console.log('   - External validation for high-value transactions');
  console.log('   - Compliance checks integrated at every step');
  console.log('   - Quality gates ensure data accuracy');
  
  console.log('\n2. **Market-Responsive Orchestration**:');
  console.log('   - AI-driven prioritization adapts to volatility');
  console.log('   - Dynamic task generation for opportunities');
  console.log('   - Continuous mode for real-time adaptation');
  console.log('   - Market inputs directly influence task selection');
  
  console.log('\n3. **Regulatory Compliance**:');
  console.log('   - Non-adaptable compliance tasks');
  console.log('   - Audit trail for all decisions');
  console.log('   - External validation requirements');
  console.log('   - Segregation of duties enforced');
  
  console.log('\n4. **Performance Optimization**:');
  console.log('   - Skills-based routing to specialists');
  console.log('   - Parallel analysis capabilities');
  console.log('   - Smart task merging for efficiency');
  console.log('   - Time-sensitive task prioritization');
  
  console.log('\n5. **Tool Integration**:');
  console.log('   - MarketAnalysisTool for real-time insights');
  console.log('   - RiskCalculatorTool for quantitative analysis');
  console.log('   - Secure data handling throughout');
  console.log('   - API integration capabilities');
}

// Run the finance example
if (require.main === module) {
  runFinanceOrchestrationExample()
    .then(() => {
      console.log('\n✅ Finance orchestration example completed!');
      console.log('\nThis example demonstrated how KaibanJS handles complex financial');
      console.log('workflows with security, compliance, and performance optimization.');
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { runFinanceOrchestrationExample };