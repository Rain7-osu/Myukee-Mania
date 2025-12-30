import { JudgementType } from './Judgement'
import { HpEffect } from './HpEffect'

const MAX = 150

const yd = (x: number): number => {
  return MAX / (132 / (x + 1) + 1)
}

export class HpManager {
  static MAX: number = MAX

  #value: number = MAX

  #effect: HpEffect = null

  #failed: boolean = false

  get value (): number { return this.#value }

  #hp: number = 8

  #onFail: () => void

  init (hp: number, onFail: () => void, effect: HpEffect): void {
    this.#hp = hp
    this.#onFail = onFail
    this.#effect = effect
  }

  async drop (): Promise<void> {
    if (this.#hp === 0) {
      return
    }
    this.#value -= yd(this.#hp)
    if (this.#value < 0) {
      this.#value = 0
      if (!this.#failed) {
        this.#failed = true
        this.#onFail()
      }
    }
    await this.#effect.update(this.#value)
  }

  async restore (judgement: JudgementType): Promise<void> {
    // hp 10 only 320 restore
    if (this.#value >= 10) {
      if (judgement !== JudgementType.PERFECT) {
        return
      }
      this.#value += 0.5
    } else {
      const restoreValue = (judgement % 100) * 10 / 10 - 3.15 * this.#hp - 3.15
      if (restoreValue > 0) this.#value += restoreValue
    }

    this.#value = Math.min(MAX, this.#value)
    await this.#effect.update(this.#value)
  }

  reset (): void {
    this.#value = MAX
    this.#failed = false
    this.#effect?.reset()
  }
}
