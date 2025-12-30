import { OffsetRenderObject } from './RenderObject'
import { Skin } from './Skin'

export class SectionLineEffect extends OffsetRenderObject {
  private readonly _width: number

  constructor(offset: number, width: number) {
    super(offset)
    this._width = width
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
    context.fillRect(columnCenter - this._width / 2, offsetY, this._width, height)
  }
}
