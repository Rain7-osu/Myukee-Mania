/**
 @callback KeyboardEventHandler
 @param {KeyboardEvent} e
 */

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

  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeydownEventHandler = (e) => {
    e.preventDefault()
    const key = e.code

    if (this.#keydownEventList[key]) {
      this.#keydownEventList[key](e)
    } else {
      // console.warn(`No keydown handler registered for key: ${key}`)
    }
  }
  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeyupEventHandler = (e) => {
    e.preventDefault()
    const key = e.code
    if (this.#keyupEventList[key]) {
      this.#keyupEventList[key](e)
    } else {
      // console.warn(`No keyup handler registered for key: ${key}`)
    }
  }
  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeypressEventHandler = (e) => {
    e.preventDefault()
    const key = e.code
    if (this.#keypressEventList[key]) {
      this.#keypressEventList[key](e)
    } else {
      // console.warn(`No keypress handler registered for key: ${key}`)
    }
  }

  /**
   * @param keydownEventList {Record<KeyCode, KeyboardEventHandler>}
   * @param keyupEventList {Record<KeyCode, KeyboardEventHandler>}
   * @param keypressEventList {Record<KeyCode, KeyboardEventHandler>}
   */
  registerEvents ({
    keydownEventList = {},
    keyupEventList = {},
    keypressEventList = {},
  }) {
    this.#keydownEventList = keydownEventList
    this.#keyupEventList = keyupEventList
    this.#keypressEventList = keypressEventList

    document.addEventListener('keydown', this.#invokeKeydownEventHandler)
    document.addEventListener('keyup', this.#invokeKeyupEventHandler)
    document.addEventListener('keypress', this.#invokeKeypressEventHandler)
  }

  removeEvents () {
    document.removeEventListener('keydown', this.#invokeKeydownEventHandler)
    document.removeEventListener('keyup', this.#invokeKeyupEventHandler)
    document.removeEventListener('keypress', this.#invokeKeypressEventHandler)
  }
}
