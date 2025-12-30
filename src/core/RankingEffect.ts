import { RenderObject } from './RenderObject'
import { FileManager } from './FileManager'
import { CANVAS } from './Config'
import { Skin } from './Skin'

interface RankingEffectStyle {
  top: number;
  right: number;
  scale: number;
}

export enum RankType {
  SS = 0,
  S = 1,
  A = 2,
  B = 3,
  C = 4,
  D = 5,
}

const SmallResource: Promise<HTMLImageElement>[] = [
  FileManager.loadImage('./skin/ranking-X-small.png'),
  FileManager.loadImage('./skin/ranking-S-small.png'),
  FileManager.loadImage('./skin/ranking-A-small.png'),
  FileManager.loadImage('./skin/ranking-B-small.png'),
  FileManager.loadImage('./skin/ranking-C-small.png'),
  FileManager.loadImage('./skin/ranking-D-small.png'),
]

const LargeResource: Promise<HTMLImageElement>[] = [
  FileManager.loadImage('./skin/ranking-X.png'),
  FileManager.loadImage('./skin/ranking-S.png'),
  FileManager.loadImage('./skin/ranking-A.png'),
  FileManager.loadImage('./skin/ranking-B.png'),
  FileManager.loadImage('./skin/ranking-C.png'),
  FileManager.loadImage('./skin/ranking-D.png'),
]

export class RankingEffect extends RenderObject {
  #size: 'small' | 'large' = 'small'

  #style: RankingEffectStyle

  #renderScale: number = 1.44

  #type: RankType

  static calcRankingType(acc: number): RankType {
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

  constructor(acc: number, size: 'small' | 'large' = 'small', style?: RankingEffectStyle) {
    super()
    this.#size = size
    this.#style = style || Skin.config.stage.ranking
    this.#type = RankingEffect.calcRankingType(acc)
    this.#renderScale = this.#style.scale
  }

  set type(type: RankType) {
    this.#type = type
  }

  async setAccuracy(acc: number): Promise<void> {
    this.#type = RankingEffect.calcRankingType(acc)
    const targetScale = this.#size === 'large' ? Skin.config.rankingBoard.ranking.scale : Skin.config.stage.ranking.scale
    const startScale = Skin.config.rankingBoard.ranking.startScale
    this.cancelTransitions()
    await this.createTransition(startScale, targetScale, 2000, 'easeOut', value => {
      this.#renderScale = value
    })
  }

  render(context: CanvasRenderingContext2D): void {
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
