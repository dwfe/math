import '@do-while-for-each/test'
import {Angle} from '../../angle'

describe('diapason', () => {

  test('[0; 360)', () => {
    expect(Angle.diapason0To360(0)).eq(0);
    expect(Angle.diapason0To360(-0)).eq(0);
    expect(Angle.diapason0To360(360)).eq(0);
    expect(Angle.diapason0To360(-360)).eq(0);
    expect(Angle.diapason0To360(720)).eq(0);
    expect(Angle.diapason0To360(-720)).eq(0);

    expect(Angle.diapason0To360(361)).eq(1);
    expect(Angle.diapason0To360(721)).eq(1);
    expect(Angle.diapason0To360(-361)).eq(359);
    expect(Angle.diapason0To360(-721)).eq(359);

    expect(Angle.diapason0To360(180)).eq(180);
    expect(Angle.diapason0To360(-180)).eq(180);

    expect(Angle.diapason0To360(90)).eq(90);
    expect(Angle.diapason0To360(-90)).eq(270);
  });

  test('[-180; +180]', () => {
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

});
