import { JudgementType } from './Judgement'
import { HpEffect } from './HpEffect'

const MAX = 150

const yd = (x: number): number => {
  return MAX / (132 / (x + 1) + 1)
}

export class HpManager {
  static MAX: number = MAX

  private _value: number = MAX

  private _effect: HpEffect | null = null

  private _failed: boolean = false

  get value(): number { return this._value }

  private _hp: number = 8

  private _onFail: () => void

  init(hp: number, onFail: () => void, effect: HpEffect): void {
    this._hp = hp
    this._onFail = onFail
    this._effect = effect
  }

  async drop(): Promise<void> {
    if (this._hp === 0) {
      return
    }
    this._value -= yd(this._hp)
    if (this._value < 0) {
      this._value = 0
      if (!this._failed) {
        this._failed = true
        this._onFail()
      }
    }
    await this._effect!.update(this._value)
  }

  async restore(judgement: JudgementType): Promise<void> {
    // hp 10 only 320 restore
    if (this._value >= 10) {
      if (judgement !== JudgementType.PERFECT) {
        return
      }
      this._value += 0.5
    } else {
      const restoreValue = (judgement % 100) * 10 / 10 - 3.15 * this._hp - 3.15
      if (restoreValue > 0) this._value += restoreValue
    }

    this._value = Math.min(MAX, this._value)
    await this._effect!.update(this._value)
  }

  reset(): void {
    this._value = MAX
    this._failed = false
    this._effect?.reset()
  }
}
