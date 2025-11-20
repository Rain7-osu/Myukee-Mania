import { Shape } from './Shape'
import { CANVAS } from './Config'
import { Skin } from './Skin'

export class StageBoard extends Shape {
  render (context) {
    const {
      board: { bgColor, width },
      judgementLine: { height: JUDGE_LINE_HEIGHT },
      columnStart,
      border: { width: borderWidth, color: borderColor },
    } = Skin.config.stage

    // render bg
    context.fillStyle = bgColor
    context.fillRect(columnStart, 0, width, CANVAS.HEIGHT)

    // render border
    context.fillStyle = borderColor
    context.fillRect(columnStart + width, 0, borderWidth, CANVAS.HEIGHT)
    context.fillRect(columnStart - borderWidth, 0, borderWidth, CANVAS.HEIGHT)
  }
}
