/**
 @callback KeyboardEventHandler
 @param {KeyboardEvent} e
 */
import { dev } from './dev'
import { KeyCode } from './KeyCode'

const preventDefaultMaps = [
  KeyCode.F1,
  KeyCode.F2,
  KeyCode.F3,
]

export class KeyboardEventManager {
  /**
   * @type {Record<KeyCode, KeyboardEventHandler>}
   */
  #keydownEventList = {}
  /**
   * @type {Record<KeyCode, KeyboardEventHandler>}
   */
  #keyupEventList = {}
  /**
   * @type {Record<KeyCode, KeyboardEventHandler>}
   */
  #keypressEventList = {}

  #hasRegister = false

  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeydownEventHandler = (e) => {
    const key = e.code
    dev.log(`[Keydown]: ${key}`)
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    if (this.#keydownEventList[key]) {
      this.#keydownEventList[key](e)
    } else {
      dev.warn(`No keydown handler registered for key: ${key}`)
    }
  }
  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeyupEventHandler = (e) => {
    const key = e.code
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    dev.log(`[Keyup]: ${key}`)
    if (this.#keyupEventList[key]) {
      this.#keyupEventList[key](e)
    } else {
      dev.warn(`No keyup handler registered for key: ${key}`)
    }
  }
  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeypressEventHandler = (e) => {
    const key = e.code
    if (preventDefaultMaps.includes(key)) {
      e.preventDefault()
    }
    dev.log(`[Keypress]: ${key}`)
    if (this.#keypressEventList[key]) {
      this.#keypressEventList[key](e)
    } else {
      dev.warn(`No keypress handler registered for key: ${key}`)
    }
  }

  /**
   * @param keydownEventList {Record<KeyCode, KeyboardEventHandler>?}
   * @param keyupEventList {Record<KeyCode, KeyboardEventHandler>?}
   * @param keypressEventList {Record<KeyCode, KeyboardEventHandler>?}
   */
  registerEvents ({
    keydownEventList = {},
    keyupEventList = {},
    keypressEventList = {},
  }) {
    this.#keydownEventList = keydownEventList
    this.#keyupEventList = keyupEventList
    this.#keypressEventList = keypressEventList

    if (!this.#hasRegister) {
      document.addEventListener('keydown', this.#invokeKeydownEventHandler)
      document.addEventListener('keyup', this.#invokeKeyupEventHandler)
      document.addEventListener('keypress', this.#invokeKeypressEventHandler)
    }
  }

  removeEvents () {
    this.#keypressEventList = {}
    this.#keydownEventList = {}
    this.#keyupEventList = {}
  }

  dispose () {
    if (this.#hasRegister) {
      document.removeEventListener('keydown', this.#invokeKeydownEventHandler)
      document.removeEventListener('keyup', this.#invokeKeyupEventHandler)
      document.removeEventListener('keypress', this.#invokeKeypressEventHandler)
    }
  }
}
