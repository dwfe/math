import '@do-while-for-each/test'
import {Basis} from '../../web-transform'
import {Point} from '../../geometry'

describe('basis', () => {

  test('', () => {
    const basis = Basis.of([0, 0], [1, 0], [0, 1]);
    const str = basis.toString();
    const fromStr = Basis.fromString(str);
    expect(str).eq('[[0,0],[1,0],[0,1]]');
    expect(Point.isEqual([0,0],fromStr.o)).True();
    expect(Point.isEqual([1,0],fromStr.ox)).True();
    expect(Point.isEqual([0,1],fromStr.oy)).True();
  });

});
