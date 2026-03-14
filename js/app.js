// Productivity Dashboard Application

// Storage utility to check if localStorage is available
const StorageUtil = {
  isAvailable: null,
  warningShown: false,
  saveQueue: [],
  saveTimeout: null,

  checkAvailability() {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
      return true;
    } catch (error) {
      this.isAvailable = false;
      if (!this.warningShown) {
        this.showStorageWarning();
        this.warningShown = true;
      }
      return false;
    }
  },

  showStorageWarning() {
    const message = 'Storage unavailable. Data will not persist across sessions. This may occur in private browsing mode.';
    console.warn(message);
    // Display warning to user
    const warningDiv = document.createElement('div');
    warningDiv.className = 'storage-warning';
    warningDiv.textContent = message;
    warningDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #ff9800; color: white; padding: 12px 20px; border-radius: 4px; z-index: 9999; max-width: 90%; text-align: center;';
    document.body.appendChild(warningDiv);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.parentNode.removeChild(warningDiv);
      }
    }, 8000);
  },

  // Non-blocking storage save using requestIdleCallback or setTimeout
  deferredSave(key, value, callback) {
    if (!this.checkAvailability()) {
      return;
    }

    // Add to save queue
    this.saveQueue.push({ key, value, callback });

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Batch saves using requestIdleCallback for better performance
    if (typeof requestIdleCallback !== 'undefined') {
      this.saveTimeout = requestIdleCallback(() => this.processSaveQueue(), { timeout: 100 });
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback
      this.saveTimeout = setTimeout(() => this.processSaveQueue(), 50);
    }
  },

  processSaveQueue() {
    if (this.saveQueue.length === 0) return;

    // Process all queued saves in a single batch
    const batch = this.saveQueue.splice(0);
    
    try {
      batch.forEach(({ key, value, callback }) => {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
        if (callback) callback();
      });
    } catch (error) {
      console.error('Failed to process storage save queue:', error);
      if (error.name === 'QuotaExceededError') {
        this.showStorageError('Storage full. Please delete some items.');
      }
    }

    this.saveTimeout = null;
  },

  showStorageError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'storage-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #f44336; color: white; padding: 12px 20px; border-radius: 4px; z-index: 9999; max-width: 90%; text-align: center;';
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
};

