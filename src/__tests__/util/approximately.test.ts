import {approximately} from "../../util";

describe('approximately', () => {
  test('approximately', () => {
    expect(approximately(0.01, 0)).toBe(false)
    expect(approximately(0.1e-8, 0)).toBe(true)
    expect(approximately(-0.1e-8, 0)).toBe(true)
    expect(approximately(-0.999999999, -1)).toBe(true)
    expect(approximately(0.9999999900001, 1)).toBe(true)
    expect(approximately(0.99999999, 1)).toBe(false)
  })
})
