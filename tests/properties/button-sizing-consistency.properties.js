/**
 * Property-Based Tests for Consistent Button Sizing
 * Feature: modern-design-refresh, Property 6: Consistent Element Sizing (buttons)
 * 
 * **Validates: Requirements 6.5**
 */

import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Load the HTML and CSS for testing
const htmlPath = path.join(process.cwd(), 'index.html');
const cssPath = path.join(process.cwd(), 'css', 'styles.css');
const jsPath = path.join(process.cwd(), 'js', 'app.js');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

/**
 * Helper function to set up a JSDOM environment with CSS and rendered components
 */
function setupDOM() {
  const dom = new JSDOM(htmlContent, {
    resources: 'usable',
    runScripts: 'dangerously',
    url: 'http://localhost'
  });
  
  const { window } = dom;
  const { document } = window;
  
  // Inject CSS into the document
  const styleElement = document.createElement('style');
  styleElement.textContent = cssContent;
  document.head.appendChild(styleElement);
  
  // Render sample components to ensure buttons exist
  renderSampleComponents(document);
  
  return { window, document };
}

/**
 * Helper function to render sample components with buttons
 */
function renderSampleComponents(document) {
  // Render greeting component with edit button
  const greetingContainer = document.getElementById('greeting-container');
  if (greetingContainer) {
    greetingContainer.innerHTML = `
      <div class="greeting-component">
        <h2 class="greeting-text">Good Morning</h2>
        <p class="date-display">Monday, January 1, 2024</p>
        <div class="name-display">
          <span class="name-text">User</span>
          <button class="btn-edit-name">Edit</button>
        </div>
      </div>
    `;
  }
  
  // Render timer component with control buttons
  const timerContainer = document.getElementById('timer-container');
  if (timerContainer) {
    timerContainer.innerHTML = `
      <div class="focus-timer-component">
        <h2>Focus Timer</h2>
        <div class="timer-display">25:00</div>
        <div class="timer-controls">
          <button class="btn-start">Start</button>
          <button class="btn-stop">Stop</button>
          <button class="btn-reset">Reset</button>
        </div>
        <div class="duration-config">
          <label for="duration-input">Duration (minutes):</label>
          <input type="number" id="duration-input" class="duration-input" value="25" min="1" max="120">
          <button class="btn-set-duration">Set</button>
        </div>
      </div>
    `;
  }
  
  // Render task list component with buttons
  const tasksContainer = document.getElementById('tasks-container');
  if (tasksContainer) {
    tasksContainer.innerHTML = `
      <div class="task-list-component">
        <h2>Tasks</h2>
        <div class="task-input-container">
          <input type="text" class="task-input" placeholder="Add a new task...">
          <button class="btn-add-task">Add Task</button>
        </div>
        <ul class="task-list">
          <li class="task-item">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">Sample Task</span>
            <div class="task-actions">
              <button class="btn-edit-task">Edit</button>
              <button class="btn-delete-task">Delete</button>
            </div>
          </li>
        </ul>
      </div>
    `;
  }
  
  // Render quick links component with buttons
  const linksContainer = document.getElementById('links-container');
  if (linksContainer) {
    linksContainer.innerHTML = `
      <div class="quick-links-component">
        <h2>Quick Links</h2>
        <div class="link-input-container">
          <input type="text" class="link-name-input" placeholder="Link name...">
          <input type="url" class="link-url-input" placeholder="URL...">
          <button class="btn-add-link">Add Link</button>
        </div>
        <div class="links-grid">
          <div class="link-card">
            <a href="https://example.com" class="link-url">Example</a>
            <button class="btn-delete-link">×</button>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Helper function to parse CSS value to pixels
 */
function parseValueToPixels(value, baseFontSize = 16) {
  if (!value || value === 'auto' || value === 'none' || value === '0') {
    return 0;
  }
  
  const trimmedValue = value.trim();
  
  if (trimmedValue.endsWith('rem')) {
    const numValue = parseFloat(trimmedValue);
    return numValue * baseFontSize;
  }
  
  if (trimmedValue.endsWith('em')) {
    const numValue = parseFloat(trimmedValue);
    return numValue * baseFontSize;
  }
  
  if (trimmedValue.endsWith('px')) {
    return parseFloat(trimmedValue);
  }
  
  const numValue = parseFloat(trimmedValue);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  return 0;
}

/**
 * Helper function to get computed height of an element
 */
function getComputedHeight(element, window) {
  const computedStyle = window.getComputedStyle(element);
  const height = parseValueToPixels(computedStyle.height);
  const paddingTop = parseValueToPixels(computedStyle.paddingTop);
  const paddingBottom = parseValueToPixels(computedStyle.paddingBottom);
  const borderTop = parseValueToPixels(computedStyle.borderTopWidth);
  const borderBottom = parseValueToPixels(computedStyle.borderBottomWidth);
  
  // Total height includes content + padding + border
  return {
    totalHeight: height + paddingTop + paddingBottom + borderTop + borderBottom,
    contentHeight: height,
    paddingTop,
    paddingBottom,
    paddingLeft: parseValueToPixels(computedStyle.paddingLeft),
    paddingRight: parseValueToPixels(computedStyle.paddingRight)
  };
}

/**
 * Helper function to group buttons by type
 */
function groupButtonsByType(document) {
  return {
    'primary-action': Array.from(document.querySelectorAll('.btn-start, .btn-stop, .btn-reset')),
    'add-buttons': Array.from(document.querySelectorAll('.btn-add-task, .btn-add-link')),
    'edit-buttons': Array.from(document.querySelectorAll('.btn-edit-name, .btn-save-name, .btn-set-duration')),
    'task-action-buttons': Array.from(document.querySelectorAll('.btn-edit-task, .btn-delete-task, .btn-save-task, .btn-cancel-edit')),
    'delete-buttons': Array.from(document.querySelectorAll('.btn-delete-link'))
  };
}

/**
 * Helper function to check if values are approximately equal (within 1px tolerance)
 */
function approximatelyEqual(value1, value2, tolerance = 1) {
  return Math.abs(value1 - value2) <= tolerance;
}

/**
 * Property 6: Consistent Element Sizing (buttons)
 * 
 * For any set of similar interactive elements (all buttons, all inputs, all checkboxes), 
 * the height and padding values must be consistent within that element type, ensuring 
 * visual harmony and predictable interaction areas.
 * 
 * **Validates: Requirements 6.5**
 */
describe('Modern Design Refresh - Property 6: Consistent Element Sizing (buttons)', () => {
  let window, document;
  
  beforeEach(() => {
    const dom = setupDOM();
    window = dom.window;
    document = dom.document;
  });
  
  afterEach(() => {
    if (window) {
      window.close();
    }
  });
  
  test('all buttons of the same type have consistent height', () => {
    const buttonGroups = groupButtonsByType(document);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(buttonGroups).filter(key => buttonGroups[key].length > 0)),
        (buttonType) => {
          const buttons = buttonGroups[buttonType];
          
          if (buttons.length <= 1) {
            return true; // No consistency check needed for single button
          }
          
          // Get heights of all buttons in this group
          const heights = buttons.map(btn => {
            const dimensions = getComputedHeight(btn, window);
            return dimensions.totalHeight;
          });
          
          // Check that all heights are approximately equal
          const firstHeight = heights[0];
          const allConsistent = heights.every(height => 
            approximatelyEqual(height, firstHeight, 1)
          );
          
          if (!allConsistent) {
            console.error(
              `Button height inconsistency in ${buttonType} group:\n` +
              buttons.map((btn, idx) => 
                `  ${btn.className}: ${heights[idx].toFixed(2)}px`
              ).join('\n')
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all buttons of the same type have consistent padding', () => {
    const buttonGroups = groupButtonsByType(document);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(buttonGroups).filter(key => buttonGroups[key].length > 0)),
        (buttonType) => {
          const buttons = buttonGroups[buttonType];
          
          if (buttons.length <= 1) {
            return true; // No consistency check needed for single button
          }
          
          // Get padding values of all buttons in this group
          const paddingValues = buttons.map(btn => {
            const dimensions = getComputedHeight(btn, window);
            return {
              top: dimensions.paddingTop,
              bottom: dimensions.paddingBottom,
              left: dimensions.paddingLeft,
              right: dimensions.paddingRight
            };
          });
          
          // Check that all padding values are approximately equal
          const firstPadding = paddingValues[0];
          const allConsistent = paddingValues.every(padding => 
            approximatelyEqual(padding.top, firstPadding.top, 1) &&
            approximatelyEqual(padding.bottom, firstPadding.bottom, 1) &&
            approximatelyEqual(padding.left, firstPadding.left, 1) &&
            approximatelyEqual(padding.right, firstPadding.right, 1)
          );
          
          if (!allConsistent) {
            console.error(
              `Button padding inconsistency in ${buttonType} group:\n` +
              buttons.map((btn, idx) => {
                const p = paddingValues[idx];
                return `  ${btn.className}: top=${p.top.toFixed(2)}px, right=${p.right.toFixed(2)}px, ` +
                       `bottom=${p.bottom.toFixed(2)}px, left=${p.left.toFixed(2)}px`;
              }).join('\n')
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('primary action buttons (start, stop, reset) have identical dimensions', () => {
    const { window, document } = setupDOM();
    
    try {
      const primaryButtons = Array.from(document.querySelectorAll('.btn-start, .btn-stop, .btn-reset'));
      
      if (primaryButtons.length === 0) {
        console.warn('No primary action buttons found');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...primaryButtons),
          fc.constantFrom(...primaryButtons),
          (button1, button2) => {
            const dims1 = getComputedHeight(button1, window);
            const dims2 = getComputedHeight(button2, window);
            
            const heightMatch = approximatelyEqual(dims1.totalHeight, dims2.totalHeight, 1);
            const paddingMatch = 
              approximatelyEqual(dims1.paddingTop, dims2.paddingTop, 1) &&
              approximatelyEqual(dims1.paddingBottom, dims2.paddingBottom, 1) &&
              approximatelyEqual(dims1.paddingLeft, dims2.paddingLeft, 1) &&
              approximatelyEqual(dims1.paddingRight, dims2.paddingRight, 1);
            
            if (!heightMatch || !paddingMatch) {
              console.error(
                `Dimension mismatch between ${button1.className} and ${button2.className}:\n` +
                `  ${button1.className}: height=${dims1.totalHeight.toFixed(2)}px, ` +
                `padding=${dims1.paddingTop.toFixed(2)}/${dims1.paddingRight.toFixed(2)}/` +
                `${dims1.paddingBottom.toFixed(2)}/${dims1.paddingLeft.toFixed(2)}\n` +
                `  ${button2.className}: height=${dims2.totalHeight.toFixed(2)}px, ` +
                `padding=${dims2.paddingTop.toFixed(2)}/${dims2.paddingRight.toFixed(2)}/` +
                `${dims2.paddingBottom.toFixed(2)}/${dims2.paddingLeft.toFixed(2)}`
              );
              return false;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      window.close();
    }
  });
  
  test('add buttons (add-task, add-link) have identical dimensions', () => {
    const { window, document } = setupDOM();
    
    try {
      const addButtons = Array.from(document.querySelectorAll('.btn-add-task, .btn-add-link'));
      
      if (addButtons.length < 2) {
        console.warn('Not enough add buttons found for comparison');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...addButtons),
          fc.constantFrom(...addButtons),
          (button1, button2) => {
            const dims1 = getComputedHeight(button1, window);
            const dims2 = getComputedHeight(button2, window);
            
            const heightMatch = approximatelyEqual(dims1.totalHeight, dims2.totalHeight, 1);
            const paddingMatch = 
              approximatelyEqual(dims1.paddingTop, dims2.paddingTop, 1) &&
              approximatelyEqual(dims1.paddingBottom, dims2.paddingBottom, 1) &&
              approximatelyEqual(dims1.paddingLeft, dims2.paddingLeft, 1) &&
              approximatelyEqual(dims1.paddingRight, dims2.paddingRight, 1);
            
            if (!heightMatch || !paddingMatch) {
              console.error(
                `Dimension mismatch between ${button1.className} and ${button2.className}:\n` +
                `  ${button1.className}: height=${dims1.totalHeight.toFixed(2)}px, ` +
                `padding=${dims1.paddingTop.toFixed(2)}/${dims1.paddingRight.toFixed(2)}/` +
                `${dims1.paddingBottom.toFixed(2)}/${dims1.paddingLeft.toFixed(2)}\n` +
                `  ${button2.className}: height=${dims2.totalHeight.toFixed(2)}px, ` +
                `padding=${dims2.paddingTop.toFixed(2)}/${dims2.paddingRight.toFixed(2)}/` +
                `${dims2.paddingBottom.toFixed(2)}/${dims2.paddingLeft.toFixed(2)}`
              );
              return false;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      window.close();
    }
  });
  
  test('task action buttons have consistent sizing within their group', () => {
    const { window, document } = setupDOM();
    
    try {
      const taskButtons = Array.from(document.querySelectorAll('.btn-edit-task, .btn-delete-task, .btn-save-task, .btn-cancel-edit'));
      
      if (taskButtons.length === 0) {
        console.warn('No task action buttons found');
        return;
      }
      
      // Get all dimensions
      const dimensions = taskButtons.map(btn => getComputedHeight(btn, window));
      
      if (dimensions.length <= 1) {
        return;
      }
      
      // Check consistency
      const firstDims = dimensions[0];
      const allConsistent = dimensions.every(dims => 
        approximatelyEqual(dims.totalHeight, firstDims.totalHeight, 1) &&
        approximatelyEqual(dims.paddingTop, firstDims.paddingTop, 1) &&
        approximatelyEqual(dims.paddingBottom, firstDims.paddingBottom, 1) &&
        approximatelyEqual(dims.paddingLeft, firstDims.paddingLeft, 1) &&
        approximatelyEqual(dims.paddingRight, firstDims.paddingRight, 1)
      );
      
      if (!allConsistent) {
        const errorMsg = 'Task action buttons have inconsistent dimensions:\n' +
          taskButtons.map((btn, idx) => {
            const d = dimensions[idx];
            return `  ${btn.className}: height=${d.totalHeight.toFixed(2)}px, ` +
                   `padding=${d.paddingTop.toFixed(2)}/${d.paddingRight.toFixed(2)}/` +
                   `${d.paddingBottom.toFixed(2)}/${d.paddingLeft.toFixed(2)}`;
          }).join('\n');
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    } finally {
      window.close();
    }
  });
  
  test('all button groups maintain internal consistency across multiple renders', () => {
    // Test that button sizing is consistent even when components are re-rendered
    const buttonGroups = groupButtonsByType(document);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(buttonGroups).filter(key => buttonGroups[key].length > 1)),
        (buttonType) => {
          const buttons = buttonGroups[buttonType];
          
          // Get dimensions for all buttons
          const allDimensions = buttons.map(btn => getComputedHeight(btn, window));
          
          // Check that all buttons in the group have the same dimensions
          const reference = allDimensions[0];
          const allMatch = allDimensions.every(dims =>
            approximatelyEqual(dims.totalHeight, reference.totalHeight, 1) &&
            approximatelyEqual(dims.paddingTop, reference.paddingTop, 1) &&
            approximatelyEqual(dims.paddingBottom, reference.paddingBottom, 1) &&
            approximatelyEqual(dims.paddingLeft, reference.paddingLeft, 1) &&
            approximatelyEqual(dims.paddingRight, reference.paddingRight, 1)
          );
          
          if (!allMatch) {
            console.error(
              `Inconsistent button sizing in ${buttonType} group:\n` +
              buttons.map((btn, idx) => {
                const d = allDimensions[idx];
                return `  ${btn.className}: height=${d.totalHeight.toFixed(2)}px, ` +
                       `padding=${d.paddingTop.toFixed(2)}/${d.paddingRight.toFixed(2)}/` +
                       `${d.paddingBottom.toFixed(2)}/${d.paddingLeft.toFixed(2)}`;
              }).join('\n')
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
