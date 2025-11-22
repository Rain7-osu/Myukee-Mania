import { Shape } from './Shape'
import { CANVAS } from './Config'
import { Skin } from './Skin'

export class StageBoard extends Shape {
  #bgRgba

  init () {
    const { bgRgba: [r, g, b, a] } = Skin.config.stage.board
    this.createTransition(0, a, 1000, 'easeOut', (value) => {
      this.#bgRgba = `rgba(${r}, ${g}, ${b}, ${value})`
    })
  }

  render (context) {
    const {
      board: { bgRgba, width },
      judgementLine: { height: JUDGE_LINE_HEIGHT },
      columnStart,
      border: { width: borderWidth, color: borderColor },
    } = Skin.config.stage

    // render bg
    context.fillStyle = this.#bgRgba
    context.fillRect(columnStart, 0, width, CANVAS.HEIGHT)

    // render border
    context.fillStyle = borderColor
    context.fillRect(columnStart + width, 0, borderWidth, CANVAS.HEIGHT)
    context.fillRect(columnStart - borderWidth, 0, borderWidth, CANVAS.HEIGHT)
  }
}
