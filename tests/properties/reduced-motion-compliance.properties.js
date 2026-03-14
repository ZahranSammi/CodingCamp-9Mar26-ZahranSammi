/**
 * Property-Based Tests for Reduced Motion Compliance
 * Feature: modern-design-refresh, Property 4: Reduced Motion Compliance
 * 
 * **Validates: Requirements 3.6, 13.4**
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
 * Helper function to set up a JSDOM environment with CSS and prefers-reduced-motion
 */
function setupDOM(reducedMotion = false) {
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
  
  // Mock matchMedia for prefers-reduced-motion
  window.matchMedia = (query) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
  
  return { window, document };
}

/**
 * Helper function to parse duration string to milliseconds
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
 * Helper function to check if CSS contains reduced motion media query
 */
function hasReducedMotionMediaQuery(cssText) {
  const reducedMotionRegex = /@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce[^)]*\)/i;
  return reducedMotionRegex.test(cssText);
}

/**
 * Helper function to extract reduced motion rules from CSS
 */
function getReducedMotionRules(cssText) {
  const rules = [];
  const reducedMotionRegex = /@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce[^)]*\)\s*\{([^}]+)\}/gi;
  let match;
  
  while ((match = reducedMotionRegex.exec(cssText)) !== null) {
    rules.push(match[1]);
  }
  
  return rules;
}

/**
 * Helper function to get all elements that could have animations
 */
function getAllElements(document) {
  return Array.from(document.querySelectorAll('*'));
}

/**
 * Property 4: Reduced Motion Compliance
 * 
 * When the user's system preference is set to prefers-reduced-motion: reduce,
 * all decorative animations must have their duration reduced to 0.01ms or less,
 * while maintaining functional transitions for state changes.
 * 
 * **Validates: Requirements 3.6, 13.4**
 */
describe('Modern Design Refresh - Property 4: Reduced Motion Compliance', () => {
  test('CSS contains prefers-reduced-motion media query', () => {
    expect(hasReducedMotionMediaQuery(cssContent)).toBe(true);
  });
  
  test('reduced motion media query sets animation-duration to 0.01ms or less', () => {
    const rules = getReducedMotionRules(cssContent);
    
    expect(rules.length).toBeGreaterThan(0);
    
    const hasAnimationDuration = rules.some(rule => 
      rule.includes('animation-duration') && 
      (rule.includes('0.01ms') || rule.includes('0ms'))
    );
    
    expect(hasAnimationDuration).toBe(true);
  });
  
  test('reduced motion media query sets transition-duration to 0.01ms or less', () => {
    const rules = getReducedMotionRules(cssContent);
    
    expect(rules.length).toBeGreaterThan(0);
    
    const hasTransitionDuration = rules.some(rule => 
      rule.includes('transition-duration') && 
      (rule.includes('0.01ms') || rule.includes('0ms'))
    );
    
    expect(hasTransitionDuration).toBe(true);
  });
  
  test('reduced motion media query sets animation-iteration-count to 1', () => {
    const rules = getReducedMotionRules(cssContent);
    
    expect(rules.length).toBeGreaterThan(0);
    
    const hasIterationCount = rules.some(rule => 
      rule.includes('animation-iteration-count') && 
      rule.includes('1')
    );
    
    expect(hasIterationCount).toBe(true);
  });
  
  test('reduced motion media query applies to all elements using universal selector', () => {
    const reducedMotionRegex = /@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce[^)]*\)\s*\{[^}]*\*[^}]*\}/i;
    expect(reducedMotionRegex.test(cssContent)).toBe(true);
  });
  
  test('reduced motion media query includes pseudo-elements', () => {
    const rules = getReducedMotionRules(cssContent);
    
    const hasPseudoElements = rules.some(rule => 
      rule.includes('::before') || rule.includes('::after')
    );
    
    expect(hasPseudoElements).toBe(true);
  });
  
  test('reduced motion rules use !important to override other animations', () => {
    const rules = getReducedMotionRules(cssContent);
    
    const hasImportant = rules.some(rule => 
      rule.includes('!important')
    );
    
    expect(hasImportant).toBe(true);
  });
});
