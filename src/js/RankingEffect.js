import { Shape } from './Shape'
import { FileManager } from './FileManager'
import { CANVAS } from './Config'
import { Skin } from './Skin'

/**
 * @typedef {{
 *   top: number;
 *   right: number;
 *   scale: number;
 * }} RankingEffectStyle
 */

/**
 * @readonly
 * @enum {number}
 */
export const RankType = {
  SS: 0,
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
}

/**
 * @type {HTMLImageElement[]}
 */
const SmallResource = [
  FileManager.loadImage('./skin/ranking-X-small.png'),
  FileManager.loadImage('./skin/ranking-S-small.png'),
  FileManager.loadImage('./skin/ranking-A-small.png'),
  FileManager.loadImage('./skin/ranking-B-small.png'),
  FileManager.loadImage('./skin/ranking-C-small.png'),
  FileManager.loadImage('./skin/ranking-D-small.png'),
]

/**
 * @type {HTMLImageElement[]}
 */
const LargeResource = [
  FileManager.loadImage('./skin/ranking-X.png'),
  FileManager.loadImage('./skin/ranking-S.png'),
  FileManager.loadImage('./skin/ranking-A.png'),
  FileManager.loadImage('./skin/ranking-B.png'),
  FileManager.loadImage('./skin/ranking-C.png'),
  FileManager.loadImage('./skin/ranking-D.png'),
]

export class RankingEffect extends Shape {
  /**
   * @type {'small' | 'large'}
   */
  #size = 'small'

  /**
   * @type {RankingEffectStyle}
   */
  #style

  #renderScale = 1

  /**
   * @type {RankType}
   */
  #type

  /**
   * @param acc {number}
   */
  static calcRankingType (acc) {
    let type
    if (acc >= 1.0) {
      type = RankType.SS
    } else if (acc >= 0.95) {
      type = RankType.S
    } else if (acc >= 0.90) {
      type = RankType.A
    } else if (acc >= 0.80) {
      type = RankType.B
    } else if (acc >= 0.70) {
      type = RankType.C
    } else {
      type = RankType.D
    }
    return type
  }

  /**
   * @param acc {number}
   * @param size {('small' | 'large')?}
   * @param style {RankingEffectStyle?}
   */
  constructor (acc, size = 'small', style) {
    super()
    this.#size = size
    this.#style = style || Skin.config.stage.ranking

    this.#type = RankingEffect.calcRankingType(acc)
  }

  /**
   * @param type {RankType}
   */
  set type (type) {
    this.#type = type
  }

  /**
   * @param acc {number}
   */
  setAccuracy (acc) {
    this.#type = RankingEffect.calcRankingType(acc)
    this.cancelTransitions()
    const targetScale = this.#size === 'large' ? Skin.config.rankingBoard.ranking.scale : Skin.config.stage.ranking.scale
    const startScale = Skin.config.rankingBoard.ranking.startScale
    this.createTransition(startScale, targetScale, 2000, 'easeOut', (value) => {
      this.#renderScale = value
    })
  }

  render (context) {
    const resources = this.#size === 'large' ? LargeResource : SmallResource
    const img = resources[this.#type]
    const { width, height } = img
    const { right, top, scale } = this.#style
    const bw = width * scale
    const bh = height * scale
    const left = CANVAS.WIDTH - right - bw
    const dw = width * this.#renderScale
    const dh = height * this.#renderScale
    const x = (bw - dw) / 2 + left
    const y = (bh - dh) / 2 + top
    context.drawImage(img, x, y, dw, dh)
  }
}
