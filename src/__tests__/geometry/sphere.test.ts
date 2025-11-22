import '@do-while-for-each/test'
import {Earth, IPoint, Sphere} from '../../geometry';
import {approximately} from '../../util';
import {Angle} from '../../angle';

describe('sphere tests', () => {
  const identitySphere = new Sphere([0, 0], 1);
  const translatedSphere = new Sphere([3.34, 4.31], 1);

  test('sphere.getDistanceAtSphere', () => {
    let distance: number;

    for (let sphere of [identitySphere, translatedSphere]) {
      // 180 градусов должно соответствовать половине длины окружности
      distance = sphere.getDistance([0, 0], [180, 0]);
      expect(distance).toBe(sphere.circleLength / 2);

      // 180 градусов должно соответствовать половине длины окружности
      distance = sphere.getDistance([180, 0], [0, 0]);
      expect(distance).toBe(sphere.circleLength / 2);

      // 90 градусов должно соответствовать четверти длины окружности
      distance = sphere.getDistance([90, 0], [0, 0]);
      expect(distance).toBe(sphere.circleLength / 4);
      distance = sphere.getDistance([0, 0], [90, 0]);
      expect(distance).toBe(sphere.circleLength / 4);

      // 360 градусов должно соответствовать нулю
      distance = sphere.getDistance([0, 0], [360, 0]);
      expect(approximately(distance, 0)).toBeTruthy();

      distance = sphere.getDistance([360, 0], [0, 0],);
      expect(approximately(distance, 0)).toBeTruthy();
    }

    // для следующих тестов результаты сверяются с результатами калькулятора https://www.movable-type.co.uk/scripts/latlong.html#distance
    // результаты на странице показываются приблизительные, так что совпадению устанавливаю в пределах 1/10
    let points: IPoint[] = [
      [0, 0],
      [10, 0],
      [90, 0],
      [-10, 0],
      [-90, 0],
    ]
    let equalsTo = 111.2;
    let accuracy = 0.1;
    for (let p of points) {
      distance = Earth.distance(p, [p[0] + 1, p[1]]);
      expect(approximately(distance, equalsTo, accuracy)).toBeTruthy();

      distance = Earth.distance([p[0] + 1, p[1]], p);
      expect(approximately(distance, equalsTo, accuracy)).toBeTruthy();

      // поменяю широты и долготы местами
      distance = Earth.distance([p[0], p[1] + 1], p);
      expect(approximately(distance, equalsTo, accuracy)).toBeTruthy();

      distance = Earth.distance(p, [p[0], p[1] + 1]);
      expect(approximately(distance, equalsTo, accuracy)).toBeTruthy();
    }

    distance = Earth.distance([45, 45], [65, 44])
    expect(approximately(distance, 1586, accuracy)).toBeTruthy();

    distance = Earth.distance([45.2, 45.3], [44.4, 44.3])
    expect(approximately(distance, 127.9, accuracy)).toBeTruthy();

    // Если стоим на полюсе, то без разницы какая долгота - расстояние должно быть 0
    points = [
      [0, 90],
      [1, 90],
      [2, 90],
      [50, 90],
      [90, 90],
    ]

    points = [...points, ...points.map(p => [p[0], p[1] * -1])]

    for (let p of points) {
      distance = Earth.distance(p, [p[0] + 1, p[1]]);
      expect(approximately(distance, 0)).toBeTruthy();

      distance = Earth.distance([p[0] + 1, p[1]], p);
      expect(approximately(distance, 0)).toBeTruthy();
    }

  })

  test('sphere.getPointAtSphere', () => {
    let p: IPoint;

    function pointApproximatelyEqualsToPointTest(testedPoint: IPoint, ideal: IPoint, accuracy?: number) {
      expect(approximately(testedPoint[0], ideal[0], accuracy)).toBeTruthy();
      expect(approximately(testedPoint[1], ideal[1], accuracy)).toBeTruthy();
    }

    for (let sphere of [identitySphere, translatedSphere]) {
      { // четверть длины окружности к любому из полюсов должен быть полюс

        p = sphere.getPoint([0, 0], sphere.circleLength / 4, 0);
        pointApproximatelyEqualsToPointTest(p, [0, 90]);

        p = sphere.getPoint([0, 0], sphere.circleLength / 4, 180);
        pointApproximatelyEqualsToPointTest(p, [0, -90]);
      }
      {// и наоборот

        p = sphere.getPoint([0, 90], sphere.circleLength / 4, 180);
        pointApproximatelyEqualsToPointTest(p, [0, 0]);

        p = sphere.getPoint([0, -90], sphere.circleLength / 4, 0);
        pointApproximatelyEqualsToPointTest(p, [0, 0]);
      }

      { // долготы
        p = sphere.getPoint([0, 0], sphere.circleLength / 4, 90);
        pointApproximatelyEqualsToPointTest(p, [90, 0]);

        p = sphere.getPoint([0, 0], sphere.circleLength / 4, -90);
        pointApproximatelyEqualsToPointTest(p, [-90, 0]);
      }
    }

    // сверяю корректность с movable-type
    p = Earth.destinationPoint([0, 0], 200, 54);
    pointApproximatelyEqualsToPointTest(p, [1.4552777777777777, 1.0572222222222223], 0.001)

    p = Earth.destinationPoint([65, 32], 200, 54);
    pointApproximatelyEqualsToPointTest(p, [66.73583333333333, 33.04555555555555], 0.001)

  })

  test('Earth.centralAngle', () => {
    {
      // 1 Радиан - это центральный угол, когда радиус равен длине дуги.
      const angleDeg = Earth.centralAngleByArc(Earth.radius);
      const angleRad = Angle.rad(angleDeg);
      expect(angleRad).eq(1);
    }
    { // по широте от полюса до экватора
      const angle = Earth.centralAngleByPoints([0, 90], [0, 0])
      expect(angle).eq(90);
    }
    { // по долготе на экваторе
      const angle = Earth.centralAngleByPoints([-40, 0], [-30, 0])
      expect(Math.round(angle)).eq(10);
    }
    { // по долготе на широте 85
      const angle = Earth.centralAngleByPoints([30, 85], [40, 85])
      expect(Math.round(angle)).eq(1);
    }
    { // по широте от экватора в северное полушарие
      const angle = Earth.centralAngleByPoints([30, 0], [30, 25])
      expect(Math.round(angle)).eq(25);
    }
    { // по широте в южном полушарии
      const angle = Earth.centralAngleByPoints([70, -80], [70, -70])
      expect(Math.round(angle)).eq(10);
    }
  })

})
