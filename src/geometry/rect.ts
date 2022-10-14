import {IRect, TPoint} from './contract'

class R {

  static fromCenter(center: TPoint, width: number, height: number): IRect {
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
