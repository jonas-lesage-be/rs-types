import { defineConfig } from "oxlint";

const promiseRecommendedRules = {
  "promise/always-return": "error",
  "promise/avoid-new": "off",
  "promise/catch-or-return": "error",
  "promise/no-callback-in-promise": "warn",
  "promise/no-nesting": "warn",
  "promise/no-new-statics": "error",
  "promise/no-promise-in-callback": "warn",
  "promise/no-return-in-finally": "warn",
  "promise/no-return-wrap": "error",
  "promise/param-names": "error",
  "promise/valid-params": "warn",
} as const;

export default defineConfig({
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
    pedantic: "off",
    restriction: "off",
    style: "off",
    nursery: "off",
  },
  plugins: ["promise"],
  rules: {
    // JavaScript //
    "object-shorthand": "error",
    "prefer-const": "error",
    // General //
    ...promiseRecommendedRules,
  },
});
