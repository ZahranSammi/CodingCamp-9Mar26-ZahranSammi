// Simple unit tests for GreetingComponent core methods

// Extract just the methods we need to test
const formatTime = function(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  
  return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
};

const formatDate = function(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNumber = date.getDate();
  
  return `${dayName}, ${monthName} ${dayNumber}`;
};

const getGreeting = function(hour) {
  if (hour >= 5 && hour <= 11) {
    return "Good Morning";
  } else if (hour >= 12 && hour <= 16) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour <= 20) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

// Test formatTime
console.log('=== Testing formatTime ===');
const timeTests = [
  { date: new Date('2024-01-15T10:30:45'), expected: '10:30:45 AM' },
  { date: new Date('2024-01-15T00:00:00'), expected: '12:00:00 AM' },
  { date: new Date('2024-01-15T12:00:00'), expected: '12:00:00 PM' },
  { date: new Date('2024-01-15T13:45:30'), expected: '1:45:30 PM' },
  { date: new Date('2024-01-15T23:59:59'), expected: '11:59:59 PM' }
];

timeTests.forEach(({ date, expected }) => {
  const result = formatTime(date);
  const pass = result === expected;
  console.log(`${pass ? '✓' : '✗'} formatTime(${date.toTimeString().split(' ')[0]}): ${result} ${!pass ? '(Expected: ' + expected + ')' : ''}`);
});

// Test formatDate
console.log('\n=== Testing formatDate ===');
const dateTests = [
  { date: new Date('2024-01-15'), expected: 'Monday, January 15' },
  { date: new Date('2024-12-25'), expected: 'Wednesday, December 25' },
  { date: new Date('2024-07-04'), expected: 'Thursday, July 4' }
];

dateTests.forEach(({ date, expected }) => {
  const result = formatDate(date);
  const pass = result === expected;
  console.log(`${pass ? '✓' : '✗'} formatDate(${date.toDateString()}): ${result} ${!pass ? '(Expected: ' + expected + ')' : ''}`);
});

// Test getGreeting
console.log('\n=== Testing getGreeting ===');
const greetingTests = [
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

greetingTests.forEach(({ hour, expected }) => {
  const result = getGreeting(hour);
  const pass = result === expected;
  console.log(`${pass ? '✓' : '✗'} getGreeting(${hour}): ${result} ${!pass ? '(Expected: ' + expected + ')' : ''}`);
});

console.log('\n=== All tests complete ===');
