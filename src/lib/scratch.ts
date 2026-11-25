/** Ignore transparent margins when measuring how much wax has been scratched. */
export function measureScratchCoverage(original: Uint8ClampedArray, current: Uint8ClampedArray): number {
  if (original.length !== current.length) return 0;
  let painted = 0;
  let erased = 0;
  for (let alpha = 3; alpha < original.length; alpha += 16) {
    if (original[alpha] <= 128) continue;
    painted++;
    if (current[alpha] <= 128) erased++;
  }
  return painted ? erased / painted : 0;
}
