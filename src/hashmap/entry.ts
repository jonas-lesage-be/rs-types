import { Result } from "@/result/mod.ts";

import type { HashMap } from "./hashmap.ts";

/**
 * A view into a single entry in a map, which may either be vacant or occupied.
 * Mimics Rust's `Entry` enum via a TypeScript discriminated union.
 */
export type Entry<K, V> = OccupiedEntry<K, V> | VacantEntry<K, V>;

/**
 * A view into an occupied entry in a `HashMap`.
 * It is part of the `Entry` union type.
 */
export class OccupiedEntry<K, V> {
  readonly type = "Occupied" as const;

  constructor(
    private readonly map: HashMap<K, V>,
    private readonly innerKey: K,
    private innerValue: V,
  ) {}

  /**
   * Gets a reference to the key in the entry.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.key()); // "poneyland"
   * }
   * ```
   */
  key(): K {
    return this.innerKey;
  }

  /**
   * Gets a reference to the value in the entry.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.get()); // 12
   * }
   * ```
   */
  get(): V {
    return this.innerValue;
  }

  /**
   * Takes the ownership of the key and value from the map, removing the entry.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     const [key, value] = entry.removeEntry();
   *     console.log(key);   // "poneyland"
   *     console.log(value); // 12
   * }
   *
   * console.log(map.containsKey("poneyland")); // false
   * ```
   */
  removeEntry(): [K, V] {
    this.map["internalMap"].delete(this.innerKey);
    return [this.innerKey, this.innerValue];
  }

  /**
   * Sets the value of the entry, and returns the entry's old value.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.insert(15)); // 12
   * }
   *
   * console.log(map.get("poneyland").unwrap()); // 15
   * ```
   */
  insert(value: V): V {
    const old = this.innerValue;
    this.innerValue = value;
    this.map["internalMap"].set(this.innerKey, value);
    return old;
  }

  /**
   * Takes the value out of the entry, and returns it, removing it from the map.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.remove()); // 12
   * }
   *
   * console.log(map.containsKey("poneyland")); // false
   * ```
   */
  remove(): V {
    this.map["internalMap"].delete(this.innerKey);
    return this.innerValue;
  }

  /**
   * Ensures a value is in the entry by inserting the default if empty,
   * and returns a reference to the value in the entry.
   *
   * For an `OccupiedEntry`, this is a no-op that simply returns the existing value.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.orInsert(24)); // 12
   * }
   * ```
   */
  orInsert(_defaultVal: V): V {
    return this.innerValue;
  }

  /**
   * Returns the value of the occupied entry.
   *
   * For an `OccupiedEntry`, `orInsertWith` is a no-op that returns the existing value,
   * ignoring the default value function closure.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.orInsertWith(() => 24)); // 12
   * }
   * ```
   */
  orInsertWith(_defaultFn: () => V): V {
    return this.innerValue;
  }

  /**
   * Returns the value of the occupied entry.
   *
   * For an `OccupiedEntry`, `orInsertWithKey` is a no-op that returns the existing value,
   * ignoring the default value function closure.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.orInsertWithKey((key) => key.length)); // 12
   * }
   * ```
   */
  orInsertWithKey(_defaultFn: (key: K) => V): V {
    return this.innerValue;
  }

  /**
   * Returns the value of the occupied entry wrapped in `Ok`.
   *
   * For an `OccupiedEntry`, `orTryInsertWith` is a no-op that returns `Ok(value)`,
   * ignoring the fallible default value function closure.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     const res = entry.orTryInsertWith(() => Ok(24));
   *     console.log(res.unwrap()); // 12
   * }
   * ```
   */
  orTryInsertWith<E>(_defaultFn: () => Result<V, E>): Result<V, E> {
    return Result.Ok(this.innerValue);
  }

  /**
   * Returns the value of the occupied entry wrapped in `Ok`.
   *
   * For an `OccupiedEntry`, `orTryInsertWithKey` is a no-op that returns `Ok(value)`,
   * ignoring the fallible default value function closure.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     const res = entry.orTryInsertWithKey((key) => Ok(key.length));
   *     console.log(res.unwrap()); // 12
   * }
   * ```
   */
  orTryInsertWithKey<E>(_defaultFn: (key: K) => Result<V, E>): Result<V, E> {
    return Result.Ok(this.innerValue);
  }

  /**
   * Returns the value of the occupied entry.
   *
   * For an `OccupiedEntry`, `orDefault` is a no-op that returns the existing value,
   * ignoring the default constructor or factory closure.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * map.insert("poneyland", 12);
   *
   * if (map.entry("poneyland").type === "Occupied") {
   *     const entry = map.entry("poneyland") as OccupiedEntry<string, number>;
   *     console.log(entry.orDefault(() => 0)); // 12
   * }
   * ```
   */
  orDefault(_ctor: (new () => V) | (() => V)): V {
    return this.innerValue;
  }

  /**
   * Provides in-place mutable access to an occupied entry before any potential inserts.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   *
   * map.entry("poneyland")
   *    .andModify((e) => e + 1)
   *    .orInsert(42);
   * console.log(map.get("poneyland").unwrap()); // 42
   *
   * map.entry("poneyland")
   *    .andModify((e) => e + 1)
   *    .orInsert(42);
   * console.log(map.get("poneyland").unwrap()); // 43
   * ```
   */
  andModify(f: (val: V) => V): this {
    this.innerValue = f(this.innerValue);
    this.map["internalMap"].set(this.innerKey, this.innerValue);
    return this;
  }

  /**
   * Sets the value of the entry, and returns the modified `OccupiedEntry`.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, String>();
   * const entry = map.entry("poneyland").insertEntry("hoho");
   *
   * console.log(entry.key()); // "poneyland"
   * console.log(entry.get()); // "hoho"
   * ```
   */
  insertEntry(value: V): this {
    this.innerValue = value;
    this.map["internalMap"].set(this.innerKey, value);
    return this;
  }
}

