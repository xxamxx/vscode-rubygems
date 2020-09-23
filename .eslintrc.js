module.exports = {
  env: {
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "ecmaFeatures": {
      "impliedStrict": true
    },
    "project": "tsconfig.eslint.json"
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'airbnb-typescript',
  ],
  rules: {
    indent: [
      "error",
      2,
      {
        "SwitchCase": 1,
        "VariableDeclarator": "first",
        "FunctionDeclaration": {
          "body": 1,
          "parameters": "first"
        },
        "FunctionExpression": {
          "body": 1,
          "parameters": "first"
        },
        "CallExpression": {
          "arguments": "first"
        },
        "ArrayExpression": "first",
        "ObjectExpression": "first",
        "ImportDeclaration": "first",
        "flatTernaryExpressions": false
      }
    ],
    "@typescript-eslint/no-namespace": "off",
  }
};