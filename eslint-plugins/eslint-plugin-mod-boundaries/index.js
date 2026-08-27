/** @import * as eslint from 'eslint'; */
import { enforceModBoundariesRule } from "./rules/enforce-mod-boundaries.js";

/** @type {eslint.ESLint.Plugin} */
export const eslintPluginModBoundaries = {
  meta: {
    name: "eslint-plugin-mod-boundaries",
    version: "1.0.0",
  },
  configs: {},
  rules: {
    "enforce-mod-boundaries": enforceModBoundariesRule,
  },
};

/** @type {eslint.Linter.Config} */
const recommendedConfig = {
  files: ["{src,app}/**/*.{js,ts,jsx,tsx}"],
  ignores: ["**/*test*/**", "**/*.{spec,test}.{js,ts,jsx,tsx}"],
  plugins: {
    "mod-boundaries": eslintPluginModBoundaries,
  },
  rules: {
    "mod-boundaries/enforce-mod-boundaries": "error",
  },
};

Object.assign(eslintPluginModBoundaries.configs, {
  recommended: recommendedConfig,
  all: recommendedConfig,
});

export default eslintPluginModBoundaries;
