import * as HashMapNamespace from "./hashmap.ts";
export { type Entry, OccupiedEntry, VacantEntry } from "./entry.ts";

/**
 * Re-export the clean interface type for HashMap.
 */
export type HashMap<K, V> = HashMapNamespace.HashMap<K, V>;

/**
 * Static companion methods for HashMap.
 * Merges seamlessly with the `HashMap` type declaration.
 */
export const HashMap = {
  from: HashMapNamespace.from,
} as const;
