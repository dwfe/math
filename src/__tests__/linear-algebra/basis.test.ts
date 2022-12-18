import {geoStereographic} from 'd3-geo'
import '@do-while-for-each/test'
import {IPoint, Point} from '../../geometry'
import {Basis, Extent} from '../../linear-algebra'
import {Tuple2} from '../../contract'

const geoToProjection = geoStereographic().rotate([0, -90, 0]);
const projectionToGeo = geoToProjection.invert as (point: Tuple2) => IPoint;

describe('basis', () => {

  test('toJSON()', () => {
    const basis = Basis.fromExtent(
      [1, 2],
      [3, 4],
      [5, 6]
    );
    const check = (points: IPoint[]) => {
      expect(Point.isEqual(points[0], [1, 2])).True();
      expect(Point.isEqual(points[1], [3, 4])).True();
      expect(Point.isEqual(points[2], [5, 6])).True();
    }
    const json = basis.toJSON();
    check(json);
    check([basis.extent.origin, basis.extent.oxEnd, basis.extent.oyEnd]);
    basis.extent.origin = [0, 1];
    basis.extent.oxEnd = [1, 2];
    basis.extent.oyEnd = [2, 3];
    expect(Point.isEqual(basis.extent.origin, [0, 1])).True();
    expect(Point.isEqual(basis.extent.oxEnd, [1, 2])).True();
    expect(Point.isEqual(basis.extent.oyEnd, [2, 3])).True();
    check(json);
  });

  test('aspectRatio', () => {
    expect(Basis.standard().extent.aspectRatio).eq(1);
    expect(Basis.fromExtent([0, 0], [2, 0], [0, 1]).extent.aspectRatio).eq(2);
    expect(Basis.fromExtent(
      [384.87736210053623, 325.674784307791],
      [403.5516764210449, 143.91252507266364],
      [566.6396213356633, 344.3490986282995],
    ).extent.aspectRatio).eq(1.000000000000002);
    expect(Basis.fromExtent(
      [377.01674005943624, 316.86520988968135],
      [394.0639787249101, 150.9397274127133],
      [576.1273190317979, 337.32189628824995],
    ).extent.aspectRatio).eq(0.8333333333333333);
  });

  test('de/serialize', () => {
    const basis = Basis.standard();
    const str = basis.toString();
    const fromStr = Basis.fromString(str);
    expect(str).eq('[[0,0],[1,0],[0,1]]');
    expect(Point.isEqual([0, 0], fromStr.extent.origin)).True();
    expect(Point.isEqual([1, 0], fromStr.extent.oxEnd)).True();
    expect(Point.isEqual([0, 1], fromStr.extent.oyEnd)).True();
  });

  test('isOrthogonal', () => {
    const projectionBasis = (origin: IPoint, oxEnd: IPoint, oyEnd: IPoint) => (
      Basis.fromJSON(
        [origin, oxEnd, oyEnd]
          .map(geoPoint => geoToProjection(geoPoint as Tuple2) as IPoint)
      )
    );

    expect(Basis.standard().isOrthogonal).True();
    expect(Basis.fromExtent([0, 0], [1, 1], [0, 1]).isOrthogonal).False();
    expect(Basis.fromExtent([0, 0], [1, -2], [2, 1]).isOrthogonal).True();
    expect(Basis.fromExtent([0, 0], [2, 1], [-1, 2]).isOrthogonal).True(); // [a,b,-b,a]

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
    const checkSimple = (basis: Basis) => {
      const good = Basis.orthogonalize(basis);
      //console.log(`checkSimple`, bad.aspectRatio === good.aspectRatio, bad.aspectRatio, good.aspectRatio, good.toJSON())
      expect(basis.isOrthogonal).False();
      expect(good.isOrthogonal).True();
    }
    const checkSimpleAR1 = (basis: Basis) => {
      const good = Basis.orthogonalizeAR1(basis);
      //console.log(`checkSimpleAR1`, bad.aspectRatio === good.aspectRatio, bad.aspectRatio, good.aspectRatio, good.toJSON())
      expect(basis.isOrthogonal).False();
      expect(good.isOrthogonal).True();
    }
    const checkAlreadyOrthogonal = (basis: Basis) => {
      expect(basis.isOrthogonal).True();
      expect(Basis.orthogonalize(basis).isOrthogonal).True();
    }
    const checkGeobasis = (basis: Basis) => {
      const projectionBasis = Basis.fromJSON(
        basis.toJSON().map(geoPoint => geoToProjection(geoPoint as Tuple2) as IPoint)
      );
      expect(projectionBasis.isOrthogonal).False();
      const orthoProjectionBasis = Basis.orthogonalize(projectionBasis);
      expect(orthoProjectionBasis.isOrthogonal).True();
      // console.log(``, orthoProjectionBasis.toJSON().map(point => projectionToGeo(point)))
    }

    checkSimple(Basis.fromExtent([0, 0], [1, 1], [0, 1]));
    checkSimpleAR1(Basis.fromExtent([0, 0], [1, 1], [0, 1]));
    checkSimple(Basis.fromExtent([1, 2], [0, 1], [1, 0]));
    checkSimpleAR1(Basis.fromExtent([1, 2], [0, 1], [1, 0]));
    checkSimple(Basis.fromExtent([0, 0], [2, 1], [0.5, 1.5]));
    checkSimpleAR1(Basis.fromExtent([0, 0], [2, 1], [0.5, 1.5]));
    checkAlreadyOrthogonal(Basis.fromExtent([0, 0], [1, 0], [0, 1]));
    checkAlreadyOrthogonal(Basis.fromExtent([1, 1], [1, 0], [0, 1]));

    checkGeobasis(Basis.fromExtent(
      [65, 73],
      [85, 73],
      [65, 65],
    ));

    checkGeobasis(Basis.fromExtent(
      [540.7124205178468, 127.08110020067348],
      [454.058963782401, 267.91670026239075],
      [465.89350798505944, 81.04645130996792],
    ))
  });

  test('fourth point', () => {
    expect(Point.isEqual(
      Basis.fromExtent([1, 2], [2, 2], [1, 3]).extent.fourthPoint,
      [2, 3]
    )).True();
    expect(Point.isEqual(
      Basis.fromExtent([2, -1], [1, 0], [4, 1]).extent.fourthPoint,
      [3, 2]
    )).True();
    expect(Point.isEqual(
      Basis.fromExtent([0, 0], [1, 0], [1, -1]).extent.fourthPoint,
      [2, -1]
    )).True();
    expect(Point.isEqual(
      Basis.fromExtent([0, 0], [2, 1], [0.5, 1.5]).extent.fourthPoint,
      [2.5, 2.5]
    )).True();
    expect(Point.isEqual(
      Basis.fromExtent([-3, -40], [3, 10], [-4, -10]).extent.fourthPoint,
      [2, 40]
    )).True();
  });

  test('extent.center', () => {
    expect(Point.isEqual(Extent.of([2, 0], [3, 1], [1, 1]).center, [2, 1])).True();
    expect(Point.isEqual(Extent.of([-3, -40], [3, 10], [-4, -10]).center, [-0.5, 0])).True();
  });

});
