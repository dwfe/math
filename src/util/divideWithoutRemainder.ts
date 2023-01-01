export function divideWithoutRemainder(value: number, divideBy: number): number {
  return (value - value % divideBy) / divideBy;
}
