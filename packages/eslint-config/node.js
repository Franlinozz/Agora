const nPlugin = require('eslint-plugin-n');
const globals = require('globals');
const base = require('./base');

module.exports = [
  ...base,
  {
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      n: nPlugin,
    },
    rules: {
      'n/no-process-exit': 'error',
    },
  },
];
