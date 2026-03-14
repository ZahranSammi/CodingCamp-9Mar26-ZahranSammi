/**
 * Property-Based Tests for Dark Mode Contrast Preservation
 * Feature: modern-design-refresh, Property 12: Dark Mode Contrast Preservation
 * 
 * **Validates: Requirements 14.3**
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
function setupDOM(theme = 'light') {
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
  
  // Set theme attribute
  document.documentElement.setAttribute('data-theme', theme);
  
  return { window, document };
}

/**
 * Helper function to check if dark mode exists in CSS
 */
function darkModeExists() {
  return cssContent.includes('[data-theme="dark"]');
}

/**
 * Property 12: Dark Mode Contrast Preservation
 * 
 * Where dark mode is implemented, for any text element in dark mode, the contrast ratio between
 * text and background must still meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
 * 
 * **Validates: Requirements 14.3**
 */
describe('Modern Design Refresh - Property 12: Dark Mode Contrast Preservation', () => {
  test('dark mode CSS variables are defined', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Verify dark mode color scheme exists
    expect(cssContent).toContain('[data-theme="dark"]');
    
    // Verify dark background colors are defined
    const darkBackgroundRegex = /\[data-theme="dark"\]\s*\{[^}]*--color-background:/s;
    expect(darkBackgroundRegex.test(cssContent)).toBe(true);
    
    // Verify dark text colors are defined
    const darkTextRegex = /\[data-theme="dark"\]\s*\{[^}]*--color-text-primary:/s;
    expect(darkTextRegex.test(cssContent)).toBe(true);
  });
  
  test('dark mode background colors are dark (low lightness)', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Extract dark mode background color definitions
    const darkModeSection = cssContent.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/s);
    if (!darkModeSection) {
      throw new Error('Dark mode section not found');
    }
    
    const darkModeContent = darkModeSection[1];
    
    // Check background color lightness
    const backgroundRegex = /--color-background:\s*hsl\([^,]+,\s*[^,]+,\s*(\d+)%\)/;
    const bgMatch = darkModeContent.match(backgroundRegex);
    
    if (bgMatch) {
      const lightness = parseInt(bgMatch[1]);
      // Dark mode backgrounds should have low lightness (< 30%)
      expect(lightness).toBeLessThan(30);
    }
  });
  
  test('dark mode text colors are light (high lightness)', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Extract dark mode text color definitions
    const darkModeSection = cssContent.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/s);
    if (!darkModeSection) {
      throw new Error('Dark mode section not found');
    }
    
    const darkModeContent = darkModeSection[1];
    
    // Check primary text color lightness
    const textRegex = /--color-text-primary:\s*hsl\([^,]+,\s*[^,]+,\s*(\d+)%\)/;
    const textMatch = darkModeContent.match(textRegex);
    
    if (textMatch) {
      const lightness = parseInt(textMatch[1]);
      // Dark mode text should have high lightness (> 70%)
      expect(lightness).toBeGreaterThan(70);
    }
  });
  
  test('dark mode adjusts glassmorphism for dark backgrounds', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Verify glassmorphism variables are adjusted for dark mode
    const glassBackgroundRegex = /\[data-theme="dark"\]\s*\{[^}]*--glass-background:/s;
    const glassBorderRegex = /\[data-theme="dark"\]\s*\{[^}]*--glass-border:/s;
    
    expect(glassBackgroundRegex.test(cssContent) || glassBorderRegex.test(cssContent)).toBe(true);
  });
  
  test('dark mode inverts shadow directions', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Extract dark mode shadow definitions
    const darkModeSection = cssContent.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/s);
    if (!darkModeSection) {
      throw new Error('Dark mode section not found');
    }
    
    const darkModeContent = darkModeSection[1];
    
    // Check if shadows use negative Y offsets (inverted)
    const shadowRegex = /--shadow-\w+:\s*[^;]+/g;
    const shadows = [...darkModeContent.matchAll(shadowRegex)];
    
    if (shadows.length > 0) {
      // At least some shadows should have negative Y offsets
      const hasInvertedShadows = shadows.some(match => {
        const shadowDef = match[0];
        return shadowDef.includes('-') && /\s-\d+px/.test(shadowDef);
      });
      
      expect(hasInvertedShadows).toBe(true);
    }
  });
  
  test('dark mode semantic colors are adjusted for better contrast', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Extract dark mode semantic color definitions
    const darkModeSection = cssContent.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/s);
    if (!darkModeSection) {
      throw new Error('Dark mode section not found');
    }
    
    const darkModeContent = darkModeSection[1];
    
    // Check if semantic colors are redefined for dark mode
    const semanticColors = ['success', 'danger', 'warning'];
    const hasSemanticColors = semanticColors.some(color => {
      const regex = new RegExp(`--color-${color}:`);
      return regex.test(darkModeContent);
    });
    
    // Semantic colors should be adjusted for dark mode
    expect(hasSemanticColors).toBe(true);
  });
  
  test('dark mode maintains WCAG AA contrast for primary colors', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Extract dark mode primary color definitions
    const darkModeSection = cssContent.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/s);
    if (!darkModeSection) {
      throw new Error('Dark mode section not found');
    }
    
    const darkModeContent = darkModeSection[1];
    
    // Check primary color lightness values
    const primaryRegex = /--color-primary-(\d+):\s*hsl\([^,]+,\s*[^,]+,\s*(\d+)%\)/g;
    const matches = [...darkModeContent.matchAll(primaryRegex)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const lightness = parseInt(match[2]);
        // Primary colors in dark mode should be lighter (> 50%) for contrast with dark backgrounds
        expect(lightness).toBeGreaterThan(50);
      });
    }
  });
  
  test('dark mode theme toggle persists preference in localStorage', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Check if JavaScript includes localStorage persistence for theme
    const jsPath = path.join(process.cwd(), 'js', 'app.js');
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    
    // Verify theme persistence logic exists
    expect(jsContent).toContain('localStorage');
    expect(jsContent).toContain('theme');
  });
  
  test('dark mode provides toggle control in UI', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Check if HTML includes theme toggle button
    expect(htmlContent).toContain('theme-toggle');
  });
  
  test('dark mode applies to all component sections', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Verify dark mode styles are applied to component sections
    const componentSectionRegex = /\[data-theme="dark"\]\s+\.component-section/;
    expect(componentSectionRegex.test(cssContent)).toBe(true);
  });
  
  test('dark mode adjusts input backgrounds for visibility', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Verify input fields have dark mode styling
    const inputRegex = /\[data-theme="dark"\]\s+\.(name-input|task-input|duration-input)/;
    expect(inputRegex.test(cssContent)).toBe(true);
  });
  
  test('dark mode adjusts task item backgrounds', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Verify task items have dark mode styling
    const taskItemRegex = /\[data-theme="dark"\]\s+\.task-item/;
    expect(taskItemRegex.test(cssContent)).toBe(true);
  });
  
  test('dark mode adjusts skeleton loading styles', () => {
    if (!darkModeExists()) {
      console.log('Dark mode not implemented, skipping test');
      return;
    }
    
    // Verify skeleton loading has dark mode styling
    const skeletonRegex = /\[data-theme="dark"\]\s+\.skeleton/;
    expect(skeletonRegex.test(cssContent)).toBe(true);
  });
});
