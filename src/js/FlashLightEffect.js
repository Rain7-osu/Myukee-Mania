import { Shape } from './Shape'
import { CANVAS } from './Config'

export class FlashLightEffect extends Shape {
  #value = 0

  /**
   * @param maxValue {number}
   * @param duration {number}
   * @return {Promise<unknown>}
   */
  async flash(maxValue = 5, duration = 60) {
    const target = Math.min(maxValue, 100)
    this.cancelTransitions()
    await this.createTransitionAsync(this.#value, target, duration, 'easeOut', (v) => this.#value = v)
    await this.createTransitionAsync(this.#value, 0, duration, 'easeOut', (v) => this.#value = v)
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
    context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}
