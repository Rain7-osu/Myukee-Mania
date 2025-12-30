import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { ActiveEffect } from './ActiveEffect'
import { FlashLightEffect } from './FlashLightEffect'

const DURATION = 600
const DISTANCE_FOR_DURATION = 200

interface Style {
  marginTop: number;
  marginBottom: number;
  width: number;
  height: number;
  left: number;
}

interface RenderInfo {
  left: number;
  top: number;
  width: number;
  height: number;
}

export abstract class ScrollItem extends RenderObject {
  #flashLight = new FlashLightEffect()

  #style: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  #hoverStyle: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  #activeStyle: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  #activeHoverStyle: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  #hovered: boolean = false

  #active: boolean = false

  #offsetY: number = 0

  #offsetX: number = 0

  #scrollY: number = 0

  #scrollX: number = 0

  #translateY: number = 0

  #translateX: number = 0

  #translateXEffect = new ActiveEffect()

  #offsetXEffect = new ActiveEffect()

  get offsetXEffect(): ActiveEffect { return this.#offsetXEffect }

  set translateY(y: number) {
    this.#translateY = Math.round(y)
  }

  get translateY(): number {
    return this.#translateY
  }

  set translateX(x: number) {
    this.#translateX = Math.round(x)
  }

  get translateX(): number {
    return this.#translateX
  }

  #next: ScrollItem | null = null

  set next(next: ScrollItem | null) {
    this.#next = next
  }

  get next(): ScrollItem | null {
    return this.#next
  }

  #last: ScrollItem | null = null

  set last(last: ScrollItem | null) {
    this.#last = last
  }

  get last(): ScrollItem | null {
    return this.#last
  }

  set style(style: Style) {
    this.#style = style
  }

  set hoverStyle(style: Style) {
    this.#hoverStyle = style
  }

  set activeStyle(style: Style) {
    this.#activeStyle = style
  }

  set activeHoverStyle(style: Style) {
    this.#activeHoverStyle = style
  }

  set offsetY(offsetY: number) {
    this.#offsetY = Math.round(offsetY)
  }

  set scrollY(scrollY: number) {
    this.#scrollY = Math.round(scrollY)
  }

  get scrollY(): number {
    return this.#scrollY
  }

  set scrollX(x: number) {
    this.#scrollX = Math.round(x)
  }

  get scrollX(): number {
    return this.#scrollX
  }

  get y(): number {
    return this.#offsetY - this.#scrollY
  }

  get x(): number {
    return this.#offsetX + this.#style.left
  }

  get offsetY(): number {
    return this.#offsetY
  }

  set hovered(val: boolean) {
    this.#hovered = val
  }

  get hovered(): boolean {
    return this.#hovered
  }

  set active(val: boolean) {
    this.#active = val
  }

  get active(): boolean {
    return this.#active
  }

  private async _processTransition(duration: number = DURATION, phase: string): Promise<void> {
    const currentStyle = this.currentStyle.left
    const target = currentStyle - this.style.left
    this.#translateXEffect.cancelTransitions()
    const update = (value: number) => this.translateX = value

    await this.#translateXEffect.createTransition(
      this.translateX, target,
      Math.abs(target - this.translateX) / DISTANCE_FOR_DURATION * duration, 'easeOut',
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

  async activeIn(): Promise<void> {
    if (!this.active) {
      this.active = true
      await this._processTransition(DURATION, 'activeIn')
    }
  }

  async activeOut () {
    if (this.active) {
      this.active = false
      await this._processTransition(2 * DURATION, 'activeOut')
    }
  }

  set offsetX(offsetX: number) {
    this.#offsetX = Math.round(offsetX)
  }

  get offsetX(): number {
    return this.#offsetX
  }

  updateEffect(now: number): void {
    super.updateEffect(now)
    this.#flashLight.updateEffect(now)
    this.#translateXEffect.updateEffect(now)
    this.#offsetXEffect.updateEffect(now)
  }

  cancelEffect(): void {
    super.cancelEffect()
    this.#flashLight.cancelEffect()
    this.#translateXEffect.cancelEffect()
    this.#offsetXEffect.cancelEffect()
  }

  render(context: CanvasRenderingContext2D): void {
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
      context.strokeRect(this.offsetX, this.y, w, h)

      context.strokeStyle = '#00f'
      context.strokeRect(x - 2, y - 2, w + 4, h + 4)
      context.strokeStyle = undefined
      context.restore()
    }
  }

  abstract renderByStyle(context: CanvasRenderingContext2D, left: number, top: number, width: number, height: number): void

  get currentStyle(): Style {
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

  get activeStyle(): Style {
    return this.#activeStyle
  }

  get activeHoverStyle(): Style {
    return this.#activeHoverStyle
  }

  get hoverStyle(): Style {
    return this.#hoverStyle
  }

  get style(): Style {
    return this.#style
  }

  rect(): [number, number, number, number] {
    // console.log(this.scrollX)
    return [
      Math.round(this.offsetX - this.scrollX + this.translateX),
      Math.round(this.offsetY - this.scrollY + this.translateY),
      this.currentStyle.width,
      this.currentStyle.height,
    ]
  }
}
