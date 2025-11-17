import { Shape } from './Shape'
import { FileManager } from './FileManager'
import { CANVAS } from './Config'
import { Skin } from './Skin'

/**
 * @type {{SS: number, A: number, B: number, S: number, C: number, D: number}}
 */
const Type = {
  SS: 0,
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
}

/**
 * @type {Array<HTMLImageElement, number, number>}
 */
const TypeResource = [
  [FileManager.loadImage('./skin/ranking-X-small.png'), 34, 40],
  [FileManager.loadImage('./skin/ranking-S-small.png'), 31, 38],
  [FileManager.loadImage('./skin/ranking-A-small.png'), 34, 38],
  [FileManager.loadImage('./skin/ranking-B-small.png'), 33, 38],
  [FileManager.loadImage('./skin/ranking-C-small.png'), 30, 38],
  [FileManager.loadImage('./skin/ranking-D-small.png'), 33, 38],
]

export class RankEffect extends Shape {
  /**
   * @param acc {number}
   */
  constructor (acc) {
    super()

    let type
    if (acc >= 1.0) {
      type = Type.SS
    } else if (acc >= 0.95) {
      type = Type.S
    } else if (acc >= 0.90) {
      type = Type.A
    } else if (acc >= 0.80) {
      type = Type.B
    } else if (acc >= 0.70) {
      type = Type.C
    } else {
      type = Type.D
    }
    this.#type = type
  }

  /**
   * @type {number}
   */
  #type

  /**
   * @param type {number}
   */
  set type (type) {
    this.#type = type
  }

  render (context) {
    const [img, width, height] = TypeResource[this.#type]
    const { right, top, scale } = Skin.config.stage.ranking
    const left = CANVAS.WIDTH - right - width
    context.drawImage(img, left, top, width * scale, height * scale)
  }
}
