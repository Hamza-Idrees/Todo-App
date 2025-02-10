// eslint.config.mjs
const prettierConfig = require("eslint-config-prettier");

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
    },
    env: {
      node: true,
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      "prettier/prettier": "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-unused-vars": "warn",
      indent: ["error", 2],
    },
  },
  prettierConfig,
];
