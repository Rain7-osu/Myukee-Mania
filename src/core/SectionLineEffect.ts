import { OffsetRenderObject } from './RenderObject'
import { Skin } from './Skin'

export class SectionLineEffect extends OffsetRenderObject {
  #width: number

  constructor(offset: number, width: number) {
    super(offset)
    this.#width = width
  }

  render(context: CanvasRenderingContext2D, offsetY: number, endY: number): void {
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
