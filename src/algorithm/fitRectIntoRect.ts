/**
 * Вписываем один прямоугольник (inner) в другой прямоугольник (outer)
 */
export function fitRectIntoRect(outer: IOuter, innerAspectRatio: number) {
  let left = 0;
  let top = 0;
  let width = outer.width;
  let height = outer.height;
  if (outer.aspectRatio > innerAspectRatio) {
    width = height * innerAspectRatio;
    left = (outer.width - width) / 2;
  } else if (outer.aspectRatio < innerAspectRatio) {
    height = width / innerAspectRatio;
    top = (outer.height - height) / 2;
  }
  return {
    width,  // такой должна стать ширина innerRect, чтобы он вписался в outerRect
    height, // такой должна стать высота innerRect, чтобы он вписался в outerRect
    left, // отступ слева внутри outerRect для innerRect, чтобы innerRect оказался центрирован по ширине
    top,  // отступ сверху внутри outerRect для innerRect, чтобы innerRect оказался центрирован по высоте
  };
}

interface IOuter {
  width: number;
  height: number;
  aspectRatio: number;
}
