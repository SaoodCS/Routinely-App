import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import security from 'eslint-plugin-security';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsProjects = [
   './apps/frontend/tsconfig.app.json',
   './apps/frontend/tsconfig.node.json',
   './apps/backend/tsconfig.json',
   './packages/utils/tsconfig.json',
   './packages/types/tsconfig.json',
];

const commonRules = {
   'prettier/prettier': 'warn',
   '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      {
         selector: 'typeLike',
         filter: { regex: '^T_', match: true },
         format: null,
         custom: { regex: '^T_(?:[A-Z][a-zA-Z0-9]*)(?:_[A-Z][a-zA-Z0-9]*)*$', match: true },
      },
      { selector: 'typeLike', filter: { regex: '^T_', match: false }, format: ['PascalCase'] },
   ],
   '@typescript-eslint/consistent-type-imports': 'error',
   '@typescript-eslint/no-unused-vars': 'off',
   '@typescript-eslint/await-thenable': 'error',
   '@typescript-eslint/no-floating-promises': 'error',
   '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true, allowTypedFunctionExpressions: true }],
   '@typescript-eslint/no-namespace': 'off',
   'no-else-return': 'error',
   'no-useless-return': 'error',
   'no-param-reassign': 'error',
   'unused-imports/no-unused-imports': 'warn',
   'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
   'no-console': ['warn', { allow: ['error'] }],
   'prefer-const': 'warn',
   'no-await-in-loop': 'error',
   'prefer-template': 'error',
   'import/no-unresolved': 'error',
   'import/order': 'warn',
   'security/detect-non-literal-regexp': 'error',
   'security/detect-non-literal-fs-filename': 'error',
   'security/detect-no-csrf-before-method-override': 'error',
   'security/detect-eval-with-expression': 'error',
};

export default defineConfig([
   globalIgnores(['**/node_modules/**', '**/dist/**', '**/dev-dist/**', '**/coverage/**', '**/*.tsbuildinfo', 'apps/frontend/public/**']),

   {
      files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
      extends: [
         js.configs.recommended,
         ...tseslint.configs.recommendedTypeChecked,
         importPlugin.flatConfigs.recommended,
         importPlugin.flatConfigs.typescript,
         prettierConfig,
      ],
      languageOptions: {
         parser: tseslint.parser,
         ecmaVersion: 'latest',
         sourceType: 'module',
         globals: { ...globals.browser, ...globals.node },
         parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      },
      settings: { 'import/resolver': { typescript: { project: tsProjects, alwaysTryTypes: true, noWarnOnMultipleProjects: true }, node: true } },
      plugins: { 'unused-imports': unusedImports, prettier: prettierPlugin, security },
      rules: commonRules,
   },

   {
      files: ['apps/frontend/src/**/*.{ts,tsx}'],
      extends: [react.configs.flat.recommended, react.configs.flat['jsx-runtime'], reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
      settings: { react: { version: 'detect' } },
      rules: { 'react/react-in-jsx-scope': 'off', 'react/jsx-no-useless-fragment': 'off', 'react-refresh/only-export-components': 'off' },
   },

   {
      files: ['*.js'],
      extends: [js.configs.recommended, prettierConfig, importPlugin.flatConfigs.recommended],
      languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.node } },
      plugins: { prettier: prettierPlugin, 'unused-imports': unusedImports, security },
      settings: { 'import/resolver': { typescript: { project: tsProjects, alwaysTryTypes: true, noWarnOnMultipleProjects: true }, node: true } },
      rules: {
         'prettier/prettier': 'warn',
         'unused-imports/no-unused-imports': 'warn',
         'import/order': 'warn',
         'security/detect-non-literal-regexp': 'error',
      },
   },
]);
