import { Option } from "@/core/option/mod.ts";

/**
 * `Result<T, E>` is the type used for returning and propagating errors.
 * It is an enum with the variants, `Ok(T)`, representing success and containing a value,
 * and `Err(E)`, representing error and containing an error value.
 */
export type Result<T, E> = OkClass<T, E> | ErrClass<T, E>;

class OkClass<T, E> {
  readonly isOk = true as const;
  readonly isErr = false as const;

  constructor(private readonly value: T) {}

  /**
   * Returns `true` if the result is `Ok` and the value inside it matches a predicate.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * console.log(x.isOkAnd((x) => x > 1)); // true
   * console.log(x.isOkAnd((x) => x < 0)); // false
   * ```
   */
  isOkAnd(predicate: (val: T) => boolean): boolean {
    return predicate(this.value);
  }

  /**
   * Returns `true` if the result is `Err` and the value inside it matches a predicate.
   */
  isErrAnd(_predicate: (err: E) => boolean): boolean {
    return false;
  }

  /**
   * Returns `true` if the result is an `Ok` value containing the given value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * console.log(x.contains(2)); // true
   *
   * const y = Ok(3);
   * console.log(y.contains(2)); // false
   * ```
   */
  contains(x: T): boolean {
    return this.value === x;
  }

  /**
   * Returns `true` if the result is an `Err` value containing the given value.
   */
  containsErr(_f: E): boolean {
    return false;
  }

  /**
   * Converts from `Result<T, E>` to `Option<T>`.
   *
   * Converts `self` into an `Option<T>`, consuming `self`,
   * and discarding the error, if any.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * console.log(x.ok().unwrap()); // 2
   * ```
   */
  ok(): Option<T> {
    return Option.Some(this.value);
  }

  /**
   * Converts from `Result<T, E>` to `Option<E>`.
   */
  err(): Option<never> {
    return Option.None();
  }

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function
   * to a contained `Ok` value, leaving an `Err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * const y = x.map((i) => i + 1);
   * console.log(y.unwrap()); // 3
   * ```
   */
  map<U>(fn: (val: T) => U): Result<U, E> {
    return Ok(fn(this.value));
  }

