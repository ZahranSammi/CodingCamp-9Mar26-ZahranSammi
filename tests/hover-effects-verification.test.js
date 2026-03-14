/**
 * Verification test for Task 2.2: Implement hover effects for component cards
 * Feature: modern-design-refresh
 * Requirements: 5.2
 * 
 * This test verifies that all three hover effect requirements are correctly implemented:
 * 1. translateY(-4px) transform on hover
 * 2. Increase box-shadow to 2xl on hover
 * 3. Brighten border color on hover
 */

import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Task 2.2: Component Card Hover Effects Verification', () => {
  let dom;
  let document;
  let window;
  let css;

  beforeAll(() => {
    // Load the HTML and CSS
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
    css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
    
    // Create a JSDOM instance
    dom = new JSDOM(html);
    document = dom.window.document;
    window = dom.window;
    
    // Inject the CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  });

  afterAll(() => {
    dom.window.close();
  });

  describe('Requirement 5.2: Hover Effects Implementation', () => {
    test('should have all four component sections with hover effects', () => {
      const componentSections = document.querySelectorAll('.component-section');
      
      // Verify we have 4 component sections (greeting, timer, tasks, links)
      expect(componentSections.length).toBe(4);
      
      // Verify each section has the component-section class
      componentSections.forEach(section => {
        expect(section.classList.contains('component-section')).toBe(true);
      });
    });

    test('Sub-task 1: should apply translateY(-4px) transform on hover', () => {
      // Extract the hover rule from CSS
      const hoverRuleMatch = css.match(/\.component-section:hover\s*{([^}]*)}/);
      expect(hoverRuleMatch).not.toBeNull();
      
      const hoverStyles = hoverRuleMatch[1];
      
      // Verify transform: translateY(-4px) is present
      expect(hoverStyles).toMatch(/transform:\s*translateY\(-4px\)/);
    });

    test('Sub-task 2: should increase box-shadow to 2xl on hover', () => {
      // Extract the hover rule from CSS
      const hoverRuleMatch = css.match(/\.component-section:hover\s*{([^}]*)}/);
      expect(hoverRuleMatch).not.toBeNull();
      
      const hoverStyles = hoverRuleMatch[1];
      
      // Verify box-shadow uses var(--shadow-2xl)
      expect(hoverStyles).toMatch(/box-shadow:\s*var\(--shadow-2xl\)/);
      
      // Verify --shadow-2xl is defined with appropriate values
      expect(css).toMatch(/--shadow-2xl:\s*\n?\s*0\s+25px\s+50px\s+rgba\(0,\s*0,\s*0,\s*0\.15\)/);
    });

    test('Sub-task 3: should brighten border color on hover', () => {
      // Extract the base and hover rules from CSS
      const baseRuleMatch = css.match(/\.component-section\s*{([^}]*)}/);
      const hoverRuleMatch = css.match(/\.component-section:hover\s*{([^}]*)}/);
      
      expect(baseRuleMatch).not.toBeNull();
      expect(hoverRuleMatch).not.toBeNull();
      
      const baseStyles = baseRuleMatch[1];
      const hoverStyles = hoverRuleMatch[1];
      
      // Verify base border color is rgba(255, 255, 255, 0.3)
      expect(baseStyles).toMatch(/border:\s*1px\s+solid\s+rgba\(255,\s*255,\s*255,\s*0\.3\)/);
      
      // Verify hover border color is rgba(255, 255, 255, 0.5) - brighter (0.5 > 0.3)
      expect(hoverStyles).toMatch(/border-color:\s*rgba\(255,\s*255,\s*255,\s*0\.5\)/);
    });

    test('should have smooth transition for hover effects with GPU-accelerated properties', () => {
      // Verify transition is defined with cubic-bezier easing
      // Per Requirement 12.1, only GPU-accelerated properties (transform, opacity) should be animated
      const baseRuleMatch = css.match(/\.component-section\s*{([^}]*)}/);
      expect(baseRuleMatch).not.toBeNull();
      
      const baseStyles = baseRuleMatch[1];
      
      // Verify smooth transition with cubic-bezier easing for GPU-accelerated properties
      expect(baseStyles).toMatch(/transition:\s*transform\s+0\.3s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\),\s*opacity\s+0\.3s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/);
    });

    test('should optimize hover effects for GPU acceleration with will-change during hover only', () => {
      // Per Requirement 12.3, will-change should only be set during hover, not in base styles
      const hoverRuleMatch = css.match(/\.component-section:hover\s*{([^}]*)}/);
      expect(hoverRuleMatch).not.toBeNull();
      
      const hoverStyles = hoverRuleMatch[1];
      
      // Verify will-change is set during hover
      expect(hoverStyles).toMatch(/will-change:\s*transform/);
      
      // Verify will-change is removed after hover
      const notHoverRuleMatch = css.match(/\.component-section:not\(:hover\)\s*{([^}]*)}/);
      expect(notHoverRuleMatch).not.toBeNull();
      
      const notHoverStyles = notHoverRuleMatch[1];
      expect(notHoverStyles).toMatch(/will-change:\s*auto/);
    });
  });

  describe('Integration with Task 2.1: Glassmorphism Base Styles', () => {
    test('should maintain glassmorphism effects with hover', () => {
      // Verify base glassmorphism styles are present
      const baseRuleMatch = css.match(/\.component-section\s*{([^}]*)}/);
      expect(baseRuleMatch).not.toBeNull();
      
      const baseStyles = baseRuleMatch[1];
      
      // Verify glassmorphism base styles
      expect(baseStyles).toMatch(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.7\)/);
      expect(baseStyles).toMatch(/backdrop-filter:\s*blur\(20px\)\s+saturate\(180%\)/);
      expect(baseStyles).toMatch(/border-radius:\s*var\(--radius-xl\)/);
    });
  });

  describe('Visual Consistency', () => {
    test('should apply hover effects to all component sections uniformly', () => {
      // Verify the CSS rule applies to all .component-section elements
      // This ensures greeting, timer, tasks, and links all get the same hover effects
      
      const componentSections = document.querySelectorAll('.component-section');
      expect(componentSections.length).toBe(4);
      
      // All sections should have the same class
      componentSections.forEach(section => {
        expect(section.className).toBe('component-section');
      });
    });
  });
});
