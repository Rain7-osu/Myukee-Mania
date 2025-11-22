import { Shape } from './Shape'
import { CANVAS } from './Config'
import { Skin } from './Skin'
import { rgba } from './utils'

export class StageBoard extends Shape {
  /**
   * @type {string}
   */
  #bgRgba
  /**
   * @type {string}
   */
  #borderRgba

  show () {
    const { board: { bgRgba }, border: { color } } = Skin.config.stage
    const [r, g, b, a] = rgba.toValues(bgRgba)
    const [cr, cg, cb, ca] = rgba.toValues(color)
    this.createTransition(0, 100, 1000, 'easeOut', (value) => {
      this.#bgRgba = rgba.format([r, g, b, a * value / 100])
      this.#borderRgba = rgba.format([cr, cg, cb, ca * value / 100])
    })
  }

  hide () {
    const { board: { bgRgba }, border: { color } } = Skin.config.stage
    const [r, g, b, a] = rgba.toValues(bgRgba)
    const [cr, cg, cb, ca] = rgba.toValues(color)
    this.createTransition(100, 0, 1000, 'easeOut', (value) => {
      this.#bgRgba = rgba.format([r, g, b, a * value / 100])
      this.#borderRgba = rgba.format([cr, cg, cb, ca * value / 100])
    })
  }

  render (context) {
    const {
      board: { width },
      columnStart,
      border: { width: borderWidth },
    } = Skin.config.stage

    // render bg
    context.fillStyle = this.#bgRgba
    context.fillRect(columnStart, 0, width, CANVAS.HEIGHT)

    // render border
    context.fillStyle = this.#borderRgba
    context.fillRect(columnStart + width, 0, borderWidth, CANVAS.HEIGHT)
    context.fillRect(columnStart - borderWidth, 0, borderWidth, CANVAS.HEIGHT)
  }
}
