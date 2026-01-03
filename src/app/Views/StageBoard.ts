import { RenderObject } from '../Core/RenderObject';
import { JudgementLineEffect } from '../Effects/JudgementLineEffect';
import { Skin } from '../Configs/Skin';
import { rgba } from '../_common/utils';
import { CANVAS, DEFAULT_DELAY_TIME } from '../Configs/Config';

export class StageBoard extends RenderObject {
  private _background: string
  private _borderColor: string

  private _visible: boolean = false

  private _judgementLine = new JudgementLineEffect()

  private _keys: number = 4

  private _width: number = 600

  private _columnStart: number = 0

  constructor () {
    super()
    const { board: { background }, border: { color } } = Skin.config.stage
    this._background = background
    this._borderColor = color
  }

  get boundary(): {left: number, right: number} {
    return { left: this._columnStart, right: this._columnStart + this._width }
  }

  init(k: number) {
    this._keys = k
    const { keys, columnCenter } = Skin.config.stage
    const { note: { width } } = keys[`keys${this._keys}`]
    this._width = width * this._keys
    this._columnStart = columnCenter - width * k / 2
    this._judgementLine.left = this._columnStart
    this._judgementLine.width = this._width
  }

  get visible(): boolean { return this._visible }

  async show () {
    this._visible = true
    const { board: { background }, border: { color } } = Skin.config.stage
    const [r, g, b, a] = rgba.toValues(background)
    const [cr, cg, cb, ca] = rgba.toValues(color)
    this.cancelTransitions()
    await this.createTransition(0, 100, DEFAULT_DELAY_TIME, 'easeOut', (value) => {
      this._background = rgba.format([r, g, b, a * value / 100])
      this._borderColor = rgba.format([cr, cg, cb, ca * value / 100])
    })
  }

  async hide () {
    this._visible = false
    const { board: { background }, border: { color } } = Skin.config.stage
    const [r, g, b, a] = rgba.toValues(background)
    const [cr, cg, cb, ca] = rgba.toValues(color)
    this.cancelTransitions()
    await this.createTransition(100, 0, DEFAULT_DELAY_TIME, 'easeOut', (value) => {
      this._background = rgba.format([r, g, b, a * value / 100])
      this._borderColor = rgba.format([cr, cg, cb, ca * value / 100])
    })
  }

  render (context) {
    const { border: { width: borderWidth } } = Skin.config.stage
    const columnStart = this._columnStart

    const width = this._width
    // render bg
    context.fillStyle = this._background
    context.fillRect(columnStart, 0, width, CANVAS.HEIGHT)

    // render border
    context.fillStyle = this._borderColor
    context.fillRect(columnStart + width, 0, borderWidth, CANVAS.HEIGHT)
    context.fillRect(columnStart - borderWidth, 0, borderWidth, CANVAS.HEIGHT)

    this._judgementLine.render(context)
  }
}
