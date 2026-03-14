/**
 * Test Suite: Button Hover and Active States (Task 3.2)
 * 
 * This test verifies that all primary action buttons have enhanced hover and active states:
 * - Hover: translateY(-2px) transform + colored shadow (shadow-primary/success/danger)
 * - Active: translateY(0) transform + reduced shadow (shadow-sm)
 * 
 * Primary action buttons include:
 * - Timer controls: .btn-start (success shadow), .btn-stop (danger shadow), .btn-reset (primary shadow)
 * - Add task button: .btn-add-task (primary shadow)
 * - Add link button: .btn-add-link (primary shadow)
 * 
 * Requirements: 6.3, 6.4
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Task 3.2: Button Hover and Active States', () => {
  let cssContent;

  beforeAll(() => {
    cssContent = readFileSync(join(process.cwd(), 'css/styles.css'), 'utf-8');
  });

  describe('Hover States - Transform and Colored Shadows', () => {
    test('.btn-start should have translateY(-2px) and shadow-success on hover', () => {
      const hoverMatch = cssContent.match(/\.btn-start:hover\s*{([^}]*)}/);
      expect(hoverMatch).not.toBeNull();
      
      const hoverStyles = hoverMatch[1];
      expect(hoverStyles).toMatch(/transform:\s*translateY\(-2px\)/);
      expect(hoverStyles).toMatch(/box-shadow:\s*var\(--shadow-success\)/);
    });

    test('.btn-stop should have translateY(-2px) and shadow-danger on hover', () => {
      const hoverMatch = cssContent.match(/\.btn-stop:hover\s*{([^}]*)}/);
      expect(hoverMatch).not.toBeNull();
      
      const hoverStyles = hoverMatch[1];
      expect(hoverStyles).toMatch(/transform:\s*translateY\(-2px\)/);
      expect(hoverStyles).toMatch(/box-shadow:\s*var\(--shadow-danger\)/);
    });

    test('.btn-reset should have translateY(-2px) and shadow-primary on hover', () => {
      const hoverMatch = cssContent.match(/\.btn-reset:hover\s*{([^}]*)}/);
      expect(hoverMatch).not.toBeNull();
      
      const hoverStyles = hoverMatch[1];
      expect(hoverStyles).toMatch(/transform:\s*translateY\(-2px\)/);
      expect(hoverStyles).toMatch(/box-shadow:\s*var\(--shadow-primary\)/);
    });

    test('.btn-add-task should have translateY(-2px) and shadow-primary on hover', () => {
      const hoverMatch = cssContent.match(/\.btn-add-task:hover\s*{([^}]*)}/);
      expect(hoverMatch).not.toBeNull();
      
      const hoverStyles = hoverMatch[1];
      expect(hoverStyles).toMatch(/transform:\s*translateY\(-2px\)/);
      expect(hoverStyles).toMatch(/box-shadow:\s*var\(--shadow-primary\)/);
    });

    test('.btn-add-link should have translateY(-2px) and shadow-primary on hover', () => {
      const hoverMatch = cssContent.match(/\.btn-add-link:hover\s*{([^}]*)}/);
      expect(hoverMatch).not.toBeNull();
      
      const hoverStyles = hoverMatch[1];
      expect(hoverStyles).toMatch(/transform:\s*translateY\(-2px\)/);
      expect(hoverStyles).toMatch(/box-shadow:\s*var\(--shadow-primary\)/);
    });
  });

  describe('Active States - Press Effect with Reduced Shadow', () => {
    test('.btn-start should have translateY(0) and shadow-sm on active', () => {
      const activeMatch = cssContent.match(/\.btn-start:active\s*{([^}]*)}/);
      expect(activeMatch).not.toBeNull();
      
      const activeStyles = activeMatch[1];
      expect(activeStyles).toMatch(/transform:\s*translateY\(0\)/);
      expect(activeStyles).toMatch(/box-shadow:\s*var\(--shadow-sm\)/);
    });

    test('.btn-stop should have translateY(0) and shadow-sm on active', () => {
      const activeMatch = cssContent.match(/\.btn-stop:active\s*{([^}]*)}/);
      expect(activeMatch).not.toBeNull();
      
      const activeStyles = activeMatch[1];
      expect(activeStyles).toMatch(/transform:\s*translateY\(0\)/);
      expect(activeStyles).toMatch(/box-shadow:\s*var\(--shadow-sm\)/);
    });

    test('.btn-reset should have translateY(0) and shadow-sm on active', () => {
      const activeMatch = cssContent.match(/\.btn-reset:active\s*{([^}]*)}/);
      expect(activeMatch).not.toBeNull();
      
      const activeStyles = activeMatch[1];
      expect(activeStyles).toMatch(/transform:\s*translateY\(0\)/);
      expect(activeStyles).toMatch(/box-shadow:\s*var\(--shadow-sm\)/);
    });

    test('.btn-add-task should have translateY(0) and shadow-sm on active', () => {
      const activeMatch = cssContent.match(/\.btn-add-task:active\s*{([^}]*)}/);
      expect(activeMatch).not.toBeNull();
      
      const activeStyles = activeMatch[1];
      expect(activeStyles).toMatch(/transform:\s*translateY\(0\)/);
      expect(activeStyles).toMatch(/box-shadow:\s*var\(--shadow-sm\)/);
    });

    test('.btn-add-link should have translateY(0) and shadow-sm on active', () => {
      const activeMatch = cssContent.match(/\.btn-add-link:active\s*{([^}]*)}/);
      expect(activeMatch).not.toBeNull();
      
      const activeStyles = activeMatch[1];
      expect(activeStyles).toMatch(/transform:\s*translateY\(0\)/);
      expect(activeStyles).toMatch(/box-shadow:\s*var\(--shadow-sm\)/);
    });
  });

  describe('Shadow Variable Definitions', () => {
    test('should have shadow-primary defined with colored shadow', () => {
      expect(cssContent).toMatch(/--shadow-primary:\s*0\s+8px\s+16px\s+rgba\(52,\s*152,\s*219,\s*0\.3\)/);
    });

    test('should have shadow-success defined with colored shadow', () => {
      expect(cssContent).toMatch(/--shadow-success:\s*0\s+8px\s+16px\s+rgba\(39,\s*174,\s*96,\s*0\.3\)/);
    });

    test('should have shadow-danger defined with colored shadow', () => {
      expect(cssContent).toMatch(/--shadow-danger:\s*0\s+8px\s+16px\s+rgba\(231,\s*76,\s*60,\s*0\.3\)/);
    });

    test('should have shadow-sm defined for reduced shadow', () => {
      expect(cssContent).toMatch(/--shadow-sm:\s*0\s+1px\s+3px\s+rgba\(0,\s*0,\s*0,\s*0\.08\)/);
    });
  });

  describe('Interaction Flow Verification', () => {
    test('buttons should have base shadow-md, hover colored shadow, and active shadow-sm', () => {
      // Verify .btn-start has the complete interaction flow
      expect(cssContent).toMatch(/\.btn-start\s*{[^}]*box-shadow:\s*var\(--shadow-md\)/);
      expect(cssContent).toMatch(/\.btn-start:hover\s*{[^}]*box-shadow:\s*var\(--shadow-success\)/);
      expect(cssContent).toMatch(/\.btn-start:active\s*{[^}]*box-shadow:\s*var\(--shadow-sm\)/);

      // Verify .btn-add-task has the complete interaction flow
      expect(cssContent).toMatch(/\.btn-add-task\s*{[^}]*box-shadow:\s*var\(--shadow-md\)/);
      expect(cssContent).toMatch(/\.btn-add-task:hover\s*{[^}]*box-shadow:\s*var\(--shadow-primary\)/);
      expect(cssContent).toMatch(/\.btn-add-task:active\s*{[^}]*box-shadow:\s*var\(--shadow-sm\)/);
    });
  });
});
