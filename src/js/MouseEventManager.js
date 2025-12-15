/**
 * @callback MouseEventHandler
 * @param {MouseEvent} e
 */
import { RenderObject } from './RenderObject'
import { dev } from './dev'

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
   * @type {MouseEventHandler[]}
   */
  #mousedownEvents = []
  /**
   * @type {MouseEventHandler[]}
   */
  #mouseupEvents = []

  /**
   * @type {Map<RenderObject, MouseEventHandler>}
   */
  #shapeEvents

  /**
   * @type {HTMLElement}
   */
  #container

  #hasRegistered = false

  #source = 'global'

  #disabled = false

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
    if (this.#disabled) return
    dev.log(this.#source, 'mousemove', e)
    this.#mousemoveEvents.forEach(handler => handler(e))
  }
  /**
   * @param e {MouseEvent}
   */
  #invokeWheelEventHandler = (e) => {
    e.preventDefault()
    if (this.#disabled)  return
    dev.log(this.#source, 'wheel', e)
    this.#wheelEvents.forEach(handler => handler(e))
  }
  /**
   * @param e {MouseEvent}
   */
  #invokeClickEventHandler = (e) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.log(this.#source, 'click', e)
    if (this.#shapeEvents) {
      ![...this.#shapeEvents.values()].forEach(handler => handler(e))
    }
    this.#clickEvents.forEach(handler => handler(e))
  }
  #invokeMouseDownEventHandler = (e) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.log(this.#source, 'mousedown', e)
    this.#mousedownEvents.forEach(handler => handler(e))
  }
  #invokeMouseUpEventHandler = (e) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.log(this.#source, 'mouseup', e)
    this.#mouseupEvents.forEach(handler => handler(e))
  }

  /**
   * @param shape {RenderObject}
   * @param handler {MouseEventHandler}
   */
  bind (shape, handler) {
    if (!this.#shapeEvents) {
      this.#shapeEvents = new Map()
    }
    const [x, y, w, h] = shape.hotArea
    this.#shapeEvents.set(shape, (e) => {
      if (e.clientX > x && e.clientY > y && e.clientX < x + w && e.clientY < y + h) {
        handler(e)
      }
    })
  }

  /**
   * @param shape {RenderObject}
   */
  remove (shape) {
    this.#shapeEvents.delete(shape)
  }

  /**
   * @param mousemoveEvents {MouseEventHandler[]?}
   * @param clickEvents {MouseEventHandler[]?}
   * @param wheelEvents {MouseEventHandler[]?}
   * @param mouseDownEvents {MouseEventHandler[]?}
   * @param mouseupEvents {MouseEventHandler[]?}
   */
  registerEvents ({
    mousemoveEvents = [],
    clickEvents = [],
    wheelEvents = [],
    mouseupEvents = [],
    mousedownEvents = [],
  }) {
    this.#clickEvents = clickEvents
    this.#mousemoveEvents = mousemoveEvents
    this.#wheelEvents = wheelEvents
    this.#mousedownEvents = mousedownEvents
    this.#mouseupEvents = mouseupEvents

    if (!this.#hasRegistered) {
      const container = this.#container
      container.addEventListener('click', this.#invokeClickEventHandler)
      container.addEventListener('wheel', this.#invokeWheelEventHandler)
      container.addEventListener('mousemove', this.#invokeMousemoveEventHandler)
      container.addEventListener('mouseup', this.#invokeMouseUpEventHandler)
      container.addEventListener('mousedown', this.#invokeMouseDownEventHandler)
      this.#hasRegistered = true
    }
  }

  removeEvents () {
    if (this.#hasRegistered) {
      this.#clickEvents = []
      this.#mousemoveEvents = []
      this.#wheelEvents = []

      const container = this.#container
      container.addEventListener('click', this.#invokeClickEventHandler)
      container.addEventListener('wheel', this.#invokeWheelEventHandler)
      container.addEventListener('mousemove', this.#invokeMousemoveEventHandler)
      container.addEventListener('mouseup', this.#invokeMousemoveEventHandler)
      container.addEventListener('mousedown', this.#invokeMouseDownEventHandler)
      this.#hasRegistered = false
    }
  }

  dispose() {

  }

  disableEvents() {
    this.#disabled = true
  }

  enableEvents() {
    this.#disabled = false
  }
}
