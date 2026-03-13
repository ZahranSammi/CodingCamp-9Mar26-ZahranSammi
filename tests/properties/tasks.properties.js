/**
 * Property-Based Tests for TaskListComponent
 * Feature: productivity-dashboard
 */

import fc from 'fast-check';

// TaskListComponent class for testing
// In a real browser environment, this would be loaded from app.js
class TaskListComponent {
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error("Container element required for TaskListComponent");
    }
    this.container = containerElement;
    this.tasks = [];
    this.duplicateWarningTimeout = null;
  }

  init() {
    // Load tasks from storage
    this.loadTasks();

    // Create UI structure
    this.container.innerHTML = `
      <div class="task-list-component">
        <h2>Tasks</h2>
        <div class="task-input-container">
          <input type="text" class="task-input" placeholder="Add a new task..." maxlength="500">
          <button class="btn-add-task">Add</button>
          <div class="duplicate-warning" style="display:none">This task already exists!</div>
        </div>
        <ul class="task-list">
        </ul>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();

    // Render initial tasks
    this.renderTasks();
  }

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadTasks() {
    try {
      const stored = localStorage.getItem('productivity_dashboard_tasks');
      if (stored) {
        this.tasks = JSON.parse(stored);
      } else {
        this.tasks = [];
      }
    } catch (error) {
      console.warn('Failed to load tasks from localStorage, defaulting to empty array:', error);
      this.tasks = [];
    }
  }

  saveTasks() {
    try {
      localStorage.setItem('productivity_dashboard_tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage full. Please delete some items.');
      }
    }
  }

  addTask(text) {
    const trimmedText = text.trim();
    if (trimmedText === '') {
      return false;
    }
    if (this.isDuplicate(trimmedText)) {
      this.showDuplicateWarning();
      return false;
    }
    const newTask = {
      id: this.generateId(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now()
    };
    this.tasks.push(newTask);
    this.saveTasks();
    return true;
  }

  isDuplicate(text) {
    const normalizedText = text.toLowerCase().trim();
    return this.tasks.some(task =>
      !task.completed && task.text.toLowerCase().trim() === normalizedText
    );
  }

  showDuplicateWarning() {
    const warningElement = this.container.querySelector('.duplicate-warning');
    if (warningElement) {
      warningElement.style.display = 'block';
      if (this.duplicateWarningTimeout) {
        clearTimeout(this.duplicateWarningTimeout);
      }
      this.duplicateWarningTimeout = setTimeout(() => {
        this.hideDuplicateWarning();
      }, 3000);
    }
  }

  hideDuplicateWarning() {
    const warningElement = this.container.querySelector('.duplicate-warning');
    if (warningElement) {
      warningElement.style.display = 'none';
    }
    this.duplicateWarningTimeout = null;
  }

  editTask(id, newText) {
    const trimmedText = newText.trim();
    if (trimmedText === '') {
      return false;
    }
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      return false;
    }
    task.text = trimmedText;
    this.saveTasks();
    return true;
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      return false;
    }
    task.completed = !task.completed;
    this.saveTasks();
    return true;
  }

  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }
    this.tasks.splice(index, 1);
    this.saveTasks();
    return true;
  }

  attachEventListeners() {
    // Get references to UI elements
    const taskInput = this.container.querySelector('.task-input');
    const addButton = this.container.querySelector('.btn-add-task');

    // Add task on button click
    addButton.addEventListener('click', () => {
      const text = taskInput.value;
      if (this.addTask(text)) {
        taskInput.value = ''; // Clear input on success
        this.renderTasks();
      }
    });

    // Add task on Enter key
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = taskInput.value;
        if (this.addTask(text)) {
          taskInput.value = ''; // Clear input on success
          this.renderTasks();
        }
      }
    });
  }

  renderTasks() {
    const taskList = this.container.querySelector('.task-list');
    
    // Clear current list
    taskList.innerHTML = '';

    // Render each task
    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = task.completed ? 'task-item task-completed' : 'task-item task-incomplete';
      li.dataset.id = task.id;

      // Create checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        this.toggleTask(task.id);
        this.renderTasks();
      });

      // Create task text span
      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.textContent = task.text;

      // Create edit button
      const editButton = document.createElement('button');
      editButton.className = 'btn-edit-task';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && this.editTask(task.id, newText)) {
          this.renderTasks();
        }
      });

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete-task';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        if (confirm('Delete this task?')) {
          this.deleteTask(task.id);
          this.renderTasks();
        }
      });

      // Append all elements to list item
      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(editButton);
      li.appendChild(deleteButton);

      // Append list item to task list
      taskList.appendChild(li);
    });
  }
}

// Arbitrary generators for testing
const taskArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  text: fc.string({ minLength: 1, maxLength: 500 }),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 })
});

const taskArrayArbitrary = fc.array(taskArbitrary, { minLength: 0, maxLength: 100 });

// Mock container element
const mockContainer = { innerHTML: '', querySelector: () => null };

/**
 * Property 22: Task Storage Persistence
 * 
 * For any task list operation (add, edit, toggle, delete), the operation should 
 * trigger a save to Local Storage, and the stored data should match the current 
 * task list state.
 * 
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
 */
describe('TaskListComponent - Property 22: Task Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saving tasks persists them to localStorage', () => {
    fc.assert(
      fc.property(taskArrayArbitrary, (tasks) => {
        const component = new TaskListComponent(mockContainer);
        
        // Set tasks and save
        component.tasks = tasks;
        component.saveTasks();
        
        // Verify data was saved to localStorage
        const stored = localStorage.getItem('productivity_dashboard_tasks');
        expect(stored).not.toBeNull();
        
        // Verify stored data matches original tasks
        const parsed = JSON.parse(stored);
        expect(parsed).toEqual(tasks);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 23: Task Storage Round-Trip
 * 
 * For any array of valid tasks, saving to Local Storage and then loading should 
 * produce an equivalent task list with all tasks having the same IDs, text, 
 * completed status, and createdAt values.
 * 
 * **Validates: Requirements 12.5**
 */
describe('TaskListComponent - Property 23: Task Storage Round-Trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saving and loading produces equivalent task list', () => {
    fc.assert(
      fc.property(taskArrayArbitrary, (originalTasks) => {
        const component1 = new TaskListComponent(mockContainer);
        
        // Save tasks
        component1.tasks = originalTasks;
        component1.saveTasks();
        
        // Create new component and load tasks
        const component2 = new TaskListComponent(mockContainer);
        component2.loadTasks();
        
        // Verify loaded tasks match original tasks
        expect(component2.tasks).toEqual(originalTasks);
        
        // Verify all properties are preserved
        component2.tasks.forEach((task, index) => {
          expect(task.id).toBe(originalTasks[index].id);
          expect(task.text).toBe(originalTasks[index].text);
          expect(task.completed).toBe(originalTasks[index].completed);
          expect(task.createdAt).toBe(originalTasks[index].createdAt);
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Additional test: Verify JSON parse errors default to empty array
  test('JSON parse errors default to empty array', () => {
    const component = new TaskListComponent(mockContainer);
    
    // Set invalid JSON in localStorage
    localStorage.setItem('productivity_dashboard_tasks', 'invalid json {]');
    
    // Load tasks should default to empty array
    component.loadTasks();
    expect(component.tasks).toEqual([]);
  });

  // Additional test: Verify missing data defaults to empty array
  test('Missing localStorage data defaults to empty array', () => {
    const component = new TaskListComponent(mockContainer);
    
    // Ensure no data in localStorage
    localStorage.removeItem('productivity_dashboard_tasks');
    
    // Load tasks should default to empty array
    component.loadTasks();
    expect(component.tasks).toEqual([]);
  });

  // Additional test: Verify generateId creates unique IDs
  test('generateId creates unique identifiers', () => {
    const component = new TaskListComponent(mockContainer);
    
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      const id = component.generateId();
      expect(id).toMatch(/^task_\d+_[a-z0-9]+$/);
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
  });
});

/**
 * Property 14: Valid Task Creation
 * 
 * For any non-empty, non-whitespace string, calling addTask should create a new 
 * task with that text, completed status set to false, a unique ID, and a createdAt 
 * timestamp.
 * 
 * **Validates: Requirements 7.2**
 */
describe('TaskListComponent - Property 14: Valid Task Creation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('addTask creates task with correct properties for non-empty text', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        (text) => {
          const component = new TaskListComponent(mockContainer);
          const initialLength = component.tasks.length;
          
          // Add task
          const result = component.addTask(text);
          
          // Verify task was added
          expect(result).toBe(true);
          expect(component.tasks.length).toBe(initialLength + 1);
          
          // Verify task properties
          const newTask = component.tasks[component.tasks.length - 1];
          expect(newTask.text).toBe(text.trim());
          expect(newTask.completed).toBe(false);
          expect(newTask.id).toBeDefined();
          expect(newTask.id).toMatch(/^task_\d+_[a-z0-9]+$/);
          expect(newTask.createdAt).toBeDefined();
          expect(typeof newTask.createdAt).toBe('number');
          expect(newTask.createdAt).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 15: Task List Ordering Preservation
 * 
 * For any sequence of task additions, the task list should maintain the order 
 * in which tasks were created (ordered by createdAt timestamp ascending).
 * 
 * **Validates: Requirements 7.4**
 */
describe('TaskListComponent - Property 15: Task List Ordering Preservation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('tasks maintain creation order', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 10 }
        ),
        (texts) => {
          const component = new TaskListComponent(mockContainer);
          const uniqueTexts = [...new Set(texts)]; // Remove duplicates for this test
          
          // Add tasks sequentially
          uniqueTexts.forEach(text => {
            component.addTask(text);
          });
          
          // Verify tasks are ordered by createdAt
          for (let i = 1; i < component.tasks.length; i++) {
            expect(component.tasks[i].createdAt).toBeGreaterThanOrEqual(
              component.tasks[i - 1].createdAt
            );
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 16: Empty Task Rejection
 * 
 * For any string composed entirely of whitespace characters (spaces, tabs, newlines) 
 * or empty string, calling addTask should reject the submission and leave the task 
 * list unchanged.
 * 
 * **Validates: Requirements 7.5**
 */
describe('TaskListComponent - Property 16: Empty Task Rejection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('addTask rejects empty or whitespace-only text', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
        ),
        (text) => {
          const component = new TaskListComponent(mockContainer);
          const initialLength = component.tasks.length;
          
          // Try to add empty/whitespace task
          const result = component.addTask(text);
          
          // Verify task was rejected
          expect(result).toBe(false);
          expect(component.tasks.length).toBe(initialLength);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 17: Duplicate Task Detection
 * 
 * For any task text, when a duplicate task is detected (case-insensitive comparison 
 * after trimming whitespace), the submission should be rejected and a warning should 
 * be displayed.
 * 
 * **Validates: Requirements 8.1, 8.2**
 */
describe('TaskListComponent - Property 17: Duplicate Task Detection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('addTask rejects duplicate incomplete tasks', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.constantFrom('', ' ', '  \t  '), // Whitespace variations
        fc.constantFrom('lower', 'upper', 'mixed'), // Case variations
        (baseText, whitespace, caseVariation) => {
          const component = new TaskListComponent(mockContainer);
          
          // Add first task
          const result1 = component.addTask(baseText);
          expect(result1).toBe(true);
          expect(component.tasks.length).toBe(1);
          
          // Try to add duplicate with variations
          let duplicateText = baseText;
          if (caseVariation === 'upper') {
            duplicateText = baseText.toUpperCase();
          } else if (caseVariation === 'lower') {
            duplicateText = baseText.toLowerCase();
          }
          duplicateText = whitespace + duplicateText + whitespace;
          
          const result2 = component.addTask(duplicateText);
          
          // Verify duplicate was rejected
          expect(result2).toBe(false);
          expect(component.tasks.length).toBe(1);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 18: Duplicate Check Ignores Completed Tasks
 * 
 * The duplicate check should only compare against incomplete tasks. Completed tasks 
 * should be ignored to allow re-adding previously completed tasks.
 * 
 * **Validates: Requirements 8.3, 8.4**
 */
describe('TaskListComponent - Property 18: Duplicate Check Ignores Completed Tasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('addTask allows re-adding completed tasks', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (text) => {
          const component = new TaskListComponent(mockContainer);
          
          // Add task
          component.addTask(text);
          expect(component.tasks.length).toBe(1);
          
          // Mark task as completed
          const taskId = component.tasks[0].id;
          component.toggleTask(taskId);
          expect(component.tasks[0].completed).toBe(true);
          
          // Try to add same task again (should succeed since original is completed)
          const result = component.addTask(text);
          
          // Verify task was added
          expect(result).toBe(true);
          expect(component.tasks.length).toBe(2);
          expect(component.tasks[1].text).toBe(text.trim());
          expect(component.tasks[1].completed).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 19: Valid Task Edit
 * 
 * For any existing task and any non-empty, non-whitespace string, calling editTask 
 * should update the task's text to the new value while preserving the task's ID, 
 * completed status, and createdAt timestamp.
 * 
 * **Validates: Requirements 9.3**
 */
describe('TaskListComponent - Property 19: Valid Task Edit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('editTask updates text while preserving other properties', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        (originalText, newText, completed) => {
          const component = new TaskListComponent(mockContainer);
          
          // Add task
          component.addTask(originalText);
          const task = component.tasks[0];
          const originalId = task.id;
          const originalCreatedAt = task.createdAt;
          
          // Set completion status
          task.completed = completed;
          
          // Edit task
          const result = component.editTask(task.id, newText);
          
          // Verify edit succeeded
          expect(result).toBe(true);
          expect(component.tasks[0].text).toBe(newText.trim());
          
          // Verify other properties preserved
          expect(component.tasks[0].id).toBe(originalId);
          expect(component.tasks[0].completed).toBe(completed);
          expect(component.tasks[0].createdAt).toBe(originalCreatedAt);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 20: Empty Task Edit Rejection
 * 
 * For any existing task and any string composed entirely of whitespace or empty 
 * string, calling editTask should reject the update and preserve the original text 
 * unchanged.
 * 
 * **Validates: Requirements 9.4**
 */
describe('TaskListComponent - Property 20: Empty Task Edit Rejection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('editTask rejects empty or whitespace-only text', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.oneof(
          fc.constant(''),
          fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
        ),
        (originalText, emptyText) => {
          const component = new TaskListComponent(mockContainer);
          
          // Add task
          component.addTask(originalText);
          const taskId = component.tasks[0].id;
          
          // Try to edit with empty text
          const result = component.editTask(taskId, emptyText);
          
          // Verify edit was rejected
          expect(result).toBe(false);
          expect(component.tasks[0].text).toBe(originalText.trim());
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 21: Task Completion Toggle
 * 
 * For any task, calling toggleTask should flip the completed status (false to true, 
 * or true to false) while preserving all other task properties.
 * 
 * **Validates: Requirements 10.2, 10.3**
 */
describe('TaskListComponent - Property 21: Task Completion Toggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('toggleTask flips completed status while preserving other properties', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        (text, initialCompleted) => {
          const component = new TaskListComponent(mockContainer);
          
          // Add task
          component.addTask(text);
          const task = component.tasks[0];
          task.completed = initialCompleted;
          const originalId = task.id;
          const originalText = task.text;
          const originalCreatedAt = task.createdAt;
          
          // Toggle task
          const result = component.toggleTask(task.id);
          
          // Verify toggle succeeded
          expect(result).toBe(true);
          expect(component.tasks[0].completed).toBe(!initialCompleted);
          
          // Verify other properties preserved
          expect(component.tasks[0].id).toBe(originalId);
          expect(component.tasks[0].text).toBe(originalText);
          expect(component.tasks[0].createdAt).toBe(originalCreatedAt);
          
          // Toggle again
          component.toggleTask(task.id);
          expect(component.tasks[0].completed).toBe(initialCompleted);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 24: Task Deletion Removes Task
 * 
 * For any task list and any task ID in that list, calling deleteTask should remove 
 * the task with that ID from the list, and the task should not appear in subsequent 
 * renders.
 * 
 * **Validates: Requirements 11.2, 11.3**
 */
describe('TaskListComponent - Property 24: Task Deletion Removes Task', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('deleteTask removes task from list', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          { minLength: 1, maxLength: 20 }
        ),
        fc.integer({ min: 0, max: 19 }),
        (texts, indexToDelete) => {
          const component = new TaskListComponent(mockContainer);
          const uniqueTexts = [...new Set(texts)];
          
          // Add tasks
          uniqueTexts.forEach(text => component.addTask(text));
          
          if (component.tasks.length === 0) return true;
          
          // Select a valid index
          const actualIndex = indexToDelete % component.tasks.length;
          const taskToDelete = component.tasks[actualIndex];
          const initialLength = component.tasks.length;
          
          // Delete task
          const result = component.deleteTask(taskToDelete.id);
          
          // Verify deletion succeeded
          expect(result).toBe(true);
          expect(component.tasks.length).toBe(initialLength - 1);
          
          // Verify task is no longer in list
          const foundTask = component.tasks.find(t => t.id === taskToDelete.id);
          expect(foundTask).toBeUndefined();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('deleteTask returns false for non-existent ID', () => {
    const component = new TaskListComponent(mockContainer);
    component.addTask('Test task');
    
    const result = component.deleteTask('non_existent_id');
    expect(result).toBe(false);
    expect(component.tasks.length).toBe(1);
  });
});

/**
 * Property 25: Task Rendering Completeness
 * 
 * For any task in the task list, the rendered HTML should include a completion 
 * control, edit control, delete control, and the task text.
 * 
 * **Validates: Requirements 9.1, 10.1, 11.1**
 */
describe('TaskListComponent - Property 25: Task Rendering Completeness', () => {
  beforeEach(() => {
    localStorage.clear();
    // Create a real DOM container for rendering tests
    document.body.innerHTML = '<div id="test-container"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('renderTasks includes all required controls for each task', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            completed: fc.boolean()
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (taskData) => {
          const container = document.getElementById('test-container');
          const component = new TaskListComponent(container);
          
          // Initialize component (creates UI structure)
          component.init();
          
          // Add tasks with unique texts to avoid duplicate rejection
          const addedTaskData = [];
          const seenTexts = new Set();
          taskData.forEach(data => {
            const normalizedText = data.text.toLowerCase().trim();
            if (!seenTexts.has(normalizedText)) {
              seenTexts.add(normalizedText);
              const success = component.addTask(data.text);
              if (success) {
                addedTaskData.push(data);
              }
            }
          });
          
          // Skip test if no tasks were added
          if (component.tasks.length === 0) {
            return true;
          }
          
          // Set completion status based on actual added tasks
          component.tasks.forEach((task, index) => {
            if (index < addedTaskData.length) {
              task.completed = addedTaskData[index].completed;
            }
          });
          
          // Render tasks
          component.renderTasks();
          
          // Verify each task has all required controls
          const taskItems = container.querySelectorAll('.task-item');
          expect(taskItems.length).toBe(component.tasks.length);
          
          taskItems.forEach((taskItem, index) => {
            // Check for completion control (checkbox)
            const checkbox = taskItem.querySelector('.task-checkbox');
            expect(checkbox).not.toBeNull();
            expect(checkbox.type).toBe('checkbox');
            
            // Check for task text
            const textSpan = taskItem.querySelector('.task-text');
            expect(textSpan).not.toBeNull();
            expect(textSpan.textContent).toBe(component.tasks[index].text);
            
            // Check for edit control
            const editButton = taskItem.querySelector('.btn-edit-task');
            expect(editButton).not.toBeNull();
            
            // Check for delete control
            const deleteButton = taskItem.querySelector('.btn-delete-task');
            expect(deleteButton).not.toBeNull();
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 26: Task Visual Distinction
 * 
 * For any task, the rendered HTML should apply different CSS classes or styling 
 * based on the completed status, ensuring visual distinction between complete and 
 * incomplete tasks.
 * 
 * **Validates: Requirements 10.4**
 */
describe('TaskListComponent - Property 26: Task Visual Distinction', () => {
  beforeEach(() => {
    localStorage.clear();
    // Create a real DOM container for rendering tests
    document.body.innerHTML = '<div id="test-container"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('completed and incomplete tasks have different CSS classes', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            completed: fc.boolean()
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (taskData) => {
          const container = document.getElementById('test-container');
          const component = new TaskListComponent(container);
          
          // Initialize component (creates UI structure)
          component.init();
          
          // Add tasks with unique texts to avoid duplicate rejection
          const addedTaskData = [];
          const seenTexts = new Set();
          taskData.forEach(data => {
            const normalizedText = data.text.toLowerCase().trim();
            if (!seenTexts.has(normalizedText)) {
              seenTexts.add(normalizedText);
              const success = component.addTask(data.text);
              if (success) {
                addedTaskData.push(data);
              }
            }
          });
          
          // Skip test if no tasks were added
          if (component.tasks.length === 0) {
            return true;
          }
          
          // Set completion status based on actual added tasks
          component.tasks.forEach((task, index) => {
            if (index < addedTaskData.length) {
              task.completed = addedTaskData[index].completed;
            }
          });
          
          // Render tasks
          component.renderTasks();
          
          // Verify each task has appropriate CSS class based on completion status
          const taskItems = container.querySelectorAll('.task-item');
          
          taskItems.forEach((taskItem, index) => {
            const isCompleted = component.tasks[index].completed;
            
            if (isCompleted) {
              // Completed tasks should have 'task-completed' class
              expect(taskItem.classList.contains('task-completed')).toBe(true);
              expect(taskItem.classList.contains('task-incomplete')).toBe(false);
            } else {
              // Incomplete tasks should have 'task-incomplete' class
              expect(taskItem.classList.contains('task-incomplete')).toBe(true);
              expect(taskItem.classList.contains('task-completed')).toBe(false);
            }
            
            // Verify checkbox state matches completion status
            const checkbox = taskItem.querySelector('.task-checkbox');
            expect(checkbox.checked).toBe(isCompleted);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('toggling task updates CSS classes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (text) => {
          const container = document.getElementById('test-container');
          const component = new TaskListComponent(container);
          
          // Initialize and add task
          component.init();
          component.addTask(text);
          component.renderTasks();
          
          // Get initial state
          let taskItem = container.querySelector('.task-item');
          expect(taskItem.classList.contains('task-incomplete')).toBe(true);
          expect(taskItem.classList.contains('task-completed')).toBe(false);
          
          // Toggle to completed
          component.toggleTask(component.tasks[0].id);
          component.renderTasks();
          
          taskItem = container.querySelector('.task-item');
          expect(taskItem.classList.contains('task-completed')).toBe(true);
          expect(taskItem.classList.contains('task-incomplete')).toBe(false);
          
          // Toggle back to incomplete
          component.toggleTask(component.tasks[0].id);
          component.renderTasks();
          
          taskItem = container.querySelector('.task-item');
          expect(taskItem.classList.contains('task-incomplete')).toBe(true);
          expect(taskItem.classList.contains('task-completed')).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
