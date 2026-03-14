/**
 * Desktop Responsive Styles Test
 * 
 * Tests for Task 12.3: Implement desktop styles (1024px - 1439px)
 * 
 * Requirements validated:
 * - 11.6: Multi-column grid layout
 * - 11.6: Apply standard spacing
 * - 11.6: Maintain full animations
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Desktop Responsive Styles (1024px - 1439px)', () => {
  let cssContent;

  beforeEach(() => {
    // Load CSS content
    cssContent = readFileSync(join(__dirname, '../css/styles.css'), 'utf-8');
  });

  describe('Requirement 11.6: Multi-Column Grid Layout', () => {
    test('desktop media query (min-width: 1024px and max-width: 1439px) should exist', () => {
      expect(cssContent).toContain('@media (min-width: 1024px) and (max-width: 1439px)');
    });

    test('dashboard-main should use multi-column layout on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.dashboard-main');
      expect(desktopSection).toContain('grid-template-columns: repeat(2, 1fr)');
    });

    test('desktop styles should include multi-column layout comment', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('Multi-column grid layout');
      expect(desktopSection).toContain('Requirement 11.6');
    });
  });

  describe('Requirement 11.6: Standard Spacing Values', () => {
    test('body padding should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('body');
      expect(desktopSection).toMatch(/padding:\s*var\(--spacing-5\)/);
    });

    test('dashboard padding should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.dashboard');
      expect(desktopSection).toMatch(/padding:\s*var\(--spacing-6\)/);
    });

    test('dashboard should have max-width constraint on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.dashboard');
      expect(desktopSection).toContain('max-width: 1200px');
    });

    test('component sections should have standard padding on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.component-section');
      expect(desktopSection).toMatch(/padding:\s*var\(--spacing-8\)/);
    });

    test('dashboard-main gap should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.dashboard-main');
      expect(desktopSection).toContain('gap: var(--spacing-8)');
    });

    test('dashboard-header margin should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.dashboard-header');
      expect(desktopSection).toContain('margin-bottom: var(--spacing-10)');
    });

    test('timer display margin should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.timer-display');
      expect(desktopSection).toContain('margin-bottom: var(--spacing-8)');
    });

    test('timer controls should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.timer-controls');
      expect(desktopSection).toContain('margin-bottom: var(--spacing-8)');
      expect(desktopSection).toContain('gap: var(--spacing-4)');
    });

    test('duration config should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.duration-config');
      expect(desktopSection).toContain('padding-top: var(--spacing-6)');
      expect(desktopSection).toContain('gap: var(--spacing-4)');
    });

    test('task input container should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.task-input-container');
      expect(desktopSection).toContain('gap: var(--spacing-4)');
    });

    test('task items should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.task-item');
      expect(desktopSection).toContain('padding: var(--spacing-4)');
      expect(desktopSection).toContain('gap: var(--spacing-4)');
    });

    test('link input container should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.link-input-container');
      expect(desktopSection).toContain('gap: var(--spacing-4)');
    });

    test('links grid should use standard spacing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.links-grid');
      expect(desktopSection).toContain('gap: var(--spacing-5)');
    });

    test('link buttons should use standard padding on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.link-button');
      expect(desktopSection).toContain('padding: var(--spacing-5)');
    });

    test('desktop styles should include standard spacing comment', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('standard spacing');
      expect(desktopSection).toContain('Requirement 11.6');
    });
  });

  describe('Requirement 11.6: Maintain Full Animations', () => {
    test('desktop styles should include full animations comment', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('Maintain full animations');
      expect(desktopSection).toContain('Requirement 11.6');
    });

    test('desktop styles should not reduce animation durations', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      // Should not contain reduced animation durations like mobile does
      expect(desktopSection).not.toContain('animation-duration: 300ms');
    });

    test('desktop styles should not reduce transform values', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      // Should not contain reduced transforms like mobile does
      expect(desktopSection).not.toContain('translateY(-2px)');
      expect(desktopSection).not.toContain('scale(1.01)');
    });

    test('base animation styles should remain active on desktop', () => {
      // Verify base animations exist and are not overridden
      expect(cssContent).toContain('@keyframes fadeInUp');
      expect(cssContent).toContain('@keyframes pulse');
      expect(cssContent).toContain('@keyframes celebrate');
      expect(cssContent).toContain('@keyframes shimmer');
    });
  });

  describe('Typography Adjustments', () => {
    test('dashboard header should have appropriate font size on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.dashboard-header h1');
      expect(desktopSection).toContain('font-size: var(--font-size-xl)');
    });

    test('greeting message should have appropriate font size on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.greeting-message');
      expect(desktopSection).toContain('font-size: var(--font-size-lg)');
    });

    test('time display should have appropriate font size on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.time-display');
      expect(desktopSection).toContain('font-size: var(--font-size-xxl)');
    });

    test('date display should have appropriate font size on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.date-display');
      expect(desktopSection).toContain('font-size: var(--font-size-md)');
    });

    test('timer display should have appropriate font size on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.timer-display');
      expect(desktopSection).toContain('font-size: var(--font-size-xxxl)');
    });
  });

  describe('Links Grid Layout', () => {
    test('links grid should have appropriate column sizing on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.links-grid');
      expect(desktopSection).toContain('minmax(180px, 1fr)');
    });

    test('link button anchor should have standard padding on desktop', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      expect(desktopSection).toContain('.link-button a');
      expect(desktopSection).toContain('padding: var(--spacing-5) var(--spacing-4)');
    });
  });

  describe('CSS Structure and Documentation', () => {
    test('desktop section should have clear header comment', () => {
      expect(cssContent).toContain('/* Responsive Design - Desktop (1024px - 1439px) */');
      expect(cssContent).toContain('/* Requirements: 11.6 */');
    });

    test('desktop section should have organized subsections with comments', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      
      // Check for requirement comments
      expect(desktopSection).toContain('Requirement 11.6');
    });

    test('desktop media query should be properly positioned after tablet styles', () => {
      const tabletIndex = cssContent.indexOf('@media (min-width: 768px) and (max-width: 1023px)');
      const desktopIndex = cssContent.indexOf('@media (min-width: 1024px) and (max-width: 1439px)');
      
      expect(tabletIndex).toBeGreaterThan(-1);
      expect(desktopIndex).toBeGreaterThan(-1);
      expect(desktopIndex).toBeGreaterThan(tabletIndex);
    });
  });

  describe('Integration with Base Styles', () => {
    test('desktop styles should not override glassmorphism effects', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      // Should not disable backdrop-filter
      expect(desktopSection).not.toContain('backdrop-filter: none');
      expect(desktopSection).not.toContain('background: rgba(255, 255, 255, 1)');
    });

    test('base glassmorphism styles should exist', () => {
      expect(cssContent).toContain('backdrop-filter: blur(20px)');
      expect(cssContent).toContain('background: rgba(255, 255, 255, 0.7)');
    });

    test('desktop styles should not override gradient borders', () => {
      const desktopSection = extractMediaQuery(cssContent, 'min-width: 1024px');
      // Should not disable gradient borders
      expect(desktopSection).not.toContain('border-image: none');
      expect(desktopSection).not.toContain('.component-section::before { display: none }');
    });
  });
});

// Helper function to extract media query content
function extractMediaQuery(css, query) {
  // For desktop query, look for the complete media query string
  let mediaQueryStart;
  if (query.includes('min-width: 1024px')) {
    // Look for the desktop media query specifically
    mediaQueryStart = css.indexOf('@media (min-width: 1024px) and (max-width: 1439px)');
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
