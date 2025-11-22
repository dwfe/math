import {CardinalDirection, IAngleQuadrant, IAngleUnit, IDegMinSecStrOpt} from './contract'
import {degInRad, gradInDeg, gradInRad, halfPi, pi, radInDeg, tau} from '../constants';
import {IPoint} from '../geometry';
import {Tuple2} from '../contract';

const atan2 = Math.atan2;

export class Angle {

  static rad = (angle: number, unit: IAngleUnit = 'deg'): number => {
    switch (unit) {
      case 'rad':
        return angle;
      case 'deg':
        return angle * degInRad;
      case 'grad':
        return angle * gradInRad;
      case 'turn':
        return angle * tau;
      default:
        throw new Error(`can't get radians for angle unit '${unit}'`);
    }
  }

  static deg = (angle: number, unit: IAngleUnit = 'rad'): number => {
    switch (unit) {
      case 'deg':
        return angle;
      case 'rad':
        return angle * radInDeg;
      case 'grad':
        return angle * gradInDeg;
      case 'turn':
        return angle * 360;
      default:
        throw new Error(`can't get degrees for angle unit '${unit}'`);
    }
  }

  /**
   * Convert any angle to the range [0; +360)
   */
  static diapason0To360 = (deg: number): number => ((deg % 360) + 360) % 360;
  static diapason0To360Rad = (rad: number): number => ((rad % tau) + tau) % tau;

  /**
   * Convert any angle to the range [-180; +180]
   */
  static diapasonPlusMinus180(deg: number): number {
    if (deg >= -180 && deg <= 180) {
      return deg;
    } else if (deg % 360 === 180) {
      return 180;
    } else if (deg % 360 === -180) {
      return -180;
    }
    const sign = deg > 180 ? -1 : 1;
    return ((deg + 180) % 360) + 180 * sign;
  }

  /**
   * Convert decimal degrees to degrees, minutes, seconds.
   * @param value - decimal degrees
   */
  static getDegMinSec(value: number): { deg: number; min: number; sec: number; } {
    const modValue = Math.abs(value);
    const deg = Math.floor(modValue);
    const minFull = (modValue - deg) * 60;
    const min = Math.floor(minFull);
    return {
      deg: deg * Math.sign(value),
      min,
      sec: Math.round((minFull - min) * 60),
    };
  }

  static getDegMinSecStr(value: number, opt: IDegMinSecStrOpt = {}): string {
    const {geoDirection} = opt;
    if (geoDirection === 'lon') {
      value = Angle.diapasonPlusMinus180(value);
    }

    let {deg, min, sec} = Angle.getDegMinSec(value);
    min = String(min).padStart(2, '0') as any;
    sec = String(sec).padStart(2, '0') as any;

    let degPrint = geoDirection ? Math.abs(deg) : deg;

    const sep = opt.separator ? opt.separator : '';
    let result = opt.skipSec
      ? `${degPrint}°${sep}${min}’${sep}`
      : `${degPrint}°${sep}${min}’${sep}${sec}”${sep}`;

    if (geoDirection) {
      const lang = opt.lang || 'en';
      let label = '';
      switch (geoDirection) {
        case 'lon': {
          const isEast = deg >= 0;
          switch (lang) {
            case 'en':
              label = isEast ? 'E' : 'W';
              break;
            case 'ru':
              label = isEast ? 'В' : 'З';
              break;
          }
          break;
        }
        case 'lat': {
          const isNorth = deg >= 0;
          switch (lang) {
            case 'en':
              label = isNorth ? 'N' : 'S';
              break;
            case 'ru':
              label = isNorth ? 'С' : 'Ю';
              break;
          }
        }
      }
      result += label;
    }
    return result;
  }


//region Углы по сторонам света
//       Более подробно смотри:
//       https://github.com/gonzobard777/basics/blob/main/docs/common/angles/README.md

  // atan2(  x, -y )
  static northClockwise = (p: IPoint) => atan2(p[0], -p[1]);
  static northClockwise0To360 = (p: IPoint) => Angle.diapason0To360Rad(atan2(p[0], -p[1]));
  // atan2( -x, -y )
  static northCounterClockwise = (p: IPoint) => atan2(-p[0], -p[1]);

  // atan2(  y,  x )
  static eastClockwise = (p: IPoint) => atan2(p[1], p[0]);
  // atan2( -y,  x )
  static eastCounterClockwise = (p: IPoint) => atan2(-p[1], p[0]);

  // atan2( -x,  y )
  static southClockwise = (p: IPoint) => atan2(-p[0], p[1]);
  // atan2(  x,  y )
  static southCounterClockwise = (p: IPoint) => atan2(p[0], p[1]);

  // atan2( -y, -x )
  static westClockwise = (p: IPoint) => atan2(-p[1], -p[0]);
  // atan2(  y, -x )
  static westCounterClockwise = (p: IPoint) => atan2(p[1], -p[0]);

//endregion Углы по сторонам света


  /**
   * Сторона света (базовые: север, юг, запад, восток).
   *
   * @param rad - угол в радианах выровненный в диапазон эквивалентный градусному NorthClockwise0To360.
   *                0 или 2π на севере
   *                3 часа = (1/2)π
   *                6 часов = π
   *                9 часов = (3/2)π
   */
  static baseCardinalDirectionNorthClockwise0To360(rad: number): CardinalDirection {
    const deg = Angle.deg(rad);
    if (315 <= deg || deg <= 45)
      return CardinalDirection.N;
    if (45 < deg && deg < 135)
      return CardinalDirection.E;
    if (135 <= deg && deg <= 225)
      return CardinalDirection.S;
    return CardinalDirection.W;
  }

  /**
   * Угол, чтобы попасть ровно на сторону света.
   * @param direction - сторона света.
   */
  static cardinalDirectionToDegrees(direction: CardinalDirection): number {
    return direction * 22.5;
  }

  /**
   * Диапазон угла, в котором действует соответствующая сторона света.
   * @param direction - сторона света.
   */
  static cardinalDirectionToInterval(direction: CardinalDirection): Tuple2 {
    const d = Angle.cardinalDirectionToDegrees(direction);
    const min = direction === CardinalDirection.N ? 360 - 11.25 : d - 11.25;
    return [min, d + 11.25];
  }


  /**
   * Квадрант круга.
   * @param rad - угол в радианах выровненный в диапазон эквивалентный градусному NorthClockwise0To360.
   *                0 или 2π на севере
   *                3 часа = (1/2)π
   *                6 часов = π
   *                9 часов = (3/2)π
   */
  static quadrantNorthClockwise0To360(rad: number): IAngleQuadrant {
    if (0 <= rad && rad < halfPi)
      return 'rightTop';
    if (halfPi <= rad && rad < pi)
      return 'rightBottom';
    if (pi <= rad && rad < 1.5 * pi)
      return 'leftBottom';
    return 'leftTop';
  }
}
