import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    restoreMocks: true,
    projects: [
      {
        test: {
          name: 'web',
          include: ['web/src/**/*.test.js'],
          environment: 'jsdom',
        },
      },
      {
        test: {
          name: 'shared',
          include: ['shared/**/*.test.js'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'server',
          include: ['server/test/**/*.test.js'],
          environment: 'node',
        },
      },
    ],
  },
});
