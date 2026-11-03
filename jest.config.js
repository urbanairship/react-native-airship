/* Copyright Airship and Contributors */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],

  // The SDK is a thin layer over a native module, so tests run against a stub
  // rather than a device.
  moduleNameMapper: {
    '^react-native$': '<rootDir>/jest/react-native.ts',
  },

  collectCoverageFrom: ['src/**/*.ts', '!src/**/__tests__/**'],

  // Floors are per file rather than global: most of the SDK is still uncovered,
  // so a global number would sit low enough to permit regressions in the files
  // that are covered. Add a file here as it gains tests.
  coverageThreshold: {
    './src/UAEventEmitter.ts': {
      statements: 95,
      branches: 90,
      functions: 100,
      lines: 95,
    },
    './src/AirshipInApp.ts': {
      statements: 90,
      branches: 70,
      functions: 85,
      lines: 90,
    },
  },
};
