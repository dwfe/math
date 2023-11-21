/**
 * Логарифмирование - это операция обратная возведению в степень.
 * Логарифмирование нужно для того, чтобы вычислить показатель степени.
 *
 * Возведение в степень:
 *   base^a = value,
 *
 *   здесь base - основание
 *            a - показатель
 *
 * Чтобы вычислить показатель - a - надо выполнить логарифмирование:
 *   a = log base (value)
 *
 * В JavaScript есть только натуральный логарифм - Math.log, поэтому еще приходится выполнять смену базы:
 *   - https://stackoverflow.com/questions/3019278/how-can-i-specify-the-base-for-math-log-in-javascript#answer-3019290
 *   - https://en.wikipedia.org/wiki/Logarithm#Change_of_base
 *
 *
 * @param value - результат возведения в степень
 * @param base - основание при возведении в степень
 */
export function logarithm(base: number, value: number): number {
  return Math.log(value) / Math.log(base);
}
