import { RenderObject } from './RenderObject'
import { JudgementType } from './Judgement'
import { CANVAS, py } from './Config'

const MAX_REMAIN_TIME = 6000.0

const BLUE_COLOR = a => `rgba(46, 187, 230, ${a})`
const GREEN_COLOR = a => `rgba(83, 232, 10, ${a})`
const YELLOW_COLOR = a => `rgba(222, 173, 80, ${a})`

/**
 * 打击偏差
 */
export class JudgementDeviation extends RenderObject {
  #judgeTiming: number = 0
  #deviation: number = 0
  #active: boolean
  get active (): boolean { return this.#active }

  #color: (a: number) => string
  #alpha: number
  #scale: number

  constructor (judgeTiming: number, deviation: number, type: JudgementType, scale: number = 1.5) {
    super()
    this.#active = true
    this.#judgeTiming = judgeTiming
    this.#deviation = deviation
    this.#scale = scale
    this.#alpha = 255
    if (type >= JudgementType.GREAT) {
      this.#color = BLUE_COLOR
    } else if (type >= JudgementType.OK) {
      this.#color = GREEN_COLOR
    } else {
      this.#color = YELLOW_COLOR
    }
  }

  update (currentTiming: number): void {
    const renderedTime = currentTiming - this.#judgeTiming

    if (renderedTime > MAX_REMAIN_TIME) {
      this.#active = false
    }
    if (renderedTime <= MAX_REMAIN_TIME / 2) {
      this.#alpha = 255 * 0.8
    } else if (renderedTime < MAX_REMAIN_TIME / 3 * 2) {
      this.#alpha = 0.6 * 255
    } else if (renderedTime < MAX_REMAIN_TIME / 6 * 5) {
      this.#alpha = 0.2 * 255
    } else {
      this.#alpha = 0
    }
  }

  render (context: CanvasRenderingContext2D): void {
    const HEIGHT = py(32)
    const LINE_WIDTH = py(4)
    context.fillStyle = this.#color(this.#alpha)
    const x = CANVAS.WIDTH / 2.0 + this.#deviation * this.#scale
    const y = CANVAS.HEIGHT - HEIGHT * this.#scale
    context.fillRect(x, y, LINE_WIDTH, HEIGHT * this.#scale)
  }
}
