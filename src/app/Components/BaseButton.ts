import { RenderObject } from '../Core/RenderObject';
import { MouseEventManager } from '../Managers/MouseEventManager';
import { py } from '../Configs/Config';

const TRANSITION_DURATION = 100

interface ButtonStyle {
  left: number
  top: number
  width: number
  height: number
  text?: string
  font: string
  fontSize: number
  color: string
  radius: number
  rotate: number
  background?: string
  backgroundImage?: CanvasImageSource
  hoverBackground?: string
  hoverScale?: number
  hoverWidth?: number
  activeBackground?: string
  activeScale?: number
  activeWidth?: number
  offsetPercentX: number //  x 方向的偏移百分比 0.5 表示相对于 left 点向左偏移 0.5, scale 计算使用
  offsetPercentY: number // y 方向的偏移百分比 0.5 表示相对于 top 点想上偏移 0.5, scale 计算使用
  shadowColor?: string
  shadowBlur?: number
}

export class BaseButton extends RenderObject {
  private _mouseEventManager: MouseEventManager

  private readonly _style: ButtonStyle

  private _scale: number

  private _background?: string

  protected hovered = false

  protected active = false

  constructor(container: HTMLElement, style: Partial<ButtonStyle>) {
    super()
    this._style = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      hoverScale: 100,
      rotate: 0,
      font: '微软雅黑',
      fontSize: 24,
      offsetPercentX: 0.5,
      offsetPercentY: 0.5,
      radius: 0,
      color: 'rgb(0, 0, 0)'
    }
    this.setStyle(style)
    this._scale = 100
    this._background = style.background
    this._mouseEventManager = new MouseEventManager(container, 'button')
  }

  setStyle(style: Partial<ButtonStyle>) {
    Object.assign(this._style, style)
    this._background = style.background
    this._scale = this._scale || 100
  }

  /**
   * @private
   */
  background() {
    return this._background
  }

  /**
   * @return {number[]}
   */
  rect() {
    const { left, top, width, height, offsetPercentX, offsetPercentY } = this._style
    const scale = this._scale / 100
    const x = left + (1 - scale) * width * offsetPercentX
    const y = top + (1 - scale) * height * offsetPercentY
    const w = width * scale
    const h = height * scale

    return [x, y, w, h]
  }

  /**
   * @return {ButtonStyle}
   */
  get style() {
    return this._style
  }

  override render(context: CanvasRenderingContext2D) {
    let [x, y, width, height] = this.rect()
    const {
      text,
      fontSize: initialFontSize,
      font,
      color,
      radius,
      backgroundImage,
      rotate,
      shadowColor,
      shadowBlur,
    } = this.style

    context.save()
    if (rotate) {
      context.translate(Math.round(x + width / 2), Math.round(y + height / 2))
      context.rotate(rotate)
      x = -width / 2
      y = -height / 2
    }

    shadowColor && (context.shadowColor = shadowColor)
    shadowBlur && (context.shadowBlur = shadowBlur)

    if (backgroundImage) {
      context.drawImage(backgroundImage, x, y, width, height)
    }

    const fillStyle = this.background()
    if (fillStyle) {
      context.fillStyle = fillStyle
      RenderObject.roundRect({
        context,
        x, y, width, height,
        radius,
        fill: true,
        stroke: false,
      })
    }

    if (text) {
      const fontSize = initialFontSize * this._scale / 100
      RenderObject.drawText({
        context,
        text,
        x,
        y: y + py(5), // 稍微往下一点，视觉上更对齐
        width,
        height,
        font: `${fontSize}px ${font}`,
        color,
        stroke: false,
      })
    }
    context.restore()
  }

  private async _processColorTransition(targetColor: string) {
    await this.createTransition(this._background, targetColor, TRANSITION_DURATION, 'easeOut', color => this._background = color)
  }

  protected onClick(): void {}
  protected onHover(): void {}
  protected onHoverOut(): void {}
  protected onActiveIn(): void {}
  protected onActiveOut(): void {}

  async hover() {
    this.hovered = true
    this.cancelTransitions()
    const { hoverBackground, hoverScale } = this._style
    const results = []
    if (hoverBackground) {
      results.push(this._processColorTransition(hoverBackground))
    }
    if (hoverScale) {
      results.push(this.createTransition(this._scale, hoverScale, TRANSITION_DURATION, 'easeOut', value => this._scale = value))
    }
    await Promise.all(results)
  }

  async hoverOut() {
    this.hovered = false
    this.cancelTransitions()

    const { hoverBackground, hoverScale, background } = this._style
    const results = []
    if (hoverBackground) {
      results.push(this._processColorTransition(background!))
    }
    if (hoverScale) {
      results.push(this.createTransition(this._scale, 100, TRANSITION_DURATION, 'easeOut', value => this._scale = value))
    }
    await Promise.all(results)
  }

  async activeIn() {
    this.hovered = true
    this.cancelTransitions()
    const { activeBackground, hoverScale } = this._style

    const results = []
    if (activeBackground) {
      results.push(this._processColorTransition(activeBackground))
    }
    if (hoverScale) {
      results.push(this.createTransition(this._scale, hoverScale, TRANSITION_DURATION, 'easeOut', value => this._scale = value))
    }
    await Promise.all(results)
  }

  async activeOut() {
    this.hovered = false
    this.cancelTransitions()

    const { activeBackground, hoverScale, background, hoverBackground } = this._style
    const results = []
    if (activeBackground) {
      results.push(this._processColorTransition(this.hovered ? hoverBackground! : background!))
    }
    if (hoverScale) {
      results.push(this.createTransition(this._scale, 100, TRANSITION_DURATION, 'easeOut', value => this._scale = value))
    }
    await Promise.all(results)
  }

  private _isMouseIn(e: MouseEvent) {
    const { offsetY, offsetX } = e
    const [x, y, width, height] = this.rect()
    const xDelta = offsetX - x
    const yDelta = offsetY - y
    return xDelta >= 0 && xDelta <= width && yDelta >= 0 && yDelta <= height
  }


  registerEvents(eventMap?: {
    onClick?: () => void
  }) {
    const { onClick } = eventMap || {}

    this._mouseEventManager.registerEvents({
      mousemoveEvents: [
        e => {
          if (this._isMouseIn(e)) {
            if (!this.hovered) {
              this.hover()
              this.onHover()
            }
          } else if (this.hovered) {
            this.hoverOut()
            this.onHoverOut()
          }
        },
      ],
      wheelEvents: [],
      clickEvents: [
        async e => {
          if (this._isMouseIn(e)) {
            onClick?.()
            this.onClick()
          }
        },
      ],
      mousedownEvents: [
        e => {
          if (this._isMouseIn(e)) {
            this.activeIn()
            this.onActiveIn()
          }
        },
      ],
      mouseupEvents: [
        e => {
          if (this._isMouseIn(e)) {
            this.activeOut()
            this.onActiveOut()
          }
        },
      ],
    })
  }

  disableEvents() {
    this._mouseEventManager.disableEvents()
  }

  enableEvents() {
    this._mouseEventManager.enableEvents()
  }

  removeEvents() {
    this._mouseEventManager.removeEvents()
  }
}
