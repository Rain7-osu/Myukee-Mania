export class KeyboardEventManager {
  /**
   * @param e {KeyboardEvent}
   */
  #stageKeydownEventHandler(e) {
    console.log('keydown', e)
    e.preventDefault()
  }

  #stageKeyupEventHandler(e) {
    console.log('keyup', e)
    e.preventDefault()
  }

  registerStageEvent() {
    document.addEventListener('keydown', this.#stageKeydownEventHandler)
    document.addEventListener('keyup', this.#stageKeyupEventHandler)
  }

  disposeStageEvent() {
    document.removeEventListener('keydown', this.#stageKeydownEventHandler)
    document.removeEventListener('keyup', this.#stageKeyupEventHandler)
  }
}
