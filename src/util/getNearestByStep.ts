/**
 * Рассчитывает ближайшее значение к заданному с учетом шага.
 * Пример:
 *   У нас есть: testValue и шаг.
 *   Нам надо получить значение ближайшее к testValue с учетом шага и с учетом какое ближайшее надо взять
 *   Например: testValue 1.7, step 1, roundUp=true
 *             +1  <testValue>  +2
 *             результат 2
 */
export function getNearestByStep(testValue: number, step: number, roundUp = true): number {
  const round = roundUp ? Math.ceil : Math.floor;
  return round(testValue / step) * step;
}
