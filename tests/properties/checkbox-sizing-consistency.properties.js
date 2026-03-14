/**
 * Property-Based Tests for Consistent Checkbox Sizing
 * Feature: modern-design-refresh, Property 6: Consistent Element Sizing (checkboxes)
 * 
 * **Validates: Requirements 9.3**
 */

import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Load the HTML and CSS for testing
const htmlPath = path.join(process.cwd(), 'index.html');
const cssPath = path.join(process.cwd(), 'css', 'styles.css');
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
  
  // Render sample task list with multiple checkboxes
  renderSampleTaskList(document);
  
  return { window, document };
}

/**
 * Helper function to render sample task list with checkboxes
 */
function renderSampleTaskList(document) {
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
          <li class="task-item task-incomplete">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">Task 1</span>
            <button class="btn-edit-task">Edit</button>
            <button class="btn-delete-task">Delete</button>
          </li>
          <li class="task-item task-incomplete">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">Task 2</span>
            <button class="btn-edit-task">Edit</button>
            <button class="btn-delete-task">Delete</button>
          </li>
          <li class="task-item task-completed">
            <input type="checkbox" class="task-checkbox" checked>
            <span class="task-text">Task 3</span>
            <button class="btn-edit-task">Edit</button>
            <button class="btn-delete-task">Delete</button>
          </li>
          <li class="task-item task-incomplete">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">Task 4</span>
            <button class="btn-edit-task">Edit</button>
            <button class="btn-delete-task">Delete</button>
          </li>
          <li class="task-item task-completed">
            <input type="checkbox" class="task-checkbox" checked>
            <span class="task-text">Task 5</span>
            <button class="btn-edit-task">Edit</button>
            <button class="btn-delete-task">Delete</button>
          </li>
        </ul>
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
 * Helper function to get computed dimensions of an element
 */
function getComputedDimensions(element, window) {
  const computedStyle = window.getComputedStyle(element);
  const width = parseValueToPixels(computedStyle.width);
  const height = parseValueToPixels(computedStyle.height);
  const borderTop = parseValueToPixels(computedStyle.borderTopWidth);
  const borderBottom = parseValueToPixels(computedStyle.borderBottomWidth);
  const borderLeft = parseValueToPixels(computedStyle.borderLeftWidth);
  const borderRight = parseValueToPixels(computedStyle.borderRightWidth);
  
  return {
    width,
    height,
    totalWidth: width + borderLeft + borderRight,
    totalHeight: height + borderTop + borderBottom,
    borderTop,
    borderBottom,
    borderLeft,
    borderRight
  };
}

/**
 * Helper function to check if values are approximately equal (within 1px tolerance)
 */
function approximatelyEqual(value1, value2, tolerance = 1) {
  return Math.abs(value1 - value2) <= tolerance;
}

/**
 * Property 6: Consistent Element Sizing (checkboxes)
 * 
 * For any set of similar interactive elements (all buttons, all inputs, all checkboxes), 
 * the height and padding values must be consistent within that element type, ensuring 
 * visual harmony and predictable interaction areas.
 * 
 * **Validates: Requirements 9.3**
 */
describe('Modern Design Refresh - Property 6: Consistent Element Sizing (checkboxes)', () => {
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
  
  test('all checkboxes have consistent width', () => {
    const checkboxes = Array.from(document.querySelectorAll('.task-checkbox'));
    
    if (checkboxes.length === 0) {
      throw new Error('No checkboxes found in the document');
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...checkboxes),
        fc.constantFrom(...checkboxes),
        (checkbox1, checkbox2) => {
          const dims1 = getComputedDimensions(checkbox1, window);
          const dims2 = getComputedDimensions(checkbox2, window);
          
          const widthMatch = approximatelyEqual(dims1.totalWidth, dims2.totalWidth, 1);
          
          if (!widthMatch) {
            console.error(
              `Checkbox width mismatch:\n` +
              `  Checkbox 1: ${dims1.totalWidth.toFixed(2)}px\n` +
              `  Checkbox 2: ${dims2.totalWidth.toFixed(2)}px`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all checkboxes have consistent height', () => {
    const checkboxes = Array.from(document.querySelectorAll('.task-checkbox'));
    
    if (checkboxes.length === 0) {
      throw new Error('No checkboxes found in the document');
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...checkboxes),
        fc.constantFrom(...checkboxes),
        (checkbox1, checkbox2) => {
          const dims1 = getComputedDimensions(checkbox1, window);
          const dims2 = getComputedDimensions(checkbox2, window);
          
          const heightMatch = approximatelyEqual(dims1.totalHeight, dims2.totalHeight, 1);
          
          if (!heightMatch) {
            console.error(
              `Checkbox height mismatch:\n` +
              `  Checkbox 1: ${dims1.totalHeight.toFixed(2)}px\n` +
              `  Checkbox 2: ${dims2.totalHeight.toFixed(2)}px`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all checkboxes have consistent border width', () => {
    const checkboxes = Array.from(document.querySelectorAll('.task-checkbox'));
    
    if (checkboxes.length === 0) {
      throw new Error('No checkboxes found in the document');
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...checkboxes),
        fc.constantFrom(...checkboxes),
        (checkbox1, checkbox2) => {
          const dims1 = getComputedDimensions(checkbox1, window);
          const dims2 = getComputedDimensions(checkbox2, window);
          
          const borderMatch = 
            approximatelyEqual(dims1.borderTop, dims2.borderTop, 1) &&
            approximatelyEqual(dims1.borderBottom, dims2.borderBottom, 1) &&
            approximatelyEqual(dims1.borderLeft, dims2.borderLeft, 1) &&
            approximatelyEqual(dims1.borderRight, dims2.borderRight, 1);
          
          if (!borderMatch) {
            console.error(
              `Checkbox border width mismatch:\n` +
              `  Checkbox 1: top=${dims1.borderTop.toFixed(2)}px, right=${dims1.borderRight.toFixed(2)}px, ` +
              `bottom=${dims1.borderBottom.toFixed(2)}px, left=${dims1.borderLeft.toFixed(2)}px\n` +
              `  Checkbox 2: top=${dims2.borderTop.toFixed(2)}px, right=${dims2.borderRight.toFixed(2)}px, ` +
              `bottom=${dims2.borderBottom.toFixed(2)}px, left=${dims2.borderLeft.toFixed(2)}px`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('checked and unchecked checkboxes have identical dimensions', () => {
    const checkedCheckboxes = Array.from(document.querySelectorAll('.task-checkbox:checked'));
    const uncheckedCheckboxes = Array.from(document.querySelectorAll('.task-checkbox:not(:checked)'));
    
    if (checkedCheckboxes.length === 0 || uncheckedCheckboxes.length === 0) {
      console.warn('Need both checked and unchecked checkboxes for this test');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...checkedCheckboxes),
        fc.constantFrom(...uncheckedCheckboxes),
        (checkedBox, uncheckedBox) => {
          const checkedDims = getComputedDimensions(checkedBox, window);
          const uncheckedDims = getComputedDimensions(uncheckedBox, window);
          
          const dimensionsMatch = 
            approximatelyEqual(checkedDims.totalWidth, uncheckedDims.totalWidth, 1) &&
            approximatelyEqual(checkedDims.totalHeight, uncheckedDims.totalHeight, 1);
          
          if (!dimensionsMatch) {
            console.error(
              `Dimension mismatch between checked and unchecked checkboxes:\n` +
              `  Checked: ${checkedDims.totalWidth.toFixed(2)}px × ${checkedDims.totalHeight.toFixed(2)}px\n` +
              `  Unchecked: ${uncheckedDims.totalWidth.toFixed(2)}px × ${uncheckedDims.totalHeight.toFixed(2)}px`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all checkboxes maintain consistent sizing across the entire task list', () => {
    const checkboxes = Array.from(document.querySelectorAll('.task-checkbox'));
    
    if (checkboxes.length === 0) {
      throw new Error('No checkboxes found in the document');
    }
    
    // Get dimensions for all checkboxes
    const allDimensions = checkboxes.map(checkbox => getComputedDimensions(checkbox, window));
    
    // Check that all checkboxes have the same dimensions
    const reference = allDimensions[0];
    const allMatch = allDimensions.every(dims =>
      approximatelyEqual(dims.totalWidth, reference.totalWidth, 1) &&
      approximatelyEqual(dims.totalHeight, reference.totalHeight, 1) &&
      approximatelyEqual(dims.borderTop, reference.borderTop, 1) &&
      approximatelyEqual(dims.borderBottom, reference.borderBottom, 1) &&
      approximatelyEqual(dims.borderLeft, reference.borderLeft, 1) &&
      approximatelyEqual(dims.borderRight, reference.borderRight, 1)
    );
    
    if (!allMatch) {
      const errorMsg = 'Checkboxes have inconsistent dimensions:\n' +
        checkboxes.map((checkbox, idx) => {
          const d = allDimensions[idx];
          return `  Checkbox ${idx + 1}: ${d.totalWidth.toFixed(2)}px × ${d.totalHeight.toFixed(2)}px, ` +
                 `border=${d.borderTop.toFixed(2)}/${d.borderRight.toFixed(2)}/` +
                 `${d.borderBottom.toFixed(2)}/${d.borderLeft.toFixed(2)}`;
        }).join('\n');
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    expect(allMatch).toBe(true);
  });
  
  test('checkboxes have square aspect ratio (width equals height)', () => {
    const checkboxes = Array.from(document.querySelectorAll('.task-checkbox'));
    
    if (checkboxes.length === 0) {
      throw new Error('No checkboxes found in the document');
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...checkboxes),
        (checkbox) => {
          const dims = getComputedDimensions(checkbox, window);
          
          const isSquare = approximatelyEqual(dims.totalWidth, dims.totalHeight, 1);
          
          if (!isSquare) {
            console.error(
              `Checkbox is not square:\n` +
              `  Width: ${dims.totalWidth.toFixed(2)}px\n` +
              `  Height: ${dims.totalHeight.toFixed(2)}px`
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
