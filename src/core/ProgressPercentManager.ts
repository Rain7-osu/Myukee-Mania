import { ProgressPercentEffect } from './ProgressEffect'

export class ProgressPercentManager {
  #effect: ProgressPercentEffect = new ProgressPercentEffect(0)

  get effect(): ProgressPercentEffect { return this.#effect }

  #duration: number

  set duration(value: number) { this.#duration = value }

  update(timing: number): void {
    const duration = this.#duration
    this.#effect.percent = timing > duration ? 1.0 : timing / duration
  }

  reset(): void {
    this.#effect.percent = 0
    this.duration = 0
  }
}
