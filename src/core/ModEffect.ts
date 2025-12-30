import { RenderObject } from './RenderObject'
import { Mod } from './ModsPanel'
import { vh } from './Config'
import { Skin } from './Skin'
import { CANVAS } from './Config'

const HIDDEN_START_HEIGHT = 0.2
const COVER_FADE_HEIGHT = 0.15
const HIDDEN_PHASE = 12
const HIDDEN_MAX_HEIGHT = 0.6
const FADE_PHASE = 12
const FADE_MAX_HEIGHT = 0.6
const FADE_START_HEIGHT = 0.2
const FL_HEIGHT = 0.4

export class ModEffect extends RenderObject {
  private readonly _mod: Mod

  private _combo = 0

  private _columnStart = 0

  private _keys = 4

  private _width = 0

  constructor(mod: Mod) {
    super()
    this._mod = mod
  }

  set keys(k: number) {
    this._keys = k
    const { keys, columnCenter } = Skin.config.stage
    const { note: { width } } = keys[`keys${this._keys}`]
    this._width = width * this._keys
    this._columnStart = columnCenter - width * k / 2
  }

  render(context: CanvasRenderingContext2D) {
    const coverFadeHeight = vh(COVER_FADE_HEIGHT)
    const phase = Math.ceil(this._combo / 50)

    if (this._mod === Mod.HD) {
      const heightVh = phase / HIDDEN_PHASE * (HIDDEN_MAX_HEIGHT - HIDDEN_START_HEIGHT) + HIDDEN_START_HEIGHT
      const height = vh(Math.min(heightVh, HIDDEN_MAX_HEIGHT))
      context.save()
      context.fillStyle = 'rgb(0,0,0)'
      context.fillRect(this._columnStart, CANVAS.HEIGHT, this._width, -height)
      const y0 = CANVAS.HEIGHT - height - coverFadeHeight
      const gradient = context.createLinearGradient(0, y0, 0, y0 + coverFadeHeight)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
      context.fillStyle = gradient
      context.fillRect(this._columnStart, y0, this._width, coverFadeHeight)
      context.restore()
    } else if (this._mod === Mod.FD) {
      const heightVh = phase / FADE_PHASE * (FADE_MAX_HEIGHT - FADE_START_HEIGHT) + FADE_START_HEIGHT
      const height = vh(Math.min(heightVh, FADE_MAX_HEIGHT))
      context.save()
      context.fillStyle = 'rgb(0,0,0)'
      context.fillRect(this._columnStart, 0, this._width, height)
      const gradient = context.createLinearGradient(0, height, 0, height + coverFadeHeight)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = gradient
      context.fillRect(this._columnStart, height, this._width, height + coverFadeHeight)
      context.restore()
    } else if (this._mod === Mod.FL) {
      const height = vh(FL_HEIGHT)
      const coverFadeH = 40
      context.save()
      context.fillStyle = 'rgb(0,0,0)'
      context.fillRect(0, 0, CANVAS.WIDTH, height)
      context.fillRect(0, CANVAS.HEIGHT, CANVAS.WIDTH, -height)
      const g1 = context.createLinearGradient(0, height, 0, coverFadeH + height)
      g1.addColorStop(0, 'rgba(0, 0, 0, 1)')
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = g1
      context.fillRect(0, height, CANVAS.WIDTH, height + coverFadeH)
      const y0 = CANVAS.HEIGHT - height - coverFadeH
      const g2 = context.createLinearGradient(0, y0, 0, y0 + coverFadeH)
      g2.addColorStop(0, 'rgba(0, 0, 0, 0)')
      g2.addColorStop(1, 'rgba(0, 0, 0, 1)')
      context.fillStyle = g2
      context.fillRect(0, y0, CANVAS.WIDTH, coverFadeH)
      context.restore()
    }
  }

  set combo(combo: number) {
    this._combo = combo
  }
}
