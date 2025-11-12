import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base.js';

/**
 * A minimal ESLint configuration for Vite + React + TypeScript.
 * Skips react-hooks and react-refresh plugins.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const viteConfig = [
  ...baseConfig,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    rules: {
      // Disable React import requirement (new JSX transform)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Allow any types
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'build/**', '.turbo/**'],
  },
  eslintConfigPrettier,
];