// GreetingComponent - Displays current time, date, and time-based greeting
class GreetingComponent {
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error("Container element required for GreetingComponent");
    }
    this.container = containerElement;
    this.intervalId = null;
    this.userName = null;
    // Cache DOM elements for better performance
    this.cachedElements = {};
  }

  init() {
    // Check storage availability
    StorageUtil.checkAvailability();

    // Load user name from storage
    this.loadUserName();

    // Create initial DOM structure
    this.container.innerHTML = `
      <div class="greeting-component">
        <div class="greeting-message"></div>
        <div class="time-display"></div>
        <div class="date-display"></div>
        <div class="name-edit-container">
          <button class="btn-edit-name">Edit Name</button>
          <input type="text" class="name-input" placeholder="Enter your name" maxlength="50" style="display:none">
          <button class="btn-save-name" style="display:none">Save</button>
        </div>
      </div>
    `;

    // Cache DOM elements to avoid repeated queries
    this.cachedElements = {
      timeDisplay: this.container.querySelector('.time-display'),
      dateDisplay: this.container.querySelector('.date-display'),
      greetingMessage: this.container.querySelector('.greeting-message'),
      editBtn: this.container.querySelector('.btn-edit-name'),
      saveBtn: this.container.querySelector('.btn-save-name'),
      nameInput: this.container.querySelector('.name-input')
    };

    // Add null checks for DOM elements
    if (!this.cachedElements.editBtn || !this.cachedElements.saveBtn || !this.cachedElements.nameInput) {
      console.error('Failed to initialize GreetingComponent: Required DOM elements not found');
      return;
    }

    // Attach event listeners for name editing
    this.cachedElements.editBtn.addEventListener('click', () => {
      this.cachedElements.nameInput.value = this.userName || '';
      this.cachedElements.nameInput.style.display = 'inline-block';
      this.cachedElements.saveBtn.style.display = 'inline-block';
      this.cachedElements.editBtn.style.display = 'none';
      this.cachedElements.nameInput.focus();
    });

    this.cachedElements.saveBtn.addEventListener('click', () => {
      const newName = this.cachedElements.nameInput.value.trim();
      this.setUserName(newName || null);
      this.cachedElements.nameInput.style.display = 'none';
      this.cachedElements.saveBtn.style.display = 'none';
      this.cachedElements.editBtn.style.display = 'inline-block';
      this.updateTime(); // Refresh greeting display
    });

    // Allow Enter key to save
    this.cachedElements.nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.cachedElements.saveBtn.click();
      }
    });

    // Start clock updates
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    
    // Batch DOM updates to minimize reflows
    if (this.cachedElements.timeDisplay) {
      this.cachedElements.timeDisplay.textContent = this.formatTime(now);
    }
    if (this.cachedElements.dateDisplay) {
      this.cachedElements.dateDisplay.textContent = this.formatDate(now);
    }
    if (this.cachedElements.greetingMessage) {
      const greeting = this.getGreeting(now.getHours());
      this.cachedElements.greetingMessage.textContent = this.formatGreetingMessage(greeting, this.userName);
    }
  }

  formatGreetingMessage(greeting, userName) {
    if (userName) {
      return `${greeting}, ${userName}!`;
    }
    return greeting;
  }

  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    // Pad minutes and seconds with leading zeros
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
  }

  formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNumber = date.getDate();
    
    return `${dayName}, ${monthName} ${dayNumber}`;
  }

  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return "Good Morning";
    } else if (hour >= 12 && hour <= 16) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour <= 20) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  }

  setUserName(name) {
    // Set user name (null or trimmed non-empty string)
    if (name === null || name === '') {
      this.userName = null;
    } else {
      this.userName = name.trim();
    }
    this.saveUserName();
  }

  getUserName() {
    return this.userName;
  }

  loadUserName() {
    if (!StorageUtil.checkAvailability()) {
      this.userName = null;
      return;
    }

    try {
      const stored = localStorage.getItem('productivity_dashboard_user_name');
      this.userName = stored || null;
    } catch (error) {
      console.warn('Failed to load user name from localStorage:', error);
      this.userName = null;
    }
  }

  saveUserName() {
    if (!StorageUtil.checkAvailability()) {
      return;
    }

    // Use deferred save for non-blocking storage operation
    const key = 'productivity_dashboard_user_name';
    const value = this.userName;
    
    StorageUtil.deferredSave(key, value, () => {
      // Optional callback after save completes
    });
  }

  showStorageError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'storage-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #f44336; color: white; padding: 12px 20px; border-radius: 4px; z-index: 9999; max-width: 90%; text-align: center;';
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}



