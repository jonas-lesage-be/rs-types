/** @import * as eslint from 'eslint'; */
import { existsSync } from "node:fs";
import path from "node:path";
import { resolveAlias } from "../utils/deno.js";

/** @type {string[]} */
const MOD_FILE_CANDIDATES = ["mod.ts", "mod.js"];

/**
 * @typedef {object} BoundaryInfo
 * @property {number} commonDepth - Number of shared directory segments from the root.
 * @property {number} currentDepthFromSplit - Distance from common ancestor to current folder.
 * @property {number} targetDepthFromSplit - Distance from common ancestor to target folder.
 * @property {boolean} isSiblingFolder - True if folders sit side-by-side under the same parent.
 * @property {boolean} isCurrentAtCommonAncestor - True if current folder is the common parent itself.
 */

/**
 * Picks whichever barrel file actually exists in a directory ("mod.ts" or "mod.js"),
 * falling back to a normalized default (.ts or .js) based on the environment.
 * @param {string} dirAbsolute - Absolute path to the directory being inspected.
 * @param {string} [fileExt] - The file extension of the current file.
 * @returns {string} - The resolved mod filename.
 */
function resolveModFileName(dirAbsolute, fileExt = ".ts") {
  for (const candidate of MOD_FILE_CANDIDATES) {
    if (existsSync(path.join(dirAbsolute, candidate))) {
      return candidate;
    }
  }
  // Normaliseer extensies: voorkom dat mod.tsx of mod.jsx wordt gegenereerd
  const fallbackExt = fileExt.includes("js") ? ".js" : ".ts";
  return `mod${fallbackExt}`;
}

/**
 * Checks if a given file path points to a valid mod file.
 * @param {string} filePath - Path to the file being checked.
 * @returns {boolean} - True if the path ends with a valid candidate name.
 */
function isModFile(filePath) {
  return MOD_FILE_CANDIDATES.some((name) => filePath.endsWith(name));
}

/**
 * Resolves an import specifier to an absolute path, whether relative or aliased.
 * @param {string} importSource - The literal import path string from the source code.
 * @param {string} currentDirAbsolute - Absolute directory path of the importing file.
 * @param {string} rootDir - Root directory of the project.
 * @param {string|null} alias - The path alias prefix configuration or null.
 * @param {string|null} aliasTarget - The real target path of the alias or null.
 * @returns {string} - The fully resolved absolute target path.
 */
function resolveImportTarget(importSource, currentDirAbsolute, rootDir, alias, aliasTarget) {
  if (alias && aliasTarget && importSource.startsWith(alias)) {
    const relativeFromAlias = importSource.slice(alias.length);
    return path.resolve(rootDir, aliasTarget, relativeFromAlias);
  }
  return path.resolve(currentDirAbsolute, importSource);
}

/**
 * Describes how the current file directory and the target directory relate.
 * @param {string} currentDirAbsolute - Absolute path of the importing directory.
 * @param {string} targetDirAbsolute - Absolute path of the target directory.
 * @returns {BoundaryInfo} - Metrics describing the structural relationship.
 */
function getBoundaryInfo(currentDirAbsolute, targetDirAbsolute) {
  const currentSegments = currentDirAbsolute.split(path.sep);
  const targetSegments = targetDirAbsolute.split(path.sep);

  let commonDepth = 0;
  while (
    commonDepth < currentSegments.length &&
    commonDepth < targetSegments.length &&
    currentSegments[commonDepth] === targetSegments[commonDepth]
  ) {
    commonDepth++;
  }

  const currentDepthFromSplit = currentSegments.length - commonDepth;
  const targetDepthFromSplit = targetSegments.length - commonDepth;

  return {
    commonDepth,
    currentDepthFromSplit,
    targetDepthFromSplit,
    isSiblingFolder: currentDepthFromSplit === 1 && targetDepthFromSplit === 1,
    isCurrentAtCommonAncestor: currentDepthFromSplit === 0,
  };
}

/**
 * Figures out which directory mod file an import should go through.
 *
 * - If the importing file sits at the common ancestor itself
 * (e.g., a root-level file like app.tsx), it always goes through that ancestor's
 * own mod file, never a nested module's boundary.
 * - If current and target are direct sibling folders,
 * cross via the target sibling mod file.
 * - Otherwise, bottleneck through the first-level boundary
 * below the common ancestor on the target's side.
 * @param {BoundaryInfo} boundary - Structural boundary metrics.
 * @param {string} currentDirAbs - Absolute path of the current directory.
 * @param {string} targetDirAbs - Absolute path of the target directory.
 * @returns {string} - The absolute directory path where the mod file should be located.
 */
