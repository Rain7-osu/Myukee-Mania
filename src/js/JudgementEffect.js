import { Shape } from './Shape.js'
import { JudgementType } from './Judgement.js'
import { FileManager } from './FileManager.js'
import { Skin } from './Skin'
import { warn } from './dev'

const loadImage = FileManager.loadImage

const JudgementConfig = {
  [JudgementType.PERFECT]: {
    image: loadImage('./skin/mania-hit300g-0.png'),
    image2: loadImage('./skin/mania-hit300g-1.png'),
    priority: 0,
    width: 188,
    height: 91,
  },
  [JudgementType.GREAT]: {
    image: loadImage('./skin/mania-hit300.png'),
    priority: 1,
    width: 226,
    height: 131,
  },
  [JudgementType.GOOD]: {
    image: loadImage('./skin/mania-hit200.png'),
    priority: 2,
    width: 207,
    height: 120,
  },
  [JudgementType.OK]: {
    image: loadImage('./skin/mania-hit100.png'),
    priority: 3,
    width: 182,
    height: 116,
  },
  [JudgementType.MEH]: {
    image: loadImage('./skin/mania-hit50.png'),
    priority: 4,
    width: 142,
    height: 113,
  },
  [JudgementType.MISS]: {
    image: loadImage('./skin/mania-hit0.png'),
    priority: 5,
    width: 270.5,
    height: 148.5,
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
    const config = JudgementConfig[this.#judgement.type]
    const { judgement: { top }, note: { width: NOTE_WIDTH }, columnStart } = Skin.config.stage

    let width = config.width * this.#scale
    let height = config.height * this.#scale
    const x = (4 * NOTE_WIDTH - width) / 2 + columnStart
    const y = top - height / 2

    if (width >= config.width * this.#maxScale || height >= config.height * this.#maxScale) {
      warn(`JudgementEffect: scale is too large, resetting to max scale, current is ${this.#scale}`)
      width = config.width * this.#maxScale
      height = config.height * this.#maxScale
    }

    const image = this.#phase === 'enlarging' ? config.image : config.image2 || config.image

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
