/**
 * Property-Based Tests for Animation Duration Bounds
 * Feature: modern-design-refresh, Property 3: Animation Duration Bounds
 * 
 * **Validates: Requirements 3.5, 15.4**
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
 * Helper function to parse duration string to milliseconds
 * Handles 's' (seconds) and 'ms' (milliseconds) units
 */
function parseDurationToMs(duration) {
  if (!duration || duration === '0' || duration === '0s' || duration === '0ms') {
    return 0;
  }
  
  const trimmedDuration = duration.trim();
  
  // Handle seconds
  if (trimmedDuration.endsWith('s') && !trimmedDuration.endsWith('ms')) {
    const seconds = parseFloat(trimmedDuration);
    return seconds * 1000;
  }
  
  // Handle milliseconds
  if (trimmedDuration.endsWith('ms')) {
    return parseFloat(trimmedDuration);
  }
  
  // Try to parse as number (assume milliseconds)
  const numValue = parseFloat(trimmedDuration);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  return 0;
}

/**
 * Helper function to extract all transition durations from computed style
 */
function getTransitionDurations(computedStyle) {
  const transitionDuration = computedStyle.transitionDuration;
  
  if (!transitionDuration || transitionDuration === '0s') {
    return [];
  }
  
  // Split by comma to handle multiple transitions
  const durations = transitionDuration.split(',').map(d => d.trim());
  return durations.map(d => parseDurationToMs(d)).filter(d => d > 0);
}

/**
 * Helper function to extract animation durations from CSS rules
 * This parses the CSS text directly to find animation durations
 * Excludes durations from the reduced motion media query
 */
function getAnimationDurationsFromCSS(cssText) {
  const durations = [];
  
  // Remove the reduced motion media query section to exclude 0.01ms durations
  const reducedMotionRegex = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/gi;
  const cssWithoutReducedMotion = cssText.replace(reducedMotionRegex, '');
  
  // Match animation and animation-duration properties
  const animationRegex = /animation(?:-duration)?:\s*([^;]+);/gi;
  let match;
  
  while ((match = animationRegex.exec(cssWithoutReducedMotion)) !== null) {
    const value = match[1].trim();
    
    // Extract duration from animation shorthand or animation-duration
    // Format: animation: name duration timing-function delay iteration-count direction fill-mode;
    // or animation-duration: duration;
    const durationMatch = value.match(/(\d+\.?\d*)(s|ms)/);
    
    if (durationMatch) {
      const duration = parseDurationToMs(durationMatch[0]);
      if (duration > 0) {
        durations.push(duration);
      }
    }
  }
  
  return durations;
}

/**
 * Helper function to get all animated elements
 * Elements with transitions or animations defined
 */
function getAnimatedElements(document, window) {
  const allElements = Array.from(document.querySelectorAll('*'));
  const animatedElements = [];
  
  for (const element of allElements) {
    const computedStyle = window.getComputedStyle(element);
    
    // Check for transitions
    const transitionDuration = computedStyle.transitionDuration;
    if (transitionDuration && transitionDuration !== '0s') {
      animatedElements.push(element);
      continue;
    }
    
    // Check for animations
    const animationDuration = computedStyle.animationDuration;
    if (animationDuration && animationDuration !== '0s') {
      animatedElements.push(element);
    }
  }
  
  return animatedElements;
}

/**
 * Property 3: Animation Duration Bounds
 * 
 * For any CSS animation or transition applied to interactive elements or components,
 * the duration must be between 150ms and 400ms to ensure responsiveness while
 * maintaining smooth motion.
 * 
 * **Validates: Requirements 3.5, 15.4**
 */
