import { RenderObject } from './RenderObject'
import { Skin } from './Skin'

export class ComboEffect extends RenderObject {
  #value: number

  set value(value: number) { this.#value = value }

  get value(): number { return this.#value }

  render (context: CanvasRenderingContext2D) {
    if (!this.#value) {
      return
    }

    const {
      columnCenter,
      combo: { top: TOP, font, fontSize, lineHeight, color },
    } = Skin.config.stage

    this.drawText({
      context,
      text: this.#value,
      x: columnCenter,
      y: TOP,
      width: 0,
      height: lineHeight,
      textAlign: 'center',
      textBaseline: 'middle',
      font: `${fontSize}px ${font}`,
      stroke: false,
      color,
    })
  }
}