  /**
   * Returns the provided default value (if err),
   * or applies a function to the contained value (if ok).
   *
   * Arguments passed to `mapOr` are evaluated eagerly.
   *
   * # Examples
   *
   * ```typescript
   * const x: Result<string, string> = Ok("foo");
   * console.log(x.mapOr(42, (v) => v.length)); // 3
   * ```
   */
  mapOr<U>(_fallback: U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Maps a `Result<T, E>` to `U` by applying a fallback function to a * contained `Err` value,
   * or a selector function to a contained `Ok` value.
   *
   * # Examples
   *
   * ```typescript
   * const k = 21;
   * const x: Result<string, string> = Ok("foo");
   * console.log(x.mapOrElse((e) => k * 2, (v) => v.length)); // 3
   * ```
   */
  mapOrElse<U>(_fallback: (err: E) => U, fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Maps a `Result<T, E>` to a `U` by applying function `f` to the contained
   * value if the result is `Ok`, otherwise if `Err`, returns the
   * default value for the type `U`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok("foo");
   * console.log(x.mapOrDefault(String, (v) => v.toUpperCase())); // "FOO"
   * ```
   */
  mapOrDefault<U>(_fallback: (new () => U) | (() => U), fn: (val: T) => U): U {
    return fn(this.value);
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function
   * to a contained `Err` value, leaving an `Ok` value untouched.
   *
   * This function can be used to pass through a successful result
   * while handling an error.
   *
   * # Examples
   *
   * ```typescript
   * function stringify(x: number): string { return `error code: ${x}`; }
   *
   * const x = Ok(2);
   * console.log(x.mapErr(stringify)); // Ok(2)
   * ```
   */
  mapErr<F>(_fn: (err: E) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  /**
   * Calls the provided closure with a reference to the contained value (if `Ok`).
   */
  inspect(fn: (val: T) => void): Result<T, E> {
    fn(this.value);
    return this;
  }

  /**
   * Calls the provided closure with a reference to the contained error (if `Err`).
   */
  inspectErr(_fn: (err: E) => void): Result<T, E> {
    return this;
  }

  /**
   * Returns an iterator over the possibly contained value.
   *
   * The iterator yields one value if the result is `Ok`, otherwise none.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(7);
   * for (const val of x.iter()) {
   *     console.log(val); // Prints: 7
   * }
   * ```
   */
  *iter(): Generator<T, void, unknown> {
    yield this.value;
  }

  /**
   * Native JavaScript iterator protocol support.
   * Allows the Result to be used directly in `for...of` loops or with `[...]`.
   */
  *[Symbol.iterator](): Generator<T, void, unknown> {
    yield this.value;
  }

  /**
   * Returns the contained `Ok` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Err`, with a panic message
   * including the passed message, and the content of the `Err`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * console.log(x.expect("testing expect")); // 2
   * ```
   */
  expect(_msg: string): T {
    return this.value;
  }

  /**
   * Returns the contained `Ok` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Err`,
   * with a panic message provided by the `Err`'s value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * console.log(x.unwrap()); // 2
   * ```
   */
  unwrap(): T {
    return this.value;
  }

  /**
   * Returns the contained `Ok` value or a default constructor value.
   *
   * Consumes the `self` argument then, if `Ok`, returns the contained
   * value, otherwise if `Err`, returns the default value for that type.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok("cow");
   * console.log(x.unwrapOrDefault(String)); // "cow"
   * ```
   */
  unwrapOrDefault(_ctor: (new () => T) | (() => T)): T {
    return this.value;
  }

  /**
   * Returns the contained `Err` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Ok`, with a panic message including the
   * passed message, and the content of the `Ok`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * x.expectErr("Testing expectErr"); // panics with "Testing expectErr: 2"
   * ```
   */
  expectErr(msg: string): never {
    throw new Error(`${msg}: ${String(this.value)}`);
  }

  /**
   * Returns the contained `Err` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Ok`, with a custom panic message provided by
   * the `Ok`'s value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * x.unwrapErr(); // panics with "Called `Result.unwrapErr()` on an `Ok` value: 2"
   * ```
   */
  unwrapErr(): never {
    throw new Error(`Called \`Result.unwrapErr()\` on an \`Ok\` value: ${String(this.value)}`);
  }

  /**
   * Returns the contained `Ok` value or a provided default.
   *
   * # Examples
   *
   * ```typescript
   * const defaultVal = 2;
   * const x = Ok(9);
   * console.log(x.unwrapOr(defaultVal)); // 9
   * ```
   */
  unwrapOr(_fallback: T): T {
    return this.value;
  }

  /**
   * Returns the contained `Ok` value or computes it from a closure.
   *
   * # Examples
   *
   * ```typescript
   * const k = 10;
   * console.log(Ok(2).unwrapOrElse((x) => k * x)); // 2
   * ```
   */
  unwrapOrElse(_fn: (err: E) => T): T {
    return this.value;
  }

  /**
   * Returns `res` if the result is `Ok`, otherwise returns the `Err` value of `self`.
   *
   * Arguments passed to `and` are evaluated eagerly.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * const y = Err("late error");
   * console.log(x.and(y).isErr); // true
   * ```
   */
  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  /**
   * Returns `Err` if the result is `Err`, otherwise calls `f`
   * with the wrapped value and returns the result.
   *
   * This function can be used for control flow based on `Result` values.
   *
   * # Examples
   *
   * ```typescript
   * function sqThenToString(x: number): Result<string, string> {
   *     return Ok((x * x).toString());
   * }
   *
   * console.log(Ok(2).andThen(sqThenToString)); // Ok("4")
   * ```
   */
  andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  /**
   * Returns `res` if the result is `Err`, otherwise returns the `Ok` value of `self`.
   *
   * Arguments passed to `or` are evaluated eagerly.
   *
   * # Examples
   *
   * ```typescript
   * const x = Ok(2);
   * const y = Err("late error");
   * console.log(x.or(y).unwrap()); // 2
   * ```
   */
  or<F>(_res: Result<T, F>): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  /**
   * Returns the result if it is `Ok`, otherwise calls `op` and returns the result.
   *
   * # Examples
   *
   * ```typescript
   * const sq = (x: number) => Ok(x * x);
   * const err = (x: number) => Err(x);
   *
   * console.log(Ok(2).orElse(sq)); // Ok(2)
   * ```
   */
  orElse<F>(_fn: (err: E) => Result<T, F>): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  /**
   * Maps a `Result<&T, E>` to a `Result<T, E>` by copying the contents of the
   * `Ok` part.
   *
   * In JavaScript, primitive types are automatically passed by value.
   *
   * # Examples
   *
   * ```typescript
   * const val = 12;
   * const x = Ok(val);
   * console.log(x.copied().unwrap()); // 12
   * ```
   */
  copied(): Result<T, E> {
    return Ok(this.value);
  }

  /**
   * Maps an `Option<T>` to `Option<T>` by deep-cloning the contained value
   * using the native JavaScript `structuredClone` API.
   *
   * # Examples
   *
   * ```typescript
   * const x = Some({ nested: { data: 42 } });
   * const y = x.cloned();
   * console.log(x.unwrap() === y.unwrap()); // false (deep copy)
   * ```
   */
  cloned(): Option<T> {
    return Option.Some(structuredClone(this.value));
  }

  /**
   * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
   *
   * `Ok(None)` will be mapped to `None`. `Ok(Some(_))` and `Err(_)`
   * will be mapped to `Some(Ok(_))` and `Some(Err(_))`.
   *
   * # Examples
   *
   * ```typescript
   * const x: Result<Option<number>, string> = Ok(Some(5));
   * const y: Option<Result<number, string>> = x.transpose();
   * ```
   */
  transpose<U>(this: OkClass<Option<U>, E>): Option<Result<U, E>> {
    return this.value.match({
      Some: (val) => Option.Some(Ok(val)),
      None: () => Option.None(),
    });
  }

  /**
   * Flattens a nested `Result` structure.
   *
   * This method is only available when the inner value is itself a `Result`
   * sharing the same error type.
   *
   * # Examples
   *
   * ```typescript
   * const x: Result<Result<number, string>, string> = Ok(Ok(6));
   * console.log(x.flatten().unwrap()); // 6
   * ```
   */
  flatten<U, F>(this: OkClass<Result<U, F>, F>): Result<U, F> {
    return this.value;
  }

  /**
   * Applies control flow based on pattern matching
   * against the structural variants of `Result`.
   */
  match<U>(matchers: { Ok: (val: T) => U; Err: (err: E) => U }): U {
    return matchers.Ok(this.value);
  }

  /**
   * Chains multiple unary functions or operators together, passing the entire
   * `Result` instance through the pipeline. Similar to RxJS `.pipe()`.
   *
   * # Examples
   *
   * ```typescript
   * const customOp = (res: Result<number, string>) => res.map(x => x * 2);
   * const x = Ok(5).pipe(customOp);
   * console.log(x.unwrap()); // 10
   * ```
   */
  pipe(): Result<T, E>;
  pipe<R1>(fn1: (res: Result<T, E>) => R1): R1;
  pipe<R1, R2>(fn1: (res: Result<T, E>) => R1, fn2: (res: R1) => R2): R2;
  pipe<R1, R2, R3>(fn1: (res: Result<T, E>) => R1, fn2: (res: R1) => R2, fn3: (res: R2) => R3): R3;
  pipe<R1, R2, R3, R4>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
  ): R4;
  pipe<R1, R2, R3, R4, R5>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
  ): R5;
  pipe<R1, R2, R3, R4, R5, R6>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
  ): R6;
  pipe<R1, R2, R3, R4, R5, R6, R7>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
    fn7: (res: R6) => R7,
  ): R7;
  pipe<R1, R2, R3, R4, R5, R6, R7, R8>( // NOSONAR: Ensure type safety for pipe chains.
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
    fn7: (res: R6) => R7,
    fn8: (res: R7) => R8,
  ): R8;
  pipe<R1, R2, R3, R4, R5, R6, R7, R8, R9>( // NOSONAR: Ensure type safety for pipe chains.
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
    fn7: (res: R6) => R7,
    fn8: (res: R7) => R8,
    fn9: (res: R8) => R9,
  ): R9;
  pipe(...fns: ((res: never) => unknown)[]): unknown {
    return pipe(this, ...fns);
  }
}

