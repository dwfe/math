import {TPoint, TVector} from './contract'
import {Point} from './point-2d'

class V {

  static of = (v: TVector = [[0, 0], [1, 1]]): V => new V(v)

  constructor(public readonly v: TVector) {
  }

  middle = (): TPoint => V.middle(this.v)
  len = (): number => V.len(this.v)


  static middle = (v: TVector): TPoint => Point.middle(v[0], v[1]);
  static len = (v: TVector): number => Point.distance(v[0], v[1])

}

export {
  V as Vector
}
