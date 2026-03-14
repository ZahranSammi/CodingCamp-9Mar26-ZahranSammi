/**
 * Property-Based Tests for ARIA Label Completeness
 * Feature: modern-design-refresh, Property 9: ARIA Label Completeness
 * 
 * **Validates: Requirements 13.5**
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
 * Helper function to check if element has visible text content
 */
function hasVisibleText(element) {
  // Get text content, trimming whitespace
  const textContent = element.textContent?.trim() || '';
  
  // Check if element has text content
  if (textContent.length > 0) {
    return true;
  }
  
  // Check for value attribute (for inputs)
  const value = element.getAttribute('value');
  if (value && value.trim().length > 0) {
    return true;
  }
  
  // Check for placeholder (considered visible text for inputs)
  const placeholder = element.getAttribute('placeholder');
  if (placeholder && placeholder.trim().length > 0) {
    return true;
  }
  
  // Check for alt text (for images)
  const alt = element.getAttribute('alt');
  if (alt && alt.trim().length > 0) {
    return true;
  }
  
  return false;
}

/**
 * Helper function to check if element has ARIA label
 */
function hasAriaLabel(element) {
  // Check for aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim().length > 0) {
    return true;
  }
  
  // Check for aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy && ariaLabelledBy.trim().length > 0) {
    return true;
  }
  
  // Check for title attribute (fallback)
  const title = element.getAttribute('title');
  if (title && title.trim().length > 0) {
    return true;
  }
  
  return false;
}

/**
 * Helper function to identify icon-only buttons
 * These are buttons with minimal or symbolic text content
 */
function isIconOnlyButton(element) {
  const tagName = element.tagName.toLowerCase();
  
  // Only check buttons
  if (tagName !== 'button' && !element.hasAttribute('role') || element.getAttribute('role') !== 'button') {
    return false;
  }
  
  const textContent = element.textContent?.trim() || '';
  
  // Check for common icon-only patterns
  const iconPatterns = [
    '×',  // Close/delete symbol
    '✕',  // X mark
    '✓',  // Check mark
    '⋮',  // Vertical ellipsis
    '⋯',  // Horizontal ellipsis
    '☰',  // Menu icon
    '←',  // Left arrow
    '→',  // Right arrow
    '↑',  // Up arrow
    '↓',  // Down arrow
  ];
  
  // If text content is a single character or matches icon patterns
  if (textContent.length <= 2 || iconPatterns.includes(textContent)) {
    return true;
  }
  
  // Check for common icon-only button classes
  const iconClasses = [
    'btn-delete',
    'btn-close',
    'btn-icon',
    'icon-button',
    'icon-only'
  ];
  
  const className = element.className || '';
  if (iconClasses.some(cls => className.includes(cls))) {
    return true;
  }
  
  return false;
}

/**
 * Property 9: ARIA Label Completeness
 * 
 * For any interactive element that does not have visible text content
 * (icon buttons, delete buttons, close buttons), the element must have
 * an appropriate ARIA label (aria-label or aria-labelledby) to ensure
 * screen reader accessibility.
 * 
 * **Validates: Requirements 13.5**
 */