// FocusTimerComponent - Provides a configurable countdown timer with start/stop/reset controls
class FocusTimerComponent {
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error("Container element required for FocusTimerComponent");
    }
    this.container = containerElement;
    this.pomodoroDuration = 25; // Default 25 minutes
    this.timeRemaining = 0; // Will be set in init
    this.timerState = 'stopped'; // 'stopped' | 'running'
    this.intervalId = null;
    // Cache DOM elements for better performance
    this.cachedElements = {};
  }

  init() {
    // Check storage availability
    StorageUtil.checkAvailability();

    // Load Pomodoro duration from storage
    this.loadDuration();
    
    // Initialize time remaining to configured duration
    this.timeRemaining = this.pomodoroDuration * 60;

    // Create initial DOM structure
    this.container.innerHTML = `
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
    `;

    // Cache DOM elements to avoid repeated queries
    this.cachedElements = {
      timerDisplay: this.container.querySelector('.timer-display'),
      startBtn: this.container.querySelector('.btn-start'),
      stopBtn: this.container.querySelector('.btn-stop'),
      resetBtn: this.container.querySelector('.btn-reset'),
      durationInput: this.container.querySelector('.duration-input'),
      setDurationBtn: this.container.querySelector('.btn-set-duration')
    };

    // Update duration input to show loaded value
    if (this.cachedElements.durationInput) {
      this.cachedElements.durationInput.value = this.pomodoroDuration;
    }

    // Add null checks for DOM elements
    if (!this.cachedElements.startBtn || !this.cachedElements.stopBtn || 
        !this.cachedElements.resetBtn || !this.cachedElements.setDurationBtn || 
        !this.cachedElements.durationInput) {
      console.error('Failed to initialize FocusTimerComponent: Required DOM elements not found');
      return;
    }

    // Attach event listeners
    this.cachedElements.startBtn.addEventListener('click', () => this.start());
    this.cachedElements.stopBtn.addEventListener('click', () => this.stop());
    this.cachedElements.resetBtn.addEventListener('click', () => this.reset());
    this.cachedElements.setDurationBtn.addEventListener('click', () => {
      const newDuration = parseInt(this.cachedElements.durationInput.value, 10);
      if (this.validateDuration(newDuration)) {
        this.setDuration(newDuration);
      } else {
        alert('Duration must be between 1 and 60 minutes');
      }
    });

    // Initial display update
    this.updateDisplay();
  }

  start() {
    if (this.timerState === 'stopped') {
      this.timerState = 'running';
      this.intervalId = setInterval(() => this.tick(), 1000);
      this.updateDisplay();
    }
  }

  stop() {
    if (this.timerState === 'running') {
      this.timerState = 'stopped';
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.updateDisplay();
    }
  }

  reset() {
    // Stop timer if running
    if (this.timerState === 'running') {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
    
    // Set state to stopped and reset time to configured duration
    this.timerState = 'stopped';
    this.timeRemaining = this.pomodoroDuration * 60;
    this.updateDisplay();
  }

  tick() {
    if (this.timerState === 'running' && this.timeRemaining > 0) {
      this.timeRemaining -= 1;
      this.updateDisplay();
      
      // Auto-stop at zero
      if (this.timeRemaining === 0) {
        this.stop();
      }
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minutesStr = String(minutes).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');
    return `${minutesStr}:${secsStr}`;
  }

  updateDisplay() {
    // Batch DOM updates to minimize reflows
    // Update time display
    if (this.cachedElements.timerDisplay) {
      const formattedTime = this.formatTime(this.timeRemaining);
      this.cachedElements.timerDisplay.textContent = formattedTime;
      
      // Add/remove running class for pulse animation
      if (this.timerState === 'running') {
        this.cachedElements.timerDisplay.classList.add('running');
        this.cachedElements.timerDisplay.classList.remove('completed');
      } else {
        this.cachedElements.timerDisplay.classList.remove('running');
        // Add completed class if timer reached zero
        if (this.timeRemaining === 0) {
          this.cachedElements.timerDisplay.classList.add('completed');
          // Remove completed class after animation completes (0.6s)
          setTimeout(() => {
            this.cachedElements.timerDisplay.classList.remove('completed');
          }, 600);
        }
      }
    }

    // Update button visibility and disabled state based on state
    if (this.timerState === 'stopped') {
      this.cachedElements.startBtn.style.display = 'inline-block';
      this.cachedElements.stopBtn.style.display = 'none';
      // Enable duration controls when stopped
      this.cachedElements.durationInput.disabled = false;
      this.cachedElements.setDurationBtn.disabled = false;
    } else {
      this.cachedElements.startBtn.style.display = 'none';
      this.cachedElements.stopBtn.style.display = 'inline-block';
      // Disable duration controls when running
      this.cachedElements.durationInput.disabled = true;
      this.cachedElements.setDurationBtn.disabled = true;
    }
  }

  setDuration(minutes) {
    // Only allow setting duration when timer is stopped
    if (this.timerState !== 'stopped') {
      return false;
    }

    if (this.validateDuration(minutes)) {
      this.pomodoroDuration = minutes;
      this.saveDuration();
      // Reset time to new duration
      this.timeRemaining = this.pomodoroDuration * 60;
      this.updateDisplay();
      return true;
    }
    return false;
  }

  getDuration() {
    return this.pomodoroDuration;
  }

  validateDuration(minutes) {
    return Number.isInteger(minutes) && minutes >= 1 && minutes <= 60;
  }

  loadDuration() {
    if (!StorageUtil.checkAvailability()) {
      this.pomodoroDuration = 25;
      return;
    }

    try {
      const stored = localStorage.getItem('productivity_dashboard_pomodoro_duration');
      if (stored) {
        const duration = parseInt(stored, 10);
        if (this.validateDuration(duration)) {
          this.pomodoroDuration = duration;
        } else {
          this.pomodoroDuration = 25; // Default if invalid
        }
      } else {
        this.pomodoroDuration = 25; // Default if not set
      }
    } catch (error) {
      console.warn('Failed to load Pomodoro duration from localStorage:', error);
      this.pomodoroDuration = 25;
    }
  }

  saveDuration() {
    if (!StorageUtil.checkAvailability()) {
      return;
    }

    // Use deferred save for non-blocking storage operation
    const key = 'productivity_dashboard_pomodoro_duration';
    const value = String(this.pomodoroDuration);
    
    StorageUtil.deferredSave(key, value);
  }

  showStorageError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'storage-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #f44336; color: white; padding: 12px 20px; border-radius: 4px; z-index: 9999; max-width: 90%; text-align: center;';
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// TaskListComponent - Manages task CRUD operations with Local Storage persistence
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
      // Check storage availability
      StorageUtil.checkAvailability();

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
    // Create unique task identifier using timestamp and random number
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadTasks() {
    if (!StorageUtil.checkAvailability()) {
      this.tasks = [];
      return;
    }

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
    if (!StorageUtil.checkAvailability()) {
      return;
    }

    // Use deferred save for non-blocking storage operation
    const key = 'productivity_dashboard_tasks';
    const value = JSON.stringify(this.tasks);
    
    StorageUtil.deferredSave(key, value);
  }

  showStorageError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'storage-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #f44336; color: white; padding: 12px 20px; border-radius: 4px; z-index: 9999; max-width: 90%; text-align: center;';
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  addTask(text) {
    // Trim the input text
    const trimmedText = text.trim();

    // Reject empty or whitespace-only text
    if (trimmedText === '') {
      return false;
    }

    // Check for duplicates
    if (this.isDuplicate(trimmedText)) {
      this.showDuplicateWarning();
      return false;
    }

    // Create new task
    const newTask = {
      id: this.generateId(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now()
    };

    // Add to tasks array
    this.tasks.push(newTask);

    // Save to localStorage
    this.saveTasks();

    return true;
  }

  isDuplicate(text) {
    // Check if text matches any incomplete task (case-insensitive, trimmed)
    const normalizedText = text.toLowerCase().trim();
    return this.tasks.some(task =>
      !task.completed && task.text.toLowerCase().trim() === normalizedText
    );
  }

  showDuplicateWarning() {
    // Display warning message
    const warningElement = this.container.querySelector('.duplicate-warning');
    if (warningElement) {
      warningElement.style.display = 'block';

      // Clear any existing timeout
      if (this.duplicateWarningTimeout) {
        clearTimeout(this.duplicateWarningTimeout);
      }

      // Hide warning after 3 seconds
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
    // Trim the input text
    const trimmedText = newText.trim();

    // Reject empty or whitespace-only text
    if (trimmedText === '') {
      return false;
    }

    // Find the task
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      return false;
    }

    // Update task text
    task.text = trimmedText;

    // Save to localStorage
    this.saveTasks();

    return true;
  }

  toggleTask(id) {
    // Find the task
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      return false;
    }

    // Toggle completion status
    task.completed = !task.completed;

    // Save to localStorage
    this.saveTasks();

    return true;
  }

  deleteTask(id) {
    // Find the task index
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }

    // Remove task from array
    this.tasks.splice(index, 1);

    // Save to localStorage
    this.saveTasks();

    return true;
  }

  attachEventListeners() {
    // Get references to UI elements
    const taskInput = this.container.querySelector('.task-input');
    const addButton = this.container.querySelector('.btn-add-task');

    // Add null checks for DOM elements
    if (!taskInput || !addButton) {
      console.error('Failed to attach event listeners in TaskListComponent: Required DOM elements not found');
      return;
    }

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
    
    // Add null check for DOM element
    if (!taskList) {
      console.error('Failed to render tasks: task-list element not found');
      return;
    }

    // Use DocumentFragment for batched DOM updates to minimize reflows
    const fragment = document.createDocumentFragment();

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
      deleteButton.setAttribute('aria-label', `Delete task: ${task.text}`);
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

      // Append list item to fragment
      fragment.appendChild(li);
    });

    // Clear current list and append fragment in one operation
    taskList.innerHTML = '';
    taskList.appendChild(fragment);
  }

}

