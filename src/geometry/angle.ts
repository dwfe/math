import {AngleType} from './contract'

export class Angle {

  static rad = (angle: number, angleType: AngleType = AngleType.DEGREES): number => {
    switch (angleType) {
      case AngleType.RADIANS:
        return angle
      case AngleType.DEGREES:
        return angle * Math.PI / 180
      case AngleType.GRADIANS:
        return angle * Math.PI / 200
      case AngleType.TURNS:
        return angle * 2 * Math.PI
      default:
        throw new Error(`can't get radians for angle type '${angleType}'`)
    }
  }

  static deg = (angle: number, angleType: AngleType = AngleType.RADIANS): number => {
    switch (angleType) {
      case AngleType.DEGREES:
        return angle
      case AngleType.RADIANS:
        return angle * 180 / Math.PI
      case AngleType.GRADIANS:
        return angle * 9 / 10
      case AngleType.TURNS:
        return angle * 360
      default:
        throw new Error(`can't get degrees for angle type '${angleType}'`)
    }
  }

}
