import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

export class FlashLightEffect extends RenderObject {
  #value: number = 0

  /**
   * [x, y, w, h]
   */
  #area: number[]

  constructor (area?: number[]) {
    super()
    this.#area = area || [0, 0, CANVAS.WIDTH, CANVAS.HEIGHT]
  }

  set area (area: number[]) {
    this.#area = area
  }

  /**
   * @param maxValue max Alpha of flash, max=100, min=0
   * @param duration flash duration
   * @param mode transition mode
   */
  async flash (maxValue: number = 5, duration: number = 60, mode: string = 'easeOut'): Promise<void> {
    const target = Math.max(Math.min(maxValue, 100), 0)
    this.cancelTransitions()
    await this.createTransition(this.#value, target, duration, mode, (v) => this.#value = v)
    await this.createTransition(this.#value, 0, duration, mode, (v) => this.#value = v)
  }

  reset () {
    this.#value = 0
  }

  render (context: CanvasRenderingContext2D) {
    if (this.#value <= 0) {
      return
    }
    const alpha = this.#value
    context.fillStyle = `rgba(255, 255, 255, ${alpha / 100})`
    context.fillRect(...this.#area)
  }
}
