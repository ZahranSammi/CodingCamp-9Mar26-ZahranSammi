/**
 * Integration test for Dashboard controller
 * Verifies that all components initialize correctly on page load
 */

import {
  GreetingComponent,
  FocusTimerComponent,
  TaskListComponent,
  QuickLinksComponent,
  Dashboard
} from '../js/app.js';

describe('Dashboard Controller Integration', () => {
  let dashboard;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset DOM
    document.body.innerHTML = `
      <div class="dashboard">
        <section id="greeting-container" class="component-section"></section>
        <section id="timer-container" class="component-section"></section>
        <section id="tasks-container" class="component-section"></section>
        <section id="links-container" class="component-section"></section>
      </div>
    `;
  });

  afterEach(() => {
    // Clean up any intervals created by components
    if (dashboard) {
      if (dashboard.components.greeting) {
        dashboard.components.greeting.destroy();
      }
      if (dashboard.components.timer) {
        dashboard.components.timer.destroy();
      }
    }
  });

  test('Dashboard class should be defined', () => {
    expect(typeof Dashboard).toBe('function');
  });

  test('Dashboard constructor should initialize components object', () => {
    dashboard = new Dashboard();
    expect(dashboard.components).toBeDefined();
    expect(dashboard.components.greeting).toBeNull();
    expect(dashboard.components.timer).toBeNull();
    expect(dashboard.components.tasks).toBeNull();
    expect(dashboard.components.links).toBeNull();
  });

  test('Dashboard init() should call initializeComponents()', () => {
    dashboard = new Dashboard();
    
    // Verify components are null before init
    expect(dashboard.components.greeting).toBeNull();
    expect(dashboard.components.timer).toBeNull();
    expect(dashboard.components.tasks).toBeNull();
    expect(dashboard.components.links).toBeNull();
    
    // Call init
    dashboard.init();
    
    // Verify components are initialized after init
    expect(dashboard.components.greeting).toBeInstanceOf(GreetingComponent);
    expect(dashboard.components.timer).toBeInstanceOf(FocusTimerComponent);
    expect(dashboard.components.tasks).toBeInstanceOf(TaskListComponent);
    expect(dashboard.components.links).toBeInstanceOf(QuickLinksComponent);
  });

  test('initializeComponents() should instantiate all four components', () => {
    dashboard = new Dashboard();
    dashboard.initializeComponents();

    // Verify all components are instantiated
    expect(dashboard.components.greeting).toBeInstanceOf(GreetingComponent);
    expect(dashboard.components.timer).toBeInstanceOf(FocusTimerComponent);
    expect(dashboard.components.tasks).toBeInstanceOf(TaskListComponent);
    expect(dashboard.components.links).toBeInstanceOf(QuickLinksComponent);
  });

  test('All components should have their DOM rendered after initialization', () => {
    dashboard = new Dashboard();
    dashboard.initializeComponents();

    // Check GreetingComponent rendered
    const greetingContainer = document.getElementById('greeting-container');
    expect(greetingContainer.querySelector('.greeting-component')).toBeTruthy();
    expect(greetingContainer.querySelector('.greeting-message')).toBeTruthy();
    expect(greetingContainer.querySelector('.time-display')).toBeTruthy();
    expect(greetingContainer.querySelector('.date-display')).toBeTruthy();

    // Check FocusTimerComponent rendered
    const timerContainer = document.getElementById('timer-container');
    expect(timerContainer.querySelector('.focus-timer-component')).toBeTruthy();
    expect(timerContainer.querySelector('.timer-display')).toBeTruthy();
    expect(timerContainer.querySelector('.btn-start')).toBeTruthy();

    // Check TaskListComponent rendered
    const tasksContainer = document.getElementById('tasks-container');
    expect(tasksContainer.querySelector('.task-list-component')).toBeTruthy();
    expect(tasksContainer.querySelector('.task-input')).toBeTruthy();
    expect(tasksContainer.querySelector('.task-list')).toBeTruthy();

    // Check QuickLinksComponent rendered
    const linksContainer = document.getElementById('links-container');
    expect(linksContainer.querySelector('.link-input-container')).toBeTruthy();
    expect(linksContainer.querySelector('.links-grid')).toBeTruthy();
  });

  test('Dashboard should handle missing container elements gracefully', () => {
    // Remove all containers
    document.body.innerHTML = '<div class="dashboard"></div>';
    
    dashboard = new Dashboard();
    
    // Should not throw error
    expect(() => dashboard.initializeComponents()).not.toThrow();
    
    // All components should remain null
    expect(dashboard.components.greeting).toBeNull();
    expect(dashboard.components.timer).toBeNull();
    expect(dashboard.components.tasks).toBeNull();
    expect(dashboard.components.links).toBeNull();
  });

  test('Components should load data from localStorage on initialization', () => {
    // Set up some test data in localStorage
    localStorage.setItem('productivity_dashboard_user_name', 'TestUser');
    localStorage.setItem('productivity_dashboard_pomodoro_duration', '30');
    localStorage.setItem('productivity_dashboard_tasks', JSON.stringify([
      { id: 'task_1', text: 'Test Task', completed: false, createdAt: Date.now() }
    ]));
    localStorage.setItem('productivity_dashboard_links', JSON.stringify([
      { id: 'link_1', name: 'Test Link', url: 'https://example.com' }
    ]));

    dashboard = new Dashboard();
    dashboard.initializeComponents();

    // Verify components loaded the data
    expect(dashboard.components.greeting.getUserName()).toBe('TestUser');
    expect(dashboard.components.timer.getDuration()).toBe(30);
    expect(dashboard.components.tasks.tasks.length).toBe(1);
    expect(dashboard.components.links.links.length).toBe(1);
  });
});
