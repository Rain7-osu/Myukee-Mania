/**
 * @callback MouseEventHandler
 * @param {MouseEvent} e
 */

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

  #hasRegistered = false

  #source = 'global'

  /**
   * @param container {HTMLElement}
   * @param source {string}
   */
  constructor (container, source) {
    this.#container = container
    this.#source = source
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
  registerEvents ({
    mousemoveEvents = [],
    clickEvents = [],
    wheelEvents = [],
  }) {
    this.#clickEvents = clickEvents
    this.#mousemoveEvents = mousemoveEvents
    this.#wheelEvents = wheelEvents

    if (!this.#hasRegistered) {
      const container = this.#container
      container.addEventListener('click', this.#invokeClickEventHandler)
      container.addEventListener('wheel', this.#invokeWheelEventHandler)
      container.addEventListener('mousemove', this.#invokeMousemoveEventHandler)
      this.#hasRegistered = true
    }
  }

  removeEvents () {
    if (this.#hasRegistered) {
      const container = this.#container
      container.addEventListener('click', this.#invokeClickEventHandler)
      container.addEventListener('wheel', this.#invokeWheelEventHandler)
      container.addEventListener('mousemove', this.#invokeMousemoveEventHandler)
      this.#hasRegistered = false
    }
  }
}
