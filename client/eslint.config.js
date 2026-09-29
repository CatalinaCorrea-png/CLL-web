import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '19.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Configurador 3D:
    // - en React Three Fiber, props como position, args o intensity son válidas en los
    //   elementos de three, pero no-unknown-property solo conoce atributos del DOM.
    // - las props se tipan con JSDoc y se chequean con checkJs (jsconfig.json, `npm run tipos`),
    //   así que prop-types sobra.
    files: ['src/configurador/**/*.{js,jsx}'],
    rules: {
      'react/no-unknown-property': 'off',
      'react/prop-types': 'off',
    },
  },
]
