import * as HashSetNamespace from "./hashset.ts";

/**
 * Re-export the clean interface type for HashSet.
 */
export type HashSet<T> = HashSetNamespace.HashSet<T>;

/**
 * Static companion methods for HashSet.
 * Merges seamlessly with the `HashSet` type declaration.
 */
export const HashSet = {
  from: HashSetNamespace.from,
} as const;
