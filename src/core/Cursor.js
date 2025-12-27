import { $ } from './dom'

export class Cursor {
  /**
   * @type {HTMLElement}
   */
  #el

  #visible = true

  constructor () {
    this.#el = $('custom-cursor')
  }

  hide () {
    this.#el.style.opacity = '0'
    this.#visible = false
  }

  show () {
    this.#el.style.opacity = '1'
    this.#visible = false
  }

  get visible() {
    return this.#visible
  }
}
