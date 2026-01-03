import { $ } from '../_common/dom';

export class Cursor {
  private _el: HTMLElement

  private _visible: boolean = true

  constructor() {
    this._el = $('custom-cursor')!
  }

  hide() {
    this._el.style.opacity = '0'
    this._visible = false
  }

  show() {
    this._el.style.opacity = '1'
    this._visible = false
  }

  get visible(): boolean {
    return this._visible
  }
}
