/**
 * Это значение примерно равно вот этому?
 * @param theValue значение, КОТОРОЕ примерно равно
 * @param is значение, КОТОРОМУ примерно равно
 * @param withPrecision примерно - это сколько?
 */
export function approximately(theValue: number, is: number, withPrecision = 1e-8) {
  return Math.abs(theValue - is) <= withPrecision
}
