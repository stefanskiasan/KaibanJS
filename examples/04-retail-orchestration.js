/**
 * Example 04: Retail/E-commerce - Inventory & Sales Management Orchestration
 * 
 * This example demonstrates intelligent orchestration for retail operations including:
 * - Inventory management and demand prediction with retail tools
 * - High concurrent task capacity for peak shopping periods
 * - Availability-based workload distribution for time-sensitive operations
 * - Dynamic priority adjustments for seasonal trends
 * - Real-time pricing optimization
 * - Customer experience focus with personalization
 * 
 * Key Features Demonstrated:
 * - Custom tools: InventoryTrackerTool, PricingOptimizerTool
 * - High maxActiveTasks (8) for busy retail operations
 * - Dynamic priorities responding to sales patterns
 * - Availability-based agent distribution
 * - Task merging for efficient operations
 */

require('dotenv').config();
const { Agent, Task, Team } = require('kaibanjs');
const { InventoryTrackerTool, PricingOptimizerTool } = require('./utils/customTools');

async function runRetailOrchestrationExample() {
  console.log('🛍️ Retail/E-commerce Orchestration Example - Inventory & Sales Management\n');
  console.log('Demonstrating high-volume retail operations with dynamic optimization.\n');

  // Create specialized retail agents with custom tools
  const inventoryManagerAgent = new Agent({
    name: 'Carlos Martinez',
    role: 'Inventory Manager',
    goal: 'Optimize inventory levels to meet demand while minimizing carrying costs',
    background: 'Supply chain expert with 15 years in retail inventory optimization',
    tools: [new InventoryTrackerTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
    },
  });

  const pricingAnalystAgent = new Agent({
    name: 'Lisa Chang',
    role: 'Pricing Strategy Analyst',
    goal: 'Maximize revenue through dynamic pricing while maintaining competitiveness',
    background: 'Data scientist specializing in retail pricing algorithms and market analysis',
    tools: [new PricingOptimizerTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.2,
    },
  });

  const customerExperienceAgent = new Agent({
    name: 'David Kumar',
    role: 'Customer Experience Manager',
    goal: 'Ensure exceptional customer satisfaction across all touchpoints',
    background: 'Customer service expert focused on omnichannel retail experiences',
    tools: [],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.4,
    },
  });

  const operationsCoordinatorAgent = new Agent({
    name: 'Sarah Johnson',
    role: 'Operations Coordinator',
    goal: 'Coordinate fulfillment, shipping, and store operations efficiently',
    background: 'Operations specialist with expertise in logistics and process optimization',
    tools: [new InventoryTrackerTool()],
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
    },
  });

  // Create comprehensive retail task repository
  const retailTaskRepository = [
    // Inventory Management Tasks
    new Task({
      title: 'Daily Inventory Analysis',
      description: 'Analyze current inventory levels, sales velocity, and reorder points',
      expectedOutput: 'Inventory report with reorder recommendations and optimization suggestions',
      agent: inventoryManagerAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'high',
      orchestrationRules: `
        ANALYSIS REQUIREMENTS:
        - Check all SKU stock levels
        - Calculate days of supply
        - Identify slow-moving inventory
        - Flag items below reorder points
        
        OPTIMIZATION FOCUS:
        - Minimize stockouts for top sellers
        - Reduce excess inventory costs
        - Consider seasonal patterns
        - Account for lead times
        
        ADAPTATIONS:
        - Increase frequency during peak seasons
        - Deep dive on problem categories
        - Fast-track for critical stockouts
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['inventory-management', 'data-analysis', 'forecasting'],
        dependencies: ['sales-data', 'current-inventory'],
      },
      qualityGates: ['data-accuracy-verified', 'reorder-points-calculated', 'forecast-validated'],
    }),

    new Task({
      title: 'Dynamic Pricing Optimization',
      description: 'Adjust product prices based on demand, competition, and inventory levels',
      expectedOutput: 'Pricing recommendations with projected revenue impact',
      agent: pricingAnalystAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'high',
      mergeCompatible: ['promotion-planning', 'competitor-analysis'],
      orchestrationRules: `
        PRICING FACTORS:
        - Current demand patterns
        - Competitor pricing
        - Inventory levels
        - Profit margins
        - Price elasticity
        
        OPTIMIZATION GOALS:
        - Maximize revenue
        - Clear excess inventory
        - Match market prices
        - Maintain brand positioning
        
        CONSTRAINTS:
        - Minimum margin requirements
        - MAP pricing compliance
        - Price consistency rules
        - Customer perception limits
      `,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['pricing-strategy', 'market-analysis', 'data-science'],
        dependencies: ['competitor-data', 'sales-history', 'inventory-levels'],
      },
    }),

    new Task({
      title: 'Customer Service Queue Management',
      description: 'Monitor and optimize customer service response times across channels',
      expectedOutput: 'Service level report with staffing recommendations',
      agent: customerExperienceAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'high',
      splitStrategy: 'auto', // Can split by channel (email, chat, phone)
      orchestrationRules: `
        SERVICE STANDARDS:
        - Email: <4 hour response
        - Chat: <2 minute wait
        - Phone: <3 minute hold
        - Social: <1 hour response
        
        PRIORITIZATION:
        - VIP customers first
        - Order issues priority
        - Technical problems
        - General inquiries
        
        ADAPTATIONS:
        - Scale staffing for peak times
        - Route complex issues to specialists
        - Automate common questions
      `,
      resourceRequirements: {
        estimatedTime: 'Continuous monitoring',
        skillsRequired: ['customer-service', 'queue-management', 'communication'],
        dependencies: ['ticket-queue', 'staff-availability'],
      },
    }),

    new Task({
      title: 'Order Fulfillment Optimization',
      description: 'Optimize order routing between warehouses and stores for fastest delivery',
      expectedOutput: 'Fulfillment plan minimizing shipping costs and delivery times',
      agent: operationsCoordinatorAgent,
      adaptable: true,
      priority: 'high',
      mergeCompatible: ['shipping-coordination', 'warehouse-management'],
      orchestrationRules: `
        FULFILLMENT PRIORITIES:
        - Same-day delivery orders
        - Express shipping
        - Standard shipping
        - Store pickup
        
        OPTIMIZATION CRITERIA:
        - Minimize shipping costs
        - Meet delivery promises
        - Balance warehouse loads
        - Reduce split shipments
        
        ROUTING LOGIC:
        - Nearest location first
        - Consider inventory availability
        - Account for carrier cutoffs
        - Optimize for consolidation
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours',
        skillsRequired: ['logistics', 'operations-management', 'optimization'],
        dependencies: ['order-queue', 'inventory-locations', 'carrier-schedules'],
      },
    }),

    new Task({
      title: 'Seasonal Trend Analysis',
      description: 'Analyze seasonal patterns and prepare inventory for upcoming trends',
      expectedOutput: 'Seasonal forecast with inventory and marketing recommendations',
      agent: inventoryManagerAgent,
      adaptable: true,
      dynamicPriority: true,
      priority: 'medium',
      externalValidationRequired: true, // Major inventory investments need approval
      orchestrationRules: `
        SEASONAL ANALYSIS:
        - Historical sales patterns
        - Weather impact correlation
        - Holiday calendar effects
        - Fashion/trend cycles
        
        PREPARATION TASKS:
        - Inventory buildup planning
        - Markdown scheduling
        - New product launches
        - Storage optimization
        
        RISK MITIGATION:
        - Avoid overstock on trends
        - Ensure basics availability
        - Plan exit strategies
        - Consider return rates
      `,
      resourceRequirements: {
        estimatedTime: '4-5 hours',
        skillsRequired: ['trend-analysis', 'forecasting', 'merchandising'],
        dependencies: ['historical-data', 'trend-reports', 'weather-forecast'],
      },
    }),

    new Task({
      title: 'Competitor Price Monitoring',
      description: 'Track competitor pricing and promotions across key products',
      expectedOutput: 'Competitive intelligence report with response recommendations',
      agent: pricingAnalystAgent,
      adaptable: true,
      priority: 'medium',
      orchestrationRules: `
        MONITORING SCOPE:
        - Direct competitors
        - Key product categories
        - Promotional activities
        - New product launches
        
        ANALYSIS DEPTH:
        - Price positioning
        - Promotion frequency
        - Bundle strategies
        - Loyalty programs
        
        RESPONSE STRATEGIES:
        - Price matching decisions
        - Differentiation opportunities
        - Value-add recommendations
        - Timing considerations
      `,
      resourceRequirements: {
        estimatedTime: '2-3 hours daily',
        skillsRequired: ['competitive-analysis', 'market-research', 'pricing-strategy'],
        dependencies: ['competitor-feeds', 'market-data'],
      },
    }),

    new Task({
      title: 'Personalization Engine Optimization',
      description: 'Improve product recommendations and personalized marketing',
      expectedOutput: 'Enhanced personalization rules with performance metrics',
      agent: customerExperienceAgent,
      adaptable: true,
      priority: 'medium',
      splitStrategy: 'manual', // Can split by customer segment
      orchestrationRules: `
        PERSONALIZATION ELEMENTS:
        - Product recommendations
        - Email content
        - Homepage customization
        - Search results ranking
        - Promotional offers
        
        OPTIMIZATION GOALS:
        - Increase conversion rate
        - Improve average order value
        - Enhance customer lifetime value
        - Reduce cart abandonment
        
        TESTING APPROACH:
        - A/B test variations
        - Segment performance analysis
        - Continuous refinement
        - Privacy compliance
      `,
      resourceRequirements: {
        estimatedTime: '3-4 hours',
        skillsRequired: ['personalization', 'data-analysis', 'customer-psychology'],
        dependencies: ['customer-data', 'purchase-history', 'browsing-behavior'],
      },
    }),

    new Task({
      title: 'Flash Sale Execution',
      description: 'Coordinate and execute time-sensitive promotional events',
      expectedOutput: 'Successful flash sale with inventory and pricing updates',
      agent: operationsCoordinatorAgent,
      adaptable: false, // Timing is critical
      dynamicPriority: true,
      priority: 'high',
      orchestrationRules: `
        FLASH SALE REQUIREMENTS:
        - Precise timing execution
        - Inventory allocation
        - Price updates
        - Marketing coordination
        - Site performance monitoring
        
        CRITICAL TASKS:
        - Pre-sale inventory check
        - Price change scheduling
        - Email blast timing
        - Social media coordination
        - Customer service briefing
        
        NO DELAYS TOLERATED
      `,
      resourceRequirements: {
        estimatedTime: '4-6 hours (including prep)',
        skillsRequired: ['project-management', 'coordination', 'crisis-management'],
        dependencies: ['inventory-allocated', 'marketing-ready', 'systems-tested'],
      },
      qualityGates: ['inventory-verified', 'prices-updated', 'systems-stable', 'team-briefed'],
    }),
  ];

  // Create retail team with high-volume orchestration configuration
  const retailTeam = new Team({
    name: 'E-commerce Operations Team',
    agents: [inventoryManagerAgent, pricingAnalystAgent, customerExperienceAgent, operationsCoordinatorAgent],
    tasks: [], // Orchestrator will select based on current needs
    
    // ===== Orchestration Configuration =====
    enableOrchestration: true,
    continuousOrchestration: true, // Adapt to real-time sales
    backlogTasks: retailTaskRepository,
    allowTaskGeneration: true, // Create tasks for unexpected situations
    
    orchestrationStrategy: `
      You are orchestrating a high-volume e-commerce operation focused on maximizing sales while maintaining customer satisfaction and operational efficiency.
      
      BUSINESS PRIORITIES:
      1. Prevent stockouts on best sellers
      2. Optimize pricing for maximum revenue
      3. Deliver exceptional customer experience
      4. Minimize operational costs
      
      OPERATIONAL RHYTHM:
      - Morning: Inventory analysis and reorder decisions
      - Midday: Pricing adjustments and competitor monitoring
      - Afternoon: Customer service optimization
      - Evening: Fulfillment planning for next day
      - Overnight: System maintenance and batch processes
      
      PERFORMANCE TARGETS:
      - Stockout rate: <2% on top 100 SKUs
      - Price competitiveness: Within 5% of market
      - Customer satisfaction: >90%
      - Order fulfillment: 98% on-time delivery
      - Inventory turns: >12 annually
      
      SEASONAL CONSIDERATIONS:
      - Black Friday/Cyber Monday preparation
      - Holiday shopping patterns
      - Back-to-school rush
      - Summer/winter transitions
      - Flash sale events
      
      REAL-TIME TRIGGERS:
      - Stockout alerts → Immediate reorder
      - Competitor price changes → Pricing review
      - Service level drops → Staff reallocation
      - Trending products → Inventory adjustment
      
      CONSTRAINTS:
      - Warehouse capacity limits
      - Carrier cutoff times
      - Budget allocation
      - Staff scheduling rules
      - System performance limits
    `,
    
    mode: 'adaptive', // Quick adaptation to market changes
    maxActiveTasks: 8, // High concurrency for retail volume
    taskPrioritization: 'ai-driven', // Smart prioritization
    workloadDistribution: 'availability', // Fast task assignment
    
    // LLM configuration for retail-aware orchestration
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.3, // Balanced for retail decisions
      maxRetries: 3,
    },
  });

  console.log('✅ Retail Operations Team configured with:');
  console.log(`- ${retailTeam.backlogTasks.length} retail-specific task templates`);
  console.log(`- ${retailTeam.agents.length} specialized retail professionals`);
  console.log(`- High concurrency (${retailTeam.maxActiveTasks} tasks) for peak periods`);
  console.log(`- Availability-based distribution for speed\n`);

  try {
    // Retail-specific inputs that influence orchestration
    const retailInputs = {
      // Sales metrics
      dailySalesVolume: 4250, // orders
      averageOrderValue: 78.50, // dollars
      conversionRate: 3.2, // percentage
      cartAbandonmentRate: 68, // percentage
      
      // Inventory status
      totalSKUs: 5420,
      stockoutCount: 23,
      overstockValue: 125000, // dollars
      topSellingCategory: 'electronics',
      
      // Seasonal context
      currentSeason: 'holiday-shopping',
      daysToBlackFriday: 15,
      weatherImpact: 'cold-snap', // affects clothing sales
      
      // Customer metrics
      activeCustomers: 125000,
      vipCustomers: 8500,
      customerSatisfaction: 88, // percentage
      averageResponseTime: 4.5, // hours
      
      // Operational status
      warehouseCapacity: 78, // percentage
      shippingBacklog: 230, // orders
      returnRate: 12, // percentage
      
      // Competitive landscape
      competitorPriceIndex: 98, // 100 = price parity
      marketShareTrend: 'growing',
      newCompetitorEntry: false,
      
      // Time context
      dayOfWeek: 'Thursday',
      timeOfDay: 'afternoon',
      peakTrafficExpected: true,
      
      // Special events
      flashSalePlanned: true,
      newProductLaunch: false,
      marketingCampaignActive: true,
    };

    console.log('🛒 Current Retail Status:');
    console.log(`- Daily Orders: ${retailInputs.dailySalesVolume}`);
    console.log(`- Average Order Value: $${retailInputs.averageOrderValue}`);
    console.log(`- Stockouts: ${retailInputs.stockoutCount} SKUs`);
    console.log(`- Season: ${retailInputs.currentSeason}`);
    console.log(`- Days to Black Friday: ${retailInputs.daysToBlackFriday}`);
    console.log(`- Flash Sale Today: ${retailInputs.flashSalePlanned ? 'Yes' : 'No'}\n`);

    // Start orchestrated workflow with retail context
    console.log('🚀 Starting intelligent retail orchestration...\n');
    
    const result = await retailTeam.start(retailInputs, {
      projectGoal: 'Optimize inventory and pricing for holiday shopping season while preparing for Black Friday surge and maintaining high customer satisfaction',
      preserveExistingTasks: false,
    });

    console.log('\n✅ Retail Orchestration Results:');
    console.log(`- Workflow Status: ${result.status}`);
    console.log(`- Tasks Completed: ${result.stats?.taskCount || 0}`);
    console.log(`- Execution Time: ${result.stats?.duration || 'N/A'}`);
    
    // Display orchestrated retail tasks
    const orchestratedTasks = retailTeam.getTasks();
    console.log('\n📋 Orchestrated Retail Tasks:');
    orchestratedTasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title || task.description}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Agent: ${task.agent?.name}`);
      console.log(`   Dynamic Priority: ${task.dynamicPriority ? 'Yes' : 'No'}`);
      if (task.mergeCompatible?.length) {
        console.log(`   Can merge with: ${task.mergeCompatible.join(', ')}`);
      }
    });

    // Demonstrate dynamic priority adjustment
    console.log('\n\n⚡ Dynamic Priority Adjustment Demo:');
    console.log('\n🚨 Alert: Top-selling product approaching stockout!');
    console.log('Product: Wireless Headphones (SKU: WH-1001)');
    console.log('Current Stock: 12 units');
    console.log('Sales Velocity: 8 units/hour');
    
    console.log('\n✅ Orchestrator Response:');
    console.log('1. Elevating inventory analysis priority to HIGH');
    console.log('2. Creating emergency reorder task');
    console.log('3. Adjusting pricing to slow demand temporarily');
    console.log('4. Notifying customer service of potential stockout');

    // Demonstrate high concurrency handling
    console.log('\n\n🔥 Peak Period Orchestration Demo:');
    console.log('\n📈 Flash Sale Started! Traffic surge detected:');
    console.log('- Concurrent users: 15,000 (300% normal)');
    console.log('- Orders/minute: 125 (500% normal)');
    console.log('- Customer service queue: 85 tickets');
    
    console.log('\n✅ High Concurrency Response:');
    console.log(`All ${retailTeam.maxActiveTasks} task slots activated:`);
    console.log('1. Real-time inventory updates');
    console.log('2. Dynamic pricing adjustments');
    console.log('3. Customer service scaling');
    console.log('4. Order routing optimization');
    console.log('5. Payment processing monitoring');
    console.log('6. Site performance tracking');
    console.log('7. Competitor price watching');
    console.log('8. Social media monitoring');

    // Demonstrate availability-based distribution
    console.log('\n\n👥 Availability-Based Task Distribution:');
    console.log('\nCurrent Agent Availability:');
    console.log('- Inventory Manager: 2 active tasks (capacity: 4)');
    console.log('- Pricing Analyst: 1 active task (capacity: 3)');
    console.log('- Customer Experience: 3 active tasks (capacity: 3) - FULL');
    console.log('- Operations Coordinator: 1 active task (capacity: 4)');
    
    console.log('\n✅ New urgent task "Handle VIP Complaint" assigned to:');
    console.log('→ Operations Coordinator (most available)');
    console.log('   Rather than Customer Experience Manager (at capacity)');

    // Get real-time metrics
    const metrics = await retailTeam.getOrchestrationMetrics();
    if (metrics) {
      console.log('\n\n📊 Real-Time Retail Metrics:');
      console.log(`- Task Throughput: ${metrics.performance.tasksPerHour || 'N/A'} tasks/hour`);
      console.log(`- Average Response Time: ${metrics.performance.avgResponseTime || 'N/A'} minutes`);
      console.log(`- System Load: ${metrics.systemHealth.load || 'N/A'}%`);
      console.log(`- Error Rate: ${metrics.systemHealth.errorRate || '0.1'}%`);
    }

    // Demonstrate seasonal adaptation
    console.log('\n\n🎄 Seasonal Orchestration Adaptation:');
    console.log('\nBlack Friday Preparation Mode Activated:');
    console.log('- Inventory buildup for doorbusters');
    console.log('- Price optimization for competitiveness');
    console.log('- Staff scheduling for 24/7 coverage');
    console.log('- System stress testing scheduled');
    console.log('- Contingency plans activated');
    
    // Update for Black Friday prep
    retailTeam.updateOrchestrationStrategy(
      retailTeam.orchestrationStrategy + '\n\nBLACK FRIDAY PREP: All systems to maximum readiness. Prioritize doorbuster inventory and stress testing.'
    );
    console.log('\n✅ Orchestration strategy updated for Black Friday');

  } catch (error) {
    console.error('❌ Retail orchestration error:', error.message);
    
    // Retail-specific error handling
    console.log('\n🛡️ Business Continuity Protocol:');
    console.log('1. Switching to manual operation mode');
    console.log('2. Prioritizing order fulfillment');
    console.log('3. Maintaining customer service');
    console.log('4. Deferring non-critical updates');
    console.log('5. Notifying operations team');
  }

  // Retail-specific insights
  console.log('\n\n💡 Retail Orchestration Insights:');
  
  console.log('\n1. **High-Volume Architecture**:');
  console.log('   - 8 concurrent tasks for peak efficiency');
  console.log('   - Availability-based routing for speed');
  console.log('   - Real-time adaptation to demand');
  console.log('   - Scalable task generation');
  
  console.log('\n2. **Dynamic Retail Operations**:');
  console.log('   - AI-driven priority adjustments');
  console.log('   - Seasonal pattern recognition');
  console.log('   - Flash sale coordination');
  console.log('   - Inventory optimization');
  
  console.log('\n3. **Customer Focus**:');
  console.log('   - Service level monitoring');
  console.log('   - Personalization optimization');
  console.log('   - VIP customer prioritization');
  console.log('   - Experience consistency');
  
  console.log('\n4. **Competitive Advantage**:');
  console.log('   - Real-time price optimization');
  console.log('   - Competitor monitoring');
  console.log('   - Market trend adaptation');
  console.log('   - Revenue maximization');
  
  console.log('\n5. **Tool Integration**:');
  console.log('   - InventoryTrackerTool for stock management');
  console.log('   - PricingOptimizerTool for dynamic pricing');
  console.log('   - Omnichannel coordination');
  console.log('   - Analytics-driven decisions');
}

// Run the retail example
if (require.main === module) {
  runRetailOrchestrationExample()
    .then(() => {
      console.log('\n✅ Retail orchestration example completed!');
      console.log('\nThis example demonstrated how KaibanJS handles high-volume');
      console.log('retail operations with dynamic optimization and customer focus.');
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { runRetailOrchestrationExample };