/**
 * Property-Based Tests for QuickLinksComponent
 * Feature: productivity-dashboard
 */

import fc from 'fast-check';

// QuickLinksComponent class for testing
// In a real browser environment, this would be loaded from app.js
class QuickLinksComponent {
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error("Container element required for QuickLinksComponent");
    }
    this.container = containerElement;
    this.links = [];
  }

  generateId() {
    return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadLinks() {
    try {
      const stored = localStorage.getItem('productivity_dashboard_links');
      if (stored) {
        this.links = JSON.parse(stored);
      } else {
        this.links = [];
      }
    } catch (error) {
      console.warn('Failed to load links from localStorage, defaulting to empty array:', error);
      this.links = [];
    }
  }

  saveLinks() {
    try {
      localStorage.setItem('productivity_dashboard_links', JSON.stringify(this.links));
    } catch (error) {
      console.error('Failed to save links to localStorage:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage full. Please delete some items.');
      }
    }
  }

  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  addLink(name, url) {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    
    if (!trimmedName) {
      return false;
    }
    
    if (!this.validateUrl(trimmedUrl)) {
      return false;
    }
    
    const newLink = {
      id: this.generateId(),
      name: trimmedName,
      url: trimmedUrl
    };
    
    this.links.push(newLink);
    this.saveLinks();
    return true;
  }

  deleteLink(id) {
    const initialLength = this.links.length;
    this.links = this.links.filter(link => link.id !== id);
    
    if (this.links.length < initialLength) {
      this.saveLinks();
      return true;
    }
    return false;
  }

  renderLinks() {
    const linksGrid = this.container.querySelector('.links-grid');
    if (!linksGrid) return '';

    let html = '';
    this.links.forEach(link => {
      html += `<div class="link-button" data-id="${link.id}">`;
      html += `<a href="${link.url}" target="_blank">${link.name}</a>`;
      html += `<button class="btn-delete-link">×</button>`;
      html += `</div>`;
    });
    
    return html;
  }
}

// Arbitrary generators for testing
const linkArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  url: fc.webUrl()
});

const linkArrayArbitrary = fc.array(linkArbitrary, { minLength: 0, maxLength: 50 });

// Mock container element
const mockContainer = { innerHTML: '', querySelector: () => null };

/**
 * Property 27: Link Storage Persistence
 * 
 * For any link list operation (add, delete), the operation should trigger a save 
 * to Local Storage, and the stored data should match the current links list state.
 * 
 * **Validates: Requirements 14.1, 14.2**
 */
