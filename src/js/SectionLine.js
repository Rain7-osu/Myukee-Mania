import { OffsetShape } from './Shape.js'
import { Skin } from './Skin'

export class SectionLine extends OffsetShape {
  constructor (offset) {
    super(offset)
  }

  render (context, offsetY, endY) {
    if (offsetY < 0) {
      return
    }

    const { note: { width: NOTE_WIDTH }, sectionLine: { color, height }, columnStart } = Skin.config.stage
    context.fillStyle = color
    context.fillRect(columnStart, offsetY, NOTE_WIDTH * 4, height)
  }
}
