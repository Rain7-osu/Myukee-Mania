import { Shape } from './Shape'
import { Skin } from './Skin'
import { CANVAS } from './Config'

export class FPS extends Shape {
  /** @type {string} */
  #value

  constructor () {
    super()
  }

  /**
   * 帧数记录
   * @type {number[]}
   */
  #frameTimeList = []

  /**
   * @param now {number}
   */
  update (now) {
    this.#frameTimeList.push(now)
    const first = this.#frameTimeList[0]
    const last = this.#frameTimeList[this.#frameTimeList.length - 1]
    const fpsValue = (1000.0 * this.#frameTimeList.length / (last - first)).toFixed(0)

    if (this.#frameTimeList.length >= 200) {
      this.#frameTimeList.shift()
    }

    this.#value = fpsValue
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
      radius,
      fill: true,
      stroke: false,
    })

    const text = `${this.#value}fps`
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
