import { Shape } from './Shape'
import { Skin } from './Skin'

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
    const { right, bottom, fillStyle, font } = Skin.config.fps
    const text = `FPS:${this.#value}`
    context.font = font
    context.fillStyle = fillStyle
    const textMetrics = context.measureText(text)
    context.fillText(text, right - textMetrics.width, bottom, textMetrics.width)
  }
}
