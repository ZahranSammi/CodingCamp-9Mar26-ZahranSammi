/**
 * Mobile Responsive Styles Test
 * 
 * Tests for Task 12.1: Implement mobile styles (320px - 767px)
 * 
 * Requirements validated:
 * - 11.1: Single column layout
 * - 11.2: Reduced spacing using smaller spacing variables
 * - 11.3: Touch targets are minimum 44x44px
 * - 11.5: Simplified animations for performance
 * - Glassmorphism effects are maintained
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Mobile Responsive Styles (320px - 767px)', () => {
  let cssContent;

  beforeEach(() => {
    // Load CSS content
    cssContent = readFileSync(join(__dirname, '../css/styles.css'), 'utf-8');
  });

  describe('Requirement 11.1: Single Column Layout', () => {
    test('mobile media query (max-width: 767px) should exist', () => {
      expect(cssContent).toContain('@media (max-width: 767px)');
    });

    test('dashboard-main should use single column layout on mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.dashboard-main');
      expect(mobileSection).toContain('grid-template-columns: 1fr');
    });

    test('mobile styles should include single column layout comment', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('Single column layout');
      expect(mobileSection).toContain('Requirement 11.1');
    });
  });

  describe('Requirement 11.2: Reduced Spacing', () => {
    test('body padding should be reduced on mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('body');
      expect(mobileSection).toMatch(/padding:\s*var\(--spacing-2\)/);
    });

    test('component sections should have reduced padding on mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.component-section');
      expect(mobileSection).toMatch(/padding:\s*var\(--spacing-4\)/);
    });

    test('dashboard-main gap should be reduced on mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('gap: var(--spacing-4)');
    });

    test('task items should have reduced padding on mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.task-item');
      expect(mobileSection).toMatch(/padding:\s*var\(--spacing-3\)/);
    });

    test('mobile styles should include reduced spacing comment', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('Reduce spacing');
      expect(mobileSection).toContain('Requirement 11.2');
    });
  });

  describe('Requirement 11.3: Touch Target Minimum Size (44x44px)', () => {
    test('timer control buttons should have minimum height of 44px', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.btn-start');
      expect(mobileSection).toContain('.btn-stop');
      expect(mobileSection).toContain('.btn-reset');
      expect(mobileSection).toContain('min-height: 44px');
    });

    test('input fields should have minimum height of 44px', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.name-input');
      expect(mobileSection).toContain('.task-input');
      expect(mobileSection).toContain('.duration-input');
      expect(mobileSection).toMatch(/min-height:\s*44px.*touch target/i);
    });

    test('action buttons should have minimum height of 44px', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.btn-add-task');
      expect(mobileSection).toContain('.btn-add-link');
      expect(mobileSection).toContain('.btn-edit-name');
    });

    test('task action buttons should have minimum height of 44px', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.btn-edit-task');
      expect(mobileSection).toContain('.btn-delete-task');
      expect(mobileSection).toContain('.btn-save-task');
      expect(mobileSection).toContain('.btn-cancel-edit');
    });

    test('checkboxes should be larger for touch interaction (24x24px)', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.task-checkbox');
      expect(mobileSection).toContain('width: 24px');
      expect(mobileSection).toContain('height: 24px');
    });

    test('delete link buttons should be larger for touch (32x32px)', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.btn-delete-link');
      expect(mobileSection).toContain('width: 32px');
      expect(mobileSection).toContain('height: 32px');
    });

    test('mobile styles should include touch target comment', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('touch target');
      expect(mobileSection).toContain('Requirement 11.3');
    });
  });

  describe('Requirement 11.5: Simplified Animations for Performance', () => {
    test('component entrance animations should be faster (300ms)', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.component-section');
      expect(mobileSection).toContain('animation-duration: 300ms');
    });

    test('component hover transform should be reduced', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.component-section:hover');
      expect(mobileSection).toContain('translateY(-2px)');
    });

    test('timer animations should be faster (300ms)', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.timer-display.running');
      expect(mobileSection).toContain('.timer-display.completed');
      expect(mobileSection).toMatch(/animation-duration:\s*300ms/);
    });

    test('task hover animation should be reduced', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.task-item:hover');
      expect(mobileSection).toContain('translateX(2px)');
    });

    test('link hover transform should be reduced', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.link-button:hover');
      expect(mobileSection).toContain('translateY(-2px)');
      expect(mobileSection).toContain('scale(1.01)');
    });

    test('mobile styles should include simplified animations comment', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('Simplify animations');
      expect(mobileSection).toContain('Requirement 11.5');
    });
  });

  describe('Glassmorphism Effects Maintained', () => {
    test('mobile styles should include glassmorphism maintenance comment', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('Maintain glassmorphism');
      expect(mobileSection).toContain('Requirement 11.1');
    });

    test('glassmorphism should not be disabled in mobile styles', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      // Ensure backdrop-filter is not set to none
      expect(mobileSection).not.toContain('backdrop-filter: none');
      expect(mobileSection).not.toContain('background: rgba(255, 255, 255, 1)');
    });

    test('base glassmorphism styles should exist', () => {
      expect(cssContent).toContain('backdrop-filter: blur(20px)');
      expect(cssContent).toContain('background: rgba(255, 255, 255, 0.7)');
    });
  });

  describe('Layout Adjustments', () => {
    test('duration config should stack vertically on mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.duration-config');
      expect(mobileSection).toContain('flex-direction: column');
    });

    test('task input container should stack vertically on mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.task-input-container > div');
      expect(mobileSection).toContain('flex-direction: column');
    });

    test('links grid should adjust for mobile', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      expect(mobileSection).toContain('.links-grid');
      expect(mobileSection).toContain('minmax(140px, 1fr)');
    });

    test('links grid should be single column on very small screens', () => {
      const smallMobileSection = extractMediaQuery(cssContent, 'max-width: 480px');
      expect(smallMobileSection).toContain('.links-grid');
      expect(smallMobileSection).toContain('grid-template-columns: 1fr');
    });
  });

  describe('Extra Small Mobile (320px - 480px)', () => {
    test('extra small mobile media query should exist', () => {
      expect(cssContent).toContain('@media (max-width: 480px)');
    });

    test('should have further reduced spacing for very small screens', () => {
      const smallMobileSection = extractMediaQuery(cssContent, 'max-width: 480px');
      expect(smallMobileSection).toContain('padding: var(--spacing-1)');
    });

    test('should have typography adjustments for small screens', () => {
      const smallMobileSection = extractMediaQuery(cssContent, 'max-width: 480px');
      expect(smallMobileSection).toContain('.greeting-message');
      expect(smallMobileSection).toContain('.time-display');
      expect(smallMobileSection).toContain('.timer-display');
    });
  });

  describe('CSS Structure and Documentation', () => {
    test('mobile section should have clear header comment', () => {
      expect(cssContent).toContain('/* Responsive Design - Mobile (320px - 767px) */');
      expect(cssContent).toContain('/* Requirements: 11.1, 11.2, 11.3, 11.5 */');
    });

    test('mobile section should have organized subsections with comments', () => {
      const mobileSection = extractMediaQuery(cssContent, 'max-width: 767px');
      
      // Check for requirement comments
      expect(mobileSection).toContain('Requirement 11.1');
      expect(mobileSection).toContain('Requirement 11.2');
      expect(mobileSection).toContain('Requirement 11.3');
      expect(mobileSection).toContain('Requirement 11.5');
    });

    test('extra small mobile section should have header comment', () => {
      expect(cssContent).toContain('/* Extra small mobile devices (320px - 480px) */');
    });
  });
});

// Helper function to extract media query content
function extractMediaQuery(css, query) {
  // Find the start of the media query
  const queryPattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startRegex = new RegExp(`@media\\s*\\([^)]*${queryPattern}[^)]*\\)\\s*{`, 'g');
  const match = startRegex.exec(css);
  
  if (!match) {
    return '';
  }
  
  const startIndex = match.index + match[0].length;
  let braceCount = 1;
  let endIndex = startIndex;
  
  // Find the matching closing brace
  for (let i = startIndex; i < css.length && braceCount > 0; i++) {
    if (css[i] === '{') {
      braceCount++;
    } else if (css[i] === '}') {
      braceCount--;
    }
    endIndex = i;
  }
  
  return css.substring(startIndex, endIndex);
}
