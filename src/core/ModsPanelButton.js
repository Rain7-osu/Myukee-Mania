import { BaseButton } from './BaseButton'
import { ActiveEffect } from './ActiveEffect'

const LEFT_OFFSET = 120

export class ModsPanelButton extends BaseButton {
  #translateX = LEFT_OFFSET

  #showEffect = new ActiveEffect()

  /**
   * @param x {1 | -1}
   */
  set initTranslateDirection (x) {
    this.#translateX = x > 0 ? LEFT_OFFSET : -LEFT_OFFSET
  }

  rect () {
    const [x, y, w, h] = super.rect()
    return [x + this.#translateX, y, w, h]
  }

  async show () {
    this.#showEffect.cancelTransitions()
    await this.#showEffect.createTransition(this.#translateX, 0, 300, 'easeOut', (v) => this.#translateX = v)
  }

  updateEffect (now) {
    super.updateEffect(now)
    this.#showEffect.updateEffect(now)
  }
}
