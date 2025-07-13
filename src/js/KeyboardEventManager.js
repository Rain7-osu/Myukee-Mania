/**
  @callback KeyboardEventHandler
  @param {KeyboardEvent} e
 */

export class KeyboardEventManager {
  /**
   * @type {KeyboardEventHandler[]}
   */
  #keydownEventList = []
  /**
   * @type {KeyboardEventHandler[]}
   */
  #keyupEventList = []
  /**
   * @type {KeyboardEventHandler[]}
   */
  #keypressEventList = []

  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeydownEventHandler = (e) => {
    const key = e.key.toLowerCase()
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
    const key = e.key.toLowerCase()
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
    const key = e.key.toLowerCase()
    if (this.#keypressEventList[key]) {
      this.#keypressEventList[key](e)
    } else {
      // console.warn(`No keypress handler registered for key: ${key}`)
    }
  }

  /**
   * @param keydownEventList {Record<string, KeyboardEvent>}
   * @param keyupEventList {Record<string, KeyboardEvent>}
   * @param keypressEventList {Record<string, KeyboardEvent>}
   */
  registerStageEvent({
    keydownEventList,
    keyupEventList,
    keypressEventList,
  }) {
    this.#keydownEventList = keydownEventList
    this.#keyupEventList = keyupEventList
    this.#keypressEventList = keypressEventList

    document.addEventListener('keydown', this.#invokeKeydownEventHandler)
    document.addEventListener('keyup', this.#invokeKeyupEventHandler)
    document.addEventListener('keypress', this.#invokeKeypressEventHandler)
  }

  removeStageEvent() {
    document.removeEventListener('keydown', this.#invokeKeydownEventHandler)
    document.removeEventListener('keyup', this.#invokeKeyupEventHandler)
    document.removeEventListener('keypress', this.#invokeKeypressEventHandler)
  }
}
