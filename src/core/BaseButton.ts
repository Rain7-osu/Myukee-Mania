import { RenderObject } from './RenderObject'
import { MouseEventManager } from './MouseEventManager'
import { py } from './Config'

/**
 * @typedef {Object} ButtonStyle
 * @property {number?} left
 * @property {number?} top
 * @property {number?} width
 * @property {number?} height
 * @property {string?} text
 * @property {string?} font
 * @property {number?} fontSize
 * @property {string?} color
 * @property {number?} radius
 * @property {number?} rotate
 * @property {string?} background
 * @property {CanvasImageSource?} backgroundImage
 * @property {string?} hoverBackground
 * @property {number?} hoverScale
 * @property {number?} hoverWidth
 * @property {string?} activeBackground
 * @property {number?} activeScale
 * @property {number?} activeWidth
 * @property {number?} offsetPercentX x 方向的偏移百分比 0.5 表示相对于 left 点向左偏移 0.5, scale 计算使用
 * @property {number?} offsetPercentY y 方向的偏移百分比 0.5 表示相对于 top 点想上偏移 0.5, scale 计算使用
 * @property {string?} shadowColor
 * @property {number?} shadowBlur
 */

const TRANSITION_DURATION = 100

export class BaseButton extends RenderObject {
  /**
   * @type {MouseEventManager}
   */
  private _mouseEventHandler

  /**
   * @type {ButtonStyle}
   */
  private readonly _style
  /**
   * @type {number}
   */
  private _scale

  /**
   * @type {string}
   */
  private _background

  /**
   * @protected
   * @type {boolean}
   */
  hovered = false

  /**
   * @protected
   * @type {boolean}
   */
  active = false

  /**
   * @param container {HTMLCanvasElement}
   * @param style {ButtonStyle}
   */
  constructor(container, style) {
    super()
    this._style = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      hoverScale: 100,
      rotate: 0,
      offsetPercentX: 0.5,
      offsetPercentY: 0.5,
      font: '微软雅黑',
      fontSize: 24,
    }
    this.setStyle(style)
    this._mouseEventHandler = new MouseEventManager(container, 'button')
  }

  /**
   * @param style {Partial<ButtonStyle>}
   */
  setStyle(style) {
    Object.assign(this._style, style)
    this._background = this._background || style.background
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

  render(context) {
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

  /**
   * @param start {string}
   * @param end {string}
   * @param current {string}
   * @param update {(color: string) => void}
   * @return {Promise<void>}
   */
  async processColorTransition(start, end, current, update) {
    await this.createTransition(start, end, TRANSITION_DURATION, 'easeOut', update)
  }

  /**
   * @param fromColor {string}
   * @param targetColor {string}
   * @private
   */
  async _processColorTransition(fromColor, targetColor) {
    await this.createTransition(this._background, targetColor, TRANSITION_DURATION, 'easeOut', color => this._background = color)
  }

  async hover() {
    this.hovered = true
    this.cancelTransitions()
    const { hoverBackground, hoverScale, background } = this._style
    const results = []
    if (hoverBackground) {
      results.push(this._processColorTransition(background, hoverBackground))
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
      results.push(this._processColorTransition(hoverBackground, background))
    }
    if (hoverScale) {
      results.push(this.createTransition(this._scale, 100, TRANSITION_DURATION, 'easeOut', value => this._scale = value))
    }
    await Promise.all(results)
  }

  async activeIn() {
    this.hovered = true
    this.cancelTransitions()
    const { activeBackground, hoverScale, background, hoverBackground } = this._style

    const results = []
    if (activeBackground) {
      results.push(this._processColorTransition(this.hovered ? hoverBackground : background, activeBackground))
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
      results.push(this._processColorTransition(activeBackground, this.hovered ? hoverBackground : background))
    }
    if (hoverScale) {
      results.push(this.createTransition(this._scale, 100, TRANSITION_DURATION, 'easeOut', value => this._scale = value))
    }
    await Promise.all(results)
  }

  /**
   * @private
   * @param e {MouseEvent}
   */
  isMouseIn(e) {
    const { clientY, clientX } = e
    const [x, y, width, height] = this.rect()
    const xDelta = clientX - x
    const yDelta = clientY - y
    return xDelta >= 0 && xDelta <= width && yDelta >= 0 && yDelta <= height
  }

  /**
   * @param [eventMap] {{
   *   onClick?: Function
   * }}
   */
  registerEvents(eventMap) {
    const { onClick } = eventMap || {}

    this._mouseEventHandler.registerEvents({
      mousemoveEvents: [
        e => {
          if (this.isMouseIn(e)) {
            if (!this.hovered) {
              this.hover()
            }
          } else if (this.hovered) {
            this.hoverOut()
          }
        },
      ],
      wheelEvents: [],
      clickEvents: [
        async e => {
          if (this.isMouseIn(e)) {
            onClick()
          }
        },
      ],
      mousedownEvents: [
        e => {
          if (this.isMouseIn(e)) {
            this.activeIn()
          }
        },
      ],
      mouseupEvents: [
        e => {
          if (this.isMouseIn(e)) {
            this.activeOut()
          }
        },
      ],
    })
  }

  disableEvents() {
    this._mouseEventHandler.disableEvents()
  }

  enableEvents() {
    this._mouseEventHandler.enableEvents()
  }

  removeEvents() {
    this._mouseEventHandler.removeEvents()
  }
}
