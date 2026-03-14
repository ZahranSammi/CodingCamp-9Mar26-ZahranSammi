/**
 * Property-Based Tests for Input Sizing Consistency
 * Feature: modern-design-refresh, Property 6: Consistent Element Sizing (inputs)
 * 
 * **Validates: Requirements 7.4**
 * 
 * For any set of similar interactive elements (all inputs), the height and 
 * padding values must be consistent within that element type, ensuring visual 
 * harmony and predictable interaction areas.
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Load the CSS for testing
const cssPath = path.join(process.cwd(), 'css', 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

/**
 * Helper function to extract input styles directly from CSS
 */
function extractInputStylesFromCSS(cssContent) {
  const inputStyles = {};
  
  // Define input selectors
  const inputSelectors = [
    '.name-input',
    '.duration-input',
    '.task-input',
    '.task-edit-input',
    '.link-name-input',
    '.link-url-input'
  ];
  
  // Extract CSS variables first
  const cssVars = {};
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s);
  if (rootMatch) {
    const rootContent = rootMatch[1];
    const varMatches = rootContent.matchAll(/(--[^:]+):\s*([^;]+);/gs);
    for (const match of varMatches) {
      const varName = match[1].trim();
      const varValue = match[2].trim().replace(/\s+/g, ' ');
      cssVars[varName] = varValue;
    }
  }
  
  // Function to resolve CSS variable recursively
  const resolveVar = (value, depth = 0) => {
    if (!value || depth > 10) return value;
    
    if (!value.includes('var(')) {
      return value;
    }
    
    let resolved = value;
    const varRegex = /var\((--[^,)]+)(?:,\s*([^)]+))?\)/g;
    
    resolved = resolved.replace(varRegex, (match, varName, fallback) => {
      const varValue = cssVars[varName.trim()] || fallback || match;
      return varValue;
    });
    
    if (resolved !== value && resolved.includes('var(')) {
      return resolveVar(resolved, depth + 1);
    }
    
    return resolved;
  };
  
  // Initialize input styles
  for (const selector of inputSelectors) {
    inputStyles[selector] = {};
  }
  
  // Extract styles from CSS rules
  const ruleRegex = /([^{}]+)\{([^}]+)\}/gs;
  const rules = cssContent.matchAll(ruleRegex);
  
  for (const rule of rules) {
    const selectorsPart = rule[1].trim();
    const styleBlock = rule[2];
    
    // Skip pseudo-classes and pseudo-elements
    if (selectorsPart.includes(':hover') || selectorsPart.includes(':active') || 
        selectorsPart.includes(':focus') || selectorsPart.includes('::') ||
        selectorsPart.includes(':disabled')) {
      continue;
    }
    
    // Split multi-selector rules by comma
    const selectorsInRule = selectorsPart.split(',').map(s => s.trim());
    
    // Check if any of our input selectors match
    const matchingSelectors = inputSelectors.filter(selector => 
      selectorsInRule.some(ruleSelector => {
        return ruleSelector === selector || ruleSelector.startsWith(selector + '.');
      })
    );
    
    if (matchingSelectors.length > 0) {
      // Extract properties from this style block
      const style = {};
      
      // Extract padding
      const paddingMatch = styleBlock.match(/(?:^|;|\s)padding:\s*([^;]+);/);
      if (paddingMatch) {
        style.padding = resolveVar(paddingMatch[1].trim());
      }
      
      // Extract height
      const heightMatch = styleBlock.match(/(?:^|;|\s)height:\s*([^;]+);/);
      if (heightMatch) {
        style.height = resolveVar(heightMatch[1].trim());
      }
      
      // Extract font-size (affects height)
      const fontSizeMatch = styleBlock.match(/font-size:\s*([^;]+);/);
      if (fontSizeMatch) {
        style.fontSize = resolveVar(fontSizeMatch[1].trim());
      }
      
      // Apply styles to all matching selectors
      for (const selector of matchingSelectors) {
        if (!inputStyles[selector]) {
          inputStyles[selector] = {};
        }
        if (style.padding !== undefined) inputStyles[selector].padding = style.padding;
        if (style.height !== undefined) inputStyles[selector].height = style.height;
        if (style.fontSize !== undefined) inputStyles[selector].fontSize = style.fontSize;
      }
    }
  }
  
  return { inputStyles, cssVars };
}

/**
 * Helper function to normalize padding values to a comparable format
 */
function normalizePadding(padding) {
  if (!padding) return null;
  
  // Handle shorthand padding (e.g., "12px 16px" or "0.75rem 1rem")
  const parts = padding.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // Single value: all sides equal
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  } else if (parts.length === 2) {
    // Two values: top/bottom, left/right
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  } else if (parts.length === 3) {
    // Three values: top, left/right, bottom
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  } else if (parts.length === 4) {
    // Four values: top, right, bottom, left
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }
  
  return null;
}

/**
 * Helper function to convert size to pixels for comparison
 */
function sizeToPixels(size, baseFontSize = 16) {
  if (!size) return 0;
  
  if (size.includes('rem')) {
    return parseFloat(size) * baseFontSize;
  }
  
  if (size.includes('em')) {
    return parseFloat(size) * baseFontSize;
  }
  
  if (size.includes('px')) {
    return parseFloat(size);
  }
  
  const numValue = parseFloat(size);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  return 0;
}

/**
 * Helper function to compare padding objects
 */
