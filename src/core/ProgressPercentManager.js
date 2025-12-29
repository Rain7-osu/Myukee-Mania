import { ProgressPercentEffect } from './ProgressEffect.js'

export class ProgressPercentManager {
  /** @type {ProgressPercentEffect} */
  #effect = new ProgressPercentEffect(0)

  /**
   * @return {ProgressPercentEffect}
   */
  get effect(){ return this.#effect }

  /** @type {number} */
  #duration

  /**
   * @param value {number}
   */
  set duration(value) { this.#duration = value }

  /**
   * @param timing {number}
   */
  update(timing) {
    const duration = this.#duration
    this.#effect.percent = timing > duration ? 1.0 : timing / duration
  }

  reset() {
    this.#effect.percent = 0
    this.duration = 0
  }
}
