# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a client-side web application that provides users with essential productivity tools in a single, clean interface. The application consists of four main components: a greeting display with time/date, a 25-minute focus timer, a task management system, and a quick links panel. All functionality is implemented using vanilla JavaScript, HTML, and CSS with no external dependencies or backend requirements.

The application architecture follows a component-based approach where each major feature (greeting, timer, tasks, links) is encapsulated in its own module with clear responsibilities. Data persistence is handled entirely through the browser's Local Storage API, making the application portable and privacy-focused since no data leaves the user's device.

Key design principles:
- **Simplicity**: Vanilla JavaScript with no frameworks to minimize complexity and load time
- **Modularity**: Each component is self-contained with clear interfaces
- **Persistence**: All user data automatically saves to Local Storage
- **Responsiveness**: UI updates provide immediate feedback to user actions
- **Accessibility**: WCAG AA compliant color contrast and semantic HTML

## Architecture

### High-Level Structure

The application follows a modular architecture with a central controller coordinating independent components:

```
Dashboard (Main Controller)
├── GreetingComponent
│   ├── TimeDisplay
│   └── GreetingMessage
├── FocusTimerComponent
│   ├── TimerDisplay
│   └── TimerControls
├── TaskListComponent
│   ├── TaskInput
│   ├── TaskRenderer
│   └── TaskStorage
└── QuickLinksComponent
    ├── LinkInput
    ├── LinkRenderer
    └── LinkStorage
```

### Component Communication

Components operate independently with minimal coupling:
- Each component manages its own state and DOM updates
- Storage operations are handled within each component
- No direct component-to-component communication required
- The Dashboard controller initializes components on page load

### File Structure

```
productivity-dashboard/
├── index.html          # Single HTML entry point
├── css/
│   └── styles.css      # All application styles
└── js/
    └── app.js          # All application logic
```

## Components and Interfaces

### 1. GreetingComponent

**Responsibility**: Display current time, date, and time-based greeting message with optional user name

**Public Interface**:
```javascript
class GreetingComponent {
  constructor(containerElement)
  init()                    // Initialize and start clock updates
  destroy()                 // Clean up intervals
  setUserName(name)         // Set and save user name
  getUserName()             // Get current user name
}
```

**Internal State**:
- `userName`: String or null (loaded from Local Storage)

**Internal Methods**:
- `updateTime()`: Updates time display every second
- `getGreeting(hour)`: Returns appropriate greeting based on hour (5-11: Morning, 12-16: Afternoon, 17-20: Evening, 21-4: Night)
- `formatGreetingMessage(greeting, userName)`: Formats greeting as "[Greeting], [UserName]!" or just "[Greeting]" if no name
- `formatTime(date)`: Formats time as "h:mm:ss AM/PM"
- `formatDate(date)`: Formats date as "Day, Month Date" (e.g., "Monday, January 15")
- `loadUserName()`: Retrieve user name from Local Storage
- `saveUserName()`: Persist user name to Local Storage

**DOM Structure**:
```html
<div class="greeting-component">
  <div class="greeting-message">Good Morning, John!</div>
  <div class="time-display">10:30:45 AM</div>
  <div class="date-display">Monday, January 15</div>
  <div class="name-edit-container">
    <button class="btn-edit-name">Edit Name</button>
    <input type="text" class="name-input" placeholder="Enter your name" style="display:none">
    <button class="btn-save-name" style="display:none">Save</button>
  </div>
</div>
```

### 2. FocusTimerComponent

**Responsibility**: Provide a configurable countdown timer with start/stop/reset controls

**Public Interface**:
```javascript
class FocusTimerComponent {
  constructor(containerElement)
  init()                    // Initialize timer UI
  destroy()                 // Clean up intervals
  setDuration(minutes)      // Set and save Pomodoro duration (1-60 minutes)
  getDuration()             // Get current Pomodoro duration
}
```

**Internal State**:
- `pomodoroDuration`: Minutes for timer (1-60, default 25, loaded from Local Storage)
- `timeRemaining`: Seconds remaining (initialized to pomodoroDuration * 60)
- `timerState`: 'stopped' | 'running'
- `intervalId`: Reference to setInterval for cleanup

