import { Shape } from './Shape'
import { MouseEventManager } from './MouseEventManager'
import { rgba } from './utils'

/**
 * @typedef {Object} ButtonStyle
 * @property {number} left
 * @property {number} top
 * @property {number} width
 * @property {number} height
 * @property {string} text
 * @property {string} font
 * @property {number} fontSize
 * @property {string} color
 * @property {number} radius
 * @property {string} background
 * @property {string?} hoverBackground
 * @property {number?} hoverScale
 * @property {number?} hoverWidth
 * @property {number?} offsetPercentX
 */

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
      hoverScale: 105,
      offsetPercentX: 0.5,
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
    const [x, y, width, height] = this.rect()
    const { text, fontSize: initialFontSize, font, color, radius } = this.style()
    context.fillStyle = this.background()
    this.roundRect({
      context,
      x, y, width, height,
      radius,
      fill: true,
      stroke: false,
    })

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

  hover () {
    this.hovered = true
    this.cancelTransitions()
    const { hoverBackground, hoverScale } = this.#style
    if (hoverBackground) {
      const [rh, gh, bh, ah] = rgba.toValues(hoverBackground)
      const [r, g, b, a] = rgba.toValues(this.#currentBackground)
      this.createTransition(0, 100, 100, 'easeOut', (value) => {
        const progress = value / 100
        this.#currentBackground = rgba.format([
          r + (rh - r) * progress,
          g + (gh - g) * progress,
          b + (bh - b) * progress,
          a + (ah - a) * progress,
        ])
      })
    }
    if (hoverScale) {
      this.createTransition(this.#currentScale, hoverScale, 100, 'easeOut', (value) => this.#currentScale = value)
    }
  }

  hoverOut () {
    this.hovered = false
    this.cancelTransitions()
    const { hoverBackground, hoverScale, background } = this.#style
    if (hoverBackground) {
      const [rh, gh, bh, ah] = rgba.toValues(this.#currentBackground)
      const [r, g, b, a] = rgba.toValues(background)
      this.createTransition(0, 100, 100, 'easeOut', (value) => {
        const progress = value / 100
        this.#currentBackground = rgba.format([
          rh - (rh - r) * progress,
          gh - (gh - g) * progress,
          bh - (bh - b) * progress,
          ah - (ah - a) * progress,
        ])
      })
    }
    if (hoverScale) {
      this.createTransition(this.#currentScale, 100, 100, 'easeOut', (value) => this.#currentScale = value)
    }
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
        (e) => {
          if (this.isMouseIn(e)) {
            onClick?.()
          }
        },
      ],
    })
  }

  removeEvents () {
    this.#mouseEventHandler.removeEvents()
  }
}
