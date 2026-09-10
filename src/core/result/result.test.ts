import { describe, expect, it } from "vitest";

import { Option } from "@/core/option/mod.ts";

import { Err, Ok, Result } from "./result.ts";

describe("Result", () => {
  describe("Basic logic and type guards", () => {
    it("should correctly distinguish between Ok and Err", () => {
      const ok = Ok(10);
      const err = Err("error");

      expect(ok.isOk).toBe(true);
      expect(ok.isErr).toBe(false);
      expect(err.isOk).toBe(false);
      expect(err.isErr).toBe(true);
    });

    it("should correctly evaluate isOkAnd", () => {
      const ok = Ok(10);
      expect(ok.isOkAnd((val) => val > 5)).toBe(true);
      expect(ok.isOkAnd((val) => val < 5)).toBe(false);
    });

    it("should correctly evaluate isErrAnd", () => {
      const err = Err("error");
      expect(err.isErrAnd((e) => e === "error")).toBe(true);
      expect(err.isErrAnd((e) => e !== "error")).toBe(false);
    });

    it("should correctly identify if it contains a value", () => {
      const ok = Ok("hello");
      expect(ok.contains("hello")).toBe(true);
      expect(ok.contains("world")).toBe(false);
    });

    it("should correctly identify if it contains an error", () => {
      const err = Err("error");
      expect(err.containsErr("error")).toBe(true);
      expect(err.containsErr("fail")).toBe(false);
    });
  });

  describe("Monadic combinators", () => {
    it("should map values correctly", () => {
      const ok = Ok("hello");
      const mapped = ok.map((val) => val.toUpperCase());
      expect(mapped.isOk).toBe(true);
      expect(mapped.unwrap()).toBe("HELLO");
    });

    it("should not execute map on an Err", () => {
      const err = Err<string, string>("failure");
      const mapped = err.map((val) => val.toUpperCase());
      expect(mapped.isErr).toBe(true);
      expect(mapped.unwrapErr()).toBe("failure");
    });

    it("should map errors correctly", () => {
      const ok = Ok(10);
      const mapped = ok.mapErr((_x) => "error message");
      expect(mapped.isOk).toBe(true);
      expect(mapped.unwrap()).toBe(10);
    });

    it("should evaluate map_err on an Err", () => {
      const err = Err<string, number>("fail");
      const mapped = err.mapErr((_x) => "error message");
      expect(mapped.isErr).toBe(true);
      expect(mapped.unwrapErr()).toBe("error message");
    });

    it("should evaluate mapOr correctly", () => {
      const ok = Ok(10);
      expect(ok.mapOr(42, (val) => val * 2)).toBe(20);

      const err = Err<string, number>("error");
      expect(err.mapOr(42, (val) => val * 2)).toBe(42);
    });

    it("should evaluate mapOrElse correctly (lazy)", () => {
      const ok = Ok(10);
      expect(
        ok.mapOrElse(
          () => 0,
          (val) => val * 2,
        ),
      ).toBe(20);

      const err = Err<string, number>("error");
      expect(
        err.mapOrElse(
          () => 50,
          (val) => val * 2,
        ),
      ).toBe(50);
    });

    it("should chain with andThen", () => {
      const ok = Ok<number, string>(10);
      const chained = ok.andThen((val) => (val > 5 ? Ok(val * 2) : Err("too small")));
      expect(chained.isOk).toBe(true);
      expect(chained.unwrap()).toBe(20);

      const err = Err<string, number>("initial error");
      const chainedErr = err.andThen((val) => (val > 5 ? Ok(val * 2) : Err("too small")));
      expect(chainedErr.isErr).toBe(true);
      expect(chainedErr.unwrapErr()).toBe("initial error");
    });

    it("should handle orElse logic", () => {
      const ok = Ok<number, string>(10);
      expect(ok.orElse((_x) => Ok(20)).unwrap()).toBe(10);

      const err = Err<string, number>("error");
      expect(err.orElse((_x) => Ok(20)).unwrap()).toBe(20);
    });

    it("should evaluate logical 'and' correctly", () => {
      const ok1 = Ok<number, string>(666);
      const ok2 = Ok<number, string>(667);
      const err = Err<string, number>("sadface");

      expect(ok1.and(ok2).unwrap()).toBe(667);
      expect(ok1.and(Err("bad")).unwrapErr()).toBe("bad");
      expect(err.and(ok2).unwrapErr()).toBe("sadface");
    });

    it("should evaluate logical 'or' correctly", () => {
      const ok = Ok<number, string>(666);
      const err1 = Err<string, number>("sadface");
      const err2 = Err<string, number>("bad");

      expect(ok.or(Ok(667)).unwrap()).toBe(666);
      expect(ok.or(err2).unwrap()).toBe(666);
      expect(err1.or(Ok(667)).unwrap()).toBe(667);
      expect(err1.or(err2).unwrapErr()).toBe("bad");
    });

    it("should short-circuit collections on Err", () => {
      const actions = [
        () => Ok<number, string>(1),
        () => Err<string, number>("fail"),
        () => {
          throw new Error("Should not be executed");
        },
      ];

      const evaluated: Result<number, string>[] = [];
      for (const fn of actions) {
        const res = fn();
        evaluated.push(res);
        if (res.isErr) break;
      }

      expect(evaluated).toHaveLength(2);
    });
  });

  describe("Extraction", () => {
    it("should unwrap a Ok value", () => {
      const ok = Ok(10);
      expect(ok.unwrap()).toBe(10);
    });

    it("should throw on unwrap of an Err value", () => {
      const err = Err<string, number>("error");
      expect(() => err.unwrap()).toThrow("error");
    });

    it("should expect a value or throw with message", () => {
      const ok = Ok(10);
      expect(ok.expect("success")).toBe(10);

      const err = Err<string, number>("failure");
      expect(() => err.expect("failure")).toThrow("failure");
    });

    it("should unwrapErr from an Err", () => {
      const err = Err<string, number>("error");
      expect(err.unwrapErr()).toBe("error");
    });

    it("should throw on unwrapErr of an Ok", () => {
      const ok = Ok(10);
      expect(() => ok.unwrapErr()).toThrow("Called `Result.unwrapErr()` on an `Ok` value");
    });

    it("should work with unwrapOr", () => {
      const ok = Ok(10);
      expect(ok.unwrapOr(20)).toBe(10);

      const err = Err<string, number>("error");
      expect(err.unwrapOr(20)).toBe(20);
    });

    it("should work with unwrapOrElse", () => {
      const ok = Ok(10);
      expect(ok.unwrapOrElse(() => 20)).toBe(10);

      const err = Err<string, number>("error");
      expect(err.unwrapOrElse(() => 20)).toBe(20);
    });

    it("should work with unwrapOrDefault", () => {
      const ok = Ok("data");
      expect(ok.unwrapOrDefault(String)).toBe("data");

      const err = Err<string, string>("error");
      expect(err.unwrapOrDefault(String)).toBe("");
    });

    it("should preserve strict object memory reference identity upon unwrapping", () => {
      const originalObj = { data: "reference-parity" };
      const res = Ok(originalObj);

      expect(res.unwrap()).toBe(originalObj);
    });
  });

  describe("Options interop", () => {
    it("should convert to Option via ok()", () => {
      const ok = Ok(10);
      const result = ok.ok();
      expect(result.isSome).toBe(true);
      expect(result.unwrap()).toBe(10);
    });

    it("should convert to Option via err()", () => {
      const err = Err<string, number>("error");
      const result = err.err();
      expect(result.isSome).toBe(true);
      expect(result.unwrap()).toBe("error");
    });

    it("should transpose Result of Option to Option of Result", () => {
      const resOptSome = Ok(Option.Some(5));
      const optResSome = resOptSome.transpose();

      expect(optResSome.isSome).toBe(true);
      expect(optResSome.unwrap().unwrap()).toBe(5);

      const resOptNone = Ok(Option.None());
      expect(resOptNone.transpose().isNone).toBe(true);

      const resErr = Err<string, Option<number>>("error");
      const optResErr = resErr.transpose();
      expect(optResErr.isSome).toBe(true);
      expect(optResErr.unwrap().unwrapErr()).toBe("error");
    });
  });

  describe("Edge cases", () => {
    it("should handle null/undefined", () => {
      const okNull = Ok(null);
      expect(okNull.isOk).toBe(true);
      expect(okNull.unwrap()).toBeNull();

      const errNull = Err(null);
      expect(errNull.isErr).toBe(true);
      expect(errNull.unwrapErr()).toBeNull();
    });
  });
});
