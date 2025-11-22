import {ICornerPointPosition, IPoint, IRect, IRectPoints, IRectPosition, ISidePosition, IXPosition, IYPosition} from './contract'
import {IMatrix, Matrix, Operator} from '../linear-algebra'
import {Tuple4, Tuple5} from '../contract'
import {Point} from './point'
import {Angle} from '../angle';

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
        const data = sidesAndPoints(
          point[0], // left
          point[1], // top
          right,    // right
          bottom    // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
        };
      }
      case 'rightTop': {
        const left = point[0] - width;
        const bottom = point[1] + height;
        const data = sidesAndPoints(
          left,     // left
          point[1], // top
          point[0], // right
          bottom    // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
        };
      }
      case 'leftBottom': {
        const top = point[1] - height;
        const right = point[0] + width;
        const data = sidesAndPoints(
          point[0],// left
          top,// top
          right,// right
          point[1] // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
        };
      }
      case 'rightBottom': {
        const left = point[0] - width;
        const top = point[1] - height;
        const data = sidesAndPoints(
          left,     // left
          top,      // top
          point[0], // right
          point[1]  // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
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
      case 'top': {
        const data = sidesAndPoints(
          point[0] - widthHalf, // left
          point[1],             // top
          point[0] + widthHalf, // right
          point[1] + height,    // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
        };
      }
      case 'left': {
        const data = sidesAndPoints(
          point[0],              // left
          point[1] - heightHalf, // top
          point[0] + width,      // right
          point[1] + heightHalf, // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
        };
      }
      case 'right': {
        const data = sidesAndPoints(
          point[0] - width,      // left
          point[1] - heightHalf, // top
          point[0],              // right
          point[1] + heightHalf, // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
        };
      }
      case 'bottom': {
        const data = sidesAndPoints(
          point[0] - widthHalf, // left
          point[1] - height,    // top
          point[0] + widthHalf, // right
          point[1]              // bottom
        );
        return {
          ...data,
          width,
          height,
          aspectRatio: getAspectRatio(width, height),
          center: Point.middle(data.leftTop, data.rightBottom),
        };
      }
      default:
        throw new Error(`unknown side position "${sidePosition}", acceptable values: "top", "left", "right", "bottom"`);
    }

  }

  static fromDOMRect(rect: IDOMRect): IRect {
    const data = sidesAndPoints(
      rect.left,   // left
      rect.top,    // top
      rect.right,  // right
      rect.bottom, // bottom
    );
    return {
      ...data,
      width: rect.width,
      height: rect.height,
      aspectRatio: getAspectRatio(rect.width, rect.height),
      center: Point.middle(data.leftTop, data.rightBottom),
    };
  }

  static fromPosition(width: number, height: number, p: IPoint, pos: IRectPosition) {
    const creator = rectCreators[pos];
    return creator(width, height, p, pos);
  }

  static width = (rect: IRectPoints): number => Point.distance(rect.leftTop, rect.rightTop);
  static height = (rect: IRectPoints): number => Point.distance(rect.leftTop, rect.leftBottom);

  // для прямоугольников, стороны которых параллельны осям координат
  static intersectsRectWhenSidesParallelToAxes(a: IRect, b: IRect, excludeContour = false): boolean {
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

  /**
   * Является ли переданная позиция углом в прямоугольнике
   */
  static isPositionCorner(p: IRectPosition): p is ICornerPointPosition {
    switch (p) {
      case 'rightBottom':
      case 'leftBottom':
      case 'rightTop':
      case 'leftTop':
        return true
    }
    return false
  }

  /**
   * Характеризует ли переданная позиция ось X
   *
   * center - возвращает false
   */
  static isPositionX(p: IRectPosition): p is IXPosition {
    switch (p) {
      case 'left':
      case 'right':
        return true
    }

    return false
  }

  /**
   * Характеризует ли переданная позиция ось Y
   *
   * center - возвращает false
   */
  static isPositionY(p: IRectPosition): p is IYPosition {
    switch (p) {
      case 'top':
      case 'bottom':
        return true
    }

    return false
  }

  /**
   * Получить противоположную позицию в прямоугольнике
   *
   * Для center - результат center
   */
  static getOppositePosition(position: IRectPosition): IRectPosition {
    switch (position) {
      case 'left':
        return 'right';
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      case 'right':
        return 'left';
      case 'leftBottom':
        return 'rightTop';
      case 'rightTop':
        return 'leftBottom';
      case 'leftTop':
        return 'rightBottom';
      case 'rightBottom':
        return 'leftTop';
      case 'center':
        return 'center';
      default:
        return position;
    }
  }

  /**
   * Ближайшая к переданной точке точка на грани неповёрнутого(!) прямоугольника.
   */
  static getNearestPointOnEdge = ([x, y]: IPoint, [left, top]: IPoint, [right, bottom]: IPoint): IPoint => {

    // смещения точки от границ
    // Если оба смещения относительно одной оси положительны,
    // то координата точки находится внутри двух параллельных прямых
    // Если одна из них отрицательна, координата выходит за пределы
    const obj = {
      left: x - left,
      right: right - x,
      top: y - top,
      bottom: bottom - y,
    }

    let xKey: keyof typeof obj;
    let yKey: keyof typeof obj;

    // Чтобы избежать ещё большего количества if'ов левые и верхние смещения инвертирую
    let xSign: number = 1;
    let ySign: number = 1;

    // определяем ближайшую сторону по X
    if (obj.left <= obj.right) {
      xKey = 'left';
      xSign = -1;
    } else xKey = 'right';

    // определяем ближайшую сторону по Y
    if (obj.top <= obj.bottom) {
      yKey = 'top';
      ySign = -1;
    } else yKey = 'bottom';

    // Покрытие кейса внешней точки
    // Если координата меньше нуля, а значит точка выходит за границы прямоугольника
    // Прибавляю смещение и оставляю его нулевым
    if (obj[xKey] < 0) {
      x += xSign * obj[xKey];
      obj[xKey] = 0;
    }

    if (obj[yKey] < 0) {
      y += ySign * obj[yKey]
      obj[yKey] = 0;
    }

    // Покрытие кейса полностью внутренней точки,
    // Точно так же прибавляю смещение
    // на этом этапе от внешней точки уже ничего не осталось, но делать ветвление кажется избыточным.
    if (obj[xKey] <= obj[yKey]) {
      x += xSign * obj[xKey];
    } else {
      y += ySign * obj[yKey]
    }

    return [x, y];
  }

  /**
   * Ближайшая точка к любой из сторон прямоугольника, в том числе повёрнутого в простанстве
   *
   * Технически возможно решить задачу несколькими способами:
   * - Повернуть точки в простанстве и без искажения найти ближайшую
   * - Прочертить из точки прямый линии, параллельный сторонам прямоугольника и вычислить самую маленьку дистанцию
   * - То же самое, что и пункт 2, но можно вычислить квадрант прямоугольника, чтобы сократить точки пересечения
   * - ...
   *
   * Здесь выбран первый подход в виду более простых расчётов
   */
  static getNearestPointOnRotatedEdge(p: IPoint, rect: IRect) {
    // Угол поворота прямоугольника
    const angle = Angle.northCounterClockwise(Point.sub(rect.leftTop, rect.leftBottom));

    // Если угол нулевой, значит можно сразу отдать значение
    if (!angle) return this.getNearestPointOnEdge(p, rect.leftTop, rect.rightBottom);

    // Матрица обратного поворота прямоугольника до параллельности сторон осям
    let matrix = Operator.rotateAtPoint(rect.center, angle, 'rad');

    // И её обратная матрица.
    // TODO может через оператора создать матрицу поворота с обратным углом,
    //  а не искть обратную?
    let inverted = Matrix.invert(matrix);

    // Найти ближайшую точку в нетрансформированном прямоугольнике и затем
    // исказить найденную точку матрицей, искажающей прямоугольник
    return Matrix.apply(
      inverted,
      this.getNearestPointOnEdge(Matrix.apply(matrix, p),
        Matrix.apply(matrix, rect.leftTop),
        Matrix.apply(matrix, rect.rightBottom),
      )
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

  static applyTransformExtended = (rect: IRectPoints, m: IMatrix): { points: IPoint[]; rectPoints: IRectPoints; } => {
    const leftTop = Matrix.apply(m, rect.leftTop);
    const rightTop = Matrix.apply(m, rect.rightTop);
    const rightBottom = Matrix.apply(m, rect.rightBottom);
    const leftBottom = Matrix.apply(m, rect.leftBottom);
    return {
      points: [leftTop, rightTop, rightBottom, leftBottom],
      rectPoints: {leftTop, rightTop, rightBottom, leftBottom},
    };
  };


//endregion Transformation

}

interface IRectCreator {
  (width: number, height: number, p: IPoint, pos: IRectPosition): IRect;
}

const rectCreators: {
  [Key in IRectPosition]: IRectCreator;
} = {
  leftBottom: R.fromCornerPoint as IRectCreator,
  rightBottom: R.fromCornerPoint as IRectCreator,
  rightTop: R.fromCornerPoint as IRectCreator,
  leftTop: R.fromCornerPoint as IRectCreator,
  left: R.fromMiddleOfSide as IRectCreator,
  top: R.fromMiddleOfSide as IRectCreator,
  right: R.fromMiddleOfSide as IRectCreator,
  bottom: R.fromMiddleOfSide as IRectCreator,
  center: ((width: number, height: number, p: IPoint, _: any) => {
    return R.fromCenter(width, height, p);
  }) as IRectCreator,
} as const

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
