import { Shape } from './Shape.js'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './Config.js'

export class FPS extends Shape {
  /** @type {number} */
  #value

  /**
   * @param value {number}
   */
  constructor (value) {
    super()
    this.#value = value
  }

  render (context) {
    const text = `FPS:${this.#value}`
    context.font = 'bold 24px 微软雅黑'
    context.fillStyle = '#f00'
    const textMetrics = context.measureText(text)

    const x = CANVAS_WIDTH - textMetrics.width - 10
    const y = CANVAS_HEIGHT - 24
    context.fillText(text, x, y, textMetrics.width, 24)
  }
}