class ErrClass<T, E> {
  readonly isOk = false as const;
  readonly isErr = true as const;

  constructor(private readonly error: E) {}

  /**
   * Returns `true` if the result is `Ok` and the value inside it matches a predicate.
   */
  isOkAnd(_predicate: (val: T) => boolean): boolean {
    return false;
  }

  /**
   * Returns `true` if the result is `Err` and the value inside it matches a predicate.
   *
   * # Examples
   *
   * ```typescript
   * const x = Err(Error("bad_id"));
   * console.log(x.isErrAnd((e) => e.message === "bad_id")); // true
   * ```
   */
  isErrAnd(predicate: (err: E) => boolean): boolean {
    return predicate(this.error);
  }

  /**
   * Returns `true` if the result is an `Ok` value containing the given value.
   */
  contains(_x: T): boolean {
    return false;
  }

  /**
   * Returns `true` if the result is an `Err` value containing the given value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Err("Some error");
   * console.log(x.containsErr("Some error")); // true
   * ```
   */
  containsErr(f: E): boolean {
    return this.error === f;
  }

  /**
   * Converts from `Result<T, E>` to `Option<T>`.
   */
  ok(): Option<never> {
    return Option.None();
  }

  /**
   * Converts from `Result<T, E>` to `Option<E>`.
   *
   * Converts `self` into an `Option<E>`, consuming `self`,
   * and discarding the success value, if any.
   *
   * # Examples
   *
   * ```typescript
   * const x = Err("nothing here");
   * console.log(x.err().unwrap()); // "nothing here"
   * ```
   */
  err(): Option<E> {
    return Option.Some(this.error);
  }

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function
   * to a contained `Ok` value, leaving an `Err` value untouched.
   */
  map<U>(_fn: (val: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  /**
   * Returns the provided default value (if err), or applies a function to the
   * contained value (if ok).
   *
   * # Examples
   *
   * ```typescript
   * const x: Result<string, string> = Err("bar");
   * console.log(x.mapOr(42, (v: string) => v.length)); // 42
   * ```
   */
  mapOr<U>(fallback: U, _fn: (val: T) => U): U {
    return fallback;
  }

  /**
   * Maps a `Result<T, E>` to `U` by applying a fallback function to a
   * contained `Err` value, or a selector function to a contained `Ok` value.
   *
   * # Examples
   *
   * ```typescript
   * const k = 21;
   * const x: Result<string, string> = Err("bar");
   * console.log(x.mapOrElse((e) => k * 2, (v: string) => v.length)); // 42
   * ```
   */
  mapOrElse<U>(fallback: (err: E) => U, _fn: (val: T) => U): U {
    return fallback(this.error);
  }

  /**
   * Maps a `Result<T, E>` to a `U` by applying function `f` to the contained
   * value if the result is `Ok`, otherwise if `Err`, returns the
   * default value for the type `U`.
   *
   * # Examples
   *
   * ```typescript
   * const y = Err("bar");
   * console.log(y.mapOrDefault(String, (v: string) => v.toUpperCase())); // ""
   * ```
   */
  mapOrDefault<U>(fallback: (new () => U) | (() => U), _fn: (val: T) => U): U {
    return typeof fallback === "function" && "prototype" in fallback
      ? new (fallback as new () => U)()
      : (fallback as () => U)();
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function
   * to a contained `Err` value, leaving an `Ok` value untouched.
   *
   * # Examples
   *
   * ```typescript
   * function stringify(x: number): string { return `error code: ${x}`; }
   *
   * const x = Err(13);
   * // x.mapErr(stringify) becomes Err("error code: 13")
   * ```
   */
  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return Err(fn(this.error));
  }

  /**
   * Calls the provided closure with a reference to the contained value (if `Ok`).
   */
  inspect(_fn: (val: T) => void): Result<T, E> {
    return this;
  }

  /**
   * Calls the provided closure with a reference to the contained error (if `Err`).
   */
  inspectErr(fn: (err: E) => void): Result<T, E> {
    fn(this.error);
    return this;
  }

  /**
   * Returns an iterator over the possibly contained value.
   */
  *iter(): Generator<never, void, unknown> {
    // Yields nothing for Err variant
  }

  /**
   * Native JavaScript iterator protocol support.
   */
  *[Symbol.iterator](): Generator<never, void, unknown> {
    // Yields nothing
  }

  /**
   * Returns the contained `Ok` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Err`, with a panic message
   * including the passed message, and the content of the `Err`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Err("emergency failure");
   * x.expect("Testing expect"); // panics with "Testing expect: emergency failure"
   * ```
   */
  expect(msg: string): never {
    throw new Error(`${msg}: ${String(this.error)}`);
  }

  /**
   * Returns the contained `Ok` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Err`, with a panic message
   * provided by the `Err`'s value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Err("emergency failure");
   * x.unwrap(); // panics with "emergency failure"
   * ```
   */
  unwrap(): never {
    throw this.error;
  }

  /**
   * Returns the contained `Ok` value or a default constructor value.
   *
   * Consumes the `self` argument then, if `Ok`, returns the contained
   * value, otherwise if `Err`, returns the default value for that type.
   *
   * # Examples
   *
   * ```typescript
   * const y = Err("error");
   * console.log(y.unwrapOrDefault(String)); // ""
   * ```
   */
  unwrapOrDefault(ctor: (new () => T) | (() => T)): T {
    return typeof ctor === "function" && "prototype" in ctor
      ? new (ctor as unknown as new () => T)()
      : (ctor as unknown as () => T)();
  }

  /**
   * Returns the contained `Err` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Ok`, with a panic message including the
   * passed message, and the content of the `Ok`.
   *
   * # Examples
   *
   * ```typescript
   * const x = Err("emergency failure");
   * console.log(x.expectErr("Testing expectErr")); // "emergency failure"
   * ```
   */
  expectErr(_msg: string): E {
    return this.error;
  }

  /**
   * Returns the contained `Err` value, consuming the `self` value.
   *
   * # Panics
   *
   * Panics if the value is an `Ok`, with a custom panic message provided by
   * the `Ok`'s value.
   *
   * # Examples
   *
   * ```typescript
   * const x = Err("emergency failure");
   * console.log(x.unwrapErr()); // "emergency failure"
   * ```
   */
  unwrapErr(): E {
    return this.error;
  }

  /**
   * Returns the contained `Ok` value or a provided default.
   *
   * # Examples
   *
   * ```typescript
   * const defaultVal = 2;
   * const x = Err("error");
   * console.log(x.unwrapOr(defaultVal)); // 2
   * ```
   */
  unwrapOr(fallback: T): T {
    return fallback;
  }

  /**
   * Returns the contained `Ok` value or computes it from a closure.
   *
   * # Examples
   *
   * ```typescript
   * const k = 10;
   * console.log(Err(2).unwrapOrElse((x) => k * x)); // 20
   * ```
   */
  unwrapOrElse(fn: (err: E) => T): T {
    return fn(this.error);
  }

  /**
   * Returns `res` if the result is `Err`, otherwise returns the `Ok` value of `self`.
   */
  and<U>(_res: Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  /**
   * Returns `Err` if the result is `Err`, otherwise calls `f`
   * with the wrapped value and returns the result.
   */
  andThen<U>(_fn: (val: T) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  /**
   * Returns `res` if the result is `Err`, otherwise returns the `Ok` value of `self`.
   */
  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }

  /**
   * Returns the result if it is `Ok`, otherwise calls `op` and returns the result.
   */
  orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F> {
    return fn(this.error);
  }

  /**
   * Maps a `Result<&T, E>` to a `Result<T, E>` by copying the contents of the `Ok` part.
   */
  copied(): Result<T, E> {
    return this as unknown as Result<T, E>;
  }

  /**
   * Maps an `Option<T>` to `Option<T>` by deep-cloning the contained value.
   */
  cloned(): Option<never> {
    return Option.None();
  }

  /**
   * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
   */
  transpose<U>(this: ErrClass<Option<U>, E>): Option<Result<U, E>> {
    return Option.Some(Err(this.error));
  }

  /**
   * Flattens a nested `Result` structure.
   */
  flatten<U, F>(this: ErrClass<unknown, F>): Result<U, F> {
    return this as unknown as Result<U, F>;
  }

  /**
   * Applies control flow based on pattern matching
   * against the structural variants of `Result`.
   */
  match<U>(matchers: { Ok: (val: T) => U; Err: (err: E) => U }): U {
    return matchers.Err(this.error);
  }

  /**
   * Chains multiple unary functions or operators together, passing the entire
   * `Result` instance through the pipeline. Similar to RxJS `.pipe()`.
   */
  pipe(): Result<T, E>;
  pipe<R1>(fn1: (res: Result<T, E>) => R1): R1;
  pipe<R1, R2>(fn1: (res: Result<T, E>) => R1, fn2: (res: R1) => R2): R2;
  pipe<R1, R2, R3>(fn1: (res: Result<T, E>) => R1, fn2: (res: R1) => R2, fn3: (res: R2) => R3): R3;
  pipe<R1, R2, R3, R4>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
  ): R4;
  pipe<R1, R2, R3, R4, R5>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
  ): R5;
  pipe<R1, R2, R3, R4, R5, R6>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
  ): R6;
  pipe<R1, R2, R3, R4, R5, R6, R7>(
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
    fn7: (res: R6) => R7,
  ): R7;
  pipe<R1, R2, R3, R4, R5, R6, R7, R8>( // NOSONAR: Ensure type safety for pipe chains.
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
    fn7: (res: R6) => R7,
    fn8: (res: R7) => R8,
  ): R8;
  pipe<R1, R2, R3, R4, R5, R6, R7, R8, R9>( // NOSONAR: Ensure type safety for pipe chains.
    fn1: (res: Result<T, E>) => R1,
    fn2: (res: R1) => R2,
    fn3: (res: R2) => R3,
    fn4: (res: R3) => R4,
    fn5: (res: R4) => R5,
    fn6: (res: R5) => R6,
    fn7: (res: R6) => R7,
    fn8: (res: R7) => R8,
    fn9: (res: R8) => R9,
  ): R9;
  pipe(...fns: ((res: never) => unknown)[]): unknown {
    return pipe(this, ...fns);
  }
}

