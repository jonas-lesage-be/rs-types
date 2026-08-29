import { describe, expect, it } from "vitest";

import { None, Some } from "./option.ts";

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

    it("should work with unwrapOrDefault", () => {
      const some = Some("data");
      expect(some.unwrapOrDefault(String)).toBe("data");

      const none = None<string>();
      expect(none.unwrapOrDefault(String)).toBe("");
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
      expect(opt.getOrInsert(10)).toBe(5); // Should remain 5
    });

    it("should lazy insert via getOrInsertWith", () => {
      const opt = None<string>();
      expect(opt.getOrInsertWith(() => "inserted")).toBe("inserted");
    });
  });

  describe("Destructive extraction", () => {
    it("should take value leaving None behind", () => {
      const x = Some(10);
      const taken = x.take();
      expect(taken.unwrap()).toBe(10);
      expect(x.isNone).toBe(true);
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
  });

  describe("Edge cases", () => {
    it("should handle null/undefined values wrapped in Some", () => {
      const someNull = Some(null);
      expect(someNull.isSome).toBe(true);
      expect(someNull.unwrap()).toBeNull();

      const someUndef = Some(undefined);
      expect(someUndef.isSome).toBe(true);
      expect(someUndef.unwrap()).toBeUndefined();
    });
  });
});
