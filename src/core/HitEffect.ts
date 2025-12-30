import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { Skin } from './Skin'

/**
 * press key beautiful effect
 * 打击特效
 */
export class HitEffect extends RenderObject {
  #col: number
  #color: 'yellow' | 'red' | 'blue'
  #height = 0
  #left = 0
  #width = 0

  constructor (
    col: number,
    color: 'yellow' | 'red' | 'blue',
    style: {
      x: number;
      width: number;
    }
  ) {
    super()
    this.#col = col
    this.#color = color
    this.#width = style.width
    this.#height = 0
    this.#left = style.x
  }

  reset () {
    this.#height = 0
    this.cancelTransitions()
  }

  render (context: CanvasRenderingContext2D): void {
    context.fillStyle = this._createGradiant(context)
    context.fillRect(this.#left, CANVAS.HEIGHT - this.#height, this.#width, this.#height)
  }

  push () {
    const { height: HIT_EFFECT_HEIGHT } = Skin.config.stage.hitEffect
    this.cancelTransitions()
    this.createTransitionSync(this.#height, HIT_EFFECT_HEIGHT, 80, 'easeOut', value => this.#height = value)
  }

  shift () {
    this.cancelTransitions()
    this.createTransitionSync(this.#height, 0, 300, 'easeOut', value => this.#height = value)
  }

  _createGradiant (context: CanvasRenderingContext2D): CanvasGradient {
    if (this.#color === 'yellow') {
      return this._createYellowGradiant(context)
    } else if (this.#color === 'blue') {
      return this._createBlueGradiant(context)
    } else {
      return this._createRedGradiant(context)
    }
  }

  _createRedGradiant (context: CanvasRenderingContext2D): CanvasGradient {
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

  _createBlueGradiant (context: CanvasRenderingContext2D): CanvasGradient {
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

  _createYellowGradiant (context: CanvasRenderingContext2D): CanvasGradient {
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
