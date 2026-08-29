import { describe, expect, it } from "vitest";

import { Result } from "@/core/result/mod.ts";

import { all, any, from, fromNullable, None, Option, Some } from "./option.ts";

describe("Option", () => {
  describe("Basic logic and type guards", () => {
    it("should correctly distinguish between Some and None", () => {
      const some = Some(10);
      const none = None<number>();

      expect(some.isSome).toBe(true);
      expect(some.isNone).toBe(false);
      expect(none.isSome).toBe(false);
      expect(none.isNone).toBe(true);
    });

    it("should correctly evaluate isSomeAnd", () => {
      const some = Some(10);
      const none = None<number>();
      expect(some.isSomeAnd((val) => val > 5)).toBe(true);
      expect(some.isSomeAnd((val) => val < 5)).toBe(false);
      expect(none.isSomeAnd((val) => val > 5)).toBe(false);
    });

    it("should correctly evaluate isNoneOr", () => {
      const some = Some(10);
      const none = None<number>();
      expect(some.isNoneOr((val) => val > 5)).toBe(true);
      expect(some.isNoneOr((val) => val < 5)).toBe(false);
      expect(none.isNoneOr((val) => val > 5)).toBe(true);
    });

    it("should correctly identify if it contains a value", () => {
      const some = Some("hello");
      expect(some.contains("hello")).toBe(true);
      expect(some.contains("world")).toBe(false);
    });
  });

  describe("Monadic combinators", () => {
    it("should map values correctly", () => {
      const some = Some("hello");
      const mapped = some.map((val) => val.toUpperCase());
      expect(mapped.isSome).toBe(true);
      expect(mapped.unwrap()).toBe("HELLO");
    });

    it("should return None when mapping a None", () => {
      const none = None<string>();
      const mapped = none.map((val) => val.toUpperCase());
      expect(mapped.isNone).toBe(true);
    });

    it("should evaluate mapOr correctly", () => {
      const some = Some(10);
      expect(some.mapOr(42, (val) => val * 2)).toBe(20);

      const none = None<number>();
      expect(none.mapOr(42, (val) => val * 2)).toBe(42);
    });

    it("should evaluate mapOrElse correctly (lazy execution)", () => {
      const some = Some(10);
      expect(
        some.mapOrElse(
          () => 0,
          (x) => 2 * x,
        ),
      ).toBe(20);

      const none = None<number>();
      expect(
        none.mapOrElse(
          () => 20,
          (x) => 2 * x,
        ),
      ).toBe(20);
    });

    it("should chain operations with andThen", () => {
      const some = Some(10);
      const chained = some.andThen((val) => {
        if (val > 5) return Some(val * 2);
        return None<number>();
      });
      expect(chained.isSome).toBe(true);
      expect(chained.unwrap()).toBe(20);

      const none = None<number>();
      const noneChained = none.andThen((val) => {
        if (val > 5) return Some(val * 2);
        return None<number>();
      });
      expect(noneChained.isNone).toBe(true);
    });

    it("should filter values", () => {
      const some = Some(10);
      const filtered = some.filter((val) => val > 5);
      expect(filtered.isSome).toBe(true);
      expect(filtered.unwrap()).toBe(10);

      const someSmall = Some(3);
      const filteredSmall = someSmall.filter((val) => val > 5);
      expect(filteredSmall.isNone).toBe(true);
    });

    it("should handle orElse logic", () => {
      const some = Some(10);
      expect(some.orElse(() => Some(20))).toEqual(Some(10));

      const none = None<number>();
      expect(none.orElse(() => Some(20))).toEqual(Some(20));
    });

    it("should short-circuit on None", () => {
      let count = 0;
      const actions = [
        () => {
          count++;
          return Some(1);
        },
        () => {
          count++;
          return None<number>();
        },
        () => {
          count++;
          throw new Error("This should not be executed");
        },
      ];

      const evaluated: Option<number>[] = [];
      for (const fn of actions) {
        const res = fn();
        evaluated.push(res);
        if (res.isNone) break;
      }

      expect(all(evaluated).isNone).toBe(true);
      expect(count).toBe(2);
    });
  });

  describe("Logical boolean combinators", () => {
    it("should evaluate logical 'and' correctly", () => {
      const some1 = Some(1);
      const some2 = Some(2);
      const none = None<number>();

      expect(some1.and(some2).unwrap()).toBe(2);
      expect(some1.and(none).isNone).toBe(true);
      expect(none.and(some2).isNone).toBe(true);
    });

    it("should evaluate logical 'or' correctly", () => {
      const some1 = Some(1);
      const some2 = Some(2);
      const none = None<number>();

      expect(some1.or(some2).unwrap()).toBe(1);
      expect(none.or(some2).unwrap()).toBe(2);
      expect(none.or(none).isNone).toBe(true);
    });

    it("should evaluate logical 'xor' correctly", () => {
      const some1 = Some(1);
      const some2 = Some(2);
      const none = None<number>();

      // some1 XOR none -> Some(1)
      const res1 = some1.xor(none);
      expect(res1.isSome).toBe(true);
      expect(res1.unwrap()).toBe(1);

      // none XOR some1 -> Some(1)
      const res2 = none.xor(some1);
      expect(res2.isSome).toBe(true);
      expect(res2.unwrap()).toBe(1);

      // some1 XOR some2 -> None
      const res3 = some1.xor(some2);
      expect(res3.isNone).toBe(true);

      // none XOR none -> None
      const res4 = none.xor(none);
      expect(res4.isNone).toBe(true);
    });
  });

  describe("Unwrapping and extraction", () => {
    it("should unwrap a Some value", () => {
      const some = Some(10);
      expect(some.unwrap()).toBe(10);
    });

    it("should throw on unwrap of a None value", () => {
      const none = None<number>();
      expect(() => none.unwrap()).toThrow("Called `Option.unwrap()` on a `None` value");
    });

    it("should expect a value or throw with a custom message", () => {
      const some = Some(10);
      expect(some.expect("success")).toBe(10);

      const none = None<number>();
      expect(() => none.expect("failure")).toThrow("failure");
    });

    it("should work with unwrapOr", () => {
      const some = Some(10);
      expect(some.unwrapOr(20)).toBe(10);

      const none = None<number>();
      expect(none.unwrapOr(20)).toBe(20);
    });

    it("should work with unwrapOrElse", () => {
      const some = Some(10);
      expect(some.unwrapOrElse(() => 20)).toBe(10);

      const none = None<number>();
      expect(none.unwrapOrElse(() => 20)).toBe(20);
    });

    it("should work with unwrapOrDefault with primitives and classes", () => {
      expect(None<string>().unwrapOrDefault(String)).toBe("");
      expect(None<number>().unwrapOrDefault(Number)).toBe(0);
      expect(None<boolean>().unwrapOrDefault(Boolean)).toBe(false);

      class Custom {
        val = "instantiated";
      }
      expect(None<Custom>().unwrapOrDefault(Custom).val).toBe("instantiated");
      expect(None<number>().unwrapOrDefault(() => 42)).toBe(42);
    });

    it("should evaluate mapOrDefault correctly", () => {
      const some = Some("hello");
      expect(some.mapOrDefault(Number, (val) => val.length)).toBe(5);

      const none = None<string>();
      expect(none.mapOrDefault(Number, (val) => val.length)).toBe(0);
    });

    it("should maintain strict object memory reference identity upon unwrapping", () => {
      const originalObj = { data: "test-reference-identity" };
      const opt = Some(originalObj);
      const unwrappedObj = opt.unwrap();

      expect(unwrappedObj).toBe(originalObj);
    });
  });

  describe("Inspection methods", () => {
    it("should execute inspect only on Some", () => {
      let isCalled = false;
      const some = Some(10);
      some.inspect(() => {
        isCalled = true;
      });
      expect(isCalled).toBe(true);
    });

    it("should execute inspectNone only on None", () => {
      let isCalled = false;
      const some = Some(10);
      some.inspectNone(() => {
        isCalled = true;
      });
      expect(isCalled).toBe(false);

      const none = None<number>();
      none.inspectNone(() => {
        isCalled = true;
      });
      expect(isCalled).toBe(true);
    });
  });

  describe("In-place mutations", () => {
    it("should change variant from None to Some on insert", () => {
      const opt = None<number>();
      const ref = opt.insert(42);
      expect(ref).toBe(42);
      expect(opt.isSome).toBe(true);
      expect(opt.unwrap()).toBe(42);
    });

    it("should overwrite existing value on insert", () => {
      const opt = Some(10);
      expect(opt.insert(20)).toBe(20);
      expect(opt.unwrap()).toBe(20);
    });

    it("should handle getOrInsert behaviors", () => {
      const opt = None<number>();
      expect(opt.getOrInsert(5)).toBe(5);
      expect(opt.getOrInsert(10)).toBe(5);
    });

    it("should handle getOrInsertDefault and getOrInsertWith", () => {
      const opt1 = None<string>();
      expect(opt1.getOrInsertDefault(String)).toBe("");

      const opt2 = None<number>();
      expect(opt2.getOrInsertWith(() => 99)).toBe(99);
    });

    it("should handle getOrTryInsertWith via Result", () => {
      const opt = None<number>();
      const success = opt.getOrTryInsertWith(() => Result.Ok(50));
      expect(success.isOk).toBe(true);
      expect(opt.unwrap()).toBe(50);
    });
  });

  describe("Destructive extraction", () => {
    it("should take value leaving None behind with correct prototype swap", () => {
      const x = Some(10);
      const taken = x.take();
      expect(taken.unwrap()).toBe(10);
      expect(x.isNone).toBe(true);
      expect(() => x.unwrap()).toThrow("Called `Option.unwrap()` on a `None` value");
    });

    it("should do nothing when taking from None", () => {
      const x = None<number>();
      const taken = x.take();
      expect(taken.isNone).toBe(true);
      expect(x.isNone).toBe(true);
    });

    it("should take value conditionally with takeIf", () => {
      const x = Some(10);
      const taken = x.takeIf((v) => v > 5);
      expect(taken.unwrap()).toBe(10);
      expect(x.isNone).toBe(true);
    });

    it("should replace value and return old variant", () => {
      const x = Some(2);
      const old = x.replace(5);
      expect(x.unwrap()).toBe(5);
      expect(old.unwrap()).toBe(2);

      const y = None<number>();
      const oldNone = y.replace(3);
      expect(y.unwrap()).toBe(3);
      expect(oldNone.isNone).toBe(true);
    });
  });

  describe("Structural transformers", () => {
    it("should flatten nested options", () => {
      const nested = Some(Some(5));
      expect(nested.flatten().unwrap()).toBe(5);

      const nestedNone = Some(None());
      expect(nestedNone.flatten().isNone).toBe(true);
    });

    it("should evaluate match structures seamlessly", () => {
      const x = Some(10);
      const res = x.match({
        Some: (v) => v * 2,
        None: () => 0,
      });
      expect(res).toBe(20);

      const y = None<number>();
      const resNone = y.match({
        Some: (v) => v * 2,
        None: () => 100,
      });
      expect(resNone).toBe(100);
    });

    it("should zip and zipWith two options into tuples or generic evaluations", () => {
      const x = Some(10);
      const y = Some("foo");
      expect(x.zip(y)).toEqual(Some([10, "foo"]));
      expect(x.zip(None())).toEqual(None());

      const zippedWith = x.zipWith(y, (a, b) => `${a}-${b}`);
      expect(zippedWith).toEqual(Some("10-foo"));
    });

    it("should unzip options containing pairs", () => {
      const pair = Some([10, "foo"] as [number, string]);
      const [left, right] = pair.unzip();
      expect(left.unwrap()).toBe(10);
      expect(right.unwrap()).toBe("foo");

      const nonePair = None<[number, string]>();
      const [nLeft, nRight] = nonePair.unzip();
      expect(nLeft.isNone).toBe(true);
      expect(nRight.isNone).toBe(true);
    });

    it("should transpose Option of Result to Result of Option", () => {
      const someOk = Some(Result.Ok(42));
      expect(someOk.transpose().unwrap().unwrap()).toBe(42);

      const none = None<Result<number, string>>();
      expect(none.transpose().unwrap().isNone).toBe(true);
    });

    it("should reduce options over an accumulator", () => {
      const some = Some(10);
      expect(some.reduce((acc, val) => acc + val)).toEqual(Some(10));
    });

    it("should transform into array sequences through the generator protocol", () => {
      const someValues = [...Some(44)];
      expect(someValues).toEqual([44]);

      const noneValues = [...None<number>()];
      expect(noneValues).toEqual([]);
    });
  });

  describe("Immutability, copying, and interoperability helpers", () => {
    it("should separate copied vs cloned behaviors", () => {
      const obj = { nested: { value: 1 } };
      const opt = Some(obj);

      const copiedOpt = opt.copied();
      expect(copiedOpt.unwrap()).toBe(obj);

      const clonedOpt = opt.cloned();
      expect(clonedOpt.unwrap()).not.toBe(obj);
      expect(clonedOpt.unwrap()).toEqual(obj);
    });

    it("should instantiate correctly from nullable targets", () => {
      expect(from(undefined).isNone).toBe(true);
      expect(from(null).isNone).toBe(true);
      expect(from(0).isSome).toBe(true);
      expect(fromNullable(null).isNone).toBe(true);
    });

    it("should safely convert to and from Result structures", () => {
      const some = Some(10);
      expect(some.okOr("error").isOk).toBe(true);
      const none = None();
      expect(none.okOrElse(() => "lazy-error").isErr).toBe(true);
    });

    it("should evaluate all and any helpers over collections", () => {
      const optionsArray = [Some(1), Some(2), Some(3)];
      expect(all(optionsArray)).toEqual(Some([1, 2, 3]));
      expect(all([...optionsArray, None()])).toEqual(None());
      expect(any([None(), Some(2), None()])).toEqual(Some(2));
      expect(any([None(), None()])).toEqual(None());
    });

    it("should handle null/undefined values wrapped directly in Some", () => {
      const someNull = Some(null);
      expect(someNull.isSome).toBe(true);
      expect(someNull.unwrap()).toBeNull();

      const someUndef = Some(undefined);
      expect(someUndef.isSome).toBe(true);
      expect(someUndef.unwrap()).toBeUndefined();
    });
  });
});
