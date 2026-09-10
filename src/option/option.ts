import { Result } from "@/result/mod.ts";

/**
 * The `Option` type represents an optional value:
 * every `Option` is either `Some` and contains a value,
 * or `None`, and does not.
 */
export type Option<T> = SomeClass<T> | NoneClass<T>;

interface MutableOption<T> {
  isSome: boolean;
  isNone: boolean;
  value?: T;
}

class SomeClass<T> {
  readonly isSome = true as const;
  readonly isNone = false as const;

  constructor(private readonly value: T) {}

  /**
   * Returns `true` if the option is a `Some` value and the value inside of it matches a predicate.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * assert_eq(x.isSomeAnd((x) => x > 1), true);
   *
   * const x2 = Some(0);
   * assert_eq(x2.isSomeAnd((x) => x > 1), false);
   * ```
   */
  isSomeAnd(predicate: (val: T) => boolean): boolean {
    return predicate(this.value);
  }

  /**
   * Returns `true` if the option is a `None` or the value inside of it matches a predicate.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * console.log(x.isNoneOr((x) => x > 1)); // true
   *
   * const x2 = Some(0);
   * console.log(x2.isNoneOr((x) => x > 1)); // false
   * ```
   */
  isNoneOr(predicate: (val: T) => boolean): boolean {
    return predicate(this.value);
  }

  /**
   * Returns `true` if the option is a `Some` value containing the given value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * console.log(x.contains(2)); // true
   *
   * const y = Some(3);
   * console.log(y.contains(2)); // false
   * ```
   */
  contains(x: T): boolean {
    return this.value === x;
  }

  /**
   * Returns the contained `Some` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is a `None` with a custom panic message provided by `msg`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("value");
   * console.log(x.expect("fruits are healthy")); // "value"
   * ```
   */
  expect(_msg: string): T {
    return this.value;
  }

  /**
   * Returns the contained `Some` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is a `None` with a custom panic message
   * provided by the `None` implementation.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("val");
   * console.log(x.unwrap()); // "val"
   * ```
   */
  unwrap(): T {
    return this.value;
  }

  /**
   * Returns the contained `Some` value or a provided default.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("car");
   * console.log(x.unwrapOr("bike")); // "car"
   * ```
   */
  unwrapOr(_fallback: T): T {
    return this.value;
  }

  /**
   * Returns the contained `Some` value or computes it from a closure.
   *
   * # Examples
   *
   * ```typescript
   * const k = 10;
   * console.log(Some(2).unwrapOrElse(() => k * 2)); // 2
   * ```
   */
  unwrapOrElse(_fn: () => T): T {
    return this.value;
  }

  /**
   * Returns the contained `Some` value or a default constructor value.
   *
   * Consumes the `self` argument then, if `Some`, returns the contained
   * value, otherwise if `None`, returns the default value for that type.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("cow");
   * console.log(x.unwrapOrDefault(String)); // "cow"
   * ```
   */
  unwrapOrDefault(_ctor: (new () => T) | (() => T)): T {
    return this.value;
  }

  /**
   * Maps an `Option<T>` to `Option<U>` by applying a function
   * to a contained value (if `Some`) or returns `None` (if `None`).
   *
   * # Examples
   *
   * Calculates the length of an `Option<string>` as an `Option<number>`.
   *
   * ```typescript
   * const maybeSomeString = Some("Hello, World!");
   * // `maybeSomeLen` will be `Some(13)`
   * const maybeSomeLen = maybeSomeString.map((s) => s.length);
   * ```
   */
  map<U>(fn: (val: T) => U): Option<U> {
    return Some(fn(this.value));
  }

  /**
   * Calls the provided closure with a reference to the contained value (if `Some`).
   *
   * # Examples
   *
   * ```typescript
   * Some(4).inspect((x) => console.log(`got: ${x}`)); // Prints: "got: 4"
   * ```
   */
  inspect(fn: (val: T) => void): Option<T> {
    fn(this.value);
    return this;
  }

