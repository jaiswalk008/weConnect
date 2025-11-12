import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for Express.js backend applications.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const expressConfig = [
  ...baseConfig,
  // {
  //   rules: {
  //     'no-console': 'warn',
  //   },
  // },
];
