# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a standalone productivity dashboard web application using vanilla JavaScript, HTML, and CSS. The implementation follows a component-based architecture with four main components (Greeting, Focus Timer, Task List, Quick Links) coordinated by a Dashboard controller. All data persists to browser Local Storage with no backend required.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create index.html with semantic HTML structure and component containers
  - Create css/ folder and empty styles.css file
  - Create js/ folder and empty app.js file
  - Link CSS and JS files in index.html with proper loading order
  - Add meta tags for viewport and character encoding
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 2. Implement GreetingComponent
  - [x] 2.1 Create GreetingComponent class with time and date display logic
    - Implement constructor accepting container element
    - Implement init() method to start clock updates
    - Implement updateTime() to refresh display every second
    - Implement formatTime() for 12-hour format with AM/PM
    - Implement formatDate() for "Day, Month Date" format
    - Implement getGreeting() with time-based logic (5-11: Morning, 12-16: Afternoon, 17-20: Evening, 21-4: Night)
    - Implement destroy() to clean up intervals
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_
  
  - [x] 2.2 Add custom user name feature to GreetingComponent
    - Implement setUserName(name) to set and save user name
    - Implement getUserName() to retrieve current user name
    - Implement loadUserName() to retrieve from Local Storage
    - Implement saveUserName() to persist to Local Storage
    - Implement formatGreetingMessage() to format as "[Greeting], [UserName]!" or just "[Greeting]"
    - Add UI controls for editing and saving user name
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 2.3 Write property test for time format validity
    - **Property 1: Time Format Validity**
    - **Validates: Requirements 1.1**
  
  - [x] 2.4 Write property test for date format completeness
    - **Property 2: Date Format Completeness**
    - **Validates: Requirements 1.2**
  
  - [x] 2.5 Write property test for greeting based on time range
    - **Property 3: Greeting Based on Time Range**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  
  - [x] 2.6 Write property test for user name in greeting format
    - **Property 4: User Name in Greeting Format**
    - **Validates: Requirements 3.1, 3.6**
  
  - [x] 2.7 Write property test for user name storage round-trip
    - **Property 5: User Name Storage Round-Trip**
    - **Validates: Requirements 3.4, 3.5**

- [x] 3. Implement FocusTimerComponent
  - [x] 3.1 Create FocusTimerComponent class with timer state management
    - Implement constructor with container element and initial state (default 25 minutes from storage, stopped)
    - Implement init() to render initial UI
    - Implement start() to begin countdown from current time
    - Implement stop() to pause countdown
    - Implement reset() to set time to configured Pomodoro duration and stop
    - Implement tick() to decrement time by 1 second and auto-stop at zero
    - Implement formatTime() to convert seconds to MM:SS format
    - Implement updateDisplay() to render time and button states
    - Implement destroy() to clean up intervals
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 3.2 Add configurable Pomodoro duration feature
    - Implement setDuration(minutes) to set and save Pomodoro duration (1-60 minutes)
    - Implement getDuration() to retrieve current duration
    - Implement loadDuration() to retrieve from Local Storage (default 25)
    - Implement saveDuration() to persist to Local Storage
    - Implement validateDuration(minutes) to check 1-60 range
    - Add UI controls for setting duration (only when timer is stopped)
    - Update reset() to use configured duration instead of hardcoded 25 minutes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 3.3 Write property test for timer start from stopped state
    - **Property 6: Timer Start from Stopped State**
    - **Validates: Requirements 4.2**
  
  - [x] 3.4 Write property test for Pomodoro duration validation
    - **Property 7: Pomodoro Duration Validation**
    - **Validates: Requirements 5.2**
  
  - [x] 3.5 Write property test for Pomodoro duration storage round-trip
    - **Property 8: Pomodoro Duration Storage Round-Trip**
    - **Validates: Requirements 5.3, 5.4**
  
  - [x] 3.6 Write property test for timer tick decrements time
    - **Property 9: Timer Tick Decrements Time**
    - **Validates: Requirements 4.3**
  
  - [x] 3.7 Write property test for timer format validity
    - **Property 10: Timer Format Validity**
    - **Validates: Requirements 4.5**
  
  - [x] 3.8 Write property test for timer stop preserves time
    - **Property 11: Timer Stop Preserves Time**
    - **Validates: Requirements 6.1**
  
  - [x] 3.9 Write property test for timer reset to configured duration
    - **Property 12: Timer Reset to Configured Duration**
    - **Validates: Requirements 5.5, 6.2**
  
  - [x] 3.10 Write property test for timer button display matches state
    - **Property 13: Timer Button Display Matches State**
    - **Validates: Requirements 6.3, 6.4**

