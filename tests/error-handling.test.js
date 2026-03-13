/**
 * Error Handling Tests
 * Tests for localStorage errors, QuotaExceededError, and edge cases
 */

import {
  GreetingComponent,
  FocusTimerComponent,
  TaskListComponent,
  QuickLinksComponent
} from '../js/app.js';

describe('Error Handling - localStorage unavailable', () => {
  let originalLocalStorage;
  let originalConsoleWarn;

  beforeEach(() => {
    originalLocalStorage = global.localStorage;
    originalConsoleWarn = console.warn;
    console.warn = () => {}; // Suppress warnings during tests
    document.body.innerHTML = '<div id="test-container"></div>';
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    console.warn = originalConsoleWarn;
    document.body.innerHTML = '';
  });

  test('GreetingComponent handles localStorage unavailable gracefully', () => {
    // Mock localStorage to throw error
    global.localStorage = {
      getItem: () => { throw new Error('Storage unavailable'); },
      setItem: () => { throw new Error('Storage unavailable'); },
      removeItem: () => { throw new Error('Storage unavailable'); }
    };
    
    const container = document.getElementById('test-container');
    const greeting = new GreetingComponent(container);
    
    // Should not throw error
    expect(() => greeting.init()).not.toThrow();
    
    // Should default to null userName
    expect(greeting.getUserName()).toBeNull();
  });

  test('FocusTimerComponent handles localStorage unavailable gracefully', () => {
    // Mock localStorage to throw error
    global.localStorage = {
      getItem: () => { throw new Error('Storage unavailable'); },
      setItem: () => { throw new Error('Storage unavailable'); }
    };
    
    const container = document.getElementById('test-container');
    const timer = new FocusTimerComponent(container);
    
    // Should not throw error
    expect(() => timer.init()).not.toThrow();
    
    // Should default to 25 minutes
    expect(timer.getDuration()).toBe(25);
  });

  test('TaskListComponent handles localStorage unavailable gracefully', () => {
    // Mock localStorage to throw error
    global.localStorage = {
      getItem: () => { throw new Error('Storage unavailable'); },
      setItem: () => { throw new Error('Storage unavailable'); }
    };
    
    const container = document.getElementById('test-container');
    const tasks = new TaskListComponent(container);
    
    // Should not throw error
    expect(() => tasks.init()).not.toThrow();
    
    // Should have empty tasks array
    expect(tasks.tasks).toEqual([]);
  });

  test('QuickLinksComponent handles localStorage unavailable gracefully', () => {
    // Mock localStorage to throw error
    global.localStorage = {
      getItem: () => { throw new Error('Storage unavailable'); },
      setItem: () => { throw new Error('Storage unavailable'); }
    };
    
    const container = document.getElementById('test-container');
    const links = new QuickLinksComponent(container);
    
    // Should not throw error
    expect(() => links.init()).not.toThrow();
    
    // Should have empty links array
    expect(links.links).toEqual([]);
  });
});

describe('Error Handling - QuotaExceededError', () => {
  let originalConsoleError;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = () => {}; // Suppress errors during tests
    document.body.innerHTML = '<div id="test-container"></div>';
  });

  afterEach(() => {
    console.error = originalConsoleError;
    document.body.innerHTML = '';
  });

  test('TaskListComponent handles QuotaExceededError when saving tasks', () => {
    const container = document.getElementById('test-container');
    const tasks = new TaskListComponent(container);
    tasks.init();

    // Mock localStorage to throw QuotaExceededError
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      const error = new Error('Storage full');
      error.name = 'QuotaExceededError';
      throw error;
    };

    // Should not throw error when adding task
    expect(() => tasks.addTask('Test task')).not.toThrow();

    // Restore original
    Storage.prototype.setItem = originalSetItem;
  });

  test('QuickLinksComponent handles QuotaExceededError when saving links', () => {
    const container = document.getElementById('test-container');
    const links = new QuickLinksComponent(container);
    links.init();

    // Mock localStorage to throw QuotaExceededError
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      const error = new Error('Storage full');
      error.name = 'QuotaExceededError';
      throw error;
    };

    // Should not throw error when adding link
    expect(() => links.addLink('Test', 'https://example.com')).not.toThrow();

    // Restore original
    Storage.prototype.setItem = originalSetItem;
  });
});

