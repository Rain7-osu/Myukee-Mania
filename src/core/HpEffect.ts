import { RenderObject } from './RenderObject'
import { HpManager } from './HpManager'
import { CANVAS, py, vh } from './Config'

const BG_COLOR = 'rgb(66, 74, 103)'
const BAR_COLOR = 'rgb(255,255,255)'
const INNER_COLOR = 'rgb(0, 0, 0)'
const TOP = 0.4
const HEIGHT_VH = 1 - TOP
const WIDTH = 30
const INNER_WIDTH = 10
const INNER_BOTTOM = 20

export class HpEffect extends RenderObject {
  private _value: number = 0
  private _left: number = 0

  init(left: number): void {
    this._left = left
  }

  async update(value: number): Promise<void> {
    this.cancelTransitions()
    await this.createTransition(this._value, value, 300, 'easeOut', value => this._value = value)
  }

  async start(): Promise<void> {
    this.cancelTransitions()
    await this.createTransition(0, HpManager.MAX, 600, 'easeOut', value => this._value = value)
  }

  reset(): void {
    this.cancelTransitions()
    this._value = HpManager.MAX
  }

  render(context: CanvasRenderingContext2D): void {
    const height = vh(HEIGHT_VH)
    const x = this._left
    const y = vh(TOP)

    // fill border
    context.save()
    context.beginPath()
    context.moveTo(x, y)
    context.bezierCurveTo(x, y + py(10), x + py(WIDTH), y + py(15), x + py(WIDTH), y + py(35))
    context.lineTo(x + py(WIDTH), CANVAS.HEIGHT)
    context.lineTo(x, CANVAS.HEIGHT)
    context.closePath()
    context.fillStyle = BG_COLOR
    context.shadowColor = 'rgb(0, 0, 0)'
    context.shadowBlur = py(12)
    context.fill()
    context.restore()

    context.save()
    context.shadowColor = BAR_COLOR
    context.shadowBlur = 5
    context.lineWidth = py(INNER_WIDTH)
    context.lineCap = 'round'

    // fill hp inner
    context.strokeStyle = INNER_COLOR
    context.beginPath()
    context.moveTo(x + py(WIDTH) / 2, y + py(40))
    context.lineTo(x + py(WIDTH) / 2, CANVAS.HEIGHT - py(INNER_BOTTOM))
    context.stroke()

    // fill hp bar
    context.strokeStyle = BAR_COLOR
    context.beginPath()
    const y1 = Math.round(y + py(40) + (HpManager.MAX - this._value) / HpManager.MAX * (height - py(INNER_BOTTOM)))
    if (y1 < CANVAS.HEIGHT - py(INNER_BOTTOM)) {
      context.moveTo(x + py(WIDTH) / 2, y1)
      context.lineTo(x + py(WIDTH) / 2, CANVAS.HEIGHT - py(INNER_BOTTOM))
      context.stroke()
    }
    context.restore()
  }
}
