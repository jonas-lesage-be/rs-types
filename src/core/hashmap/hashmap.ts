import { Entry, OccupiedEntry, VacantEntry } from "@/core/hashmap/entry.ts";
import { Option, Result } from "@/core/mod.ts";

/**
 * A Hash Map implementation wrapping the native JavaScript Map,
 * providing strict Rust-style structural signatures and a robust Entry API.
 */
export class HashMap<K, V> implements Iterable<[K, V]> {
  private readonly internalMap = new Map<K, V>();

  /**
   * Returns the number of elements in the map.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * console.log(map.size); // 0
   * map.insert(1, "a");
   * console.log(map.size); // 1
   * ```
   */
  get size(): number {
    return this.internalMap.size;
  }

  /**
   * An iterator visiting all keys in arbitrary order.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("a", 1);
   * map.insert("b", 2);
   *
   * for (const key of map.keys()) {
   *     console.log(key); // Prints: "a", "b"
   * }
   * ```
   */
  *keys(): Generator<K, void, unknown> {
    yield* this.internalMap.keys();
  }

  /**
   * An iterator visiting all values in arbitrary order.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("a", 1);
   * map.insert("b", 2);
   *
   * for (const val of map.values()) {
   *     console.log(val); // Prints: 1, 2
   * }
   * ```
   */
  *values(): Generator<V, void, unknown> {
    yield* this.internalMap.values();
  }

  /**
   * Returns `true` if the map contains no elements.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * console.log(map.isEmpty()); // true
   * map.insert(1, "a");
   * console.log(map.isEmpty()); // false
   * ```
   */
  isEmpty(): boolean {
    return this.internalMap.size === 0;
  }

  /**
   * Clears the map, returning all key-value pairs as a consuming iterator.
   * Keeps the allocated internal memory structure for future reuse.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * map.insert(1, "a");
   * map.insert(2, "b");
   *
   * for (const [k, v] of map.drain()) {
   *     console.log(`${k}: ${v}`); // Yields pairs, map is being emptied
   * }
   *
   * console.log(map.isEmpty()); // true
   * ```
   */
  *drain(): Generator<[K, V], void, unknown> {
    const entries = this.internalMap.entries().toArray();
    this.internalMap.clear();
    yield* entries;
  }

  /**
   * Creates an iterator which uses a closure to determine if an element
   * (key-value pair) should be removed.
   *
   * If the closure returns `true`, the element is removed from the map and yielded.
   * If the closure returns `false`, the element remains in the map.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, number>();
   * for (let i = 0; i < 8; i++) map.insert(i, i * 10);
   *
   * // Extract even keys out into an iterator, leaving odds behind
   * const extracted = [...map.extractIf((k, _v) => k % 2 === 0)];
   *
   * console.log(map.size); // 4 (only odd keys remain)
   * ```
   */
  *extractIf(predicate: (key: K, val: V) => boolean): Generator<[K, V], void, unknown> {
    for (const [k, v] of this.internalMap.entries()) {
      if (!predicate(k, v)) continue;
      this.internalMap.delete(k);
      yield [k, v];
    }
  }

  /**
   * Retains only the elements specified by the predicate.
   *
   * In other words, removes all pairs `(k, v)` for which `predicate(k, v)` returns `false`.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, number>();
   * for (let i = 0; i < 8; i++) map.insert(i, i * 10);
   *
   * map.retain((k, _v) => k % 2 === 0);
   * console.log(map.size); // 4 (only even keys retained)
   * ```
   */
  retain(predicate: (key: K, val: V) => boolean): void {
    for (const [k, v] of this.internalMap.entries()) {
      if (!predicate(k, v)) this.internalMap.delete(k);
    }
  }

  /**
   * Clears the map, removing all key-value pairs.
   * Keeps the allocated internal memory structure for reuse.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * map.insert(1, "a");
   * map.clear();
   * console.log(map.isEmpty()); // true
   * ```
   */
  clear(): void {
    this.internalMap.clear();
  }

