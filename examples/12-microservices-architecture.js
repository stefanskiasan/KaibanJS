/**
 * Example 12: Microservices Architecture
 *
 * This example demonstrates how to use intelligent orchestration to build
 * a complex microservices architecture. It shows service decomposition,
 * inter-service communication, and distributed system challenges.
 *
 * Key concepts:
 * - Service boundary definition
 * - API gateway pattern
 * - Service discovery
 * - Distributed transactions
 * - Event-driven architecture
 * - Resilience patterns
 */

require('dotenv').config();
const { Agent: _Agent, Task, Team } = require('kaibanjs');
const { ChatOpenAI } = require('@langchain/openai');
// Import specialized agents for microservices development
const {
  seniorDeveloper,
  backendDeveloper,
  dataArchitect,
  devOpsEngineer,
  securityExpert,
  performanceEngineer,
  qaEngineer,
  technicalWriter,
} = require('./utils/agents');

async function runMicroservicesArchitectureExample() {
  console.log('🔧 KaibanJS Microservices Architecture Example\n');
  console.log(
    'Building a distributed system with intelligent service orchestration.\n'
  );

  // Create microservices-specific tasks
  const microservicesTaskRepository = [
    // Service Decomposition
    new Task({
      description:
        'Design service boundaries using Domain-Driven Design principles',
      expectedOutput:
        'Well-defined service boundaries with clear responsibilities',
      agent: seniorDeveloper,
      adaptable: true,
      orchestrationRules: `
        SERVICE BOUNDARIES:
        - User Service: Authentication, profiles, preferences
        - Product Service: Catalog, inventory, pricing
        - Order Service: Order processing, fulfillment
        - Payment Service: Transaction processing
        - Notification Service: Email, SMS, push
        - Analytics Service: Events, metrics, reporting
        
        DDD PRINCIPLES:
        - Bounded contexts
        - Aggregates
        - Domain events
        - Ubiquitous language
        
        ANTI-PATTERNS TO AVOID:
        - Distributed monolith
        - Chatty interfaces
        - Shared databases
        - Circular dependencies
      `,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['architecture', 'ddd', 'microservices'],
        dependencies: [],
      },
    }),

    // API Gateway Implementation
    new Task({
      description:
        'Implement API Gateway with authentication and rate limiting',
      expectedOutput:
        'Production-ready API Gateway handling all client requests',
      agent: backendDeveloper,
      adaptable: true,
      orchestrationRules: `
        GATEWAY FEATURES:
        - Request routing
        - Authentication/authorization
        - Rate limiting
        - Request/response transformation
        - Circuit breaking
        - Load balancing
        - API versioning
        - Request logging
        
        TECHNOLOGIES:
        - Kong/Zuul/Envoy
        - JWT validation
        - OAuth2 integration
        - GraphQL federation
      `,
      resourceRequirements: {
        estimatedTime: '12-15 hours',
        skillsRequired: ['api_gateway', 'security', 'networking'],
        dependencies: ['service_boundaries'],
      },
    }),

    // Service Discovery & Registry
    new Task({
      description:
        'Set up service discovery with health checking and load balancing',
      expectedOutput: 'Dynamic service discovery with automatic failover',
      agent: devOpsEngineer,
      adaptable: true,
      orchestrationRules: `
        DISCOVERY PATTERNS:
        - Service registry (Consul/Eureka)
        - Health checking
        - Load balancing strategies
        - Failover handling
        - Service mesh integration
        
        FEATURES:
        - Auto-registration
        - Health endpoints
        - Circuit breakers
        - Retry policies
        - Timeout management
      `,
      resourceRequirements: {
        estimatedTime: '8-10 hours',
        skillsRequired: ['service_discovery', 'networking', 'devops'],
        dependencies: ['api_gateway'],
      },
    }),

    // Event-Driven Architecture
    new Task({
      description: 'Implement event-driven communication between services',
      expectedOutput: 'Scalable event bus with guaranteed message delivery',
      agent: dataArchitect,
      adaptable: true,
      orchestrationRules: `
        EVENT INFRASTRUCTURE:
        - Message broker (Kafka/RabbitMQ)
        - Event schemas
        - Event sourcing
        - CQRS pattern
        - Saga orchestration
        
        EVENT TYPES:
        - Domain events
        - Integration events
        - Command events
        - Query events
        
        GUARANTEES:
        - At-least-once delivery
        - Event ordering
        - Idempotency
        - Dead letter queues
      `,
      resourceRequirements: {
        estimatedTime: '15-18 hours',
        skillsRequired: ['messaging', 'event_driven', 'distributed_systems'],
        dependencies: ['service_boundaries'],
      },
    }),

    // Distributed Transaction Management
    new Task({
      description: 'Implement distributed transaction patterns (Saga, 2PC)',
      expectedOutput: 'Reliable transaction management across services',
      agent: seniorDeveloper,
      adaptable: true,
      orchestrationRules: `
        TRANSACTION PATTERNS:
        - Saga pattern (choreography/orchestration)
        - Two-phase commit (when necessary)
        - Compensating transactions
        - Event sourcing
        - Outbox pattern
        
        CONSISTENCY MODELS:
        - Eventual consistency
        - Strong consistency (limited use)
        - Read-after-write consistency
        
        ERROR HANDLING:
        - Compensation logic
        - Retry strategies
        - Timeout handling
        - Partial failure recovery
      `,
      resourceRequirements: {
        estimatedTime: '12-15 hours',
        skillsRequired: ['distributed_systems', 'transactions', 'patterns'],
        dependencies: ['event_architecture'],
      },
    }),

    // Service Resilience
    new Task({
      description:
        'Implement resilience patterns (circuit breakers, bulkheads, retries)',
      expectedOutput: 'Fault-tolerant services with graceful degradation',
      agent: performanceEngineer,
      adaptable: true,
      orchestrationRules: `
        RESILIENCE PATTERNS:
        - Circuit breakers (Hystrix/Resilience4j)
        - Bulkhead isolation
        - Timeout handling
        - Retry with exponential backoff
        - Fallback mechanisms
        - Rate limiting
        
        MONITORING:
        - Service health metrics
        - Error rates
        - Latency tracking
        - Circuit breaker states
        
        CHAOS ENGINEERING:
        - Failure injection
        - Latency injection
        - Resource constraints
      `,
      resourceRequirements: {
        estimatedTime: '10-12 hours',
        skillsRequired: ['resilience', 'monitoring', 'fault_tolerance'],
        dependencies: ['service_discovery'],
      },
    }),

    // Distributed Logging & Tracing
    new Task({
      description: 'Set up distributed tracing and centralized logging',
      expectedOutput: 'Complete observability across all microservices',
      agent: devOpsEngineer,
      adaptable: true,
      orchestrationRules: `
        OBSERVABILITY STACK:
        - Distributed tracing (Jaeger/Zipkin)
        - Centralized logging (ELK stack)
        - Metrics collection (Prometheus)
        - Dashboards (Grafana)
        
        CORRELATION:
        - Request ID propagation
        - Trace context
        - Log aggregation
        - Error tracking
        
        FEATURES:
        - End-to-end request tracing
        - Performance bottleneck identification
        - Error root cause analysis
        - Service dependency mapping
      `,
      resourceRequirements: {
        estimatedTime: '12-15 hours',
        skillsRequired: ['observability', 'monitoring', 'logging'],
        dependencies: ['api_gateway', 'services_deployed'],
      },
    }),

    // Container Orchestration
    new Task({
      description: 'Deploy services using Kubernetes with auto-scaling',
      expectedOutput: 'Production-ready Kubernetes cluster with all services',
      agent: devOpsEngineer,
      adaptable: true,
      orchestrationRules: `
        KUBERNETES SETUP:
        - Service deployments
        - ConfigMaps/Secrets
        - Ingress controllers
        - Service mesh (Istio)
        - Auto-scaling (HPA/VPA)
        - Rolling updates
        
        FEATURES:
        - Zero-downtime deployments
        - Resource optimization
        - Multi-region support
        - Disaster recovery
        - GitOps workflow
      `,
      resourceRequirements: {
        estimatedTime: '20-25 hours',
        skillsRequired: ['kubernetes', 'containers', 'orchestration'],
        dependencies: ['services_complete'],
      },
    }),

    // Security Implementation
    new Task({
      description: 'Implement zero-trust security model for microservices',
      expectedOutput:
        'Comprehensive security across all service communications',
      agent: securityExpert,
      adaptable: false,
      orchestrationRules: `
        SECURITY LAYERS:
        - mTLS between services
        - Service authentication
        - API key management
        - Secrets management (Vault)
        - Network policies
        - RBAC implementation
        
        COMPLIANCE:
        - Encryption in transit
        - Encryption at rest
        - Audit logging
        - Access control
        - Vulnerability scanning
      `,
      resourceRequirements: {
        estimatedTime: '15-18 hours',
        skillsRequired: ['security', 'zero_trust', 'compliance'],
        dependencies: ['service_mesh'],
      },
    }),

    // Testing Strategy
    new Task({
      description: 'Implement comprehensive testing for distributed system',
      expectedOutput:
        'Complete test suite including contract and integration tests',
      agent: qaEngineer,
      adaptable: true,
      orchestrationRules: `
        TEST TYPES:
        - Unit tests per service
        - Contract testing (Pact)
        - Integration testing
        - End-to-end testing
        - Performance testing
        - Chaos testing
        
        STRATEGIES:
        - Consumer-driven contracts
        - Service virtualization
        - Test data management
        - Environment isolation
        - Continuous testing
      `,
      resourceRequirements: {
        estimatedTime: '15-20 hours',
        skillsRequired: ['testing', 'contract_testing', 'automation'],
        dependencies: ['services_complete'],
      },
    }),
  ];

  console.log(
    `📋 Microservices Tasks: ${microservicesTaskRepository.length} architectural components\n`
  );

  // Create microservices development team
  // Create LLM instance for orchestration
  const orchestrationLLM = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxRetries: 2,
  });
  const microservicesTeam = new Team({
    name: 'Microservices Architecture Team',
    agents: [
      seniorDeveloper, // Architecture
      backendDeveloper, // Service implementation
      dataArchitect, // Event architecture
      devOpsEngineer, // Infrastructure
      securityExpert, // Security
      performanceEngineer, // Resilience
      qaEngineer, // Testing
      technicalWriter, // Documentation
    ],
    tasks: [],

    enableOrchestration: true,
    backlogTasks: microservicesTaskRepository,
    allowTaskGeneration: true,

    // Enable continuous orchestration for dynamic architecture adaptation
    continuousOrchestration: true,

    mode: 'adaptive',
    taskPrioritization: 'ai-driven',
    workloadDistribution: 'skills-based',

    orchestrationStrategy: `
      You are architecting a MICROSERVICES SYSTEM for a high-scale platform.
      
      SYSTEM REQUIREMENTS:
      - Support 1M+ concurrent users
      - Sub-100ms latency for most operations
      - 99.99% availability
      - Handle 100K requests/second
      - Global distribution
      
      ARCHITECTURE PRINCIPLES:
      1. LOOSE COUPLING:
         - Services communicate via APIs/events
         - No shared databases
         - Independent deployments
         - Technology agnostic
      
      2. HIGH COHESION:
         - Single responsibility per service
         - Domain-driven boundaries
         - Encapsulated business logic
         - Clear service contracts
      
      3. RESILIENCE:
         - Fault isolation
         - Graceful degradation
         - Self-healing systems
         - No single point of failure
      
      4. SCALABILITY:
         - Horizontal scaling
         - Stateless services
         - Efficient resource usage
         - Auto-scaling policies
      
      5. OBSERVABILITY:
         - Distributed tracing
         - Centralized logging
         - Real-time metrics
         - Service mesh insights
      
      TECHNICAL STACK:
      - Languages: Go, Node.js, Python
      - Messaging: Kafka, RabbitMQ
      - Databases: PostgreSQL, MongoDB, Redis
      - Infrastructure: Kubernetes, Istio
      - Monitoring: Prometheus, Grafana, Jaeger
      
      CHALLENGES TO ADDRESS:
      - Service communication overhead
      - Data consistency
      - Distributed transactions
      - Service discovery
      - Security between services
      - Deployment complexity
      - Debugging distributed systems
      
      ANTI-PATTERNS TO AVOID:
      - Distributed monolith
      - Chatty interfaces
      - Synchronous communication everywhere
      - Shared databases
      - Missing service boundaries
      
      SUCCESS CRITERIA:
      - Independent service deployment
      - <5 minute service startup
      - Automated scaling
      - Zero-downtime deployments
      - Complete observability
    `,

    maxActiveTasks: 4,

    llmInstance: orchestrationLLM,
  });

  console.log(
    '✅ Microservices team configured for distributed architecture\n'
  );

  try {
    // Start microservices architecture development
    console.log('🚀 Building Microservices Architecture...\n');

    const architectureGoal = `
      Design and implement a scalable microservices architecture that can handle
      millions of users with high availability and performance. Focus on resilience,
      observability, and maintainability.
    `;

    const architectureTasks = await microservicesTeam.activateOrchestration(
      architectureGoal,
      true
    );

    // Display architecture plan
    console.log('🏗️ Microservices Architecture Plan:\n');

    // Group by architectural layer
    const layers = {
      Foundation: [],
      'Core Services': [],
      Infrastructure: [],
      Operations: [],
    };

    architectureTasks.forEach((task) => {
      const layer = categorizeArchitecturalLayer(task);
      layers[layer].push(task);
    });

    Object.entries(layers).forEach(([layer, tasks]) => {
      if (tasks.length > 0) {
        console.log(`${layer}:`);
        tasks.forEach((task, index) => {
          console.log(`  ${index + 1}. ${task.description}`);
        });
        console.log('');
      }
    });

    // Service decomposition
    console.log('📦 Service Decomposition:\n');

    const services = [
      {
        name: 'User Service',
        responsibilities: ['Authentication', 'Authorization', 'User profiles'],
        technology: 'Node.js + PostgreSQL',
        apis: ['REST', 'gRPC'],
      },
      {
        name: 'Product Service',
        responsibilities: ['Product catalog', 'Inventory', 'Pricing'],
        technology: 'Go + MongoDB',
        apis: ['GraphQL', 'gRPC'],
      },
      {
        name: 'Order Service',
        responsibilities: [
          'Order processing',
          'Fulfillment',
          'Status tracking',
        ],
        technology: 'Node.js + PostgreSQL',
        apis: ['REST', 'Events'],
      },
      {
        name: 'Payment Service',
        responsibilities: ['Payment processing', 'Refunds', 'Reconciliation'],
        technology: 'Go + PostgreSQL',
        apis: ['gRPC', 'Events'],
      },
      {
        name: 'Notification Service',
        responsibilities: ['Email', 'SMS', 'Push notifications'],
        technology: 'Python + Redis',
        apis: ['Events', 'REST'],
      },
    ];

    services.forEach((service) => {
      console.log(`${service.name}:`);
      console.log(`  Responsibilities: ${service.responsibilities.join(', ')}`);
      console.log(`  Technology: ${service.technology}`);
      console.log(`  APIs: ${service.apis.join(', ')}\n`);
    });

    // Communication patterns
    console.log('💬 Inter-Service Communication:\n');

    console.log('Synchronous (REST/gRPC):');
    console.log('  • User Service → Product Service (get product details)');
    console.log('  • Order Service → Payment Service (process payment)');
    console.log('  • API Gateway → All Services (client requests)\n');

    console.log('Asynchronous (Events):');
    console.log('  • Order Service → Notification Service (order placed)');
    console.log('  • Payment Service → Order Service (payment completed)');
    console.log('  • All Services → Analytics Service (domain events)\n');

    // Resilience patterns
    console.log('🛡️ Resilience Implementation:\n');

    const resiliencePatterns = [
      {
        pattern: 'Circuit Breaker',
        purpose: 'Prevent cascading failures',
        implementation: 'Hystrix/Resilience4j per service',
      },
      {
        pattern: 'Bulkhead',
        purpose: 'Isolate resources',
        implementation: 'Thread pools per dependency',
      },
      {
        pattern: 'Retry',
        purpose: 'Handle transient failures',
        implementation: 'Exponential backoff with jitter',
      },
      {
        pattern: 'Timeout',
        purpose: 'Fail fast',
        implementation: '1s default, configurable per endpoint',
      },
      {
        pattern: 'Fallback',
        purpose: 'Graceful degradation',
        implementation: 'Cached data or default responses',
      },
    ];

    resiliencePatterns.forEach((rp) => {
      console.log(`${rp.pattern}:`);
      console.log(`  Purpose: ${rp.purpose}`);
      console.log(`  Implementation: ${rp.implementation}\n`);
    });

    // Deployment strategy
    console.log('🚀 Deployment Architecture:\n');

    console.log('Container Orchestration:');
    console.log('  • Kubernetes clusters in 3 regions');
    console.log('  • Service mesh (Istio) for traffic management');
    console.log('  • GitOps with Flux/ArgoCD');
    console.log('  • Progressive rollouts with Flagger\n');

    console.log('Scaling Strategy:');
    console.log('  • Horizontal Pod Autoscaler (CPU/memory)');
    console.log('  • Vertical Pod Autoscaler for right-sizing');
    console.log('  • Cluster autoscaling for nodes');
    console.log('  • Predictive scaling for known patterns\n');

    // Monitoring and observability
    console.log('📊 Observability Stack:\n');

    console.log('Metrics: Prometheus + Grafana');
    console.log('  • Service health metrics');
    console.log('  • Business metrics');
    console.log('  • Infrastructure metrics');
    console.log('  • Custom dashboards per service\n');

    console.log('Tracing: Jaeger');
    console.log('  • End-to-end request tracing');
    console.log('  • Service dependency mapping');
    console.log('  • Performance bottleneck detection');
    console.log('  • Error root cause analysis\n');

    console.log('Logging: ELK Stack');
    console.log('  • Centralized log aggregation');
    console.log('  • Structured logging');
    console.log('  • Log correlation with traces');
    console.log('  • Real-time log analysis\n');

    // Best practices
    console.log('📚 Microservices Best Practices:\n');
    console.log('1. Start with a modular monolith, evolve to microservices');
    console.log('2. Define clear service boundaries using DDD');
    console.log('3. Implement comprehensive API versioning');
    console.log('4. Use asynchronous communication when possible');
    console.log('5. Implement distributed tracing from day one');
    console.log('6. Automate everything (deployment, scaling, recovery)');
    console.log('7. Design for failure at every level');
    console.log('8. Keep services stateless for scalability');
    console.log('9. Use service mesh for cross-cutting concerns');
    console.log('10. Maintain service documentation and contracts');
  } catch (error) {
    console.error('❌ Microservices architecture error:', error.message);
  }

  console.log('\n✅ Microservices Architecture Benefits:\n');
  console.log('• Independent deployment and scaling');
  console.log('• Technology diversity per service');
  console.log('• Fault isolation and resilience');
  console.log('• Team autonomy and ownership');
  console.log('• Easier maintenance and updates');
  console.log('• Better resource utilization');
  console.log('• Improved system modularity');
  console.log('• Enhanced development velocity');
}

// Helper function to categorize architectural tasks
function categorizeArchitecturalLayer(task) {
  const description = task.description.toLowerCase();

  if (
    description.includes('boundaries') ||
    description.includes('decomposition')
  ) {
    return 'Foundation';
  } else if (
    description.includes('api') ||
    description.includes('service') ||
    description.includes('event') ||
    description.includes('transaction')
  ) {
    return 'Core Services';
  } else if (
    description.includes('kubernetes') ||
    description.includes('infrastructure') ||
    description.includes('discovery')
  ) {
    return 'Infrastructure';
  } else {
    return 'Operations';
  }
}

// Run the example
if (require.main === module) {
  runMicroservicesArchitectureExample()
    .then(() =>
      console.log('\n✅ Microservices architecture example completed!')
    )
    .catch((error) => console.error('\n❌ Example failed:', error));
}

module.exports = { runMicroservicesArchitectureExample };
