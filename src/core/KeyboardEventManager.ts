import { dev } from './dev'
import { KeyCode } from './KeyCode'

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
]

export class KeyboardEventManager {
  private _keydownEventList: Record<string, KeyboardEventHandler> = {}
  private _keyupEventList: Record<string, KeyboardEventHandler> = {}
  private _keypressEventList: Record<string, KeyboardEventHandler> = {}

  private _hasRegister: boolean = false

  private _disabled: boolean = false

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
  private _invokeKeypressEventHandler = (e: KeyboardEvent) => {
    const key = e.code
    if (this._disabled) return
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    dev.debug(`[Keypress]: ${key}`)
    if (this._keypressEventList[key]) {
      this._keypressEventList[key](e)
    } else {
      dev.debug(`No keypress handler registered for key: ${key}`)
    }
  }

  registerEvents({
    keydownEventList = {},
    keyupEventList = {},
    keypressEventList = {},
  }: {
    keydownEventList?: Record<string, KeyboardEventHandler>
    keyupEventList?: Record<string, KeyboardEventHandler>
    keypressEventList?: Record<string, KeyboardEventHandler>
  }): void {
    this._keydownEventList = keydownEventList
    this._keyupEventList = keyupEventList
    this._keypressEventList = keypressEventList

    if (!this._hasRegister) {
      document.addEventListener('keydown', this._invokeKeydownEventHandler)
      document.addEventListener('keyup', this._invokeKeyupEventHandler)
      document.addEventListener('keypress', this._invokeKeypressEventHandler)
    }
  }

  removeEvents(): void {
    this._keypressEventList = {}
    this._keydownEventList = {}
    this._keyupEventList = {}
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
      document.removeEventListener('keypress', this._invokeKeypressEventHandler)
    }
  }
}