  /**
   * Gets the given key's corresponding entry in the map for in-place manipulation.
   *
   * # Examples
   *
   * ```typescript
   * const letters = new HashMap<string, number>();
   *
   * for (const ch of "a short text") {
   *     letters.entry(ch).andModify((counter) => counter + 1).orInsert(1);
   * }
   *
   * console.log(letters.get("s").unwrap()); // 1
   * console.log(letters.get("t").unwrap()); // 2
   * ```
   */
  entry(key: K): Entry<K, V> {
    return this.internalMap.has(key)
      ? new OccupiedEntry(this, key, this.internalMap.get(key) as V)
      : new VacantEntry(this, key);
  }

  /**
   * Returns a reference to the value corresponding to the key wrapped in an `Option`.
   *
   * Returns `Some(value)` if the key exists, or `None` if it does not.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * map.insert(1, "a");
   *
   * console.log(map.get(1).unwrap()); // "a"
   * console.log(map.get(2).isNone);   // true
   * ```
   */
  get(key: K): Option<V> {
    return this.internalMap.has(key) ? Option.Some(this.internalMap.get(key) as V) : Option.None();
  }

  /**
   * Returns `true` if the map contains a value for the specified key.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * map.insert(1, "a");
   * console.log(map.containsKey(1)); // true
   * console.log(map.containsKey(2)); // false
   * ```
   */
  containsKey(key: K): boolean {
    return this.internalMap.has(key);
  }

  /**
   * Inserts a key-value pair into the map.
   *
   * If the map did not have this key present, `None` is returned.
   * If the map did have this key present, the value is updated,
   * and the old value is returned wrapped in a `Some`.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * console.log(map.insert(37, "a").isNone); // true
   * console.log(map.isEmpty());               // false
   *
   * const old = map.insert(37, "b");
   * console.log(old.unwrap());                // "a"
   * console.log(map.get(37).unwrap());        // "b"
   * ```
   */
  insert(key: K, value: V): Option<V> {
    const old = this.get(key);
    this.internalMap.set(key, value);
    return old;
  }

  /**
   * Tries to insert a key-value pair into the map,
   * and returns a Result containing the newly inserted value.
   *
   * If the map already had this key present, nothing is updated,
   * and an `Err` containing a conflict description string is returned.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * console.log(map.tryInsert(37, "a").unwrap()); // "a"
   *
   * const err = map.tryInsert(37, "b").unwrapErr();
   * console.log(err); // "Key already exists in HashMap"
   * ```
   */
  tryInsert(key: K, value: V): Result<V, string> {
    if (this.internalMap.has(key)) return Result.Err("Key already exists in HashMap");
    this.internalMap.set(key, value);
    return Result.Ok(value);
  }

  /**
   * Removes a key from the map,
   * returning the value at the key wrapped in an `Option`
   * if the key was previously in the map.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * map.insert(1, "a");
   *
   * console.log(map.remove(1).unwrap()); // "a"
   * console.log(map.remove(1).isNone);   // true
   * ```
   */
  remove(key: K): Option<V> {
    const old = this.get(key);
    this.internalMap.delete(key);
    return old;
  }

  /**
   * Removes a key from the map,
   * returning the stored key and value wrapped in an `Option` tuple
   * if the key was previously in the map.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<number, string>();
   * map.insert(1, "a");
   *
   * const entry = map.removeEntry(1).unwrap();
   * console.log(entry[0]); // 1
   * console.log(entry[1]); // "a"
   * ```
   */
  removeEntry(key: K): Option<[K, V]> {
    if (!this.internalMap.has(key)) return Option.None();

    const val = this.internalMap.get(key) as V;
    this.internalMap.delete(key);
    return Option.Some([key, val]);
  }

  /**
   * Native JavaScript iterator protocol support.
   * Allows the HashMap to be used directly in `for...of` loops or with spread operators.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("a", 1);
   *
   * for (const [key, value] of map) {
   *     console.log(`${key}: ${value}`); // "a: 1"
   * }
   * ```
   */
  [Symbol.iterator](): Iterator<[K, V]> {
    return this.internalMap.entries();
  }
}
