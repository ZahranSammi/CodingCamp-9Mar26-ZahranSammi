/**
 * Property-Based Test for Task Checkbox Sizing
 * Feature: modern-design-refresh
 * **Validates: Requirements 9.3**
 * 
 * Property 6: Consistent Element Sizing (checkboxes)
 * For any set of similar interactive elements (all checkboxes), 
 * the height and width values must be consistent within that element type,
 * ensuring visual harmony and predictable interaction areas.
 */

import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Property 6: Consistent Checkbox Sizing', () => {
  let dom;
  let document;
  let window;
  let cssContent;

  beforeAll(() => {
    // Read the CSS file
    const cssPath = join(process.cwd(), 'css', 'styles.css');
    cssContent = readFileSync(cssPath, 'utf-8');

    // Read the HTML file
    const htmlPath = join(process.cwd(), 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');

    // Create JSDOM instance with CSS
    dom = new JSDOM(htmlContent, {
      resources: 'usable',
      runScripts: 'dangerously'
    });

    document = dom.window.document;
    window = dom.window;

    // Inject CSS into the document
    const styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);
  });

  afterAll(() => {
    if (dom) {
      dom.window.close();
    }
  });

  test('Property 6: All task checkboxes must have consistent width and height', () => {
    // Create multiple task items with checkboxes
    const taskListContainer = document.createElement('div');
    taskListContainer.innerHTML = `
      <div class="task-list-component">
        <ul class="task-list">
          <li class="task-item task-incomplete">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">Task 1</span>
          </li>
          <li class="task-item task-incomplete">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">Task 2</span>
          </li>
          <li class="task-item task-completed">
            <input type="checkbox" class="task-checkbox" checked>
            <span class="task-text">Task 3</span>
          </li>
          <li class="task-item task-incomplete">
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">Task 4</span>
          </li>
          <li class="task-item task-completed">
            <input type="checkbox" class="task-checkbox" checked>
            <span class="task-text">Task 5</span>
          </li>
        </ul>
      </div>
    `;
    document.body.appendChild(taskListContainer);

    // Get all checkboxes
    const checkboxes = Array.from(document.querySelectorAll('.task-checkbox'));
    expect(checkboxes.length).toBeGreaterThan(0);

    // Get computed styles for all checkboxes
    const checkboxStyles = checkboxes.map(checkbox => {
      const styles = window.getComputedStyle(checkbox);
      return {
        width: styles.width,
        height: styles.height,
        element: checkbox
      };
    });

    // Extract unique width and height values
    const uniqueWidths = new Set(checkboxStyles.map(s => s.width));
    const uniqueHeights = new Set(checkboxStyles.map(s => s.height));

    // Property: All checkboxes must have the same width
    expect(uniqueWidths.size).toBe(1);
    
    // Property: All checkboxes must have the same height
    expect(uniqueHeights.size).toBe(1);

    // Property: Width and height should be equal (square checkboxes)
    const width = checkboxStyles[0].width;
    const height = checkboxStyles[0].height;
    expect(width).toBe(height);

    // Property: Size should be 20px in base styles, 24px on mobile (per Requirement 11.3)
    expect(width).toBe('20px');
    expect(height).toBe('20px');

    // Cleanup
    document.body.removeChild(taskListContainer);
  });

  test('Property 6: Checkbox sizing remains consistent across different task states', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            completed: fc.boolean()
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (tasks) => {
          // Create task list with generated tasks
          const taskListContainer = document.createElement('div');
          const taskItems = tasks.map(task => `
            <li class="task-item ${task.completed ? 'task-completed' : 'task-incomplete'}">
              <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
              <span class="task-text">${task.text}</span>
            </li>
          `).join('');

          taskListContainer.innerHTML = `
            <div class="task-list-component">
              <ul class="task-list">
                ${taskItems}
              </ul>
            </div>
          `;
          document.body.appendChild(taskListContainer);

          // Get all checkboxes
          const checkboxes = Array.from(document.querySelectorAll('.task-checkbox'));
          
          if (checkboxes.length === 0) {
            document.body.removeChild(taskListContainer);
            return true;
          }

          // Get computed styles for all checkboxes
          const checkboxStyles = checkboxes.map(checkbox => {
            const styles = window.getComputedStyle(checkbox);
            return {
              width: styles.width,
              height: styles.height
            };
          });

          // Extract unique width and height values
          const uniqueWidths = new Set(checkboxStyles.map(s => s.width));
          const uniqueHeights = new Set(checkboxStyles.map(s => s.height));

          // Cleanup
          document.body.removeChild(taskListContainer);

          // Property: All checkboxes must have consistent sizing
          return uniqueWidths.size === 1 && uniqueHeights.size === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Checkbox sizing is defined in CSS with explicit values (20px base, 24px mobile)', () => {
    // Verify CSS contains explicit checkbox sizing
    expect(cssContent).toContain('.task-checkbox');
    
    // Find all .task-checkbox blocks
    const checkboxBlocks = [];
    const regex = /\.task-checkbox\s*{[^}]+}/gs;
    let match;
    while ((match = regex.exec(cssContent)) !== null) {
      checkboxBlocks.push(match[0]);
    }
    
    expect(checkboxBlocks.length).toBeGreaterThan(0);
    
    // Find the base styles block (the one with 20px)
    const baseStyleBlock = checkboxBlocks.find(block => block.includes('20px') && !block.includes('24px'));
    expect(baseStyleBlock).toBeTruthy();
    
    expect(baseStyleBlock).toMatch(/width:\s*20px/);
    expect(baseStyleBlock).toMatch(/height:\s*20px/);
    
    // Verify mobile styles increase to 24px (Requirement 11.3)
    expect(cssContent).toMatch(/\.task-checkbox\s*{[^}]*width:\s*24px/);
    expect(cssContent).toMatch(/\.task-checkbox\s*{[^}]*height:\s*24px/);
  });

  test('Property 6: Checkbox sizing uses consistent units (px)', () => {
    // Extract checkbox width and height from CSS
    const checkboxStyleBlock = cssContent.match(/\.task-checkbox\s*{[^}]+}/s);
    expect(checkboxStyleBlock).toBeTruthy();
    
    const styleContent = checkboxStyleBlock[0];
    
    // Extract width value
    const widthMatch = styleContent.match(/width:\s*(\d+px)/);
    expect(widthMatch).toBeTruthy();
    
    // Extract height value
    const heightMatch = styleContent.match(/height:\s*(\d+px)/);
    expect(heightMatch).toBeTruthy();
    
    // Both should use px units
    expect(widthMatch[1]).toMatch(/^\d+px$/);
    expect(heightMatch[1]).toMatch(/^\d+px$/);
    
    // Both should be the same value
    expect(widthMatch[1]).toBe(heightMatch[1]);
  });
});
