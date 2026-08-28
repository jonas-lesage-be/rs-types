import { defineConfig } from "oxlint";

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
  plugins: ["oxc", "promise", "vitest"],
  rules: {
    // JavaScript //
    "object-shorthand": "error",
    "prefer-const": "error",
  },
});