**Internal Methods**:
- `start()`: Begin countdown if stopped
- `stop()`: Pause countdown if running
- `reset()`: Set time to configured pomodoroDuration and stop
- `tick()`: Decrement time by 1 second, stop at 0
- `formatTime(seconds)`: Convert seconds to "MM:SS" format
- `updateDisplay()`: Render current time and button states
- `loadDuration()`: Retrieve Pomodoro duration from Local Storage
- `saveDuration()`: Persist Pomodoro duration to Local Storage
- `validateDuration(minutes)`: Check if duration is between 1-60 minutes

**DOM Structure**:
```html
<div class="focus-timer-component">
  <div class="timer-display">25:00</div>
  <div class="timer-controls">
    <button class="btn-start">Start</button>
    <button class="btn-stop" style="display:none">Stop</button>
    <button class="btn-reset">Reset</button>
  </div>
  <div class="duration-config">
    <label for="duration-input">Duration (minutes):</label>
    <input type="number" id="duration-input" class="duration-input" min="1" max="60" value="25">
    <button class="btn-set-duration">Set</button>
  </div>
</div>
```

### 3. TaskListComponent

**Responsibility**: Manage task CRUD operations with Local Storage persistence and duplicate prevention

**Public Interface**:
```javascript
class TaskListComponent {
  constructor(containerElement)
  init()                    // Load tasks from storage and render
}
```

**Internal State**:
- `tasks`: Array of task objects `[{id, text, completed, createdAt}]`
- `duplicateWarningTimeout`: Reference for clearing warning messages

**Internal Methods**:
- `loadTasks()`: Retrieve tasks from Local Storage
- `saveTasks()`: Persist tasks to Local Storage
- `addTask(text)`: Create new task if text is non-empty and not duplicate
- `isDuplicate(text)`: Check if text matches any incomplete task (case-insensitive, trimmed)
- `showDuplicateWarning()`: Display warning message for duplicate detection
- `hideDuplicateWarning()`: Clear warning message
- `editTask(id, newText)`: Update task text if non-empty
- `toggleTask(id)`: Toggle completion status
- `deleteTask(id)`: Remove task from list
- `renderTasks()`: Update DOM with current task list
- `generateId()`: Create unique task identifier (timestamp-based)

**Data Model**:
```javascript
{
  id: string,           // Unique identifier
  text: string,         // Task description
  completed: boolean,   // Completion status
  createdAt: number     // Timestamp for ordering
}
```

**DOM Structure**:
```html
<div class="task-list-component">
  <div class="task-input-container">
    <input type="text" class="task-input" placeholder="Add a new task...">
    <button class="btn-add-task">Add</button>
    <div class="duplicate-warning" style="display:none">This task already exists!</div>
  </div>
  <ul class="task-list">
    <li class="task-item" data-id="123">
      <input type="checkbox" class="task-checkbox">
      <span class="task-text">Example task</span>
      <button class="btn-edit-task">Edit</button>
      <button class="btn-delete-task">Delete</button>
    </li>
  </ul>
</div>
```

### 4. QuickLinksComponent

**Responsibility**: Manage quick link CRUD operations with Local Storage persistence

**Public Interface**:
```javascript
class QuickLinksComponent {
  constructor(containerElement)
  init()                    // Load links from storage and render
}
```

**Internal State**:
- `links`: Array of link objects `[{id, name, url}]`

**Internal Methods**:
- `loadLinks()`: Retrieve links from Local Storage
- `saveLinks()`: Persist links to Local Storage
- `addLink(name, url)`: Create new link if name and URL are valid
- `deleteLink(id)`: Remove link from panel
- `renderLinks()`: Update DOM with current link list
- `validateUrl(url)`: Check if URL is valid format
- `generateId()`: Create unique link identifier

**Data Model**:
```javascript
{
  id: string,      // Unique identifier
  name: string,    // Display name
  url: string      // Website URL
}
```

**DOM Structure**:
```html
<div class="quick-links-component">
  <div class="link-input-container">
    <input type="text" class="link-name-input" placeholder="Name">
    <input type="url" class="link-url-input" placeholder="URL">
    <button class="btn-add-link">Add Link</button>
  </div>
  <div class="links-grid">
    <div class="link-button" data-id="456">
      <a href="https://example.com" target="_blank">Example</a>
      <button class="btn-delete-link">×</button>
    </div>
  </div>
</div>
```

