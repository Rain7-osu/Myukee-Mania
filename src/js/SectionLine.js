import { OffsetShape } from './Shape'
import { NOTE_WIDTH, SECTION_LINE_COLOR, SECTION_LINE_HEIGHT } from './Config'

export class SectionLine extends OffsetShape {
  constructor (offset) {
    super(offset)
  }

  render (context, offsetY, endY) {
    if (offsetY < 0) {
      return
    }

    context.fillStyle = SECTION_LINE_COLOR
    context.fillRect(0, offsetY - SECTION_LINE_HEIGHT / 2, NOTE_WIDTH * 4, SECTION_LINE_HEIGHT)
  }
}
