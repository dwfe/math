import {IAngleUnit, ICardinalDirection} from './contract'

export class Angle {

  static rad = (angle: number, unit: IAngleUnit = 'deg'): number => {
    switch (unit) {
      case 'rad':
        return angle
      case 'deg':
        return angle * Math.PI / 180
      case 'grad':
        return angle * Math.PI / 200
      case 'turn':
        return angle * 2 * Math.PI
      default:
        throw new Error(`can't get radians for angle unit '${unit}'`)
    }
  }

  static deg = (angle: number, unit: IAngleUnit = 'rad'): number => {
    switch (unit) {
      case 'deg':
        return angle
      case 'rad':
        return angle * 180 / Math.PI
      case 'grad':
        return angle * 9 / 10
      case 'turn':
        return angle * 360
      default:
        throw new Error(`can't get degrees for angle unit '${unit}'`)
    }
  }

  /**
   * Convert any angle to the range [0; +360)
   */
  static diapason0To360 = (deg: number): number => ((deg % 360) + 360) % 360;

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

  static cardinalDirection(deg: number): ICardinalDirection {
    deg = Angle.diapasonPlusMinus180(deg);
    if (deg >= -135 && deg <= -45)
      return 'north';
    else if (deg > -45 && deg < 45)
      return 'east';
    else if (deg >= 45 && deg <= 135)
      return 'south';
    return 'west';
  }

}

