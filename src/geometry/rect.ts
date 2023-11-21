import {ICornerPointPosition, IPoint, IRect, IRectPoints, ISidePosition} from './contract'
import {IMatrix, Matrix} from '../linear-algebra'
import {Tuple4, Tuple5} from '../contract'
import {Point} from './point'

/**
 * An orthogonal rectangle whose sides are perpendicular to the corresponding coordinate axes.
 * On the web, the default origin is the top-left corner of a given context (with positive y-coordinate values being below the origin).
 */
class R {

  static fromOrigin(width: number, height: number): IRect {
    return {
      ...sidesAndPoints(
        0,     // left
        0,     // top
        width, // right
        height // bottom
      ),
      width,
      height,
      aspectRatio: getAspectRatio(width, height),
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
      ...sidesAndPoints(
        center[0] - widthHalf,  // left
        center[1] - heightHalf, // top
        center[0] + widthHalf,  // right
        center[1] + heightHalf  // bottom
      ),
      width,
      height,
      aspectRatio: getAspectRatio(width, height),
      center,
    };
  }

  static fromCornerPoint(
    width: number, height: number,
    point: IPoint, // corner point
    pointPosition: ICornerPointPosition
  ): IRect {

    switch (pointPosition) {
      case 'leftTop': {
        const right = point[0] + width;
        const bottom = point[1] + height;
        return {
          ...sidesAndPoints(
            point[0], // left
            point[1], // top
            right,    // right
            bottom    // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [right / 2, bottom / 2],
        };
      }
      case 'rightTop': {
        const left = point[0] - width;
        const bottom = point[1] + height;
        return {
          ...sidesAndPoints(
            left,     // left
            point[1], // top
            point[0], // right
            bottom    // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [left / 2, bottom / 2],
        };
      }
      case 'leftBottom': {
        const top = point[1] - height;
        const right = point[0] + width;
        return {
          ...sidesAndPoints(
            point[0],// left
            top,// top
            right,// right
            point[1] // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [right / 2, top / 2],
        };
      }
      case 'rightBottom': {
        const left = point[0] - width;
        const top = point[1] - height;
        return {
          ...sidesAndPoints(
            left,     // left
            top,      // top
            point[0], // right
            point[1]  // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [left / 2, top / 2],
        };
      }
      default:
        throw new Error(`unknown point position "${pointPosition}", acceptable values: "leftTop", "rightTop", "leftBottom", "rightBottom"`);
    }
  }

  static fromMiddleOfSide(
    width: number, height: number,
    point: IPoint, // middle point
    sidePosition: ISidePosition
  ): IRect {

    const widthHalf = width / 2;
    const heightHalf = height / 2;

    switch (sidePosition) {
      case 'top':
        return {
          ...sidesAndPoints(
            point[0] - widthHalf, // left
            point[1],             // top
            point[0] + widthHalf, // right
            point[1] + height,    // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [point[0], point[1] + heightHalf],
        };
      case 'left':
        return {
          ...sidesAndPoints(
            point[0],              // left
            point[1] - heightHalf, // top
            point[0] + width,      // right
            point[1] + heightHalf, // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [point[0] + widthHalf, point[1]],
        };
      case 'right':
        return {
          ...sidesAndPoints(
            point[0] - width,      // left
            point[1] - heightHalf, // top
            point[0],              // right
            point[1] + heightHalf, // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [point[0] - widthHalf, point[1]],
        };
      case 'bottom':
        return {
          ...sidesAndPoints(
            point[0] - widthHalf, // left
            point[1] - height,    // top
            point[0] + widthHalf, // right
            point[1]              // bottom
          ),
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: [point[0], point[1] - heightHalf],
        };
      default:
        throw new Error(`unknown side position "${sidePosition}", acceptable values: "top", "left", "right", "bottom"`);
    }

  }

  static fromDOMRect(rect: IDOMRect): IRect {
    return {
      ...sidesAndPoints(
        rect.left,   // left
        rect.top,    // top
        rect.right,  // right
        rect.bottom, // bottom
      ),
      width: rect.width,
      height: rect.height,
      aspectRatio: getAspectRatio(rect.width, rect.height),
      center: [rect.width / 2, rect.height / 2],
    };
  }

  static width = (rect: IRectPoints): number => Point.distance(rect.leftTop, rect.rightTop);
  static height = (rect: IRectPoints): number => Point.distance(rect.leftTop, rect.leftBottom);

  static intersectsRect(a: IRect, b: IRect, excludeContour = false): boolean {
    if (excludeContour)
      return (
        a.left < b.right &&
        b.left < a.right &&
        a.top < b.bottom &&
        b.top < a.bottom
      );
    return (
      a.left <= b.right &&
      b.left <= a.right &&
      a.top <= b.bottom &&
      b.top <= a.bottom
    );
  }


//region Equality

  static isEqualByWidthHeight = (a: IWidthHeight, b: IWidthHeight): boolean => {
    if (!a || !b) {
      return false;
    }
    return (
      a.width === b.width &&
      a.height === b.height
    );
  };

  static isEqualByWidthHeightAccuracy = (a: IWidthHeight, b: IWidthHeight, accuracy = 0.0001): boolean => {
    if (!a || !b) {
      return false;
    }
    return (
      Math.abs(a.width - b.width) < accuracy &&
      Math.abs(a.height - b.height) < accuracy
    );
  };

  static isAspectRatioEqual = (a: IRect, b: IRect, accuracy = 0.0001): boolean => (
    Math.abs(a.aspectRatio - b.aspectRatio) < accuracy
  );

//endregion Equality


//region Transformation

  static applyTransform = (rect: IRectPoints, m: IMatrix): IPoint[] => [
    Matrix.apply(m, rect.leftTop),
    Matrix.apply(m, rect.rightTop),
    Matrix.apply(m, rect.rightBottom),
    Matrix.apply(m, rect.leftBottom),
  ];

//endregion Transformation

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

interface IWidthHeight {
  width: number;
  height: number;
}


function sidesAndPoints(left: number, top: number, right: number, bottom: number) {
  const leftTop = [left, top];
  const rightTop = [right, top];
  const rightBottom = [right, bottom];
  const leftBottom = [left, bottom];
  return {
    left,
    top,
    right,
    bottom,

    leftTop,
    rightTop,
    rightBottom,
    leftBottom,

    points: [leftTop, rightTop, rightBottom, leftBottom] as Tuple4<IPoint>,
    polygon: [leftTop, rightTop, rightBottom, leftBottom, leftTop] as Tuple5<IPoint>,
  };
}

function getAspectRatio(width: number, height: number) {
  return height === 0 ? 0 : width / height
}
