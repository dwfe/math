/**
 * Заменяет числу десятичную часть на заданную.
 * Примеры:
 *    - truncToDecimals(123.456)        -> 123.5
 *    - truncToDecimals(123.456, 0.765) -> 123.765
 *    - truncToDecimals(-64.433)        -> -64.5
 *    - truncToDecimals(-64.433, 0.77)  -> -64.77
 *    - truncToDecimals(0)              -> 0.5
 *    - truncToDecimals(-0, 0.89)       -> 0.89
 */
export const truncToDecimals = (n: number, decimalsPart = 0.5) => {

  const sign = Math.sign(n);
  if (sign) { // если число не равно 0
    return Math.trunc(n) + sign * decimalsPart
  }
  return decimalsPart;

}
