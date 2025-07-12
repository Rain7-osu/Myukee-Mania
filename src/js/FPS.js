import { Shape } from './Shape'
import { CANVAS_HEIGHT } from './Config'

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
    context.font = 'bold 48px Arial'
    context.fillStyle = '#f00'
    const x = CANVAS_HEIGHT - 200
    const y = 200
    context.fillText(`FPS:${this.#value}`, x, y, 200)
  }
}
