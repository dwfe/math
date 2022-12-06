import {IPoint, IRect} from './contract'
import {Tuple2} from '../contract'

class R {

  static fromOrigin(width: number, height: number): IRect {
    return {
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      aspectRatio: height === 0 ? 0 : width / height,
      center: [width / 2, height / 2]
    };
  }

  static fromCenter(width: number, height: number, center?: IPoint): IRect {
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
      aspectRatio: height === 0 ? 0 : width / height,
      center,
    };
  }

  static fromDOMRect(rect: IDOMRect): IRect {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      aspectRatio: rect.height === 0 ? 0 : rect.width / rect.height,
      center: [rect.width / 2, rect.height / 2],
    };
  }

  static leftTop = (r: IRect): Tuple2 => ([r.left, r.top]);
  static leftBottom = (r: IRect): Tuple2 => ([r.left, r.bottom]);
  static rightTop = (r: IRect): Tuple2 => ([r.right, r.top]);
  static rightBottom = (r: IRect): Tuple2 => ([r.right, r.bottom]);

  static center = (r: IRect): Tuple2 => ([(r.left + r.right) / 2, (r.top + r.bottom) / 2]);
  static width = (r: IRect): number => (r.right - r.left);
  static height = (r: IRect): number => (r.bottom - r.top);

  static isEqual = (a: IRect, b: IRect): boolean => (
    a.width === b.width &&
    a.height === b.height
  );

  static isAspectRatioEqual = (a: IRect, b: IRect, accuracy = 0.0001): boolean => (
    Math.abs(a.aspectRatio - b.aspectRatio) < accuracy
  );

}

export {
  R as Rect
}


interface IDOMRect {
  left: number;
  top: number;
  right: number;
  bottom: number;

  width: number;
  height: number;
}