function arePaddingsEqual(padding1, padding2) {
  if (!padding1 || !padding2) return false;
  
  const p1Top = sizeToPixels(padding1.top);
  const p1Right = sizeToPixels(padding1.right);
  const p1Bottom = sizeToPixels(padding1.bottom);
  const p1Left = sizeToPixels(padding1.left);
  
  const p2Top = sizeToPixels(padding2.top);
  const p2Right = sizeToPixels(padding2.right);
  const p2Bottom = sizeToPixels(padding2.bottom);
  const p2Left = sizeToPixels(padding2.left);
  
  // Allow small floating point differences (0.1px tolerance)
  const tolerance = 0.1;
  
  return Math.abs(p1Top - p2Top) < tolerance &&
         Math.abs(p1Right - p2Right) < tolerance &&
         Math.abs(p1Bottom - p2Bottom) < tolerance &&
         Math.abs(p1Left - p2Left) < tolerance;
}

/**
 * Property 6: Consistent Element Sizing (inputs)
 * 
 * For any set of similar interactive elements (all inputs), the height and 
 * padding values must be consistent within that element type, ensuring visual 
 * harmony and predictable interaction areas.
 * 
 * **Validates: Requirements 7.4**
 */
describe('Modern Design Refresh - Property 6: Consistent Element Sizing (inputs)', () => {
  let inputStyles, cssVars;
  
  beforeAll(() => {
    const extracted = extractInputStylesFromCSS(cssContent);
    inputStyles = extracted.inputStyles;
    cssVars = extracted.cssVars;
  });
  
  test('all input fields have consistent padding values', () => {
    const inputSelectors = Object.keys(inputStyles).filter(selector => 
      // Exclude duration-input as it has a fixed width and may have different padding
      selector !== '.duration-input'
    );
    
    if (inputSelectors.length === 0) {
      console.warn('No input styles found in CSS');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...inputSelectors),
        fc.constantFrom(...inputSelectors),
        (selector1, selector2) => {
          const style1 = inputStyles[selector1];
          const style2 = inputStyles[selector2];
          
          // Get padding values
          const padding1 = normalizePadding(style1.padding);
          const padding2 = normalizePadding(style2.padding);
          
          // Check if paddings are equal
          const paddingsEqual = arePaddingsEqual(padding1, padding2);
          
          if (!paddingsEqual) {
            console.error(
              `Input padding inconsistency:\n` +
              `  Selector 1: ${selector1}\n` +
              `  Padding 1: ${style1.padding}\n` +
              `  Normalized 1: ${JSON.stringify(padding1)}\n` +
              `  Selector 2: ${selector2}\n` +
              `  Padding 2: ${style2.padding}\n` +
              `  Normalized 2: ${JSON.stringify(padding2)}\n` +
              `  Status: FAIL`
            );
          }
          
          return paddingsEqual;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all input fields have consistent font-size values', () => {
    const inputSelectors = Object.keys(inputStyles);
    
    if (inputSelectors.length === 0) {
      console.warn('No input styles found in CSS');
      return;
    }
    
    // Get all unique font sizes
    const fontSizes = new Set();
    inputSelectors.forEach(selector => {
      const style = inputStyles[selector];
      if (style.fontSize) {
        fontSizes.add(style.fontSize);
      }
    });
    
    // All inputs should have the same font size
    expect(fontSizes.size).toBeLessThanOrEqual(1);
    
    if (fontSizes.size > 1) {
      console.error(
        `Input font-size inconsistency:\n` +
        `  Found ${fontSizes.size} different font sizes:\n` +
        Array.from(fontSizes).map(size => `    - ${size}`).join('\n')
      );
    }
  });
  
  test('specific input fields have expected padding (var(--spacing-3) var(--spacing-4))', () => {
    const expectedPadding = normalizePadding('0.75rem 1rem'); // var(--spacing-3) var(--spacing-4)
    
    const inputSelectors = [
      '.name-input',
      '.task-input',
      '.task-edit-input',
      '.link-name-input',
      '.link-url-input'
    ];
    
    inputSelectors.forEach(selector => {
      const style = inputStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      const actualPadding = normalizePadding(style.padding);
      const paddingsMatch = arePaddingsEqual(actualPadding, expectedPadding);
      
      if (!paddingsMatch) {
        console.error(
          `Input padding mismatch for ${selector}:\n` +
          `  Expected: var(--spacing-3) var(--spacing-4) (0.75rem 1rem)\n` +
          `  Actual: ${style.padding}\n` +
          `  Normalized: ${JSON.stringify(actualPadding)}`
        );
      }
      
      expect(paddingsMatch).toBe(true);
    });
  });
  
  test('all input fields use font-size-sm', () => {
    const inputSelectors = Object.keys(inputStyles);
    
    inputSelectors.forEach(selector => {
      const style = inputStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      // Check if font-size is set to var(--font-size-sm) or its resolved value
      const fontSize = style.fontSize;
      const isCorrectSize = fontSize && (
        fontSize.includes('--font-size-sm') ||
        fontSize.includes('clamp(0.875rem')
      );
      
      if (!isCorrectSize) {
        console.error(
          `Input font-size mismatch for ${selector}:\n` +
          `  Expected: var(--font-size-sm)\n` +
          `  Actual: ${fontSize}`
        );
      }
      
      expect(isCorrectSize).toBe(true);
    });
  });
  
  test('padding values are consistent across property-based test runs', () => {
    const inputSelectors = Object.keys(inputStyles).filter(selector => 
      selector !== '.duration-input'
    );
    
    if (inputSelectors.length < 2) {
      console.warn('Not enough input styles to compare');
      return;
    }
    
    // Get the first input's padding as reference
    const referenceSelector = inputSelectors[0];
    const referencePadding = normalizePadding(inputStyles[referenceSelector].padding);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...inputSelectors),
        (selector) => {
          const actualPadding = normalizePadding(inputStyles[selector].padding);
          return arePaddingsEqual(actualPadding, referencePadding);
        }
      ),
      { numRuns: 100 }
    );
  });
});
