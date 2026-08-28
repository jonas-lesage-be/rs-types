import e18ePlugin from "@e18e/eslint-plugin";
import jsPlugin from "@eslint/js";
import jsonPlugin from "@eslint/json";
import markdownPlugin from "@eslint/markdown";
import eslintConfigPrettier from "eslint-config-prettier";
import modBoundariesPlugin from "eslint-plugin-mod-boundaries";
import oxlintPlugin from "eslint-plugin-oxlint";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import sonarjsPlugin from "eslint-plugin-sonarjs";
import unicornPlugin from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tsPlugin from "typescript-eslint";

const jsAndTsConfig = [
  jsPlugin.configs.recommended,
  {
    plugins: {
      perfectionist: perfectionistPlugin,
      e18e: e18ePlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "e18e/prefer-timer-args": "error",
      "e18e/prefer-static-regex": "error",
      "e18e/prefer-get-or-insert": "error",

      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
          groups: [
            // Built-in modules (e.g., node:fs, node:path)
            "builtin",
            // Third-party packages (e.g., react, vite)
            "external",
            // Absolute path aliases (@/, ~/) or subpath imports (e.g., #utils/).
            ["internal", "subpath"],
            // Relative imports (e.g. ../utils/deno.js, ./utils.ts, ./index).
            ["parent", "sibling", "index"],
            // Style imports.
            "style",
            // Anything that didn't match above.
            "unknown",
          ],
        },
      ],
      "perfectionist/sort-named-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
        },
      ],
    },
  },
  sonarjsPlugin.configs.recommended,
  {
    rules: {
      "sonarjs/no-unused-vars": "off",
    },
  },
  unicornPlugin.configs.recommended,
  {
    rules: {
      "unicorn/consistent-boolean-name": [
        "error",
        {
          ignore: ["^(_)?predicate$"],
        },
      ],
      "unicorn/name-replacements": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-non-function-verb-prefix": "off",
      "unicorn/no-null": "off",
    },
  },
  modBoundariesPlugin.configs.recommended,
  eslintConfigPrettier,
  ...oxlintPlugin.buildFromOxlintConfigFile("./oxlint.config.ts"),
  oxlintPlugin.configs["flat/recommended"],
];

export default defineConfig([
  {
    ignores: ["**/*", "!*.*", "!src/**"],
  },
  {
    files: ["./*.{js,ts}", "./src/**/*.{js,ts,jsx,tsx}"],
    extends: jsAndTsConfig,
  },
  {
    files: ["./*.ts", "./src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [...tsPlugin.configs.strict, ...tsPlugin.configs.stylistic],
  },
  {
    files: ["./*.json", "./src/**/*.json"],
    language: "json/json",
    plugins: {
      e18e: e18ePlugin,
    },
    extends: [jsonPlugin.configs.recommended],
    rules: {
      "e18e/ban-dependencies": "error",
    },
  },
  {
    files: ["./*.md", "./src/**/*.md"],
    language: "markdown/commonmark",
    extends: [markdownPlugin.configs.recommended],
  },
]);