### 5. Dashboard Controller

**Responsibility**: Initialize application and coordinate components

**Public Interface**:
```javascript
class Dashboard {
  constructor()
  init()                    // Initialize all components on DOMContentLoaded
}
```

**Internal Methods**:
- `initializeComponents()`: Create and initialize all component instances
- `setupEventListeners()`: Attach global event handlers if needed

## Data Models

### User Name Model

```javascript
{
  userName: string | null   // User's custom name for greeting (1-50 chars) or null if not set
}
```

**Validation Rules**:
- `userName`: Can be null (no name set)
- `userName`: If set, must be non-empty after trimming whitespace
- `userName`: Maximum length 50 characters

**Storage Key**: `"productivity_dashboard_user_name"`

**Storage Format**: Plain string (not JSON)

### Pomodoro Duration Model

```javascript
{
  pomodoroDuration: number   // Timer duration in minutes (1-60)
}
```

**Validation Rules**:
- `pomodoroDuration`: Must be an integer between 1 and 60 (inclusive)
- `pomodoroDuration`: Defaults to 25 if not set or invalid

**Storage Key**: `"productivity_dashboard_pomodoro_duration"`

**Storage Format**: Plain number string (not JSON)

### Task Model

```javascript
{
  id: string,           // Format: "task_" + timestamp + random
  text: string,         // User-entered task description (1-500 chars)
  completed: boolean,   // Default: false
  createdAt: number     // Unix timestamp for ordering
}
```

**Validation Rules**:
- `text`: Must be non-empty after trimming whitespace
- `text`: Maximum length 500 characters
- `text`: Must not duplicate any incomplete task (case-insensitive comparison)
- `id`: Must be unique within task list
- `completed`: Boolean only

**Storage Key**: `"productivity_dashboard_tasks"`

**Storage Format**: JSON array of task objects

### Link Model

```javascript
{
  id: string,      // Format: "link_" + timestamp + random
  name: string,    // Display name (1-50 chars)
  url: string      // Valid URL with protocol
}
```

