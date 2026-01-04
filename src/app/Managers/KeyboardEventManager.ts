import { KeyCode } from '../Enums/KeyCode'
import { dev } from '../_common/dev';

export type KeyboardEventHandler = (e: KeyboardEvent) => void


const preventDefaultMaps: string[] = [
  KeyCode.F1,
  KeyCode.F2,
  KeyCode.F3,
  KeyCode.F4,
  KeyCode.F5,
  KeyCode.F6,
  KeyCode.F7,
  KeyCode.F8,
  KeyCode.O,
  KeyCode.SPACE,
  KeyCode.W,
  KeyCode.ARROW_LEFT,
  KeyCode.ARROW_RIGHT,
  KeyCode.ARROW_UP,
  KeyCode.ARROW_DOWN,
]

export class KeyboardEventManager {
  private _keydownEventList: Record<string, KeyboardEventHandler> = {}
  private _keyupEventList: Record<string, KeyboardEventHandler> = {}
  private _compositionStart: (e: CompositionEvent) => void = null
  private _compositionUpdate: (e: CompositionEvent) => void = null
  private _compositionEnd: (e: CompositionEvent) => void = null

  private _hasRegister: boolean = false

  private _disabled: boolean = false

  private _container: Node

  constructor(container?: Node) {
    this._container = container || document
  }

  private _invokeKeydownEventHandler = (e: KeyboardEvent) => {
    const key = e.code
    if (this._disabled) return
    dev.debug(`[Keydown]: ${key}`)
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    if (this._keydownEventList[key]) {
      this._keydownEventList[key](e)
    } else {
      dev.debug(`No keydown handler registered for key: ${key}`)
    }
  }
  private _invokeKeyupEventHandler = (e: KeyboardEvent) => {
    const key = e.code
    if (this._disabled) return
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    dev.debug(`[Keyup]: ${key}`)
    if (this._keyupEventList[key]) {
      this._keyupEventList[key](e)
    } else {
      dev.debug(`No keyup handler registered for key: ${key}`)
    }
  }

  private _invokeCompositionStartHandler = (e: CompositionEvent) => {
    if (this._disabled) return
    this._compositionStart?.(e)
    dev.debug(`[Composition]: ${e}`)
  }

  private _invokeCompositionUpdateHandler = (e: CompositionEvent) => {
    if (this._disabled) return
    this._compositionUpdate?.(e)
    dev.debug(`[Composition]: ${e}`)
  }

  private _invokeCompositionEndHandler = (e: CompositionEvent) => {
    if (this._disabled) return
    this._compositionEnd?.(e)
    dev.debug(`[Composition]: ${e}`)
  }

  registerEvents({
    keydownEventList = {},
    keyupEventList = {},
    compositionStart = null,
    compositionUpdate = null,
    compositionEnd = null
  }: {
    keydownEventList?: Record<string, KeyboardEventHandler>
    keyupEventList?: Record<string, KeyboardEventHandler>
    compositionStart?: (e: CompositionEvent) => void
    compositionUpdate?: (e: CompositionEvent) => void
    compositionEnd?: (e: CompositionEvent) => void
  }): void {
    this._keydownEventList = keydownEventList
    this._keyupEventList = keyupEventList
    this._compositionStart = compositionStart
    this._compositionUpdate = compositionUpdate
    this._compositionEnd = compositionEnd

    if (!this._hasRegister) {
      document.addEventListener('keydown', this._invokeKeydownEventHandler)
      document.addEventListener('keyup', this._invokeKeyupEventHandler)
      this._container.addEventListener('compositionstart', this._invokeCompositionStartHandler)
      this._container.addEventListener('compositionupdate', this._invokeCompositionUpdateHandler)
      this._container.addEventListener('compositionend', this._invokeCompositionEndHandler)
    }
  }

  removeEvents(): void {
    this._keydownEventList = {}
    this._keyupEventList = {}
    this._compositionEnd = null
    this._compositionStart = null
    this._compositionUpdate = null
  }

  disableEvents(): void {
    this._disabled = true
  }

  enableEvents(): void {
    this._disabled = false
  }

  dispose(): void {
    if (this._hasRegister) {
      document.removeEventListener('keydown', this._invokeKeydownEventHandler)
      document.removeEventListener('keyup', this._invokeKeyupEventHandler)
      this._container.removeEventListener('compositionstart', this._invokeCompositionStartHandler)
      this._container.removeEventListener('compositionupdate', this._invokeCompositionUpdateHandler)
      this._container.removeEventListener('compositionend', this._invokeCompositionEndHandler)
    }
  }
}
