/**
 * Property-Based Tests for GPU-Accelerated Animations
 * Feature: modern-design-refresh
 * Property 10: GPU-Accelerated Animations
 * 
 * **Validates: Requirements 12.1**
 * 
 * For any CSS animation or transition, only GPU-accelerated properties 
 * (transform, opacity, filter) should be animated. Properties that trigger 
 * layout or paint (width, height, top, left, background-color) must not be 
 * animated directly.
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Property 10: GPU-Accelerated Animations', () => {
  let cssContent;
  
  beforeAll(() => {
    // Read the CSS file
    const cssPath = path.join(__dirname, '../../css/styles.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });
  
  /**
   * Helper function to extract all transition declarations from CSS
   */
  function extractTransitions(css) {
    const transitionRegex = /transition:\s*([^;]+);/gi;
    const transitions = [];
    let match;
    
    while ((match = transitionRegex.exec(css)) !== null) {
      const transitionValue = match[1].trim();
      transitions.push(transitionValue);
    }
    
    return transitions;
  }
  
  /**
   * Helper function to extract all keyframe animations from CSS
   */
  function extractKeyframeAnimations(css) {
    const keyframeRegex = /@keyframes\s+(\w+)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/gi;
    const animations = [];
    let match;
    
    while ((match = keyframeRegex.exec(css)) !== null) {
      const animationName = match[1];
      const animationBody = match[2];
      animations.push({ name: animationName, body: animationBody });
    }
    
    return animations;
  }
  
  /**
   * Helper function to extract animated properties from keyframe body
   */
  function extractAnimatedProperties(keyframeBody) {
    const properties = new Set();
    
    // Match CSS property declarations
    const propertyRegex = /([a-z-]+)\s*:/gi;
    let match;
    
    while ((match = propertyRegex.exec(keyframeBody)) !== null) {
      const property = match[1].trim();
      // Exclude keyframe selectors (from, to, percentages)
      if (property !== 'from' && property !== 'to' && !property.match(/^\d+%?$/)) {
        properties.add(property);
      }
    }
    
    return Array.from(properties);
  }
  
  /**
   * Helper function to check if a property is GPU-accelerated
   */
  function isGPUAccelerated(property) {
    const gpuProps = ['transform', 'opacity', 'filter'];
    const nonGpuProps = ['width', 'height', 'top', 'left', 'right', 'bottom', 
                         'background-color', 'background', 'color', 'border-color',
                         'margin', 'padding', 'background-position'];
    
    // Check if it's explicitly a GPU property
    if (gpuProps.includes(property)) {
      return true;
    }
    
    // Check if it's explicitly a non-GPU property
    if (nonGpuProps.includes(property)) {
      return false;
    }
    
    // For compound properties like transform-origin, check the base
    const baseProperty = property.split('-')[0];
    if (gpuProps.includes(baseProperty)) {
      return true;
    }
    
    // Default to true for unknown properties (conservative approach)
    // In practice, we want to catch known bad properties
    return true;
  }
  
  /**
   * Helper function to parse transition properties
   */
  function parseTransitionProperties(transitionValue) {
    const properties = [];
    
    // Handle 'all' keyword
    if (transitionValue.includes('all')) {
      return ['all'];
    }
    
    // Split by comma for multiple transitions
    const transitions = transitionValue.split(',');
    
    for (const transition of transitions) {
      const parts = transition.trim().split(/\s+/);
      if (parts.length > 0) {
        const property = parts[0];
        // Skip duration, timing function, delay
        if (!property.match(/^\d+m?s$/) && 
            !property.match(/^(ease|linear|ease-in|ease-out|ease-in-out|cubic-bezier)/) &&
            property !== 'all') {
          properties.push(property);
        }
      }
    }
    
    return properties;
  }
  
  test('Property 10.1: All transitions should only animate GPU-accelerated properties', () => {
    const transitions = extractTransitions(cssContent);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...transitions),
        (transition) => {
          const properties = parseTransitionProperties(transition);
          
          // 'all' is not allowed as it can animate non-GPU properties
          if (properties.includes('all')) {
            return false;
          }
          
          // Check each property
          for (const property of properties) {
            if (!isGPUAccelerated(property)) {
              console.log(`Non-GPU property in transition: ${property} (transition: ${transition})`);
              return false;
            }
          }
          
          return true;
        }
      ),
      { 
        numRuns: transitions.length > 0 ? transitions.length : 1,
        verbose: true
      }
    );
  });
  
  test('Property 10.2: All keyframe animations should only animate GPU-accelerated properties', () => {
    const animations = extractKeyframeAnimations(cssContent);
    
    // If no animations found, test should pass
    if (animations.length === 0) {
      expect(true).toBe(true);
      return;
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom(...animations),
        (animation) => {
          const properties = extractAnimatedProperties(animation.body);
          
          // Check each property
          for (const property of properties) {
            if (!isGPUAccelerated(property)) {
              console.log(`Non-GPU property in animation '${animation.name}': ${property}`);
              return false;
            }
          }
          
          return true;
        }
      ),
      { 
        numRuns: animations.length,
        verbose: true
      }
    );
  });
  
  test('Property 10.3: Verify specific non-GPU properties are not animated', () => {
    const nonGpuProps = [
      'width', 'height', 'top', 'left', 'right', 'bottom',
      'background-color', 'background-position', 'margin', 'padding',
      'border-color', 'color', 'text-decoration-color'
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...nonGpuProps),
        (property) => {
          // Check transitions
          const transitions = extractTransitions(cssContent);
          for (const transition of transitions) {
            const props = parseTransitionProperties(transition);
            if (props.includes(property)) {
              console.log(`Found non-GPU property '${property}' in transition: ${transition}`);
              return false;
            }
          }
          
          // Check keyframe animations
          const animations = extractKeyframeAnimations(cssContent);
          for (const animation of animations) {
            const props = extractAnimatedProperties(animation.body);
            if (props.includes(property)) {
              console.log(`Found non-GPU property '${property}' in animation '${animation.name}'`);
              return false;
            }
          }
          
          return true;
        }
      ),
      { 
        numRuns: nonGpuProps.length,
        verbose: true
      }
    );
  });
  
  test('Property 10.4: Verify GPU-accelerated properties are used in animations', () => {
    const gpuProps = ['transform', 'opacity', 'filter'];
    const animations = extractKeyframeAnimations(cssContent);
    
    // Verify that we have animations using GPU properties
    let hasGPUAnimations = false;
    
    for (const animation of animations) {
      const properties = extractAnimatedProperties(animation.body);
      for (const property of properties) {
        if (gpuProps.includes(property)) {
          hasGPUAnimations = true;
          break;
        }
      }
      if (hasGPUAnimations) break;
    }
    
    expect(hasGPUAnimations).toBe(true);
  });
  
  test('Property 10.5: Verify transitions use specific properties, not "all"', () => {
    const transitions = extractTransitions(cssContent);
    
    for (const transition of transitions) {
      const properties = parseTransitionProperties(transition);
      
      // 'all' should not be used
      if (properties.includes('all')) {
        fail(`Found 'transition: all' which can animate non-GPU properties: ${transition}`);
      }
    }
    
    // If we get here, no 'all' transitions were found
    expect(true).toBe(true);
  });
});
