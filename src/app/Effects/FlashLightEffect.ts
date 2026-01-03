import { RenderObject } from '../Core/RenderObject';
import { CANVAS } from '../Configs/Config';
import type { TransitionType } from '../Core/ActiveEffect';

export class FlashLightEffect extends RenderObject {
  private _value: number = 0

  /**
   * [x, y, w, h]
   */
  private _area: number[]

  constructor(area?: number[]) {
    super()
    this._area = area || [0, 0, CANVAS.WIDTH, CANVAS.HEIGHT]
  }

  set area(area: number[]) {
    this._area = area
  }

  /**
   * @param maxValue max Alpha of flash, max=100, min=0
   * @param duration flash duration
   * @param mode transition mode
   */
  async flash(maxValue: number = 5, duration: number = 60, mode: TransitionType = 'easeOut'): Promise<void> {
    const target = Math.max(Math.min(maxValue, 100), 0)
    this.cancelTransitions()
    await this.createTransition<number>(this._value, target, duration, mode, v => this._value = v)
    await this.createTransition<number>(this._value, 0, duration, mode, v => this._value = v)
  }

  reset() {
    this._value = 0
  }

  render(context: CanvasRenderingContext2D) {
    if (this._value <= 0) {
      return
    }
    const alpha = this._value
    context.fillStyle = `rgba(255, 255, 255, ${alpha / 100})`
    context.fillRect(...this._area)
  }
}
