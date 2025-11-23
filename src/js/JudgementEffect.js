import { Shape } from './Shape'
import { JudgementType } from './Judgement'
import { FileManager } from './FileManager'
import { Skin } from './Skin'
import { warn } from './dev'

const loadImage = FileManager.loadImage

export const JudgementAssets = {
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

export class JudgementEffect extends Shape {
  /** @type {import('./Judgement').Judgement} */
  #judgement

  /** @type {number} */
  #scale

  /** @type {number} */
  #alpha

  /** @type {'enlarging' | 'shirking'} */
  #phase

  /** @type {number} */
  #maxScale = Skin.config.stage.judgement.effect.defaultMaxScale

  /**
   * @type {boolean}
   */
  #active

  get active () {
    return this.#active
  }

  /**
   * @param {import('./Judgement').Judgement} judgement
   */
  constructor (judgement) {
    super()
    this.#judgement = judgement
    this.#active = true
    const { initAlpha: INIT_ALPHA, initScale: INIT_SCALE } = Skin.config.stage.judgement.effect
    this.#scale = INIT_SCALE
    this.#alpha = INIT_ALPHA
  }

  render (context) {
    const config = JudgementAssets[this.#judgement.type]
    const { judgement: { top }, columnCenter } = Skin.config.stage

    const image = this.#phase === 'enlarging' ? config.image : config.image2 || config.image

    let width = image.width * this.#scale
    let height = image.height * this.#scale

    if (width >= config.width * this.#maxScale || height >= config.height * this.#maxScale) {
      warn(`JudgementEffect: scale is too large, resetting to max scale, current is ${this.#scale}`)
      width = config.width * this.#maxScale
      height = config.height * this.#maxScale
    }

    const x = columnCenter - width / 2
    const y = top - height / 2

    context.save()
    context.globalAlpha = this.#alpha
    context.drawImage(image, x, y, width, height)
    context.restore()
  }

  /**
   * @param currentTiming
   * @param {JudgementEffect | null} nextEffect
   */
  update (currentTiming, nextEffect) {
    const elapsedTime = currentTiming - this.#judgement.judgeTiming

    // 如果有下一个 effect，则判断下一个 effect 是不是马上要展示了
    // 如果是的话，则直接渲染下一个 effect，当前 effect 设为不活跃
    if (nextEffect) {
      const nextEffectTiming = nextEffect.#judgement.judgeTiming
      const diffTime = currentTiming - nextEffectTiming
      if (elapsedTime >= diffTime) {
        this.#active = false
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
      this.#scale = 1 + currentPercent * (this.#maxScale - 1)
      this.#alpha = INIT_ALPHA
      this.#phase = 'enlarging'
    } else if (elapsedTime < BACK_TIME) {
      this.#phase = 'shirking'
      this.#scale = this.#maxScale - ((elapsedTime - GROW_TIME) / (BACK_TIME - GROW_TIME)) ** 2 * (this.#maxScale - 1)
    } else if (elapsedTime < FADE_TIME) {
      this.#alpha = 1 - (elapsedTime - BACK_TIME) / (FADE_TIME - BACK_TIME)
    } else {
      this.#active = false
    }
  }
}
