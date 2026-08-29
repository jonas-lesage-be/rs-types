import { Option } from "@/core/option/mod.ts";

/**
 * A Hash Set implementation wrapping the native JavaScript Set,
 * combining modern high-performance native set operations
 * with strict Rust-style structural signatures.
 */
export class HashSet<T> implements Iterable<T> {
  private readonly internalSet = new Set<T>();

  /**
   * Creates a new, empty `HashSet`, or initializes it with the elements
   * from the provided iterable collection.
   *
   * # Examples
   *
   * ```typescript
   * const set1 = new HashSet<number>();
   *
   * const set2 = new HashSet<number>([1, 2, 2, 3]);
   * console.log(set2.size); // 3 (duplicates are dropped)
   * ```
   */
  constructor(entries?: Iterable<T>) {
    if (entries) for (const val of entries) this.insert(val);
  }

  /**
   * Visits the values representing the intersection,
   * i.e., the values that are both in `this` and `other`.
   *
   * # Examples
   *
   * ```typescript
   * const set1 = new HashSet<number>();
   * set1.insert(1);
   * set1.insert(2);
   *
   * const set2 = new HashSet<number>();
   * set2.insert(2);
   * set2.insert(3);
   *
   * const intersection = set1.intersection(set2);
   * console.log(intersection.contains(2)); // true
   * console.log(intersection.contains(1)); // false
   * ```
   */
  intersection(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>();
    const nativeIntersection = this.internalSet.intersection(other.internalSet);
    for (const val of nativeIntersection) result.insert(val);
    return result;
  }

  /**
   * Visits the values representing the union,
   * i.e., all the values in `this` or `other`, without duplicates.
   *
   * # Examples
   *
   * ```typescript
   * const set1 = new HashSet<number>();
   * set1.insert(1);
   *
   * const set2 = new HashSet<number>();
   * set2.insert(2);
   *
   * const union = set1.union(set2);
   * console.log(union.contains(1)); // true
   * console.log(union.contains(2)); // true
   * ```
   */
  union(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>();
    const nativeUnion = this.internalSet.union(other.internalSet);
    for (const val of nativeUnion) result.insert(val);
    return result;
  }

