import { RenderObject } from './RenderObject'
import { Skin } from './Skin'

export class ComboEffect extends RenderObject {
  /** @type {number} */
  #value

  /**
   * @param value {number}
   */
  set value(value) { this.#value = value }

  /**
   * @return {number}
   */
  get value(){ return this.#value }

  render (context) {
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