- [x] 4. Checkpoint - Verify greeting and timer components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement TaskListComponent data model and storage
  - [x] 5.1 Create TaskListComponent class with task data structure
    - Implement constructor with container element and empty tasks array
    - Implement generateId() for unique task identifiers (timestamp-based)
    - Define task model: {id, text, completed, createdAt}
    - Implement loadTasks() to retrieve from localStorage with JSON.parse
    - Implement saveTasks() to persist to localStorage with JSON.stringify
    - Handle JSON parse errors by defaulting to empty array
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 5.2 Write property test for task storage persistence
    - **Property 22: Task Storage Persistence**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
  
  - [x] 5.3 Write property test for task storage round-trip
    - **Property 23: Task Storage Round-Trip**
    - **Validates: Requirements 12.5**

- [x] 6. Implement TaskListComponent CRUD operations
  - [x] 6.1 Implement task creation and validation
    - Implement addTask(text) to create task with trimmed non-empty text
    - Reject empty or whitespace-only text
    - Set completed to false and createdAt to current timestamp
    - Call saveTasks() after adding
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 6.2 Add duplicate task prevention
    - Implement isDuplicate(text) to check against incomplete tasks (case-insensitive, trimmed)
    - Update addTask() to reject duplicates and show warning message
    - Implement showDuplicateWarning() to display warning
    - Implement hideDuplicateWarning() to clear warning after timeout
    - Only check duplicates against incomplete tasks (allow re-adding completed tasks)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 6.3 Implement task editing and deletion
    - Implement editTask(id, newText) to update task text if non-empty
    - Reject empty or whitespace-only edits
    - Implement toggleTask(id) to flip completed status
    - Implement deleteTask(id) to remove task from array
    - Call saveTasks() after each operation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 11.1, 11.2, 11.3_
  
  - [x] 6.4 Write property test for valid task creation
    - **Property 14: Valid Task Creation**
    - **Validates: Requirements 7.2**
  
  - [x] 6.5 Write property test for task list ordering preservation
    - **Property 15: Task List Ordering Preservation**
    - **Validates: Requirements 7.4**
  
  - [x] 6.6 Write property test for empty task rejection
    - **Property 16: Empty Task Rejection**
    - **Validates: Requirements 7.5**
  
  - [x] 6.7 Write property test for duplicate task detection
    - **Property 17: Duplicate Task Detection**
    - **Validates: Requirements 8.1, 8.2**
  
  - [x] 6.8 Write property test for duplicate check ignores completed tasks
    - **Property 18: Duplicate Check Ignores Completed Tasks**
    - **Validates: Requirements 8.3, 8.4**
  
  - [x] 6.9 Write property test for valid task edit
    - **Property 19: Valid Task Edit**
    - **Validates: Requirements 9.3**
  
  - [x] 6.10 Write property test for empty task edit rejection
    - **Property 20: Empty Task Edit Rejection**
    - **Validates: Requirements 9.4**
  
  - [x] 6.11 Write property test for task completion toggle
    - **Property 21: Task Completion Toggle**
    - **Validates: Requirements 10.2, 10.3**
  
  - [x] 6.12 Write property test for task deletion removes task
    - **Property 24: Task Deletion Removes Task**
    - **Validates: Requirements 11.2, 11.3**

- [x] 7. Implement TaskListComponent UI rendering
  - [x] 7.1 Create task list rendering and event handlers
    - Implement renderTasks() to generate task list HTML
    - Create task input field with "Add" button
    - Add duplicate warning message element (hidden by default)
    - Render each task with checkbox, text, edit button, delete button
    - Apply different CSS classes for completed vs incomplete tasks
    - Attach event listeners for add, edit, toggle, delete actions
    - Implement init() to load tasks and render initial UI
    - _Requirements: 7.1, 7.3, 7.4, 9.1, 9.2, 10.1, 10.4, 11.1_
  
  - [x] 7.2 Write property test for task rendering completeness
    - **Property 25: Task Rendering Completeness**
    - **Validates: Requirements 9.1, 10.1, 11.1**
  
  - [x] 7.3 Write property test for task visual distinction
    - **Property 26: Task Visual Distinction**
    - **Validates: Requirements 10.4**

- [x] 8. Implement QuickLinksComponent data model and storage
  - [x] 8.1 Create QuickLinksComponent class with link data structure
    - Implement constructor with container element and empty links array
    - Implement generateId() for unique link identifiers
    - Define link model: {id, name, url}
    - Implement loadLinks() to retrieve from localStorage with JSON.parse
    - Implement saveLinks() to persist to localStorage with JSON.stringify
    - Handle JSON parse errors by defaulting to empty array
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [x] 8.2 Write property test for link storage persistence
    - **Property 27: Link Storage Persistence**
    - **Validates: Requirements 14.1, 14.2**
  
  - [x] 8.3 Write property test for link storage round-trip
    - **Property 28: Link Storage Round-Trip**
    - **Validates: Requirements 14.3**

