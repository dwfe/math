import '@do-while-for-each/test'
import {logarithm, toFixed} from '../../util';

describe('logarithm', () => {

  test('check', () => {

    // равен 0 при единице, т.к. base^0 = 1
    expect(Math.abs(logarithm(0.1, 1))).eq(0);
    expect(logarithm(2, 1)).eq(0);
    expect(logarithm(4, 1)).eq(0);
    expect(logarithm(10, 1)).eq(0);
    expect(logarithm(1000, 1)).eq(0);

    // равен 1, если совпадает с базой, т.к. base^1 = base
    expect(logarithm(0.1, 0.1)).eq(1);
    expect(logarithm(2, 2)).eq(1);
    expect(logarithm(4, 4)).eq(1);
    expect(logarithm(10, 10)).eq(1);
    expect(logarithm(1000, 1000)).eq(1);


    expect(logarithm(2, 0.5)).eq(-1);
    expect(logarithm(2, 16)).eq(4);

    expect(toFixed(logarithm(10, 150), 8)).eq(2.17609126);

  });

});
