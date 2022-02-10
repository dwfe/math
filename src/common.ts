export function isNumber(data: any): boolean {
  return !isNaN(data) && !isNaN(parseFloat(data)) && isFinite(data);
}

export function divideWithoutRemainder(value: number, by: number): number {
  return (value - value % by) / by;
}
