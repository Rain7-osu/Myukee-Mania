import { ProgressPercentEffect } from '../Effects/ProgressEffect'

export class ProgressPercentManager {
  private _effect: ProgressPercentEffect = new ProgressPercentEffect(0)

  get effect(): ProgressPercentEffect { return this._effect }

  private _duration: number

  set duration(value: number) { this._duration = value }

  update(timing: number): void {
    const duration = this._duration
    this._effect.percent = timing > duration ? 1.0 : timing / duration
  }

  reset(): void {
    this._effect.percent = 0
    this.duration = 0
  }
}
