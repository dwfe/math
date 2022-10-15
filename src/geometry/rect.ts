import {IRect, TPoint} from './contract'

class R {

  static fromOrigin(width: number, height: number): IRect {
    return {
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      aspectRatio: width / height,
      center: [width / 2, height / 2]
    };
  }

  static fromCenter(width: number, height: number, center?: TPoint): IRect {
    if (!center) {
      center = [width / 2, height / 2]; // если точка центра не задана, то она будет на пересечении диагоналей
    }
    const widthHalf = width / 2;
    const heightHalf = height / 2;
    return {
      left: center[0] - widthHalf,
      top: center[1] - heightHalf,
      right: center[0] + widthHalf,
      bottom: center[1] + heightHalf,
      width,
      height,
      aspectRatio: width / height,
      center,
    };
  }

  static leftTop = (r: IRect): TPoint => ([r.left, r.top]);
  static leftBottom = (r: IRect): TPoint => ([r.left, r.bottom]);
  static rightTop = (r: IRect): TPoint => ([r.right, r.top]);
  static rightBottom = (r: IRect): TPoint => ([r.right, r.bottom]);

  static center = (r: IRect): TPoint => ([(r.left + r.right) / 2, (r.top + r.bottom) / 2]);
  static width = (r: IRect): number => (r.right - r.left);
  static height = (r: IRect): number => (r.bottom - r.top);

}

export {
  R as Rect
}
