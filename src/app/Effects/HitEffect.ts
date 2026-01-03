import { RenderObject } from '../Core/RenderObject';
import { CANVAS } from '../Configs/Config';
import { Skin } from '../Configs/Skin';

/**
 * press key beautiful effect
 * 打击特效
 */
export class HitEffect extends RenderObject {
  private readonly _color: 'yellow' | 'red' | 'blue'
  private readonly _left = 0
  private readonly _width = 0
  private _col: number
  private _height = 0

  constructor(
    col: number,
    color: 'yellow' | 'red' | 'blue',
    style: {
      x: number;
      width: number;
    },
  ) {
    super()
    this._col = col
    this._color = color
    this._width = style.width
    this._height = 0
    this._left = style.x
  }

  reset() {
    this._height = 0
    this.cancelTransitions()
  }

  render(context: CanvasRenderingContext2D): void {
    context.fillStyle = this._createGradiant(context)
    context.fillRect(this._left, CANVAS.HEIGHT - this._height, this._width, this._height)
  }

  push() {
    const { height: HIT_EFFECT_HEIGHT } = Skin.config.stage.hitEffect
    this.cancelTransitions()
    this.createTransitionSync(this._height, HIT_EFFECT_HEIGHT, 80, 'easeOut', value => this._height = value)
  }

  shift() {
    this.cancelTransitions()
    this.createTransitionSync(this._height, 0, 300, 'easeOut', value => this._height = value)
  }

  _createGradiant(context: CanvasRenderingContext2D): CanvasGradient {
    if (this._color === 'yellow') {
      return this._createYellowGradiant(context)
    } else if (this._color === 'blue') {
      return this._createBlueGradiant(context)
    } else {
      return this._createRedGradiant(context)
    }
  }

  _createRedGradiant(context: CanvasRenderingContext2D): CanvasGradient {
    const { x, y, height } = {
      x: this._left,
      y: CANVAS.HEIGHT,
      height: this._height,
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

  _createBlueGradiant(context: CanvasRenderingContext2D): CanvasGradient {
    const { x, y, height } = {
      x: this._left,
      y: CANVAS.HEIGHT,
      height: this._height,
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

  _createYellowGradiant(context: CanvasRenderingContext2D): CanvasGradient {
    const { x, y, height } = {
      x: this._left,
      y: CANVAS.HEIGHT,
      height: this._height,
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
