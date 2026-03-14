/**
 * Skeleton Loading States Test
 * Feature: modern-design-refresh
 * Task: 10. Implement loading states and skeleton screens
 * 
 * Tests verify:
 * - Shimmer keyframe animation exists and is properly defined
 * - Skeleton screen styles apply shimmer animation with correct duration
 * - Layout stability is maintained during loading (explicit dimensions)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Task 10: Skeleton Loading States', () => {
  let cssContent;

  beforeAll(() => {
    const cssPath = path.join(__dirname, '../css/styles.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('10.1 Shimmer keyframe animation', () => {
    test('should define shimmer keyframe animation', () => {
      expect(cssContent).toMatch(/@keyframes\s+shimmer/);
    });

    test('should move shimmer effect using transform translateX', () => {
      // Match the complete shimmer animation including both keyframes
      const shimmerMatch = cssContent.match(/@keyframes\s+shimmer\s*{[\s\S]*?}\s*}/);
      expect(shimmerMatch).toBeTruthy();
      
      const shimmerContent = shimmerMatch[0];
      // Implementation uses GPU-accelerated transform instead of background-position
      expect(shimmerContent).toMatch(/transform:\s*translateX\(-100%\)/);
      expect(shimmerContent).toMatch(/transform:\s*translateX\(100%\)/);
    });

    test('should use linear-gradient on pseudo-element for shimmer effect', () => {
      // Implementation uses ::after pseudo-element with linear-gradient
      const skeletonAfterMatch = cssContent.match(/\.skeleton::after\s*{[^}]+}/s);
      expect(skeletonAfterMatch).toBeTruthy();
      
      const skeletonAfterContent = skeletonAfterMatch[0];
      expect(skeletonAfterContent).toMatch(/linear-gradient/);
      expect(skeletonAfterContent).toMatch(/--color-neutral-200/);
    });
  });

  describe('10.2 Skeleton screen styles', () => {
    test('should apply shimmer animation to skeleton pseudo-element', () => {
      // Implementation uses ::after pseudo-element for GPU-accelerated animation
      const skeletonAfterMatch = cssContent.match(/\.skeleton::after\s*{[^}]+}/s);
      expect(skeletonAfterMatch).toBeTruthy();
      
      const skeletonAfterContent = skeletonAfterMatch[0];
      expect(skeletonAfterContent).toMatch(/animation:\s*shimmer/);
    });

    test('should use 400ms duration with infinite iteration and linear timing', () => {
      // Implementation uses 400ms to meet animation duration requirements (150-400ms)
      const skeletonAfterMatch = cssContent.match(/\.skeleton::after\s*{[^}]+}/s);
      expect(skeletonAfterMatch).toBeTruthy();
      
      const skeletonAfterContent = skeletonAfterMatch[0];
      expect(skeletonAfterContent).toMatch(/animation:\s*shimmer\s+400ms\s+infinite\s+linear/);
    });

    test('should ensure skeleton elements match component dimensions', () => {
      // Check for skeleton variants with explicit dimensions
      expect(cssContent).toMatch(/\.skeleton-text\s*{[^}]*height:/);
      expect(cssContent).toMatch(/\.skeleton-button\s*{[^}]*height:\s*44px/);
      expect(cssContent).toMatch(/\.skeleton-input\s*{[^}]*height:\s*44px/);
      expect(cssContent).toMatch(/\.skeleton-card\s*{[^}]*height:/);
      
      // Check for component-specific skeleton styles
      expect(cssContent).toMatch(/\.skeleton-greeting\s*{[^}]*min-height:/);
      expect(cssContent).toMatch(/\.skeleton-timer\s*{[^}]*min-height:/);
      expect(cssContent).toMatch(/\.skeleton-task-list\s*{[^}]*min-height:/);
      expect(cssContent).toMatch(/\.skeleton-quick-links\s*{[^}]*min-height:/);
    });
  });

  describe('10.3 Layout stability during loading', () => {
    test('should set explicit dimensions on skeleton elements', () => {
      // Verify skeleton base class has explicit sizing
      const skeletonMatch = cssContent.match(/\.skeleton\s*{[^}]+}/s);
      expect(skeletonMatch).toBeTruthy();
      
      // Verify skeleton variants have explicit heights
      expect(cssContent).toMatch(/\.skeleton-text\s*{[^}]*height:\s*1em/);
      expect(cssContent).toMatch(/\.skeleton-button\s*{[^}]*height:\s*44px[^}]*width:\s*100px/);
      expect(cssContent).toMatch(/\.skeleton-input\s*{[^}]*height:\s*44px[^}]*width:\s*100%/);
    });

    test('should prevent content shift when real content loads', () => {
      // Check for loading state with min-height
      expect(cssContent).toMatch(/\.component-section\.loading\s*{[^}]*min-height:/);
      
      // Check that skeleton component sections have min-height
      const skeletonGreeting = cssContent.match(/\.skeleton-greeting\s*{[^}]+}/s);
      expect(skeletonGreeting).toBeTruthy();
      expect(skeletonGreeting[0]).toMatch(/min-height:\s*200px/);
      
      const skeletonTimer = cssContent.match(/\.skeleton-timer\s*{[^}]+}/s);
      expect(skeletonTimer).toBeTruthy();
      expect(skeletonTimer[0]).toMatch(/min-height:\s*300px/);
      
      const skeletonTaskList = cssContent.match(/\.skeleton-task-list\s*{[^}]+}/s);
      expect(skeletonTaskList).toBeTruthy();
      expect(skeletonTaskList[0]).toMatch(/min-height:\s*250px/);
      
      const skeletonQuickLinks = cssContent.match(/\.skeleton-quick-links\s*{[^}]+}/s);
      expect(skeletonQuickLinks).toBeTruthy();
      expect(skeletonQuickLinks[0]).toMatch(/min-height:\s*200px/);
    });

    test('should use spacing system for consistent gaps', () => {
      // Verify skeleton components use spacing variables
      expect(cssContent).toMatch(/\.skeleton-greeting\s*{[^}]*gap:\s*var\(--spacing-4\)/);
      expect(cssContent).toMatch(/\.skeleton-timer\s*{[^}]*gap:\s*var\(--spacing-4\)/);
      expect(cssContent).toMatch(/\.skeleton-task-list\s*{[^}]*gap:\s*var\(--spacing-3\)/);
      expect(cssContent).toMatch(/\.skeleton-quick-links\s*{[^}]*gap:\s*var\(--spacing-4\)/);
    });
  });

  describe('Integration: Complete skeleton loading system', () => {
    test('should have all required skeleton classes defined', () => {
      const requiredClasses = [
        '.skeleton',
        '.skeleton-text',
        '.skeleton-button',
        '.skeleton-input',
        '.skeleton-card',
        '.skeleton-greeting',
        '.skeleton-timer',
        '.skeleton-task-list',
        '.skeleton-quick-links'
      ];

      requiredClasses.forEach(className => {
        const regex = new RegExp(`\\${className}\\s*{`);
        expect(cssContent).toMatch(regex);
      });
    });

    test('should use design system variables consistently', () => {
      const skeletonSection = cssContent.substring(
        cssContent.indexOf('@keyframes shimmer'),
        cssContent.indexOf('/* Pulse animation')
      );

      // Check for consistent use of design system variables
      expect(skeletonSection).toMatch(/--color-neutral-100/);
      expect(skeletonSection).toMatch(/--color-neutral-200/);
      expect(skeletonSection).toMatch(/--radius-sm/);
      expect(skeletonSection).toMatch(/--spacing-/);
    });
  });
});
