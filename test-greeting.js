// Simple unit tests for GreetingComponent

// Test formatTime
function testFormatTime() {
  const component = {
    formatTime: GreetingComponent.prototype.formatTime
  };
  
  // Test various times
  const testCases = [
    { date: new Date('2024-01-15T10:30:45'), expected: '10:30:45 AM' },
    { date: new Date('2024-01-15T00:00:00'), expected: '12:00:00 AM' },
    { date: new Date('2024-01-15T12:00:00'), expected: '12:00:00 PM' },
    { date: new Date('2024-01-15T13:45:30'), expected: '1:45:30 PM' },
    { date: new Date('2024-01-15T23:59:59'), expected: '11:59:59 PM' }
  ];
  
  testCases.forEach(({ date, expected }) => {
    const result = component.formatTime(date);
    console.log(`formatTime(${date.toISOString()}): ${result} ${result === expected ? '✓' : '✗ Expected: ' + expected}`);
  });
}

// Test formatDate
function testFormatDate() {
  const component = {
    formatDate: GreetingComponent.prototype.formatDate
  };
  
  const testCases = [
    { date: new Date('2024-01-15'), expected: 'Monday, January 15' },
    { date: new Date('2024-12-25'), expected: 'Wednesday, December 25' },
    { date: new Date('2024-07-04'), expected: 'Thursday, July 4' }
  ];
  
  testCases.forEach(({ date, expected }) => {
    const result = component.formatDate(date);
    console.log(`formatDate(${date.toISOString()}): ${result} ${result === expected ? '✓' : '✗ Expected: ' + expected}`);
  });
}

// Test getGreeting
function testGetGreeting() {
  const component = {
    getGreeting: GreetingComponent.prototype.getGreeting
  };
  
  const testCases = [
    { hour: 5, expected: 'Good Morning' },
    { hour: 11, expected: 'Good Morning' },
    { hour: 12, expected: 'Good Afternoon' },
    { hour: 16, expected: 'Good Afternoon' },
    { hour: 17, expected: 'Good Evening' },
    { hour: 20, expected: 'Good Evening' },
    { hour: 21, expected: 'Good Night' },
    { hour: 23, expected: 'Good Night' },
    { hour: 0, expected: 'Good Night' },
    { hour: 4, expected: 'Good Night' }
  ];
  
  testCases.forEach(({ hour, expected }) => {
    const result = component.getGreeting(hour);
    console.log(`getGreeting(${hour}): ${result} ${result === expected ? '✓' : '✗ Expected: ' + expected}`);
  });
}

// Run tests
console.log('=== Testing GreetingComponent ===\n');
console.log('--- formatTime tests ---');
testFormatTime();
console.log('\n--- formatDate tests ---');
testFormatDate();
console.log('\n--- getGreeting tests ---');
testGetGreeting();
console.log('\n=== All tests complete ===');