function determineExpectedDir(boundary, currentDirAbs, targetDirAbs) {
  if (boundary.isCurrentAtCommonAncestor) return currentDirAbs;
  if (boundary.isSiblingFolder) return targetDirAbs;

  const targetSegments = targetDirAbs.split(path.sep);
  return targetSegments.slice(0, boundary.commonDepth + 1).join(path.sep);
}

/**
 * Builds the corrected import specifier (aliased or relative) for the fix.
 * @param {string} expectedTargetAbsolute - The absolute path of the correct target mod file.
 * @param {string} currentDirAbsolute - Absolute path of the current directory.
 * @param {string} rootDir - Root directory of the project.
 * @param {string|null} alias - The path alias prefix configuration or null.
 * @param {string|null} aliasTarget - The real target path of the alias or null.
 * @returns {string} - The formatted fixed import specifier ready for code insertion.
 */
function buildFixedImportString(
  expectedTargetAbsolute,
  currentDirAbsolute,
  rootDir,
  alias,
  aliasTarget,
) {
  if (alias && aliasTarget) {
    const absoluteAliasRoot = path.resolve(rootDir, aliasTarget);
    const relativeFromAliasRoot = path.relative(absoluteAliasRoot, expectedTargetAbsolute);
    return `${alias}${relativeFromAliasRoot}`.replaceAll("\\", "/");
  }

  const relativeFix = path
    .relative(currentDirAbsolute, expectedTargetAbsolute)
    .replaceAll("\\", "/");
  return relativeFix.startsWith(".") ? relativeFix : `./${relativeFix}`;
}

/**
 * Detects the specific quote token used in the original import declaration node.
 * @param {eslint.Rule.Node} node - The AST node of the ImportDeclaration.
 * @returns {string} - The quote character detected ("'", '"', or "`").
 */
function getQuoteToken(node) {
  const rawText = node.source.raw?.trim() || "";
  return ["`", "'", '"'].includes(rawText[0]) ? rawText[0] : '"';
}

/**
 * Returns a function that wraps strings inside the original code's quote style.
 * @param {eslint.Rule.Node} node - The AST node of the ImportDeclaration.
 * @returns {(str: string) => string} - A function that takes a string and wraps it in quotes.
 */
function getQuoteFn(node) {
  const quoteToken = getQuoteToken(node);
  return (str) => `${quoteToken}${str}${quoteToken}`;
}

/** @type {eslint.Rule.RuleModule} */
export const enforceModBoundariesRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce strictly bounded mod.ts/mod.js imports across layered architectures.",
    },
    fixable: "code",
    schema: [],
    messages: {
      violatesBoundary:
        'Layered boundaries must be imported via {{ modFileName }}. Expected: "{{ fixed }}"',
    },
  },
  create(context) {
    const { alias, aliasTarget } = resolveAlias(context);
    const rootDir = context.cwd;
    const currentDirAbs = path.dirname(path.resolve(rootDir, context.filename));
    const fileExt = path.extname(context.filename);

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        if (typeof importSource !== "string") return;

        const usedAlias = alias ? importSource.startsWith(alias) : false;
        const isRelative = importSource.startsWith(".");
        if (!isRelative && !usedAlias) return;

        const targetAbs = resolveImportTarget(
          importSource,
          currentDirAbs,
          rootDir,
          alias,
          aliasTarget,
        );
        const targetDirAbs = path.dirname(targetAbs);
        if (currentDirAbs === targetDirAbs) return;

        const boundary = getBoundaryInfo(currentDirAbs, targetDirAbs);
        const expectedDir = determineExpectedDir(boundary, currentDirAbs, targetDirAbs);
        const modFileName = resolveModFileName(expectedDir, fileExt);
        const expectedTargetAbs = path.join(expectedDir, modFileName);

        if (usedAlias && targetAbs === expectedTargetAbs && isModFile(targetAbs)) {
          return;
        }

        const fixed = buildFixedImportString(
          expectedTargetAbs,
          currentDirAbs,
          rootDir,
          alias,
          aliasTarget,
        );
        const quoteFn = getQuoteFn(node);

        context.report({
          node,
          messageId: "violatesBoundary",
          data: { modFileName, fixed },
          fix: (fixer) => fixer.replaceText(node.source, quoteFn(fixed)),
        });
      },
    };
  },
};
