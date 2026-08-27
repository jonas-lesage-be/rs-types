import eslintPlugin from "eslint-plugin-eslint-plugin";
import jsdocPlugin from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

const jsdocConfig = [
  jsdocPlugin.configs["flat/recommended"],
  {
    rules: {
      "jsdoc/check-indentation": "warn",
      "jsdoc/check-line-alignment": "warn",
      "jsdoc/check-syntax": "warn",
      "jsdoc/check-template-names": "warn",
      "jsdoc/imports-as-dependencies": "warn",
      "jsdoc/informative-docs": "warn",
      "jsdoc/lines-before-block": "warn",
      "jsdoc/match-description": "warn",
      "jsdoc/match-name": [
        "warn",
        {
          match: [
            {
              tags: ["param", "property"],
              allowName: "^[a-z$_][a-zA-Z0-9$_]*$",
              message:
                "JSDoc token names must be written in strict camelCase (e.g., 'myVariable').",
            },
          ],
        },
      ],
      "jsdoc/no-bad-blocks": "warn",
      "jsdoc/no-blank-block-descriptions": "warn",
      "jsdoc/no-blank-blocks": "warn",
      "jsdoc/normalize-see-links": "warn",
      "jsdoc/prefer-import-tag": "warn",
      "jsdoc/require-asterisk-prefix": "warn",
      "jsdoc/require-description": "warn",
      "jsdoc/require-description-complete-sentence": "warn",
      "jsdoc/require-hyphen-before-param-description": ["warn", "always"],
      "jsdoc/require-template": "warn",
      "jsdoc/require-throws": "warn",
      "jsdoc/require-yields-description": "warn",
      "jsdoc/ts-method-signature-style": "warn",
      "jsdoc/ts-no-unnecessary-template-expression": "warn",
      "jsdoc/ts-prefer-function-type": "warn",
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "jsdoc/no-types": "off",
      "jsdoc/require-param-type": "warn",
      "jsdoc/require-returns-type": "warn",
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "jsdoc/no-types": "warn",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
    },
  },
];

export default defineConfig([eslintPlugin.configs.recommended, ...jsdocConfig]);
