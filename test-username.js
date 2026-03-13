// Simple unit tests for GreetingComponent user name functionality (Task 2.2)

// Mock localStorage for testing
const mockStorage = {};
const mockLocalStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

// Replace global localStorage with mock
global.localStorage = mockLocalStorage;

// Load the GreetingComponent from app.js
const fs = require('fs');
const appCode = fs.readFileSync('./js/app.js', 'utf8');
// Extract just the GreetingComponent class
eval(appCode.split('// Test initialization')[0]);

// Test setUserName and getUserName
function testSetAndGetUserName() {
  console.log('--- Testing setUserName and getUserName ---');
  
  // Create a mock container
  const container = {
    innerHTML: '',
    querySelector: () => null
  };
  
  const component = new GreetingComponent(container);
  
  // Test setting a name
  component.setUserName('John');
  const result1 = component.getUserName();
  console.log(`setUserName('John') -> getUserName(): ${result1} ${result1 === 'John' ? '✓' : '✗ Expected: John'}`);
  
  // Test setting null
  component.setUserName(null);
  const result2 = component.getUserName();
  console.log(`setUserName(null) -> getUserName(): ${result2} ${result2 === null ? '✓' : '✗ Expected: null'}`);
  
  // Test setting empty string (should become null)
  component.setUserName('');
  const result3 = component.getUserName();
  console.log(`setUserName('') -> getUserName(): ${result3} ${result3 === null ? '✓' : '✗ Expected: null'}`);
  
  // Test trimming whitespace
  component.setUserName('  Alice  ');
  const result4 = component.getUserName();
  console.log(`setUserName('  Alice  ') -> getUserName(): ${result4} ${result4 === 'Alice' ? '✓' : '✗ Expected: Alice'}`);
}

// Test saveUserName and loadUserName
function testSaveAndLoadUserName() {
  console.log('\n--- Testing saveUserName and loadUserName ---');
  
  // Clear storage
  mockLocalStorage.clear();
  
  // Create a mock container
  const container = {
    innerHTML: '',
    querySelector: () => null
  };
  
  const component1 = new GreetingComponent(container);
  
  // Set and save a name
  component1.setUserName('Bob');
  
  // Check localStorage
  const stored = mockLocalStorage.getItem('productivity_dashboard_user_name');
  console.log(`After setUserName('Bob'), localStorage contains: ${stored} ${stored === 'Bob' ? '✓' : '✗ Expected: Bob'}`);
  
  // Create a new component and load
  const component2 = new GreetingComponent(container);
  component2.loadUserName();
  const loaded = component2.getUserName();
  console.log(`New component loadUserName() -> getUserName(): ${loaded} ${loaded === 'Bob' ? '✓' : '✗ Expected: Bob'}`);
  
  // Test null storage
  component1.setUserName(null);
  const storedNull = mockLocalStorage.getItem('productivity_dashboard_user_name');
  console.log(`After setUserName(null), localStorage contains: ${storedNull} ${storedNull === null ? '✓' : '✗ Expected: null'}`);
}

// Test formatGreetingMessage
function testFormatGreetingMessage() {
  console.log('\n--- Testing formatGreetingMessage ---');
  
  const container = {
    innerHTML: '',
    querySelector: () => null
  };
  
  const component = new GreetingComponent(container);
  
  // Test with user name
  const result1 = component.formatGreetingMessage('Good Morning', 'John');
  console.log(`formatGreetingMessage('Good Morning', 'John'): ${result1} ${result1 === 'Good Morning, John!' ? '✓' : '✗ Expected: Good Morning, John!'}`);
  
  // Test without user name
  const result2 = component.formatGreetingMessage('Good Afternoon', null);
  console.log(`formatGreetingMessage('Good Afternoon', null): ${result2} ${result2 === 'Good Afternoon' ? '✓' : '✗ Expected: Good Afternoon'}`);
  
  // Test with empty string (should be treated as no name)
  const result3 = component.formatGreetingMessage('Good Evening', '');
  console.log(`formatGreetingMessage('Good Evening', ''): ${result3} ${result3 === 'Good Evening' ? '✓' : '✗ Expected: Good Evening'}`);
}

// Run tests
console.log('=== Testing GreetingComponent User Name Features (Task 2.2) ===\n');
testSetAndGetUserName();
testSaveAndLoadUserName();
testFormatGreetingMessage();
console.log('\n=== All tests complete ===');
