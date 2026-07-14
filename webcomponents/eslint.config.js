import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      sourceType: 'module'
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier
);
