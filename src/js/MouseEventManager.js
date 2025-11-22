/**
 * @callback MouseEventHandler
 * @param {MouseEvent} e
 */
import { $ } from './dom'

export class MouseEventManager {
  /**
   * @type {MouseEventHandler[]}
   */
  #mousemoveEvents = []
  /**
   * @type {MouseEventHandler[]}
   */
  #wheelEvents = []
  /**
   * @type {MouseEventHandler[]}
   */
  #clickEvents = []

  /**
   * @type {HTMLElement}
   */
  #container

  /**
   * @param container {HTMLElement}
   */
  constructor (container) {
    this.#container = container
  }

  /**
   * @param e {MouseEvent}
   */
  #invokeMousemoveEventHandler = (e) => {
    e.preventDefault()
    this.#mousemoveEvents.forEach(handler => handler(e))
  }
  /**
   * @param e {MouseEvent}
   */
  #invokeWheelEventHandler = (e) => {
    e.preventDefault()
    this.#wheelEvents.forEach(handler => handler(e))
  }
  /**
   * @param e {MouseEvent}
   */
  #invokeClickEventHandler = (e) => {
    e.preventDefault()
    this.#clickEvents.forEach(handler => handler(e))
  }

  /**
   * @param mousemoveEvents {MouseEventHandler[]}
   * @param clickEvents {MouseEventHandler[]}
   * @param wheelEvents {MouseEventHandler[]}
   */
  registerEvents({
    mousemoveEvents = [],
    clickEvents = [],
    wheelEvents = []
  }) {
    this.#clickEvents = clickEvents
    this.#mousemoveEvents = mousemoveEvents
    this.#wheelEvents = wheelEvents

    const container = this.#container
    container.addEventListener('click', this.#invokeClickEventHandler)
    container.addEventListener('wheel', this.#invokeWheelEventHandler)
    container.addEventListener('mousemove', this.#invokeMousemoveEventHandler)
  }

  removeEvents() {
    const container = this.#container
    container.addEventListener('click', this.#invokeClickEventHandler)
    container.addEventListener('wheel', this.#invokeWheelEventHandler)
    container.addEventListener('mousemove', this.#invokeMousemoveEventHandler)
  }
}
