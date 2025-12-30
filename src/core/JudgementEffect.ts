import { RenderObject } from './RenderObject'
import { Judgement, JudgementType } from './Judgement'
import { FileManager } from './FileManager'
import { Skin } from './Skin'
import { dev } from './dev'

const loadImage = FileManager.loadImage

interface JudgementAsset {
  image: HTMLImageElement
  image2?: HTMLImageElement
  priority: number
  width?: number
  height?: number
}

export const JudgementAssets: Record<JudgementType, JudgementAsset> = {
  [JudgementType.PERFECT]: {
    image: loadImage('./skin/mania-hit300g-0.png'),
    image2: loadImage('./skin/mania-hit300g-1.png'),
    priority: 0,
  },
  [JudgementType.GREAT]: {
    image: loadImage('./skin/mania-hit300.png'),
    priority: 1,
  },
  [JudgementType.GOOD]: {
    image: loadImage('./skin/mania-hit200.png'),
    priority: 2,
  },
  [JudgementType.OK]: {
    image: loadImage('./skin/mania-hit100.png'),
    priority: 3,
  },
  [JudgementType.MEH]: {
    image: loadImage('./skin/mania-hit50.png'),
    priority: 4,
  },
  [JudgementType.MISS]: {
    image: loadImage('./skin/mania-hit0.png'),
    priority: 5,
  },
}

export class JudgementEffect extends RenderObject {
  private _judgement: Judgement

  private _scale: number

  private _alpha: number

  private _phase: 'enlarging' | 'shirking'

  private _maxScale: number = Skin.config.stage.judgement.effect.defaultMaxScale

  private _active: boolean

  get active(): boolean {
    return this._active
  }

  constructor(judgement: Judgement) {
    super()
    this._judgement = judgement
    this._active = true
    const { initAlpha: INIT_ALPHA, initScale: INIT_SCALE } = Skin.config.stage.judgement.effect
    this._scale = INIT_SCALE
    this._alpha = INIT_ALPHA
  }

  render(context: CanvasRenderingContext2D): void {
    const config = JudgementAssets[this._judgement.type]
    const { judgement: { top }, columnCenter } = Skin.config.stage

    const image = this._phase === 'enlarging' ? config.image : config.image2 || config.image

    let width = image.width * this._scale
    let height = image.height * this._scale

    if (config.width && config.height && (width >= config.width * this._maxScale || height >= config.height * this._maxScale)) {
      dev.warn(`JudgementEffect: scale is too large, resetting to max scale, current is ${this._scale}`)
      width = config.width * this._maxScale
      height = config.height * this._maxScale
    }

    const x = columnCenter - width / 2
    const y = top - height / 2

    context.save()
    context.globalAlpha = this._alpha
    context.drawImage(image, x, y, width, height)
    context.restore()
  }

  update(currentTiming: number, nextEffect: JudgementEffect | null): void {
    const elapsedTime = currentTiming - this._judgement.judgeTiming

    // 如果有下一个 effect，则判断下一个 effect 是不是马上要展示了
    // 如果是的话，则直接渲染下一个 effect，当前 effect 设为不活跃
    if (nextEffect) {
      const nextEffectTiming = nextEffect._judgement.judgeTiming
      const diffTime = currentTiming - nextEffectTiming
      if (elapsedTime >= diffTime) {
        this._active = false
        return
      }
    }

    const {
      growTime: GROW_TIME,
      initAlpha: INIT_ALPHA,
      backTime: BACK_TIME,
      fadeTime: FADE_TIME,
    } = Skin.config.stage.judgement.effect

    if (elapsedTime < GROW_TIME) {
      // 放大动画
      const currentPercent = (elapsedTime / GROW_TIME) ** 2
      this._scale = 1 + currentPercent * (this._maxScale - 1)
      this._alpha = INIT_ALPHA
      this._phase = 'enlarging'
    } else if (elapsedTime < BACK_TIME) {
      this._phase = 'shirking'
      this._scale = this._maxScale - ((elapsedTime - GROW_TIME) / (BACK_TIME - GROW_TIME)) ** 2 * (this._maxScale - 1)
    } else if (elapsedTime < FADE_TIME) {
      this._alpha = 1 - (elapsedTime - BACK_TIME) / (FADE_TIME - BACK_TIME)
    } else {
      this._active = false
    }
  }
}