describe('QuickLinksComponent - Property 27: Link Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saving links persists them to localStorage', () => {
    fc.assert(
      fc.property(linkArrayArbitrary, (links) => {
        const component = new QuickLinksComponent(mockContainer);
        
        // Set links and save
        component.links = links;
        component.saveLinks();
        
        // Verify data was saved to localStorage
        const stored = localStorage.getItem('productivity_dashboard_links');
        expect(stored).not.toBeNull();
        
        // Verify stored data matches original links
        const parsed = JSON.parse(stored);
        expect(parsed).toEqual(links);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 28: Link Storage Round-Trip
 * 
 * For any array of valid links, saving to Local Storage and then loading should 
 * produce an equivalent links list with all links having the same IDs, names, and URLs.
 * 
 * **Validates: Requirements 14.3**
 */
describe('QuickLinksComponent - Property 28: Link Storage Round-Trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saving and loading produces equivalent links list', () => {
    fc.assert(
      fc.property(linkArrayArbitrary, (originalLinks) => {
        const component1 = new QuickLinksComponent(mockContainer);
        
        // Save links
        component1.links = originalLinks;
        component1.saveLinks();
        
        // Create new component and load links
        const component2 = new QuickLinksComponent(mockContainer);
        component2.loadLinks();
        
        // Verify loaded links match original links
        expect(component2.links).toEqual(originalLinks);
        
        // Verify all properties are preserved
        component2.links.forEach((link, index) => {
          expect(link.id).toBe(originalLinks[index].id);
          expect(link.name).toBe(originalLinks[index].name);
          expect(link.url).toBe(originalLinks[index].url);
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Additional test: Verify JSON parse errors default to empty array
  test('JSON parse errors default to empty array', () => {
    const component = new QuickLinksComponent(mockContainer);
    
    // Set invalid JSON in localStorage
    localStorage.setItem('productivity_dashboard_links', 'invalid json {]');
    
    // Load links should default to empty array
    component.loadLinks();
    expect(component.links).toEqual([]);
  });

  // Additional test: Verify missing data defaults to empty array
  test('Missing localStorage data defaults to empty array', () => {
    const component = new QuickLinksComponent(mockContainer);
    
    // Ensure no data in localStorage
    localStorage.removeItem('productivity_dashboard_links');
    
    // Load links should default to empty array
    component.loadLinks();
    expect(component.links).toEqual([]);
  });

  // Additional test: Verify generateId creates unique IDs
  test('generateId creates unique identifiers', () => {
    const component = new QuickLinksComponent(mockContainer);
    
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      const id = component.generateId();
      expect(id).toMatch(/^link_\d+_[a-z0-9]+$/);
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
  });
});

/**
 * Property 29: Invalid Link Rejection
 * 
 * For any link addition attempt with missing name, missing URL, or invalid URL format, 
 * calling addLink should reject the submission and leave the links list unchanged.
 * 
 * **Validates: Requirements 13.2**
 */
describe('QuickLinksComponent - Property 29: Invalid Link Rejection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('rejects links with empty name', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), fc.string().filter(s => s.trim() === '')),
        fc.webUrl(),
        (emptyName, validUrl) => {
          const component = new QuickLinksComponent(mockContainer);
          const initialLength = component.links.length;
          
          const result = component.addLink(emptyName, validUrl);
          
          expect(result).toBe(false);
          expect(component.links.length).toBe(initialLength);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('rejects links with invalid URL', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.oneof(
          fc.constant(''),
          fc.constant('not-a-url'),
          fc.constant('invalid url'),
          fc.string().filter(s => {
            try {
              new URL(s);
              return false;
            } catch {
              return true;
            }
          })
        ),
        (validName, invalidUrl) => {
          const component = new QuickLinksComponent(mockContainer);
          const initialLength = component.links.length;
          
          const result = component.addLink(validName, invalidUrl);
          
          expect(result).toBe(false);
          expect(component.links.length).toBe(initialLength);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('accepts valid name and URL', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.webUrl(),
        (validName, validUrl) => {
          const component = new QuickLinksComponent(mockContainer);
          const initialLength = component.links.length;
          
          const result = component.addLink(validName, validUrl);
          
          expect(result).toBe(true);
          expect(component.links.length).toBe(initialLength + 1);
          expect(component.links[component.links.length - 1].name).toBe(validName.trim());
          expect(component.links[component.links.length - 1].url).toBe(validUrl.trim());
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 30: Link Rendering Completeness
 * 
 * For any link in the links list, the rendered HTML should include an anchor element 
 * with href set to the link's URL, target="_blank", the link's name as text, and a delete control.
 * 
 * **Validates: Requirements 13.3, 13.4**
 */
describe('QuickLinksComponent - Property 30: Link Rendering Completeness', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('rendered HTML includes all required elements for each link', () => {
    fc.assert(
      fc.property(linkArrayArbitrary, (links) => {
        // Create mock container with querySelector support
        const mockLinksGrid = { innerHTML: '' };
        const mockContainerWithGrid = {
          querySelector: (selector) => {
            if (selector === '.links-grid') return mockLinksGrid;
            return null;
          }
        };
        
        const component = new QuickLinksComponent(mockContainerWithGrid);
        component.links = links;
        
        const html = component.renderLinks();
        
        // Verify each link is rendered with required elements
        links.forEach(link => {
          // Check for link button container with data-id
          expect(html).toContain(`data-id="${link.id}"`);
          
          // Check for anchor with href and target="_blank"
          expect(html).toContain(`<a href="${link.url}" target="_blank">${link.name}</a>`);
          
          // Check for delete button
          expect(html).toContain('btn-delete-link');
          expect(html).toContain('×');
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('empty links list renders empty HTML', () => {
    const mockLinksGrid = { innerHTML: '' };
    const mockContainerWithGrid = {
      querySelector: (selector) => {
        if (selector === '.links-grid') return mockLinksGrid;
        return null;
      }
    };
    
    const component = new QuickLinksComponent(mockContainerWithGrid);
    component.links = [];
    
    const html = component.renderLinks();
    
    expect(html).toBe('');
  });
});

/**
 * Property 31: Link Deletion Removes Link
 * 
 * For any links list and any link ID in that list, calling deleteLink should remove 
 * the link with that ID from the list, and the link should not appear in subsequent renders.
 * 
 * **Validates: Requirements 13.5**
 */
describe('QuickLinksComponent - Property 31: Link Deletion Removes Link', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('deleting a link removes it from the list', () => {
    fc.assert(
      fc.property(
        linkArrayArbitrary.filter(arr => arr.length > 0),
        fc.integer({ min: 0 }),
        (links, indexSeed) => {
          const component = new QuickLinksComponent(mockContainer);
          component.links = [...links]; // Copy to avoid mutation
          
          const index = indexSeed % links.length;
          const linkToDelete = links[index];
          const initialLength = component.links.length;
          
          const result = component.deleteLink(linkToDelete.id);
          
          expect(result).toBe(true);
          expect(component.links.length).toBe(initialLength - 1);
          expect(component.links.find(l => l.id === linkToDelete.id)).toBeUndefined();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('deleting non-existent link returns false and leaves list unchanged', () => {
    fc.assert(
      fc.property(
        linkArrayArbitrary,
        fc.string({ minLength: 1 }),
        (links, nonExistentId) => {
          // Ensure the ID doesn't exist in the list
          if (links.some(l => l.id === nonExistentId)) {
            return true; // Skip this case
          }
          
          const component = new QuickLinksComponent(mockContainer);
          component.links = [...links];
          const initialLength = component.links.length;
          
          const result = component.deleteLink(nonExistentId);
          
          expect(result).toBe(false);
          expect(component.links.length).toBe(initialLength);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('deleted link does not appear in rendered HTML', () => {
    fc.assert(
      fc.property(
        linkArrayArbitrary.filter(arr => arr.length > 0),
        fc.integer({ min: 0 }),
        (links, indexSeed) => {
          const mockLinksGrid = { innerHTML: '' };
          const mockContainerWithGrid = {
            querySelector: (selector) => {
              if (selector === '.links-grid') return mockLinksGrid;
              return null;
            }
          };
          
          const component = new QuickLinksComponent(mockContainerWithGrid);
          component.links = [...links];
          
          const index = indexSeed % links.length;
          const linkToDelete = links[index];
          
          component.deleteLink(linkToDelete.id);
          const html = component.renderLinks();
          
          // Verify deleted link's ID is not in rendered HTML (ID is unique)
          expect(html).not.toContain(`data-id="${linkToDelete.id}"`);
          
          // Verify the link count is correct
          const remainingLinks = links.filter(l => l.id !== linkToDelete.id);
          const linkButtonCount = (html.match(/class="link-button"/g) || []).length;
          expect(linkButtonCount).toBe(remainingLinks.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
