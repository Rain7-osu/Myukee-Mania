import { Shape } from './Shape.js'
import { JudgementType } from './Judgement.js'
import { CANVAS } from './Config.js'

const MAX_REMAIN_TIME = 6000.0
const HEIGHT = 32
const LINE_WIDTH = 4
const BLUE_COLOR = (a) => `rgba(46, 187, 230, ${a})`
const GREEN_COLOR = (a) => `rgba(83, 232, 10, ${a})`
const YELLOW_COLOR = (a) => `rgba(222, 173, 80, ${a})`

/**
 * 打击偏差
 */
export class JudgementDeviation extends Shape {
  /** @type {number} */
  #judgeTiming = 0
  /** @type {number} */
  #deviation = 0
  /** @type {boolean} */
  #active
  get active () { return this.#active }

  /** @type {(a: number) => string} */
  #color
  /** @type {number} */
  #alpha
  /** @type {number} */
  #scale

  /**
   * @param judgeTiming {number} 判定时间
   * @param deviation {number} 打击过早为负数，否则为整数
   * @param type {import('./Judgement').JudgementType}
   * @param scale {number}
   */
  constructor (judgeTiming, deviation, type, scale = 1.5) {
    super()
    this.#active = true
    this.#judgeTiming = judgeTiming
    this.#deviation = deviation
    this.#scale = scale
    this.#alpha = 255
    if (type >= JudgementType.GREAT) {
      this.#color = BLUE_COLOR
    } else if (type >= JudgementType.OK) {
      this.#color = GREEN_COLOR
    } else {
      this.#color = YELLOW_COLOR
    }
  }

  update (currentTiming) {
    const renderedTime = currentTiming - this.#judgeTiming

    if (renderedTime > MAX_REMAIN_TIME) {
      this.#active = false
    }
    if (renderedTime <= MAX_REMAIN_TIME / 2) {
      this.#alpha = 255 * 0.8
    } else if (renderedTime < MAX_REMAIN_TIME / 3 * 2) {
      this.#alpha = 0.6 * 255
    } else if (renderedTime < MAX_REMAIN_TIME / 6 * 5) {
      this.#alpha = 0.2 * 255
    } else {
      this.#alpha = 0
    }
  }

  render (context) {
    context.fillStyle = this.#color(this.#alpha)
    const x = CANVAS.WIDTH / 2.0 + this.#deviation * this.#scale
    const y = CANVAS.HEIGHT - HEIGHT * this.#scale
    context.fillRect(x, y, LINE_WIDTH, HEIGHT * this.#scale)
  }
}
