import { Shape } from './Shape'
import { CANVAS, DEFAULT_DELAY_TIME } from './Config'
import { Skin } from './Skin'
import { rgba } from './utils'

export class StageBoard extends Shape {
  /**
   * @type {string}
   */
  #background
  /**
   * @type {string}
   */
  #borderColor

  #visible = false

  constructor () {
    super()
    const { board: { background }, border: { color } } = Skin.config.stage
    this.#background = background
    this.#borderColor = color
  }

  get visible () { return this.#visible }

  async show () {
    this.#visible = true
    const { board: { background }, border: { color } } = Skin.config.stage
    const [r, g, b, a] = rgba.toValues(background)
    const [cr, cg, cb, ca] = rgba.toValues(color)
    this.cancelTransitions()
    return new Promise(resolve => {
      this.createTransition(0, 100, DEFAULT_DELAY_TIME, 'easeOut', (value) => {
        this.#background = rgba.format([r, g, b, a * value / 100])
        this.#borderColor = rgba.format([cr, cg, cb, ca * value / 100])
      }, () => resolve())
    })
  }

  hide () {
    this.#visible = false
    const { board: { background }, border: { color } } = Skin.config.stage
    const [r, g, b, a] = rgba.toValues(background)
    const [cr, cg, cb, ca] = rgba.toValues(color)
    this.cancelTransitions()
    return new Promise(resolve => {
      this.createTransition(100, 0, DEFAULT_DELAY_TIME, 'easeOut', (value) => {
        this.#background = rgba.format([r, g, b, a * value / 100])
        this.#borderColor = rgba.format([cr, cg, cb, ca * value / 100])
      }, () => resolve())
    })
  }

  render (context) {
    const {
      board: { width },
      columnStart,
      border: { width: borderWidth },
    } = Skin.config.stage

    // render bg
    context.fillStyle = this.#background
    context.fillRect(columnStart, 0, width, CANVAS.HEIGHT)

    // render border
    context.fillStyle = this.#borderColor
    context.fillRect(columnStart + width, 0, borderWidth, CANVAS.HEIGHT)
    context.fillRect(columnStart - borderWidth, 0, borderWidth, CANVAS.HEIGHT)
  }
}
