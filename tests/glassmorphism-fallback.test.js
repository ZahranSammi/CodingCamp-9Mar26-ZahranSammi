/**
 * Test: Glassmorphism Fallback for Browsers Without backdrop-filter Support
 * Task: 2.4 Add CSS fallbacks for browsers without backdrop-filter support
 * Requirements: 1.1, 1.2
 * 
 * This test verifies that:
 * 1. @supports is used to detect backdrop-filter capability
 * 2. A solid background fallback with reduced opacity is provided
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Glassmorphism Fallback Implementation', () => {
  let dom;
  let document;
  let window;
  let cssContent;

  beforeEach(() => {
    // Read the CSS file
    const cssPath = path.join(process.cwd(), 'css', 'styles.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Create a DOM environment
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          <div class="component-section">Test Component</div>
        </body>
      </html>
    `;

    dom = new JSDOM(html);
    document = dom.window.document;
    window = dom.window;
  });

  it('should use @supports to detect backdrop-filter capability', () => {
    // Verify that the CSS contains @supports rule for backdrop-filter
    expect(cssContent).toMatch(/@supports\s+not\s+\(\s*backdrop-filter\s*:\s*blur\s*\(\s*20px\s*\)\s*\)/);
  });

  it('should provide backdrop-filter with blur and saturate for supported browsers', () => {
    // Verify that backdrop-filter is applied to .component-section
    expect(cssContent).toMatch(/\.component-section\s*\{[\s\S]*?backdrop-filter\s*:\s*blur\(20px\)\s+saturate\(180%\)/);
  });

  it('should provide -webkit-backdrop-filter for Safari support', () => {
    // Verify that -webkit-backdrop-filter is included for Safari
    expect(cssContent).toMatch(/-webkit-backdrop-filter\s*:\s*blur\(20px\)\s+saturate\(180%\)/);
  });

  it('should provide solid background fallback with increased opacity', () => {
    // Verify that the fallback uses a more opaque background
    const fallbackMatch = cssContent.match(/@supports\s+not\s+\(backdrop-filter:\s*blur\([^)]+\)\)\s*\{[\s\S]*?background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/);
    
    expect(fallbackMatch).toBeTruthy();
    
    if (fallbackMatch) {
      const fallbackOpacity = parseFloat(fallbackMatch[1]);
      
      // The fallback opacity should be higher than the glassmorphism opacity
      // Glassmorphism uses 0.7, fallback should use 0.95
      expect(fallbackOpacity).toBeGreaterThan(0.7);
      expect(fallbackOpacity).toBeLessThanOrEqual(1.0);
    }
  });

  it('should have semi-transparent background for glassmorphism effect', () => {
    // Verify that the main glassmorphism background is semi-transparent
    const glassMatch = cssContent.match(/\.component-section\s*\{[\s\S]*?background\s*:\s*rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/);
    
    expect(glassMatch).toBeTruthy();
    
    if (glassMatch) {
      const glassOpacity = parseFloat(glassMatch[1]);
      
      // Glassmorphism should use semi-transparent background (0.7)
      expect(glassOpacity).toBeLessThan(1.0);
      expect(glassOpacity).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('should apply fallback only to .component-section elements', () => {
    // Verify that the @supports rule targets .component-section
    const supportsBlock = cssContent.match(/@supports\s+not\s+\(backdrop-filter:\s*blur\([^)]+\)\)\s*\{[\s\S]*?\n\}/);
    
    expect(supportsBlock).toBeTruthy();
    
    if (supportsBlock) {
      const blockContent = supportsBlock[0];
      expect(blockContent).toMatch(/\.component-section/);
    }
  });

  it('should maintain visual consistency with fallback', () => {
    // Verify that the fallback provides similar visual properties
    const element = document.querySelector('.component-section');
    const styles = window.getComputedStyle(element);

    // Check that border-radius is maintained
    expect(cssContent).toMatch(/border-radius\s*:\s*var\(--radius-xl\)/);
    
    // Check that box-shadow is maintained
    expect(cssContent).toMatch(/box-shadow\s*:\s*var\(--shadow-lg\)/);
    
    // Check that border is maintained
    expect(cssContent).toMatch(/border\s*:\s*1px\s+solid\s+rgba\(255,\s*255,\s*255,\s*0\.3\)/);
  });

  it('should use correct @supports syntax', () => {
    // Verify that @supports uses the "not" operator correctly
    const supportsPattern = /@supports\s+not\s+\(\s*backdrop-filter\s*:\s*blur\s*\(\s*\d+px\s*\)\s*\)\s*\{/;
    expect(cssContent).toMatch(supportsPattern);
  });

  it('should provide fallback that works in older browsers', () => {
    // Verify that the fallback uses only widely supported CSS properties
    const supportsBlock = cssContent.match(/@supports\s+not\s+\(backdrop-filter:\s*blur\([^)]+\)\)\s*\{[\s\S]*?\n\}/);
    
    if (supportsBlock) {
      const blockContent = supportsBlock[0];
      
      // Extract just the CSS rules inside the @supports block (not the condition)
      const rulesMatch = blockContent.match(/\{([\s\S]*)\}/);
      if (rulesMatch) {
        const rules = rulesMatch[1];
        
        // Should only use basic CSS properties in fallback rules
        expect(rules).toMatch(/background\s*:/);
        
        // The actual CSS rules should not try to use backdrop-filter
        // (the @supports condition will contain it, but the rules inside shouldn't)
        const innerRules = rules.replace(/@supports[^{]*\{/, '');
        expect(innerRules).not.toMatch(/backdrop-filter\s*:/);
        expect(innerRules).not.toMatch(/-webkit-backdrop-filter\s*:/);
      }
    }
  });
});

describe('Glassmorphism Visual Requirements', () => {
  let cssContent;

  beforeEach(() => {
    const cssPath = path.join(process.cwd(), 'css', 'styles.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  it('should implement glassmorphism with blur effect (Requirement 1.1)', () => {
    // Verify that backdrop-filter with blur is implemented
    expect(cssContent).toMatch(/backdrop-filter\s*:\s*blur\(20px\)/);
  });

  it('should apply backdrop blur filters to component backgrounds (Requirement 1.2)', () => {
    // Verify that backdrop-filter is applied to .component-section
    const componentSectionBlock = cssContent.match(/\.component-section\s*\{[\s\S]*?\n\}/);
    
    expect(componentSectionBlock).toBeTruthy();
    
    if (componentSectionBlock) {
      const blockContent = componentSectionBlock[0];
      expect(blockContent).toMatch(/backdrop-filter/);
      expect(blockContent).toMatch(/blur\(/);
    }
  });

  it('should provide graceful degradation for unsupported browsers', () => {
    // Verify that browsers without backdrop-filter support get a usable fallback
    const supportsBlock = cssContent.match(/@supports\s+not\s+\(backdrop-filter:\s*blur\([^)]+\)\)\s*\{[\s\S]*?\n\}/);
    
    expect(supportsBlock).toBeTruthy();
    expect(supportsBlock[0]).toMatch(/background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.9[0-9]\s*\)/);
  });
});
