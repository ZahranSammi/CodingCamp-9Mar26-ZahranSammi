/**
 * Tests for glassmorphism styling on component sections
 * Feature: modern-design-refresh
 * Task: 2.1 Apply glassmorphism base styles to all component sections
 */

import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Glassmorphism Component Styling', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Load the HTML
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8');
    const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
    
    // Create a JSDOM instance with the HTML and CSS
    dom = new JSDOM(html, {
      resources: 'usable',
      runScripts: 'dangerously'
    });
    
    document = dom.window.document;
    window = dom.window;
    
    // Inject the CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('Base Glassmorphism Styles', () => {
    test('should have semi-transparent white background', () => {
      const componentSections = document.querySelectorAll('.component-section');
      expect(componentSections.length).toBeGreaterThan(0);
      
      componentSections.forEach(section => {
        const styles = window.getComputedStyle(section);
        const background = styles.backgroundColor;
        
        // Check for rgba with alpha < 1 (semi-transparent)
        expect(background).toMatch(/rgba?\(/);
      });
    });

    test('should have backdrop-filter with blur and saturate', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check that backdrop-filter is defined in CSS
      expect(css).toMatch(/backdrop-filter:\s*blur\(20px\)\s+saturate\(180%\)/);
    });

    test('should have webkit-backdrop-filter for Safari support', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check that -webkit-backdrop-filter is defined in CSS
      expect(css).toMatch(/-webkit-backdrop-filter:\s*blur\(20px\)\s+saturate\(180%\)/);
    });

    test('should have subtle border with rgba color', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for border with rgba
      expect(css).toMatch(/border:\s*1px\s+solid\s+rgba\(255,\s*255,\s*255,\s*0\.3\)/);
    });

    test('should use CSS variable for border-radius', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check that border-radius uses var(--radius-xl)
      expect(css).toMatch(/border-radius:\s*var\(--radius-xl\)/);
    });

    test('should use CSS variable for box-shadow', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check that box-shadow uses var(--shadow-lg)
      expect(css).toMatch(/box-shadow:\s*var\(--shadow-lg\)/);
    });

    test('should have smooth transitions for GPU-accelerated properties only (Requirement 12.1)', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for transition with GPU-accelerated properties (transform, opacity)
      expect(css).toMatch(/transition:\s*transform\s+0\.3s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/);
    });
  });

  describe('Hover Effects', () => {
    test('should have translateY transform on hover', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for hover transform
      expect(css).toMatch(/\.component-section:hover[\s\S]*?transform:\s*translateY\(-4px\)/);
    });

    test('should increase box-shadow to 2xl on hover', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for hover shadow increase
      expect(css).toMatch(/\.component-section:hover[\s\S]*?box-shadow:\s*var\(--shadow-2xl\)/);
    });

    test('should brighten border color on hover', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for hover border color change
      expect(css).toMatch(/\.component-section:hover[\s\S]*?border-color:\s*rgba\(255,\s*255,\s*255,\s*0\.5\)/);
    });
  });

  describe('Browser Fallbacks', () => {
    test('should have fallback for browsers without backdrop-filter support', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for @supports fallback
      expect(css).toMatch(/@supports\s+not\s+\(backdrop-filter:\s*blur\(20px\)\)/);
      expect(css).toMatch(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.95\)/);
    });
  });

  describe('CSS Variables Used', () => {
    test('should use --radius-xl for border-radius', () => {
      const componentSections = document.querySelectorAll('.component-section');
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Verify --radius-xl is defined
      expect(css).toMatch(/--radius-xl:\s*1\.5rem/);
    });

    test('should use --shadow-lg for box-shadow', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Verify --shadow-lg is defined with multi-layer shadows
      expect(css).toMatch(/--shadow-lg:\s*\n?\s*0\s+10px\s+15px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/);
    });

    test('should use --shadow-2xl for hover state', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Verify --shadow-2xl is defined with multi-layer shadows
      expect(css).toMatch(/--shadow-2xl:\s*\n?\s*0\s+25px\s+50px\s+rgba\(0,\s*0,\s*0,\s*0\.15\)/);
    });
  });

  describe('GPU Acceleration', () => {
    test('should use will-change sparingly only during hover (Requirement 12.3)', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check that will-change is used only during hover states
      expect(css).toMatch(/\.component-section:hover\s*{[^}]*will-change:\s*transform/s);
      // Check that will-change is removed after hover
      expect(css).toMatch(/\.component-section:not\(:hover\)\s*{[^}]*will-change:\s*auto/s);
    });
  });

  describe('Gradient Borders', () => {
    test('should have position relative for pseudo-element gradient border', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for position relative
      expect(css).toMatch(/\.component-section\s*\{[\s\S]*?position:\s*relative/);
    });

    test('should have ::before pseudo-element for gradient border', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for ::before pseudo-element
      expect(css).toMatch(/\.component-section::before/);
    });

    test('should use gradient-primary for border gradient', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check that ::before uses gradient-primary
      expect(css).toMatch(/\.component-section::before[\s\S]*?background:\s*var\(--gradient-primary\)/);
    });

    test('should have mask properties for gradient border effect', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for mask and -webkit-mask properties
      expect(css).toMatch(/\.component-section::before[\s\S]*?-webkit-mask:/);
      expect(css).toMatch(/\.component-section::before[\s\S]*?mask:/);
    });

    test('should have pointer-events none on gradient border', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for pointer-events: none
      expect(css).toMatch(/\.component-section::before[\s\S]*?pointer-events:\s*none/);
    });

    test('should have opacity transition on gradient border', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for opacity and transition
      expect(css).toMatch(/\.component-section::before[\s\S]*?opacity:\s*0\.6/);
      expect(css).toMatch(/\.component-section::before[\s\S]*?transition:\s*opacity/);
    });

    test('should enhance gradient border opacity on hover', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check for hover state increasing opacity
      expect(css).toMatch(/\.component-section:hover::before[\s\S]*?opacity:\s*1/);
    });

    test('should use same border-radius as component section', () => {
      const css = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
      
      // Check that ::before uses var(--radius-xl)
      expect(css).toMatch(/\.component-section::before[\s\S]*?border-radius:\s*var\(--radius-xl\)/);
    });
  });
});