**Validation Rules**:
- `name`: Must be non-empty after trimming whitespace
- `name`: Maximum length 50 characters
- `url`: Must be valid URL format (checked with URL constructor)
- `url`: Must include protocol (http:// or https://)
- `id`: Must be unique within links list

**Storage Key**: `"productivity_dashboard_links"`

**Storage Format**: JSON array of link objects

### Timer State (Not Persisted)

The timer state and current time remaining are intentionally not persisted to Local Storage. Each page load starts with a fresh timer set to the configured Pomodoro duration in stopped state. This design decision ensures users always begin with a clean timer session. However, the Pomodoro duration setting itself IS persisted.

```javascript
{
  timeRemaining: number,    // Seconds (0 to pomodoroDuration * 60)
  timerState: string,       // "stopped" | "running"
  intervalId: number | null // setInterval reference
}
```

### Local Storage Schema

```javascript
// Storage keys
const STORAGE_KEYS = {
  USER_NAME: "productivity_dashboard_user_name",
  POMODORO_DURATION: "productivity_dashboard_pomodoro_duration",
  TASKS: "productivity_dashboard_tasks",
  LINKS: "productivity_dashboard_links"
};

// Example stored data
localStorage.getItem(STORAGE_KEYS.USER_NAME)
// Returns: "John" (plain string, not JSON)

localStorage.getItem(STORAGE_KEYS.POMODORO_DURATION)
// Returns: "25" (plain number string, not JSON)

localStorage.getItem(STORAGE_KEYS.TASKS)
// Returns: '[{"id":"task_1234","text":"Complete design","completed":false,"createdAt":1234567890}]'

localStorage.getItem(STORAGE_KEYS.LINKS)
// Returns: '[{"id":"link_5678","name":"GitHub","url":"https://github.com"}]'
```

**Storage Operations**:
- Task and link arrays use `JSON.stringify()` before storing and `JSON.parse()` after retrieving
- User name and Pomodoro duration are stored as plain strings
- Failed parse operations default to empty array `[]` for tasks/links
- Missing user name defaults to `null`
- Missing or invalid Pomodoro duration defaults to `25`
- Storage operations are synchronous (Local Storage API is synchronous)


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Time Format Validity

For any Date object, the time formatting function should produce a string in valid 12-hour format with AM/PM indicator (format: "h:mm:ss AM" or "h:mm:ss PM").

**Validates: Requirements 1.1**

### Property 2: Date Format Completeness

For any Date object, the date formatting function should produce a string containing the day of week, month name, and day number.

**Validates: Requirements 1.2**

### Property 3: Greeting Based on Time Range

For any hour value (0-23), the greeting function should return:
- "Good Morning" for hours 5-11
- "Good Afternoon" for hours 12-16
- "Good Evening" for hours 17-20
- "Good Night" for hours 21-23 and 0-4

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: User Name in Greeting Format

For any non-empty user name and any time-based greeting, the formatted greeting message should follow the pattern "[Greeting], [UserName]!" (e.g., "Good Morning, John!").

**Validates: Requirements 3.1, 3.6**

### Property 5: User Name Storage Round-Trip

For any valid user name string, saving to Local Storage and then loading should produce the same user name value.

**Validates: Requirements 3.4, 3.5**

### Property 6: Timer Start from Stopped State

For any timer with stopped state and any valid time remaining (0 to pomodoroDuration * 60 seconds), calling start should transition the timer to running state and preserve the time remaining.

**Validates: Requirements 4.2**

### Property 7: Pomodoro Duration Validation

For any integer value, the duration validation function should accept values between 1 and 60 (inclusive) and reject all other values.

**Validates: Requirements 5.2**

### Property 8: Pomodoro Duration Storage Round-Trip

For any valid Pomodoro duration (1-60 minutes), saving to Local Storage and then loading should produce the same duration value.

**Validates: Requirements 5.3, 5.4**

### Property 9: Timer Reset to Configured Duration

For any timer state (running or stopped) with any time remaining and any configured Pomodoro duration, calling reset should set time remaining to the configured duration in seconds and state to stopped.

**Validates: Requirements 5.5, 6.2**

### Property 10: Duration Change Only When Stopped

For any timer in running state, attempts to change the Pomodoro duration should be rejected. For any timer in stopped state, duration changes should be accepted.

**Validates: Requirements 5.6**

### Property 11: Timer Tick Decrements Time

For any timer in running state with time remaining > 0, calling tick should decrement the time remaining by exactly 1 second.

**Validates: Requirements 4.3**

### Property 12: Timer Format Validity

For any number of seconds (0 to 3600), the timer formatting function should produce a string in valid MM:SS format where MM is 00-60 and SS is 00-59.

**Validates: Requirements 4.5**

### Property 13: Timer Stop Preserves Time

For any timer in running state with any time remaining, calling stop should transition to stopped state and preserve the exact time remaining.

**Validates: Requirements 6.1**

### Property 14: Timer Button Display Matches State

For any timer state, the rendered UI should display the start button when state is stopped and the stop button when state is running (never both simultaneously).

**Validates: Requirements 6.3, 6.4**

### Property 15: Valid Task Creation

For any non-empty, non-whitespace string, calling addTask should create a new task with that text, completed status set to false, a unique ID, and a createdAt timestamp.

**Validates: Requirements 5.2**

### Property 11: Task List Ordering Preservation

For any sequence of task additions, the task list should maintain the order in which tasks were created (ordered by createdAt timestamp ascending).

**Validates: Requirements 5.4**

### Property 12: Empty Task Rejection

For any string composed entirely of whitespace characters (spaces, tabs, newlines) or empty string, calling addTask should reject the submission and leave the task list unchanged.

**Validates: Requirements 5.5**

### Property 13: Task Rendering Completeness

For any task in the task list, the rendered HTML should include a completion control, edit control, delete control, and the task text.

**Validates: Requirements 6.1, 7.1, 8.1**

### Property 14: Valid Task Edit

For any existing task and any non-empty, non-whitespace string, calling editTask should update the task's text to the new value while preserving the task's ID, completed status, and createdAt timestamp.

**Validates: Requirements 6.3**

### Property 15: Empty Task Edit Rejection

For any existing task and any string composed entirely of whitespace or empty string, calling editTask should reject the update and preserve the original task text unchanged.

**Validates: Requirements 6.4**

### Property 16: Task Completion Toggle

For any task, calling toggleTask should flip the completed status (false to true, or true to false) while preserving all other task properties.

**Validates: Requirements 7.2, 7.3**

### Property 17: Task Visual Distinction

For any task, the rendered HTML should apply different CSS classes or styling based on the completed status, ensuring visual distinction between complete and incomplete tasks.

**Validates: Requirements 7.4**

### Property 18: Task Deletion Removes Task

For any task list and any task ID in that list, calling deleteTask should remove the task with that ID from the list, and the task should not appear in subsequent renders.

**Validates: Requirements 8.2, 8.3**

### Property 19: Task Storage Persistence

For any task list operation (add, edit, toggle, delete), the operation should trigger a save to Local Storage, and the stored data should match the current task list state.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 20: Task Storage Round-Trip

For any array of valid tasks, saving to Local Storage and then loading should produce an equivalent task list with all tasks having the same IDs, text, completed status, and createdAt values.

**Validates: Requirements 9.5**

### Property 21: Invalid Link Rejection

For any link addition attempt with missing name, missing URL, or invalid URL format, calling addLink should reject the submission and leave the links list unchanged.

**Validates: Requirements 10.2**

### Property 22: Link Rendering Completeness

For any link in the links list, the rendered HTML should include an anchor element with href set to the link's URL, target="_blank", the link's name as text, and a delete control.

**Validates: Requirements 10.3, 10.4**

### Property 23: Link Deletion Removes Link

For any links list and any link ID in that list, calling deleteLink should remove the link with that ID from the list, and the link should not appear in subsequent renders.

**Validates: Requirements 10.5**

### Property 24: Link Storage Persistence

For any link list operation (add, delete), the operation should trigger a save to Local Storage, and the stored data should match the current links list state.

**Validates: Requirements 11.1, 11.2**

### Property 25: Link Storage Round-Trip

For any array of valid links, saving to Local Storage and then loading should produce an equivalent links list with all links having the same IDs, names, and URLs.

**Validates: Requirements 11.3**

## Error Handling

### Input Validation Errors

**Empty Task/Link Input**:
- Trigger: User submits empty or whitespace-only text
- Handling: Silently reject submission, maintain current state, no error message needed (form validation prevents submission)
- Recovery: User can immediately try again with valid input

**Invalid URL Format**:
- Trigger: User enters malformed URL for quick link
- Handling: Use try-catch around `new URL()` constructor, reject invalid URLs
- Recovery: Display inline error message "Please enter a valid URL", clear on next input

**Maximum Length Exceeded**:
- Trigger: Task text > 500 chars or link name > 50 chars
- Handling: Truncate input at maximum length using `maxlength` attribute on input fields
- Recovery: Automatic, user sees character limit enforced in real-time

### Storage Errors

**Local Storage Full**:
- Trigger: `localStorage.setItem()` throws QuotaExceededError
- Handling: Catch exception, display error message "Storage full. Please delete some items."
- Recovery: User must delete tasks or links to free space

**Local Storage Unavailable**:
- Trigger: Private browsing mode or storage disabled
- Handling: Catch exception on first storage access, display warning "Storage unavailable. Data will not persist."
- Recovery: Application continues to function without persistence

**JSON Parse Errors**:
- Trigger: Corrupted data in Local Storage
- Handling: Catch JSON.parse() exceptions, default to empty array `[]`
- Recovery: Automatic, user starts with empty list (corrupted data is lost)

### Timer Edge Cases

**Timer at Zero**:
- Trigger: Timer reaches 0:00
- Handling: Automatically stop timer, keep display at 0:00
- Recovery: User can reset to start new session

**Rapid Button Clicks**:
- Trigger: User clicks start/stop/reset multiple times quickly
- Handling: Debounce not needed (operations are idempotent), state transitions handle repeated calls safely
- Recovery: Automatic, final state is consistent

### Component Initialization Errors

**Missing DOM Elements**:
- Trigger: Component constructor receives null/undefined container element
- Handling: Throw descriptive error immediately: "Container element required for [ComponentName]"
- Recovery: Developer fix required (this is a programming error)

**Duplicate Initialization**:
- Trigger: Component init() called multiple times
- Handling: Check initialization flag, return early if already initialized
- Recovery: Automatic, no side effects from duplicate calls

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific examples and edge cases with property-based tests for comprehensive validation of universal properties. This ensures both concrete correctness and general robustness across all possible inputs.

### Unit Testing

**Framework**: No external framework required - use browser's native testing capabilities or simple assertion functions

**Focus Areas**:
- Specific examples demonstrating correct behavior
- Edge cases (timer at zero, empty lists, boundary values)
- Error conditions (invalid inputs, storage failures)
- Component initialization and cleanup

**Example Unit Tests**:
- Timer initializes to 25:00
- Empty task list displays correctly
- Adding first task to empty list works
- Deleting last task leaves empty list
- URL validation rejects "not-a-url"
- Storage quota exceeded is handled gracefully

### Property-Based Testing

**Framework**: Use **fast-check** library for JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with comment referencing design property
- Tag format: `// Feature: productivity-dashboard, Property N: [property text]`

**Property Test Implementation**:

Each of the 25 correctness properties defined above must be implemented as a single property-based test. The test should:
1. Generate random valid inputs using fast-check arbitraries
2. Execute the operation under test
3. Assert the property holds for all generated inputs
4. Reference the design document property in a comment

**Example Property Test Structure**:
```javascript
// Feature: productivity-dashboard, Property 3: Greeting Based on Time Range
fc.assert(
  fc.property(
    fc.integer({min: 0, max: 23}), // Generate random hour
    (hour) => {
      const greeting = getGreeting(hour);
      if (hour >= 5 && hour <= 11) {
        return greeting === "Good Morning";
      } else if (hour >= 12 && hour <= 16) {
        return greeting === "Good Afternoon";
      } else if (hour >= 17 && hour <= 20) {
        return greeting === "Good Evening";
      } else {
        return greeting === "Good Night";
      }
    }
  ),
  { numRuns: 100 }
);
```

**Arbitrary Generators Needed**:
- Random dates/times
- Random non-empty strings (1-500 chars for tasks, 1-50 for link names)
- Random whitespace-only strings
- Random valid URLs
- Random task objects
- Random link objects
- Random timer states (stopped/running with various time remaining)
- Random task lists (0-100 tasks)
- Random link lists (0-50 links)

### Testing Balance

- Unit tests: ~20-30 tests covering examples, edge cases, and error conditions
- Property tests: 25 tests (one per correctness property)
- Together: Comprehensive coverage without redundancy
- Unit tests catch concrete bugs, property tests verify general correctness
- Avoid writing many similar unit tests - let property tests handle input variation

### Browser Compatibility Testing

**Manual Testing Required**:
- Test in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Verify Local Storage works in each browser
- Check timer accuracy and UI responsiveness
- Validate CSS rendering and layout
- Test with browser DevTools for console errors

**Automated Compatibility**:
- Use Babel if needed to transpile modern JavaScript features
- Avoid browser-specific APIs
- Use standard DOM APIs and CSS properties
- Test with BrowserStack or similar for cross-browser validation

### Performance Testing

**Load Time**:
- Measure initial page load with browser DevTools Performance tab
- Target: < 1 second on standard connection
- Optimize: Minimize CSS/JS file sizes, avoid render-blocking resources

**Interaction Responsiveness**:
- Measure time from click to UI update using Performance API
- Target: < 100ms for all interactions
- Optimize: Minimize DOM manipulation, use efficient selectors

**Storage Performance**:
- Measure localStorage read/write times with large datasets
- Target: < 200ms for retrieval operations
- Optimize: Minimize parse/stringify operations, batch updates if needed

### Test Organization

```
productivity-dashboard/
├── tests/
│   ├── unit/
│   │   ├── greeting.test.js
│   │   ├── timer.test.js
│   │   ├── tasks.test.js
│   │   └── links.test.js
│   └── properties/
│       ├── greeting.properties.js
│       ├── timer.properties.js
│       ├── tasks.properties.js
│       └── links.properties.js
```

### Continuous Testing

- Run unit tests on every code change
- Run property tests before commits
- Run full test suite including browser compatibility tests before releases
- Monitor for flaky tests (especially timing-related tests)
- Keep test execution time under 30 seconds for rapid feedback
