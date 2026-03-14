/**
 * Property-Based Tests for Input Text Contrast
 * Feature: modern-design-refresh, Property 1: Text Contrast Compliance (inputs)
 * 
 * **Validates: Requirements 7.6**
 * 
 * For any text element in input fields, the contrast ratio between the text color 
 * and its background color must be at least 4.5:1 for normal text or 3:1 for 
 * large text (18pt+ or 14pt+ bold), meeting WCAG AA standards.
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Load the CSS for testing
const cssPath = path.join(process.cwd(), 'css', 'styles.css');
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
    
    // Skip pseudo-classes and pseudo-elements (except for placeholder)
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
      
      // Extract color
      const colorMatch = styleBlock.match(/(?:^|;|\s)color:\s*([^;]+);/);
      if (colorMatch) {
        style.color = resolveVar(colorMatch[1].trim());
      }
      
      // Extract background-color
      const bgColorMatch = styleBlock.match(/background-color:\s*([^;]+);/);
      if (bgColorMatch) {
        style.backgroundColor = resolveVar(bgColorMatch[1].trim());
      }
      
      // Extract background (for rgba values)
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
        if (!inputStyles[selector]) {
          inputStyles[selector] = {};
        }
        if (style.color !== undefined) inputStyles[selector].color = style.color;
        if (style.backgroundColor !== undefined) inputStyles[selector].backgroundColor = style.backgroundColor;
        if (style.background !== undefined) inputStyles[selector].background = style.background;
        if (style.fontSize !== undefined) inputStyles[selector].fontSize = style.fontSize;
        if (style.fontWeight !== undefined) inputStyles[selector].fontWeight = style.fontWeight;
      }
    }
  }
  
  return { inputStyles, cssVars };
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
    const calcMatch = preferredValue.match(/([\d.]+)rem\s*\+\s*([\d.]+)vw/);
    if (calcMatch) {
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
 * Helper function to get the effective background color from input styles
 */
function getBackgroundColorFromStyle(inputStyle) {
  // Check for background with rgba
  if (inputStyle.background && inputStyle.background.includes('rgba')) {
    return parseColor(inputStyle.background);
  }
  
  // Check for solid background-color
  if (inputStyle.backgroundColor) {
    return parseColor(inputStyle.backgroundColor);
  }
  
  // Default to white (inputs typically have white backgrounds)
  return { r: 255, g: 255, b: 255 };
}

/**
 * Helper function to get text color from input styles
 */
function getTextColorFromStyle(inputStyle, cssVars) {
  if (inputStyle.color) {
    return parseColor(inputStyle.color);
  }
  
  // Default to the text-primary color from CSS variables
  // which is var(--color-neutral-900) = hsl(210, 20%, 10%)
  const textPrimary = cssVars['--color-text-primary'] || cssVars['--color-neutral-900'] || 'hsl(210, 20%, 10%)';
  return parseColor(textPrimary);
}

/**
 * Helper function to determine if text is "large" according to WCAG
 * Large text is 18pt (24px) or larger, or 14pt (18.66px) or larger if bold (700+)
 */
function isLargeText(fontSize, fontWeight) {
  if (fontSize >= 24) {
    return true;
  }
  
  if (fontSize >= 18.66 && fontWeight >= 700) {
    return true;
  }
  
  return false;
}

/**
 * Property 1: Text Contrast Compliance (inputs)
 * 
 * For any text element in input fields, the contrast ratio between the text color 
 * and its background color must be at least 4.5:1 for normal text or 3:1 for 
 * large text (18pt+ or 14pt+ bold), meeting WCAG AA standards.
 * 
 * **Validates: Requirements 7.6**
 */
describe('Modern Design Refresh - Property 1: Text Contrast Compliance (inputs)', () => {
  let inputStyles, cssVars;
  
  beforeAll(() => {
    const extracted = extractInputStylesFromCSS(cssContent);
    inputStyles = extracted.inputStyles;
    cssVars = extracted.cssVars;
  });
  
  test('all input fields have sufficient text contrast (minimum 4.5:1 for normal text, 3:1 for large text)', () => {
    const inputSelectors = Object.keys(inputStyles);
    
    if (inputSelectors.length === 0) {
      console.warn('No input styles found in CSS');
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...inputSelectors),
        (selector) => {
          const style = inputStyles[selector];
          
          // Get text and background colors
          const textColor = getTextColorFromStyle(style, cssVars);
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
              `Input contrast failure:\n` +
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
  
  test('name input has sufficient contrast', () => {
    const selector = '.name-input';
    const style = inputStyles[selector];
    
    if (!style) {
      console.warn(`No styles found for ${selector}`);
      return;
    }
    
    const textColor = getTextColorFromStyle(style, cssVars);
    const bgColor = getBackgroundColorFromStyle(style);
    const fontSize = fontSizeToPixels(style.fontSize);
    const fontWeight = fontWeightToNumeric(style.fontWeight);
    const isLarge = isLargeText(fontSize, fontWeight);
    const contrastRatio = calculateContrastRatio(textColor, bgColor);
    const minRatio = isLarge ? 3.0 : 4.5;
    
    expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
  });
  
  test('task inputs have sufficient contrast', () => {
    const taskSelectors = ['.task-input', '.task-edit-input'];
    
    taskSelectors.forEach(selector => {
      const style = inputStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      const textColor = getTextColorFromStyle(style, cssVars);
      const bgColor = getBackgroundColorFromStyle(style);
      const fontSize = fontSizeToPixels(style.fontSize);
      const fontWeight = fontWeightToNumeric(style.fontWeight);
      const isLarge = isLargeText(fontSize, fontWeight);
      const contrastRatio = calculateContrastRatio(textColor, bgColor);
      const minRatio = isLarge ? 3.0 : 4.5;
      
      expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
    });
  });
  
  test('link inputs have sufficient contrast', () => {
    const linkSelectors = ['.link-name-input', '.link-url-input'];
    
    linkSelectors.forEach(selector => {
      const style = inputStyles[selector];
      if (!style) {
        console.warn(`No styles found for ${selector}`);
        return;
      }
      
      const textColor = getTextColorFromStyle(style, cssVars);
      const bgColor = getBackgroundColorFromStyle(style);
      const fontSize = fontSizeToPixels(style.fontSize);
      const fontWeight = fontWeightToNumeric(style.fontWeight);
      const isLarge = isLargeText(fontSize, fontWeight);
      const contrastRatio = calculateContrastRatio(textColor, bgColor);
      const minRatio = isLarge ? 3.0 : 4.5;
      
      expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
    });
  });
  
  test('duration input has sufficient contrast', () => {
    const selector = '.duration-input';
    const style = inputStyles[selector];
    
    if (!style) {
      console.warn(`No styles found for ${selector}`);
      return;
    }
    
    const textColor = getTextColorFromStyle(style, cssVars);
    const bgColor = getBackgroundColorFromStyle(style);
    const fontSize = fontSizeToPixels(style.fontSize);
    const fontWeight = fontWeightToNumeric(style.fontWeight);
    const isLarge = isLargeText(fontSize, fontWeight);
    const contrastRatio = calculateContrastRatio(textColor, bgColor);
    const minRatio = isLarge ? 3.0 : 4.5;
    
    expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
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
