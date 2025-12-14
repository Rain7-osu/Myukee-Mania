import { JudgementType } from './Judgement'

const MAX = 150

/**
 * drop function
 * @param x {number}
 * @return {number}
 */
const yd = (x) => {
  return MAX / (132 / (x + 1) + 1)
}

export class HpManager {
  static MAX = MAX

  #value = MAX

  /**
   * @type {HpEffect}
   */
  #effect = null

  #failed = false

  /**
   * @return {number}
   */
  get value () { return this.#value }

  #hp = 8

  /**
   * @type {() => void}
   */
  #onFail

  /**
   * @param hp {number}
   * @param onFail {() => void}
   * @param effect {HpEffect}
   */
  init (hp, onFail, effect) {
    this.#hp = hp
    this.#onFail = onFail
    this.#effect = effect
  }

  async drop () {
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

  /**
   * @param judgement {JudgementType}
   */
  async restore (judgement) {
    // hp 10 only 320 restore
    if (this.#value >= 10) {
      if (judgement !== JudgementType.PERFECT) {
        return
      }
      this.#value += 0.5
    } else {
      const restoreValue = (judgement % 100) * 10 / 10 - 3.15 * this.#hp - 3.15
      restoreValue > 0 ? this.#value += restoreValue : undefined
    }

    this.#value = Math.min(MAX, this.#value)
    await this.#effect.update(this.#value)
  }

  reset () {
    this.#value = MAX
    this.#failed = false
    this.#effect?.reset()
  }
}
