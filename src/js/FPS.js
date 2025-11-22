import { Shape } from './Shape'
import { Skin } from './Skin'
import { CANVAS } from './Config'

export class FPS extends Shape {
  /** @type {string} */
  #value

  /**
   * @param value {string}
   */
  constructor (value) {
    super()
    this.#value = value
  }

  render (context) {
    const { right, bottom, fillStyle, font, fontSize } = Skin.config.fps
    const text = `FPS:${this.#value}`
    context.font = font
    context.fillStyle = fillStyle
    const textMetrics = context.measureText(text)
    const width = textMetrics.width
    context.fillText(text, CANVAS.WIDTH - right, CANVAS.HEIGHT -bottom, width)
  }
}
