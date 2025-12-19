import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { ActiveEffect } from './ActiveEffect'
import { FlashLightEffect } from './FlashLightEffect'

const DURATION = 400

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

export class ScrollItem extends RenderObject {
  /**
   * @type {FlashLightEffect}
   */
  #flashLight = new FlashLightEffect()

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

  #scrollY = 0

  #translateY = 0

  #translateX = 0

  #translateXEffect = new ActiveEffect()

  /**
   * @param y {number}
   */
  set translateY (y) {
    this.#translateY = y
  }

  /**
   * @return {number}
   */
  get translateY () {
    return this.#translateY
  }

  /**
   * @param x {number}
   */
  set translateX (x) {
    this.#translateX = x
  }

  /**
   * @return {number}
   */
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
    this.#offsetY = Math.round(offsetY)
  }

  set scrollY (scrollY) {
    this.#scrollY = Math.round(scrollY)
  }

  /**
   * @return {number}
   */
  get y () {
    return this.#offsetY - this.#scrollY
  }

  get x () {
    return this.#offsetX + this.#style.left
  }

  /**
   * @return {number}
   */
  get offsetY () {
    return this.#offsetY
  }

  /**
   * @param val {boolean}
   */
  set hovered (val) {
    this.#hovered = val
  }

  /**
   * @return {boolean}
   */
  get hovered () {
    return this.#hovered
  }

  /**
   * @param val {boolean}
   */
  set active (val) {
    this.#active = val
  }

  /**
   * @return {boolean}
   */
  get active () {
    return this.#active
  }

  /**
   * @param duration {number}
   * @param phase {string}
   * @return {Promise<void>}
   * @private
   */
  async _processTransition (duration = DURATION, phase) {
    const currentStyle = this.currentStyle.left
    const target = currentStyle - this.style.left
    this.#translateXEffect.cancelTransitions()

    const update = value => this.translateX = value

    if (this.active) {
      update.__debug__ = true
      console.log('update', update.__debug__)
    }

    await this.#translateXEffect.createTransition(
      this.translateX, target,
      duration, 'easeOut',
      update,
    )
  }

  async hoverIn () {
    if (!this.hovered) {
      this.hovered = true
      await Promise.all([
        this._processTransition(DURATION, 'hoverIn'),
        !this.active && this.#flashLight.flash(10),
      ])
    }
  }

  async hoverOut () {
    if (this.hovered) {
      this.hovered = false
      await this._processTransition(2 * DURATION, 'hoverOut')
    }
  }

  /**
   * @return {Promise<void>}
   */
  async activeIn () {
    if (!this.active) {
      console.log('activeIn')
      this.active = true
      await this._processTransition(DURATION, 'activeIn')
    }
  }

  async activeOut () {
    if (this.active) {
      console.log('activeOut')
      this.active = false
      await this._processTransition(2 * DURATION, 'activeOut')
    }
  }

  /**
   * @param offsetX {number}
   */
  set offsetX (offsetX) {
    this.#offsetX = Math.round(offsetX)
  }

  /**
   * @return {number}
   */
  get offsetX () {
    return this.#offsetX
  }

  updateEffect (now) {
    super.updateEffect(now)
    this.#flashLight.updateEffect(now)
    this.#translateXEffect.updateEffect(now)
  }

  cancelEffect () {
    super.cancelEffect()
    this.#flashLight.cancelEffect()
    this.#translateXEffect.cancelEffect()
  }

  render (context) {
    const rect = this.rect()
    const [x, y, w, h] = rect
    if (y > CANVAS.HEIGHT || y + h < 0) {
      return
    }

    this.renderByStyle(context, x, y, w, h)
    this.#flashLight.area = rect
    this.#flashLight.render(context)

    if (__SHOW_SCROLL_BOX__) {
      context.save()
      context.strokeStyle = '#f00'
      context.lineWidth = 2
      context.strokeRect(this.x, this.y, w, h)

      context.strokeStyle = '#00f'
      context.strokeRect(this.x - 2, this.y + this.translateY - 2, w + 4, h + 4)
      context.strokeStyle = undefined
      context.restore()
    }
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
    if (this.active && this.hovered) {
      style = this.#activeHoverStyle
    } else if (this.active) {
      style = this.#activeStyle
    } else if (this.hovered) {
      style = this.#hoverStyle
    } else {
      style = this.#style
    }
    return style
  }

  /**
   * @return {Style}
   */
  get activeStyle () {
    return this.#activeStyle
  }

  /**
   * @return {Style}
   */
  get activeHoverStyle () {
    return this.#activeHoverStyle
  }

  /**
   * @return {Style}
   */
  get hoverStyle () {
    return this.#hoverStyle
  }

  /**
   * @return {Style}
   */
  get style () {
    return this.#style
  }

  /**
   *
   * @return {number[]} [x, y, w, h]
   */
  rect () {
    return [
      this.#offsetX + this.translateX,
      this.#offsetY - this.#scrollY + this.translateY,
      this.currentStyle.width,
      this.currentStyle.height,
    ]
  }
}
