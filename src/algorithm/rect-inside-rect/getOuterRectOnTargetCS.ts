import {Basis, Matrix, Operator} from '../../linear-algebra';
import {IRectPoints, Rect} from '../../geometry';

/**
 * Описание смотри в редми репозитория.
 *
 * Найти координаты точек ВНЕШНЕГО(outer) прямоугольника в системе координат TargetCS.
 *
 * В outer вписан ВНУТРЕННИЙ(inner) прямоугольник, т.е.:
 *   - inner находится внутри outer
 *   - оба прямоугольника соприкасаются сторонами либо left/right, либо top/bottom, либо полностью совпадают
 *
 * Также известно:
 *                  - центры outer и inner совпадают
 * @param arOfOuter - соотношение сторон outer
 * @param arOfInner - соотношение сторон inner
 * @param basisOfInnerOnTargetCS - базис inner в системе координат TargetCS
 * @param isLeftRightSidesTouching - соприкасаются ли прямоугольники сторонами left/right ?
 */
export function getOuterRectOnTargetCS(
  arOfOuter: number,
  arOfInner: number,
  basisOfInnerOnTargetCS: Basis,
  isLeftRightSidesTouching = arOfOuter < arOfInner, // не всегда корректно вычислять стороны соприкосновения по aspectRatio прямоугольников
): IRectPoints {

  const basisOfInnerOnSpaceCS = Basis.fromRect(
    isLeftRightSidesTouching
      ? Rect.fromCenter(arOfOuter, arOfOuter / arOfInner, [0, 0])
      : Rect.fromCenter(arOfInner, 1, [0, 0])
  );
  const convSpaceToTarget = Operator.proportionsWithRotationConverter(
    basisOfInnerOnSpaceCS,
    basisOfInnerOnTargetCS
  );

  const outerRectOnSpaceCS = Rect.fromCenter(arOfOuter, 1, [0, 0]);

  return {
    leftTop: Matrix.apply(convSpaceToTarget, outerRectOnSpaceCS.leftTop),
    rightTop: Matrix.apply(convSpaceToTarget, outerRectOnSpaceCS.rightTop),
    rightBottom: Matrix.apply(convSpaceToTarget, outerRectOnSpaceCS.rightBottom),
    leftBottom: Matrix.apply(convSpaceToTarget, outerRectOnSpaceCS.leftBottom),
  };
}
