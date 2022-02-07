export const isNumber = data =>
  !isNaN(data) && !isNaN(parseFloat(data)) && isFinite(data)
;

export const divideWithoutRemainder = (value, by) =>
  (value - value % by) / by
;
