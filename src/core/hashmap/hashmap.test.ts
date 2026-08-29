import { describe, expect, it } from "vitest";

import { OccupiedEntry } from "@/core/hashmap/mod.ts";
import { Option } from "@/core/option/mod.ts";

import { from, HashMap } from "./hashmap.ts";

describe("HashMap", () => {
  describe("Basic operations", () => {
    it("should track size correctly", () => {
      const map = new HashMap<number, string>();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);

      expect(map.insert(1, "a").isNone).toBe(true);
      expect(map.size).toBe(1);
      expect(map.isEmpty()).toBe(false);

      expect(map.insert(2, "b").isNone).toBe(true);
      expect(map.size).toBe(2);
    });

    it("should handle insertion of existing keys by updating and returning the old value", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");

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

      const keys = map.keys().toArray();
      expect(keys).toContain(1);
      expect(keys).toContain(2);
      expect(keys).toHaveLength(2);

      const values = map.values().toArray();
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

    it("should remove elements and return both key and value via removeEntry", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");

      const removed = map.removeEntry(1);
      expect(removed.isSome).toBe(true);

      const [key, value] = removed.unwrap();
      expect(key).toBe(1);
      expect(value).toBe("a");
      expect(map.size).toBe(0);

      expect(map.removeEntry(1).isNone).toBe(true);
    });

    it("should allow in-place modification of values during iteration", () => {
      const map = new HashMap<number, number>();
      map.insert(1, 10);
      map.insert(2, 20);

      for (const key of map.keys()) {
        const valOpt = map.get(key);
        if (valOpt.isSome) map.insert(key, valOpt.unwrap() * 2);
      }

      expect(map.get(1).unwrap()).toBe(20);
      expect(map.get(2).unwrap()).toBe(40);
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

    it("should support removing elements destructively directly through an occupied entry", () => {
      const map = new HashMap<number, string>();
      map.insert(1, "a");

      const entry = map.entry<OccupiedEntry<number, string>>(1);
      const removedValue = entry.remove();
      expect(removedValue).toBe("a");
      expect(map.size).toBe(0);
      expect(map.containsKey(1)).toBe(false);
    });

    it("should expose the target key via entry.key() for both vacant and occupied states", () => {
      const map = new HashMap<string, number>();

      // Case 1: Vacant state.
      const vacantEntry = map.entry("ghost");
      expect(vacantEntry.key()).toBe("ghost");

      // Case 2: Occupied state.
      map.insert("ghost", 42);
      const occupiedEntry = map.entry("ghost");
      expect(occupiedEntry.key()).toBe("ghost");
    });
  });

  describe("Edge cases", () => {
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

    it("should evaluate structural map equality correctly", () => {
      const map1 = new HashMap<number, number>();
      map1.insert(1, 10);
      map1.insert(2, 20);

      const map2 = new HashMap<number, number>();
      map2.insert(1, 10);
      map2.insert(2, 20);

      const entries1 = [...map1.drain()].toSorted((a, b) => a[0] - b[0]);
      const entries2 = [...map2.drain()].toSorted((a, b) => a[0] - b[0]);
      expect(entries1).toEqual(entries2);

      map2.insert(2, 20);
      map2.insert(1, 10);
      map2.insert(3, 30);

      const entries2Extended = [...map2.drain()].toSorted((a, b) => a[0] - b[0]);
      expect(entries1).not.toEqual(entries2Extended);
    });

    it("should deduplicate entries correctly when instantiated from iterables or arrays", () => {
      const map = from([
        [1, 10],
        [2, 20],
        [1, 99],
      ]);
      expect(map.size).toBe(2);
      expect(map.get(1).unwrap()).toBe(99);
      expect(map.get(2).unwrap()).toBe(20);
    });
  });
});
