import { Shape } from './Shape.js'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './Config.js'

const HEIGHT = 80

export class SpeedChangeEffect extends Shape {
  /** @type {number} */
  #currentSpeed
  /** @type {number} */
  #time
  /** @type {number} */
  #alpha
  /** @type {number} */
  #height
  /** @type {boolean} */
  #active
  get active () { return this.#active }

  /**
   * @param speed {number}
   * @param time {number}
   */
  constructor (speed, time) {
    super()
    this.#currentSpeed = speed
    this.#time = time
    this.#alpha = 0.0
    this.#height = 0.0
    this.#active = true
  }

  /**
   * 0 - 200：渐渐出现
   * + alpha: 0 -> 1 {alpha = Math.sqrt((Math.min(time, 200) / 200)}
   * + height: 0 -> HEIGHT {height = Math.sqrt(Math.min(time, 200) / 200) * HEIGHT}
   * 200 - 2800： 保持
   * 2800 - 3000：渐渐消失
   * + alpha: 1 -> 0 {alpha = 1 - (time - 2800) / 200}
   * + height: HEIGHT -> 0 {height = HEIGHT * (1 - (time - 2800) / 200)}
   */
  update () {
    const now = performance.now()
    const time = now - this.#time

    if (time <= 200.0) {
      const bit = Math.sqrt(time / 200.0)
      this.#alpha = bit
      this.#height = bit * HEIGHT
    } else if (time <= 2800.0) {
      // keep
    } else if (time <= 3000.0) {
      const bit = 1 - (time - 2800) / 200.0
      this.#alpha = bit
      this.#height = HEIGHT * bit
    } else {
      this.#alpha = 0
      this.#height = 0
      this.#active = false
    }
  }

  render (context) {
    const x = 0
    const y = (CANVAS_HEIGHT - this.#height) / 2.0
    context.fillStyle = 'rgba(16,16,16,0.8)'
    context.fillRect(x, y, CANVAS_WIDTH, this.#height)

    const text = `已将下落速度调整为 ${this.#currentSpeed}`
    context.font = 'normal 36px Ariel'
    context.textAlign = 'left'
    context.textBaseline = 'middle'
    context.fillStyle = '#ffffff'

    const textMetrics = context.measureText(text)
    const textX = (CANVAS_WIDTH - textMetrics.width) / 2.0
    const textY = CANVAS_HEIGHT / 2.0
    context.fillText(text, textX, textY)
    context.restore()
  }
}