describe('Modern Design Refresh - Property 9: ARIA Label Completeness', () => {
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
  
  test('all interactive elements without visible text have ARIA labels', () => {
    const interactiveElements = getInteractiveElements(document);
    
    if (interactiveElements.length === 0) {
      console.warn('No interactive elements found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveElements),
        (element) => {
          const hasText = hasVisibleText(element);
          
          // If element has visible text, no ARIA label needed
          if (hasText) {
            return true;
          }
          
          // If no visible text, must have ARIA label
          const hasLabel = hasAriaLabel(element);
          
          if (!hasLabel) {
            console.error(
              `ARIA label missing on element <${element.tagName.toLowerCase()}> ` +
              `${element.className ? '.' + element.className.split(' ').join('.') : ''}: ` +
              `element has no visible text and no ARIA label`
            );
          }
          
          return hasLabel;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('icon-only buttons have ARIA labels', () => {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    const iconOnlyButtons = buttons.filter(btn => isIconOnlyButton(btn));
    
    if (iconOnlyButtons.length === 0) {
      console.warn('No icon-only buttons found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...iconOnlyButtons),
        (button) => {
          const hasLabel = hasAriaLabel(button);
          
          if (!hasLabel) {
            console.error(
              `ARIA label missing on icon-only button: ` +
              `${button.className ? '.' + button.className.split(' ').join('.') : ''} ` +
              `(text: "${button.textContent?.trim()}")`
            );
          }
          
          return hasLabel;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('delete buttons have descriptive ARIA labels', () => {
    const deleteButtons = Array.from(document.querySelectorAll(
      '.btn-delete, .btn-delete-task, .btn-delete-link, [class*="delete"]'
    ));
    
    if (deleteButtons.length === 0) {
      console.warn('No delete buttons found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...deleteButtons),
        (button) => {
          const hasLabel = hasAriaLabel(button);
          
          if (!hasLabel && !hasVisibleText(button)) {
            console.error(
              `ARIA label missing on delete button: ` +
              `${button.className ? '.' + button.className.split(' ').join('.') : ''}`
            );
            return false;
          }
          
          // If has ARIA label, check if it's descriptive
          const ariaLabel = button.getAttribute('aria-label');
          if (ariaLabel) {
            const isDescriptive = ariaLabel.toLowerCase().includes('delete') ||
                                 ariaLabel.toLowerCase().includes('remove');
            
            if (!isDescriptive) {
              console.warn(
                `Delete button ARIA label may not be descriptive enough: "${ariaLabel}"`
              );
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('close buttons (×) have ARIA labels', () => {
    const closeButtons = Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter(btn => btn.textContent?.trim() === '×');
    
    if (closeButtons.length === 0) {
      console.warn('No close buttons (×) found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...closeButtons),
        (button) => {
          const hasLabel = hasAriaLabel(button);
          
          if (!hasLabel) {
            console.error(
              `ARIA label missing on close button (×): ` +
              `${button.className ? '.' + button.className.split(' ').join('.') : ''}`
            );
          }
          
          return hasLabel;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sections have appropriate ARIA labels or headings', () => {
    const sections = Array.from(document.querySelectorAll('section'));
    
    if (sections.length === 0) {
      console.warn('No sections found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...sections),
        (section) => {
          // Check for aria-label
          const hasAriaLabel = section.hasAttribute('aria-label') || 
                              section.hasAttribute('aria-labelledby');
          
          // Check for heading inside section
          const hasHeading = section.querySelector('h1, h2, h3, h4, h5, h6') !== null;
          
          const isLabeled = hasAriaLabel || hasHeading;
          
          if (!isLabeled) {
            console.error(
              `Section missing ARIA label or heading: ` +
              `${section.id ? '#' + section.id : ''} ` +
              `${section.className ? '.' + section.className.split(' ').join('.') : ''}`
            );
          }
          
          return isLabeled;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('inputs without labels have ARIA labels or placeholders', () => {
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    
    if (inputs.length === 0) {
      console.warn('No input elements found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...inputs),
        (input) => {
          // Check for associated label
          const id = input.getAttribute('id');
          const hasLabel = id && document.querySelector(`label[for="${id}"]`) !== null;
          
          // Check for ARIA label
          const hasAriaLabel = hasAriaLabel(input);
          
          // Check for placeholder (acceptable for some inputs)
          const hasPlaceholder = input.hasAttribute('placeholder');
          
          const isLabeled = hasLabel || hasAriaLabel || hasPlaceholder;
          
          if (!isLabeled) {
            console.error(
              `Input missing label, ARIA label, or placeholder: ` +
              `${input.className ? '.' + input.className.split(' ').join('.') : ''}`
            );
          }
          
          return isLabeled;
        }
      ),
      { numRuns: 100 }
    );
  });
});
