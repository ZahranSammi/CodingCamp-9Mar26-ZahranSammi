/**
 * Property-Based Tests for Timer Text Contrast
 * Feature: modern-design-refresh, Property 1: Text Contrast Compliance (timer)
 * 
 * **Validates: Requirements 8.6**
 * 
 * For any timer display text, the contrast ratio between the text color 
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
 * Helper function to extract timer display styles from CSS
 */
function extractTimerStylesFromCSS(cssContent) {
  const timerStyles = {};
  
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
  
  // Extract .timer-display styles
  const timerDisplayMatch = cssContent.match(/\.timer-display\s*\{([^}]+)\}/s);
  if (timerDisplayMatch) {
    const styleBlock = timerDisplayMatch[1];
    
    // Extract font-size
    const fontSizeMatch = styleBlock.match(/font-size:\s*([^;]+);/);
    if (fontSizeMatch) {
      timerStyles.fontSize = resolveVar(fontSizeMatch[1].trim());
    }
    
    // Extract font-weight
    const fontWeightMatch = styleBlock.match(/font-weight:\s*([^;]+);/);
    if (fontWeightMatch) {
      timerStyles.fontWeight = resolveVar(fontWeightMatch[1].trim());
    }
    
    // Extract color
    const colorMatch = styleBlock.match(/(?:^|;|\s)color:\s*([^;]+);/);
    if (colorMatch) {
      timerStyles.color = resolveVar(colorMatch[1].trim());
    }
    
    // Extract background (for gradient)
    const bgMatch = styleBlock.match(/background:\s*([^;]+);/);
    if (bgMatch) {
      timerStyles.background = resolveVar(bgMatch[1].trim());
    }
  }
  
  // Get component section background (glassmorphism)
  const componentMatch = cssContent.match(/\.component-section\s*\{([^}]+)\}/s);
  if (componentMatch) {
    const styleBlock = componentMatch[1];
    const bgMatch = styleBlock.match(/background:\s*([^;]+);/);
    if (bgMatch) {
      timerStyles.componentBackground = resolveVar(bgMatch[1].trim());
    }
  }
  
  return { timerStyles, cssVars };
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
    'bolder': 700
  };
  
  return weightMap[fontWeight] || parseInt(fontWeight) || 400;
}

/**
 * Helper function to extract colors from CSS gradient strings
 */
function extractColorsFromGradient(gradientString) {
  const colorMatches = gradientString.match(/rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-f0-9]{6}|#[a-f0-9]{3}/gi);
  if (colorMatches && colorMatches.length > 0) {
    return colorMatches[0];
  }
  return null;
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
 * Property 1: Text Contrast Compliance (timer)
 * 
 * For any timer display text, the contrast ratio between the text color 
 * and its background color must be at least 4.5:1 for normal text or 3:1 for 
 * large text (18pt+ or 14pt+ bold), meeting WCAG AA standards.
 * 
 * **Validates: Requirements 8.6**
 */
describe('Modern Design Refresh - Property 1: Text Contrast Compliance (timer)', () => {
  let timerStyles, cssVars;
  
  beforeAll(() => {
    const extracted = extractTimerStylesFromCSS(cssContent);
    timerStyles = extracted.timerStyles;
    cssVars = extracted.cssVars;
  });
  
  test('timer display has sufficient text contrast', () => {
    // Get text color from gradient
    let textColor;
    if (timerStyles.background && timerStyles.background.includes('gradient')) {
      const color = extractColorsFromGradient(timerStyles.background);
      if (color) {
        textColor = parseColor(color);
      } else {
        textColor = { r: 0, g: 0, b: 0 };
      }
    } else if (timerStyles.color) {
      textColor = parseColor(timerStyles.color);
    } else {
      textColor = { r: 0, g: 0, b: 0 };
    }
    
    // Get background color from component section (glassmorphism)
    let bgColor;
    if (timerStyles.componentBackground) {
      // Extract color from rgba() format
      const rgbaMatch = timerStyles.componentBackground.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbaMatch) {
        bgColor = {
          r: parseInt(rgbaMatch[1]),
          g: parseInt(rgbaMatch[2]),
          b: parseInt(rgbaMatch[3])
        };
      } else {
        bgColor = { r: 255, g: 255, b: 255 };
      }
    } else {
      bgColor = { r: 255, g: 255, b: 255 };
    }
    
    // Get font properties
    const fontSize = fontSizeToPixels(timerStyles.fontSize);
    const fontWeight = fontWeightToNumeric(timerStyles.fontWeight);
    
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
        `Timer contrast failure:\n` +
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
    
    expect(meetsRequirement).toBe(true);
    expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
  });
  
  test('timer display uses large font size (xxxl)', () => {
    expect(timerStyles.fontSize).toBeDefined();
    // Check that it resolves to the xxxl clamp value
    expect(timerStyles.fontSize).toMatch(/clamp\(3rem|var\(--font-size-xxxl\)/);
  });
  
  test('timer display uses bold font weight', () => {
    expect(timerStyles.fontWeight).toBeDefined();
    const weight = fontWeightToNumeric(timerStyles.fontWeight);
    expect(weight).toBeGreaterThanOrEqual(700);
  });
  
  test('timer display uses gradient text effect', () => {
    expect(timerStyles.background).toBeDefined();
    expect(timerStyles.background).toContain('gradient');
  });
  
  test('contrast ratio calculation is accurate for known color pairs', () => {
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