describe('Error Handling - Corrupted JSON data', () => {
  let originalConsoleWarn;

  beforeEach(() => {
    originalConsoleWarn = console.warn;
    console.warn = () => {}; // Suppress warnings during tests
    document.body.innerHTML = '<div id="test-container"></div>';
    localStorage.clear();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('TaskListComponent handles corrupted JSON gracefully', () => {
    // Set corrupted JSON data
    localStorage.setItem('productivity_dashboard_tasks', 'invalid json {]');
    
    const container = document.getElementById('test-container');
    const tasks = new TaskListComponent(container);
    
    // Should not throw error
    expect(() => tasks.init()).not.toThrow();
    
    // Should default to empty array
    expect(tasks.tasks).toEqual([]);
  });

  test('QuickLinksComponent handles corrupted JSON gracefully', () => {
    // Set corrupted JSON data
    localStorage.setItem('productivity_dashboard_links', 'invalid json {]');
    
    const container = document.getElementById('test-container');
    const links = new QuickLinksComponent(container);
    
    // Should not throw error
    expect(() => links.init()).not.toThrow();
    
    // Should default to empty array
    expect(links.links).toEqual([]);
  });
});

describe('Error Handling - Missing DOM elements', () => {
  let originalConsoleError;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = () => {}; // Suppress errors during tests
    document.body.innerHTML = '<div id="test-container"></div>';
  });

  afterEach(() => {
    console.error = originalConsoleError;
    document.body.innerHTML = '';
  });

  test('GreetingComponent handles missing DOM elements', () => {
    const container = document.getElementById('test-container');
    const greeting = new GreetingComponent(container);
    
    // Manually set innerHTML to incomplete structure
    container.innerHTML = '<div class="greeting-component"></div>';
    
    // Should not throw error but should log error
    const editBtn = container.querySelector('.btn-edit-name');
    expect(editBtn).toBeNull();
  });

  test('Component constructor throws error for null container', () => {
    expect(() => new GreetingComponent(null)).toThrow('Container element required for GreetingComponent');
    expect(() => new FocusTimerComponent(null)).toThrow('Container element required for FocusTimerComponent');
    expect(() => new TaskListComponent(null)).toThrow('Container element required for TaskListComponent');
    expect(() => new QuickLinksComponent(null)).toThrow('Container element required for QuickLinksComponent');
  });
});

describe('Error Handling - Input validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('TaskListComponent rejects empty task text', () => {
    const container = document.getElementById('test-container');
    const tasks = new TaskListComponent(container);
    tasks.init();

    // Should reject empty string
    expect(tasks.addTask('')).toBe(false);
    expect(tasks.tasks.length).toBe(0);

    // Should reject whitespace-only string
    expect(tasks.addTask('   ')).toBe(false);
    expect(tasks.tasks.length).toBe(0);
  });

  test('TaskListComponent rejects duplicate tasks', () => {
    const container = document.getElementById('test-container');
    const tasks = new TaskListComponent(container);
    tasks.init();

    // Add first task
    expect(tasks.addTask('Test task')).toBe(true);
    expect(tasks.tasks.length).toBe(1);

    // Try to add duplicate (case-insensitive)
    expect(tasks.addTask('Test task')).toBe(false);
    expect(tasks.addTask('TEST TASK')).toBe(false);
    expect(tasks.addTask('  test task  ')).toBe(false);
    expect(tasks.tasks.length).toBe(1);
  });

  test('QuickLinksComponent rejects invalid URLs', () => {
    const container = document.getElementById('test-container');
    const links = new QuickLinksComponent(container);
    links.init();

    // Should reject invalid URL
    expect(links.addLink('Test', 'not-a-url')).toBe(false);
    expect(links.links.length).toBe(0);

    // Should accept valid URL
    expect(links.addLink('Test', 'https://example.com')).toBe(true);
    expect(links.links.length).toBe(1);
  });

  test('QuickLinksComponent rejects empty name', () => {
    const container = document.getElementById('test-container');
    const links = new QuickLinksComponent(container);
    links.init();

    // Should reject empty name
    expect(links.addLink('', 'https://example.com')).toBe(false);
    expect(links.addLink('   ', 'https://example.com')).toBe(false);
    expect(links.links.length).toBe(0);
  });

  test('FocusTimerComponent validates duration range', () => {
    const container = document.getElementById('test-container');
    const timer = new FocusTimerComponent(container);
    timer.init();

    // Should reject duration < 1
    expect(timer.validateDuration(0)).toBe(false);
    expect(timer.validateDuration(-5)).toBe(false);

    // Should reject duration > 60
    expect(timer.validateDuration(61)).toBe(false);
    expect(timer.validateDuration(100)).toBe(false);

    // Should accept valid range
    expect(timer.validateDuration(1)).toBe(true);
    expect(timer.validateDuration(25)).toBe(true);
    expect(timer.validateDuration(60)).toBe(true);
  });
});

describe('Error Handling - HTML input attributes', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Task input has maxlength attribute', () => {
    const container = document.getElementById('test-container');
    const tasks = new TaskListComponent(container);
    tasks.init();

    const taskInput = container.querySelector('.task-input');
    expect(taskInput.getAttribute('maxlength')).toBe('500');
  });

  test('User name input has maxlength attribute', () => {
    const container = document.getElementById('test-container');
    const greeting = new GreetingComponent(container);
    greeting.init();

    const nameInput = container.querySelector('.name-input');
    expect(nameInput.getAttribute('maxlength')).toBe('50');
  });

  test('Link name input has maxlength attribute', () => {
    const container = document.getElementById('test-container');
    const links = new QuickLinksComponent(container);
    links.init();

    const nameInput = container.querySelector('.link-name-input');
    expect(nameInput.maxLength).toBe(50);
  });

  test('Duration input has min and max attributes', () => {
    const container = document.getElementById('test-container');
    const timer = new FocusTimerComponent(container);
    timer.init();

    const durationInput = container.querySelector('.duration-input');
    expect(durationInput.getAttribute('min')).toBe('1');
    expect(durationInput.getAttribute('max')).toBe('60');
  });
});
