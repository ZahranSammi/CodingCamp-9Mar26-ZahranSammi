/**
 * Property-Based Tests for Keyboard Accessibility and Focus Visibility
 * Feature: modern-design-refresh, Property 8: Keyboard Accessibility and Focus Visibility
 * 
 * **Validates: Requirements 13.1, 13.2**
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
 * Helper function to set up a JSDOM environment with CSS
 */
function setupDOM() {
  const dom = new JSDOM(htmlContent, {
    resources: 'usable',
    runScripts: 'dangerously'
  });
  
  const { window } = dom;
  const { document } = window;
  
  // Inject CSS into the document
  const styleElement = document.createElement('style');
  styleElement.textContent = cssContent;
  document.head.appendChild(styleElement);
  
  return { window, document };
}

/**
 * Helper function to get all interactive elements
 */
function getInteractiveElements(document) {
  const interactiveSelectors = [
    'a',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="tab"]',
    '[role="menuitem"]'
  ];
  
  const elements = [];
  interactiveSelectors.forEach(selector => {
    elements.push(...Array.from(document.querySelectorAll(selector)));
  });
  
  // Remove duplicates
  return [...new Set(elements)];
}

/**
 * Helper function to check if element is keyboard accessible
 */
function isKeyboardAccessible(element) {
  const tagName = element.tagName.toLowerCase();
  const nativelyFocusable = ['a', 'button', 'input', 'select', 'textarea'];
  
  // Check if element is natively focusable
  if (nativelyFocusable.includes(tagName)) {
    return true;
  }
  
  // Check if element has tabindex >= 0
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && parseInt(tabIndex, 10) >= 0) {
    return true;
  }
  
  return false;
}

/**
 * Helper function to check if CSS has focus-visible styles
 */
function hasFocusVisibleStyles(cssText) {
  const focusVisibleRegex = /:focus-visible\s*\{/i;
  return focusVisibleRegex.test(cssText);
}

/**
 * Helper function to extract focus-visible rules from CSS
 */
function getFocusVisibleRules(cssText) {
  const rules = [];
  const focusVisibleRegex = /([^}]*):focus-visible\s*\{([^}]+)\}/gi;
  let match;
  
  while ((match = focusVisibleRegex.exec(cssText)) !== null) {
    rules.push({
      selector: match[1].trim(),
      styles: match[2].trim()
    });
  }
  
  return rules;
}

/**
 * Helper function to parse outline width
 */
function parseOutlineWidth(width) {
  if (!width) return 0;
  
  const match = width.match(/(\d+\.?\d*)(px|em|rem)?/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return 0;
}

/**
 * Property 8: Keyboard Accessibility and Focus Visibility
 * 
 * For any interactive element in the dashboard, it must be keyboard accessible
 * (reachable via Tab navigation) and must display a clearly visible focus indicator
 * (outline or custom focus styling with minimum 3px width) when focused.
 * 
 * **Validates: Requirements 13.1, 13.2**
 */
describe('Modern Design Refresh - Property 8: Keyboard Accessibility and Focus Visibility', () => {
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
  
  test('CSS contains focus-visible pseudo-class styles', () => {
    expect(hasFocusVisibleStyles(cssContent)).toBe(true);
  });
  
  test('focus-visible styles include outline property', () => {
    const rules = getFocusVisibleRules(cssContent);
    
    expect(rules.length).toBeGreaterThan(0);
    
    const hasOutline = rules.some(rule => 
      rule.styles.includes('outline')
    );
    
    expect(hasOutline).toBe(true);
  });
  
  test('focus-visible outline width is at least 3px', () => {
    const rules = getFocusVisibleRules(cssContent);
    
    expect(rules.length).toBeGreaterThan(0);
    
    // Check for outline width in the styles
    const outlineWidthRegex = /outline:\s*(\d+\.?\d*)(px|em|rem)/i;
    
    rules.forEach(rule => {
      const match = rule.styles.match(outlineWidthRegex);
      if (match) {
        const width = parseFloat(match[1]);
        expect(width).toBeGreaterThanOrEqual(3);
      }
    });
  });
  
  test('focus-visible styles include outline-offset', () => {
    const rules = getFocusVisibleRules(cssContent);
    
    expect(rules.length).toBeGreaterThan(0);
    
    const hasOutlineOffset = rules.some(rule => 
      rule.styles.includes('outline-offset')
    );
    
    expect(hasOutlineOffset).toBe(true);
  });
  
  test('all interactive elements are keyboard accessible', () => {
    const interactiveElements = getInteractiveElements(document);
    
    if (interactiveElements.length === 0) {
      console.warn('No interactive elements found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveElements),
        (element) => {
          const accessible = isKeyboardAccessible(element);
          
          if (!accessible) {
            console.error(
              `Keyboard accessibility violation on element <${element.tagName.toLowerCase()}> ` +
              `${element.className ? '.' + element.className.split(' ').join('.') : ''}: ` +
              `element is not keyboard accessible`
            );
          }
          
          return accessible;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('buttons are keyboard accessible', () => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    
    if (buttons.length === 0) {
      console.warn('No buttons found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...buttons),
        (button) => {
          const accessible = isKeyboardAccessible(button);
          
          if (!accessible) {
            console.error(
              `Button keyboard accessibility violation: ` +
              `${button.className ? '.' + button.className.split(' ').join('.') : ''}`
            );
          }
          
          return accessible;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('links are keyboard accessible', () => {
    const links = Array.from(document.querySelectorAll('a, [role="link"]'));
    
    if (links.length === 0) {
      console.warn('No links found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...links),
        (link) => {
          const accessible = isKeyboardAccessible(link);
          
          if (!accessible) {
            console.error(
              `Link keyboard accessibility violation: ` +
              `${link.className ? '.' + link.className.split(' ').join('.') : ''}`
            );
          }
          
          return accessible;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('inputs are keyboard accessible', () => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    
    if (inputs.length === 0) {
      console.warn('No input elements found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...inputs),
        (input) => {
          const accessible = isKeyboardAccessible(input);
          
          if (!accessible) {
            console.error(
              `Input keyboard accessibility violation: ` +
              `${input.className ? '.' + input.className.split(' ').join('.') : ''}`
            );
          }
          
          return accessible;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('checkboxes are keyboard accessible', () => {
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"], [role="checkbox"]'));
    
    if (checkboxes.length === 0) {
      console.warn('No checkboxes found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...checkboxes),
        (checkbox) => {
          const accessible = isKeyboardAccessible(checkbox);
          
          if (!accessible) {
            console.error(
              `Checkbox keyboard accessibility violation: ` +
              `${checkbox.className ? '.' + checkbox.className.split(' ').join('.') : ''}`
            );
          }
          
          return accessible;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('focus-visible uses primary color for visibility', () => {
    const rules = getFocusVisibleRules(cssContent);
    
    expect(rules.length).toBeGreaterThan(0);
    
    const usesPrimaryColor = rules.some(rule => 
      rule.styles.includes('--color-primary') || 
      rule.styles.includes('primary')
    );
    
    expect(usesPrimaryColor).toBe(true);
  });
});