describe('Modern Design Refresh - Property 3: Animation Duration Bounds', () => {
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
  
  test('all transition durations are between 150ms and 400ms for any element', () => {
    const animatedElements = getAnimatedElements(document, window);
    
    if (animatedElements.length === 0) {
      console.warn('No animated elements found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...animatedElements),
        (element) => {
          const computedStyle = window.getComputedStyle(element);
          const durations = getTransitionDurations(computedStyle);
          
          for (const duration of durations) {
            if (duration < 150 || duration > 400) {
              console.error(
                `Transition duration violation on element <${element.tagName.toLowerCase()}> ` +
                `${element.className ? '.' + element.className.split(' ').join('.') : ''}: ` +
                `duration = ${duration}ms (must be between 150ms and 400ms)`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all animation durations defined in CSS are between 150ms and 400ms', () => {
    const durations = getAnimationDurationsFromCSS(cssContent);
    
    if (durations.length === 0) {
      console.warn('No animation durations found in CSS');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...durations),
        (duration) => {
          if (duration < 150 || duration > 400) {
            console.error(
              `Animation duration violation in CSS: ` +
              `duration = ${duration}ms (must be between 150ms and 400ms)`
            );
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('component section entrance animations have durations between 150ms and 400ms', () => {
    const componentSections = Array.from(document.querySelectorAll('.component-section'));
    
    if (componentSections.length === 0) {
      console.warn('No component sections found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...componentSections),
        (section) => {
          const computedStyle = window.getComputedStyle(section);
          
          // Check animation duration
          const animationDuration = computedStyle.animationDuration;
          if (animationDuration && animationDuration !== '0s') {
            const duration = parseDurationToMs(animationDuration);
            
            if (duration > 0 && (duration < 150 || duration > 400)) {
              console.error(
                `Component section animation duration violation: ` +
                `duration = ${duration}ms (must be between 150ms and 400ms)`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('button hover and active transitions have durations between 150ms and 400ms', () => {
    const buttons = Array.from(document.querySelectorAll(
      'button, .btn-start, .btn-stop, .btn-reset, .btn-add-task, .btn-add-link, .btn-edit-name, .btn-save-name'
    ));
    
    if (buttons.length === 0) {
      console.warn('No buttons found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...buttons),
        (button) => {
          const computedStyle = window.getComputedStyle(button);
          const durations = getTransitionDurations(computedStyle);
          
          for (const duration of durations) {
            if (duration < 150 || duration > 400) {
              console.error(
                `Button transition duration violation on <${button.tagName.toLowerCase()}> ` +
                `${button.className ? '.' + button.className.split(' ').join('.') : ''}: ` +
                `duration = ${duration}ms (must be between 150ms and 400ms)`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('input focus transitions have durations between 150ms and 400ms', () => {
    const inputs = Array.from(document.querySelectorAll(
      'input, textarea, .task-input, .name-input, .duration-input, .link-name-input, .link-url-input'
    ));
    
    if (inputs.length === 0) {
      console.warn('No input elements found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...inputs),
        (input) => {
          const computedStyle = window.getComputedStyle(input);
          const durations = getTransitionDurations(computedStyle);
          
          for (const duration of durations) {
            if (duration < 150 || duration > 400) {
              console.error(
                `Input transition duration violation on <${input.tagName.toLowerCase()}> ` +
                `${input.className ? '.' + input.className.split(' ').join('.') : ''}: ` +
                `duration = ${duration}ms (must be between 150ms and 400ms)`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('task checkbox animations have durations between 150ms and 400ms', () => {
    const checkboxes = Array.from(document.querySelectorAll('.task-checkbox, input[type="checkbox"]'));
    
    if (checkboxes.length === 0) {
      console.warn('No checkboxes found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...checkboxes),
        (checkbox) => {
          const computedStyle = window.getComputedStyle(checkbox);
          const durations = getTransitionDurations(computedStyle);
          
          for (const duration of durations) {
            if (duration < 150 || duration > 400) {
              console.error(
                `Checkbox transition duration violation: ` +
                `duration = ${duration}ms (must be between 150ms and 400ms)`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('card hover effects have transition durations between 150ms and 400ms', () => {
    const cards = Array.from(document.querySelectorAll('.component-section, .link-button, .task-item'));
    
    if (cards.length === 0) {
      console.warn('No card elements found in the document');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...cards),
        (card) => {
          const computedStyle = window.getComputedStyle(card);
          const durations = getTransitionDurations(computedStyle);
          
          for (const duration of durations) {
            if (duration < 150 || duration > 400) {
              console.error(
                `Card transition duration violation on <${card.tagName.toLowerCase()}> ` +
                `${card.className ? '.' + card.className.split(' ').join('.') : ''}: ` +
                `duration = ${duration}ms (must be between 150ms and 400ms)`
              );
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
