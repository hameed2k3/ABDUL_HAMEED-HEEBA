import assert from "node:assert/strict";
import { test } from "node:test";
import { measureScratchCoverage } from "../src/lib/scratch.ts";

function samples(alphas: number[]) {
  const result = new Uint8ClampedArray(alphas.length * 16);
  alphas.forEach((alpha, index) => { result[index * 16 + 3] = alpha; });
  return result;
}

test("a seal's transparent margins do not count as already scratched", () => {
  const wax = samples([0, 0, 255, 255, 255, 255, 0, 0]);
  assert.equal(measureScratchCoverage(wax, wax), 0);
  assert.equal(measureScratchCoverage(wax, samples([0, 0, 0, 0, 255, 255, 0, 0])), .5);
});

test("missing artwork cannot immediately complete the scratch reveal", () => {
  assert.equal(measureScratchCoverage(samples([0, 0]), samples([0, 0])), 0);
});
