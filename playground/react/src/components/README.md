# Enhanced KaibanJS Orchestration UI Components

This directory contains the complete UI suite for KaibanJS intelligent orchestration features. These components provide a comprehensive interface for managing, monitoring, and interacting with AI-driven multi-agent workflows.

## 🧩 Components Overview

### 1. TemplateRepositoryViewer
**File:** `TemplateRepositoryViewer.jsx` + `TemplateRepositoryViewer.css`

**Purpose:** Browse, search, and manage the team's template task repository.

**Features:**
- Search and filter templates by category, complexity, and skills
- Detailed view of task requirements and orchestration rules
- Visual indicators for adaptable vs. fixed tasks
- Statistics and analytics on repository composition
- Action buttons for adding tasks to workflows

**Props:**
- `team` - KaibanJS team instance with availableTemplateTasks
- `onTaskSelect` - Callback when a task is selected for viewing
- `onAddToWorkflow` - Callback when a task is added to workflow

### 2. OrchestratorDecisionPanel
**File:** `OrchestratorDecisionPanel.jsx` + `OrchestratorDecisionPanel.css`

**Purpose:** Real-time visualization of AI orchestrator decision-making process.

**Features:**
- Live stream of orchestrator decisions (task selection, adaptation, generation)
- Decision categorization and filtering
- Confidence scores and impact assessment
- Detailed context and reasoning for each decision
- Auto-scroll and log management

**Props:**
- `team` - KaibanJS team instance
- `isActive` - Boolean indicating if orchestration is currently running

### 3. OrchestrationModeSelector
**File:** `OrchestrationModeSelector.jsx` + `OrchestrationModeSelector.css`

**Purpose:** Select and configure orchestration behavior modes.

**Features:**
- Four orchestration modes: Conservative, Adaptive, Innovative, Learning
- Detailed mode descriptions and characteristics
- Performance profiles and use case recommendations
- Mode comparison table
- Real-time mode switching

**Props:**
- `team` - KaibanJS team instance
- `currentMode` - Currently selected mode
- `onModeChange` - Callback when mode is changed
- `disabled` - Disable mode selection

### 4. ContinuousOrchestrationToggle
**File:** `ContinuousOrchestrationToggle.jsx` + `ContinuousOrchestrationToggle.css`

**Purpose:** Control continuous orchestration settings and monitoring.

**Features:**
- Toggle switch for enabling/disabling continuous orchestration
- Real-time statistics and performance metrics
- Cost impact analysis and configuration options
- Recommendations based on project type
- Detailed benefits and considerations

**Props:**
- `team` - KaibanJS team instance
- `enabled` - Current continuous orchestration state
- `onToggle` - Callback when toggle state changes
- `disabled` - Disable toggle functionality

### 5. EnhancedTaskBoard
**File:** `EnhancedTaskBoard.jsx` + `EnhancedTaskBoard.css`

**Purpose:** Kanban-style task board with orchestration indicators.

**Features:**
- Kanban columns (To Do, In Progress, Review, Blocked, Done)
- Task type indicators (AI Generated, Adapted, Template, Original)
- Expandable task details with orchestration metadata
- Adaptation history and generation information
- Filtering by task type and orchestration status
- Visual complexity and priority badges

**Props:**
- `tasks` - Array of KaibanJS task instances
- `orchestrationEnabled` - Boolean to show/hide orchestration features

### 6. OrchestrationMonitor
**File:** `OrchestrationMonitor.jsx` + `OrchestrationMonitor.css`

**Purpose:** Real-time performance monitoring and system health.

**Features:**
- Performance metrics dashboard (tokens, response times, success rates)
- Historical performance charts and trends
- Real-time activity logs with filtering
- System health monitoring
- Cost tracking and estimation
- Configurable timeframes and auto-refresh

**Props:**
- `team` - KaibanJS team instance
- `isActive` - Boolean indicating if monitoring should be active

## 🚀 Integration Demo

### EnhancedOrchestrationDemo.stories.js
**File:** `EnhancedOrchestrationDemo.stories.js`

**Purpose:** Comprehensive demonstration showcasing all components integrated together.

**Features:**
- Tabbed interface for exploring different aspects
- Mock data generation for realistic demonstrations
- Interactive controls for testing different scenarios
- Complete workflow simulation
- Implementation status overview

## 🎨 Design System

### Color Palette
- **Primary:** `#339af0` (KaibanJS Blue)
- **Success:** `#51cf66` (Green)
- **Warning:** `#ffd43b` (Yellow)
- **Error:** `#ff6b6b` (Red)
- **Secondary:** `#fd7e14` (Orange)
- **Neutral:** `#6c757d` (Gray)

### Typography
- **Primary Font:** System UI (`system-ui, sans-serif`)
- **Monospace:** Monaco, Menlo (for code and metrics)
- **Font Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing Scale
- **Base Unit:** 4px
- **Common Spacings:** 5px, 8px, 10px, 15px, 20px, 25px

