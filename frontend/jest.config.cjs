/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    // IMPORTANT: mock task.service BEFORE @/ alias so import.meta never loads
    '^@/services/task\\.service(\\.ts)?$': '<rootDir>/src/__mocks__/task.service.ts',
    // @/ path alias
    '^@/(.*)$': '<rootDir>/src/$1',
    // CSS files
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        strict: false,
        esModuleInterop: true,
      },
      diagnostics: false,
    }],
  },
  testMatch: ['**/?(*.)+(spec|test).{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/setupTests.ts',
    '!src/vite-env.d.ts',
    '!src/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
};
