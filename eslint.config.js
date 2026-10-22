import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['dist/', 'coverage/', 'playwright-report/', 'test-results/', 'data/'],
  },
  js.configs.recommended,
  {
    files: ['web/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: ['web/public/sw.js'],
    languageOptions: {
      globals: { ...globals.serviceworker },
    },
  },
  {
    files: ['server/**/*.js', 'e2e/**/*.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  prettier,
];
