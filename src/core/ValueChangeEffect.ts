import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

const HEIGHT = 80

export class ValueChangeEffect extends RenderObject {
  #value: string
  #time: number
  #alpha: number
  #height: number
  #active: boolean
  get active (): boolean { return this.#active }

  constructor (value: string, time: number) {
    super()
    this.#value = value
    this.#time = time
    this.#alpha = 0.0
    this.#height = 0.0
    this.#active = true
  }

  update (now: number): void {
    const time = now - this.#time

    if (time <= 200.0) {
      const bit = Math.sqrt(time / 200.0)
      this.#alpha = bit
      this.#height = bit * HEIGHT
    } else if (time <= 2800.0) {
      // keep
    } else if (time <= 3000.0) {
      const bit = 1 - (time - 2800) / 200.0
      this.#alpha = bit
      this.#height = HEIGHT * bit
    } else {
      this.#alpha = 0
      this.#height = 0
      this.#active = false
    }
  }

  render (context: CanvasRenderingContext2D): void {
    const x = 0
    const y = (CANVAS.HEIGHT - this.#height) / 2.0
    context.fillStyle = 'rgba(18, 18, 18, 0.5)'
    context.fillRect(x, y, CANVAS.WIDTH, this.#height)

    const text = this.#value
    this.drawText({
      context,
      text,
      font: '36px 微软雅黑',
      color: '#fff',
      x,
      y,
      width: CANVAS.WIDTH,
      height: this.#height,
      stroke: false,
    })
    context.restore()
  }
}
