import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src/'],
  testEnvironment: 'jsdom',
  passWithNoTests: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '__tests__/(.*/)?data\\.ts$'],
};

export default config;