/**
 * Contains the success value.
 */
export function Ok<T, E = never>(value: T): Result<T, E> {
  return new OkClass(value);
}

/**
 * Contains the error value.
 */
export function Err<E, T = never>(error: E): Result<T, E> {
  return new ErrClass(error);
}

/**
 * Unified factory wrapper that converts fallible execution chains into a safe `Result`.
 *
 * This function handles two distinct execution models via overloading:
 * 1. **Synchronous Functions**: Wraps a throwing function,
 * returning a new function that returns a `Result`.
 * 2. **Promises**: Intercepts an asynchronous Promise settlement,
 * returning a Promise that resolves to a `Result`.
 *
 * An optional `errorMapper` closure can be passed
 * to safely normalize caught rejections into a specific error type `E`.
 *
 * # Examples
 *
 * ### 1. Synchronous Function Handling
 * ```typescript
 * const parseJson = Result.from((str: string) => JSON.parse(str));
 *
 * const success = parseJson('{"score": 10}');
 * console.log(success.unwrap()); // { score: 10 }
 *
 * const failure = parseJson("{ invalid }");
 * console.log(failure.isErr); // true
 * ```
 *
 * ### 2. Asynchronous Promise Handling
 * ```typescript
 * const promise = Deno.readTextFile("./config.json");
 * const result = await Result.from(promise);
 *
 * if (result.isOk()) {
 *     console.log("Config loaded:", result.unwrap());
 * } else {
 *     console.error("Failed to read config:", result.unwrapErr());
 * }
 * ```
 */
