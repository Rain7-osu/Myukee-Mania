import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

export class FlashLightEffect extends RenderObject {
  #value = 0

  /**
   * @type number[] [x, y, w, h]
   */
  #area

  /**
   * @param area {number[]?}
   */
  constructor (area) {
    super()
    this.#area = area || [0, 0, CANVAS.WIDTH, CANVAS.HEIGHT]
  }

  /**
   * @param {number[]} area
   */
  set area (area) {
    this.#area = area
  }

  /**
   * @param maxValue {number} max Alpha of flash, max=100, min=0
   * @param duration {number} flash duration
   * @param mode {TransitionType}
   * @return {Promise<unknown>}
   */
  async flash (maxValue = 5, duration = 60, mode = 'easeOut') {
    const target = Math.max(Math.min(maxValue, 100), 0)
    this.cancelTransitions()
    await this.createTransition(this.#value, target, duration, mode, (v) => this.#value = v)
    await this.createTransition(this.#value, 0, duration, mode, (v) => this.#value = v)
  }

  reset () {
    this.#value = 0
  }

  render (context) {
    if (this.#value <= 0) {
      return
    }
    const alpha = this.#value
    context.fillStyle = `rgba(255, 255, 255, ${alpha / 100})`
    context.fillRect(...this.#area)
  }
}