// QuickLinksComponent - Manages quick link CRUD operations with Local Storage persistence
class QuickLinksComponent {
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error("Container element required for QuickLinksComponent");
    }
    this.container = containerElement;
    this.links = [];
  }

  generateId() {
    // Create unique link identifier using timestamp and random number
    return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadLinks() {
    if (!StorageUtil.checkAvailability()) {
      this.links = [];
      return;
    }

    try {
      const stored = localStorage.getItem('productivity_dashboard_links');
      if (stored) {
        this.links = JSON.parse(stored);
      } else {
        this.links = [];
      }
    } catch (error) {
      console.warn('Failed to load links from localStorage, defaulting to empty array:', error);
      this.links = [];
    }
  }

  saveLinks() {
    if (!StorageUtil.checkAvailability()) {
      return;
    }

    // Use deferred save for non-blocking storage operation
    const key = 'productivity_dashboard_links';
    const value = JSON.stringify(this.links);
    
    StorageUtil.deferredSave(key, value);
  }

  showStorageError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'storage-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #f44336; color: white; padding: 12px 20px; border-radius: 4px; z-index: 9999; max-width: 90%; text-align: center;';
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  validateUrl(url) {
    // Check if URL is valid format using URL constructor
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  addLink(name, url) {
    // Validate inputs
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    // Reject empty name
    if (!trimmedName) {
      return false;
    }

    // Reject invalid URL
    if (!this.validateUrl(trimmedUrl)) {
      return false;
    }

    // Create new link
    const newLink = {
      id: this.generateId(),
      name: trimmedName,
      url: trimmedUrl
    };

    this.links.push(newLink);
    this.saveLinks();
    return true;
  }

  deleteLink(id) {
    // Remove link from array
    const initialLength = this.links.length;
    this.links = this.links.filter(link => link.id !== id);

    // Only save if something was actually deleted
    if (this.links.length < initialLength) {
      this.saveLinks();
      return true;
    }
    return false;
  }

  renderLinks() {
    // Generate links grid HTML
    const linksGrid = this.container.querySelector('.links-grid');
    if (!linksGrid) {
      console.error('Failed to render links: links-grid element not found');
      return;
    }

    // Use DocumentFragment for batched DOM updates to minimize reflows
    const fragment = document.createDocumentFragment();

    // Render each link
    this.links.forEach(link => {
      const linkButton = document.createElement('div');
      linkButton.className = 'link-button';
      linkButton.dataset.id = link.id;

      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.textContent = link.name;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete-link';
      deleteBtn.textContent = '×';
      deleteBtn.setAttribute('aria-label', `Delete link: ${link.name}`);
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.deleteLink(link.id);
        this.renderLinks();
      });

      linkButton.appendChild(anchor);
      linkButton.appendChild(deleteBtn);
      fragment.appendChild(linkButton);
    });

    // Clear current grid and append fragment in one operation
    linksGrid.innerHTML = '';
    linksGrid.appendChild(fragment);
  }

  init() {
    // Check storage availability
    StorageUtil.checkAvailability();

    // Load links from storage
    this.loadLinks();

    // Create UI structure if not exists
    if (!this.container.querySelector('.link-input-container')) {
      const inputContainer = document.createElement('div');
      inputContainer.className = 'link-input-container';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'link-name-input';
      nameInput.placeholder = 'Name';
      nameInput.maxLength = 50;

      const urlInput = document.createElement('input');
      urlInput.type = 'url';
      urlInput.className = 'link-url-input';
      urlInput.placeholder = 'URL';

      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-link';
      addBtn.textContent = 'Add Link';

      inputContainer.appendChild(nameInput);
      inputContainer.appendChild(urlInput);
      inputContainer.appendChild(addBtn);
      this.container.appendChild(inputContainer);

      const linksGrid = document.createElement('div');
      linksGrid.className = 'links-grid';
      this.container.appendChild(linksGrid);
    }

    // Attach event listeners
    const nameInput = this.container.querySelector('.link-name-input');
    const urlInput = this.container.querySelector('.link-url-input');
    const addBtn = this.container.querySelector('.btn-add-link');

    // Add null checks for DOM elements
    if (!nameInput || !urlInput || !addBtn) {
      console.error('Failed to initialize QuickLinksComponent: Required DOM elements not found');
      return;
    }

    const handleAdd = () => {
      const name = nameInput.value;
      const url = urlInput.value;

      if (this.addLink(name, url)) {
        nameInput.value = '';
        urlInput.value = '';
        this.renderLinks();
      } else {
        // Show error feedback
        if (!name.trim()) {
          nameInput.focus();
        } else if (!this.validateUrl(url.trim())) {
          this.showUrlError('Please enter a valid URL');
          urlInput.focus();
        }
      }
    };

    addBtn.addEventListener('click', handleAdd);
    
    // Allow Enter key in inputs
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAdd();
    });
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

    // Render initial UI
    this.renderLinks();
  }

  showUrlError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'url-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #ff9800; color: white; padding: 12px 20px; border-radius: 4px; z-index: 9999; max-width: 90%; text-align: center;';
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
  }

}

