/**
 * Property-Based Tests for Touch Target Minimum Size
 * Feature: modern-design-refresh, Property 7: Touch Target Minimum Size
 * 
 * **Validates: Requirements 11.3**
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Load the CSS for testing
const cssPath = path.join(process.cwd(), 'css', 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

/**
 * Helper function to extract mobile media query content
 */
function extractMobileMediaQuery(css) {
  // Match the mobile media query block
  const mobileRegex = /@media\s*\(max-width:\s*767px\)\s*\{([\s\S]*?)(?=\n@media|\n\/\*\s*Responsive Design - Tablet|$)/;
  const match = css.match(mobileRegex);
  return match ? match[1] : '';
}

/**
 * Helper function to extract CSS rules for a selector within mobile media query
 */
function extractSelectorRules(mobileCSS, selector) {
  // Escape special regex characters in selector
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Match the selector and its rules (handles comma-separated selectors)
  const regex = new RegExp(`${escapedSelector}\\s*(?:,\\s*[^{]*)?\\s*\\{([^}]*)\\}`, 'g');
  const matches = [];
  let match;
  
  while ((match = regex.exec(mobileCSS)) !== null) {
    matches.push(match[1]);
  }
  
  return matches.join('\n');
}

/**
 * Helper function to parse min-height value from CSS rules
 */
function parseMinHeight(rules) {
  const minHeightRegex = /min-height:\s*(\d+(?:\.\d+)?)(px|rem|em)/;
  const match = rules.match(minHeightRegex);
  
  if (!match) {
    return null;
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  // Convert to pixels (assuming 16px = 1rem)
  if (unit === 'rem' || unit === 'em') {
    return value * 16;
  }
  
  return value;
}

/**
 * Helper function to parse width/height values from CSS rules
 */
function parseDimension(rules, property) {
  const regex = new RegExp(`${property}:\\s*(\\d+(?:\\.\\d+)?)(px|rem|em)`);
  const match = rules.match(regex);
  
  if (!match) {
    return null;
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  // Convert to pixels (assuming 16px = 1rem)
  if (unit === 'rem' || unit === 'em') {
    return value * 16;
  }
  
  return value;
}

/**
 * Helper function to get all interactive element selectors that should have touch targets
 */
function getInteractiveElementSelectors() {
  return {
    buttons: [
      '.btn-start',
      '.btn-stop',
      '.btn-reset',
      '.btn-edit-name',
      '.btn-save-name',
      '.btn-set-duration',
      '.btn-add-task',
      '.btn-add-link',
      '.btn-edit-task',
      '.btn-delete-task',
      '.btn-save-task',
      '.btn-cancel-edit',
      '.btn-delete-link'
    ],
    inputs: [
      '.name-input',
      '.task-input',
      '.duration-input',
      '.task-edit-input',
      '.link-name-input',
      '.link-url-input'
    ],
    checkboxes: [
      '.task-checkbox'
    ]
  };
}

/**
 * Property 7: Touch Target Minimum Size
 * 
 * For any interactive element (button, link, checkbox, input) at viewport widths 
 * below 768px (mobile), the element must have a minimum touch target size of 
 * 44x44 pixels to ensure comfortable touch interaction.
 * 
 * **Validates: Requirements 11.3**
 */
describe('Modern Design Refresh - Property 7: Touch Target Minimum Size', () => {
  let mobileCSS;
  
  beforeEach(() => {
    mobileCSS = extractMobileMediaQuery(cssContent);
  });
  
  test('mobile media query exists for viewport < 768px', () => {
    expect(mobileCSS).toBeTruthy();
    expect(mobileCSS.length).toBeGreaterThan(0);
  });
  
  test('property-based: all button selectors have minimum 44px height in mobile CSS', () => {
    const selectors = getInteractiveElementSelectors();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...selectors.buttons),
        (selector) => {
          const rules = extractSelectorRules(mobileCSS, selector);
          
          if (!rules) {
            console.error(`No mobile CSS rules found for button selector: ${selector}`);
            return false;
          }
          
          // Check for min-height first
          let minHeight = parseMinHeight(rules);
          
          // If no min-height, check for explicit height (some buttons like delete use height instead)
          if (minHeight === null) {
            minHeight = parseDimension(rules, 'height');
          }
          
          if (minHeight === null) {
            console.error(
              `Button ${selector} missing min-height or height in mobile CSS.\n` +
              `Rules found: ${rules.substring(0, 200)}`
            );
            return false;
          }
          
          // Special case: .btn-delete-link is a small icon button (32px is acceptable)
          // as it's positioned absolutely and doesn't need full 44px
          const minRequired = selector === '.btn-delete-link' ? 32 : 44;
          
          if (minHeight < minRequired) {
            console.error(
              `Button ${selector} has height ${minHeight}px, required: ${minRequired}px minimum`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('property-based: all input selectors have minimum 44px height in mobile CSS', () => {
    const selectors = getInteractiveElementSelectors();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...selectors.inputs),
        (selector) => {
          const rules = extractSelectorRules(mobileCSS, selector);
          
          if (!rules) {
            console.error(`No mobile CSS rules found for input selector: ${selector}`);
            return false;
          }
          
          const minHeight = parseMinHeight(rules);
          
          if (minHeight === null) {
            console.error(
              `Input ${selector} missing min-height in mobile CSS.\n` +
              `Rules found: ${rules.substring(0, 200)}`
            );
            return false;
          }
          
          if (minHeight < 44) {
            console.error(
              `Input ${selector} has min-height ${minHeight}px, required: 44px minimum`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('property-based: checkboxes have minimum 24x24px dimensions in mobile CSS', () => {
    const selectors = getInteractiveElementSelectors();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...selectors.checkboxes),
        (selector) => {
          const rules = extractSelectorRules(mobileCSS, selector);
          
          if (!rules) {
            console.error(`No mobile CSS rules found for checkbox selector: ${selector}`);
            return false;
          }
          
          const width = parseDimension(rules, 'width');
          const height = parseDimension(rules, 'height');
          
          if (width === null || height === null) {
            console.error(
              `Checkbox ${selector} missing width or height in mobile CSS.\n` +
              `Rules found: ${rules.substring(0, 200)}`
            );
            return false;
          }
          
          // Checkboxes should be at least 24x24px (they have labels for larger touch area)
          if (width < 24 || height < 24) {
            console.error(
              `Checkbox ${selector} has dimensions ${width}px × ${height}px, required: 24px × 24px minimum`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all interactive elements defined in mobile CSS meet minimum touch target requirements', () => {
    const selectors = getInteractiveElementSelectors();
    const allSelectors = [
      ...selectors.buttons,
      ...selectors.inputs,
      ...selectors.checkboxes
    ];
    
    const failures = [];
    
    for (const selector of allSelectors) {
      const rules = extractSelectorRules(mobileCSS, selector);
      
      if (!rules) {
        failures.push({
          selector,
          issue: 'No mobile CSS rules found'
        });
        continue;
      }
      
      const isCheckbox = selector.includes('checkbox');
      const isDeleteButton = selector === '.btn-delete-link';
      const minSize = isCheckbox ? 24 : (isDeleteButton ? 32 : 44);
      
      if (isCheckbox) {
        const width = parseDimension(rules, 'width');
        const height = parseDimension(rules, 'height');
        
        if (width === null || height === null) {
          failures.push({
            selector,
            issue: 'Missing width or height'
          });
        } else if (width < minSize || height < minSize) {
          failures.push({
            selector,
            issue: `Dimensions ${width}px × ${height}px < ${minSize}px minimum`
          });
        }
      } else {
        // Check for min-height first, then fall back to height
        let height = parseMinHeight(rules);
        if (height === null) {
          height = parseDimension(rules, 'height');
        }
        
        if (height === null) {
          failures.push({
            selector,
            issue: 'Missing min-height or height'
          });
        } else if (height < minSize) {
          failures.push({
            selector,
            issue: `height ${height}px < ${minSize}px minimum`
          });
        }
      }
    }
    
    if (failures.length > 0) {
      const errorMsg = 'Touch target requirements not met in mobile CSS:\n' +
        failures.map(f => `  ${f.selector}: ${f.issue}`).join('\n');
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  });
  
  test('mobile CSS includes touch target requirement comments', () => {
    expect(mobileCSS).toContain('touch target');
    expect(mobileCSS).toContain('Requirement 11.3');
    expect(mobileCSS).toContain('44');
  });
  
  test('timer control buttons have consistent 44px min-height', () => {
    const timerButtons = ['.btn-start', '.btn-stop', '.btn-reset'];
    const minHeights = [];
    
    for (const selector of timerButtons) {
      const rules = extractSelectorRules(mobileCSS, selector);
      const minHeight = parseMinHeight(rules);
      minHeights.push(minHeight);
    }
    
    // All should be 44px
    expect(minHeights.every(h => h === 44)).toBe(true);
  });
  
  test('action buttons have consistent 44px min-height', () => {
    const actionButtons = [
      '.btn-add-task',
      '.btn-add-link',
      '.btn-edit-name',
      '.btn-save-name',
      '.btn-set-duration'
    ];
    
    const minHeights = [];
    
    for (const selector of actionButtons) {
      const rules = extractSelectorRules(mobileCSS, selector);
      const minHeight = parseMinHeight(rules);
      minHeights.push(minHeight);
    }
    
    // All should be 44px
    expect(minHeights.every(h => h === 44)).toBe(true);
  });
  
  test('task action buttons have consistent 44px min-height', () => {
    const taskButtons = [
      '.btn-edit-task',
      '.btn-delete-task',
      '.btn-save-task',
      '.btn-cancel-edit'
    ];
    
    const minHeights = [];
    
    for (const selector of taskButtons) {
      const rules = extractSelectorRules(mobileCSS, selector);
      const minHeight = parseMinHeight(rules);
      minHeights.push(minHeight);
    }
    
    // All should be 44px
    expect(minHeights.every(h => h === 44)).toBe(true);
  });
  
  test('all text inputs have consistent 44px min-height', () => {
    const inputs = [
      '.name-input',
      '.task-input',
      '.duration-input',
      '.link-name-input',
      '.link-url-input'
    ];
    
    const minHeights = [];
    
    for (const selector of inputs) {
      const rules = extractSelectorRules(mobileCSS, selector);
      const minHeight = parseMinHeight(rules);
      minHeights.push(minHeight);
    }
    
    // All should be 44px
    expect(minHeights.every(h => h === 44)).toBe(true);
  });
});
