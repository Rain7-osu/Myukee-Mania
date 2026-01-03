import { RenderObject } from '../Core/RenderObject';
import { JudgementType } from '../Enums/JudgementType';
import { CANVAS, py } from '../Configs/Config';

const MAX_REMAIN_TIME = 6000.0

const BLUE_COLOR = a => `rgba(46, 187, 230, ${a})`
const GREEN_COLOR = a => `rgba(83, 232, 10, ${a})`
const YELLOW_COLOR = a => `rgba(222, 173, 80, ${a})`

/**
 * 打击偏差
 */
export class JudgementDeviationPointEffect extends RenderObject {
  private readonly _judgeTiming: number = 0
  private readonly _deviation: number = 0
  private _active: boolean
  get active(): boolean { return this._active }

  private readonly _color: (a: number) => string
  private _alpha: number
  private readonly _scale: number

  constructor(judgeTiming: number, deviation: number, type: JudgementType, scale: number = 1.5) {
    super()
    this._active = true
    this._judgeTiming = judgeTiming
    this._deviation = deviation
    this._scale = scale
    this._alpha = 255
    if (type >= JudgementType.GREAT) {
      this._color = BLUE_COLOR
    } else if (type >= JudgementType.OK) {
      this._color = GREEN_COLOR
    } else {
      this._color = YELLOW_COLOR
    }
  }

  update(currentTiming: number): void {
    const renderedTime = currentTiming - this._judgeTiming

    if (renderedTime > MAX_REMAIN_TIME) {
      this._active = false
    }
    if (renderedTime <= MAX_REMAIN_TIME / 2) {
      this._alpha = 255 * 0.8
    } else if (renderedTime < MAX_REMAIN_TIME / 3 * 2) {
      this._alpha = 0.6 * 255
    } else if (renderedTime < MAX_REMAIN_TIME / 6 * 5) {
      this._alpha = 0.2 * 255
    } else {
      this._alpha = 0
    }
  }

  render(context: CanvasRenderingContext2D): void {
    const HEIGHT = py(32)
    const LINE_WIDTH = py(4)
    context.fillStyle = this._color(this._alpha)
    const x = CANVAS.WIDTH / 2.0 + this._deviation * this._scale
    const y = CANVAS.HEIGHT - HEIGHT * this._scale
    context.fillRect(x, y, LINE_WIDTH, HEIGHT * this._scale)
  }
}
