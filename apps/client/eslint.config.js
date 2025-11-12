import { viteConfig } from '@workspace/eslint-config/vite';

export default [
  ...viteConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Ignore config files for TypeScript parsing
    files: ['*.config.js', '*.config.mjs', '*.config.cjs'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
];
