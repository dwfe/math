import {IVector} from './contract'
import {Tuple2} from '../contract'
import {Point} from './point-2d'

class V {

  static of = (v: IVector = [[0, 0], [1, 1]]): V => new V(v)

  constructor(public readonly v: IVector) {
  }

  middle = (): Tuple2 => V.middle(this.v)
  len = (): number => V.len(this.v)


  static middle = (v: IVector): Tuple2 => Point.middle(v[0], v[1]);
  static len = (v: IVector): number => Point.distance(v[0], v[1])

}

export {
  V as Vector
}