  /**
   * Visits the values representing the difference,
   * i.e., the values that are in `this` but not in `other`.
   *
   * # Examples
   *
   * ```typescript
   * const set1 = new HashSet<number>();
   * set1.insert(1);
   * set1.insert(2);
   *
   * const set2 = new HashSet<number>();
   * set2.insert(2);
   * set2.insert(3);
   *
   * const difference = set1.difference(set2);
   * console.log(difference.contains(1)); // true
   * console.log(difference.contains(2)); // false
   * ```
   */
  difference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>();
    const nativeDifference = this.internalSet.difference(other.internalSet);
    for (const val of nativeDifference) result.insert(val);
    return result;
  }

  /**
   * Visits the values representing the symmetric difference,
   * i.e., the values that are in `this` or in `other` but not in both.
   *
   * # Examples
   *
   * ```typescript
   * const set1 = new HashSet<number>();
   * set1.insert(1);
   * set1.insert(2);
   *
   * const set2 = new HashSet<number>();
   * set2.insert(2);
   * set2.insert(3);
   *
   * const symmetricDiff = set1.symmetricDifference(set2);
   * console.log(symmetricDiff.contains(1)); // true
   * console.log(symmetricDiff.contains(3)); // true
   * console.log(symmetricDiff.contains(2)); // false
   * ```
   */
  symmetricDifference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>();
    const nativeSymDiff = this.internalSet.symmetricDifference(other.internalSet);
    for (const val of nativeSymDiff) result.insert(val);
    return result;
  }

  /**
   * Returns the number of elements in the set.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * console.log(set.size); // 0
   * set.insert(1);
   * console.log(set.size); // 1
   * ```
   */
  get size(): number {
    return this.internalSet.size;
  }

  /**
   * Returns `true` if the set contains no elements.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * console.log(set.isEmpty()); // true
   * set.insert(1);
   * console.log(set.isEmpty()); // false
   * ```
   */
  isEmpty(): boolean {
    return this.internalSet.size === 0;
  }

  /**
   * Clears the set, returning all elements as a consuming iterator.
   * Keeps the allocated internal memory structure for future reuse.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * set.insert(1);
   * set.insert(2);
   *
   * for (const val of set.drain()) {
   *     console.log(val); // Yields elements, set is being emptied
   * }
   *
   * console.log(set.isEmpty()); // true
   * ```
   */
  *drain(): Generator<T, void, unknown> {
    const values = [...this.internalSet];
    this.internalSet.clear();
    yield* values;
  }

  /**
   * Clears the set, removing all values that satisfy the predicate
   * and yields the removed elements as a consuming iterator.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>([1, 2, 3, 4]);
   *
   * const extracted = [...set.extractIf((v) => v % 2 === 0)];
   * console.log(extracted); // [2, 4]
   * console.log(set.size);  // 2
   * ```
   */
  *extractIf(predicate: (value: T) => boolean): Generator<T, void, unknown> {
    for (const value of this.internalSet.values()) {
      if (!predicate(value)) continue;
      // eslint-disable-next-line unicorn/no-loop-iterable-mutation
      this.internalSet.delete(value);
      yield value;
    }
  }

  /**
   * Retains only the elements specified by the predicate.
   *
   * In other words, removes all elements `e` for which `predicate(e)` returns `false`.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * set.insert(1);
   * set.insert(2);
   * set.insert(3);
   *
   * set.retain((v) => v % 2 !== 0);
   * console.log(set.size); // 2 (only odd numbers retained)
   * ```
   */
  retain(predicate: (value: T) => boolean): void {
    for (const value of this.internalSet) {
      if (!predicate(value)) this.internalSet.delete(value);
    }
  }

  /**
   * Clears the set, removing all values. Keeps the allocated internal
   * memory structure for reuse.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * set.insert(1);
   * set.clear();
   * console.log(set.isEmpty()); // true
   * ```
   */
  clear(): void {
    this.internalSet.clear();
  }

  /**
   * Returns `true` if `this` has no elements in common with `other`.
   *
   * # Examples
   *
   * ```typescript
   * const a = new HashSet<number>();
   * const b = new HashSet<number>();
   *
   * a.insert(1);
   * b.insert(2);
   * console.log(a.isDisjointFrom(b)); // true
   *
   * b.insert(1);
   * console.log(a.isDisjointFrom(b)); // false
   * ```
   */
  isDisjointFrom(other: HashSet<T>): boolean {
    return this.internalSet.isDisjointFrom(other.internalSet);
  }

  /**
   * Returns `true` if the set is a subset of another,
   * i.e., `other` contains at least all the values in `this`.
   *
   * # Examples
   *
   * ```typescript
   * const sup = new HashSet<number>();
   * sup.insert(1);
   * sup.insert(2);
   *
   * const sub = new HashSet<number>();
   * sub.insert(1);
   *
   * console.log(sub.isSubsetOf(sup)); // true
   * ```
   */
  isSubsetOf(other: HashSet<T>): boolean {
    return this.internalSet.isSubsetOf(other.internalSet);
  }

  /**
   * Returns `true` if the set is a superset of another,
   * i.e., `this` contains at least all the values in `other`.
   *
   * # Examples
   *
   * ```typescript
   * const sup = new HashSet<number>();
   * sup.insert(1);
   * sup.insert(2);
   *
   * const sub = new HashSet<number>();
   * sub.insert(1);
   *
   * console.log(sup.isSupersetOf(sub)); // true
   * ```
   */
  isSupersetOf(other: HashSet<T>): boolean {
    return this.internalSet.isSupersetOf(other.internalSet);
  }

  /**
   * Returns a reference to the value in the set wrapped in an `Option`.
   *
   * Returns `Some(value)` if the value exists in the set, or `None` if it does not.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * set.insert(42);
   *
   * console.log(set.get(42).unwrap()); // 42
   * console.log(set.get(10).isNone);   // true
   * ```
   */
  get(value: T): Option<T> {
    return this.internalSet.has(value) ? Option.Some(value) : Option.None();
  }

  /**
   * Returns `true` if the set contains the specified value.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * set.insert(1);
   * console.log(set.contains(1)); // true
   * console.log(set.contains(2)); // false
   * ```
   */
  contains(value: T): boolean {
    return this.internalSet.has(value);
  }

  /**
   * Adds a value to the set, replacing the existing element if it was
   * already present, and returns the old value wrapped in an `Option`.
   *
   * If the set did not contain the value, `None` is returned.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<string>();
   * console.log(set.replace("a").isNone); // true
   * console.log(set.size);               // 1
   *
   * const old = set.replace("a");
   * console.log(old.unwrap());           // "a"
   * ```
   */
  replace(value: T): Option<T> {
    const hasValue = this.internalSet.has(value);
    if (hasValue) this.internalSet.delete(value);
    this.internalSet.add(value);
    return hasValue ? Option.Some(value) : Option.None();
  }

  /**
   * Adds a value to the set.
   *
   * Returns `true` if the value was not already present.
   * If the set did already contain the value, `false` is returned and the set is not modified.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * console.log(set.insert(2)); // true
   * console.log(set.insert(2)); // false
   * console.log(set.size);      // 1
   * ```
   */
  insert(value: T): boolean {
    if (this.internalSet.has(value)) return false;
    this.internalSet.add(value);
    return true;
  }

  /**
   * Removes a value from the set.
   *
   * Returns `true` if the value was present in the set.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * set.insert(2);
   *
   * console.log(set.remove(2)); // true
   * console.log(set.remove(2)); // false
   * ```
   */
  remove(value: T): boolean {
    return this.internalSet.delete(value);
  }

  /**
   * Native JavaScript iterator protocol support.
   * Allows the HashSet to be used directly in `for...of` loops, with spread operators,
   * or inside Array conversion utilities.
   *
   * # Examples
   *
   * ```typescript
   * const set = new HashSet<number>();
   * set.insert(1);
   * set.insert(2);
   *
   * for (const value of set) {
   *     console.log(value); // Prints: 1, 2
   * }
   * ```
   */
  [Symbol.iterator](): Iterator<T> {
    return this.internalSet.values();
  }
}

/**
 * Creates a new `HashSet` initialized with the elements from the provided iterable collection,
 * or an empty `HashSet` if no iterable is given.
 *
 * # Examples
 *
 * ```typescript
 * const set1 = HashSet.from([]);
 *
 * const set2 = HashSet.from([1, 2, 2, 3]);
 * console.log(set2.size); // 3 (duplicates are dropped)
 * ```
 */
export function from<T>(iterable: Iterable<T>): HashSet<T> {
  return new HashSet<T>(iterable);
}
