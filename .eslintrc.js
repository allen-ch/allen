module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    jquery: true,
    es6: true
  },
  settings: {
    'import/resolver': {
      'node': {
        'extensions': [
          '.js'
        ]
      }
    }
  },
  extends: 'standard',
  plugins: ['import', 'html'],
  globals: {
    '$': true,
    'dataLayer': true,
    'ysf': true,
    'call_client_login': true,
    'CanRunAds': true
  },
  rules: {
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'indent': ['error', 4],
    'semi': ['error', 'always'],
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'no-new': 'off',
    'one-var': 'off',
    'object-curly-spacing': 'off',
    'new-cap': 'off',
    'no-extra-boolean-cast': 2
  },
}
