/**
 * @callback MouseEventHandler
 * @param {MouseEvent} e
 */

/**
 * @typedef {Object} EventsMaps
 * @property {MouseEventHandler[]?} mousemoveEvents
 * @property {MouseEventHandler[]?} clickEvents
 * @property {MouseEventHandler[]?} wheelEvents
 * @property {MouseEventHandler[]?} mouseDownEvents
 * @property {MouseEventHandler[]?} mouseupEvents
 */

import { RenderObject } from './RenderObject'
import { dev } from './dev'
import { CANVAS } from './Config'

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

  _buildEvent(e) {
    return {
      ...e,
      clientX: e.clientX - CANVAS.CLIENT_X,
      clientY: e.clientY - CANVAS.CLIENT_Y,
      preventDefault: e.preventDefault.bind(e),
      stopPropagation: e.stopPropagation.bind(e),
      deltaY: e.deltaY,
      deltaX: e.deltaX,
    }
  }

  /**
   * @param e {MouseEvent}
   */
  #invokeMousemoveEventHandler = e => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'mousemove', e)
    this.#mousemoveEvents.forEach(handler => handler(this._buildEvent(e)))
  }
  /**
   * @param e {MouseEvent}
   */
  #invokeWheelEventHandler = e => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'wheel', e)
    this.#wheelEvents.forEach(handler => handler(this._buildEvent(e)))
  }
  /**
   * @param e {MouseEvent}
   */
  #invokeClickEventHandler = e => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'click', e)
    if (this.#shapeEvents) {
      ![...this.#shapeEvents.values()].forEach(handler => handler(this._buildEvent(e)))
    }
    this.#clickEvents.forEach(handler => handler(this._buildEvent(e)))
  }
  #invokeMouseDownEventHandler = e => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'mousedown', e)
    this.#mousedownEvents.forEach(handler => handler(this._buildEvent(e)))
  }
  #invokeMouseUpEventHandler = e => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'mouseup', e)
    this.#mouseupEvents.forEach(handler => handler(this._buildEvent(e)))
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
    this.#shapeEvents.set(shape, e => {
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
   * @param maps {EventsMaps}
   */
  registerEvents (maps) {
    const {
      mousemoveEvents = [],
      clickEvents = [],
      wheelEvents = [],
      mouseupEvents = [],
      mousedownEvents = [],
    } = maps
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

  disableEvents () {
    this.#disabled = true
  }

  enableEvents () {
    this.#disabled = false
  }
}