- [x] 9. Implement QuickLinksComponent CRUD operations and UI
  - [x] 9.1 Implement link creation, validation, and deletion
    - Implement validateUrl(url) using URL constructor with try-catch
    - Implement addLink(name, url) to create link with non-empty name and valid URL
    - Reject invalid URLs or empty names
    - Implement deleteLink(id) to remove link from array
    - Call saveLinks() after each operation
    - _Requirements: 13.1, 13.2, 13.4, 13.5_
  
  - [x] 9.2 Create quick links rendering and event handlers
    - Implement renderLinks() to generate links grid HTML
    - Create input fields for name and URL with "Add Link" button
    - Render each link as anchor with target="_blank" and delete button
    - Attach event listeners for add and delete actions
    - Implement init() to load links and render initial UI
    - _Requirements: 13.1, 13.3, 13.4, 13.5_
  
  - [x] 9.3 Write property test for invalid link rejection
    - **Property 29: Invalid Link Rejection**
    - **Validates: Requirements 13.2**
  
  - [x] 9.4 Write property test for link rendering completeness
    - **Property 30: Link Rendering Completeness**
    - **Validates: Requirements 13.3, 13.4**
  
  - [x] 9.5 Write property test for link deletion removes link
    - **Property 31: Link Deletion Removes Link**
    - **Validates: Requirements 13.5**

- [x] 10. Checkpoint - Verify task and link components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement Dashboard controller and component integration
  - Create Dashboard class with constructor and init() method
  - Implement initializeComponents() to instantiate all four components
  - Attach DOMContentLoaded event listener to call Dashboard.init()
  - Verify all components initialize correctly on page load
  - _Requirements: 15.4_

- [x] 12. Implement CSS styling for all components
  - [x] 12.1 Create base styles and layout
    - Define CSS variables for colors, spacing, and typography
    - Implement responsive grid layout for dashboard components
    - Style body with minimal design and clear visual hierarchy
    - Ensure WCAG AA color contrast ratios for all text
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 12.2 Style GreetingComponent
    - Style greeting message, time display, and date display
    - Style name edit controls (edit button, input field, save button)
    - Apply appropriate font sizes and spacing
    - Center align greeting section
  
  - [x] 12.3 Style FocusTimerComponent
    - Style timer display with large, readable font
    - Style start, stop, and reset buttons with clear visual states
    - Style duration configuration controls (input and set button)
    - Add hover and active states for buttons
  
  - [x] 12.4 Style TaskListComponent
    - Style task input field and add button
    - Style duplicate warning message (hidden by default, visible on error)
    - Style task list items with checkbox, text, and action buttons
    - Apply strikethrough or opacity for completed tasks
    - Style edit and delete buttons
  
  - [x] 12.5 Style QuickLinksComponent
    - Style link input fields and add button
    - Create grid layout for link buttons
    - Style link buttons with hover effects
    - Style delete buttons for links

- [x] 13. Implement error handling and edge cases
  - Add try-catch blocks around localStorage operations
  - Handle QuotaExceededError with user-friendly message
  - Handle localStorage unavailable (private browsing) with warning
  - Add maxlength attributes to input fields (500 for tasks, 50 for link names and user name)
  - Add min/max attributes to duration input (1-60)
  - Implement debouncing for rapid button clicks if needed
  - Add null checks for DOM element references
  - _Requirements: 17.2, 17.3_

- [x] 14. Implement performance optimizations
  - Minimize DOM manipulation by batching updates
  - Use efficient CSS selectors and avoid layout thrashing
  - Ensure localStorage operations don't block UI
  - Optimize initial page load time
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 15. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Browser compatibility testing
  - Test in Chrome 90+ for full functionality
  - Test in Firefox 88+ for full functionality
  - Test in Edge 90+ for full functionality
  - Test in Safari 14+ for full functionality
  - Verify localStorage works in all browsers
  - Check for console errors in each browser
  - Validate CSS rendering and layout consistency
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All 31 correctness properties from the design document have corresponding property test tasks
- Property tests should use fast-check library with minimum 100 iterations
- Each property test must include a comment referencing the property number and requirements
- Testing tasks are sub-tasks under their related implementation tasks for early error detection
- Checkpoints ensure incremental validation at reasonable breaks
- Browser compatibility testing is marked optional as it requires manual testing across multiple browsers
- All code uses vanilla JavaScript with no external frameworks (except fast-check for property testing)
- New features added: Custom user name in greeting, configurable Pomodoro duration (1-60 minutes), and duplicate task prevention
