/**
 * Tablet Responsive Styles Test
 * 
 * Tests for Task 12.2: Implement tablet styles (768px - 1023px)
 * 
 * Requirements validated:
 * - 11.4: Two column layout where appropriate
 * - 11.4: Use medium spacing values
 * - 11.4: Maintain full animations
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Tablet Responsive Styles (768px - 1023px)', () => {
  let cssContent;

  beforeEach(() => {
    // Load CSS content
    cssContent = readFileSync(join(__dirname, '../css/styles.css'), 'utf-8');
  });

  describe('Requirement 11.4: Two Column Layout', () => {
    test('tablet media query (min-width: 768px and max-width: 1023px) should exist', () => {
      expect(cssContent).toContain('@media (min-width: 768px) and (max-width: 1023px)');
    });

    test('dashboard-main should use two column layout on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.dashboard-main');
      expect(tabletSection).toContain('grid-template-columns: repeat(2, 1fr)');
    });

    test('tablet styles should include two column layout comment', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('Two column layout');
      expect(tabletSection).toContain('Requirement 11.4');
    });
  });

  describe('Requirement 11.4: Medium Spacing Values', () => {
    test('body padding should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('body');
      expect(tabletSection).toMatch(/padding:\s*var\(--spacing-4\)/);
    });

    test('dashboard padding should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.dashboard');
      expect(tabletSection).toMatch(/padding:\s*var\(--spacing-5\)/);
    });

    test('component sections should have medium padding on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.component-section');
      expect(tabletSection).toMatch(/padding:\s*var\(--spacing-6\)/);
    });

    test('dashboard-main gap should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.dashboard-main');
      expect(tabletSection).toContain('gap: var(--spacing-6)');
    });

    test('dashboard-header margin should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.dashboard-header');
      expect(tabletSection).toContain('margin-bottom: var(--spacing-8)');
    });

    test('timer display margin should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.timer-display');
      expect(tabletSection).toContain('margin-bottom: var(--spacing-6)');
    });

    test('timer controls should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.timer-controls');
      expect(tabletSection).toContain('margin-bottom: var(--spacing-6)');
      expect(tabletSection).toContain('gap: var(--spacing-3)');
    });

    test('duration config should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.duration-config');
      expect(tabletSection).toContain('padding-top: var(--spacing-5)');
      expect(tabletSection).toContain('gap: var(--spacing-3)');
    });

    test('task input container should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.task-input-container');
      expect(tabletSection).toContain('gap: var(--spacing-3)');
    });

    test('task items should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.task-item');
      expect(tabletSection).toContain('padding: var(--spacing-4)');
      expect(tabletSection).toContain('gap: var(--spacing-3)');
    });

    test('link input container should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.link-input-container');
      expect(tabletSection).toContain('gap: var(--spacing-3)');
    });

    test('links grid should use medium spacing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.links-grid');
      expect(tabletSection).toContain('gap: var(--spacing-4)');
    });

    test('link buttons should use medium padding on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.link-button');
      expect(tabletSection).toContain('padding: var(--spacing-4)');
    });

    test('tablet styles should include medium spacing comment', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('medium spacing');
      expect(tabletSection).toContain('Requirement 11.4');
    });
  });

  describe('Requirement 11.4: Maintain Full Animations', () => {
    test('tablet styles should include full animations comment', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('Maintain full animations');
      expect(tabletSection).toContain('Requirement 11.4');
    });

    test('tablet styles should not reduce animation durations', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      // Should not contain reduced animation durations like mobile does
      expect(tabletSection).not.toContain('animation-duration: 300ms');
    });

    test('tablet styles should not reduce transform values', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      // Should not contain reduced transforms like mobile does
      expect(tabletSection).not.toContain('translateY(-2px)');
      expect(tabletSection).not.toContain('scale(1.01)');
    });

    test('base animation styles should remain active on tablet', () => {
      // Verify base animations exist and are not overridden
      expect(cssContent).toContain('@keyframes fadeInUp');
      expect(cssContent).toContain('@keyframes pulse');
      expect(cssContent).toContain('@keyframes celebrate');
      expect(cssContent).toContain('@keyframes shimmer');
    });
  });

  describe('Typography Adjustments', () => {
    test('dashboard header should have appropriate font size on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.dashboard-header h1');
      expect(tabletSection).toContain('font-size: var(--font-size-xl)');
    });

    test('greeting message should have appropriate font size on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.greeting-message');
      expect(tabletSection).toContain('font-size: var(--font-size-lg)');
    });

    test('time display should have appropriate font size on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.time-display');
      expect(tabletSection).toContain('font-size: var(--font-size-xxl)');
    });

    test('date display should have appropriate font size on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.date-display');
      expect(tabletSection).toContain('font-size: var(--font-size-md)');
    });

    test('timer display should have appropriate font size on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.timer-display');
      expect(tabletSection).toContain('font-size: var(--font-size-xxxl)');
    });
  });

  describe('Links Grid Layout', () => {
    test('links grid should have appropriate column sizing on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.links-grid');
      expect(tabletSection).toContain('minmax(160px, 1fr)');
    });

    test('link button anchor should have medium padding on tablet', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      expect(tabletSection).toContain('.link-button a');
      expect(tabletSection).toContain('padding: var(--spacing-4) var(--spacing-3)');
    });
  });

  describe('CSS Structure and Documentation', () => {
    test('tablet section should have clear header comment', () => {
      expect(cssContent).toContain('/* Responsive Design - Tablet (768px - 1023px) */');
      expect(cssContent).toContain('/* Requirements: 11.4 */');
    });

    test('tablet section should have organized subsections with comments', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      
      // Check for requirement comments
      expect(tabletSection).toContain('Requirement 11.4');
    });

    test('tablet media query should be properly positioned after mobile styles', () => {
      const mobileIndex = cssContent.indexOf('@media (max-width: 767px)');
      const tabletIndex = cssContent.indexOf('@media (min-width: 768px) and (max-width: 1023px)');
      
      expect(mobileIndex).toBeGreaterThan(-1);
      expect(tabletIndex).toBeGreaterThan(-1);
      expect(tabletIndex).toBeGreaterThan(mobileIndex);
    });
  });

  describe('Integration with Base Styles', () => {
    test('tablet styles should not override glassmorphism effects', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      // Should not disable backdrop-filter
      expect(tabletSection).not.toContain('backdrop-filter: none');
      expect(tabletSection).not.toContain('background: rgba(255, 255, 255, 1)');
    });

    test('base glassmorphism styles should exist', () => {
      expect(cssContent).toContain('backdrop-filter: blur(20px)');
      expect(cssContent).toContain('background: rgba(255, 255, 255, 0.7)');
    });

    test('tablet styles should not override gradient borders', () => {
      const tabletSection = extractMediaQuery(cssContent, 'min-width: 768px');
      // Should not disable gradient borders
      expect(tabletSection).not.toContain('border-image: none');
      expect(tabletSection).not.toContain('.component-section::before { display: none }');
    });
  });
});

// Helper function to extract media query content
function extractMediaQuery(css, query) {
  // For tablet query, look for the complete media query string
  let mediaQueryStart;
  if (query.includes('min-width: 768px')) {
    // Look for the tablet media query specifically
    mediaQueryStart = css.indexOf('@media (min-width: 768px) and (max-width: 1023px)');
  } else {
    // Find the start of the media query
    const queryPattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startRegex = new RegExp(`@media\\s*\\([^)]*${queryPattern}[^)]*\\)\\s*{`, 'g');
    const match = startRegex.exec(css);
    
    if (!match) {
      return '';
    }
    mediaQueryStart = match.index;
  }
  
  if (mediaQueryStart === -1) {
    return '';
  }
  
  // Find the opening brace
  const openBraceIndex = css.indexOf('{', mediaQueryStart);
  if (openBraceIndex === -1) {
    return '';
  }
  
  const startIndex = openBraceIndex + 1;
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
