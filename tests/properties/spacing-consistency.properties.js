/**
 * Property-Based Tests for Spacing Consistency
 * Feature: modern-design-refresh, Property 5: Spacing Consistency
 * 
 * **Validates: Requirements 5.4**
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
 * Helper function to parse CSS value to pixels
 * Handles rem, em, px, and percentage values
 */
function parseValueToPixels(value, baseFontSize = 16) {
  if (!value || value === 'auto' || value === 'none' || value === '0') {
    return 0;
  }
  
  const trimmedValue = value.trim();
  
  // Handle rem units
  if (trimmedValue.endsWith('rem')) {
    const numValue = parseFloat(trimmedValue);
    return numValue * baseFontSize;
  }
  
  // Handle em units (approximate with base font size)
  if (trimmedValue.endsWith('em')) {
    const numValue = parseFloat(trimmedValue);
    return numValue * baseFontSize;
  }
  
  // Handle px units
  if (trimmedValue.endsWith('px')) {
    return parseFloat(trimmedValue);
  }
  
  // Handle unitless values (treat as pixels)
  const numValue = parseFloat(trimmedValue);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  return 0;
}

/**
 * Helper function to extract spacing values from a CSS property
 * Handles shorthand properties like "padding: 10px 20px"
 */
function extractSpacingValues(propertyValue) {
  if (!propertyValue || propertyValue === 'none' || propertyValue === 'auto') {
    return [];
  }
  
  // Split by whitespace to handle shorthand properties
  const values = propertyValue.split(/\s+/).filter(v => v.trim().length > 0);
  return values;
}

/**
 * Helper function to get all spacing properties from computed styles
 */
function getSpacingProperties(computedStyle) {
  const spacingProps = {
    padding: [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft'
    ],
    margin: [
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft'
    ],
    gap: [
      'gap',
      'rowGap',
      'columnGap'
    ]
  };
  
  const spacingValues = [];
  
  // Extract all spacing values
  for (const category in spacingProps) {
    for (const prop of spacingProps[category]) {
      const value = computedStyle[prop];
      if (value) {
        const pixelValue = parseValueToPixels(value);
        if (pixelValue > 0) {
          spacingValues.push({
            property: prop,
            value: pixelValue,
            originalValue: value
          });
        }
      }
    }
  }
  
  return spacingValues;
}

/**
 * Helper function to check if a value is a multiple of 4px
 */
function isMultipleOf4px(pixelValue) {
  // Allow for small floating point errors (0.01px tolerance)
  const remainder = pixelValue % 4;
  return remainder < 0.01 || remainder > 3.99;
}

/**
 * Helper function to get all elements from the document
 */
function getAllElements(document) {
  return Array.from(document.querySelectorAll('*'));
}

/**
 * Property 5: Spacing Consistency
 * 
 * For any padding, margin, or gap value applied to components and elements, 
 * the value must be a multiple of 0.25rem (4px), with the base unit being 
 * 0.5rem (8px), ensuring consistent spacing ratios throughout the interface.
 * 
 * **Validates: Requirements 5.4**
 */
