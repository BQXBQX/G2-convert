import { expect, test } from "vitest";
import { add } from "@g2-convert/core";

test("adds 1 + 2 to equal 3", () => {
  expect(add(1, 2)).toBe(3);
});