export function from<T, Args extends unknown[], E = Error>(
  fn: (...args: Args) => T,
  errorMapper?: (err: unknown) => E,
): (...args: Args) => Result<T, E>;
export function from<T, E = Error>(
  promise: Promise<T>,
  errorMapper?: (err: unknown) => E,
): Promise<Result<T, E>>;
export function from<T, Args extends unknown[], E = Error>(
  input: ((...args: Args) => T) | Promise<T>,
  errorMapper?: (err: unknown) => E,
): unknown {
  if (input instanceof Promise) return fromPromise(input, errorMapper);
  return fromThrowable(input, errorMapper);
}

/**
 * Execution wrapper that safely evaluates an exception-throwing synchronous function
 * and returns its output wrapped in a `Result`.
 */
export function fromThrowable<T, Args extends unknown[], E = Error>(
  fn: (...args: Args) => T,
  errorMapper?: (err: unknown) => E,
): (...args: Args) => Result<T, E> {
  return (...args: Args): Result<T, E> => {
    try {
      return Ok(fn(...args));
    } catch (error) {
      return Err(errorMapper ? errorMapper(error) : (error as E));
    }
  };
}

/**
 * Interop wrapper that catches an asynchronous Promise failure state
 * and converts it cleanly into a `Result`.
 */
