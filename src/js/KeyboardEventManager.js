/**
  @callback KeyboardEventHandler
  @param {KeyboardEvent} e
 */

export class KeyboardEventManager {
  /**
   * @type {Record<string, KeyboardEventHandler>}
   */
  #keydownEventList = []
  /**
   * @type {Record<string, KeyboardEventHandler>}
   */
  #keyupEventList = []
  /**
   * @type {Record<string, KeyboardEventHandler>}
   */
  #keypressEventList = []

  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeydownEventHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const key = e.key.toLowerCase()
    // console.log(`press key: ${key}`)
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
    e.stopPropagation()

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
    e.preventDefault()
    e.stopPropagation()

    const key = e.key.toLowerCase()
    if (this.#keypressEventList[key]) {
      this.#keypressEventList[key](e)
    } else {
      // console.warn(`No keypress handler registered for key: ${key}`)
    }
  }

  /**
   * @param keydownEventList {Record<string, KeyboardEventHandler>}
   * @param keyupEventList {Record<string, KeyboardEventHandler>}
   * @param keypressEventList {Record<string, KeyboardEventHandler>}
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
