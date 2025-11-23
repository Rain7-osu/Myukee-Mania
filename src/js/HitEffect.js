import { Shape } from './Shape'
import { CANVAS } from './Config'
import { Skin } from './Skin'

/**
 * press key beautiful effect
 * 打击特效
 */
export class HitEffect extends Shape {
  /** @type {number} */
  #col

  /**
   * @type {'rising' | 'holding' | 'falling'}
   */
  #phase

  /** @type {number} */
  #alpha

  /** @type {boolean} */
  #held

  /**
   * @type {'yellow' | 'red' | 'blue'}}
   */
  #color

  #height = 0

  #left = 0

  #width = 0

  /**
   * @param col {number}
   * @param color {'yellow' | 'red' | 'blue'}
   * @param style {{
   *   x: number;
   *   width: number;
   * }}
   */
  constructor (col, color, style) {
    super()
    this.#col = col
    this.#phase = 'rising'
    this.#alpha = 1.0
    this.#held = true
    this.#color = color
    this.#width = style.width
    this.#height = 0
    this.#left = style.x
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render (context) {
    context.fillStyle = this.createGradiant(context)
    context.fillRect(this.#left, CANVAS.HEIGHT - this.#height, this.#width, this.#height)
  }

  push () {
    const { height: HIT_EFFECT_HEIGHT } = Skin.config.stage.hitEffect
    this.cancelTransitions()
    this.createTransition(this.#height, HIT_EFFECT_HEIGHT, 80, 'easeOut', (value) => this.#height = value)
  }

  shift () {
    this.cancelTransitions()
    this.createTransition(this.#height, 0, 300, 'easeOut', (value) => this.#height = value)
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  createGradiant (context) {
    if (this.#color === 'yellow') {
      return this.createYellowGradiant(context)
    } else if (this.#color === 'blue') {
      return this.createBlueGradiant(context)
    } else {
      return this.createRedGradiant(context)
    }
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  createRedGradiant (context) {
    const { x, y, height } = {
      x: this.#left,
      y: CANVAS.HEIGHT,
      height: this.#height,
    }
    const gradient = context.createLinearGradient(
      x, y,
      x, y - height,
    )
    gradient.addColorStop(0, 'rgba(250, 0, 0, 0.9)')
    gradient.addColorStop(0.3, 'rgba(200, 0, 0, 0.7)')
    gradient.addColorStop(1, 'rgba(50, 0, 0, 0)')
    return gradient
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  createBlueGradiant (context) {
    const { x, y, height } = {
      x: this.#left,
      y: CANVAS.HEIGHT,
      height: this.#height,
    }
    const gradient = context.createLinearGradient(
      x, y,
      x, y - height,
    )
    gradient.addColorStop(0, 'rgba(0, 200, 255, 0.8)')
    gradient.addColorStop(0.3, 'rgba(0, 150, 255, 0.6)')
    gradient.addColorStop(1, 'rgba(0, 0, 255, 0)')
    return gradient
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  createYellowGradiant (context) {
    const { x, y, height } = {
      x: this.#left,
      y: CANVAS.HEIGHT,
      height: this.#height,
    }
    const gradient = context.createLinearGradient(
      x, y,
      x, y - height,
    )
    gradient.addColorStop(0, 'rgba(250, 200, 0, 0.9)')
    gradient.addColorStop(0.3, 'rgba(200, 160, 0, 0.7)')
    gradient.addColorStop(1, 'rgba(50, 40, 0, 0)')
    return gradient
  }
}
