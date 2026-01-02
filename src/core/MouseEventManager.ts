import { RenderObject } from './RenderObject'
import { dev } from './dev'

export type MouseEventHandler = (e: MouseEvent) => void
export type WheelEventHandler = (e: WheelEvent) => void

export interface MouseEventMap {
  mousemove: MouseEvent
  click: MouseEvent
  wheel: WheelEvent
  mousedown: MouseEvent
  mouseup: MouseEvent
}

export interface MouseEventHandlerMap {
  mousemove: MouseEventHandler
  click: MouseEventHandler
  wheel: WheelEventHandler
  mousedown: MouseEventHandler
  mouseup: MouseEventHandler
}

export interface MouseEventsMaps {
  mousemoveEvents?: MouseEventHandler[]
  clickEvents?: MouseEventHandler[]
  wheelEvents?: WheelEventHandler[]
  mousedownEvents?: MouseEventHandler[]
  mouseupEvents?: MouseEventHandler[]
}

export class MouseEventManager {
  private _mousemoveEvents: MouseEventHandler[] = []
  private _wheelEvents: WheelEventHandler[] = []
  private _clickEvents: MouseEventHandler[] = []
  private _mousedownEvents: MouseEventHandler[] = []
  private _mouseupEvents: MouseEventHandler[] = []

  private _shapeEvents: Map<RenderObject, MouseEventHandler | WheelEventHandler>

  private readonly _container: HTMLElement

  private _hasRegistered = false

  private readonly _source = 'global'

  private _disabled = false

  constructor(container: HTMLElement, source: string) {
    this._container = container
    this._source = source
  }

  private _invokeWheelEventHandler = (e: WheelEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'wheel', e)
    this._wheelEvents.forEach(handler => handler(e))
  }

  private _invokeMousemoveEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'mousemove', e)
    this._mousemoveEvents.forEach(handler => handler(e))
  }

  private _invokeClickEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'click', e)
    if (this._shapeEvents) {
      [...this._shapeEvents.values()].forEach(handler => handler(e))
    }
    this._clickEvents.forEach(handler => handler(e))
  }

  private _invokeMouseDownEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'mousedown', e)
    this._mousedownEvents.forEach(handler => handler(e))
  }

  private _invokeMouseUpEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'mouseup', e)
    this._mouseupEvents.forEach(handler => handler(e))
  }

  bind(shape: RenderObject, handler: MouseEventHandler): void {
    if (!this._shapeEvents) {
      this._shapeEvents = new Map()
    }
    const [x, y, w, h] = shape.hotArea
    this._shapeEvents.set(shape, e => {
      if (e.offsetX > x && e.offsetY > y && e.offsetX < x + w && e.offsetY < y + h) {
        handler(e)
      }
    })
  }

  remove(shape: RenderObject): void {
    this._shapeEvents.delete(shape)
  }

  addEventListener<EventName extends keyof MouseEventHandlerMap>(eventName: EventName, handler: MouseEventHandlerMap[EventName]) {
    switch (eventName) {
      case 'mousemove':
        this._mousemoveEvents.push(handler as MouseEventHandler)
        break
      case 'click':
        this._clickEvents.push(handler as MouseEventHandler)
        break
      case 'wheel':
        this._wheelEvents.push(handler as WheelEventHandler)
        break
      case 'mousedown':
        this._mousedownEvents.push(handler as MouseEventHandler)
        break
      case 'mouseup':
        this._mouseupEvents.push(handler as MouseEventHandler)
        break
    }
  }

  removeEventListener<EventName extends keyof MouseEventHandlerMap>(eventName: EventName, handler: MouseEventHandlerMap[EventName]) {
    switch (eventName) {
      case 'mousemove':
        this._mousemoveEvents = this._mousemoveEvents.filter(h => h !== handler)
        break
      case 'click':
        this._clickEvents = this._clickEvents.filter(h => h !== handler)
        break
      case 'wheel':
        this._wheelEvents = this._wheelEvents.filter(h => h !== handler)
        break
      case 'mousedown':
        this._mousedownEvents = this._mousedownEvents.filter(h => h !== handler)
        break
      case 'mouseup':
        this._mouseupEvents = this._mouseupEvents.filter(h => h !== handler)
        break
    }
  }

  registerEvents(maps: MouseEventsMaps): void {
    const {
      mousemoveEvents = [],
      clickEvents = [],
      wheelEvents = [],
      mouseupEvents = [],
      mousedownEvents = [],
    } = maps
    this._clickEvents = clickEvents
    this._mousemoveEvents = mousemoveEvents
    this._wheelEvents = wheelEvents
    this._mousedownEvents = mousedownEvents
    this._mouseupEvents = mouseupEvents

    if (!this._hasRegistered) {
      const container = this._container
      container.addEventListener('click', this._invokeClickEventHandler)
      container.addEventListener('wheel', this._invokeWheelEventHandler)
      container.addEventListener('mousemove', this._invokeMousemoveEventHandler)
      container.addEventListener('mouseup', this._invokeMouseUpEventHandler)
      container.addEventListener('mousedown', this._invokeMouseDownEventHandler)
      this._hasRegistered = true
    }
  }

  removeEvents(): void {
    if (this._hasRegistered) {
      this._clickEvents = []
      this._mousemoveEvents = []
      this._wheelEvents = []
      this._mousedownEvents = []
      this._mouseupEvents = []

      const container = this._container
      container.removeEventListener('click', this._invokeClickEventHandler)
      container.removeEventListener('wheel', this._invokeWheelEventHandler)
      container.removeEventListener('mousemove', this._invokeMousemoveEventHandler)
      container.removeEventListener('mouseup', this._invokeMouseUpEventHandler)
      container.removeEventListener('mousedown', this._invokeMouseDownEventHandler)
      this._hasRegistered = false
    }
  }

  disableEvents(): void {
    this._disabled = true
  }

  enableEvents(): void {
    this._disabled = false
  }
}
