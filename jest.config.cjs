/** @type {import('jest').Config} */
module.exports = {
  // Environment
  testEnvironment: "jsdom",

  // TypeScript support
  preset: "ts-jest",

  // TypeScript configuration
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  // Module resolution (correct property name)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  // Test patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{ts,tsx}",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Transform files
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/build/",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
};
