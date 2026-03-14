/**
 * Property-Based Tests for Button Text Contrast
 * Feature: modern-design-refresh, Property 1: Text Contrast Compliance (buttons)
 * 
 * **Validates: Requirements 6.6**
 * 
 * For any text element in buttons, the contrast ratio between the text color 
 * and its background color must be at least 4.5:1 for normal text or 3:1 for 
 * large text (18pt+ or 14pt+ bold), meeting WCAG AA standards.
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Load the HTML and CSS for testing
const htmlPath = path.join(process.cwd(), 'index.html');
const cssPath = path.join(process.cwd(), 'css', 'styles.css');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

/**
 * Helper function to parse color string to RGB values
 */
function parseColor(colorString) {
  if (!colorString) {
    return { r: 0, g: 0, b: 0 };
  }
  
  // Handle rgb() and rgba() formats
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  // Handle hsl() and hsla() formats
  const hslMatch = colorString.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }
  
  // Handle hex format
  const hexMatch = colorString.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    };
  }
  
  // Handle 3-digit hex format
  const hex3Match = colorString.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (hex3Match) {
    return {
      r: parseInt(hex3Match[1] + hex3Match[1], 16),
      g: parseInt(hex3Match[2] + hex3Match[2], 16),
      b: parseInt(hex3Match[3] + hex3Match[3], 16)
    };
  }
  
  // Handle named colors (basic set)
  const namedColors = {
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 128, b: 0 },
    'blue': { r: 0, g: 0, b: 255 }
  };
  
  const lowerColor = colorString.toLowerCase().trim();
  if (namedColors[lowerColor]) {
    return namedColors[lowerColor];
  }
  
  // Default to black if parsing fails
  return { r: 0, g: 0, b: 0 };
}

/**
 * Helper function to convert HSL to RGB
 */
function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, (h / 360) + 1/3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, (h / 360) - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Helper function to calculate relative luminance
 * Based on WCAG 2.1 specification
 */
