/**
 * Unit Tests for Modern Design CSS Variables
 * Tests that CSS variables for the color system are properly defined
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Modern Design CSS Variables', () => {
  let cssContent;

  beforeAll(() => {
    // Read the CSS file
    const cssPath = join(process.cwd(), 'css', 'styles.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  describe('Primary Colors', () => {
    test('should define primary color palette with HSL values', () => {
      const primaryColors = [
        '--color-primary-50',
        '--color-primary-100',
        '--color-primary-200',
        '--color-primary-300',
        '--color-primary-400',
        '--color-primary-500',
        '--color-primary-600',
        '--color-primary-700'
      ];

      primaryColors.forEach(color => {
        expect(cssContent).toContain(color);
        const regex = new RegExp(`${color}:\\s*hsl\\(`);
        expect(cssContent).toMatch(regex);
      });
    });

    test('should have base primary color at 500 level', () => {
      expect(cssContent).toContain('--color-primary-500: hsl(210, 100%, 55%)');
    });

    test('should have primary colors with hue 210', () => {
      const primaryRegex = /--color-primary-\d+:\s*hsl\(210,/g;
      const matches = cssContent.match(primaryRegex);
      expect(matches).toBeTruthy();
      expect(matches.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Accent Colors', () => {
    test('should define accent color palette with purple/pink gradient', () => {
      const accentColors = [
        '--color-accent-400',
        '--color-accent-500',
        '--color-accent-600'
      ];

      accentColors.forEach(color => {
        expect(cssContent).toContain(color);
        const regex = new RegExp(`${color}:\\s*hsl\\(`);
        expect(cssContent).toMatch(regex);
      });
    });

    test('should have accent colors with hue 280', () => {
      expect(cssContent).toContain('--color-accent-500: hsl(280, 80%, 55%)');
      const accentRegex = /--color-accent-\d+:\s*hsl\(280,/g;
      const matches = cssContent.match(accentRegex);
      expect(matches).toBeTruthy();
      expect(matches.length).toBe(3);
    });
  });

  describe('Neutral Colors', () => {
    test('should define neutral color palette with blue-tinted grays', () => {
      const neutralColors = [
        '--color-neutral-50',
        '--color-neutral-100',
        '--color-neutral-200',
        '--color-neutral-300',
        '--color-neutral-400',
        '--color-neutral-500',
        '--color-neutral-600',
        '--color-neutral-700',
        '--color-neutral-800',
        '--color-neutral-900'
      ];

      neutralColors.forEach(color => {
        expect(cssContent).toContain(color);
        const regex = new RegExp(`${color}:\\s*hsl\\(`);
        expect(cssContent).toMatch(regex);
      });
    });

    test('should have neutral colors with hue 210 and saturation 20%', () => {
      expect(cssContent).toContain('--color-neutral-500: hsl(210, 20%, 40%)');
      const neutralRegex = /--color-neutral-\d+:\s*hsl\(210,\s*20%,/g;
      const matches = cssContent.match(neutralRegex);
      expect(matches).toBeTruthy();
      expect(matches.length).toBe(10);
    });
  });

  describe('Semantic Colors', () => {
    test('should define success colors', () => {
      expect(cssContent).toContain('--color-success: hsl(145, 65%, 32%)');
      expect(cssContent).toContain('--color-success-dark: hsl(145, 65%, 28%)');
    });

    test('should define danger colors', () => {
      expect(cssContent).toContain('--color-danger: hsl(0, 70%, 42%)');
      expect(cssContent).toContain('--color-danger-dark: hsl(0, 70%, 38%)');
    });

    test('should define warning color', () => {
      expect(cssContent).toContain('--color-warning: hsl(40, 95%, 42%)');
    });
  });

  describe('Gradient Variables', () => {
    test('should define primary gradient', () => {
      expect(cssContent).toContain('--gradient-primary');
      expect(cssContent).toMatch(/--gradient-primary:.*linear-gradient\(135deg/);
    });

    test('should define accent gradient', () => {
      expect(cssContent).toContain('--gradient-accent');
      expect(cssContent).toMatch(/--gradient-accent:.*linear-gradient\(135deg/);
    });

    test('should define success gradient', () => {
      expect(cssContent).toContain('--gradient-success');
      expect(cssContent).toMatch(/--gradient-success:.*linear-gradient\(135deg/);
    });

    test('should define danger gradient', () => {
      expect(cssContent).toContain('--gradient-danger');
      expect(cssContent).toMatch(/--gradient-danger:.*linear-gradient\(135deg/);
    });
  });

  describe('Legacy Color Mappings', () => {
    test('should maintain backward compatibility with legacy color names', () => {
      const legacyColors = [
        '--color-primary:',
        '--color-primary-dark:',
        '--color-neutral:',
        '--color-neutral-dark:',
        '--color-text-primary:',
        '--color-text-secondary:',
        '--color-background:',
        '--color-white:',
        '--color-border:',
        '--color-disabled:'
      ];

      legacyColors.forEach(color => {
        expect(cssContent).toContain(color);
      });
    });

    test('should map legacy primary to primary-600', () => {
      expect(cssContent).toContain('--color-primary: var(--color-primary-600)');
    });

    test('should map legacy primary-dark to primary-700', () => {
      expect(cssContent).toContain('--color-primary-dark: var(--color-primary-700)');
    });

    test('should map legacy text colors to neutral palette', () => {
      expect(cssContent).toContain('--color-text-primary: var(--color-neutral-900)');
      expect(cssContent).toContain('--color-text-secondary: var(--color-neutral-500)');
    });
  });
});
