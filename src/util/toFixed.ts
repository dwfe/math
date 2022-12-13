/**
 * Returns a number with a limited number of decimal digits.
 *   https://github.com/openlayers/openlayers/blob/main/src/ol/math.js#L163
 */
export function toFixed(n: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}
