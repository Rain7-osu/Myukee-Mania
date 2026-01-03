import { RenderObject } from '../Core/RenderObject';
import { CANVAS } from '../Configs/Config';

const HEIGHT = 80

export class ValueChangeEffect extends RenderObject {
  private readonly _value: string
  private readonly _time: number
  private _alpha: number
  private _height: number
  private _active: boolean
  get active (): boolean { return this._active }

  constructor (value: string, time: number) {
    super()
    this._value = value
    this._time = time
    this._alpha = 0.0
    this._height = 0.0
    this._active = true
  }

  update (now: number): void {
    const time = now - this._time

    if (time <= 200.0) {
      const bit = Math.sqrt(time / 200.0)
      this._alpha = bit
      this._height = bit * HEIGHT
    } else if (time <= 2800.0) {
      // keep
    } else if (time <= 3000.0) {
      const bit = 1 - (time - 2800) / 200.0
      this._alpha = bit
      this._height = HEIGHT * bit
    } else {
      this._alpha = 0
      this._height = 0
      this._active = false
    }
  }

  render (context: CanvasRenderingContext2D): void {
    const x = 0
    const y = (CANVAS.HEIGHT - this._height) / 2.0
    context.fillStyle = 'rgba(18, 18, 18, 0.5)'
    context.fillRect(x, y, CANVAS.WIDTH, this._height)

    const text = this._value
    RenderObject.drawText({
      context,
      text,
      font: '36px 微软雅黑',
      color: '#fff',
      x,
      y,
      width: CANVAS.WIDTH,
      height: this._height,
      stroke: false,
    })
    context.restore()
  }
}
