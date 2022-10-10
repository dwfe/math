import {IRect, TPoint} from './contract'

class R {

  static atCenter(center: TPoint, width: number, height: number): IRect {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return {
      left: center[0] - halfWidth,
      top: center[1] - halfHeight,
      right: center[0] + halfWidth,
      bottom: center[1] + halfHeight,
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
