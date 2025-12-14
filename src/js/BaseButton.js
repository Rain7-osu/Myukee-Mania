import { Shape } from './Shape'
import { MouseEventManager } from './MouseEventManager'
import { rgba } from './utils'

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
 * @property {string?} background
 * @property {CanvasImageSource?} backgroundImage
 * @property {string?} hoverBackground
 * @property {number?} hoverScale
 * @property {number?} hoverWidth
 * @property {string?} activeBackground
 * @property {number?} activeScale
 * @property {number?} activeWidth
 * @property {number?} rotate
 * @property {number?} offsetPercentX
 * @property {string?} shadowColor
 * @property {number?} shadowBlur
 */

const TRANSITION_DURATION = 100

export class BaseButton extends Shape {
  /**
   * @type {MouseEventManager}
   */
  #mouseEventHandler

  /**
   * @type {ButtonStyle}
   */
  #style
  /**
   * @type {number}
   */
  #currentScale

  /**
   * @type {string}
   */
  #currentBackground

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
  constructor (container, style) {
    super()
    this.setStyle(style)
    this.#mouseEventHandler = new MouseEventManager(container, 'button')
  }

  /**
   * @param style {Partial<ButtonStyle>}
   */
  setStyle (style) {
    this.#style = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      hoverScale: 100,
      offsetPercentX: 0.5,
      font: '微软雅黑',
      fontSize: 24,
      ...this.#style,
      ...style,
    }
    const { background } = style
    this.#currentBackground = this.#currentBackground || background
    this.#currentScale = this.#currentScale || 100
  }

  /**
   * @private
   */
  background () {
    return this.#currentBackground
  }

  /**
   *
   */
  rect () {
    const { left, top, width, height, offsetPercentX } = this.style()
    const scale = this.#currentScale / 100
    const x = left + (1 - scale) * width * offsetPercentX
    const y = top + (1 - scale) * height
    const w = width * scale
    const h = height * scale

    return [x, y, w, h]
  }

  /**
   * @return {ButtonStyle}
   */
  style () {
    return this.#style
  }

  render (context) {
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
    } = this.style()

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
      this.roundRect({
        context,
        x, y, width, height,
        radius,
        fill: true,
        stroke: false,
      })
    }

    if (text) {
      const fontSize = initialFontSize * this.#currentScale / 100
      this.drawText({
        context,
        text,
        x,
        y: y + 5, // 稍微往下一点，视觉上更对齐
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
  async processColorTransition (start, end, current, update) {
    const [re, ge, be, ae] = rgba.toValues(end)
    const [rs, gs, bs, as] = rgba.toValues(start)
    const [r, g, b, a] = rgba.toValues(current)
    const startPercent = (r - rs) / (re - rs)
    await this.createTransition(startPercent, 100, TRANSITION_DURATION, 'easeOut', (value) => {
      const progress = value / 100
      update(rgba.format([
        re !== rs ? rs + (re - rs) * progress : rs,
        ge !== gs ? gs + (ge - gs) * progress : gs,
        be !== bs ? bs + (be - bs) * progress : bs,
        ae !== as ? as + (ae - as) * progress : as,
      ]))
    })
  }

  /**
   * @param fromColor {string}
   * @param targetColor {string}
   * @private
   */
  async _processColorTransition (fromColor, targetColor) {
    await this.processColorTransition(fromColor, targetColor, this.#currentBackground, (color) => this.#currentBackground = color)
  }

  async hover () {
    this.hovered = true
    this.cancelTransitions()
    const { hoverBackground, hoverScale, background } = this.#style
    const results = []
    if (hoverBackground) {
      results.push(this._processColorTransition(background, hoverBackground))
    }
    if (hoverScale) {
      results.push(this.createTransition(this.#currentScale, hoverScale, TRANSITION_DURATION, 'easeOut', (value) => this.#currentScale = value))
    }
    await Promise.all(results)
  }

  async hoverOut () {
    this.hovered = false
    this.cancelTransitions()

    const { hoverBackground, hoverScale, background } = this.#style
    const results = []
    if (hoverBackground) {
      results.push(this._processColorTransition(hoverBackground, background))
    }
    if (hoverScale) {
      results.push(this.createTransition(this.#currentScale, 100, TRANSITION_DURATION, 'easeOut', (value) => this.#currentScale = value))
    }
    await Promise.all(results)
  }

  async activeIn () {
    this.hovered = true
    this.cancelTransitions()
    const { activeBackground, hoverScale, background, hoverBackground } = this.#style

    const results = []
    if (activeBackground) {
      results.push(this._processColorTransition(this.hovered ? hoverBackground : background, activeBackground))
    }
    if (hoverScale) {
      results.push(this.createTransition(this.#currentScale, hoverScale, TRANSITION_DURATION, 'easeOut', (value) => this.#currentScale = value))
    }
    await Promise.all(results)
  }

  async activeOut () {
    this.hovered = false
    this.cancelTransitions()

    const { activeBackground, hoverScale, background, hoverBackground } = this.#style
    const results = []
    if (activeBackground) {
      results.push(this._processColorTransition(activeBackground, this.hovered ? hoverBackground : background))
    }
    if (hoverScale) {
      results.push(this.createTransition(this.#currentScale, 100, TRANSITION_DURATION, 'easeOut', (value) => this.#currentScale = value))
    }
    await Promise.all(results)
  }

  /**
   * @private
   * @param e {MouseEvent}
   */
  isMouseIn (e) {
    const { clientY, clientX } = e
    const [x, y, width, height] = this.rect()
    const xDelta = clientX - x
    const yDelta = clientY - y
    return xDelta >= 0 && xDelta <= width && yDelta >= 0 && yDelta <= height
  }

  /**
   * @param eventMap {{
   *   onClick?: Function
   * }}
   */
  registerEvents (eventMap) {
    const { onClick } = eventMap

    this.#mouseEventHandler.registerEvents({
      mousemoveEvents: [
        (e) => {
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
        async (e) => {
          if (this.isMouseIn(e)) {
            onClick?.()
          }
        },
      ],
      mousedownEvents: [
        (e) => {
          if (this.isMouseIn(e)) {
            this.activeIn()
          }
        },
      ],
      mouseupEvents: [
        (e) => {
          if (this.isMouseIn(e)) {
            this.activeOut()
          }
        },
      ],
    })
  }

  removeEvents () {
    this.#mouseEventHandler.removeEvents()
  }
}
