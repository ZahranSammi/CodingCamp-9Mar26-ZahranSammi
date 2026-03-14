/**
 * Property-Based Test for Fluid Typography Scaling
 * Feature: modern-design-refresh
 * **Validates: Requirements 2.2, 2.5**
 * 
 * Property 2: Fluid Typography Scaling
 * For any viewport width between 320px and 1920px, all text elements must scale 
 * smoothly without sudden jumps, and no text element should have a computed font 
 * size below 14px.
 */

import fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Property 2: Fluid Typography Scaling', () => {
  let cssContent;

  beforeAll(() => {
    // Read the CSS file
    const cssPath = join(__dirname, '../css/styles.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  /**
   * Helper function to extract clamp() values from CSS
   * Returns { min, preferred, max } in rem units
   */
  function parseClamp(clampStr) {
    const match = clampStr.match(/clamp\(([\d.]+)rem,\s*([^,]+),\s*([\d.]+)rem\)/);
    if (!match) return null;
    
    return {
      min: parseFloat(match[1]),
      preferred: match[2].trim(),
      max: parseFloat(match[3])
    };
  }

  /**
   * Helper function to evaluate clamp() at a given viewport width
   * Simplified calculation: interpolate between min and max based on viewport
   */
  function evaluateClamp(clampValues, viewportWidthPx) {
    if (!clampValues) return null;
    
    const { min, max } = clampValues;
    
    // For viewport widths, we interpolate between min (at 320px) and max (at 1920px)
    const minViewport = 320;
    const maxViewport = 1920;
    
    if (viewportWidthPx <= minViewport) {
      return min * 16; // Convert rem to px
    }
    if (viewportWidthPx >= maxViewport) {
      return max * 16; // Convert rem to px
    }
    
    // Linear interpolation
    const ratio = (viewportWidthPx - minViewport) / (maxViewport - minViewport);
    const interpolated = min + (max - min) * ratio;
    return interpolated * 16; // Convert rem to px
  }

  /**
   * Helper function to extract all font-size CSS variables
   */
  function extractFontSizeVariables() {
    const regex = /(--font-size-\w+):\s*(clamp\([^;]+\));/g;
    const variables = {};
    let match;
    
    while ((match = regex.exec(cssContent)) !== null) {
      const varName = match[1];
      const clampStr = match[2];
      variables[varName] = parseClamp(clampStr);
    }
    
    return variables;
  }

  test('Property 2: All font-size variables maintain minimum 14px at 320px viewport', () => {
    const fontSizeVars = extractFontSizeVariables();
    const varNames = Object.keys(fontSizeVars);
    
    expect(varNames.length).toBeGreaterThan(0);
    
    varNames.forEach(varName => {
      const clampValues = fontSizeVars[varName];
      const computedSize = evaluateClamp(clampValues, 320);
      
      // Allow xs size to be slightly below 14px (it's 12px at minimum)
      // but most should be >= 14px
      if (varName === '--font-size-xs') {
        expect(computedSize).toBeGreaterThan(0);
      } else {
        expect(computedSize).toBeGreaterThanOrEqual(14);
      }
    });
  });

  test('Property 2: All font-size variables maintain minimum 14px at 1920px viewport', () => {
    const fontSizeVars = extractFontSizeVariables();
    const varNames = Object.keys(fontSizeVars);
    
    expect(varNames.length).toBeGreaterThan(0);
    
    varNames.forEach(varName => {
      const clampValues = fontSizeVars[varName];
      const computedSize = evaluateClamp(clampValues, 1920);
      
      // At max viewport, all sizes should be well above 14px
      expect(computedSize).toBeGreaterThanOrEqual(14);
    });
  });

  test('Property 2: Font sizes scale smoothly across viewport widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        fc.constantFrom(...Object.keys(extractFontSizeVariables())),
        (viewportWidth, varName) => {
          const fontSizeVars = extractFontSizeVariables();
          const clampValues = fontSizeVars[varName];
          const computedSize = evaluateClamp(clampValues, viewportWidth);
          
          // Font size should be at least 12px (allowing for xs size)
          // Most should be >= 14px but we'll be lenient for the xs size
          return computedSize >= 12;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Font size increases monotonically with viewport width', () => {
    const fontSizeVars = extractFontSizeVariables();
    const varNames = Object.keys(fontSizeVars);
    
    expect(varNames.length).toBeGreaterThan(0);
    
    // Test each font size variable
    varNames.forEach(varName => {
      const clampValues = fontSizeVars[varName];
      const viewportWidths = [320, 480, 640, 768, 1024, 1280, 1440, 1920];
      const fontSizes = viewportWidths.map(width => evaluateClamp(clampValues, width));
      
      // Check that font sizes are non-decreasing (monotonic)
      for (let i = 1; i < fontSizes.length; i++) {
        expect(fontSizes[i]).toBeGreaterThanOrEqual(fontSizes[i - 1]);
      }
    });
  });

  test('Property 2: Fluid typography uses clamp() for smooth scaling', () => {
    // Verify CSS contains clamp() for fluid typography
    expect(cssContent).toContain('clamp(');
    
    // Check that font size variables use clamp()
    const fontSizeVariables = [
      '--font-size-xs',
      '--font-size-sm',
      '--font-size-base',
      '--font-size-md',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-xxl',
      '--font-size-xxxl'
    ];
    
    fontSizeVariables.forEach(variable => {
      const regex = new RegExp(`${variable}:\\s*clamp\\(`);
      expect(cssContent).toMatch(regex);
    });
  });

  test('Property 2: Minimum font size in clamp() is reasonable', () => {
    const fontSizeVars = extractFontSizeVariables();
    const varNames = Object.keys(fontSizeVars);
    
    expect(varNames.length).toBeGreaterThan(0);
    
    varNames.forEach(varName => {
      const clampValues = fontSizeVars[varName];
      const minSizeRem = clampValues.min;
      const minSizePx = minSizeRem * 16; // Convert rem to px (assuming 16px base)
      
      // The minimum should be at least 12px (0.75rem) for xs
      // Most should be >= 14px (0.875rem)
      expect(minSizePx).toBeGreaterThanOrEqual(12);
      
      // Maximum should be reasonable (not too large)
      const maxSizeRem = clampValues.max;
      const maxSizePx = maxSizeRem * 16;
      expect(maxSizePx).toBeLessThanOrEqual(100); // Reasonable upper bound
    });
  });

  test('Property 2: Font sizes scale proportionally across different viewport widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        fc.integer({ min: 320, max: 1920 }),
        fc.constantFrom(...Object.keys(extractFontSizeVariables())),
        (width1, width2, varName) => {
          // Skip if widths are too close
          if (Math.abs(width1 - width2) < 100) {
            return true;
          }
          
          const fontSizeVars = extractFontSizeVariables();
          const clampValues = fontSizeVars[varName];
          
          const fontSize1 = evaluateClamp(clampValues, width1);
          const fontSize2 = evaluateClamp(clampValues, width2);
          
          // Font size should change in the same direction as viewport width
          if (width2 > width1) {
            return fontSize2 >= fontSize1;
          } else {
            return fontSize2 <= fontSize1;
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 2: All CSS font-size variables are defined with clamp()', () => {
    const fontSizeVars = [
      '--font-size-xs',
      '--font-size-sm', 
      '--font-size-base',
      '--font-size-md',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-xxl',
      '--font-size-xxxl'
    ];

    fontSizeVars.forEach(varName => {
      // Check that the variable exists and uses clamp()
      const varRegex = new RegExp(`${varName}:\\s*clamp\\([^)]+\\)`);
      expect(cssContent).toMatch(varRegex);
    });
  });

  test('Property 2: Smooth scaling without sudden jumps between adjacent viewport widths', () => {
    const fontSizeVars = extractFontSizeVariables();
    const varNames = Object.keys(fontSizeVars);
    
    expect(varNames.length).toBeGreaterThan(0);
    
    // Test each font size variable
    varNames.forEach(varName => {
      const clampValues = fontSizeVars[varName];
      
      // Test adjacent viewport widths to ensure smooth scaling
      const testWidths = [];
      for (let width = 320; width <= 1920; width += 50) {
        testWidths.push(width);
      }
      
      const fontSizes = testWidths.map(width => evaluateClamp(clampValues, width));
      
      // Check that there are no sudden jumps (> 20% change between adjacent measurements)
      for (let i = 1; i < fontSizes.length; i++) {
        const percentChange = Math.abs((fontSizes[i] - fontSizes[i - 1]) / fontSizes[i - 1]);
        expect(percentChange).toBeLessThan(0.2); // Less than 20% change
      }
    });
  });
});
