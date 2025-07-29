/**
 * Example 11: E-Commerce Project
 *
 * This example demonstrates a complete e-commerce platform development using
 * intelligent orchestration. It shows how to build a real-world application
 * with multiple features, integrations, and considerations.
 *
 * Key features demonstrated:
 * - Complete project from start to finish
 * - Multiple feature areas (catalog, cart, payments, etc.)
 * - Integration with third-party services
 * - Performance and scaling considerations
 * - Security and compliance requirements
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import specialized agents for e-commerce development
const {
  seniorDeveloper,
  frontendDeveloper,
  backendDeveloper,
  dataArchitect,
  uxDesigner,
  qaEngineer,
  devOpsEngineer,
  securityExpert,
  productManager,
  performanceEngineer,
} = require('./utils/agents');

async function runECommerceProjectExample() {
  console.log('🛍️ KaibanJS E-Commerce Project Example\n');
  console.log(
    'Building a complete e-commerce platform with intelligent orchestration.\n'
  );

  // Create comprehensive e-commerce task repository
  const ecommerceTaskRepository = [
    // Product Catalog Management
    new Task({
      description: 'Build product catalog with advanced search and filtering',
      expectedOutput: 'Scalable product catalog supporting millions of SKUs',
      agent: backendDeveloper,
      adaptable: true,
      dynamicPriority: true,
      orchestrationRules: `
        CATALOG FEATURES:
        - Product CRUD operations
        - Category management
        - Attribute system (size, color, etc.)
        - Advanced search (Elasticsearch)
        - Faceted filtering
        - Product variants
        - Inventory tracking
        
        PERFORMANCE REQUIREMENTS:
        - Search results <100ms
        - Support 1M+ products
        - Real-time inventory updates
      `,
      resourceRequirements: {
        estimatedTime: '15-20 hours',
        skillsRequired: ['backend', 'elasticsearch', 'database_design'],
        dependencies: [],
      },
    }),

    // Shopping Cart & Checkout
    new Task({
      description:
        'Implement shopping cart with persistent state and checkout flow',
      expectedOutput:
        'Seamless cart and checkout experience with high conversion',
      agent: frontendDeveloper,
      adaptable: true,
      orchestrationRules: `
        CART FEATURES:
        - Add/remove/update items
        - Persistent cart (logged in/out)
        - Price calculations
        - Tax computation
        - Shipping options
        - Promo codes/discounts
        - Guest checkout
        - Multi-step checkout
        
        UX REQUIREMENTS:
        - One-click add to cart
        - Mini cart preview
        - Abandoned cart recovery
        - Mobile-optimized checkout
      `,
      resourceRequirements: {
        estimatedTime: '12-15 hours',
        skillsRequired: ['frontend', 'state_management', 'ux'],
        dependencies: ['product_catalog'],
      },
    }),

    // Payment Processing
    new Task({
      description: 'Integrate multiple payment gateways with PCI compliance',
      expectedOutput:
        'Secure payment system supporting cards, wallets, and BNPL',
      agent: backendDeveloper,
      adaptable: false, // Security critical - no modifications
      orchestrationRules: `
        PAYMENT METHODS:
        - Credit/debit cards (Stripe)
        - Digital wallets (PayPal, Apple Pay)
        - Buy now, pay later (Klarna)
        - Cryptocurrency (optional)
        
        SECURITY REQUIREMENTS:
        - PCI DSS compliance
        - Tokenization
        - 3D Secure authentication
        - Fraud detection
        - Secure webhooks
        
        FEATURES:
        - Recurring payments
        - Refunds/cancellations
        - Multi-currency support
      `,
      resourceRequirements: {
        estimatedTime: '20-25 hours',
        skillsRequired: ['payments', 'security', 'compliance'],
        dependencies: ['checkout_flow'],
      },
    }),

    // User Account Management
    new Task({
      description: 'Create user account system with profiles and order history',
      expectedOutput: 'Complete user management with social login options',
      agent: seniorDeveloper,
      adaptable: true,
      orchestrationRules: `
        USER FEATURES:
        - Registration/login
        - Social authentication
        - Profile management
        - Address book
        - Order history
        - Wishlists/favorites
        - Email preferences
        - Account security
        
        INTEGRATIONS:
        - Email verification
        - Password reset
        - OAuth providers
        - Newsletter system
      `,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: ['authentication', 'user_management', 'oauth'],
        dependencies: [],
      },
    }),

    // Order Management System
    new Task({
      description: 'Build order management with fulfillment workflow',
      expectedOutput: 'Complete OMS with automated fulfillment and tracking',
      agent: backendDeveloper,
      adaptable: true,
      orchestrationRules: `
        ORDER LIFECYCLE:
        - Order placement
        - Payment processing
        - Inventory allocation
        - Fulfillment workflow
        - Shipping integration
        - Tracking updates
        - Returns/exchanges
        
        INTEGRATIONS:
        - Warehouse management
        - Shipping carriers
        - Email notifications
        - SMS updates
      `,
      resourceRequirements: {
        estimatedTime: '15-18 hours',
        skillsRequired: ['backend', 'workflow_automation', 'integrations'],
        dependencies: ['payment_system', 'inventory'],
      },
    }),

    // Product Recommendations
    new Task({
      description: 'Implement AI-powered product recommendations engine',
      expectedOutput:
        'Personalized recommendations increasing conversion by 20%',
      agent: dataArchitect,
      adaptable: true,
      orchestrationRules: `
        RECOMMENDATION TYPES:
        - Collaborative filtering
        - Content-based
        - Frequently bought together
        - Recently viewed
        - Trending products
        - Personalized homepage
        
        ML FEATURES:
        - User behavior tracking
        - Purchase history analysis
        - Real-time updates
        - A/B testing framework
      `,
      resourceRequirements: {
        estimatedTime: '12-15 hours',
        skillsRequired: [
          'machine_learning',
          'data_analysis',
          'personalization',
        ],
        dependencies: ['user_tracking', 'product_catalog'],
      },
    }),

    // Mobile Apps
    new Task({
      description: 'Develop native mobile apps for iOS and Android',
      expectedOutput: 'High-performance mobile apps with offline support',
      agent: frontendDeveloper,
      adaptable: true,
      orchestrationRules: `
        MOBILE FEATURES:
        - Native performance
        - Push notifications
        - Barcode scanning
        - Mobile payments
        - Offline browsing
        - App-exclusive deals
        
        PLATFORMS:
        - iOS (Swift/SwiftUI)
        - Android (Kotlin)
        - OR React Native for both
      `,
      resourceRequirements: {
        estimatedTime: '30-40 hours',
        skillsRequired: ['mobile_development', 'ios', 'android'],
        dependencies: ['api_complete'],
      },
    }),

    // Analytics and Reporting
    new Task({
      description: 'Create analytics dashboard with business intelligence',
      expectedOutput: 'Real-time analytics with actionable insights',
      agent: dataArchitect,
      adaptable: true,
      orchestrationRules: `
        ANALYTICS AREAS:
        - Sales metrics
        - Customer behavior
        - Product performance
        - Marketing ROI
        - Inventory turnover
        - Geographic analysis
        
        FEATURES:
        - Real-time dashboards
        - Custom reports
        - Data export
        - Predictive analytics
      `,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: ['analytics', 'data_visualization', 'bi_tools'],
        dependencies: ['order_management', 'user_tracking'],
      },
    }),

    // Performance Optimization
    new Task({
      description: 'Optimize site performance for Black Friday scale',
      expectedOutput:
        'Platform handling 100x normal traffic with <2s load times',
      agent: performanceEngineer,
      adaptable: true,
      orchestrationRules: `
        OPTIMIZATION AREAS:
        - Frontend performance
        - API optimization
        - Database tuning
        - CDN configuration
        - Image optimization
        - Caching strategy
        
        TARGETS:
        - Page load <2s
        - 100K concurrent users
        - 99.9% uptime
      `,
      resourceRequirements: {
        estimatedTime: '15-20 hours',
        skillsRequired: ['performance', 'scaling', 'optimization'],
        dependencies: ['platform_complete'],
      },
    }),

    // Security Hardening
    new Task({
      description: 'Implement comprehensive security measures and compliance',
      expectedOutput: 'Secure platform meeting all compliance requirements',
      agent: securityExpert,
      adaptable: false,
      orchestrationRules: `
        SECURITY MEASURES:
        - OWASP Top 10 protection
        - DDoS mitigation
        - Rate limiting
        - Input validation
        - SQL injection prevention
        - XSS protection
        
        COMPLIANCE:
        - PCI DSS
        - GDPR/CCPA
        - SOC 2
      `,
      resourceRequirements: {
        estimatedTime: '12-15 hours',
        skillsRequired: ['security', 'compliance', 'penetration_testing'],
        dependencies: ['platform_complete'],
      },
    }),
  ];

  console.log(
    `📋 E-Commerce Tasks: ${ecommerceTaskRepository.length} features to build\n`
  );

  // Create e-commerce development team
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.4,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const ecommerceTeam = new Team({
    name: 'E-Commerce Development Team',
    agents: [
      productManager, // Product strategy
      seniorDeveloper, // Architecture
      frontendDeveloper, // UI/UX
      backendDeveloper, // APIs
      dataArchitect, // Analytics & ML
      uxDesigner, // Design
      qaEngineer, // Quality
      devOpsEngineer, // Infrastructure
      securityExpert, // Security
      performanceEngineer, // Optimization
    ],
    tasks: [],

    enableOrchestration: true,
    backlogTasks: ecommerceTaskRepository,
    allowTaskGeneration: true, // Allow filling gaps

    // Enable continuous orchestration for dynamic e-commerce adaptation
    continuousOrchestration: true,

    mode: 'adaptive',
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',

    orchestrationStrategy: `
      You are building a MODERN E-COMMERCE PLATFORM to compete with industry leaders.
      
      BUSINESS REQUIREMENTS:
      - Launch MVP in 3 months
      - Support 10K products initially
      - Scale to 1M products within a year
      - Handle Black Friday traffic (100x normal)
      - Mobile-first approach (60% mobile users)
      - Global market (multi-currency, multi-language)
      
      TECHNICAL REQUIREMENTS:
      - Microservices architecture
      - Cloud-native (AWS/GCP)
      - API-first design
      - Real-time inventory
      - <2 second page loads
      - 99.9% uptime SLA
      
      CUSTOMER EXPERIENCE PRIORITIES:
      1. Fast, intuitive product discovery
      2. Seamless checkout process
      3. Multiple payment options
      4. Real-time order tracking
      5. Easy returns/exchanges
      6. Personalized experience
      
      REVENUE DRIVERS:
      - Conversion rate optimization
      - Average order value increase
      - Customer retention
      - Reduced cart abandonment
      - Cross-sell/upsell
      
      COMPETITIVE ADVANTAGES:
      - AI-powered recommendations
      - One-click checkout
      - Same-day delivery options
      - Virtual try-on (AR)
      - Subscription offerings
      
      CONSTRAINTS:
      - Budget: $500K
      - Timeline: 3 months to MVP
      - Team: 10 developers
      - Must be PCI compliant
      
      PHASED APPROACH:
      Phase 1 (Month 1): Core catalog, cart, basic checkout
      Phase 2 (Month 2): Payments, user accounts, orders
      Phase 3 (Month 3): Mobile apps, recommendations, optimization
      
      SUCCESS METRICS:
      - Conversion rate >3%
      - Cart abandonment <60%
      - Page load time <2s
      - Customer satisfaction >4.5/5
    `,

    maxActiveTasks: 5,

    llmInstance: orchestrationLLM,
  });

  console.log('✅ E-Commerce team assembled and configured\n');

  try {
    // Start the e-commerce project
    console.log('🚀 Launching E-Commerce Platform Development...\n');

    const projectGoal = `
      Build a competitive e-commerce platform with excellent user experience,
      high performance, and modern features. Focus on mobile experience and
      conversion optimization. Ensure scalability for Black Friday.
    `;

    const projectTasks = await ecommerceTeam.activateOrchestration(
      projectGoal,
      true
    );

    // Display project plan
    console.log(`📅 E-Commerce Development Plan:\n`);

    // Group by phase
    const phases = {
      'Phase 1: Foundation': [],
      'Phase 2: Core Features': [],
      'Phase 3: Enhancement': [],
    };

    projectTasks.forEach((task) => {
      const phase = determinePhase(task);
      phases[phase].push(task);
    });

    Object.entries(phases).forEach(([phase, tasks]) => {
      console.log(`${phase} (${tasks.length} tasks):`);
      tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.description}`);
        console.log(`     Owner: ${task.agent.name}`);
      });
      console.log('');
    });

    // Key integrations
    console.log('🔗 Third-Party Integrations:\n');

    const integrations = [
      {
        service: 'Stripe',
        purpose: 'Payment processing',
        priority: 'Critical',
      },
      {
        service: 'SendGrid',
        purpose: 'Transactional emails',
        priority: 'High',
      },
      { service: 'Algolia', purpose: 'Search functionality', priority: 'High' },
      {
        service: 'Cloudinary',
        purpose: 'Image optimization',
        priority: 'Medium',
      },
      {
        service: 'ShipEngine',
        purpose: 'Shipping rates/labels',
        priority: 'High',
      },
      { service: 'Twilio', purpose: 'SMS notifications', priority: 'Medium' },
      {
        service: 'Google Analytics',
        purpose: 'User tracking',
        priority: 'High',
      },
      { service: 'Sentry', purpose: 'Error monitoring', priority: 'High' },
    ];

    integrations.forEach((int) => {
      console.log(`${int.service}:`);
      console.log(`  Purpose: ${int.purpose}`);
      console.log(`  Priority: ${int.priority}\n`);
    });

    // Technical architecture
    console.log('🏗️ Technical Architecture:\n');

    console.log('Frontend:');
    console.log('  - Next.js for SSR/SSG');
    console.log('  - React for components');
    console.log('  - Redux for state management');
    console.log('  - Tailwind CSS for styling\n');

    console.log('Backend:');
    console.log('  - Node.js with Express');
    console.log('  - GraphQL API');
    console.log('  - PostgreSQL database');
    console.log('  - Redis for caching\n');

    console.log('Infrastructure:');
    console.log('  - AWS/Kubernetes');
    console.log('  - CloudFront CDN');
    console.log('  - S3 for assets');
    console.log('  - Auto-scaling groups\n');

    // Performance optimization
    console.log('⚡ Performance Strategy:\n');

    console.log('1. Frontend Optimization:');
    console.log('   - Code splitting');
    console.log('   - Lazy loading');
    console.log('   - Image optimization');
    console.log('   - Service workers\n');

    console.log('2. Backend Optimization:');
    console.log('   - Database indexing');
    console.log('   - Query optimization');
    console.log('   - Caching layers');
    console.log('   - CDN distribution\n');

    console.log('3. Scaling Strategy:');
    console.log('   - Horizontal scaling');
    console.log('   - Load balancing');
    console.log('   - Database replication');
    console.log('   - Queue systems\n');

    // Revenue optimization
    console.log('💰 Revenue Optimization Features:\n');

    console.log('Conversion Optimization:');
    console.log('  • One-page checkout');
    console.log('  • Guest checkout option');
    console.log('  • Multiple payment methods');
    console.log('  • Trust badges\n');

    console.log('Average Order Value:');
    console.log('  • Product bundles');
    console.log('  • Volume discounts');
    console.log('  • Free shipping threshold');
    console.log('  • Cross-sell/upsell\n');

    console.log('Customer Retention:');
    console.log('  • Loyalty program');
    console.log('  • Email marketing');
    console.log('  • Wishlist reminders');
    console.log('  • Personalization\n');

    // Launch checklist
    console.log('✅ Pre-Launch Checklist:\n');

    const checklist = [
      'Security audit completed',
      'Load testing passed (100x traffic)',
      'Payment processing tested',
      'Mobile apps approved',
      'SEO optimization done',
      'Analytics tracking verified',
      'Legal compliance checked',
      'Backup systems tested',
      'Customer support ready',
      'Marketing campaigns prepared',
    ];

    checklist.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
  } catch (error) {
    console.error('❌ E-commerce project error:', error.message);
  }

  console.log('\n🎉 E-Commerce Platform Summary:\n');
  console.log('• Complete platform from catalog to checkout');
  console.log('• Mobile-first responsive design');
  console.log('• Scalable microservices architecture');
  console.log('• AI-powered personalization');
  console.log('• Enterprise-grade security');
  console.log('• Black Friday ready performance');
  console.log('• Global market support');
  console.log('• Omnichannel experience');
}

// Helper function to determine project phase
function determinePhase(task) {
  const description = task.description.toLowerCase();

  if (
    description.includes('catalog') ||
    description.includes('cart') ||
    description.includes('user account')
  ) {
    return 'Phase 1: Foundation';
  } else if (
    description.includes('payment') ||
    description.includes('order') ||
    description.includes('checkout')
  ) {
    return 'Phase 2: Core Features';
  } else {
    return 'Phase 3: Enhancement';
  }
}

// Run the example
if (require.main === module) {
  runECommerceProjectExample()
    .then(() => console.log('\n✅ E-commerce project example completed!'))
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runECommerceProjectExample };
