import '@do-while-for-each/test'
import {Angle, CardinalDirection, IDegMinSecStrOpt} from '../../angle';
import {Tuple2, Tuple3} from '../../contract';
import {IPoint, Point} from '../../geometry';
import {toFixed} from '../../util';

describe('angle', () => {

  test('diapason [0; 360)', () => {
    expect(toFixed(Angle.diapason0To360(0.00001), 6)).eq(0.00001);
    expect(toFixed(Angle.diapason0To360(-0.00001), 6)).eq(359.99999);
    expect(Angle.diapason0To360(0)).eq(0);
    expect(Angle.diapason0To360(-0)).eq(0);
    expect(Angle.diapason0To360(360)).eq(0);
    expect(Angle.diapason0To360(-360)).eq(0);
    expect(Angle.diapason0To360(720)).eq(0);
    expect(Angle.diapason0To360(-720)).eq(0);

    expect(Angle.diapason0To360(1)).eq(1);
    expect(Angle.diapason0To360(-1)).eq(359);

    expect(Angle.diapason0To360(361)).eq(1);
    expect(Angle.diapason0To360(721)).eq(1);
    expect(Angle.diapason0To360(-361)).eq(359);
    expect(Angle.diapason0To360(-721)).eq(359);

    expect(Angle.diapason0To360(180)).eq(180);
    expect(Angle.diapason0To360(-180)).eq(180);

    expect(Angle.diapason0To360(90)).eq(90);
    expect(Angle.diapason0To360(-90)).eq(270);
  });

  test('diapason [0; 360) rad', () => {
    const check = (deg: number) => {
      const rad = Angle.rad(deg);
      const resultRad = Angle.diapason0To360Rad(rad);
      return Angle.deg(resultRad);
    };
    expect(toFixed(check(0.00001), 6)).eq(0.00001);
    expect(toFixed(check(-0.00001), 6)).eq(359.99999);
    expect(check(0)).eq(0);
    expect(check(-0)).eq(0);
    expect(check(360)).eq(0);
    expect(check(-360)).eq(0);
    expect(check(720)).eq(0);
    expect(check(-720)).eq(0);

    expect(toFixed(check(1), 10)).eq(1);
    expect(check(-1)).eq(359);

    expect(toFixed(check(361), 10)).eq(1);
    expect(toFixed(check(721), 10)).eq(1);
    expect(check(-361)).eq(359);
    expect(toFixed(check(-721), 10)).eq(359);

    expect(check(180)).eq(180);
    expect(check(-180)).eq(180);

    expect(check(90)).eq(90);
    expect(check(-90)).eq(270);
  });


  test('diapason [-180; +180]', () => {
    expect(Angle.diapasonPlusMinus180(0)).eq(0);
    expect(Angle.diapasonPlusMinus180(-0)).eq(-0);
    expect(Angle.diapasonPlusMinus180(360)).eq(0);
    expect(Angle.diapasonPlusMinus180(-360)).eq(0);
    expect(Angle.diapasonPlusMinus180(720)).eq(0);
    expect(Angle.diapasonPlusMinus180(-720)).eq(0);

    expect(Angle.diapasonPlusMinus180(361)).eq(1);
    expect(Angle.diapasonPlusMinus180(721)).eq(1);
    expect(Angle.diapasonPlusMinus180(-361)).eq(-1);
    expect(Angle.diapasonPlusMinus180(-721)).eq(-1);

    expect(Angle.diapasonPlusMinus180(180)).eq(180);
    expect(Angle.diapasonPlusMinus180(540)).eq(180);
    expect(Angle.diapasonPlusMinus180(-180)).eq(-180);
    expect(Angle.diapasonPlusMinus180(-540)).eq(-180);

    expect(Angle.diapasonPlusMinus180(181)).eq(-179);
    expect(Angle.diapasonPlusMinus180(541)).eq(-179);
    expect(Angle.diapasonPlusMinus180(-181)).eq(179);
    expect(Angle.diapasonPlusMinus180(-541)).eq(179);

    expect(Angle.diapasonPlusMinus180(270)).eq(-90);
    expect(Angle.diapasonPlusMinus180(-270)).eq(90);
  });


  test('getDegMinSec', () => {
    function check(value: number, data: Tuple3) {
      const {deg, min, sec} = Angle.getDegMinSec(value);
      expect(deg).eq(data[0]);
      expect(min).eq(data[1]);
      expect(sec).eq(data[2]);
    }

    check(-361.938756253, [-361, 56, 20]);
    check(-360, [-360, 0, 0]);
    check(-180.4354646646, [-180, 26, 8]);
    check(-180, [-180, 0, 0]);
    check(-165.85058279918894, [-165, 51, 2]);
    check(-7.507522740693484, [-7, 30, 27]);
    check(0, [0, 0, 0]);
    check(41.292013670258946, [41, 17, 31]);
    check(51.06553817785117, [51, 3, 56]);
    check(70.88138886531404, [70, 52, 53]);
    check(180, [180, 0, 0]);
    check(180.4354646646, [180, 26, 8]);
    check(360, [360, 0, 0]);
    check(361.938756253, [361, 56, 20]);
  });

  test('getDegMinSecStr', () => {
    function check(value: number, res: string, opt?: IDegMinSecStrOpt) {
      expect(Angle.getDegMinSecStr(value, opt)).eq(res);
    }

    check(-361.938756253, `-361°56’20”`);
    check(-360, `-360°00’00”`);
    check(-180.4354646646, `-180°26’08”`);
    check(-180, `-180°00’00”`);
    check(-165.85058279918894, `-165°51’02”`);
    check(-7.507522740693484, `-7°30’27”`);
    check(-0, `0°00’00”`);
    check(0, `0°00’00”`);
    check(41.292013670258946, `41°17’31”`);
    check(51.06553817785117, `51°03’56”`);
    check(70.88138886531404, `70°52’53”`);
    check(180, `180°00’00”`);
    check(180.4354646646, `180°26’08”`);
    check(360, `360°00’00”`);
    check(361.938756253, `361°56’20”`);

    // без секунд
    check(-361.938756253, `-361°56’`, {skipSec: true});
    check(-360, `-360°00’`, {skipSec: true});
    check(-180.4354646646, `-180°26’`, {skipSec: true});
    check(-180, `-180°00’`, {skipSec: true});
    check(-165.85058279918894, `-165°51’`, {skipSec: true});
    check(-7.507522740693484, `-7°30’`, {skipSec: true});
    check(-0, `0°00’`, {skipSec: true});
    check(0, `0°00’`, {skipSec: true});
    check(41.292013670258946, `41°17’`, {skipSec: true});
    check(51.06553817785117, `51°03’`, {skipSec: true});
    check(70.88138886531404, `70°52’`, {skipSec: true});
    check(180, `180°00’`, {skipSec: true});
    check(180.4354646646, `180°26’`, {skipSec: true});
    check(360, `360°00’`, {skipSec: true});
    check(361.938756253, `361°56’`, {skipSec: true});

    // долгота ru
    check(-361, `1°00’00”З`, {geoDirection: 'lon', lang: 'ru'});
    check(-360, `0°00’00”В`, {geoDirection: 'lon', lang: 'ru'});
    check(-270, `90°00’00”В`, {geoDirection: 'lon', lang: 'ru'});
    check(-181, `179°00’00”В`, {geoDirection: 'lon', lang: 'ru'});
    check(-180.612395, `179°23’15”В`, {geoDirection: 'lon', lang: 'ru'});
    check(-180, `180°00’00”З`, {geoDirection: 'lon', lang: 'ru'});
    check(-150.9634271, `150°57’48”З`, {geoDirection: 'lon', lang: 'ru'});
    check(-50.46346347777, `50°27’48”З`, {geoDirection: 'lon', lang: 'ru'});
    check(0, `0°00’00”В`, {geoDirection: 'lon', lang: 'ru'});
    check(50.46346347777, `50°27’48”В`, {geoDirection: 'lon', lang: 'ru'});
    check(150.9634271, `150°57’48”В`, {geoDirection: 'lon', lang: 'ru'});
    check(180, `180°00’00”В`, {geoDirection: 'lon', lang: 'ru'});
    check(180.612395, `179°23’15”З`, {geoDirection: 'lon', lang: 'ru'});
    check(181, `179°00’00”З`, {geoDirection: 'lon', lang: 'ru'});
    check(270, `90°00’00”З`, {geoDirection: 'lon', lang: 'ru'});
    check(360, `0°00’00”В`, {geoDirection: 'lon', lang: 'ru'});
    check(361, `1°00’00”В`, {geoDirection: 'lon', lang: 'ru'});

    // долгота en
    check(-361, `1°00’00”W`, {geoDirection: 'lon', lang: 'en'});
    check(-360, `0°00’00”E`, {geoDirection: 'lon', lang: 'en'});
    check(-270, `90°00’00”E`, {geoDirection: 'lon', lang: 'en'});
    check(-181, `179°00’00”E`, {geoDirection: 'lon', lang: 'en'});
    check(-180.612395, `179°23’15”E`, {geoDirection: 'lon', lang: 'en'});
    check(-180, `180°00’00”W`, {geoDirection: 'lon', lang: 'en'});
    check(-150.9634271, `150°57’48”W`, {geoDirection: 'lon', lang: 'en'});
    check(-50.46346347777, `50°27’48”W`, {geoDirection: 'lon', lang: 'en'});
    check(0, `0°00’00”E`, {geoDirection: 'lon', lang: 'en'});
    check(50.46346347777, `50°27’48”E`, {geoDirection: 'lon', lang: 'en'});
    check(150.9634271, `150°57’48”E`, {geoDirection: 'lon', lang: 'en'});
    check(180, `180°00’00”E`, {geoDirection: 'lon', lang: 'en'});
    check(180.612395, `179°23’15”W`, {geoDirection: 'lon', lang: 'en'});
    check(181, `179°00’00”W`, {geoDirection: 'lon', lang: 'en'});
    check(270, `90°00’00”W`, {geoDirection: 'lon', lang: 'en'});
    check(360, `0°00’00”E`, {geoDirection: 'lon', lang: 'en'});
    check(361, `1°00’00”E`, {geoDirection: 'lon', lang: 'en'});

    // широта ru
    check(-91, `91°00’00”Ю`, {geoDirection: 'lat', lang: 'ru'});
    check(-90, `90°00’00”Ю`, {geoDirection: 'lat', lang: 'ru'});
    check(-42.3021538, `42°18’08”Ю`, {geoDirection: 'lat', lang: 'ru'});
    check(0, `0°00’00”С`, {geoDirection: 'lat', lang: 'ru'});
    check(42.3021538, `42°18’08”С`, {geoDirection: 'lat', lang: 'ru'});
    check(90, `90°00’00”С`, {geoDirection: 'lat', lang: 'ru'});
    check(91, `91°00’00”С`, {geoDirection: 'lat', lang: 'ru'});

    // широта en
    check(-91, `91°00’00”S`, {geoDirection: 'lat', lang: 'en'});
    check(-90, `90°00’00”S`, {geoDirection: 'lat', lang: 'en'});
    check(-42.3021538, `42°18’08”S`, {geoDirection: 'lat', lang: 'en'});
    check(0, `0°00’00”N`, {geoDirection: 'lat', lang: 'en'});
    check(42.3021538, `42°18’08”N`, {geoDirection: 'lat', lang: 'en'});
    check(90, `90°00’00”N`, {geoDirection: 'lat', lang: 'en'});
    check(91, `91°00’00”N`, {geoDirection: 'lat', lang: 'en'});
  });


  test('northClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.northClockwise(p));

    // края
    expect(toFixed(check([-0.000001, -1]), 5)).eq(-0.00006);
    expect(toFixed(check([0.000001, -1]), 5)).eq(0.00006);
    expect(toFixed(check([-0.000001, 1]), 5)).eq(-179.99994);
    expect(toFixed(check([0.000001, 1]), 5)).eq(179.99994);

    expect(check([0, -1])).eq(0);
    expect(check([1, -1])).eq(45);
    expect(check([1, 0])).eq(90);
    expect(check([1, 1])).eq(135);
    expect(check([0, 1])).eq(180);
    expect(check([-1, 1])).eq(-135);
    expect(check([-1, 0])).eq(-90);
    expect(check([-1, -1])).eq(-45);
  });

  test('northClockwise0To360', () => {
    const check = (p: IPoint) => {
      const rad = Angle.northClockwise0To360(p);
      return Angle.deg(rad);
    };

    // края
    expect(toFixed(check([-0.000001, -1]), 5)).eq(359.99994);
    expect(toFixed(check([0.000001, -1]), 5)).eq(0.00006);

    expect(check([0, -1])).eq(0);
    expect(check([1, -1])).eq(45);
    expect(check([1, 0])).eq(90);
    expect(toFixed(check([1, 1]), 10)).eq(135);
    expect(check([0, 1])).eq(180);
    expect(check([-1, 1])).eq(225);
    expect(check([-1, 0])).eq(270);
    expect(check([-1, -1])).eq(315);
  });

  test('northCounterClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.northCounterClockwise(p));

    // края
    expect(toFixed(check([-0.000001, -1]), 5)).eq(0.00006);
    expect(toFixed(check([0.000001, -1]), 5)).eq(-0.00006);
    expect(toFixed(check([-0.000001, 1]), 5)).eq(179.99994);
    expect(toFixed(check([0.000001, 1]), 5)).eq(-179.99994);

    expect(check([0, -1])).eq(-0);
    expect(check([-1, -1])).eq(45);
    expect(check([-1, 0])).eq(90);
    expect(check([-1, 1])).eq(135);
    expect(check([0, 1])).eq(-180);
    expect(check([1, 1])).eq(-135);
    expect(check([1, 0])).eq(-90);
    expect(check([1, -1])).eq(-45);
  });


  test('eastClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.eastClockwise(p));

    // края
    expect(toFixed(check([1, -0.000001]), 5)).eq(-0.00006);
    expect(toFixed(check([1, 0.000001]), 5)).eq(0.00006);
    expect(toFixed(check([-1, -0.000001]), 5)).eq(-179.99994);
    expect(toFixed(check([-1, 0.000001]), 5)).eq(179.99994);

    expect(check([1, 0])).eq(0);
    expect(check([1, 1])).eq(45);
    expect(check([0, 1])).eq(90);
    expect(check([-1, 1])).eq(135);
    expect(check([-1, 0])).eq(180);
    expect(check([-1, -1])).eq(-135);
    expect(check([0, -1])).eq(-90);
    expect(check([1, -1])).eq(-45);
  });

  test('eastCounterClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.eastCounterClockwise(p));

    // края
    expect(toFixed(check([1, -0.000001]), 5)).eq(0.00006);
    expect(toFixed(check([1, 0.000001]), 5)).eq(-0.00006);
    expect(toFixed(check([-1, -0.000001]), 5)).eq(179.99994);
    expect(toFixed(check([-1, 0.000001]), 5)).eq(-179.99994);

    expect(check([1, 0])).eq(-0);
    expect(check([1, -1])).eq(45);
    expect(check([0, -1])).eq(90);
    expect(check([-1, -1])).eq(135);
    expect(check([-1, 0])).eq(-180);
    expect(check([-1, 1])).eq(-135);
    expect(check([0, 1])).eq(-90);
    expect(check([1, 1])).eq(-45);
  });


  test('southClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.southClockwise(p));

    // края
    expect(toFixed(check([-0.000001, 1]), 5)).eq(0.00006);
    expect(toFixed(check([0.000001, 1]), 5)).eq(-0.00006);
    expect(toFixed(check([-0.000001, -1]), 5)).eq(179.99994);
    expect(toFixed(check([0.000001, -1]), 5)).eq(-179.99994);

    expect(check([0, 1])).eq(-0);
    expect(check([-1, 1])).eq(45);
    expect(check([-1, 0])).eq(90);
    expect(check([-1, -1])).eq(135);
    expect(check([0, -1])).eq(-180);
    expect(check([1, -1])).eq(-135);
    expect(check([1, 0])).eq(-90);
    expect(check([1, 1])).eq(-45);
  });

  test('southCounterClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.southCounterClockwise(p));

    // края
    expect(toFixed(check([-0.000001, 1]), 5)).eq(-0.00006);
    expect(toFixed(check([0.000001, 1]), 5)).eq(0.00006);
    expect(toFixed(check([-0.000001, -1]), 5)).eq(-179.99994);
    expect(toFixed(check([0.000001, -1]), 5)).eq(179.99994);

    expect(check([0, 1])).eq(0);
    expect(check([1, 1])).eq(45);
    expect(check([1, 0])).eq(90);
    expect(check([1, -1])).eq(135);
    expect(check([0, -1])).eq(180);
    expect(check([-1, -1])).eq(-135);
    expect(check([-1, 0])).eq(-90);
    expect(check([-1, 1])).eq(-45);
  });


  test('westClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.westClockwise(p));

    // края
    expect(toFixed(check([-1, -0.000001]), 5)).eq(0.00006);
    expect(toFixed(check([-1, 0.000001]), 5)).eq(-0.00006);
    expect(toFixed(check([1, -0.000001]), 5)).eq(179.99994);
    expect(toFixed(check([1, 0.000001]), 5)).eq(-179.99994);

    expect(check([-1, 0])).eq(-0);
    expect(check([-1, -1])).eq(45);
    expect(check([0, -1])).eq(90);
    expect(check([1, -1])).eq(135);
    expect(check([1, 0])).eq(-180);
    expect(check([1, 1])).eq(-135);
    expect(check([0, 1])).eq(-90);
    expect(check([-1, 1])).eq(-45);
  });

  test('westCounterClockwise', () => {
    const check = (p: IPoint) => Angle.deg(Angle.westCounterClockwise(p));

    // края
    expect(toFixed(check([-1, -0.000001]), 5)).eq(-0.00006);
    expect(toFixed(check([-1, 0.000001]), 5)).eq(0.00006);
    expect(toFixed(check([1, -0.000001]), 5)).eq(-179.99994);
    expect(toFixed(check([1, 0.000001]), 5)).eq(179.99994);

    expect(check([-1, 0])).eq(0);
    expect(check([-1, -1])).eq(-45);
    expect(check([0, -1])).eq(-90);
    expect(check([1, -1])).eq(-135);
    expect(check([1, 0])).eq(180);
    expect(check([1, 1])).eq(135);
    expect(check([0, 1])).eq(90);
    expect(check([-1, 1])).eq(45);
  });

  test('cardinalDirectionToDegrees', () => {
    const check = (direction: CardinalDirection) => Angle.cardinalDirectionToDegrees(direction);
    expect(check(CardinalDirection.N)).eq(0);
    expect(check(CardinalDirection.NNE)).eq(22.5);
    expect(check(CardinalDirection.NE)).eq(45);
    expect(check(CardinalDirection.ENE)).eq(67.5);
    expect(check(CardinalDirection.E)).eq(90);
    expect(check(CardinalDirection.ESE)).eq(112.5);
    expect(check(CardinalDirection.SE)).eq(135);
    expect(check(CardinalDirection.SSE)).eq(157.5);
    expect(check(CardinalDirection.S)).eq(180);
    expect(check(CardinalDirection.SSW)).eq(202.5);
    expect(check(CardinalDirection.SW)).eq(225);
    expect(check(CardinalDirection.WSW)).eq(247.5);
    expect(check(CardinalDirection.W)).eq(270);
    expect(check(CardinalDirection.WNW)).eq(292.5);
    expect(check(CardinalDirection.NW)).eq(315);
    expect(check(CardinalDirection.NNW)).eq(337.5);
  });

  test('cardinalDirectionToInterval', () => {
    const check = (diapason: Tuple2, direction: CardinalDirection) => {
      const p1 = Angle.cardinalDirectionToInterval(direction);
      return Point.isEqual(p1, diapason)
    }
    expect(check([348.75, 11.25], CardinalDirection.N)).True();
    expect(check([11.25, 33.75], CardinalDirection.NNE)).True();
    expect(check([33.75, 56.25], CardinalDirection.NE)).True();
    expect(check([56.25, 78.75], CardinalDirection.ENE)).True();
    expect(check([78.75, 101.25], CardinalDirection.E)).True();
    expect(check([101.25, 123.75], CardinalDirection.ESE)).True();
    expect(check([123.75, 146.25], CardinalDirection.SE)).True();
    expect(check([146.25, 168.75], CardinalDirection.SSE)).True();
    expect(check([168.75, 191.25], CardinalDirection.S)).True();
    expect(check([191.25, 213.75], CardinalDirection.SSW)).True();
    expect(check([213.75, 236.25], CardinalDirection.SW)).True();
    expect(check([236.25, 258.75], CardinalDirection.WSW)).True();
    expect(check([258.75, 281.25], CardinalDirection.W)).True();
    expect(check([281.25, 303.75], CardinalDirection.WNW)).True();
    expect(check([303.75, 326.25], CardinalDirection.NW)).True();
    expect(check([326.25, 348.75], CardinalDirection.NNW)).True();
  });

});
