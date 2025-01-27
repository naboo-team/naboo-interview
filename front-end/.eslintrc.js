module.exports = {
  extends: ['../.eslintrc.js', 'next/core-web-vitals'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['.eslintrc.js'],
};
