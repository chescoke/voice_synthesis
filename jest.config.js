/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  
  // Root directory for tests
  rootDir: '.',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/backend/tests/setup.ts'],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/backend/tsconfig.json'
    }]
  },
  
  // Test match patterns
  testMatch: [
    '**/backend/tests/**/*.test.ts'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Module paths
  modulePaths: ['<rootDir>/backend/src'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'backend/src/**/*.{ts,tsx}',
    '!backend/src/**/*.d.ts',
    '!backend/src/**/*.test.ts',
    '!backend/src/tests/**',
    '!backend/src/server.ts',
    '!backend/src/types/**',
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  
  coverageThresholds: {
    global: {
      branches: 82,
      functions: 82,
      lines: 82,
      statements: 82,
    },
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

module.exports = config;