import {approximately} from '../../util';
import {tau} from "../../constants";

/**
 * Решение типовых математатических уравнений
 *
 */
export class Equation {

  /**
   * Решение уравнения вида ax + b = 0
   */
  static solveLinear(a: number, b: number): number {
    // При а === 0 решений не имеет
    if (!a) return NaN
    // При b === 0 результат возвращаем сами 0, чтобы автоматом не вернулось -0
    if (!b) return 0
    return -b / a
  }

  /**
   * Решение квадратного уравнения вида ax^2 + bx + c = 0.
   *
   *  Теоретическое решение предполагает возможность получения комплексных чисел,
   *  что возможно при отрицательном дискриминанте. Однако здесь уславливаемся, что
   *  для целей использования комплексные числа неприменимы, а потому комплексное число решением не является.
   *  Отрицательный дискриминант приведёт к возврату пустого массива
   */
  static solveQuadratic(a: number, b: number, c: number): number[] {
    // При а === 0 уравнение становится линейным
    if (!a) return [Equation.solveLinear(b, c)]

    // дискриминант
    let d = b ** 2 - 4 * a * c

    // Дискриминант меньше 0 - отсутствие вещественных корней
    if (d < 0) return []

    b = -b
    a *= 2

    // Дискриминант равен 0 - один корень
    if (approximately(d, 0)) {
      return [b / a]
    }

    // Дискриминант больше 0 - два вещественных корня
    d = Math.sqrt(d)
    return [(b + d) / a, (b - d) / a].sort((a, b) => a - b)
  }

  /**
   * Решение кубического уравнения вида y^3 = x
   * Взято с https://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
   */
  static solveCubeRoot(x: number) {
    // Из отрицательного числа корень взять не получится, поэтому берём по модулю
    let y = Math.pow(Math.abs(x), 1 / 3);
    // Но возвращаем с отрицательным знаком, если требуется
    return (x < 0 && y) ? -y : y;
  }

  /**
   * Решение кубического уравнения.
   * Взято с https://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
   *
   * Насколько понимаю, вещественные корни игнорируются.
   * В коде единственный возможный случай возврата пустого массива корней - при a === 0.
   * Во всех остальных случаях будет возврат по крайней мере одного вещественного корня и ни одного комплексного
   */
  static solveCubic(a: number, b: number, c: number, d: number) {
    if (approximately(a, 0)) return Equation.solveQuadratic(b, c, d)

    // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
    let p = (3 * a * c - b * b) / (3 * a * a);
    let q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
    let roots;

    if (approximately(p, 0)) { // p = 0 -> t^3 = -q -> t = -q^1/3
      roots = [Equation.solveCubeRoot(-q)];
    } else if (approximately(q, 0)) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
      roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
    } else {
      let D = q * q / 4 + p * p * p / 27;
      if (approximately(D, 0)) {       // D = 0 -> two roots
        roots = [-1.5 * q / p, 3 * q / p];
      } else if (D > 0) {             // Only one real root
        let u = Equation.solveCubeRoot(-q / 2 - Math.sqrt(D));
        roots = [u - p / (3 * u)];
      } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
        // Здесь возможно автор имеет в виду Тригонометрическую формулу Виета
        // https://ru.wikipedia.org/wiki/%D0%A2%D1%80%D0%B8%D0%B3%D0%BE%D0%BD%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B0%D1%8F_%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%BB%D0%B0_%D0%92%D0%B8%D0%B5%D1%82%D0%B0
        // Которая, как заявляется, позволяет обойтись без мнимых величин
        let u = 2 * Math.sqrt(-p / 3);
        let t = Math.acos(3 * q / p / u) / 3;  // D < 0 implies p < 0 and acos argument in [-1..1]
        let k = tau / 3;
        roots = [u * Math.cos(t), u * Math.cos(t - k), u * Math.cos(t - 2 * k)];
      }
    }

    // Convert back from depressed cubic
    for (let i = 0; i < roots.length; i++)
      roots[i] -= b / (3 * a);

    return roots.sort((a, b) => a - b);
  }
}
