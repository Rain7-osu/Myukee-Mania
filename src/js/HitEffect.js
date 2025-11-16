import { Shape } from './Shape.js'
import { KeyCode } from './KeyCode.js'
import { CANVAS } from './Config.js'
import { Skin } from './Skin'

/**
 * press key beautiful effect
 * 打击特效
 */
export class HitEffect extends Shape {
  /**
   * @param code {KeyCode}
   */
  static #convertKeyCodeToCol (code) {
    return [
      KeyCode.D,
      KeyCode.F,
      KeyCode.J,
      KeyCode.K,
    ].indexOf(code)
  }

  /**
   * @type {KeyCode}
   */
  #key

  /** @type {number} */
  #col

  /**
   * @type {{
   *  x: number;
   *  y: number;
   *  height: number;
   *  width: number;
   * }}
   */
  #rect

  /**
   * @type {'rising' | 'holding' | 'falling'}
   */
  #phase

  /** @type {number} */
  #alpha

  /** @type {boolean} */
  #held

  constructor (key) {
    super()
    this.#key = key
    this.#col = HitEffect.#convertKeyCodeToCol(key)
    this.#phase = 'rising'
    this.#alpha = 1.0
    this.#held = true

    const { width: NOTE_WIDTH } = Skin.config.stage.note

    this.#rect = {
      x: this.#col * NOTE_WIDTH,
      y: CANVAS.HEIGHT,
      width: NOTE_WIDTH,
      height: 0,
    }
  }

  /**
   * @param ctx {CanvasRenderingContext2D}
   */
  render (ctx) {
    const {
      x: baseX, y,
      width, height,
    } = this.#rect
    const { columnStart } = Skin.config.stage
    const x = baseX + columnStart

    ctx.fillStyle = this.#col === 1 || this.#col === 2
      ? this.createBlueGradiant(ctx)
      : this.createRedGradiant(ctx)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y - height)
    ctx.lineTo(x, y - height)
    ctx.closePath()
    ctx.fill()

    // render bottom highlight
    ctx.fillStyle = this.#col === 1 || this.#col === 2 ?
      'rgba(0, 230, 255, 0.7)' :
      'rgba(255, 255, 255, 0.8)'
    ctx.fillRect(x, y - 2, width, 4)
  }

  /**
   * @return {boolean} current effect is alive
   */
  update () {
    const {
      speed: { rise: HIT_EFFECT_RISE_SPEED, fall: HIT_EFFECT_FALL_SPEED },
      height: HIT_EFFECT_HEIGHT,
    } = Skin.config.stage.hitEffect

    if (this.#phase === 'rising') {
      this.#rect.height += HIT_EFFECT_RISE_SPEED
      if (this.#rect.height >= HIT_EFFECT_HEIGHT) {
        this.#rect.height = HIT_EFFECT_HEIGHT

        if (this.#held) {
          this.#phase = 'holding'
        } else {
          this.#phase = 'falling'
        }
      }
    } else if (this.#phase === 'holding') {
      if (!this.#held) {
        this.#phase = 'falling'
      }
    } else if (this.#phase === 'falling') {
      this.#rect.height -= HIT_EFFECT_FALL_SPEED
      if (this.#rect.height < 0) {
        this.#rect.height = 0
        return false
      }
    }
    return true
  }

  release () {
    this.#held = false
    if (this.#phase === 'holding') {
      this.#phase = 'falling'
    }
  }

  press () {
    this.#held = true
    if (this.#phase === 'falling') {
      this.#phase = 'rising'
    }
  }

  get key () {
    return this.#key
  }

  /**
   * @param ctx {CanvasRenderingContext2D}
   */
  createRedGradiant (ctx) {
    const { x, y, height } = this.#rect
    const gradient = ctx.createLinearGradient(
      x, y,
      x, y - height,
    )
    gradient.addColorStop(0, 'rgba(250, 0, 0, 0.9)')
    gradient.addColorStop(0.3, 'rgba(200, 0, 0, 0.7)')
    gradient.addColorStop(1, 'rgba(50, 0, 0, 0)')
    return gradient
  }

  /**
   * @param ctx {CanvasRenderingContext2D}
   */
  createBlueGradiant (ctx) {
    const { x, y, height } = this.#rect
    const gradient = ctx.createLinearGradient(
      x, y,
      x, y - height,
    )
    gradient.addColorStop(0, 'rgba(0, 200, 255, 0.8)')
    gradient.addColorStop(0.3, 'rgba(0, 150, 255, 0.6)')
    gradient.addColorStop(1, 'rgba(0, 0, 255, 0)')
    return gradient
  }
}
