import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import astro from 'eslint-plugin-astro'
import solid from 'eslint-plugin-solid'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.astro/',
      'dist/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      'no-control-regex': 'off',
      'no-empty': 'off',
    },
  },
  {
    ...solid.configs['flat/typescript'],
    files: ['**/*.{jsx,tsx}'],
    rules: {
      ...solid.configs['flat/typescript'].rules,
      'solid/no-destructure': 'off',
      'solid/prefer-for': 'warn',
    },
  },
  eslintConfigPrettier,
)
