/** @import * as eslint from 'eslint'; */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * @typedef {Record<string, string>} DenoImports
 * @typedef {object} DenoConfig
 * @property {DenoImports} [imports] The imports map from deno.json.
 */

/** @type {DenoImports|null} */
let cachedDenoConfig = null;
let denoConfigAttempted = false;

/**
 * Reads and caches the imports map from the deno.json file.
 * @param {string} cwd - The current working directory.
 * @returns {DenoImports|null} The configured Deno imports, or null if not found or invalid.
 */
function getDenoImports(cwd) {
  if (denoConfigAttempted) return cachedDenoConfig;
  denoConfigAttempted = true;

  const denoJsonPath = path.join(cwd, "deno.json");
  try {
    if (existsSync(denoJsonPath)) {
      const content = readFileSync(denoJsonPath, "utf8");
      /** @type {DenoConfig} */
      const parsed = JSON.parse(content);
      cachedDenoConfig = parsed.imports || null;
    }
  } catch {
    cachedDenoConfig = null;
  }

  return cachedDenoConfig;
}

/**
 * @typedef {object} ModBoundariesSettings
 * @property {string} [alias] - The path alias prefix configuration. E.g., "@/".
 * @property {string} [aliasPath] - The actual target directory path that the alias resolves to.
 * @typedef {object} ContextSettings
 * @property {ModBoundariesSettings} [modBoundaries] Custom boundaries settings for the ESLint plugin.
 * @typedef {eslint.Rule.RuleContext & { settings?: ContextSettings }} ResolveContext
 */

/**
 * Resolves the configured alias, falling back to deno.json import "@/".
 * @param {ResolveContext} context - The plugin context object.
 * @returns {{ alias: string|null, aliasTarget: string|null }} The resolved alias and its target path.
 */
export function resolveAlias(context) {
  const settings = context.settings?.modBoundaries || {};
  let alias = settings.alias || null;
  let aliasTarget = settings.aliasPath || null;

  if (!alias || !aliasTarget) {
    const denoImports = getDenoImports(context.cwd);
    if (denoImports?.["@/"]) {
      alias = "@/";
      aliasTarget = denoImports["@/"];
    }
  }

  return { alias, aliasTarget };
}
