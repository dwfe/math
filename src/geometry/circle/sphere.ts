import {Circle} from './circle';
import {IPoint} from '../contract';
import {Angle} from '../../angle';
import {approximately} from '../../util';

export class Sphere extends Circle {

  /**
   * Найти кратчаюшую дистанцию между двумя точками на поверхности данной сферы.
   * Точки определены через [долгота, широта]
   * @param p1
   * @param p2
   */
  getDistance(p1: IPoint, p2: IPoint) {
    return this.radius * Sphere.getDistance(p1, p2);
  }

  /**
   * Найти точку на поверхности сферы на переданном удалении в переданном направлении
   * @param pointOfView
   * @param distance
   * @param bearing
   */
  getPoint(pointOfView: IPoint, distance: number, bearing: number): IPoint {
    return Sphere.getPoint(pointOfView, distance, bearing, this.radius)
  }

  /**
   * Найти кратчайшую дистанцию на сфере (ортодрома) радиусом 1 между двумя точками, определёнными долготой и широтой.
   * Кратчайшая дистанция на сфере проходит по дуге круга, получаемого при сечении сферы плоскостью, построенной на
   * трёх точках - p1, p2 и центр сферы ({@link https://en.wikipedia.org/wiki/Great_circle}).
   *
   * Алгоритм тут: https://www.movable-type.co.uk/scripts/latlong.html#distance
   * Вообще по идее судя по https://en.wikipedia.org/wiki/Haversine_formula
   * вычисления можно немного упростить, заменив квадрат синусов на (1 - косинус), уменьшив количество умножений
   * вдвое. Если будем вычислять дистанции тысячами, то нужно будет проверить.
   *
   * @param p1 - [долгота, широта]
   * @param p2 - [долгота, широта]
   */
  static getDistance(p1: IPoint, p2: IPoint) {
    let [long1, lat1] = [Angle.rad(p1[0]), Angle.rad((p1[1]))]
    let [long2, lat2] = [Angle.rad(p2[0]), Angle.rad((p2[1]))]

    let dtLat = (lat2 - lat1)
    let dtLong = (long2 - long1)
    let temp = Math.sin(dtLat / 2)
    let temp2 = Math.sin(dtLong / 2);

    const a = temp * temp + Math.cos(lat1) * Math.cos(lat2) * temp2 * temp2

    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  /**
   * Найти точку на сфере переданного радиуса на переданном расстоянии и в переданном направлении от переданной стартовой точки
   * Алгоритм тут: https://www.movable-type.co.uk/scripts/latlong.html#dest-point
   *
   * @param pointOfView точка старта
   * @param distance дистанция между точками
   * @param bearing пеленг (угол по часовой стрелке от направления Точка наблюдения-Полюс до направления Точка наблюдения-Искомая точка)
   * @param r радиус сферы. По умолчанию сфера радиусом 1
   * @returns IPoint [долгота, широта]
   */
  static getPoint(pointOfView: IPoint, distance: number, bearing: number, r = 1): IPoint {
    let [long, lat] = [Angle.rad(pointOfView[0]), Angle.rad(pointOfView[1])]
    bearing = Angle.rad(bearing)
    let ar = distance / r
    let arCos = Math.cos(ar)
    let latSin = Math.sin(lat)

    let temp = Math.cos(lat) * Math.sin(ar) // 1

    const resLat = Math.asin(latSin * arCos + temp * Math.cos(bearing)) // -0.6

    // Если в Math.atan2 были переданы 2 ооочень близких к нулю числа, но не нули,
    // то результаты могут быть некорректны. Приходится явно проверять
    let firstArg = Math.sin(bearing) * temp
    firstArg = approximately(firstArg, 0) ? 0 : firstArg
    let secondArg = arCos - (latSin * Math.sin(resLat))
    secondArg = approximately(secondArg, 0) ? 0 : secondArg

    const resLong = long + Math.atan2(firstArg, secondArg)
    return [Angle.deg(resLong), Angle.deg(resLat)]
  }
}
