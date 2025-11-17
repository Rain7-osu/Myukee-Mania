import { Shape } from './Shape'
import { CANVAS } from './Config'
import { Skin } from './Skin'

export class StageBoard extends Shape {
  render (context) {
    const {
      judgementLine: { height: JUDGE_LINE_HEIGHT },
      note: { width: NOTE_WIDTH },
      columnStart,
      border: { width: borderWidth },
    } = Skin.config.stage

    // render border
    context.fillStyle = '#fff'
    context.fillRect(columnStart + 4 * NOTE_WIDTH, 0, borderWidth, CANVAS.HEIGHT)
    context.fillRect(columnStart - borderWidth, 0, borderWidth, CANVAS.HEIGHT)

    // render judgeLine
    const gradient = context.createLinearGradient(0, CANVAS.HEIGHT, 0, CANVAS.HEIGHT - JUDGE_LINE_HEIGHT)
    gradient.addColorStop(0, 'rgba(139, 0, 0, 1)')
    gradient.addColorStop(0.05, 'rgba(139, 0, 0, 1)')
    gradient.addColorStop(0.1, 'rgba(139, 0, 0, 0.2)')
    gradient.addColorStop(1, 'rgba(139, 0, 0, 0)')
    context.fillStyle = gradient
    context.fillRect(columnStart, CANVAS.HEIGHT - JUDGE_LINE_HEIGHT, 4 * NOTE_WIDTH, JUDGE_LINE_HEIGHT)
  }
}
