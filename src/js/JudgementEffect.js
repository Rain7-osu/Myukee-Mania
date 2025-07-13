import { Shape } from './Shape'
import { JudgementType } from './Judgement'
import { CANVAS_HEIGHT, NOTE_WIDTH } from './Config'
import { FileManager } from './FileManager'
import { easeOutQuad } from './utils'

const loadImage = FileManager.loadImage

const JudgementConfig = {
  [JudgementType.PERFECT]: {
    image: loadImage('./skin/mania-hit300g-0.png'),
    image2: loadImage('./skin/mania-hit300g-1.png'),
    priority: 0,
    width: 188,
    height: 91
  },
  [JudgementType.GREAT]: {
    image: loadImage('./skin/mania-hit300.png'),
    priority: 1,
    width: 226,
    height: 131
  },
  [JudgementType.GOOD]: {
    image: loadImage('./skin/mania-hit200.png'),
    priority: 2,
    width: 207,
    height: 120
  },
  [JudgementType.OK]: {
    image: loadImage('./skin/mania-hit100.png'),
    priority: 3,
    width: 182,
    height: 116
  },
  [JudgementType.MEH]: {
    image: loadImage('./skin/mania-hit50.png'),
    priority: 4,
    width: 142,
    height: 113
  },
  [JudgementType.MISS]: {
    image: loadImage('./skin/mania-hit0.png'),
    priority: 5,
    width: 181,
    height: 99
  },
}

const DEFAULT_MAX_SCALE = 1.25
const INIT_SCALE = 1
const INIT_ALPHA = 1
const GROW_TIME = 100
const BACK_TIME = 200
const FADE_TIME = 1000
const FADE_SCALE = 1

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
  #maxScale = DEFAULT_MAX_SCALE

  /**
   * @type {boolean}
   */
  #active

  get active() {
    return this.#active
  }

  /**
   * @param {import('./Judgement').Judgement} judgement
   */
  constructor (judgement) {
    super()
    this.#judgement = judgement
    this.#active = true
    this.#scale = INIT_SCALE
    this.#alpha = INIT_ALPHA
  }

  render (context) {
    const config = JudgementConfig[this.#judgement.type]

    const width = config.width * this.#scale
    const height = config.height * this.#scale
    const x = (4 * NOTE_WIDTH - width) / 2
    const y = CANVAS_HEIGHT / 3 - height / 2

    const image = this.#phase === 'enlarging' ? config.image : config.image2 || config.image

    context.save()
    context.globalAlpha = this.#alpha
    context.drawImage(image, x, y, width, height)
    context.restore()
  }

  /**
   * @param {number} currentTiming
   * @param {JudgementEffect | null} nextEffect
   */
  update(currentTiming, nextEffect) {
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
