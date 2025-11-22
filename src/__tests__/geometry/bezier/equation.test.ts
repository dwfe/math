import {Equation} from '../../../geometry/bezier/equation';
import {approximately} from '../../../util/approximately';

describe('geometry.bezier.equation', () => {

  const linearCases: Array<{ coefs: [number, number], expected: number }> = [
    {coefs: [0, 0], expected: NaN},
    {coefs: [0, 5], expected: NaN},
    {coefs: [1, 0], expected: 0},
    {coefs: [-1, 0], expected: 0},
    {coefs: [1, 1], expected: -1},
    {coefs: [1, -1], expected: 1},
    {coefs: [-1, -1], expected: -1},
    {coefs: [-1, 1], expected: 1},
  ]

  test('linear', () => {
    for (let c of linearCases) {
      expect(Equation.solveLinear(...c.coefs)).toEqual(c.expected);
    }
  });

  test('quadratic', () => {
    for (let c of linearCases) {
      // Для а = 0 уравнение должно решаться как линейной, но возвращаться массив с одним корнем
      expect(Equation.solveQuadratic(0, ...c.coefs)[0]).toEqual(c.expected);
    }

    // Отрицательный дискриминант - нет корней
    let res = Equation.solveQuadratic(1, 0, 1)
    expect(res.length).toEqual(0)

    // x^2 - 1 = 0 Положительный дискриминант
    res = Equation.solveQuadratic(1, 0, -1)
    expect(res.length).toEqual(2)
    expect(res[0]).toEqual(-1)
    expect(res[1]).toEqual(1)

    // x^2 + 2x + 1 = 0 Нулевой дискриминант
    res = Equation.solveQuadratic(1, 2, 1)
    expect(res.length).toEqual(1)
    expect(res[0]).toEqual(-1)
  });

  test('cube root', () => {
    expect(Equation.solveCubeRoot(0)).toEqual(0);
    expect(Equation.solveCubeRoot(-0)).toEqual(0);
    expect(Equation.solveCubeRoot(1)).toEqual(1);
    expect(Equation.solveCubeRoot(-1)).toEqual(-1);
    expect(Equation.solveCubeRoot(3)).toEqual(1.4422495703074083);
    expect(Equation.solveCubeRoot(-3)).toEqual(-1.4422495703074083);
    expect(Equation.solveCubeRoot(27)).toEqual(3);
    expect(Equation.solveCubeRoot(-27)).toEqual(-3);
  });

  test('cubic', () => {
    for (let c of linearCases) {
      expect(Equation.solveCubic(0, 0, ...c.coefs)[0]).toEqual(c.expected);
    }

    let res: Array<number>
    { // Для a === 0 результат должен быть идентичен решению квадратного уравнения
      // Отрицательный дискриминант - нет корней
      res = Equation.solveCubic(0, 1, 0, 1)
      expect(res.length).toEqual(0)

      // x^2 - 1 = 0 Положительный дискриминант
      res = Equation.solveCubic(0, 1, 0, -1)
      expect(res.length).toEqual(2)
      expect(res[0]).toEqual(-1)
      expect(res[1]).toEqual(1)

      // x^2 + 2x + 1 = 0 Нулевой дискриминант
      res = Equation.solveCubic(0, 1, 2, 1)
      expect(res.length).toEqual(1)
      expect(res[0]).toEqual(-1)
    }

    res = Equation.solveCubic(1, 0, -3, -2)
    expect(res.length).toEqual(2)
    expect(res[0]).toEqual(-1)
    expect(res[1]).toEqual(2)


    res = Equation.solveCubic(1, 5, 3, -9)
    expect(res.length).toEqual(2)
    expect(res[0]).toEqual(-3)
    expect(approximately(res[1], 1)).toBe(true)

    res = Equation.solveCubic(3, 8, -17, -42)
    expect(res.length).toEqual(3)
    expect(approximately(res[0], -3)).toBe(true)
    expect(approximately(res[1], -2)).toBe(true)
    expect(approximately(res[2], 7 / 3)).toBe(true)
  })

});