function getRelativeLuminance(rgb) {
  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Helper function to calculate contrast ratio
 * Based on WCAG 2.1 specification
 */
function calculateContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Helper function to extract button styles directly from CSS
 */
function extractButtonStylesFromCSS(cssContent) {
  const buttonStyles = {};
  
  // Define button selectors and their expected styles
  const buttonSelectors = [
    '.btn-start',
    '.btn-stop',
    '.btn-reset',
    '.btn-add-task',
    '.btn-add-link',
    '.btn-edit-name',
    '.btn-save-name',
    '.btn-set-duration',
    '.btn-edit-task',
    '.btn-delete-task',
    '.btn-save-task',
    '.btn-cancel-edit',
    '.btn-delete-link'
  ];
  
  // Extract CSS variables first
  const cssVars = {};
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s);
  if (rootMatch) {
    const rootContent = rootMatch[1];
    // Match CSS variables, handling multi-line values
    const varMatches = rootContent.matchAll(/(--[^:]+):\s*([^;]+);/gs);
    for (const match of varMatches) {
      const varName = match[1].trim();
      const varValue = match[2].trim().replace(/\s+/g, ' '); // Normalize whitespace
      cssVars[varName] = varValue;
    }
  }
  
  // Function to resolve CSS variable recursively
  const resolveVar = (value, depth = 0) => {
    if (!value || depth > 10) return value; // Prevent infinite recursion
    
    const varMatch = value.match(/var\((--[^,)]+)(?:,\s*([^)]+))?\)/);
    if (varMatch) {
      const varName = varMatch[1].trim();
      const fallback = varMatch[2];
      const resolved = cssVars[varName] || fallback || value;
      // Recursively resolve in case the variable contains another variable
      return resolveVar(resolved, depth + 1);
    }
    return value;
  };
  
  // Initialize button styles
  for (const selector of buttonSelectors) {
    buttonStyles[selector] = {};
  }
  
  // Extract styles from CSS rules (including multi-selector rules)
  // Match CSS rules with their selectors
  const ruleRegex = /([^{}]+)\{([^}]+)\}/gs;
  const rules = cssContent.matchAll(ruleRegex);
  
  for (const rule of rules) {
    const selectorsPart = rule[1].trim();
    const styleBlock = rule[2];
    
    // Skip pseudo-classes and pseudo-elements (hover, active, focus, etc.)
    if (selectorsPart.includes(':hover') || selectorsPart.includes(':active') || 
        selectorsPart.includes(':focus') || selectorsPart.includes('::')) {
      continue;
    }
    
    // Check if any of our button selectors are in this rule
    const matchingSelectors = buttonSelectors.filter(selector => 
      selectorsPart.includes(selector)
    );
    
    if (matchingSelectors.length > 0) {
      // Extract properties from this style block
      const style = {};
      
      // Extract color
      const colorMatch = styleBlock.match(/color:\s*([^;]+);/);
      if (colorMatch) {
        style.color = resolveVar(colorMatch[1].trim());
      }
      
      // Extract background-color
      const bgColorMatch = styleBlock.match(/background-color:\s*([^;]+);/);
      if (bgColorMatch) {
        style.backgroundColor = resolveVar(bgColorMatch[1].trim());
      }
      
      // Extract background (for gradients)
      const bgMatch = styleBlock.match(/background:\s*([^;]+);/);
      if (bgMatch) {
        style.background = resolveVar(bgMatch[1].trim());
      }
      
      // Extract font-size
      const fontSizeMatch = styleBlock.match(/font-size:\s*([^;]+);/);
      if (fontSizeMatch) {
        style.fontSize = resolveVar(fontSizeMatch[1].trim());
      }
      
      // Extract font-weight
      const fontWeightMatch = styleBlock.match(/font-weight:\s*([^;]+);/);
      if (fontWeightMatch) {
        style.fontWeight = resolveVar(fontWeightMatch[1].trim());
      }
      
      // Apply styles to all matching selectors
      for (const selector of matchingSelectors) {
        Object.assign(buttonStyles[selector], style);
      }
    }
  }
  
  return { buttonStyles, cssVars };
}

/**
 * Helper function to convert font-size to pixels
 */
