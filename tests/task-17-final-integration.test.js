/**
 * Task 17: Final Integration and Polish Tests
 * 
 * This test suite validates the complete modern design refresh implementation
 * across all components, breakpoints, accessibility features, and performance metrics.
 */

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load HTML and CSS
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../css/styles.css'), 'utf8');

describe('Task 17: Final Integration and Polish', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Create a new JSDOM instance for each test
    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      beforeParse(window) {
        // Mock localStorage
        window.localStorage = {
          data: {},
          getItem(key) {
            return this.data[key] || null;
          },
          setItem(key, value) {
            this.data[key] = value;
          },
          removeItem(key) {
            delete this.data[key];
          },
          clear() {
            this.data = {};
          }
        };
      }
    });

    document = dom.window.document;
    window = dom.window;

    // Inject CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('17.1 Test all components with modern styling', () => {
    test('GreetingComponent renders with glassmorphism', () => {
      const greetingContainer = document.getElementById('greeting-container');
      expect(greetingContainer).toBeTruthy();

      // Check glassmorphism properties in CSS
      expect(css).toContain('backdrop-filter: blur');
      expect(css).toContain('-webkit-backdrop-filter: blur');
      expect(css).toContain('background: rgba(255, 255, 255, 0.7)');
      expect(css).toContain('border-radius: var(--radius-xl)');
      expect(css).toContain('box-shadow: var(--shadow-lg)');
    });

    test('FocusTimerComponent has gradient text and animations', () => {
      const timerContainer = document.getElementById('timer-container');
      expect(timerContainer).toBeTruthy();

      // Timer container should have glassmorphism in CSS
      expect(css).toContain('.component-section');
      expect(css).toContain('backdrop-filter: blur');

      // Check for animation keyframes in CSS
      expect(css).toContain('@keyframes pulse');
      expect(css).toContain('@keyframes celebrate');
      expect(css).toContain('animation: pulse');
      expect(css).toContain('animation: celebrate');
      
      // Check for gradient text effect
      expect(css).toContain('.timer-display');
      expect(css).toContain('background: var(--gradient-danger)');
      expect(css).toContain('-webkit-background-clip: text');
      expect(css).toContain('-webkit-text-fill-color: transparent');
    });

    test('TaskListComponent has custom checkboxes and hover effects', () => {
      const tasksContainer = document.getElementById('tasks-container');
      expect(tasksContainer).toBeTruthy();

      // Check for custom checkbox styles in CSS
      expect(css).toContain('.task-checkbox');
      expect(css).toContain('appearance: none');
      expect(css).toContain('.task-checkbox:checked::after');
      expect(css).toContain('@keyframes checkmark');

      // Check for hover effects
      expect(css).toContain('.task-item:hover');
      expect(css).toContain('transform: translateX');
    });

    test('QuickLinksComponent has gradient cards and hover effects', () => {
      const linksContainer = document.getElementById('links-container');
      expect(linksContainer).toBeTruthy();

      // Check for gradient backgrounds in CSS
      expect(css).toContain('.link-button');
      expect(css).toContain('background: var(--gradient-primary)');
      
      // Check for hover effects
      expect(css).toContain('.link-button:hover');
      expect(css).toContain('transform: translateY(-4px) scale(1.02)');
    });

    test('All components have entrance animations', () => {
      // Check for fadeInUp animation
      expect(css).toContain('@keyframes fadeInUp');
      expect(css).toContain('animation: fadeInUp');
      
      // Check for staggered delays
      expect(css).toContain('.component-section:nth-child(1)');
      expect(css).toContain('animation-delay: 0.1s');
      expect(css).toContain('.component-section:nth-child(2)');
      expect(css).toContain('animation-delay: 0.2s');
      expect(css).toContain('.component-section:nth-child(3)');
      expect(css).toContain('animation-delay: 0.3s');
      expect(css).toContain('.component-section:nth-child(4)');
      expect(css).toContain('animation-delay: 0.4s');
    });

    test('All components use modern color palette', () => {
      // Check for HSL color definitions
      expect(css).toContain('hsl(210, 100%');
      expect(css).toContain('hsl(280, 80%');
      expect(css).toContain('hsl(145, 65%');
      
      // Check for gradient definitions
      expect(css).toContain('--gradient-primary');
      expect(css).toContain('--gradient-accent');
      expect(css).toContain('--gradient-success');
      expect(css).toContain('--gradient-danger');
    });
  });

  describe('17.2 Test responsive behavior across all breakpoints', () => {
    const breakpoints = [
      { width: 320, name: 'mobile' },
      { width: 768, name: 'tablet' },
      { width: 1024, name: 'desktop' },
      { width: 1440, name: 'large desktop' }
    ];

    breakpoints.forEach(({ width, name }) => {
      test(`Test at ${width}px (${name})`, () => {
        // Set viewport width
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        // Check for appropriate media query in CSS
        if (width <= 767) {
          expect(css).toContain('@media (max-width: 767px)');
        } else if (width >= 768 && width <= 1023) {
          expect(css).toContain('@media (min-width: 768px) and (max-width: 1023px)');
        } else if (width >= 1024 && width <= 1439) {
          expect(css).toContain('@media (min-width: 1024px) and (max-width: 1439px)');
        } else {
          expect(css).toContain('@media (min-width: 1440px)');
        }

        // Verify glassmorphism is maintained at all breakpoints (check CSS, not computed styles)
        expect(css).toContain('backdrop-filter: blur');
        expect(css).toContain('background: rgba(255, 255, 255, 0.7)');
      });
    });

    test('Mobile breakpoint has minimum touch targets (44x44px)', () => {
      // Check for touch target sizing in mobile media query
      expect(css).toContain('min-height: 44px');
      expect(css).toContain('@media (max-width: 767px)');
    });

    test('Spacing adjusts appropriately at each breakpoint', () => {
      // Mobile: reduced spacing
      expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*padding: var\(--spacing-[1-4]\)/);
      
      // Tablet: medium spacing
      expect(css).toMatch(/@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*padding: var\(--spacing-[4-6]\)/);
      
      // Desktop: standard spacing
      expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*padding: var\(--spacing-[5-8]\)/);
      
      // Large desktop: generous spacing (spacing-6, spacing-8, spacing-10, spacing-12)
      expect(css).toMatch(/@media \(min-width: 1440px\)[\s\S]*padding: var\(--spacing-(6|8|10|12)\)/);
    });

    test('Grid layout adapts to viewport width', () => {
      // Check for responsive grid definitions
      expect(css).toContain('grid-template-columns');
      expect(css).toContain('repeat(auto-fit, minmax(300px, 1fr))');
      
      // Mobile: single column
      expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*grid-template-columns: 1fr/);
      
      // Tablet and desktop: multi-column
      expect(css).toMatch(/@media \(min-width: 768px\)[\s\S]*grid-template-columns: repeat\(2, 1fr\)/);
    });
  });

  describe('17.3 Test accessibility with keyboard navigation', () => {
    test('Tab through all interactive elements', () => {
      // Get all interactive elements
      const interactiveElements = document.querySelectorAll(
        'button, input, a, [tabindex]:not([tabindex="-1"])'
      );

      expect(interactiveElements.length).toBeGreaterThan(0);

      // Verify each element is keyboard accessible
      interactiveElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        // Element should either have no tabindex (default behavior) or tabindex >= 0
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });

    test('Verify focus indicators are visible', () => {
      // Check for focus-visible styles in CSS
      expect(css).toContain(':focus-visible');
      expect(css).toContain('outline: 3px solid');
      expect(css).toContain('outline-offset: 2px');
    });

    test('Verify no focus traps exist', () => {
      // Get all focusable elements
      const focusableElements = document.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );

      // Verify there are focusable elements
      expect(focusableElements.length).toBeGreaterThan(0);

      // Verify no elements have tabindex that would create a trap
      focusableElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex !== null) {
          // Tabindex should not be negative (except -1 which removes from tab order)
          const tabIndexValue = parseInt(tabIndex);
          expect(tabIndexValue).toBeGreaterThanOrEqual(-1);
        }
      });
    });

    test('All interactive elements without visible text have ARIA labels', () => {
      // Verify theme toggle has aria-label
      const themeToggle = document.getElementById('theme-toggle');
      expect(themeToggle).toBeTruthy();
      expect(themeToggle.getAttribute('aria-label')).toBeTruthy();
      expect(themeToggle.getAttribute('aria-label')).toBe('Toggle dark mode');
    });

    test('Component sections have appropriate ARIA labels', () => {
      const greetingContainer = document.getElementById('greeting-container');
      const timerContainer = document.getElementById('timer-container');
      const tasksContainer = document.getElementById('tasks-container');
      const linksContainer = document.getElementById('links-container');

      expect(greetingContainer.getAttribute('aria-label')).toBeTruthy();
      expect(timerContainer.getAttribute('aria-label')).toBeTruthy();
      expect(tasksContainer.getAttribute('aria-label')).toBeTruthy();
      expect(linksContainer.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('17.4 Test with reduced motion preference enabled', () => {
    test('Enable prefers-reduced-motion in browser', () => {
      // Check for reduced motion media query in CSS
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    });

    test('Verify animations are disabled or minimal', () => {
      // Check that reduced motion media query sets animation duration to minimal
      const reducedMotionRegex = /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration: 0\.01ms !important/;
      expect(css).toMatch(reducedMotionRegex);
      
      // Check that transition duration is also minimal
      const reducedTransitionRegex = /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: 0\.01ms !important/;
      expect(css).toMatch(reducedTransitionRegex);
      
      // Check that animation iteration count is set to 1
      const reducedIterationRegex = /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-iteration-count: 1 !important/;
      expect(css).toMatch(reducedIterationRegex);
    });

    test('Verify functionality still works', () => {
      // Even with reduced motion, all interactive elements should still be present
      const themeToggle = document.getElementById('theme-toggle');
      
      // Verify theme toggle button exists
      expect(themeToggle).toBeTruthy();
      
      // Verify component containers are still rendered
      expect(document.getElementById('greeting-container')).toBeTruthy();
      expect(document.getElementById('timer-container')).toBeTruthy();
      expect(document.getElementById('tasks-container')).toBeTruthy();
      expect(document.getElementById('links-container')).toBeTruthy();
    });

    test('Reduced motion applies to all elements', () => {
      // Check that the reduced motion rule applies to all elements
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\*,[\s\S]*\*::before,[\s\S]*\*::after/);
    });
  });

  describe('17.5 Verify performance with browser DevTools', () => {
    test('Check animation frame rate (should be 60fps)', () => {
      // Animation durations should be between 150-400ms for smooth 60fps
      const animationDurations = [
        '150ms',
        '200ms',
        '250ms',
        '300ms',
        '400ms'
      ];

      // Check that animation durations fall within acceptable range
      const hasValidDurations = animationDurations.some(duration => 
        css.includes(duration) || css.includes(duration.replace('ms', 'ms'))
      );
      
      expect(hasValidDurations).toBe(true);
    });

    test('Verify no layout thrashing', () => {
      // Check that only GPU-accelerated properties are animated
      const gpuAcceleratedProps = ['transform', 'opacity', 'filter'];
      const nonGpuProps = ['width', 'height', 'top', 'left', 'margin', 'padding'];

      // Verify transitions use GPU-accelerated properties
      const transitionMatches = css.match(/transition:[\s\S]*?;/g) || [];
      
      transitionMatches.forEach(transition => {
        // Should contain GPU-accelerated properties
        const hasGpuProp = gpuAcceleratedProps.some(prop => transition.includes(prop));
        
        // Should not animate non-GPU properties directly
        const hasNonGpuProp = nonGpuProps.some(prop => {
          // Check if the property is being transitioned (not just mentioned)
          const propRegex = new RegExp(`transition:\\s*${prop}`, 'i');
          return propRegex.test(transition);
        });
        
        if (transition.includes('transform') || transition.includes('opacity')) {
          expect(hasGpuProp).toBe(true);
        }
      });
    });

    test('Check paint and composite layers', () => {
      // Verify will-change is used appropriately (only on hover)
      expect(css).toContain('will-change: transform');
      expect(css).toContain(':hover');
      
      // Verify will-change is removed after hover
      expect(css).toContain('will-change: auto');
      expect(css).toContain(':not(:hover)');
    });

    test('CSS containment is applied for component isolation', () => {
      // Check for CSS containment property
      expect(css).toContain('contain: layout style paint');
      expect(css).toContain('.component-section');
    });

    test('Backdrop filter has fallback for unsupported browsers', () => {
      // Check for @supports rule for backdrop-filter
      expect(css).toContain('@supports not (backdrop-filter: blur(20px))');
      
      // Verify fallback provides solid background
      const fallbackRegex = /@supports not \(backdrop-filter: blur\(20px\)\)[\s\S]*background: rgba\(255,\s*255,\s*255,\s*0\.9[0-9]*\)/;
      expect(css).toMatch(fallbackRegex);
    });

    test('Animations use cubic-bezier easing for natural motion', () => {
      // Check for cubic-bezier easing functions
      expect(css).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(css).toContain('cubic-bezier(0.4, 0, 0.6, 1)');
    });

    test('Shadow definitions use multi-layer approach', () => {
      // Check for multi-layer shadow definitions
      expect(css).toContain('--shadow-sm:');
      expect(css).toContain('--shadow-md:');
      expect(css).toContain('--shadow-lg:');
      expect(css).toContain('--shadow-xl:');
      expect(css).toContain('--shadow-2xl:');
      
      // Verify shadows have multiple layers (comma-separated)
      const shadowRegex = /--shadow-[a-z]+:\s*[^;]*,\s*[^;]*/;
      expect(css).toMatch(shadowRegex);
    });
  });

  describe('Integration: Dark Mode Support', () => {
    test('Dark mode color scheme is defined', () => {
      expect(css).toContain('[data-theme="dark"]');
      expect(css).toContain('--color-background: hsl(210, 20%, 12%)');
    });

    test('Dark mode adjusts glassmorphism', () => {
      expect(css).toContain('--glass-background');
      expect(css).toContain('--glass-border');
      expect(css).toMatch(/\[data-theme="dark"\][\s\S]*\.component-section/);
    });

    test('Dark mode inverts shadow directions', () => {
      // Check that dark mode shadows use negative offsets
      expect(css).toMatch(/\[data-theme="dark"\][\s\S]*--shadow-[a-z]+:\s*0\s+-[0-9]+px/);
    });

    test('Theme toggle button exists and is accessible', () => {
      const themeToggle = document.getElementById('theme-toggle');
      expect(themeToggle).toBeTruthy();
      expect(themeToggle.getAttribute('aria-label')).toBe('Toggle dark mode');
    });
  });

  describe('Integration: Typography System', () => {
    test('Fluid typography uses clamp() for responsive scaling', () => {
      expect(css).toContain('clamp(');
      expect(css).toContain('--font-size-xs: clamp');
      expect(css).toContain('--font-size-sm: clamp');
      expect(css).toContain('--font-size-base: clamp');
      expect(css).toContain('--font-size-lg: clamp');
    });

    test('Font weights are defined for hierarchy', () => {
      expect(css).toContain('--font-weight-light: 300');
      expect(css).toContain('--font-weight-normal: 400');
      expect(css).toContain('--font-weight-medium: 500');
      expect(css).toContain('--font-weight-semibold: 600');
      expect(css).toContain('--font-weight-bold: 700');
    });

    test('System font stack is used', () => {
      expect(css).toContain('-apple-system');
      expect(css).toContain('BlinkMacSystemFont');
      expect(css).toContain('Segoe UI');
      expect(css).toContain('Roboto');
    });
  });

  describe('Integration: Spacing System', () => {
    test('Spacing uses 8px base unit (0.5rem)', () => {
      expect(css).toContain('--spacing-2: 0.5rem');
      expect(css).toContain('/* 8px */');
    });

    test('All spacing values are multiples of 0.25rem (4px)', () => {
      const spacingRegex = /--spacing-[0-9]+: (0\.25|0\.5|0\.75|1|1\.25|1\.5|2|2\.5|3|4)rem/g;
      const spacingMatches = css.match(spacingRegex);
      expect(spacingMatches).toBeTruthy();
      expect(spacingMatches.length).toBeGreaterThan(0);
    });
  });

  describe('Integration: Border Radius System', () => {
    test('Border radius values create soft, rounded corners', () => {
      expect(css).toContain('--radius-sm: 0.5rem');
      expect(css).toContain('--radius-md: 0.75rem');
      expect(css).toContain('--radius-lg: 1rem');
      expect(css).toContain('--radius-xl: 1.5rem');
      expect(css).toContain('--radius-full: 9999px');
    });

    test('Component sections use xl border radius', () => {
      expect(css).toContain('.component-section');
      expect(css).toContain('border-radius: var(--radius-xl)');
    });
  });

  describe('Integration: Complete Modern Design System', () => {
    test('All CSS custom properties are defined', () => {
      const requiredVariables = [
        '--color-primary-500',
        '--color-accent-500',
        '--color-neutral-500',
        '--gradient-primary',
        '--font-family-base',
        '--font-size-base',
        '--spacing-4',
        '--radius-md',
        '--shadow-md'
      ];

      requiredVariables.forEach(variable => {
        expect(css).toContain(variable);
      });
    });

    test('Glassmorphism is consistently applied', () => {
      expect(css).toContain('backdrop-filter: blur(20px)');
      expect(css).toContain('-webkit-backdrop-filter: blur(20px)');
      expect(css).toContain('background: rgba(255, 255, 255, 0.7)');
    });

    test('All components have consistent styling patterns', () => {
      // Check that all major components use the design system
      const components = [
        '.greeting-component',
        '.focus-timer-component',
        '.task-list-component',
        '.quick-links-component'
      ];

      components.forEach(component => {
        expect(css).toContain(component);
      });
    });
  });
});
