import { describe, expect, it } from "vitest";

import { Option } from "@/core/option/mod.ts";

import { HashMap } from "./hashmap.ts";

describe("HashMap", () => {
  describe("Basic operations", () => {
    it("should track size correctly", () => {
      const map = new HashMap<number, string>();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);

      // Rust spec: insert returns Option.None() if key didn't exist
      expect(map.insert(1, "a").isNone).toBe(true);
      expect(map.size).toBe(1);
      expect(map.isEmpty()).toBe(false);

      expect(map.insert(2, "b").isNone).toBe(true);
      expect(map.size).toBe(2);
    });

    it("should handle insertion of existing keys by updating and returning the old value", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");

      // Rust spec: insert returns Option.Some(old_value) if key existed
      const old = map.insert(1, "b");
      expect(old.isSome).toBe(true);
      expect(old.unwrap()).toBe("a");

      expect(map.size).toBe(1);
      expect(map.get(1).unwrap()).toBe("b");
    });

    it("should correctly verify key presence via containsKey", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");

      expect(map.containsKey(1)).toBe(true);
      expect(map.containsKey(2)).toBe(false);
    });

    it("should remove elements and return the old value as an Option", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");

      // Rust spec: remove returns Option.Some(value) or Option.None()
      const removed = map.remove(1);
      expect(removed.isSome).toBe(true);
      expect(removed.unwrap()).toBe("a");
      expect(map.size).toBe(0);

      const removedMissing = map.remove(1);
      expect(removedMissing.isNone).toBe(true);
    });

    it("should clear the map correctly", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");
      map.insert(2, "b");
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("should drain all elements and empty the map", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");
      map.insert(2, "b");

      const drained = [...map.drain()];
      expect(drained).toContainEqual([1, "a"]);
      expect(drained).toContainEqual([2, "b"]);
      expect(drained).toHaveLength(2);
      expect(map.isEmpty()).toBe(true);
      expect(map.size).toBe(0);
    });

    it("should provide correct keys and values iterators", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");
      map.insert(2, "b");

      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      const keys = [...map.keys()];
      expect(keys).toContain(1);
      expect(keys).toContain(2);
      expect(keys).toHaveLength(2);

      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      const values = [...map.values()];
      expect(values).toContain("a");
      expect(values).toContain("b");
      expect(values).toHaveLength(2);
    });

    it("should handle null/undefined values", () => {
      const map = new HashMap<number, string | null | undefined>();
      map.insert(1, null);
      map.insert(2, undefined);

      expect(map.size).toBe(2);
      expect(map.get(1).unwrap()).toBeNull();
      expect(map.get(2).unwrap()).toBeUndefined();
    });
  });

  describe("Advanced Filtering", () => {
    it("should retain elements based on a predicate", () => {
      const map = new HashMap<number, number>();
      map.insert(1, 10);
      map.insert(2, 20);
      map.insert(3, 30);
      map.insert(4, 40);

      map.retain((key, _x) => key % 2 === 0);
      expect(map.size).toBe(2);
      expect(map.get(2).unwrap()).toBe(20);
      expect(map.get(4).unwrap()).toBe(40);
      expect(map.get(1).isNone).toBe(true);
      expect(map.get(3).isNone).toBe(true);
    });

    it("should extract elements based on a predicate and remove them from the map", () => {
      const map = new HashMap<number, number>();
      map.insert(1, 10);
      map.insert(2, 20);
      map.insert(3, 30);
      map.insert(4, 40);

      const extracted = [...map.extractIf((key, _x) => key % 2 === 0)];
      expect(extracted).toContainEqual([2, 20]);
      expect(extracted).toContainEqual([4, 40]);
      expect(map.size).toBe(2);
      expect(map.get(1).isSome).toBe(true);
      expect(map.get(3).isSome).toBe(true);
    });
  });

  describe("Entry API", () => {
    it("should provide correct behavior for orInsert", () => {
      // Case 1: Value already exists.
      const map = new HashMap<number, string>();
      map.insert(1, "a");
      const val1 = map.entry(1).orInsert("default_1");
      expect(val1).toBe("a");

      const val2 = map.entry(1).orInsert("default_2");
      expect(val2).toBe("a");

      // Case 2: Value does not exist.
      map.clear();
      const val3 = map.entry(2).orInsert("dynamic");
      expect(val3).toBe("dynamic");
      expect(map.get(2).unwrap()).toBe("dynamic");
    });

    it("should provide correct behavior for orInsertWith", () => {
      const map = new HashMap<number, string>();

      // Case 1: Value exists.
      map.insert(1, "a");
      const val1 = map.entry(1).orInsertWith(() => "new");
      expect(val1).toBe("a");

      // Case 2: Value missing.
      map.clear();
      const val2 = map.entry(2).orInsertWith(() => "dynamic");
      expect(val2).toBe("dynamic");
      expect(map.get(2).unwrap()).toBe("dynamic");
    });

    it("should perform in-place modifications with andModify", () => {
      const map = new HashMap<number, number>();
      map.insert(1, 10);

      // Update existing.
      map.entry(1).andModify((val) => val + 1);
      expect(map.get(1).unwrap()).toBe(11);

      // Combine with orInsert.
      map.clear();
      const value = map
        .entry(2)
        .andModify((val) => val + 1)
        .orInsert(100);
      expect(value).toBe(100);
      expect(map.get(2).unwrap()).toBe(100);
    });

    it("should support chained operations", () => {
      const map = new HashMap<number, number>();

      // Case 1: Value missing.
      const valueMissing = map
        .entry(1)
        .andModify((val) => val + 1)
        .orInsert(10);

      expect(valueMissing).toBe(10);
      expect(map.get(1).unwrap()).toBe(10);

      // Case 2: Value exists.
      const valueExists = map
        .entry(1)
        .andModify((val) => val + 1)
        .orInsert(10);

      expect(valueExists).toBe(11);
      expect(map.get(1).unwrap()).toBe(11);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty maps in various operations", () => {
      const map = new HashMap<number, string>();

      expect(map.drain()).toBeDefined();
      expect(map.isEmpty()).toBe(true);
      expect(map.retain(() => true)).toBe(void 0);
      expect(map.extractIf((_k, _v) => true)).toBeDefined();
    });

    it("should handle standard types as keys and values", () => {
      const map = new HashMap<string | number, Option<string>>();
      map.insert("key1", Option.Some("val1"));
      map.insert(2, Option.None());

      expect(map.get("key1").unwrap()).toEqual(Option.Some("val1"));
      expect(map.get(2).unwrap()).toEqual(Option.None());
    });
  });
});
