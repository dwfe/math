import '@do-while-for-each/test';
import {truncToDecimals} from '../../util';

describe('truncToDecimals', () => {

  test('positive', () => {
    expect(truncToDecimals(123.456)).eq(123.5);
    expect(truncToDecimals(123.456, 0.765)).eq(123.765);
  });

  test('negative', () => {
    expect(truncToDecimals(-64.433)).eq(-64.5);
    expect(truncToDecimals(-64.433, 0.77)).eq(-64.77);
  });

  test('zero', () => {
    expect(truncToDecimals(0)).eq(0.5);
    expect(truncToDecimals(-0)).eq(0.5);
    expect(truncToDecimals(0, 0.89)).eq(0.89);
    expect(truncToDecimals(-0, 0.89)).eq(0.89);
  });

});
