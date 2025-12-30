import { RenderObject } from './RenderObject'
import { Skin } from './Skin'
import { CANVAS } from './Config'

export class FPS extends RenderObject {
  private _value: string

  /**
   * 帧数记录
   */
  private _frameTimeList: number[] = []

  update (now: number) {
    this._frameTimeList.push(now)
    const first = this._frameTimeList[0]
    const last = this._frameTimeList[this._frameTimeList.length - 1]
    const fpsValue = (1000.0 * this._frameTimeList.length / (last - first)).toFixed(0)

    if (this._frameTimeList.length >= 200) {
      this._frameTimeList.shift()
    }

    this._value = fpsValue
  }

  render (context: CanvasRenderingContext2D) {
    const { right, bottom, color, font, fontSize, background, fontWeight, height, radius, width } = Skin.config.fps
    const x = CANVAS.WIDTH - right - width
    const y = CANVAS.HEIGHT - height - bottom

    context.fillStyle = background
    RenderObject.roundRect({
      context,
      x,
      y,
      width,
      height,
      radius,
      fill: true,
      stroke: false,
    })

    const text = `${this._value}fps`
    RenderObject.drawText({
      context,
      x,
      y: y + 2,
      width,
      height,
      font: `${fontWeight} ${fontSize}px ${font}`,
      color,
      text,
    })
  }
}
