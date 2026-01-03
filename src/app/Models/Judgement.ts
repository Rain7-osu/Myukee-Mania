import { JudgementType } from '../Enums/JudgementType'

export const JudgementAreaList: JudgementType[] = [
  JudgementType.PERFECT,
  JudgementType.GREAT,
  JudgementType.GOOD,
  JudgementType.OK,
  JudgementType.MEH,
  JudgementType.MISS,
]

export const JudgementAreaCalculators: Record<JudgementType, (od: number) => number> = {
  [JudgementType.PERFECT]: () => 16.0,
  [JudgementType.GREAT]: od => 64.0 - 3 * od,
  [JudgementType.GOOD]: od => 97.0 - 3 * od,
  [JudgementType.OK]: od => 127.0 - 3 * od,
  [JudgementType.MEH]: od => 151.0 - 3 * od,
  [JudgementType.MISS]: od => 188.0 - 3 * od,
}

export const MAX_MISS_DIVISION: number = JudgementAreaCalculators[JudgementType.MISS](0)

/**
 * the Judgement of hit notes
 */
export class Judgement {
  private readonly _type: JudgementType
  private readonly _judgeTiming: number
  private readonly _hitTiming: number | undefined
  private readonly _releaseTiming: number | undefined

  constructor(type: JudgementType, judgeTiming: number, hitTiming?: number, releaseTiming?: number) {
    this._type = type
    this._judgeTiming = judgeTiming
    this._hitTiming = hitTiming
    this._releaseTiming = releaseTiming
  }

  get type(): JudgementType {
    return this._type
  }

  get hitTiming(): number | undefined {
    return this._hitTiming
  }

  get releaseTiming(): number | undefined {
    return this._releaseTiming
  }

  get judgeTiming(): number {
    return this._judgeTiming
  }

  get hitValue(): number {
    return this._type
  }

  get hitBonusValue(): number {
    switch (this._type) {
      case JudgementType.PERFECT:
        return 32
      case JudgementType.GREAT:
        return 32
      case JudgementType.GOOD:
        return 16
      case JudgementType.OK:
        return 8
      case JudgementType.MEH:
        return 4
      case JudgementType.MISS:
        return 0
      default:
        return 0
    }
  }

  get hitBonus(): number {
    return Math.floor(this.hitBonusValue / 16)
  }

  get hitPunishment(): number {
    switch (this._type) {
      case JudgementType.PERFECT:
        return 0
      case JudgementType.GREAT:
        return 0
      case JudgementType.GOOD:
        return 8
      case JudgementType.OK:
        return 24
      case JudgementType.MEH:
        return 44
      case JudgementType.MISS:
        return Infinity
      default:
        return 0
    }
  }

  get accuracy(): number {
    switch (this._type) {
      case JudgementType.PERFECT:
      case JudgementType.GREAT:
        return 1.0
      case JudgementType.GOOD:
        return 0.6667
      case JudgementType.OK:
        return 0.3333
      case JudgementType.MEH:
        return 0.1667
      default:
        return 0
    }
  }
}
