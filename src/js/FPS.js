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
    const { right, bottom, color, font, fontSize, background, fontWeight, height, radius, width } = Skin.config.fps
    const x = CANVAS.WIDTH - right - width
    const y = CANVAS.HEIGHT - height - bottom

    context.fillStyle = background
    this.roundRect({
      context,
      x,
      y,
      width,
      height,
      radius: height / 2,
      fill: true,
      stroke: false,
    })

    const text = `${this.#value}FPS`
    this.drawText({
      context,
      x,
      y: y + 2,
      width,
      height,
      font: `${fontWeight} ${fontSize}px ${font}`,
      color,
      text,
    })
  }
}
