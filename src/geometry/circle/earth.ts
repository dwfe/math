import {IPoint} from '../contract';
import {Sphere} from './sphere';
import {tau} from '../../constants';

/**
 * Производное значение между большим и меньшим радиусами эллипса WGS84:
 *   https://en.wikipedia.org/wiki/World_Geodetic_System#WGS_84
 */
const r_km = 6371.0088;

/**
 * Геосфера с радиусом {@link r_km}
 */
export class Earth extends Sphere {

  static readonly sphere = new Sphere([0, 0], r_km);

  /**
   * Дистанция между двумя географическими точками,
   * находящимися на дуге Great circle.
   * @return {number} длина дуги Great circle между двумя точками в километрах.
   */
  static distance(p1: IPoint, p2: IPoint): number {
    return Earth.sphere.getDistance(p1, p2);
  }

  /**
   * Рассчитать точку на геосфере на заданном расстоянии и в заданном направлении от
   * переданной начальной точки.
   * @param startPoint Стартовая точка
   * @param distance расстояние в километрах
   * @param bearing пеленг - угол между направлениями Начальная точка-Север и Начальная точка - Искомая точка
   */
  static destinationPoint(startPoint: IPoint, distance: number, bearing: number): IPoint {
    return Earth.sphere.getPoint(startPoint, distance, bearing)
  }

  /**
   * Градусная мера дуги исходя из её длины.
   * @return {number} угол в градусах
   */
  static arcAngleOfDistance(distance: number): number {
    return Earth.sphere.getArcAngleByLength(distance)
  }

  /**
   * Большая окружность (большой круг), или
   * длина окружности по секущей через центр сферы.
   * @return {number} километры
   */
  static get greatCircle(): number {
    return Earth.sphere.circleLength
  }

  /**
   * Радиус.
   * @return {number} радиус в километрах.
   */
  static get radius(): number {
    return Earth.sphere.radius
  }

  /**
   * Центральный угол Great circle планеты.
   * @param p1 - точка на Great circle
   * @param p2 - другая точка на этом же Great circle
   * @return {number} угол в градусах.
   */
  static centralAngleByPoints(p1: IPoint, p2: IPoint): number {
    const arcLengthKm = Earth.distance(p1, p2);
    return Earth.centralAngleByArc(arcLengthKm);
  }

  /**
   * Центральный угол Great circle планеты.
   * @param arcLengthKm - длина дуги в километрах
   * @return {number} угол в градусах.
   */
  static centralAngleByArc(arcLengthKm: number): number {
    return (arcLengthKm * 360) / (tau * Earth.radius);
  }

}
