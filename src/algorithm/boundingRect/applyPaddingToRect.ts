import {IRect, Rect} from '../../geometry';
import {isNullish} from '@do-while-for-each/common';

export type IPaddingSides = {
  left: number,
  right: number,
  top: number,
  bottom: number,
}

export type IPaddingDirections = {
  x: number,
  y: number
}

export type IPadding = IPaddingDirections | IPaddingSides | number

/**
 * Вычислить новый прямоугольник, который учитывает padding.
 * Работает только с прямоугольником, стороны которого параллельны осям координат,
 * т.е. с неповернутым в пространстве прямоугольником.
 */
export function applyPaddingToRect(rect: IRect, padding: IPadding): IRect {
  let paddings: IPaddingSides = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }

  if (typeof padding === 'number') {
    paddings.left = paddings.right = paddings.top = paddings.bottom = padding
  } else if (!isNullish((padding as IPaddingDirections).x)) {
    paddings.left = paddings.right = (padding as IPaddingDirections).x
    paddings.top = paddings.bottom = (padding as IPaddingDirections).y
  } else if (!isNullish((padding as IPaddingSides).left)) {
    paddings = padding as IPaddingSides
  }


  const x = rect.left - paddings.left;
  const y = rect.top - paddings.top;

  return Rect.fromCornerPoint(
    rect.width + paddings.left + paddings.right,
    rect.height + paddings.top + paddings.bottom,
    [x, y],
    'leftTop'
  );
}
