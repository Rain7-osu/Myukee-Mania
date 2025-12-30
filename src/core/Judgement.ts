export enum JudgementType {
  PERFECT = 320,
  GREAT = 300,
  GOOD = 200,
  OK = 100,
  MEH = 50,
  MISS = 0,
}

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
  #type: JudgementType
  #judgeTiming: number
  #hitTiming: number | undefined
  #releaseTiming: number | undefined

  constructor (type: JudgementType, judgeTiming: number, hitTiming?: number, releaseTiming?: number) {
    this.#type = type
    this.#judgeTiming = judgeTiming
    this.#hitTiming = hitTiming
    this.#releaseTiming = releaseTiming
  }

  get type (): JudgementType {
    return this.#type
  }

get hitTiming (): number | undefined {
    return this.#hitTiming
  }

get releaseTiming (): number | undefined {
    return this.#releaseTiming
  }

get judgeTiming (): number {
    return this.#judgeTiming
  }

get hitValue (): number {
    return this.#type
  }

get hitBonusValue (): number {
    switch (this.#type) {
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

get hitBonus (): number {
    return Math.floor(this.hitBonusValue / 16)
  }

get hitPunishment (): number {
    switch (this.#type) {
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

get accuracy (): number {
    switch (this.#type) {
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
