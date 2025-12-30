export type MouseEventHandler = (e: MouseEvent) => void

export interface EventsMaps {
  mousemoveEvents?: MouseEventHandler[]
  clickEvents?: MouseEventHandler[]
  wheelEvents?: MouseEventHandler[]
  mouseDownEvents?: MouseEventHandler[]
  mouseupEvents?: MouseEventHandler[]
}

import { RenderObject } from './RenderObject'
import { dev } from './dev'
import { CANVAS } from './Config'

export class MouseEventManager {
  #mousemoveEvents: MouseEventHandler[] = []
  #wheelEvents: MouseEventHandler[] = []
  #clickEvents: MouseEventHandler[] = []
  #mousedownEvents: MouseEventHandler[] = []
  #mouseupEvents: MouseEventHandler[] = []

  #shapeEvents: Map<RenderObject, MouseEventHandler>

  #container: HTMLElement

  #hasRegistered = false

  #source = 'global'

  #disabled = false

  constructor (container: HTMLElement, source: string) {
    this.#container = container
    this.#source = source
  }

  _buildEvent(e: MouseEvent) {
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

  #invokeMousemoveEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'mousemove', e)
    this.#mousemoveEvents.forEach(handler => handler(this._buildEvent(e)))
  }

  #invokeWheelEventHandler = (e: WheelEvent) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'wheel', e)
    this.#wheelEvents.forEach(handler => handler(this._buildEvent(e as any)))
  }

  #invokeClickEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'click', e)
    if (this.#shapeEvents) {
      [...this.#shapeEvents.values()].forEach(handler => handler(this._buildEvent(e)))
    }
    this.#clickEvents.forEach(handler => handler(this._buildEvent(e)))
  }

  #invokeMouseDownEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'mousedown', e)
    this.#mousedownEvents.forEach(handler => handler(this._buildEvent(e)))
  }

  #invokeMouseUpEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this.#disabled) return
    dev.debug(this.#source, 'mouseup', e)
    this.#mouseupEvents.forEach(handler => handler(this._buildEvent(e)))
  }

  bind (shape: RenderObject, handler: MouseEventHandler): void {
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

  remove (shape: RenderObject): void {
    this.#shapeEvents.delete(shape)
  }

  registerEvents (maps: EventsMaps): void {
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

  removeEvents (): void {
    if (this.#hasRegistered) {
      this.#clickEvents = []
      this.#mousemoveEvents = []
      this.#wheelEvents = []
      this.#mousedownEvents = []
      this.#mouseupEvents = []

      const container = this.#container
      container.removeEventListener('click', this.#invokeClickEventHandler)
      container.removeEventListener('wheel', this.#invokeWheelEventHandler)
      container.removeEventListener('mousemove', this.#invokeMousemoveEventHandler)
      container.removeEventListener('mouseup', this.#invokeMouseUpEventHandler)
      container.removeEventListener('mousedown', this.#invokeMouseDownEventHandler)
      this.#hasRegistered = false
    }
  }

  disableEvents (): void {
    this.#disabled = true
  }

  enableEvents (): void {
    this.#disabled = false
  }
}