function fontSizeToPixels(fontSize, baseFontSize = 16) {
  if (!fontSize) return baseFontSize;
  
  // Handle clamp() - extract the preferred value (middle value)
  const clampMatch = fontSize.match(/clamp\([^,]+,\s*([^,]+),/);
  if (clampMatch) {
    const preferredValue = clampMatch[1].trim();
    // Parse the preferred value which might contain calc()
    const calcMatch = preferredValue.match(/([\d.]+)rem\s*\+\s*([\d.]+)vw/);
    if (calcMatch) {
      // Use the rem value as a reasonable approximation
      return parseFloat(calcMatch[1]) * baseFontSize;
    }
    return fontSizeToPixels(preferredValue, baseFontSize);
  }
  
  if (fontSize.includes('rem')) {
    return parseFloat(fontSize) * baseFontSize;
  }
  
  if (fontSize.includes('em')) {
    return parseFloat(fontSize) * baseFontSize;
  }
  
  if (fontSize.includes('px')) {
    return parseFloat(fontSize);
  }
  
  // Try to parse as a number
  const numValue = parseFloat(fontSize);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  return baseFontSize;
}

/**
 * Helper function to convert font-weight to numeric
 */
function fontWeightToNumeric(fontWeight) {
  if (!fontWeight) return 400;
  
  const weightMap = {
    'normal': 400,
    'bold': 700,
    'lighter': 300,
    'bolder': 700,
    'var(--font-weight-light)': 300,
    'var(--font-weight-normal)': 400,
    'var(--font-weight-medium)': 500,
    'var(--font-weight-semibold)': 600,
    'var(--font-weight-bold)': 700
  };
  
  return weightMap[fontWeight] || parseInt(fontWeight) || 400;
}

/**
 * Helper function to extract colors from CSS gradient strings
 */
function extractColorsFromGradient(gradientString) {
  // Match all color values in the gradient
  const colorMatches = gradientString.match(/rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-f0-9]{6}|#[a-f0-9]{3}/gi);
  if (colorMatches && colorMatches.length > 0) {
    // Return the first color (start of gradient)
    return colorMatches[0];
  }
  return null;
}

/**
 * Helper function to get the effective background color from button styles
 */
function getBackgroundColorFromStyle(buttonStyle) {
  // Check for gradient background first
  if (buttonStyle.background && buttonStyle.background.includes('gradient')) {
    const color = extractColorsFromGradient(buttonStyle.background);
    if (color) {
      return parseColor(color);
    }
  }
  
  // Check for solid background-color
  if (buttonStyle.backgroundColor) {
    return parseColor(buttonStyle.backgroundColor);
  }
  
  // Default to white
  return { r: 255, g: 255, b: 255 };
}

/**
 * Helper function to get text color from button styles
 */
function getTextColorFromStyle(buttonStyle) {
  if (buttonStyle.color) {
    return parseColor(buttonStyle.color);
  }
  
  // Default to black
  return { r: 0, g: 0, b: 0 };
}

/**
 * Helper function to determine if text is "large" according to WCAG
 * Large text is 18pt (24px) or larger, or 14pt (18.66px) or larger if bold (700+)
 */
function isLargeText(fontSize, fontWeight) {
  // 18pt = 24px
  if (fontSize >= 24) {
    return true;
  }
  
  // 14pt = 18.66px (approximately 19px) and bold
  if (fontSize >= 18.66 && fontWeight >= 700) {
    return true;
  }
  
  return false;
}

/**
 * Property 1: Text Contrast Compliance (buttons)
 * 
 * For any text element in buttons, the contrast ratio between the text color 
 * and its background color must be at least 4.5:1 for normal text or 3:1 for 
 * large text (18pt+ or 14pt+ bold), meeting WCAG AA standards.
 * 
 * **Validates: Requirements 6.6**
 */
describe('Modern Design Refresh - Property 1: Text Contrast Compliance (buttons)', () => {
  let buttonStyles, cssVars;
  
  beforeAll(() => {
    const extracted = extractButtonStylesFromCSS(cssContent);
    buttonStyles = extracted.buttonStyles;
    cssVars = extracted.cssVars;
  });
  
  test('all button styles have sufficient text contrast (minimum 4.5:1 for normal text, 3:1 for large text)', () => {
    const buttonSelectors = Object.keys(buttonStyles);
    
    if (buttonSelectors.length === 0) {
      console.warn('No button styles found in CSS');
      return;
    }
    
    // Debug: log the first few button styles
    console.log('Sample button styles:');
    buttonSelectors.slice(0, 3).forEach(selector => {
      console.log(`${selector}:`, JSON.stringify(buttonStyles[selector], null, 2));
    });
    
    fc.assert(
      fc.property(
        fc.constantFrom(...buttonSelectors),
        (selector) => {
          const style = buttonStyles[selector];
          
          // Get text and background colors
          const textColor = getTextColorFromStyle(style);
          const bgColor = getBackgroundColorFromStyle(style);
          
          // Get font properties
          const fontSize = fontSizeToPixels(style.fontSize);
          const fontWeight = fontWeightToNumeric(style.fontWeight);
          
          // Determine if text is large
          const isLarge = isLargeText(fontSize, fontWeight);
          
          // Calculate contrast ratio
          const contrastRatio = calculateContrastRatio(textColor, bgColor);
          
          // Determine minimum required ratio
          const minRatio = isLarge ? 3.0 : 4.5;
          
          // Check if contrast meets requirements
          const meetsRequirement = contrastRatio >= minRatio;
          
          if (!meetsRequirement) {
            console.error(
              `Button contrast failure:\n` +
              `  Selector: ${selector}\n` +
              `  Style: ${JSON.stringify(style)}\n` +
              `  Text Color: rgb(${textColor.r}, ${textColor.g}, ${textColor.b})\n` +
              `  Background Color: rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})\n` +
              `  Font Size: ${fontSize.toFixed(2)}px\n` +
              `  Font Weight: ${fontWeight}\n` +
              `  Is Large Text: ${isLarge}\n` +
              `  Contrast Ratio: ${contrastRatio.toFixed(2)}:1\n` +
              `  Required Ratio: ${minRatio}:1\n` +
              `  Status: FAIL`
            );
          }
          
          return meetsRequirement;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('primary action buttons (start, stop, reset) have sufficient contrast', () => {
    const primarySelectors = ['.btn-start', '.btn-stop', '.btn-reset'];
    
    primarySelectors.forEach(selector => {
      const style = buttonStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      const textColor = getTextColorFromStyle(style);
      const bgColor = getBackgroundColorFromStyle(style);
      const fontSize = fontSizeToPixels(style.fontSize);
      const fontWeight = fontWeightToNumeric(style.fontWeight);
      const isLarge = isLargeText(fontSize, fontWeight);
      const contrastRatio = calculateContrastRatio(textColor, bgColor);
      const minRatio = isLarge ? 3.0 : 4.5;
      
      expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
    });
  });
  
  test('add buttons (add-task, add-link) have sufficient contrast', () => {
    const addSelectors = ['.btn-add-task', '.btn-add-link'];
    
    addSelectors.forEach(selector => {
      const style = buttonStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      const textColor = getTextColorFromStyle(style);
      const bgColor = getBackgroundColorFromStyle(style);
      const fontSize = fontSizeToPixels(style.fontSize);
      const fontWeight = fontWeightToNumeric(style.fontWeight);
      const isLarge = isLargeText(fontSize, fontWeight);
      const contrastRatio = calculateContrastRatio(textColor, bgColor);
      const minRatio = isLarge ? 3.0 : 4.5;
      
      expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
    });
  });
  
  test('edit buttons have sufficient contrast', () => {
    const editSelectors = ['.btn-edit-name', '.btn-edit-task', '.btn-set-duration'];
    
    editSelectors.forEach(selector => {
      const style = buttonStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      const textColor = getTextColorFromStyle(style);
      const bgColor = getBackgroundColorFromStyle(style);
      const fontSize = fontSizeToPixels(style.fontSize);
      const fontWeight = fontWeightToNumeric(style.fontWeight);
      const isLarge = isLargeText(fontSize, fontWeight);
      const contrastRatio = calculateContrastRatio(textColor, bgColor);
      const minRatio = isLarge ? 3.0 : 4.5;
      
      expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
    });
  });
  
  test('delete buttons have sufficient contrast', () => {
    const deleteSelectors = ['.btn-delete-task', '.btn-delete-link'];
    
    deleteSelectors.forEach(selector => {
      const style = buttonStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      const textColor = getTextColorFromStyle(style);
      const bgColor = getBackgroundColorFromStyle(style);
      const fontSize = fontSizeToPixels(style.fontSize);
      const fontWeight = fontWeightToNumeric(style.fontWeight);
      const isLarge = isLargeText(fontSize, fontWeight);
      const contrastRatio = calculateContrastRatio(textColor, bgColor);
      const minRatio = isLarge ? 3.0 : 4.5;
      
      expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
    });
  });
  
  test('contrast ratio calculation is accurate for known color pairs', () => {
    // Test with known color pairs
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    
    // White on black should be 21:1 (maximum contrast)
    const maxContrast = calculateContrastRatio(white, black);
    expect(maxContrast).toBeCloseTo(21, 1);
    
    // Same color should be 1:1 (no contrast)
    const noContrast = calculateContrastRatio(white, white);
    expect(noContrast).toBeCloseTo(1, 1);
  });
});