// Dashboard Controller - Initializes and coordinates all components
class Dashboard {
  constructor() {
    this.components = {
      greeting: null,
      timer: null,
      tasks: null,
      links: null
    };
  }

  init() {
    // Initialize all components when DOM is ready
    this.initializeComponents();
  }

  initializeComponents() {
    // Get container elements
    const greetingContainer = document.getElementById('greeting-container');
    const timerContainer = document.getElementById('timer-container');
    const tasksContainer = document.getElementById('tasks-container');
    const linksContainer = document.getElementById('links-container');

    // Instantiate and initialize GreetingComponent
    if (greetingContainer) {
      try {
        this.components.greeting = new GreetingComponent(greetingContainer);
        this.components.greeting.init();
      } catch (error) {
        console.error('Failed to initialize GreetingComponent:', error);
      }
    } else {
      console.warn('Greeting container not found');
    }

    // Instantiate and initialize FocusTimerComponent
    if (timerContainer) {
      try {
        this.components.timer = new FocusTimerComponent(timerContainer);
        this.components.timer.init();
      } catch (error) {
        console.error('Failed to initialize FocusTimerComponent:', error);
      }
    } else {
      console.warn('Timer container not found');
    }

    // Instantiate and initialize TaskListComponent
    if (tasksContainer) {
      try {
        this.components.tasks = new TaskListComponent(tasksContainer);
        this.components.tasks.init();
      } catch (error) {
        console.error('Failed to initialize TaskListComponent:', error);
      }
    } else {
      console.warn('Tasks container not found');
    }

    // Instantiate and initialize QuickLinksComponent
    if (linksContainer) {
      try {
        this.components.links = new QuickLinksComponent(linksContainer);
        this.components.links.init();
      } catch (error) {
        console.error('Failed to initialize QuickLinksComponent:', error);
      }
    } else {
      console.warn('Links container not found');
    }
  }
}

// Initialize Dashboard on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dark mode
  initializeDarkMode();
  
  const dashboard = new Dashboard();
  dashboard.init();
});

// Dark Mode Toggle Functionality
function initializeDarkMode() {
  // Load saved theme preference from localStorage
  const savedTheme = localStorage.getItem('productivity_dashboard_theme');
  
  // Apply saved theme or default to light mode
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon('light');
  }
  
  // Attach event listener to theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleDarkMode);
  }
}

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Apply new theme
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Save preference to localStorage
  try {
    localStorage.setItem('productivity_dashboard_theme', newTheme);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
  
  // Update icon
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Export classes for testing (ES6 module exports)
export {
  GreetingComponent,
  FocusTimerComponent,
  TaskListComponent,
  QuickLinksComponent,
  Dashboard
};
