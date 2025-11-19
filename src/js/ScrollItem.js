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
 *
 * @typedef {{
 *   left: number;
 *   top: number;
 *   width: number;
 *   height: number;
 * }} RenderInfo
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

  /**
   * @type {RenderInfo}
   */
  #renderInfo = {}

  #hovered = false

  #active = false

  #offsetY = 0

  #offsetX = 0

  #scrollY = 0

  #translateY = 0

  #translateX = 0

  /**
   * @param y {number}
   */
  set translateY (y) {
    this.#translateY = y
  }

  /**
   * @param x {number}
   */
  set translateX (x) {
    this.#translateX = x
  }

  get translateY () {
    return this.#translateY
  }

  get translateX () {
    return this.#translateX
  }

  /**
   * @type {ScrollItem}
   */
  #next = null

  /**
   * @param next {ScrollItem}
   */
  set next (next) {
    this.#next = next
  }

  /**
   * @return {ScrollItem}
   */
  get next () {
    return this.#next
  }

  /**
   * @type {ScrollItem}
   */
  #last = null

  /**
   * @param last {ScrollItem}
   */
  set last (last) {
    this.#last = last
  }

  /**
   * @return {ScrollItem}
   */
  get last () {
    return this.#last
  }

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
    if (offsetY !== this.#offsetY) {
      this.#offsetY = offsetY
    }
  }

  set scrollY (scrollY) {
    if (scrollY !== this.#scrollY) {
      this.#scrollY = scrollY
    }
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

  /** @type {() => void} */
  #cancelUpdate = () => {}

  hoverIn () {
    this.#hovered = true
    // this.#cancelUpdate()
    // this.#cancelUpdate = this.createUpdate(
    //   0,
    //   this.#renderInfo.left - this.currentStyle.left,
    //   200,
    //   (delta) => {
    //     Object.assign(this.#renderInfo, {
    //       left: this.#renderInfo.left - delta,
    //       width: this.#renderInfo.width + delta,
    //     })
    //   },
    // )
  }

  hoverOut () {
    this.#hovered = false
    // this.#cancelUpdate()
    // this.#cancelUpdate = this.createUpdate(
    //   0,
    //   this.#renderInfo.left - this.currentStyle.left,
    //   200,
    //   (delta) => {
    //     Object.assign(this.#renderInfo, {
    //       left: this.#renderInfo.left - delta,
    //       width: this.#renderInfo.width + delta,
    //     })
    //   },
    // )
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
    const { left, top, height, width } = this.renderInfo()
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

  /**
   * @return {Style}
   */
  get hoverStyle () {
    return this.#hoverStyle
  }

  get renderedStyle () {
    return this.currentStyle
  }

  /**
   * @return {Style}
   */
  get style () {
    return this.#style
  }

  /**
   * @return {RenderInfo}
   */
  renderInfo () {
    const style = this.currentStyle

    this.#renderInfo = {
      left: this.#offsetX + style.left + this.#translateX,
      top: this.#offsetY - this.#scrollY + this.#translateY,
      width: style.width,
      height: style.height,
    }

    return this.#renderInfo
  }
}
