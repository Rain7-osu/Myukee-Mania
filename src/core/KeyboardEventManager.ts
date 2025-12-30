import { dev } from './dev'
import { KeyCode } from './KeyCode'

type KeyboardEventHandler = (e: KeyboardEvent) => void

const preventDefaultMaps = [
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
  #keydownEventList: Record<string, KeyboardEventHandler> = {}
  #keyupEventList: Record<string, KeyboardEventHandler> = {}
  #keypressEventList: Record<string, KeyboardEventHandler> = {}

  #hasRegister: boolean = false

  #disabled: boolean = false

  #invokeKeydownEventHandler = (e: KeyboardEvent) => {
    const key = e.code
    if (this.#disabled) return
    dev.debug(`[Keydown]: ${key}`)
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    if (this.#keydownEventList[key]) {
      this.#keydownEventList[key](e)
    } else {
      dev.debug(`No keydown handler registered for key: ${key}`)
    }
  }
  #invokeKeyupEventHandler = (e: KeyboardEvent) => {
    const key = e.code
    if (this.#disabled) return
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    dev.debug(`[Keyup]: ${key}`)
    if (this.#keyupEventList[key]) {
      this.#keyupEventList[key](e)
    } else {
      dev.debug(`No keyup handler registered for key: ${key}`)
    }
  }
  #invokeKeypressEventHandler = (e: KeyboardEvent) => {
    const key = e.code
    if (this.#disabled) return
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    dev.debug(`[Keypress]: ${key}`)
    if (this.#keypressEventList[key]) {
      this.#keypressEventList[key](e)
    } else {
      dev.debug(`No keypress handler registered for key: ${key}`)
    }
  }

  registerEvents ({
    keydownEventList = {},
    keyupEventList = {},
    keypressEventList = {},
  }: {
    keydownEventList?: Record<string, KeyboardEventHandler>
    keyupEventList?: Record<string, KeyboardEventHandler>
    keypressEventList?: Record<string, KeyboardEventHandler>
  }): void {
    this.#keydownEventList = keydownEventList
    this.#keyupEventList = keyupEventList
    this.#keypressEventList = keypressEventList

    if (!this.#hasRegister) {
      document.addEventListener('keydown', this.#invokeKeydownEventHandler)
      document.addEventListener('keyup', this.#invokeKeyupEventHandler)
      document.addEventListener('keypress', this.#invokeKeypressEventHandler)
    }
  }

  removeEvents (): void {
    this.#keypressEventList = {}
    this.#keydownEventList = {}
    this.#keyupEventList = {}
  }

  disableEvents (): void {
    this.#disabled = true
  }

  enableEvents (): void {
    this.#disabled = false
  }

  dispose (): void {
    if (this.#hasRegister) {
      document.removeEventListener('keydown', this.#invokeKeydownEventHandler)
      document.removeEventListener('keyup', this.#invokeKeyupEventHandler)
      document.removeEventListener('keypress', this.#invokeKeypressEventHandler)
    }
  }
}
