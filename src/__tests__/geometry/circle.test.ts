import {Circle} from "../../geometry";
import {approximately} from "../../util";
import {tau} from "../../constants";

describe('geometry.circle', () => {
  let identityCircle = new Circle([0, 0], 1);
  let translatedCircle = new Circle([3.3, 5.4], 1);
  let wgsEquator = new Circle([0, 0], 6_378_137);
  let iauEquator = new Circle([0, 0], 6_378_136.6);

  test('getCircleLength', () => {
    expect(approximately(identityCircle.circleLength, tau)).toBeTruthy();
    expect(approximately(translatedCircle.circleLength, tau)).toBeTruthy();
    expect(approximately(wgsEquator.circleLength, 40_075_016, 1)).toBeTruthy();
    expect(approximately(iauEquator.circleLength, 40_075_014, 1)).toBeTruthy();
  });

  test('getArcAngleByLength', () => {
    for (let circle of [identityCircle, translatedCircle, wgsEquator, iauEquator]) {
      expect(circle.getArcAngleByLength(circle.circleLength)).toBe(360);
      expect(circle.getArcAngleByLength(circle.circleLength / 2)).toBe(180);
      expect(circle.getArcAngleByLength(circle.circleLength / 4)).toBe(90);
    }
  });
});
