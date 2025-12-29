import { OffsetShape } from './RenderObject'
import { Skin } from './Skin'

export class SectionLineEffect extends OffsetShape {
  /**
   * @type {number}
   */
  #width

  /**
   * @param offset {number}
   * @param width {number}
   */
  constructor (offset, width) {
    super(offset)
    this.#width = width
  }

  render (context, offsetY, endY) {
    if (offsetY < 0) {
      return
    }

    const { sectionLine: { color, height }, columnCenter } = Skin.config.stage

    if (height <= 0) {
      return
    }
    context.fillStyle = color
    context.fillRect(columnCenter - this.#width / 2, offsetY, this.#width, height)
  }
}
