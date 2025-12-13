import { Shape } from './Shape'
import { CANVAS } from './Config'

const HEIGHT = 80

export class ValueChangeEffect extends Shape {
  /** @type {string} */
  #value
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
   * @param value {string}
   * @param time {number}
   */
  constructor (value, time) {
    super()
    this.#value = value
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
   * @param now {number}
   */
  update (now) {
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
    const y = (CANVAS.HEIGHT - this.#height) / 2.0
    context.fillStyle = 'rgba(18, 18, 18, 0.5)'
    context.fillRect(x, y, CANVAS.WIDTH, this.#height)

    const text = this.#value
    this.drawText({
      context,
      text,
      font: '36px 微软雅黑',
      color: '#fff',
      x,
      y,
      width: CANVAS.WIDTH,
      height: this.#height,
      stroke: false,
    })
    context.restore()
  }
}