export class VacantEntry<K, V> {
  readonly type = "Vacant" as const;

  constructor(
    private readonly map: HashMap<K, V>,
    private readonly innerKey: K,
  ) {}

  /**
   * Gets a reference to the key that would be used
   * when inserting a value through the `VacantEntry`.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, number>;
   *     console.log(entry.key()); // "poneyland"
   * }
   * ```
   */
  key(): K {
    return this.innerKey;
  }

  /**
   * Ensures a value is in the entry by inserting the default value if empty,
   * and returns a reference to the value in the entry.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, number>;
   *     console.log(entry.orInsert(3)); // 3
   * }
   * console.log(map.get("poneyland").unwrap()); // 3
   * ```
   */
  orInsert(defaultVal: V): V {
    const map = this.map["internalMap"];
    if (map.has(this.innerKey)) return map.get(this.innerKey) as V;

    map.set(this.innerKey, defaultVal);
    return defaultVal;
  }

  /**
   * Ensures a value is in the entry by inserting the result of the default function if empty,
   * and returns a reference to the value in the entry.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, string>();
   * const value = "hoho";
   *
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, string>;
   *     console.log(entry.orInsertWith(() => value)); // "hoho"
   * }
   * ```
   */
  orInsertWith(defaultFn: () => V): V {
    const map = this.map["internalMap"];
    if (map.has(this.innerKey)) return map.get(this.innerKey) as V;

    const computed = defaultFn();
    map.set(this.innerKey, computed);
    return computed;
  }

  /**
   * Ensures a value is in the entry by inserting the result of the default function if empty,
   * providing the function with a reference to the key.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   *
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, number>;
   *     console.log(entry.orInsertWithKey((key) => key.length)); // 9
   * }
   * ```
   */
  orInsertWithKey(defaultFn: (key: K) => V): V {
    const map = this.map["internalMap"];
    if (map.has(this.innerKey)) return map.get(this.innerKey) as V;

    const computed = defaultFn(this.innerKey);
    map.set(this.innerKey, computed);
    return computed;
  }

  /**
   * Ensures a value is in the entry by inserting the result of a fallible default function,
   * returning the inserted value wrapped in `Ok` or forwarding the error wrapper.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   *
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, number>;
   *     const res = entry.orTryInsertWith(() => Ok(42));
   *     console.log(res.unwrap()); // 42
   * }
   * ```
   */
  orTryInsertWith<E>(defaultFn: () => Result<V, E>): Result<V, E> {
    const map = this.map["internalMap"];
    if (map.has(this.innerKey)) return Result.Ok(map.get(this.innerKey) as V);

    const res = defaultFn();
    return res.match({
      Ok: (val) => {
        map.set(this.innerKey, val);
        return Result.Ok(val);
      },
      Err: (err) => Result.Err(err),
    });
  }

  /**
   * Ensures a value is in the entry by inserting the result of a fallible default function,
   * providing the function with a reference to the key.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   *
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, number>;
   *     const res = entry.orTryInsertWithKey((key) => Ok(key.length));
   *     console.log(res.unwrap()); // 9
   * }
   * ```
   */
  orTryInsertWithKey<E>(defaultFn: (key: K) => Result<V, E>): Result<V, E> {
    const map = this.map["internalMap"];
    if (map.has(this.innerKey)) return Result.Ok(map.get(this.innerKey) as V);

    const res = defaultFn(this.innerKey);
    return res.match({
      Ok: (val) => {
        map.set(this.innerKey, val);
        return Result.Ok(val);
      },
      Err: (err) => Result.Err(err),
    });
  }

  /**
   * Ensures a value is in the entry by inserting the default constructor
   * or factory value if empty, and returns a reference to it.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, string>();
   *
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, string>;
   *     console.log(entry.orDefault(String)); // ""
   * }
   * ```
   */
  orDefault(ctor: (new () => V) | (() => V)): V {
    const map = this.map["internalMap"];
    if (map.has(this.innerKey)) return map.get(this.innerKey) as V;

    const val =
      typeof ctor === "function" && "prototype" in ctor
        ? new (ctor as new () => V)()
        : (ctor as () => V)();
    map.set(this.innerKey, val);
    return val;
  }

  /**
   * Sets the value of the entry with the `VacantEntry`'s key,
   * and returns a reference to it.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * if (map.entry("poneyland").type === "Vacant") {
   *     const entry = map.entry("poneyland") as VacantEntry<string, number>;
   *     entry.insert(37);
   * }
   * console.log(map.get("poneyland").unwrap()); // 37
   * ```
   */
  insert(value: V): V {
    this.map["internalMap"].set(this.innerKey, value);
    return value;
  }

  /**
   * Sets the value of the entry with the `VacantEntry`'s key,
   * and returns an `OccupiedEntry` view for further chaining.
   *
   * # Examples
   *
   * ```typescript
   * const map = new HashMap<string, number>();
   * if (map.entry("poneyland").type === "Vacant") {
   *     const vacant = map.entry("poneyland") as VacantEntry<string, number>;
   *     const occupied = vacant.insertEntry(37);
   *     console.log(occupied.get()); // 37
   * }
   * ```
   */
  insertEntry(value: V): OccupiedEntry<K, V> {
    this.map["internalMap"].set(this.innerKey, value);
    return new OccupiedEntry(this.map, this.innerKey, value);
  }

  /**
   * Provides a no-op fallback for fluent API parity with `OccupiedEntry`.
   *
   * For a `VacantEntry`, this method does nothing and immediately returns `this`.
   */
  andModify(_f: (val: V) => V): this {
    return this;
  }
}
