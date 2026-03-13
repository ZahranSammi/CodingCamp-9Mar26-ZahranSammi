export default {
  testEnvironment: 'jsdom',
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.properties.js'
  ]
};
