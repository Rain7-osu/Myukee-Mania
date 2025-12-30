import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { ActiveEffect } from './ActiveEffect'
import { FlashLightEffect } from './FlashLightEffect'
import { dev } from './dev';

const DURATION = 600
const DISTANCE_FOR_DURATION = 200

interface Style {
  marginTop: number;
  marginBottom: number;
  width: number;
  height: number;
  left: number;
}

export abstract class ScrollItem<T extends ScrollItem = ScrollItem> extends RenderObject {
  private _flashLight = new FlashLightEffect()

  private _style: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  private _hoverStyle: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  private _activeStyle: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  private _activeHoverStyle: Style = {
    marginTop: 0,
    marginBottom: 0,
    width: 0,
    height: 0,
    left: 0,
  }

  private _hovered: boolean = false

  private _active: boolean = false

  private _offsetY: number = 0

  private _offsetX: number = 0

  private _scrollY: number = 0

  private _scrollX: number = 0

  private _translateY: number = 0

  private _translateX: number = 0

  private _translateXEffect = new ActiveEffect()

  private _offsetXEffect = new ActiveEffect()

  get offsetXEffect(): ActiveEffect { return this._offsetXEffect }

  set translateY(y: number) {
    this._translateY = Math.round(y)
  }

  get translateY(): number {
    return this._translateY
  }

  set translateX(x: number) {
    this._translateX = Math.round(x)
  }

  get translateX(): number {
    return this._translateX
  }

  private _next: T | null = null

  set next(next: T | null) {
    this._next = next
  }

  get next(): T | null {
    return this._next
  }

  private _last: T | null = null

  set last(last: T | null) {
    this._last = last
  }

  get last(): T | null {
    return this._last
  }

  set style(style: Style) {
    this._style = style
  }

  set hoverStyle(style: Style) {
    this._hoverStyle = style
  }

  set activeStyle(style: Style) {
    this._activeStyle = style
  }

  set activeHoverStyle(style: Style) {
    this._activeHoverStyle = style
  }

  set offsetY(offsetY: number) {
    this._offsetY = Math.round(offsetY)
  }

  set scrollY(scrollY: number) {
    this._scrollY = Math.round(scrollY)
  }

  get scrollY(): number {
    return this._scrollY
  }

  set scrollX(x: number) {
    this._scrollX = Math.round(x)
  }

  get scrollX(): number {
    return this._scrollX
  }

  get y(): number {
    return this._offsetY - this._scrollY
  }

  get x(): number {
    return this._offsetX + this._style.left
  }

  get offsetY(): number {
    return this._offsetY
  }

  set hovered(val: boolean) {
    this._hovered = val
  }

  get hovered(): boolean {
    return this._hovered
  }

  set active(val: boolean) {
    this._active = val
  }

  get active(): boolean {
    return this._active
  }

  private async _processTransition(duration: number = DURATION, phase: string): Promise<void> {
    const currentStyle = this.currentStyle.left
    const target = currentStyle - this.style.left
    this._translateXEffect.cancelTransitions()
    dev.debug(phase)
    const update = (value: number) => this.translateX = value

    await this._translateXEffect.createTransition(
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
        !this.active && this._flashLight.flash(10),
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
    this._offsetX = Math.round(offsetX)
  }

  get offsetX(): number {
    return this._offsetX
  }

  updateEffect(now: number): void {
    super.updateEffect(now)
    this._flashLight.updateEffect(now)
    this._translateXEffect.updateEffect(now)
    this._offsetXEffect.updateEffect(now)
  }

  cancelEffect(): void {
    super.cancelEffect()
    this._flashLight.cancelEffect()
    this._translateXEffect.cancelEffect()
    this._offsetXEffect.cancelEffect()
  }

  render(context: CanvasRenderingContext2D): void {
    const rect = this.rect()
    const [x, y, w, h] = rect
    if (y > CANVAS.HEIGHT || y + h < 0) {
      return
    }

    this.renderByStyle(context, x, y, w, h)
    this._flashLight.area = rect
    this._flashLight.render(context)

    // if (__SHOW_SCROLL_BOX__) {
    //   context.save()
    //   context.strokeStyle = '#f00'
    //   context.lineWidth = 2
    //   context.strokeRect(this.offsetX, this.y, w, h)
    //
    //   context.strokeStyle = '#00f'
    //   context.strokeRect(x - 2, y - 2, w + 4, h + 4)
    //   context.strokeStyle = undefined
    //   context.restore()
    // }
  }

  abstract renderByStyle(context: CanvasRenderingContext2D, left: number, top: number, width: number, height: number): void

  get currentStyle(): Style {
    let style
    if (this.active && this.hovered) {
      style = this._activeHoverStyle
    } else if (this.active) {
      style = this._activeStyle
    } else if (this.hovered) {
      style = this._hoverStyle
    } else {
      style = this._style
    }
    return style
  }

  get activeStyle(): Style {
    return this._activeStyle
  }

  get activeHoverStyle(): Style {
    return this._activeHoverStyle
  }

  get hoverStyle(): Style {
    return this._hoverStyle
  }

  get style(): Style {
    return this._style
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
