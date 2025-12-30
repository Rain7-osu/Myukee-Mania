import { RenderObject } from './RenderObject'
import { dev } from './dev'
import { CANVAS } from './Config'

export type MouseEventHandler = (e: MouseEvent) => void

export interface EventsMaps {
  mousemoveEvents?: MouseEventHandler[]
  clickEvents?: MouseEventHandler[]
  wheelEvents?: MouseEventHandler[]
  mouseDownEvents?: MouseEventHandler[]
  mouseupEvents?: MouseEventHandler[]
}

export class MouseEventManager {
  private _mousemoveEvents: MouseEventHandler[] = []
  private _wheelEvents: MouseEventHandler[] = []
  private _clickEvents: MouseEventHandler[] = []
  private _mousedownEvents: MouseEventHandler[] = []
  private _mouseupEvents: MouseEventHandler[] = []

  private _shapeEvents: Map<RenderObject, MouseEventHandler>

  private readonly _container: HTMLElement

  private _hasRegistered = false

  private readonly _source = 'global'

  private _disabled = false

  constructor(container: HTMLElement, source: string) {
    this._container = container
    this._source = source
  }

  private _buildMouseEvent(e: MouseEvent) {
    return {
      ...e,
      clientX: e.clientX - CANVAS.CLIENT_X,
      clientY: e.clientY - CANVAS.CLIENT_Y,
      preventDefault: e.preventDefault.bind(e),
      stopPropagation: e.stopPropagation.bind(e),
    }
  }

  private _buildWheelEvent(e: WheelEvent) {
    return {
      ...this._buildMouseEvent(e),
      deltaY: e.deltaY,
      deltaX: e.deltaX,
    }
  }

  private _invokeWheelEventHandler = (e: WheelEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'wheel', e)
    this._wheelEvents.forEach(handler => handler(this._buildWheelEvent(e as any)))
  }

  private _invokeMousemoveEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'mousemove', e)
    this._mousemoveEvents.forEach(handler => handler(this._buildMouseEvent(e)))
  }

  private _invokeClickEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'click', e)
    if (this._shapeEvents) {
      [...this._shapeEvents.values()].forEach(handler => handler(this._buildMouseEvent(e)))
    }
    this._clickEvents.forEach(handler => handler(this._buildMouseEvent(e)))
  }

  private _invokeMouseDownEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'mousedown', e)
    this._mousedownEvents.forEach(handler => handler(this._buildMouseEvent(e)))
  }

  private _invokeMouseUpEventHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (this._disabled) return
    dev.debug(this._source, 'mouseup', e)
    this._mouseupEvents.forEach(handler => handler(this._buildMouseEvent(e)))
  }

  bind(shape: RenderObject, handler: MouseEventHandler): void {
    if (!this._shapeEvents) {
      this._shapeEvents = new Map()
    }
    const [x, y, w, h] = shape.hotArea
    this._shapeEvents.set(shape, e => {
      if (e.clientX > x && e.clientY > y && e.clientX < x + w && e.clientY < y + h) {
        handler(e)
      }
    })
  }

  remove(shape: RenderObject): void {
    this._shapeEvents.delete(shape)
  }

  registerEvents(maps: EventsMaps): void {
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
