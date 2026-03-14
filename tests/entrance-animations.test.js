/**
 * Unit Tests for Entrance Animations
 * Task 9: Implement entrance animations
 */

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Load the HTML and CSS for testing
const htmlPath = path.join(process.cwd(), 'index.html');
const cssPath = path.join(process.cwd(), 'css', 'styles.css');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

/**
 * Helper function to set up a JSDOM environment with CSS
 */
function setupDOM() {
  const dom = new JSDOM(htmlContent, {
    resources: 'usable',
    runScripts: 'dangerously'
  });
  
  const { window } = dom;
  const { document } = window;
  
  // Inject CSS into the document
  const styleElement = document.createElement('style');
  styleElement.textContent = cssContent;
  document.head.appendChild(styleElement);
  
  return { window, document };
}

describe('Entrance Animations - Task 9', () => {
  let window, document;
  
  beforeEach(() => {
    const dom = setupDOM();
    window = dom.window;
    document = dom.document;
  });
  
  afterEach(() => {
    if (window) {
      window.close();
    }
  });
  
  describe('9.1 fadeInUp keyframe animation', () => {
    test('fadeInUp keyframe animation is defined in CSS', () => {
      // Check if the fadeInUp animation is defined in the CSS content
      expect(cssContent).toContain('@keyframes fadeInUp');
      expect(cssContent).toContain('opacity: 0');
      expect(cssContent).toContain('transform: translateY(20px)');
      expect(cssContent).toContain('opacity: 1');
      expect(cssContent).toContain('transform: translateY(0)');
    });
    
    test('fadeInUp animation starts from opacity 0 and translateY(20px)', () => {
      const fadeInUpMatch = cssContent.match(/@keyframes fadeInUp\s*{[^}]*from\s*{([^}]*)}/s);
      expect(fadeInUpMatch).toBeTruthy();
      
      const fromBlock = fadeInUpMatch[1];
      expect(fromBlock).toContain('opacity: 0');
      expect(fromBlock).toContain('translateY(20px)');
    });
    
    test('fadeInUp animation ends at opacity 1 and translateY(0)', () => {
      // Check the complete fadeInUp animation definition
      const fadeInUpRegex = /@keyframes fadeInUp\s*{\s*from\s*{[^}]*}\s*to\s*{([^}]*)}/s;
      const fadeInUpMatch = cssContent.match(fadeInUpRegex);
      
      expect(fadeInUpMatch).toBeTruthy();
      
      const toBlock = fadeInUpMatch[1];
      expect(toBlock).toContain('opacity: 1');
      expect(toBlock).toContain('translateY(0)');
    });
  });
  
  describe('9.2 Staggered entrance animations on components', () => {
    test('component sections have fadeInUp animation applied', () => {
      // Check CSS content directly since JSDOM doesn't fully support computed animation styles
      const componentAnimationMatch = cssContent.match(/\.component-section\s*{[^}]*animation:\s*fadeInUp/s);
      expect(componentAnimationMatch).toBeTruthy();
    });
    
    test('component sections have 400ms animation duration', () => {
      // Check CSS content directly for the 400ms duration
      const durationMatch = cssContent.match(/animation:\s*fadeInUp\s+400ms/);
      expect(durationMatch).toBeTruthy();
    });
    
    test('component sections use cubic-bezier(0.4, 0, 0.2, 1) easing', () => {
      // Check CSS content for the correct easing function
      const animationMatch = cssContent.match(/animation:\s*fadeInUp\s+[\d.]+m?s\s+([^;]+)/);
      expect(animationMatch).toBeTruthy();
      
      const easingFunction = animationMatch[1];
      expect(easingFunction).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
    });
    
    test('component sections have animation-fill-mode: backwards', () => {
      // Check CSS content for backwards fill mode
      const animationMatch = cssContent.match(/animation:\s*fadeInUp\s+[\d.]+m?s\s+[^;]+\s+backwards/);
      expect(animationMatch).toBeTruthy();
    });
    
    test('first component section has 0.1s animation delay', () => {
      // Check CSS for nth-child(1) delay
      const delay1Match = cssContent.match(/\.component-section:nth-child\(1\)\s*{[^}]*animation-delay:\s*([\d.]+s)/s);
      expect(delay1Match).toBeTruthy();
      expect(delay1Match[1]).toBe('0.1s');
    });
    
    test('second component section has 0.2s animation delay', () => {
      // Check CSS for nth-child(2) delay
      const delay2Match = cssContent.match(/\.component-section:nth-child\(2\)\s*{[^}]*animation-delay:\s*([\d.]+s)/s);
      expect(delay2Match).toBeTruthy();
      expect(delay2Match[1]).toBe('0.2s');
    });
    
    test('third component section has 0.3s animation delay', () => {
      // Check CSS for nth-child(3) delay
      const delay3Match = cssContent.match(/\.component-section:nth-child\(3\)\s*{[^}]*animation-delay:\s*([\d.]+s)/s);
      expect(delay3Match).toBeTruthy();
      expect(delay3Match[1]).toBe('0.3s');
    });
    
    test('fourth component section has 0.4s animation delay', () => {
      // Check CSS for nth-child(4) delay
      const delay4Match = cssContent.match(/\.component-section:nth-child\(4\)\s*{[^}]*animation-delay:\s*([\d.]+s)/s);
      expect(delay4Match).toBeTruthy();
      expect(delay4Match[1]).toBe('0.4s');
    });
    
    test('staggered delays are in increments of 0.1s', () => {
      const delays = [];
      
      for (let i = 1; i <= 4; i++) {
        const delayMatch = cssContent.match(
          new RegExp(`\\.component-section:nth-child\\(${i}\\)\\s*{[^}]*animation-delay:\\s*([\\d.]+)s`, 's')
        );
        
        if (delayMatch) {
          delays.push(parseFloat(delayMatch[1]));
        }
      }
      
      expect(delays.length).toBe(4);
      
      // Check that each delay is 0.1s more than the previous
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i] - delays[i - 1]).toBeCloseTo(0.1, 2);
      }
    });
  });
  
  describe('9.3 Animation duration bounds compliance', () => {
    test('fadeInUp animation duration is within 150-400ms range', () => {
      const animationMatch = cssContent.match(/animation:\s*fadeInUp\s+([\d.]+)(m?s)/);
      expect(animationMatch).toBeTruthy();
      
      const duration = parseFloat(animationMatch[1]);
      const unit = animationMatch[2];
      
      // Convert to milliseconds
      const durationMs = unit === 's' ? duration * 1000 : duration;
      
      expect(durationMs).toBeGreaterThanOrEqual(150);
      expect(durationMs).toBeLessThanOrEqual(400);
    });
    
    test('all component animations comply with duration bounds', () => {
      // Check CSS content for the animation duration
      const animationMatch = cssContent.match(/animation:\s*fadeInUp\s+([\d.]+)(m?s)/);
      expect(animationMatch).toBeTruthy();
      
      const duration = parseFloat(animationMatch[1]);
      const unit = animationMatch[2];
      
      // Convert to milliseconds
      const durationMs = unit === 's' ? duration * 1000 : duration;
      
      // Check if duration is within bounds
      expect(durationMs).toBeGreaterThanOrEqual(150);
      expect(durationMs).toBeLessThanOrEqual(400);
    });
  });
  
  describe('Integration with existing animations', () => {
    test('entrance animations do not conflict with hover animations', () => {
      // Check that both animation and transition are defined in CSS
      const componentSectionMatch = cssContent.match(/\.component-section\s*{[^}]*}/s);
      expect(componentSectionMatch).toBeTruthy();
      
      const componentSectionBlock = componentSectionMatch[0];
      expect(componentSectionBlock).toContain('animation:');
      expect(componentSectionBlock).toContain('transition:');
    });
    
    test('GPU acceleration is maintained with will-change property (Requirement 12.3)', () => {
      // Verify will-change is used sparingly - only during hover
      const hoverMatch = cssContent.match(/\.component-section:hover\s*{[^}]*}/s);
      expect(hoverMatch).toBeTruthy();
      expect(hoverMatch[0]).toContain('will-change: transform');
      
      // Verify will-change is removed after hover
      const notHoverMatch = cssContent.match(/\.component-section:not\(:hover\)\s*{[^}]*}/s);
      expect(notHoverMatch).toBeTruthy();
      expect(notHoverMatch[0]).toContain('will-change: auto');
    });
  });
});
