import { Shape } from './Shape'
import { CANVAS } from './Config'
import { Skin } from './Skin'

export class JudgementLineEffect extends Shape {
  #left = 0

  #width = 0

  set left (left) { this.#left = left}

  set width (width) { this.#width = width}

  render (context) {
    const {
      judgementLine: { height: JUDGE_LINE_HEIGHT },
    } = Skin.config.stage

    // render judgeLine
    const gradient = context.createLinearGradient(0, CANVAS.HEIGHT, 0, CANVAS.HEIGHT - JUDGE_LINE_HEIGHT)
    gradient.addColorStop(0, 'rgba(139, 0, 0, 1)')
    gradient.addColorStop(0.05, 'rgba(139, 0, 0, 1)')
    gradient.addColorStop(0.1, 'rgba(139, 0, 0, 0.2)')
    gradient.addColorStop(1, 'rgba(139, 0, 0, 0)')
    context.fillStyle = gradient
    context.fillRect(this.#left, CANVAS.HEIGHT - JUDGE_LINE_HEIGHT, this.#width, JUDGE_LINE_HEIGHT)
  }
}
