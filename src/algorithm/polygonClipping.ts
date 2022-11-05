import {IPoint, IPolygon} from '../geometry'

/**
 * https://codepen.io/Saqoosha/pen/wpBaYw
 * https://rosettacode.org/wiki/Sutherland-Hodgman_polygon_clipping#JavaScript
 *
 * @param subjectPolygon - polygon to clip
 * @param clipPolygon - polygon, along the borders of which it will be necessary to clip
 */
export function clipPolygon(subjectPolygon: IPolygon, clipPolygon: IPolygon) {
  let cp1: IPoint, cp2: IPoint, s: IPoint, e: IPoint;
  const inside = (p: IPoint) => (cp2[0] - cp1[0]) * (p[1] - cp1[1]) > (cp2[1] - cp1[1]) * (p[0] - cp1[0]);
  const intersection = (): IPoint => {
    const dc = [cp1[0] - cp2[0], cp1[1] - cp2[1]],
      dp = [s[0] - e[0], s[1] - e[1]],
      n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0],
      n2 = s[0] * e[1] - s[1] * e[0],
      n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);
    return [(n1 * dp[0] - n2 * dc[0]) * n3, (n1 * dp[1] - n2 * dc[1]) * n3];
  };
  let outputList = subjectPolygon;
  cp1 = clipPolygon[clipPolygon.length - 1];
  for (const j in clipPolygon) {
    cp2 = clipPolygon[j];
    const inputList = outputList;
    outputList = [];
    s = inputList[inputList.length - 1]; //last on the input list
    for (const i in inputList) {
      e = inputList[i];
      if (inside(e)) {
        if (!inside(s)) {
          outputList.push(intersection());
        }
        outputList.push(e);
      } else if (inside(s)) {
        outputList.push(intersection());
      }
      s = e;
    }
    cp1 = cp2;
  }
  const clipped = outputList.length !== 0;
  return {clippedPolygon: outputList, clipped};
}