export async function fromPromise<T, E = Error>(
  promise: Promise<T>,
  errorMapper?: (err: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return Ok(data);
  } catch (error) {
    return Err(errorMapper ? errorMapper(error) : (error as E));
  }
}

/**
 * Collects an array of `Result` instances.
 * If ALL instances are `Ok`, it returns an `Ok` containing an array of all success values.
 * If ANY instance is an `Err`, it returns the FIRST `Err` encountered.
 *
 * Similar to `Promise.all`.
 *
 * # Examples
 *
 * ```typescript
 * const results = [Ok(1), Ok(2), Ok(3)];
 * console.log(Result.all(results).unwrap()); // [1, 2, 3]
 *
 * const mixed = [Ok(1), Err("failed"), Ok(3)];
 * console.log(Result.all(mixed).isErr); // true
 * ```
 */
export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const res of results) {
    if (res.isErr) {
      return Err(res.unwrapErr());
    }
    values.push(res.unwrap());
  }
  return Ok(values);
}

/**
 * Collects an array of `Result` instances.
 * Returns the FIRST `Ok` instance encountered.
 * If ALL instances are `Err`, it returns an `Err` containing an array of all errors.
 *
 * Similar to `Promise.any`.
 *
 * # Examples
 *
 * ```typescript
 * const mixed = [Err("first"), Ok(42), Err("last")];
 * console.log(Result.any(mixed).unwrap()); // 42
 *
 * const failures = [Err("A"), Err("B")];
 * console.log(Result.any(failures).unwrapErr()); // ["A", "B"]
 * ```
 */
export function any<T, E>(results: Result<T, E>[]): Result<T, E[]> {
  const errors: E[] = [];
  for (const res of results) {
    if (res.isOk) {
      return Ok(res.unwrap());
    }
    errors.push(res.unwrapErr());
  }
  return Err(errors);
}

function pipe(self: Result<unknown, unknown>, ...fns: ((res: never) => unknown)[]): unknown {
  const [firstFn, ...restFns] = fns;
  if (!firstFn) return self;

  let acc = (firstFn as (arg: unknown) => unknown)(self);
  for (const fn of restFns) {
    acc = (fn as (arg: unknown) => unknown)(acc);
  }

  return acc;
}