describe('Modern Design Refresh - Property 5: Spacing Consistency', () => {
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
  
  test('all padding, margin, and gap values are multiples of 4px (0.25rem) for any element', () => {
    fc.assert(
      fc.property(
        // Generate a sample of elements from the document
        fc.constantFrom(...getAllElements(document)),
        (element) => {
          const computedStyle = window.getComputedStyle(element);
          const spacingValues = getSpacingProperties(computedStyle);
          
          // Check each spacing value
          for (const spacing of spacingValues) {
            const { property, value, originalValue } = spacing;
            
            if (!isMultipleOf4px(value)) {
              console.error(
                `Spacing violation on element <${element.tagName.toLowerCase()}> ` +
                `${element.className ? '.' + element.className.split(' ').join('.') : ''}: ` +
                `${property} = ${originalValue} (${value}px) is not a multiple of 4px`
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
  
  test('CSS custom properties for spacing are multiples of 4px', () => {
    const { window, document } = setupDOM();
    
    try {
      const rootStyles = window.getComputedStyle(document.documentElement);
      
      // Get all CSS custom properties that contain "spacing"
      const spacingVariables = [
        '--spacing-1',
        '--spacing-2',
        '--spacing-3',
        '--spacing-4',
        '--spacing-5',
        '--spacing-6',
        '--spacing-8',
        '--spacing-10',
        '--spacing-12',
        '--spacing-16',
        '--spacing-xs',
        '--spacing-sm',
        '--spacing-md',
        '--spacing-lg',
        '--spacing-xl'
      ];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...spacingVariables),
          (varName) => {
            const value = rootStyles.getPropertyValue(varName).trim();
            
            if (!value) {
              console.error(`CSS variable ${varName} is not defined`);
              return false;
            }
            
            const pixelValue = parseValueToPixels(value);
            
            if (!isMultipleOf4px(pixelValue)) {
              console.error(
                `CSS variable ${varName} = ${value} (${pixelValue}px) is not a multiple of 4px`
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
  
  test('component sections have consistent spacing multiples of 4px', () => {
    const { window, document } = setupDOM();
    
    try {
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
            const spacingValues = getSpacingProperties(computedStyle);
            
            for (const spacing of spacingValues) {
              const { property, value, originalValue } = spacing;
              
              if (!isMultipleOf4px(value)) {
                console.error(
                  `Component section spacing violation: ` +
                  `${property} = ${originalValue} (${value}px) is not a multiple of 4px`
                );
                return false;
              }
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
  
  test('button elements have padding values that are multiples of 4px', () => {
    const { window, document } = setupDOM();
    
    try {
      const buttons = Array.from(document.querySelectorAll('button, .btn-start, .btn-stop, .btn-reset, .btn-add-task, .btn-add-link'));
      
      if (buttons.length === 0) {
        console.warn('No buttons found in the document');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...buttons),
          (button) => {
            const computedStyle = window.getComputedStyle(button);
            const paddingValues = [
              { prop: 'paddingTop', value: computedStyle.paddingTop },
              { prop: 'paddingRight', value: computedStyle.paddingRight },
              { prop: 'paddingBottom', value: computedStyle.paddingBottom },
              { prop: 'paddingLeft', value: computedStyle.paddingLeft }
            ];
            
            for (const { prop, value } of paddingValues) {
              const pixelValue = parseValueToPixels(value);
              
              if (pixelValue > 0 && !isMultipleOf4px(pixelValue)) {
                console.error(
                  `Button padding violation on <${button.tagName.toLowerCase()}> ` +
                  `${button.className ? '.' + button.className.split(' ').join('.') : ''}: ` +
                  `${prop} = ${value} (${pixelValue}px) is not a multiple of 4px`
                );
                return false;
              }
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
  
  test('input elements have padding values that are multiples of 4px', () => {
    const { window, document } = setupDOM();
    
    try {
      const inputs = Array.from(document.querySelectorAll('input, textarea, .task-input, .name-input, .duration-input'));
      
      if (inputs.length === 0) {
        console.warn('No input elements found in the document');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...inputs),
          (input) => {
            const computedStyle = window.getComputedStyle(input);
            const paddingValues = [
              { prop: 'paddingTop', value: computedStyle.paddingTop },
              { prop: 'paddingRight', value: computedStyle.paddingRight },
              { prop: 'paddingBottom', value: computedStyle.paddingBottom },
              { prop: 'paddingLeft', value: computedStyle.paddingLeft }
            ];
            
            for (const { prop, value } of paddingValues) {
              const pixelValue = parseValueToPixels(value);
              
              if (pixelValue > 0 && !isMultipleOf4px(pixelValue)) {
                console.error(
                  `Input padding violation on <${input.tagName.toLowerCase()}> ` +
                  `${input.className ? '.' + input.className.split(' ').join('.') : ''}: ` +
                  `${prop} = ${value} (${pixelValue}px) is not a multiple of 4px`
                );
                return false;
              }
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
  
  test('grid gap values are multiples of 4px', () => {
    const { window, document } = setupDOM();
    
    try {
      const gridContainers = Array.from(document.querySelectorAll('.dashboard-main, .links-grid, .task-list'));
      
      if (gridContainers.length === 0) {
        console.warn('No grid containers found in the document');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...gridContainers),
          (container) => {
            const computedStyle = window.getComputedStyle(container);
            const gapValue = computedStyle.gap || computedStyle.gridGap;
            
            if (gapValue && gapValue !== 'normal' && gapValue !== '0px') {
              // Gap can be a single value or two values (row-gap column-gap)
              const gapValues = extractSpacingValues(gapValue);
              
              for (const value of gapValues) {
                const pixelValue = parseValueToPixels(value);
                
                if (pixelValue > 0 && !isMultipleOf4px(pixelValue)) {
                  console.error(
                    `Grid gap violation on <${container.tagName.toLowerCase()}> ` +
                    `${container.className ? '.' + container.className.split(' ').join('.') : ''}: ` +
                    `gap = ${gapValue} (${pixelValue}px) is not a multiple of 4px`
                  );
                  return false;
                }
              }
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
});
