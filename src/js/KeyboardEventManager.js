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
    this.#keydownEventList.forEach((handler) => handler(e))
  }
  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeyupEventHandler = (e) => {
    this.#keyupEventList.forEach((handler) => handler(e))
  }
  /**
   * @param e {KeyboardEvent}
   */
  #invokeKeypressEventHandler = (e) => {
    this.#keypressEventList.forEach((handler) => handler(e))
  }

  /**
   * @param keydownEventList {KeyboardEventHandler[]}
   * @param keyupEventList {KeyboardEventHandler[]}
   * @param keypressEventList {KeyboardEventHandler[]}
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