### Component Patterns
- **Cards:** White background, 1px border, 6-8px border radius
- **Buttons:** Rounded corners, hover states, disabled states
- **Badges:** Small rounded elements with semantic colors
- **Grid Layouts:** CSS Grid with auto-fit and minmax for responsiveness

## 📱 Responsive Design

All components are designed with mobile-first responsive principles:

- **Desktop:** Full feature set with optimized layouts
- **Tablet:** Adapted layouts with maintained functionality
- **Mobile:** Stacked layouts and touch-friendly interfaces

### Breakpoints
- **Mobile:** `max-width: 480px`
- **Tablet:** `max-width: 768px`
- **Desktop:** `min-width: 769px`

## 🔧 Usage Examples

### Basic Integration
```jsx
import { Team } from 'kaibanjs';
import {
  TemplateRepositoryViewer,
  OrchestratorDecisionPanel,
  OrchestrationModeSelector,
  ContinuousOrchestrationToggle,
  EnhancedTaskBoard,
  OrchestrationMonitor
} from './components';

const MyOrchestrationDashboard = ({ team }) => {
  return (
    <div>
      <OrchestrationModeSelector team={team} />
      <ContinuousOrchestrationToggle team={team} />
      <TemplateRepositoryViewer team={team} />
      <EnhancedTaskBoard tasks={team.getTasks()} />
      <OrchestratorDecisionPanel team={team} />
      <OrchestrationMonitor team={team} />
    </div>
  );
};
```

### Advanced Configuration
```jsx
const [orchestrationMode, setOrchestrationMode] = useState('adaptive');
const [continuousEnabled, setContinuousEnabled] = useState(false);
const [workflowActive, setWorkflowActive] = useState(false);

<OrchestrationModeSelector
  team={team}
  currentMode={orchestrationMode}
  onModeChange={setOrchestrationMode}
  disabled={!team.enableOrchestration}
/>

<ContinuousOrchestrationToggle
  team={team}
  enabled={continuousEnabled}
  onToggle={setContinuousEnabled}
  disabled={!team.enableOrchestration}
/>

<OrchestratorDecisionPanel
  team={team}
  isActive={workflowActive}
/>

<OrchestrationMonitor
  team={team}
  isActive={workflowActive}
/>
```

## 🧪 Testing

### Storybook Integration
All components are integrated with Storybook for isolated development and testing:

```bash
cd playground/react
npm run storybook
```

Navigate to the "Enhanced Orchestration Demo" story to see all components in action.

### Manual Testing Checklist

1. **Template Repository:**
   - [ ] Search functionality works
   - [ ] Filtering by category and complexity
   - [ ] Task expansion shows all details
   - [ ] Action buttons are functional

2. **Decision Panel:**
   - [ ] Real-time decision stream
   - [ ] Filtering by decision type
   - [ ] Auto-scroll functionality
   - [ ] Confidence scores display

3. **Mode Selector:**
   - [ ] All four modes selectable
   - [ ] Detailed information displays
   - [ ] Comparison table accuracy
   - [ ] Disabled state handling

4. **Continuous Toggle:**
   - [ ] Toggle switch functionality
   - [ ] Statistics update in real-time
   - [ ] Configuration options work
   - [ ] Cost impact calculations

5. **Task Board:**
   - [ ] Kanban columns populate correctly
   - [ ] Task type indicators accurate
   - [ ] Orchestration details visible
   - [ ] Filtering works properly

6. **Monitor:**
   - [ ] Performance metrics update
   - [ ] Charts render correctly
   - [ ] Activity logs stream
   - [ ] System health indicators

## 🔮 Future Enhancements

### Planned Features
- **Task Drag & Drop:** Direct manipulation of tasks between columns
- **Advanced Filtering:** More sophisticated search and filter options
- **Export Functionality:** Export configurations and reports
- **Theme Customization:** User-selectable color themes
- **Mobile App:** Native mobile application for monitoring
- **AI Insights:** Predictive analytics and recommendations

### Technical Improvements
- **Virtual Scrolling:** For large datasets in logs and task lists
- **WebSocket Integration:** Real-time updates without polling
- **Offline Support:** Cached data and offline functionality
- **Performance Optimization:** Memoization and React optimization
- **Accessibility:** Enhanced screen reader and keyboard support
- **Internationalization:** Multi-language support

## 📚 Documentation

- **Component API:** Each component includes comprehensive PropTypes/TypeScript definitions
- **Usage Examples:** Real-world usage patterns and best practices
- **Troubleshooting:** Common issues and solutions
- **Performance Guide:** Optimization tips and monitoring

## 🤝 Contributing

When adding new orchestration UI components:

1. Follow the existing design patterns and conventions
2. Include comprehensive CSS for responsive design
3. Add Storybook stories for isolated testing
4. Update this README with component documentation
5. Ensure accessibility compliance (WCAG 2.1 AA)
6. Include error handling and loading states

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Compatibility:** KaibanJS v0.22.0+