import {ISegmentChanging, M2x2, TWebMatrix} from './contract'
import {AngleType, Point, TPoint} from '../geometry'
import {WebMatrix} from './web-matrix-2d'
import {Matrix2x2} from './matrix-2x2'
import {Basis} from './basis'

export class LinearOperator {

  /**
   * The Algorithm is based on:
   *   https://medium.com/@benjamin.botto/zooming-at-the-mouse-coordinates-with-affine-transformations-86e7312fd50b#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjNkZjBhODMxZTA5M2ZhZTFlMjRkNzdkNDc4MzQ0MDVmOTVkMTdiNTQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2MjczMDM4NjQsImF1ZCI6IjIxNjI5NjAzNTgzNC1rMWs2cWUwNjBzMnRwMmEyamFtNGxqZGNtczAwc3R0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNjczOTgzOTIzODQ1NTk2OTI4NyIsImVtYWlsIjoiZ29uem8uYmFyZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiMjE2Mjk2MDM1ODM0LWsxazZxZTA2MHMydHAyYTJqYW00bGpkY21zMDBzdHRnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwibmFtZSI6IkdvbnpvIEJhcmQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2hKTEFhenFmT0xpMk9SZXVtWE92WGtsbmJmX21tZHk3MVJYZElTPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkdvbnpvIiwiZmFtaWx5X25hbWUiOiJCYXJkIiwiaWF0IjoxNjI3MzA0MTY0LCJleHAiOjE2MjczMDc3NjQsImp0aSI6ImMyNzA3ZjJhOWQ4YTQ4NzljZDExMGNlOTlhZTQ4NWFmNTdhMjQ4YjgifQ.Wv3Lb8ArxlUqvGrWhDE6JkMm48Cwx8CYANAkoGljovPY1Acveycet2EZm2S1VATqjZEkX6Y-rZzXcdGYe2qAth91TtVishnJSWrtH3P9G5bXR3xP3lQ5rdwWLW8UJ51KnFl2cj5aQy8DOrmXkEAMvBZEwoDEN6StA6ZlyZwv96X1al4OY_q50jFKHUV3oGK4PS4cHWM59lP-fvXJH25D7iio0O3w9gvP3MHHyG7ckhswq1gsaiEbS2XJHrbjLJwLJ4aR8RjGF8Is6uy3gEl5WFI6OHSiW5bA0fWimsKXvbhSbAUGYndWjt7hdy8gKh9aGHnSrSQxnPc6g2s-PCbUtg
   */
  static scaleAtPoint = (p: TPoint, sx: number, sy = sx): TWebMatrix =>
    WebMatrix.multiplySequence3(
      [1, 0, 0, 1, p[0], p[1]],        // (1) Translate the world such that p is at the origin
      WebMatrix.scaleIdentity(sx, sy), // (2) Scale the world
      [1, 0, 0, 1, -p[0], -p[1]],      // (3) Translate the world back such that p is at its initial location
    );

  static rotateAtPoint = (p: TPoint, angle: number, angleType?: AngleType): TWebMatrix =>
    WebMatrix.multiplySequence3(
      [1, 0, 0, 1, p[0], p[1]],                   // (1) Translate the world such that p is at the origin
      WebMatrix.rotateIdentity(angle, angleType), // (2) Rotate the world
      [1, 0, 0, 1, -p[0], -p[1]],                 // (3) Translate the world back such that p is at its initial location
    );


  /**
   * If the origin of the new coordinate system is not shifted or rotated,
   * then the transition to the new coordinate system is the usual scaling.
   */
  static proportionsConverterWithoutShiftAndAngle = (onAxisX: ISegmentChanging, onAxisY: ISegmentChanging): TWebMatrix =>
    WebMatrix.scaleIdentity(
      onAxisX.toSegment / onAxisX.fromSegment,
      onAxisY.toSegment / onAxisY.fromSegment
    );

  static proportionsConverter = (onAxisX: ISegmentChanging, onAxisY: ISegmentChanging, [fromPoint, toPoint]: [TPoint, TPoint]): TWebMatrix =>
    WebMatrix.multiplySequence3(
      [1, 0, 0, 1, toPoint[0], toPoint[1]],                                      // (3) Move the point from the "World-To" origin to point toPoint
      LinearOperator.proportionsConverterWithoutShiftAndAngle(onAxisX, onAxisY), // (2) Scale <=> convert "World-From" -> "World-To"
      [1, 0, 0, 1, -fromPoint[0], -fromPoint[1]],                                // (1) Move the point fromPoint to origin "World-From"
    );

  static proportionsAndAngleConverter = (from: Basis, to: Basis): TWebMatrix => {
    const {apply, multiply, invert} = Matrix2x2;
    const linearM: M2x2 = [...multiply(to.ltMatrix, invert(from.ltMatrix))]; // FROM-basis -> TO-basis
    const shift = Point.sub(to.o, apply(linearM, from.o));
    return [...linearM, ...shift]; // m * fromPoint => toPoint
  };

  /**
   * Change of Basis (Professor Dave Explains):
   *   https://youtu.be/HZa1RwFHgwU?t=496
   *
   * @param from - FROM-basis
   * @param to - TO-basis. Decomposed by the FROM-basis!!!
   */
  static changeOfBasisMatrix = (from: Basis, to: Basis): TWebMatrix => {
    const {apply, multiply, invert} = Matrix2x2;
    const linearM: M2x2 = [...multiply(invert(to.ltMatrix), from.ltMatrix)]; // FROM-basis -> TO-basis
    const shift = Point.sub(from.o, apply(linearM, to.o));
    if (!Point.isEqual(shift, [0, 0]) && !Point.isEqual(from.o, [0, 0])) {
      throw new Error(`if there is a shift, then point from.o [${from.o}] should be in the center of coordinates [0,0]`);
    }
    return [...linearM, ...shift]; // m * fromPoint => toPoint
  };

  /**
   * Замена базиса (Мосин):
   *   https://www.youtube.com/watch?v=gF1uo6X6W3M
   *
   * @param from - FROM-basis
   * @param to - TO-basis. Decomposed by the FROM-basis!!!
   */
  static changeOfBasisMatrix2 = (from: Basis, to: Basis): TWebMatrix => {
    const {apply, multiply, invert} = Matrix2x2;
    const byLine: M2x2 = [...multiply(to.centeredMatrixCoef, invert(from.centeredMatrixCoef))];
    let linearM: M2x2 = [byLine[0], byLine[2], byLine[1], byLine[3]]; // converts byLine -> by column
    linearM = invert(linearM); // FROM-basis -> TO-basis
    const shift = Point.sub(from.o, apply(linearM, to.o));
    if (!Point.isEqual(shift, [0, 0]) && !Point.isEqual(from.o, [0, 0])) {
      throw new Error(`if there is a shift, then point from.o [${from.o}] should be in the center of coordinates [0,0]`);
    }
    return [...linearM, ...shift]; // m * fromPoint => toPoint
  };

}
