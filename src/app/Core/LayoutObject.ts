import { RenderObject } from './RenderObject';

export interface LayoutProps {
  width: number
  height: number
  offsetX: number
  offsetY: number
  translateX: number
  translateY: number
}

export abstract class LayoutObject extends RenderObject {
  protected container: HTMLElement

  private _layout: LayoutProps = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    translateX: 0,
    translateY: 0,
  }

  protected constructor(container: HTMLElement, layout?: Partial<LayoutProps>) {
    super()
    this.container = container
    Object.assign(this._layout, layout)
  }

  rect(): [number, number, number, number] {
    return [
      this._layout.offsetX + this._layout.translateX,
      this._layout.offsetY + this._layout.translateY,
      this._layout.width,
      this._layout.height,
    ]
  }

  get layout(): LayoutProps {
    return this._layout
  }

  set layout(style: LayoutProps) {
    this._layout = style
  }

  get width(): number {
    return this._layout.width
  }

  set width(value: number) {
    value >= 0 && (this._layout.width = Math.round(value))
  }

  get height(): number {
    return this._layout.height
  }

  set height(value: number) {
    value >= 0 && (this._layout.height = Math.round(value))
  }

  get offsetX(): number {
    return this._layout.offsetX
  }

  set offsetX(value: number) {
    this._layout.offsetX = Math.round(value)
  }

  get offsetY(): number {
    return this._layout.offsetY
  }

  set offsetY(value: number) {
    this._layout.offsetY = Math.round(value)
  }

  get translateX(): number {
    return this._layout.translateX
  }

  set translateX(value: number) {
    this._layout.translateX = Math.round(value)
  }

  get translateY(): number {
    return this._layout.translateY
  }

  set translateY(value: number) {
    this._layout.translateY = Math.round(value)
  }
}