  /**
   * Calls the provided closure if the option is `None`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(4);
   * x.inspectNone(() => console.log("this won't print")); // Prints nothing
   * ```
   */
  inspectNone(_fn: () => void): Option<T> {
    return this;
  }

  /**
   * Returns the provided default value (if none),
   * or applies a function to the contained value (if any).
   *
   * Arguments passed to `mapOr` are evaluated eagerly.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("foo");
   * console.log(x.mapOr(42, (v) => v.length)); // 3
   * ```
   */
  mapOr<U>(_fallback: U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Computes a default success value,
   * or applies a function to the contained value (if any).
   *
   * # Examples
   *
   * ```typescript
   * const k = 21;
   * const x = Some("foo");
   * console.log(x.mapOrElse(() => k * 2, (v) => v.length)); // 3
   * ```
   */
  mapOrElse<U>(_fallback: () => U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Maps a `Option<T>` to a `U` by applying function `f` to the contained
   * value if the result is `Some`, otherwise if `None`, returns the
   * default value for the type `U`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("foo");
   * console.log(x.mapOrDefault(String, (v) => v.toUpperCase())); // "FOO"
   * ```
   */
  mapOrDefault<U>(_fallback: (new () => U) | (() => U), fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`,
   * mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("foo");
   * console.log(x.okOr(0).unwrap()); // "foo"
   * ```
   */
  okOr<E>(_err: E): Result<T, E> {
    return Result.Ok(this.value);
  }

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`,
   * mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some("foo");
   * console.log(x.okOrElse(() => 0).unwrap()); // "foo"
   * ```
   */
  okOrElse<E>(_err: () => E): Result<T, E> {
    return Result.Ok(this.value);
  }

  /**
   * Returns an iterator over the possibly contained value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(42);
   * for (const val of x.iter()) {
   *     console.log(val); // Prints: 42
   * }
   *
   * // Direct translation to native array:
   * const arr = [...x.iter()]; // [42]
   * ```
   */
  *iter(): Generator<T, void, unknown> {
    yield this.value;
  }

  /**
   * Native JavaScript iterator protocol support.
   * Allows the Option to be used directly in `for...of` loops or with `[...]`.
   */
  *[Symbol.iterator](): Generator<T, void, unknown> {
    yield this.value;
  }

  /**
   * Returns `None` if the option is `None`, otherwise returns `optb`.
   */
  and<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  /**
   * Returns `None` if the option is `None`, otherwise calls `f`
   * with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   *
   * # Examples
   *
   * ```typescript
   * function sqThenToString(x: number): Option<string> {
   *     return Some((x * x).toString());
   * }
   *
   * console.log(Some(2).andThen(sqThenToString)); // Some("4")
   * console.log(None().andThen(sqThenToString)); // None
   * ```
   */
  andThen<U>(fn: (val: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  /**
   * Returns `None` if the option is `None`, otherwise returns `None` if the predicate
   * `predicate` returns `false` when passed the contained value, otherwise returns the `Option`.
   *
   * # Examples
   *
   * ```typescript
   * const isEven = (n: number) => n % 2 === 0;
   *
   * console.log(None().filter(isEven)); // None
   * console.log(Some(3).filter(isEven)); // None
   * console.log(Some(4).filter(isEven)); // Some(4)
   * ```
   */
  filter(predicate: (val: T) => boolean): Option<T> {
    return predicate(this.value) ? this : None();
  }

  /**
   * Returns the option if it contains a value, otherwise returns `optb`.
   *
   * Arguments passed to `or` are evaluated eagerly.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * const y = None();
   * console.log(x.or(y).unwrap()); // 2
   * ```
   */
  or(_optb: Option<T>): Option<T> {
    return this;
  }

  /**
   * Returns the option if it contains a value, otherwise calls `f` and returns the result.
   *
   * # Examples
   *
   * ```typescript
   * const nobody = () => None();
   * const vikings = () => Some("vikings");
   *
   * console.log(Some("barbarians").orElse(vikings)); // Some("barbarians")
   * ```
   */
  orElse(_fn: () => Option<T>): Option<T> {
    return this;
  }

  /**
   * Returns `Some` if exactly one of `self`, `other` is `Some`, otherwise returns `None`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * const y = None();
   * console.log(x.xor(y).isSome); // true
   *
   * const z = Some(4);
   * console.log(x.xor(z).isNone); // true
   * ```
   */
  xor(other: Option<T>): Option<T> {
    return other.isSome ? None() : this;
  }

  /**
   * Inserts `value` into the option, then returns a reference to it.
   *
   * If the option already contains a value, the old value is dropped.
   *
   * # Examples
   *
   * ```typescript
   * const opt = Some(1);
   * const val = opt.insert(2);
   * console.log(val); // 2
   * console.log(opt.unwrap()); // 2
   * ```
   */
  insert(value: T): T {
    Object.assign(this, { value });
    return this.value;
  }

  /**
   * Inserts `value` into the option if it is `None`, then returns a reference to the contained value.
   *
   * # Examples
   *
   * ```typescript
   * const opt = Some(5);
   * const val = opt.getOrInsert(2);
   * console.log(val); // 5
   * ```
   */
  getOrInsert(_value: T): T {
    return this.value;
  }

  /**
   * Inserts the default value for `T` into the option if it is `None`,
   * then returns a reference to the contained value.
   */
  getOrInsertDefault(_ctor: (new () => T) | (() => T)): T {
    return this.value;
  }

  /**
   * Inserts a value computed from `f` into the option if it is `None`,
   * then returns a reference to the contained value.
   *
   * # Examples
   *
   * ```typescript
   * const opt = Some(5);
   * const val = opt.getOrInsertWith(() => 2);
   * console.log(val); // 5
   * ```
   */
  getOrInsertWith(_fn: () => T): T {
    return this.value;
  }

  /**
   * Tries to insert a value computed from `f` into the option if it is `None`.
   *
   * If the function returns `Ok`, the value is inserted and a reference is returned.
   * If it returns `Err`, the option remains unchanged.
   */
  getOrTryInsertWith<E>(_fn: () => Result<T, E>): Result<T, E> {
    return Result.Ok(this.value);
  }

  /**
   * Takes the value out of the option, leaving a `None` in its place.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(1);
   * const y = x.take();
   * console.log(x.isNone); // true
   * console.log(y.unwrap()); // 1
   * ```
   */
  take(): Option<T> {
    const oldVal = this.value;
    Object.assign(this, { isSome: false, isNone: true });
    delete (this as unknown as MutableOption<T>).value;
    Object.setPrototypeOf(this, NoneClass.prototype);
    return Some(oldVal);
  }

  /**
   * Takes the value out of the option, leaving a `None` in its place,
   * if the contained value matches the predicate.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * const y = x.takeIf((v) => v % 2 === 0);
   * console.log(x.isNone); // true
   * console.log(y.unwrap()); // 2
   * ```
   */
  takeIf(predicate: (val: T) => boolean): Option<T> {
    return predicate(this.value) ? this.take() : None();
  }

  /**
   * Replaces the actual value in the option by the given one,
   * returning the old value as an `Option`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * const old = x.replace(5);
   * console.log(x.unwrap()); // 5
   * console.log(old.unwrap()); // 2
   * ```
   */
  replace(value: T): Option<T> {
    const oldVal = this.value;
    Object.assign(this, { value });
    return Some(oldVal);
  }

  /**
   * Zips `self` with another `Option`.
   *
   * If `self` is `Some(s)` and `other` is `Some(o)`, this method returns `Some([s, o])`.
   * Otherwise, `None` is returned.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(1);
   * const y = Some("hi");
   * const z = None();
   *
   * console.log(x.zip(y).unwrap()); // [1, "hi"]
   * console.log(x.zip(z).isNone);   // true
   * ```
   */
  zip<U>(other: Option<U>): Option<[T, U]> {
    return other.map((otherVal) => [this.value, otherVal]);
  }

  /**
   * Zips `self` and another `Option` with function `f`.
   *
   * If `self` is `Some(s)` and `other` is `Some(o)`, returns `Some(f(s, o))`.
   * Otherwise, returns `None`.
   */
  zipWith<U, R>(other: Option<U>, f: (a: T, b: U) => R): Option<R> {
    return other.map((otherVal) => f(this.value, otherVal));
  }

  /**
   * Evaluates the option, returning itself since it contains a value.
   * In Rust iterators, this reduces the option to a single value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(2);
   * console.log(x.reduce((a, b) => a + b).unwrap()); // 2
   * ```
   */
  reduce(_f: (accumulator: T, value: T) => T): Option<T> {
    return this;
  }

  /**
   * Unzips an option containing a tuple of two options.
   *
   * If `self` is `Some([a, b])`, this method returns `[Some(a), Some(b)]`.
   * Otherwise, `[None, None]` is returned.
   *
   * # Examples
   *
   * ```typescript
   * const x: Option<[number, string]> = Some([1, "hi"]);
   * const [a, b] = x.unzip();
   *
   * console.log(a.unwrap()); // 1
   * console.log(b.unwrap()); // "hi"
   * ```
   */
  unzip<A, B>(this: Option<[A, B]>): [Option<A>, Option<B>] {
    const [a, b] = (this as SomeClass<[A, B]>).value;
    return [Some(a), Some(b)];
  }

  /**
   * Maps an `Option<T>` to `Option<T>` by copying the contained value.
   * In JavaScript, primitive types are automatically passed by value.
   */
  copied(): Option<T> {
    return Some(this.value);
  }

  /**
   * Maps an `Option<T>` to `Option<T>` by cloning the contained value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some({ name: "Alex" });
   * const y = x.cloned();
   * console.log(x.unwrap() === y.unwrap()); // false (different object reference)
   * ```
   */
  cloned(): Option<T> {
    return Some(structuredClone(this.value));
  }

  /**
   * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
   *
   * `None` will be mapped to `Ok(None)`. `Some(Ok(_))` and `Some(Err(_))`
   * will be mapped to `Ok(Some(_))` and `Err(_)`.
   *
   * # Examples
   *
   * ```typescript
   * const x: Option<Result<number, string>> = Some(Ok(5));
   * const y: Result<Option<number>, string> = x.transpose();
   * ```
   */
  transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E> {
    return (this as SomeClass<Result<U, E>>).value.map((val) => Some(val));
  }

  /**
   * Flattens a nested `Option` structure.
   *
   * This method is only available when the inner value is itself an `Option`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some(Some(6));
   * console.log(x.flatten().unwrap()); // 6
   *
   * const y = Some(None());
   * console.log(y.flatten().isNone); // true
   * ```
   */
  flatten<U>(this: Option<Option<U>>): Option<U> {
    return (this as SomeClass<Option<U>>).value;
  }

  /**
   * Applies control flow based on pattern matching
   * against the structural variants of `Option`.
   */
  match<U>(matchers: { Some: (val: T) => U; None: () => U }): U {
    return matchers.Some(this.value);
  }
}

class NoneClass<T> {
  private readonly value: unknown;

  readonly isSome = false as const;
  readonly isNone = true as const;

  constructor() {
    this.value ??= null;
  }

  /**
   * Returns `true` if the option is a `Some` value and the value inside of it matches a predicate.
   */
  isSomeAnd(_predicate: (val: T) => boolean): boolean {
    return false;
  }

  /**
   * Returns `true` if the option is a `None` or the value inside of it matches a predicate.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * console.log(x.isNoneOr((x: number) => x > 1)); // true
   * ```
   */
  isNoneOr(this: Option<T>, _predicate: (val: T) => boolean): boolean {
    return true;
  }

  /**
   * Returns `true` if the option is a `Some` value containing the given value.
   */
  contains(_x: T): boolean {
    return false;
  }

  /**
   * Returns the contained `Some` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is a `None` with a custom panic message provided by `msg`.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * x.expect("fruits are healthy"); // panics with "fruits are healthy"
   * ```
   */
  expect(msg: string): T {
    throw new Error(msg);
  }

  /**
   * Returns the contained `Some` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is a `None` with a custom panic message.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * x.unwrap(); // fails with Error
   * ```
   */
  unwrap(): T {
    throw new Error("Called `Option.unwrap()` on a `None` value");
  }

  /**
   * Returns the contained `Some` value or a provided default.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * console.log(x.unwrapOr("bike")); // "bike"
   * ```
   */
  unwrapOr(fallback: T): T {
    return fallback;
  }

  /**
   * Returns the contained `Some` value or computes it from a closure.
   *
   * # Examples
   *
   * ```typescript
   * const k = 10;
   * console.log(None().unwrapOrElse(() => k * 2)); // 20
   * ```
   */
  unwrapOrElse(this: Option<T>, fn: () => T): T {
    return fn();
  }

  /**
   * Returns the contained `Some` value or a default constructor value.
   *
   * Consumes the `self` argument then, if `Some`, returns the contained
   * value, otherwise if `None`, returns the default value for that type.
   *
   * # Examples
   *
   * ```typescript
   * const y = None();
   * console.log(y.unwrapOrDefault(String)); // ""
   * ```
   */
  unwrapOrDefault(ctor: (new () => T) | (() => T)): T {
    const ctorRef = ctor as unknown;

    if (ctorRef === Symbol || ctorRef === BigInt) {
      const fn = ctorRef as () => T;
      return fn();
    }

    try {
      const Newable = ctorRef as new () => unknown;
      const result = new Newable();

      if (result && typeof result === "object" && "valueOf" in result) {
        const primitive = result.valueOf();
        if (["string", "number", "boolean"].includes(typeof primitive)) {
          return primitive as T;
        }
      }

      return result as T;
    } catch {
      const fn = ctorRef as () => T;
      return fn();
    }
  }

  /**
   * Maps an `Option<T>` to `Option<U>` by applying a function
   * to a contained value (if `Some`) or returns `None` (if `None`).
   */
  map<U>(_fn: (val: T) => U): Option<U> {
    return this as unknown as Option<U>;
  }

  /**
   * Calls the provided closure with a reference to the contained value (if `Some`).
   */
  inspect(_fn: (val: T) => void): Option<T> {
    return this;
  }

  /**
   * Calls the provided closure if the option is `None`.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * x.inspectNone(() => console.log("option is empty")); // Prints: "option is empty"
   * ```
   */
  inspectNone(fn: () => void): Option<T> {
    fn();
    return this;
  }

  /**
   * Returns the provided default value (if none),
   * or applies a function to the contained value (if any).
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * console.log(x.mapOr(42, (v: string) => v.length)); // 42
   * ```
   */
  mapOr<U>(fallback: U, _fn: (val: T) => U): U {
    return fallback;
  }

  /**
   * Computes a default success value,
   * or applies a function to the contained value (if any).
   *
   * # Examples
   *
   * ```typescript
   * const k = 21;
   * const x = None();
   * console.log(x.mapOrElse(() => k * 2, (v: string) => v.length)); // 42
   * ```
   */
  mapOrElse<U>(fallback: () => U, _fn: (val: T) => U): U {
    return fallback();
  }

  /**
   * Maps a `Option<T>` to a `U` by applying function `f` to the contained
   * value if the result is `Some`, otherwise if `None`, returns the
   * default value for the type `U`.
   *
   * # Examples
   *
   * ```typescript
   * const y = None();
   * console.log(y.mapOrDefault(String, (v: string) => v.toUpperCase())); // ""
   * ```
   */
  mapOrDefault<U>(fallback: (new () => U) | (() => U), fn: (val: T) => U): U {
    return this.map(fn).unwrapOrDefault(fallback);
  }

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`,
   * mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * // x.okOr(0) becomes Err(0)
   * ```
   */
  okOr<E>(err: E): Result<T, E> {
    return Result.Err(err);
  }

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`,
   * mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * // x.okOrElse(() => 0) becomes Err(0)
   * ```
   */
  okOrElse<E>(err: () => E): Result<T, E> {
    return Result.Err(err());
  }

  /**
   * Returns an iterator over the possibly contained value.
   */
  *iter(): Generator<T, void, unknown> {
    // Yields nothing, behaves like an empty array iterator
  }

  /**
   * Native JavaScript iterator protocol support.
   */
  *[Symbol.iterator](): Generator<T, void, unknown> {
    // Yields nothing
  }

  /**
   * Returns `None` if the option is `None`, otherwise returns `optb`.
   */
  and<U>(_optb: Option<U>): Option<T> {
    return this;
  }

  /**
   * Returns `None` if the option is `None`, otherwise calls `f`
   * with the wrapped value and returns the result.
   */
  andThen<U>(_fn: (val: T) => Option<U>): Option<U> {
    return this as unknown as Option<U>;
  }

  /**
   * Returns `None` if the option is `None`, otherwise returns `None` if the predicate
   * returns `false`.
   */
  filter(_predicate: (val: T) => boolean): Option<T> {
    return this;
  }

  /**
   * Returns the option if it contains a value, otherwise returns `optb`.
   */
  or(optb: Option<T>): Option<T> {
    return optb;
  }

  /**
   * Returns the option if it contains a value, otherwise calls `f` and returns the result.
   */
  orElse(fn: () => Option<T>): Option<T> {
    return fn();
  }

  /**
   * Returns `Some` if exactly one of `self`, `other` is `Some`, otherwise returns `None`.
   */
  xor(other: Option<T>): Option<T> {
    return other;
  }

  /**
   * Inserts `value` into the option, then returns a reference to it.
   */
  insert(val: T): T {
    Object.assign(this, { isSome: true, isNone: false, value: val });
    Object.setPrototypeOf(this, SomeClass.prototype);
    return val;
  }

  /**
   * Inserts `value` into the option if it is `None`,
   * then returns a reference to the contained value.
   *
   * # Examples
   *
   * ```typescript
   * const opt = None();
   * const val = opt.getOrInsert(2);
   * console.log(val); // 2
   * console.log(opt.unwrap()); // 2
   * ```
   */
  getOrInsert(value: T): T {
    return this.insert(value);
  }

  /**
   * Inserts the default value for `T` into the option if it is `None`,
   * then returns a reference to the contained value.
   *
   * # Examples
   *
   * ```typescript
   * const opt = None();
   * const val = opt.getOrInsertDefault(String);
   * console.log(val); // ""
   * ```
   */
  getOrInsertDefault(ctor: (new () => T) | (() => T)): T {
    return this.insert(this.unwrapOrDefault(ctor));
  }

  /**
   * Inserts a value computed from `f` into the option if it is `None`,
   * then returns a reference to the contained value.
   *
   * # Examples
   *
   * ```typescript
   * const opt = None();
   * const val = opt.getOrInsertWith(() => 2);
   * console.log(val); // 2
   * ```
   */
  getOrInsertWith(fn: () => T): T {
    return this.insert(fn());
  }

  /**
   * Tries to insert a value computed from `f` into the option if it is `None`.
   */
  getOrTryInsertWith<E>(fn: () => Result<T, E>): Result<T, E> {
    return fn().map((val) => this.insert(val));
  }

  /**
   * Takes the value out of the option, leaving a `None` in its place.
   */
  take(this: Option<T>): Option<T> {
    return None();
  }

  /**
   * Takes the value out of the option, leaving a `None` in its place,
   * if the contained value matches the predicate.
   */
  takeIf(this: Option<T>, _predicate: (val: T) => boolean): Option<T> {
    return None();
  }

  /**
   * Replaces the actual value in the option by the given one,
   * returning the old value as an `Option`.
   *
   * # Examples
   *
   * ```typescript
   * const x = None();
   * const old = x.replace(5);
   * console.log(x.unwrap()); // 5
   * console.log(old.isNone); // true
   * ```
   */
  replace(this: Option<T>, value: T): Option<T> {
    Object.assign(this, { isSome: true, isNone: false, value });
    Object.setPrototypeOf(this, SomeClass.prototype);
    return None();
  }

  /**
   * Zips `self` with another `Option`.
   */
  zip<U>(_other: Option<U>): Option<[T, U]> {
    return this as unknown as Option<[T, U]>;
  }

  /**
   * Zips `self` and another `Option` with function `f`.
   */
  zipWith<U, R>(_other: Option<U>, _f: (a: T, b: U) => R): Option<R> {
    return this as unknown as Option<R>;
  }

  /**
   * Evaluates the option, returning `None` since it contains no value.
   */
  reduce(this: Option<T>, _f: (accumulator: T, value: T) => T): Option<T> {
    return None();
  }

  /**
   * Unzips an option containing a tuple of two options.
   */
  unzip<A, B>(this: Option<[A, B]>): [Option<A>, Option<B>] {
    return [None(), None()];
  }

  /**
   * Maps an `Option<T>` to `Option<T>` by copying the contained value.
   */
  copied(): Option<T> {
    return None();
  }

  /**
   * Maps an `Option<T>` to `Option<T>` by cloning the contained value.
   */
  cloned(): Option<T> {
    return None();
  }

  /**
   * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
   */
  transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E> {
    return Result.Ok(None());
  }

  /**
   * Flattens a nested `Option` structure.
   */
  flatten<U>(this: Option<Option<U>>): Option<U> {
    return None();
  }

  /**
   * Applies control flow based on pattern matching
   * against the structural variants of `Option`.
   */
  match<U>(matchers: { Some: (val: T) => U; None: () => U }): U {
    return matchers.None();
  }
}

/**
 * Some value of type `T`.
 */
export function Some<T>(value: T): Option<T> {
  return new SomeClass(value);
}

/**
 * No value.
 */
export function None<T>(): Option<T> {
  return new NoneClass<T>();
}

/**
 * Transforms a nullable TypeScript value (`T | null | undefined`)
 * into an `Option<T>`.
 */
export function from<T>(value: T | null | undefined): Option<T> {
  return value === undefined || value === null ? None() : Some(value);
}

/**
 * Transforms a nullable TypeScript value (`T | null | undefined`)
 * into an `Option<T>`.
 */
export function fromNullable<T>(value: T | null | undefined): Option<T> {
  return from(value);
}

/**
 * Collects an array of `Option` instances.
 * If ALL instances are `Some`, it returns a `Some` containing an array of all values.
 * If ANY instance is `None`, it returns `None`.
 *
 * Similar to `Promise.all`.
 *
 * # Examples
 *
 * ```typescript
 * const options = [Some(1), Some(2), Some(3)];
 * console.log(Option.all(options).unwrap()); // [1, 2, 3]
 *
 * const mixed = [Some(1), None(), Some(3)];
 * console.log(Option.all(mixed).isNone); // true
 * ```
 */
export function all<T>(options: Option<T>[]): Option<T[]> {
  return options.every((opt) => opt.isSome) ? Some(options.map((opt) => opt.unwrap())) : None();
}

/**
 * Collects an array of `Option` instances.
 * Returns the FIRST `Some` instance encountered.
 * If ALL instances are `None`, it returns `None`.
 *
 * Similar to `Promise.any`.
 *
 * # Examples
 *
 * ```typescript
 * const mixed = [None(), Some(42), None()];
 * console.log(Option.any(mixed).unwrap()); // 42
 *
 * const failures = [None(), None()];
 * console.log(Option.any(failures).isNone); // true
 * ```
 */
export function any<T>(options: Option<T>[]): Option<T> {
  return options.find((opt) => opt.isSome) ?? None();
}
