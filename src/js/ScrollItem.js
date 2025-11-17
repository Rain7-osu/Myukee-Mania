import { Shape } from './Shape'
import { CANVAS } from './Config'

/**
 * @typedef {{
 *   marginTop: number;
 *   marginBottom: number;
 *   width: number;
 *   height: number;
 *   left: number;
 * }} Style
 */

export class ScrollItem extends Shape {
  /**
   * @type {Style}
   */
  #style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  /**
   * @type {Style}
   */
  #hoverStyle = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  /**
   * @type {Style}
   */
  #activeStyle = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  /**
   * @type {Style}
   */
  #activeHoverStyle = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  #hovered = false

  #active = false

  #offsetY = 0

  #offsetX = 0

  /**
   * @param style {Style}
   */
  set style (style) {
    this.#style = style
  }

  /**
   * @param style {Style}
   */
  set hoverStyle (style) {
    this.#hoverStyle = style
  }

  /**
   * @param style {Style}
   */
  set activeStyle (style) {
    this.#activeStyle = style
  }

  /**
   * @param style {Style}
   */
  set activeHoverStyle (style) {
    this.#activeHoverStyle = style
  }

  /**
   * @param offsetY {number}
   */
  set offsetY (offsetY) {
    this.#offsetY = offsetY
  }

  /**
   * @return {number}
   */
  get offsetY () {
    return this.#offsetY
  }

  /**
   * @return {boolean}
   */
  get hovered () {
    return this.#hovered
  }

  /**
   * @param hovered {boolean}
   */
  set hovered (hovered) {
    this.#hovered = hovered
  }

  /**
   * @return {boolean}
   */
  get active () {
    return this.#active
  }

  /**
   * @param active {boolean}
   */
  set active (active) {
    this.#active = active
  }

  /**
   * @param offsetX {number}
   */
  set offsetX (offsetX) {
    this.#offsetX = offsetX
  }

  /**
   * @return {number}
   */
  get offsetX () {
    return this.#offsetX
  }

  render (context) {
    const { left, top, height, width } = this.rect()
    if (top > CANVAS.HEIGHT || top + height < 0) {
      return
    }

    this.renderByStyle(context, left, top, width, height)
  }

  /**
   * @abstract
   * @param context {CanvasRenderingContext2D}
   * @param left {number}
   * @param top {number}
   * @param width {number}
   * @param height {number}
   * @return void
   */
  renderByStyle (context, left, top, width, height) {
    throw new Error('Please implements the renderByStyle method')
  }

  /**
   * @return {Style}
   */
  get currentStyle () {
    let style
    if (this.#active && this.#hovered) {
      style = this.#activeHoverStyle
    } else if (this.#active) {
      style = this.#activeStyle
    } else if (this.#hovered) {
      style = this.#hoverStyle
    } else {
      style = this.#style
    }
    return style
  }

  rect () {
    const style = this.currentStyle

    return {
      left: this.#offsetX + style.left,
      top: this.#offsetY + style.marginTop,
      width: style.width - this.#offsetX,
      height: style.height,
    }
  }
}
