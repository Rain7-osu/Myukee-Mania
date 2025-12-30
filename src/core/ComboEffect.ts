import { RenderObject } from './RenderObject'
import { Skin } from './Skin'
import * as console from 'console'

export class ComboEffect extends RenderObject {
  private _value: number

  set value(value: number) { this._value = value }

  get value(): number { return this._value }

  render (context: CanvasRenderingContext2D) {
    if (!this._value) {
      return
    }

    const {
      columnCenter,
      combo: { top: TOP, font, fontSize, lineHeight, color },
    } = Skin.config.stage

    RenderObject.drawText({
      context,
      text: this._value,
      x: columnCenter,
      y: TOP,
      width: 0,
      height: lineHeight,
      textAlign: 'center' as const,
      textBaseline: 'middle' as const,
      font: `${fontSize}px ${font}`,
      stroke: false,
      color,
    })
  }
}
