import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src/'],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/utils/web-vitals/**', '!src/types/**', '!src/**/*.d.ts'],
  testPathIgnorePatterns: ['/node_modules/', '__tests__/(.*/)?data\\.ts$'],
};

export default config;
