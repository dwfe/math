import {geoStereographic} from 'd3-geo'
import '@do-while-for-each/test'
import {Point, TPoint} from '../../geometry'
import {Basis} from '../../web-transform'

const geoToProjection = geoStereographic().rotate([0, -90, 0]);
const projectionToGeo = geoToProjection.invert as (point: TPoint) => TPoint;

describe('basis', () => {

  test('de/serialize', () => {
    const basis = Basis.of([[0, 0], [1, 0], [0, 1]]);
    const str = basis.toString();
    const fromStr = Basis.fromString(str);
    expect(str).eq('[[0,0],[1,0],[0,1]]');
    expect(Point.isEqual([0, 0], fromStr.origin)).True();
    expect(Point.isEqual([1, 0], fromStr.oxEnd)).True();
    expect(Point.isEqual([0, 1], fromStr.oyEnd)).True();
  });

  test('isOrthogonal', () => {
    const projectionBasis = (origin: TPoint, oxEnd: TPoint, oyEnd: TPoint) => (
      Basis.of(
        [origin, oxEnd, oyEnd]
          .map(geoPoint => geoToProjection(geoPoint) as TPoint)
      )
    );

    expect(Basis.of([[0, 0], [1, 0], [0, 1]]).isOrthogonal).True();
    expect(Basis.of([[0, 0], [1, 1], [0, 1]]).isOrthogonal).False();
    expect(Basis.of([[0, 0], [1, -2], [2, 1]]).isOrthogonal).True();

    expect(projectionBasis(
      [0, 90],
      [90, 40],
      [0, 40],
    ).isOrthogonal).True();

    expect(projectionBasis(
      [0, 90],
      [90, 40],
      [1, 40],
    ).isOrthogonal).False();

    expect(projectionBasis(
      [308.5039920527638, 38.141063525000035],
      [215.77712186790768, 34.77627440139512],
      [42.56087760264427, 35.740828102571946],
    ).isOrthogonal).True();

    expect(projectionBasis(
      [540.7124205178468, 127.08110020067348],
      [454.058963782401, 267.91670026239075],
      [465.89350798505944, 81.04645130996792],
    ).isOrthogonal).False();
  });

  test('orthogonalize', () => {
    const checkSimple = (basisJson: TPoint[]) => {
      expect(Basis.of(basisJson).isOrthogonal).False();
      expect(Basis.of(Basis.orthogonalize(basisJson)).isOrthogonal).True();
    }
    const checkAlreadyOrthogonal = (basisJson: [TPoint, TPoint, TPoint]) => {
      expect(Basis.of(basisJson).isOrthogonal).True();
      expect(Basis.of(Basis.orthogonalize(basisJson)).isOrthogonal).True();
    }
    const checkGeobasis = (basisJson: [TPoint, TPoint, TPoint]) => {
      const projectionBasis = Basis.of(
        basisJson.map(geoPoint => geoToProjection(geoPoint) as TPoint)
      );
      expect(projectionBasis.isOrthogonal).False();
      const orthoProjectionBasis = Basis.of(Basis.orthogonalize(projectionBasis.toJSON()));
      expect(orthoProjectionBasis.isOrthogonal).True();
      // console.log(``, orthoProjectionBasis.toJSON().map(point => projectionToGeo(point)))
    }


    checkSimple([[0, 0], [1, 1], [0, 1]]);
    checkAlreadyOrthogonal([[0, 0], [1, 0], [0, 1]]);
    checkAlreadyOrthogonal([[1, 1], [1, 0], [0, 1]]);
    checkSimple([[1, 2], [0, 1], [1, 0]]);

    checkGeobasis([
      [65, 73],
      [85, 73],
      [65, 65],
    ]);

    checkGeobasis([
      [540.7124205178468, 127.08110020067348],
      [454.058963782401, 267.91670026239075],
      [465.89350798505944, 81.04645130996792],
    ])
  });

});
