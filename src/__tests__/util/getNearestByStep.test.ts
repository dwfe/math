import {getNearestByStep} from "../../util/getNearestByStep";

describe('getNearestByStep', () => {
  test('check', () => {
    expect(getNearestByStep(1.75, 1, true)).toEqual(2)
    expect(getNearestByStep(1.75, 1, false)).toEqual(1)

    expect(getNearestByStep(1, 1, true)).toEqual(1)
    expect(getNearestByStep(1, 1, false)).toEqual(1)

    expect(getNearestByStep(10, 1.5, true)).toEqual(10.5)
    expect(getNearestByStep(10, 1.5, false)).toEqual(9)

    expect(getNearestByStep(-5.5, 1, true)).toEqual(-5)
    expect(getNearestByStep(-5.5, 1, false)).toEqual(-6)
  })
})
