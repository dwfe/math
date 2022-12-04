import '@do-while-for-each/test';
import {fitRectIntoRect} from '../../algorithm/fitRectIntoRect'
import {Rect} from '../../geometry'

describe('fitRectIntoRect', () => {

  test('outer.aspectRatio > innerAspectRatio', () => {
    const outer = Rect.fromOrigin(140, 100);
    const inner = Rect.fromOrigin(100, 200);
    const {width, height, left, top} = fitRectIntoRect(outer, inner.aspectRatio);
    expect(width).eq(50);
    expect(height).eq(100);
    expect(left).eq(45);
    expect(top).eq(0);
  });

  test('outer.aspectRatio < innerAspectRatio', () => {
    const outer = Rect.fromOrigin(100, 150);
    const inner = Rect.fromOrigin(200, 100);
    const {width, height, left, top} = fitRectIntoRect(outer, inner.aspectRatio);
    expect(width).eq(100);
    expect(height).eq(50);
    expect(left).eq(0);
    expect(top).eq(50);
  });

  test('same AR', () => {
    {
      const outer = Rect.fromOrigin(100, 150);
      const inner = Rect.fromOrigin(100, 150);
      const {width, height, left, top} = fitRectIntoRect(outer, inner.aspectRatio);
      expect(width).eq(100);
      expect(height).eq(150);
      expect(left).eq(0);
      expect(top).eq(0);
    }
    {
      const outer = Rect.fromOrigin(1, 1);
      const inner = Rect.fromOrigin(1, 1);
      const {width, height, left, top} = fitRectIntoRect(outer, inner.aspectRatio);
      expect(width).eq(1);
      expect(height).eq(1);
      expect(left).eq(0);
      expect(top).eq(0);
    }
  });

});

