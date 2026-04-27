import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  pluginJs.configs.recommended,
  pluginReactConfig,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.jest, ...globals.node }
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      "react/prop-types": "off",
      "no-unused-vars": "off",
      "react/display-name": "off",
      "no-undef": "off"
    }
  }
];
