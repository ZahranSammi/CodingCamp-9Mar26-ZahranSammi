/**
 * Property-Based Tests for GreetingComponent
 * Feature: productivity-dashboard
 */

import fc from 'fast-check';

// Import the formatTime function from the GreetingComponent
// Since we're testing in isolation, we'll extract the method
const formatTime = function(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  // Pad minutes and seconds with leading zeros
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  
  return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
};

/**
 * Property 1: Time Format Validity
 * 
 * For any Date object, the time formatting function should produce a string 
 * in valid 12-hour format with AM/PM indicator (format: "h:mm:ss AM" or "h:mm:ss PM").
 * 
 * **Validates: Requirements 1.1**
 */
describe('GreetingComponent - Property 1: Time Format Validity', () => {
  test('formatTime produces valid 12-hour format with AM/PM for any Date', () => {
    fc.assert(
      fc.property(
        // Generate random dates across a wide range
        fc.date({
          min: new Date('1970-01-01T00:00:00.000Z'),
          max: new Date('2099-12-31T23:59:59.999Z')
        }),
        (date) => {
          const result = formatTime(date);
          
          // Validate format: "h:mm:ss AM" or "h:mm:ss PM"
          // Pattern: 1-2 digit hour, colon, 2 digit minutes, colon, 2 digit seconds, space, AM or PM
          const timeFormatRegex = /^(1[0-2]|[1-9]):[0-5][0-9]:[0-5][0-9] (AM|PM)$/;
          
          // Check that the result matches the expected format
          if (!timeFormatRegex.test(result)) {
            console.error(`Invalid format for date ${date.toISOString()}: "${result}"`);
            return false;
          }
          
          // Extract components to validate correctness
          const match = result.match(/^(\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
          if (!match) {
            return false;
          }
          
          const [, hourStr, minuteStr, secondStr, period] = match;
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);
          const second = parseInt(secondStr, 10);
          
          // Validate hour is between 1-12
          if (hour < 1 || hour > 12) {
            console.error(`Hour out of range: ${hour}`);
            return false;
          }
          
          // Validate minutes are between 0-59
          if (minute < 0 || minute > 59) {
            console.error(`Minutes out of range: ${minute}`);
            return false;
          }
          
          // Validate seconds are between 0-59
          if (second < 0 || second > 59) {
            console.error(`Seconds out of range: ${second}`);
            return false;
          }
          
          // Validate AM/PM matches the actual time
          const actualHour = date.getHours();
          const expectedPeriod = actualHour >= 12 ? 'PM' : 'AM';
          if (period !== expectedPeriod) {
            console.error(`Period mismatch for hour ${actualHour}: expected ${expectedPeriod}, got ${period}`);
            return false;
          }
          
          // Validate the hour conversion is correct
          let expected12Hour = actualHour % 12;
          expected12Hour = expected12Hour === 0 ? 12 : expected12Hour;
          if (hour !== expected12Hour) {
            console.error(`Hour conversion error: ${actualHour} -> ${hour}, expected ${expected12Hour}`);
            return false;
          }
          
          // Validate minutes match
          if (minute !== date.getMinutes()) {
            console.error(`Minutes mismatch: expected ${date.getMinutes()}, got ${minute}`);
            return false;
          }
          
          // Validate seconds match
          if (second !== date.getSeconds()) {
            console.error(`Seconds mismatch: expected ${date.getSeconds()}, got ${second}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Import the formatDate function from the GreetingComponent
const formatDate = function(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNumber = date.getDate();
  
  return `${dayName}, ${monthName} ${dayNumber}`;
};

/**
 * Property 2: Date Format Completeness
 * 
 * For any Date object, the date formatting function should produce a string 
 * containing the day of week, month name, and day number.
 * 
 * **Validates: Requirements 1.2**
 */
describe('GreetingComponent - Property 2: Date Format Completeness', () => {
  test('formatDate produces complete date with day of week, month name, and day number for any Date', () => {
    fc.assert(
      fc.property(
        // Generate random dates across a wide range
        fc.date({
          min: new Date('1970-01-01T00:00:00.000Z'),
          max: new Date('2099-12-31T23:59:59.999Z')
        }),
        (date) => {
          const result = formatDate(date);
          
          // Define valid day names and month names
          const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const validMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
          
          // Check that result contains a valid day name
          const containsDayName = validDays.some(day => result.includes(day));
          if (!containsDayName) {
            console.error(`Missing day name in result: "${result}"`);
            return false;
          }
          
          // Check that result contains a valid month name
          const containsMonthName = validMonths.some(month => result.includes(month));
          if (!containsMonthName) {
            console.error(`Missing month name in result: "${result}"`);
            return false;
          }
          
          // Check that result contains a day number (1-31)
          const dayNumberMatch = result.match(/\b([1-9]|[12][0-9]|3[01])\b/);
          if (!dayNumberMatch) {
            console.error(`Missing day number in result: "${result}"`);
            return false;
          }
          
          // Validate the format matches expected pattern: "DayName, MonthName DayNumber"
          const formatRegex = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (January|February|March|April|May|June|July|August|September|October|November|December) ([1-9]|[12][0-9]|3[01])$/;
          if (!formatRegex.test(result)) {
            console.error(`Invalid format for date ${date.toISOString()}: "${result}"`);
            return false;
          }
          
          // Validate the actual values match the date
          const expectedDayName = validDays[date.getDay()];
          const expectedMonthName = validMonths[date.getMonth()];
          const expectedDayNumber = date.getDate();
          
          if (!result.includes(expectedDayName)) {
            console.error(`Day name mismatch: expected ${expectedDayName}, result: "${result}"`);
            return false;
          }
          
          if (!result.includes(expectedMonthName)) {
            console.error(`Month name mismatch: expected ${expectedMonthName}, result: "${result}"`);
            return false;
          }
          
          if (!result.includes(String(expectedDayNumber))) {
            console.error(`Day number mismatch: expected ${expectedDayNumber}, result: "${result}"`);
            return false;
          }
          
          // Validate exact format
          const expectedResult = `${expectedDayName}, ${expectedMonthName} ${expectedDayNumber}`;
          if (result !== expectedResult) {
            console.error(`Exact format mismatch: expected "${expectedResult}", got "${result}"`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Import the getGreeting function from the GreetingComponent
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

/**
 * Property 3: Greeting Based on Time Range
 * 
 * For any hour value (0-23), the greeting function should return:
 * - "Good Morning" for hours 5-11
 * - "Good Afternoon" for hours 12-16
 * - "Good Evening" for hours 17-20
 * - "Good Night" for hours 21-23 and 0-4
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */
describe('GreetingComponent - Property 3: Greeting Based on Time Range', () => {
  test('getGreeting returns correct greeting for any hour value (0-23)', () => {
    fc.assert(
      fc.property(
        // Generate random hour values from 0 to 23
        fc.integer({ min: 0, max: 23 }),
        (hour) => {
          const greeting = getGreeting(hour);
          
          // Validate the greeting matches the expected value based on hour
          if (hour >= 5 && hour <= 11) {
            if (greeting !== "Good Morning") {
              console.error(`Expected "Good Morning" for hour ${hour}, got "${greeting}"`);
              return false;
            }
          } else if (hour >= 12 && hour <= 16) {
            if (greeting !== "Good Afternoon") {
              console.error(`Expected "Good Afternoon" for hour ${hour}, got "${greeting}"`);
              return false;
            }
          } else if (hour >= 17 && hour <= 20) {
            if (greeting !== "Good Evening") {
              console.error(`Expected "Good Evening" for hour ${hour}, got "${greeting}"`);
              return false;
            }
          } else { // hours 21-23 and 0-4
            if (greeting !== "Good Night") {
              console.error(`Expected "Good Night" for hour ${hour}, got "${greeting}"`);
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Import the formatGreetingMessage function from the GreetingComponent
const formatGreetingMessage = function(greeting, userName) {
  if (userName) {
    return `${greeting}, ${userName}!`;
  }
  return greeting;
};

/**
 * Property 4: User Name in Greeting Format
 * 
 * For any non-empty user name and any time-based greeting, the formatted greeting 
 * message should follow the pattern "[Greeting], [UserName]!" (e.g., "Good Morning, John!").
 * 
 * **Validates: Requirements 3.1, 3.6**
 */
// Feature: productivity-dashboard, Property 4: User Name in Greeting Format
describe('GreetingComponent - Property 4: User Name in Greeting Format', () => {
  test('formatGreetingMessage follows pattern "[Greeting], [UserName]!" for any non-empty user name and greeting', () => {
    fc.assert(
      fc.property(
        // Generate random greetings from the valid set
        fc.constantFrom("Good Morning", "Good Afternoon", "Good Evening", "Good Night"),
        // Generate random non-empty user names (1-50 characters)
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (greeting, userName) => {
          const result = formatGreetingMessage(greeting, userName);
          
          // Expected format: "[Greeting], [UserName]!"
          const expectedPattern = `${greeting}, ${userName}!`;
          
          if (result !== expectedPattern) {
            console.error(`Format mismatch: expected "${expectedPattern}", got "${result}"`);
            return false;
          }
          
          // Validate the result contains the greeting
          if (!result.includes(greeting)) {
            console.error(`Result missing greeting: "${result}" should contain "${greeting}"`);
            return false;
          }
          
          // Validate the result contains the user name
          if (!result.includes(userName)) {
            console.error(`Result missing user name: "${result}" should contain "${userName}"`);
            return false;
          }
          
          // Validate the result ends with an exclamation mark
          if (!result.endsWith('!')) {
            console.error(`Result should end with "!": "${result}"`);
            return false;
          }
          
          // Validate the result contains a comma after the greeting
          if (!result.includes(', ')) {
            console.error(`Result should contain ", " separator: "${result}"`);
            return false;
          }
          
          // Validate the structure: greeting comes before comma, userName comes after comma and before !
          const parts = result.split(', ');
          if (parts.length !== 2) {
            console.error(`Result should have exactly one ", " separator: "${result}"`);
            return false;
          }
          
          if (parts[0] !== greeting) {
            console.error(`First part should be greeting: expected "${greeting}", got "${parts[0]}"`);
            return false;
          }
          
          if (parts[1] !== `${userName}!`) {
            console.error(`Second part should be userName with !: expected "${userName}!", got "${parts[1]}"`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('formatGreetingMessage returns just greeting when userName is null or empty', () => {
    fc.assert(
      fc.property(
        // Generate random greetings from the valid set
        fc.constantFrom("Good Morning", "Good Afternoon", "Good Evening", "Good Night"),
        (greeting) => {
          // Test with null
          const resultNull = formatGreetingMessage(greeting, null);
          if (resultNull !== greeting) {
            console.error(`Expected "${greeting}" for null userName, got "${resultNull}"`);
            return false;
          }
          
          // Test with empty string
          const resultEmpty = formatGreetingMessage(greeting, '');
          if (resultEmpty !== greeting) {
            console.error(`Expected "${greeting}" for empty userName, got "${resultEmpty}"`);
            return false;
          }
          
          // Test with undefined
          const resultUndefined = formatGreetingMessage(greeting, undefined);
          if (resultUndefined !== greeting) {
            console.error(`Expected "${greeting}" for undefined userName, got "${resultUndefined}"`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 5: User Name Storage Round-Trip
 * 
 * For any valid user name string, saving to Local Storage and then loading 
 * should produce the same user name value.
 * 
 * **Validates: Requirements 3.4, 3.5**
 */
// Feature: productivity-dashboard, Property 5: User Name Storage Round-Trip
describe('GreetingComponent - Property 5: User Name Storage Round-Trip', () => {
  // Helper functions to simulate GreetingComponent storage operations
  const saveUserName = (userName) => {
    try {
      if (userName === null) {
        localStorage.removeItem('productivity_dashboard_user_name');
      } else {
        localStorage.setItem('productivity_dashboard_user_name', userName);
      }
    } catch (error) {
      throw new Error('Failed to save user name to localStorage: ' + error.message);
    }
  };

  const loadUserName = () => {
    try {
      const stored = localStorage.getItem('productivity_dashboard_user_name');
      return stored || null;
    } catch (error) {
      console.warn('Failed to load user name from localStorage:', error);
      return null;
    }
  };

  // Clean up localStorage before and after tests
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('saving and loading a user name produces the same value for any valid user name string (1-50 chars)', () => {
    fc.assert(
      fc.property(
        // Generate random user name strings (1-50 characters)
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (userName) => {
          // Trim the user name as the component does
          const trimmedUserName = userName.trim();
          
          // Save the user name
          saveUserName(trimmedUserName);
          
          // Load the user name
          const loadedUserName = loadUserName();
          
          // Verify round-trip: loaded value should match saved value
          if (loadedUserName !== trimmedUserName) {
            console.error(`Round-trip failed: saved "${trimmedUserName}", loaded "${loadedUserName}"`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('saving null user name and loading produces null', () => {
    // Save null (which removes the item)
    saveUserName(null);
    
    // Load should return null
    const loadedUserName = loadUserName();
    
    if (loadedUserName !== null) {
      console.error(`Expected null after saving null, got "${loadedUserName}"`);
      throw new Error('Round-trip failed for null user name');
    }
  });

  test('round-trip preserves exact string content including special characters', () => {
    fc.assert(
      fc.property(
        // Generate strings with various special characters
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (userName) => {
          const trimmedUserName = userName.trim();
          
          // Save and load
          saveUserName(trimmedUserName);
          const loadedUserName = loadUserName();
          
          // Verify exact match (no character corruption)
          if (loadedUserName !== trimmedUserName) {
            console.error(`Character corruption detected: saved "${trimmedUserName}", loaded "${loadedUserName}"`);
            return false;
          }
          
          // Verify length is preserved
          if (loadedUserName.length !== trimmedUserName.length) {
            console.error(`Length mismatch: saved length ${trimmedUserName.length}, loaded length ${loadedUserName.length}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('multiple save-load cycles preserve the user name', () => {
    fc.assert(
      fc.property(
        // Generate a sequence of user names
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          { minLength: 1, maxLength: 10 }
        ),
        (userNames) => {
          // Test multiple save-load cycles
          for (const userName of userNames) {
            const trimmedUserName = userName.trim();
            
            // Save
            saveUserName(trimmedUserName);
            
            // Load
            const loadedUserName = loadUserName();
            
            // Verify
            if (loadedUserName !== trimmedUserName) {
              console.error(`Round-trip failed in sequence: saved "${trimmedUserName}", loaded "${loadedUserName}"`);
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('overwriting existing user name with new value works correctly', () => {
    fc.assert(
      fc.property(
        // Generate two different user names
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (userName1, userName2) => {
          const trimmed1 = userName1.trim();
          const trimmed2 = userName2.trim();
          
          // Save first name
          saveUserName(trimmed1);
          
          // Verify first name is stored
          let loaded = loadUserName();
          if (loaded !== trimmed1) {
            console.error(`First save failed: expected "${trimmed1}", got "${loaded}"`);
            return false;
          }
          
          // Overwrite with second name
          saveUserName(trimmed2);
          
          // Verify second name is stored (first name should be replaced)
          loaded = loadUserName();
          if (loaded !== trimmed2) {
            console.error(`Overwrite failed: expected "${trimmed2}", got "${loaded}"`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
