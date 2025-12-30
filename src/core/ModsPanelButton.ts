import { BaseButton } from './BaseButton'
import { ActiveEffect } from './ActiveEffect'

const LEFT_OFFSET = 120

export class ModsPanelButton extends BaseButton {
  #translateX = LEFT_OFFSET

  #showEffect = new ActiveEffect()

  set initTranslateDirection (x: 1 | -1) {
    this.#translateX = x > 0 ? LEFT_OFFSET : -LEFT_OFFSET
  }

  rect (): [number, number, number, number] {
    const [x, y, w, h] = super.rect()
    return [x + this.#translateX, y, w, h]
  }

  async show (): Promise<void> {
    this.#showEffect.cancelTransitions()
    await this.#showEffect.createTransition(this.#translateX, 0, 300, 'easeOut', (v: number) => this.#translateX = v)
  }

  updateEffect (now: number): void {
    super.updateEffect(now)
    this.#showEffect.updateEffect(now)
  }
}
