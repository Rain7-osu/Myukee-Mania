import { LayoutObject, type LayoutStyle } from './LayoutObject';
import { type MouseEventHandlerMap, MouseEventManager } from '../MouseEventManager';
import { LOG_LEVEL } from '@rsbuild/core/dist-types/client/log';

export interface ElementEvent {
  offsetX: number
  offsetY: number
  clientX: number
  clientY: number
}

export interface ElementMouseEventMap {
  click: ElementEvent
  mousemove: ElementEvent
  mouseup: ElementEvent
  mousedown: ElementEvent
  mouseenter: ElementEvent
  mouseleave: ElementEvent
  globalMousemove: ElementEvent
  globalMouseup: ElementEvent
  globalMousedown: ElementEvent
  globalClick: ElementEvent
}

export type ElementEventHandler = (e: ElementEvent) => void

export class Element extends LayoutObject {
  private _mouseEventManager: MouseEventManager

  private _isMouseIn = false

  private _eventMaps: Record<keyof ElementMouseEventMap, ElementEventHandler[]> = {
    click: [],
    mousemove: [],
    mouseup: [],
    mousedown: [],
    mouseenter: [],
    mouseleave: [],
    globalMousemove: [],
    globalMouseup: [],
    globalMousedown: [],
    globalClick: [],
  };

  protected constructor(container: HTMLCanvasElement, layout?: LayoutStyle) {
    super(container, layout);
    this._mouseEventManager = new MouseEventManager(container, 'Element')
  }

  private _dispatchEvent(eventName: keyof ElementMouseEventMap, e: ElementEvent) {
    this._eventMaps[eventName].forEach(handler => handler(e))
  }

  private _initEvents() {
    const checkEvent = (e: MouseEvent) => {
      const [x, y, w, h] = this.rect()
      const offsetX = e.offsetX - x
      const offsetY = e.offsetY - y

      const isMouseIn = offsetX > 0 && offsetX < w
        && offsetY > 0 && offsetY < h

      return {
        offsetX,
        offsetY,
        isMouseIn,
        clientX: e.offsetX,
        clientY: e.offsetY,
      }
    }

    this._mouseEventManager.registerEvents({
      mousemoveEvents: [
        (e: MouseEvent) => {
          const { isMouseIn, ...elementEvent } = checkEvent(e)

          if (!this._isMouseIn && isMouseIn) {
            this._isMouseIn = true
            this._dispatchEvent('mouseenter', elementEvent)
          } else if (this._isMouseIn && !isMouseIn) {
            this._isMouseIn = false
            this._dispatchEvent('mouseleave', elementEvent)
          }

          if (isMouseIn) {
            this._dispatchEvent('mousemove', elementEvent)
          }
          this._dispatchEvent('globalMousemove', elementEvent)
        },
      ],
      mousedownEvents: [
        e => {
          const { isMouseIn, ...elementEvent } = checkEvent(e)

          if (isMouseIn) {
            this._dispatchEvent('mousedown', elementEvent)
          }
          this._dispatchEvent('globalMousedown', elementEvent)
        },
      ],
      mouseupEvents: [
        e => {
          const { isMouseIn, ...elementEvent } = checkEvent(e)

          if (isMouseIn) {
            this._dispatchEvent('mouseup', elementEvent)
          }
          this._dispatchEvent('globalMouseup', elementEvent)
        },
      ],
      clickEvents: [
        e => {
          const { isMouseIn, ...elementEvent } = checkEvent(e)

          if (isMouseIn) {
            this._dispatchEvent('click', elementEvent)
          }
          this._dispatchEvent('globalClick', elementEvent)
        },
      ],
    })
  }

  private _hasInit = false

  addEventListener<EventName extends keyof ElementMouseEventMap>(eventName: EventName, handler: ElementEventHandler) {
    if (!this._hasInit) {
      this._hasInit = true
      this._initEvents()
    }
    this._eventMaps[eventName].push(handler)
  }

  removeEventListener<EventName extends keyof MouseEventHandlerMap>(eventName: EventName, handler: ElementEventHandler) {
    this._eventMaps[eventName] = this._eventMaps[eventName].filter(h => h !== handler)
  }

  removeAllEventsListeners() {
    this._eventMaps = {
      click: [],
      mousemove: [],
      mouseup: [],
      mousedown: [],
      mouseenter: [],
      mouseleave: [],
      globalMousemove: [],
      globalMouseup: [],
      globalMousedown: [],
      globalClick: [],
    }
  }

  override render(context: CanvasRenderingContext2D) {}
}
