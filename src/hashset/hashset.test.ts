import { describe, expect, it } from "vitest";

import { from, HashSet } from "./hashset.ts";

describe("HashSet", () => {
  describe("Basic operations", () => {
    it("should track size correctly", () => {
      const set = new HashSet<number>();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);

      expect(set.insert(1)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.isEmpty()).toBe(false);

      expect(set.insert(2)).toBe(true);
      expect(set.size).toBe(2);
    });

    it("should handle insertion of duplicate values and return false", () => {
      const set = new HashSet<number>();
      expect(set.insert(1)).toBe(true);
      expect(set.insert(1)).toBe(false);
      expect(set.size).toBe(1);
    });

    it("should correctly report membership via contains", () => {
      const set = new HashSet<string>();
      set.insert("apple");
      set.insert("banana");

      expect(set.contains("apple")).toBe(true);
      expect(set.contains("banana")).toBe(true);
      expect(set.contains("cherry")).toBe(false);
    });

    it("should remove elements correctly and return a boolean", () => {
      const set = new HashSet<number>();
      set.insert(1);

      expect(set.remove(1)).toBe(true);
      expect(set.remove(1)).toBe(false);
      expect(set.size).toBe(0);
    });

    it("should clear all elements using clear()", () => {
      const set = new HashSet<number>();
      set.insert(1);
      set.insert(2);

      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it("should handle null/undefined as values", () => {
      const set = new HashSet<string | null | undefined>();
      set.insert(null);
      set.insert(undefined);

      expect(set.size).toBe(2);
      expect(set.contains(null)).toBe(true);
      expect(set.contains(undefined)).toBe(true);
    });

    it("should drain all elements and empty the set", () => {
      const set = new HashSet<number>();
      set.insert(1);
      set.insert(2);
      set.insert(3);

      const drained = [...set.drain()];
      expect(drained).toContain(1);
      expect(drained).toContain(2);
      expect(drained).toContain(3);
      expect(drained).toHaveLength(3);
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
    });

    it("should retain elements based on a predicate", () => {
      const set = new HashSet<number>();
      set.insert(1);
      set.insert(2);
      set.insert(3);
      set.insert(4);

      set.retain((val) => val % 2 === 0);
      expect(set.size).toBe(2);
      expect(set.contains(2)).toBe(true);
      expect(set.contains(4)).toBe(true);
      expect(set.contains(1)).toBe(false);
      expect(set.contains(3)).toBe(false);
    });

    it("should allow direct iteration over elements without draining", () => {
      const set = new HashSet<number>();
      set.insert(10);
      set.insert(20);

      const values = [...set];
      expect(values).toContain(10);
      expect(values).toContain(20);
      expect(set.size).toBe(2);
    });

    it("should not overwrite the original object reference upon duplicate insertion", () => {
      const set = new HashSet<{ id: number; meta: string }>();
      const firstRef = { id: 1, meta: "first" };

      set.insert(firstRef);
      const wasInserted = set.insert(firstRef);
      expect(wasInserted).toBe(false);

      const containedRef = [...set][0];
      expect(containedRef).toBe(firstRef);
    });
  });

  describe("Advanced filtering", () => {
    it("should extract elements based on a predicate and remove them from the set", () => {
      const set = new HashSet<number>();
      set.insert(1);
      set.insert(2);
      set.insert(3);
      set.insert(4);

      const extracted = [...set.extractIf((val) => val % 2 === 0)];
      expect(extracted).toContain(2);
      expect(extracted).toContain(4);
      expect(extracted).toHaveLength(2);

      expect(set.size).toBe(2);
      expect(set.contains(1)).toBe(true);
      expect(set.contains(3)).toBe(true);
    });
  });

  describe("Set algebra and relations", () => {
    it("should perform intersection correctly", () => {
      const set1 = new HashSet<number>();
      set1.insert(1);
      set1.insert(2);
      set1.insert(3);

      const set2 = new HashSet<number>();
      set2.insert(2);
      set2.insert(3);
      set2.insert(4);

      const result = set1.intersection(set2);
      expect(result.size).toBe(2);
      expect(result.contains(2)).toBe(true);
      expect(result.contains(3)).toBe(true);
      expect(result.contains(1)).toBe(false);
      expect(result.contains(4)).toBe(false);
    });

    it("should perform union correctly", () => {
      const set1 = new HashSet<number>();
      set1.insert(1);
      set1.insert(2);

      const set2 = new HashSet<number>();
      set2.insert(2);
      set2.insert(3);

      const result = set1.union(set2);
      expect(result.size).toBe(3);
      expect(result.contains(1)).toBe(true);
      expect(result.contains(2)).toBe(true);
      expect(result.contains(3)).toBe(true);
    });

    it("should perform difference correctly", () => {
      const set1 = new HashSet<number>();
      set1.insert(1);
      set1.insert(2);
      set1.insert(3);

      const set2 = new HashSet<number>();
      set2.insert(2);
      set2.insert(4);

      const result = set1.difference(set2);
      expect(result.size).toBe(2);
      expect(result.contains(1)).toBe(true);
      expect(result.contains(3)).toBe(true);
      expect(result.contains(2)).toBe(false);
    });

    it("should perform symmetricDifference correctly", () => {
      const set1 = new HashSet<number>();
      set1.insert(1);
      set1.insert(2);

      const set2 = new HashSet<number>();
      set2.insert(2);
      set2.insert(3);

      const result = set1.symmetricDifference(set2);
      expect(result.size).toBe(2);
      expect(result.contains(1)).toBe(true);
      expect(result.contains(3)).toBe(true);
      expect(result.contains(2)).toBe(false);
    });

    it("should correctly identify subset and disjoint relations", () => {
      const set1 = new HashSet<number>();
      set1.insert(1);
      set1.insert(2);

      const set2 = new HashSet<number>();
      set2.insert(1);
      set2.insert(2);
      set2.insert(3);

      const set3 = new HashSet<number>();
      set3.insert(4);

      expect(set1.isSubsetOf(set2)).toBe(true);
      expect(set2.isSubsetOf(set1)).toBe(false);

      expect(set1.isDisjointFrom(set3)).toBe(true);
      expect(set1.isDisjointFrom(set2)).toBe(false);
    });

    it("should ensure algebra results are new instances and original sets are unchanged", () => {
      const set1 = new HashSet<number>();
      set1.insert(1);
      const set2 = new HashSet<number>();
      set2.insert(2);

      const result = set1.union(set2);
      expect(result).not.toBe(set1);
      expect(result).not.toBe(set2);
      expect(set1.size).toBe(1);
      expect(set2.size).toBe(1);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty sets in algebra", () => {
      const empty = new HashSet<number>();
      const set = new HashSet<number>();
      set.insert(1);

      expect(empty.union(set).size).toBe(1);
      expect(set.intersection(empty).size).toBe(0);
      expect(set.difference(empty).size).toBe(1);
      expect(set.symmetricDifference(empty).size).toBe(1);
    });

    it("should handle different types in a collection", () => {
      const set1 = new HashSet<string | number>();
      set1.insert("a");
      set1.insert(1);

      const set2 = new HashSet<string | number>();
      set2.insert("b");

      const result = set1.union(set2);
      expect(result.size).toBe(3);
      expect(result.contains("a")).toBe(true);
      expect(result.contains(1)).toBe(true);
      expect(result.contains("b")).toBe(true);
    });

    it("should evaluate structural set equality correctly", () => {
      const set1 = new HashSet<number>();
      set1.insert(1);
      set1.insert(2);

      const set2 = new HashSet<number>();
      set2.insert(2);
      set2.insert(1);
      expect([...set1]).toEqual(expect.arrayContaining([...set2]));

      set2.insert(3);
      expect([...set1]).not.toEqual(expect.arrayContaining([...set2]));
    });

    it("should deduplicate items correctly when instantiated from an iterable array", () => {
      const set = from([1, 2, 2, 3, 3, 4]);
      expect(set.size).toBe(4);
      expect([...set]).toEqual([1, 2, 3, 4]);
    });

    it("should replace elements correctly and return the old value as an Option", () => {
      const set = new HashSet<string>();

      // Case 1: Replacing a non-existing value should return None.
      expect(set.replace("a").isNone).toBe(true);
      expect(set.size).toBe(1);

      // Case 2: Replacing an existing value should return Some(oldValue).
      const old = set.replace("a");
      expect(old.isSome).toBe(true);
      expect(old.unwrap()).toBe("a");
      expect(set.size).toBe(1);
    });
  });
});
