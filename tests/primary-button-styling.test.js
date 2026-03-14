/**
 * Test Suite: Primary Action Button Styling (Task 3.1)
 * 
 * This test verifies that all primary action buttons have been styled with:
 * - gradient-primary background
 * - white text color
 * - consistent padding using spacing variables
 * - no default border
 * - border-radius using CSS variables
 * - font-weight-semibold
 * - box-shadow-md
 * - smooth transitions
 * 
 * Primary action buttons include:
 * - Timer controls: .btn-start, .btn-stop, .btn-reset
 * - Add task button: .btn-add-task
 * - Add link button: .btn-add-link
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Task 3.1: Primary Action Button Styling', () => {
  let cssContent;

  beforeAll(() => {
    cssContent = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
  });

  describe('Timer Control Buttons (.btn-start, .btn-stop, .btn-reset)', () => {
    test('should have gradient backgrounds', () => {
      // btn-start should use gradient-success
      expect(cssContent).toMatch(/\.btn-start\s*{[^}]*background:\s*var\(--gradient-success\)/);
      
      // btn-stop should use gradient-danger
      expect(cssContent).toMatch(/\.btn-stop\s*{[^}]*background:\s*var\(--gradient-danger\)/);
      
      // btn-reset should use gradient-primary
      expect(cssContent).toMatch(/\.btn-reset\s*{[^}]*background:\s*var\(--gradient-primary\)/);
    });

    test('should have white text color', () => {
      expect(cssContent).toMatch(/\.btn-start,\s*\.btn-stop,\s*\.btn-reset\s*{[^}]*color:\s*white/);
    });

    test('should have consistent padding using spacing variables', () => {
      expect(cssContent).toMatch(/\.btn-start,\s*\.btn-stop,\s*\.btn-reset\s*{[^}]*padding:\s*var\(--spacing-3\)\s+var\(--spacing-6\)/);
    });

    test('should have no border', () => {
      expect(cssContent).toMatch(/\.btn-start,\s*\.btn-stop,\s*\.btn-reset\s*{[^}]*border:\s*none/);
    });

    test('should use border-radius CSS variable', () => {
      expect(cssContent).toMatch(/\.btn-start,\s*\.btn-stop,\s*\.btn-reset\s*{[^}]*border-radius:\s*var\(--radius-md\)/);
    });

    test('should have font-weight-semibold', () => {
      expect(cssContent).toMatch(/\.btn-start,\s*\.btn-stop,\s*\.btn-reset\s*{[^}]*font-weight:\s*var\(--font-weight-semibold\)/);
    });

    test('should have box-shadow-md', () => {
      expect(cssContent).toMatch(/\.btn-start\s*{[^}]*box-shadow:\s*var\(--shadow-md\)/);
      expect(cssContent).toMatch(/\.btn-stop\s*{[^}]*box-shadow:\s*var\(--shadow-md\)/);
      expect(cssContent).toMatch(/\.btn-reset\s*{[^}]*box-shadow:\s*var\(--shadow-md\)/);
    });

    test('should have smooth transitions with GPU-accelerated properties', () => {
      // Per Requirement 12.1, only GPU-accelerated properties (transform, opacity) should be animated
      expect(cssContent).toMatch(/\.btn-start,\s*\.btn-stop,\s*\.btn-reset\s*{[^}]*transition:\s*transform\s+0\.2s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\),\s*opacity\s+0\.2s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/);
    });
  });

  describe('Add Task Button (.btn-add-task)', () => {
    test('should have gradient-primary background', () => {
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*background:\s*var\(--gradient-primary\)/);
    });

    test('should have white text color', () => {
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*color:\s*white/);
    });

    test('should have consistent padding using spacing variables', () => {
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*padding:\s*var\(--spacing-3\)\s+var\(--spacing-6\)/);
    });

    test('should have no border', () => {
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*border:\s*none/);
    });

    test('should use border-radius CSS variable', () => {
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*border-radius:\s*var\(--radius-md\)/);
    });

    test('should have font-weight-semibold', () => {
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*font-weight:\s*var\(--font-weight-semibold\)/);
    });

    test('should have box-shadow-md', () => {
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*box-shadow:\s*var\(--shadow-md\)/);
    });

    test('should have smooth transitions with GPU-accelerated properties', () => {
      // Per Requirement 12.1, only GPU-accelerated properties (transform, opacity) should be animated
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*transition:\s*transform\s+0\.2s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\),\s*opacity\s+0\.2s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/);
    });
  });

  describe('Add Link Button (.btn-add-link)', () => {
    test('should have gradient-primary background', () => {
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*background:\s*var\(--gradient-primary\)/);
    });

    test('should have white text color', () => {
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*color:\s*white/);
    });

    test('should have consistent padding using spacing variables', () => {
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*padding:\s*var\(--spacing-3\)\s+var\(--spacing-6\)/);
    });

    test('should have no border', () => {
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*border:\s*none/);
    });

    test('should use border-radius CSS variable', () => {
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*border-radius:\s*var\(--radius-md\)/);
    });

    test('should have font-weight-semibold', () => {
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*font-weight:\s*var\(--font-weight-semibold\)/);
    });

    test('should have box-shadow-md', () => {
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*box-shadow:\s*var\(--shadow-md\)/);
    });

    test('should have smooth transitions with GPU-accelerated properties', () => {
      // Per Requirement 12.1, only GPU-accelerated properties (transform, opacity) should be animated
      expect(cssContent).toMatch(/\.btn-add-link\s*{[^}]*transition:\s*transform\s+0\.2s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\),\s*opacity\s+0\.2s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/);
    });
  });

  describe('Hover States', () => {
    test('timer buttons should have translateY(-2px) on hover', () => {
      expect(cssContent).toMatch(/\.btn-start:hover\s*{[^}]*transform:\s*translateY\(-2px\)/);
      expect(cssContent).toMatch(/\.btn-stop:hover\s*{[^}]*transform:\s*translateY\(-2px\)/);
      expect(cssContent).toMatch(/\.btn-reset:hover\s*{[^}]*transform:\s*translateY\(-2px\)/);
    });

    test('add task button should have translateY(-2px) on hover', () => {
      expect(cssContent).toMatch(/\.btn-add-task:hover\s*{[^}]*transform:\s*translateY\(-2px\)/);
    });

    test('add link button should have translateY(-2px) on hover', () => {
      expect(cssContent).toMatch(/\.btn-add-link:hover\s*{[^}]*transform:\s*translateY\(-2px\)/);
    });
  });

  describe('Active States', () => {
    test('timer buttons should have translateY(0) on active', () => {
      expect(cssContent).toMatch(/\.btn-start:active\s*{[^}]*transform:\s*translateY\(0\)/);
      expect(cssContent).toMatch(/\.btn-stop:active\s*{[^}]*transform:\s*translateY\(0\)/);
      expect(cssContent).toMatch(/\.btn-reset:active\s*{[^}]*transform:\s*translateY\(0\)/);
    });

    test('add task button should have translateY(0) on active', () => {
      expect(cssContent).toMatch(/\.btn-add-task:active\s*{[^}]*transform:\s*translateY\(0\)/);
    });

    test('add link button should have translateY(0) on active', () => {
      expect(cssContent).toMatch(/\.btn-add-link:active\s*{[^}]*transform:\s*translateY\(0\)/);
    });
  });
});
