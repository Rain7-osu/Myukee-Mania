import { Shape } from './Shape.js'
import { CANVAS_HEIGHT, NOTE_WIDTH } from './Config.js'

export class StageBoard extends Shape {
  render (context) {
    context.fillStyle = '#fff'
    context.fillRect(4 * NOTE_WIDTH, 0, 10, CANVAS_HEIGHT)

    const JUDGE_LINE_HEIGHT = 200
    const gradient = context.createLinearGradient(0, CANVAS_HEIGHT, 0,  CANVAS_HEIGHT - JUDGE_LINE_HEIGHT)
    gradient.addColorStop(0, 'rgba(139, 0, 0, 1)')
    gradient.addColorStop(0.05, 'rgba(139, 0, 0, 1)')
    gradient.addColorStop(0.1, 'rgba(139, 0, 0, 0.2)')
    gradient.addColorStop(1, 'rgba(139, 0, 0, 0)')
    context.fillStyle = gradient
    context.fillRect(0, CANVAS_HEIGHT - JUDGE_LINE_HEIGHT, 4 * NOTE_WIDTH, JUDGE_LINE_HEIGHT)
  }
}
