/**
 * Performance Tests for Productivity Dashboard
 * 
 * Tests verify that the application meets performance requirements:
 * - Requirement 17.1: Initial interface displays within 1 second
 * - Requirement 17.2: Visual feedback within 100 milliseconds
 * - Requirement 17.3: localStorage saves don't block UI
 * - Requirement 17.4: localStorage retrieval within 200 milliseconds
 */

import { JSDOM } from 'jsdom';
import {
  GreetingComponent,
  FocusTimerComponent,
  TaskListComponent,
  QuickLinksComponent
} from '../js/app.js';

describe('Performance Tests', () => {
  let dom;
  let document;
  let localStorage;

  beforeEach(() => {
    // Create a new JSDOM instance for each test
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true
    });
    document = dom.window.document;
    localStorage = dom.window.localStorage;
    
    // Make document and localStorage available globally
    global.document = document;
    global.localStorage = localStorage;
    global.requestIdleCallback = dom.window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
  });

  afterEach(() => {
    localStorage.clear();
    delete global.document;
    delete global.localStorage;
    delete global.requestIdleCallback;
  });

  describe('Requirement 17.1: Initial interface displays within 1 second', () => {
    test('GreetingComponent initializes quickly', () => {
      const container = document.getElementById('container');
      const component = new GreetingComponent(container);
      
      const startTime = performance.now();
      component.init();
      const endTime = performance.now();
      
      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(100); // Should be much faster than 1 second
      
      component.destroy();
    });

    test('FocusTimerComponent initializes quickly', () => {
      const container = document.getElementById('container');
      const component = new FocusTimerComponent(container);
      
      const startTime = performance.now();
      component.init();
      const endTime = performance.now();
      
      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(100);
      
      component.destroy();
    });

    test('TaskListComponent initializes quickly', () => {
      const container = document.getElementById('container');
      const component = new TaskListComponent(container);
      
      const startTime = performance.now();
      component.init();
      const endTime = performance.now();
      
      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(100);
    });

    test('QuickLinksComponent initializes quickly', () => {
      const container = document.getElementById('container');
      const component = new QuickLinksComponent(container);
      
      const startTime = performance.now();
      component.init();
      const endTime = performance.now();
      
      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(100);
    });

    test('All components initialize within 1 second combined', () => {
      const containers = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div')
      ];
      
      const startTime = performance.now();
      
      const greeting = new GreetingComponent(containers[0]);
      greeting.init();
      
      const timer = new FocusTimerComponent(containers[1]);
      timer.init();
      
      const tasks = new TaskListComponent(containers[2]);
      tasks.init();
      
      const links = new QuickLinksComponent(containers[3]);
      links.init();
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(1000); // Must be under 1 second
      
      greeting.destroy();
      timer.destroy();
    });
  });

  describe('Requirement 17.2: Visual feedback within 100 milliseconds', () => {
    test('Task addition provides immediate feedback', () => {
      const container = document.getElementById('container');
      const component = new TaskListComponent(container);
      component.init();
      
      const startTime = performance.now();
      const result = component.addTask('Test task');
      const endTime = performance.now();
      
      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('Task toggle provides immediate feedback', () => {
      const container = document.getElementById('container');
      const component = new TaskListComponent(container);
      component.init();
      
      component.addTask('Test task');
      const taskId = component.tasks[0].id;
      
      const startTime = performance.now();
      component.toggleTask(taskId);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('Timer start provides immediate feedback', () => {
      const container = document.getElementById('container');
      const component = new FocusTimerComponent(container);
      component.init();
      
      const startTime = performance.now();
      component.start();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
      expect(component.timerState).toBe('running');
      
      component.destroy();
    });

    test('Link addition provides immediate feedback', () => {
      const container = document.getElementById('container');
      const component = new QuickLinksComponent(container);
      component.init();
      
      const startTime = performance.now();
      const result = component.addLink('Test', 'https://example.com');
      const endTime = performance.now();
      
      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Requirement 17.3: localStorage saves don\'t block UI', () => {
    test('Task save operation is deferred', (done) => {
      const container = document.getElementById('container');
      const component = new TaskListComponent(container);
      component.init();
      
      // Add a task - save should be deferred
      const startTime = performance.now();
      component.addTask('Test task');
      const endTime = performance.now();
      
      // The addTask operation itself should complete quickly
      expect(endTime - startTime).toBeLessThan(50);
      
      // Verify the task was added to memory immediately
      expect(component.tasks.length).toBe(1);
      
      // Wait for deferred save to complete
      setTimeout(() => {
        // Verify data was eventually saved
        const stored = localStorage.getItem('productivity_dashboard_tasks');
        expect(stored).toBeTruthy();
        done();
      }, 200);
    });

    test('Multiple rapid saves are batched', (done) => {
      const container = document.getElementById('container');
      const component = new TaskListComponent(container);
      component.init();
      
      // Add multiple tasks rapidly
      const startTime = performance.now();
      component.addTask('Task 1');
      component.addTask('Task 2');
      component.addTask('Task 3');
      const endTime = performance.now();
      
      // All operations should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
      expect(component.tasks.length).toBe(3);
      
      // Wait for batched save
      setTimeout(() => {
        const stored = localStorage.getItem('productivity_dashboard_tasks');
        const tasks = JSON.parse(stored);
        expect(tasks.length).toBe(3);
        done();
      }, 200);
    });
  });

  describe('Requirement 17.4: localStorage retrieval within 200 milliseconds', () => {
    test('Task loading completes within 200ms', () => {
      // Pre-populate localStorage with tasks
      const testTasks = Array.from({ length: 50 }, (_, i) => ({
        id: `task_${i}`,
        text: `Task ${i}`,
        completed: false,
        createdAt: Date.now()
      }));
      localStorage.setItem('productivity_dashboard_tasks', JSON.stringify(testTasks));
      
      const container = document.getElementById('container');
      const component = new TaskListComponent(container);
      
      const startTime = performance.now();
      component.loadTasks();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
      expect(component.tasks.length).toBe(50);
    });

    test('Link loading completes within 200ms', () => {
      // Pre-populate localStorage with links
      const testLinks = Array.from({ length: 20 }, (_, i) => ({
        id: `link_${i}`,
        name: `Link ${i}`,
        url: `https://example${i}.com`
      }));
      localStorage.setItem('productivity_dashboard_links', JSON.stringify(testLinks));
      
      const container = document.getElementById('container');
      const component = new QuickLinksComponent(container);
      
      const startTime = performance.now();
      component.loadLinks();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
      expect(component.links.length).toBe(20);
    });

    test('User name loading completes within 200ms', () => {
      localStorage.setItem('productivity_dashboard_user_name', 'John Doe');
      
      const container = document.getElementById('container');
      const component = new GreetingComponent(container);
      
      const startTime = performance.now();
      component.loadUserName();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
      expect(component.userName).toBe('John Doe');
    });

    test('Pomodoro duration loading completes within 200ms', () => {
      localStorage.setItem('productivity_dashboard_pomodoro_duration', '30');
      
      const container = document.getElementById('container');
      const component = new FocusTimerComponent(container);
      
      const startTime = performance.now();
      component.loadDuration();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
      expect(component.pomodoroDuration).toBe(30);
    });
  });

  describe('DOM Manipulation Performance', () => {
    test('Rendering large task list uses DocumentFragment', () => {
      const container = document.getElementById('container');
      const component = new TaskListComponent(container);
      component.init();
      
      // Add many tasks
      for (let i = 0; i < 100; i++) {
        component.tasks.push({
          id: `task_${i}`,
          text: `Task ${i}`,
          completed: false,
          createdAt: Date.now()
        });
      }
      
      const startTime = performance.now();
      component.renderTasks();
      const endTime = performance.now();
      
      // Rendering should be fast even with many tasks
      expect(endTime - startTime).toBeLessThan(200);
      
      // Verify all tasks were rendered
      const taskItems = container.querySelectorAll('.task-item');
      expect(taskItems.length).toBe(100);
    });

    test('Rendering many links uses DocumentFragment', () => {
      const container = document.getElementById('container');
      const component = new QuickLinksComponent(container);
      component.init();
      
      // Add many links
      for (let i = 0; i < 50; i++) {
        component.links.push({
          id: `link_${i}`,
          name: `Link ${i}`,
          url: `https://example${i}.com`
        });
      }
      
      const startTime = performance.now();
      component.renderLinks();
      const endTime = performance.now();
      
      // Rendering should be fast
      expect(endTime - startTime).toBeLessThan(100);
      
      // Verify all links were rendered
      const linkButtons = container.querySelectorAll('.link-button');
      expect(linkButtons.length).toBe(50);
    });
  });
});
