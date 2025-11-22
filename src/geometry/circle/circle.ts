import {IPoint} from '../contract';
import {tau} from "../../constants";

export class Circle {

  /**
   * Длина окружности
   */
  circleLength: number;

  constructor(public readonly center: IPoint,
              public readonly radius: number) {
    this.circleLength = Circle.getCircleLength(this.radius);
  }

  /**
   * Градусная мера дуги исходя из её длины и длины окружности.
   *
   * @return {number} угол в градусах
   */
  getArcAngleByLength(arcLength: number): number {
    return Circle.getArcAngleByLength(arcLength, this.circleLength);
  }


  /**
   * Длина окружности с данным радиусом.
   */
  static getCircleLength(r: number) {
    return tau * r
  }

  /**
   * Градусная мера дуги исходя из её длины и длины окружности.
   *
   * Определяется как отношение двух длин. При этом отношению, равному единице,
   * соответствует дуга равная длине всей окружности.
   */
  static getArcAngleByLength(arcLength: number, circleLength: number): number {
    return arcLength / circleLength * 360;
  }

}
