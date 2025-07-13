export const JudgementType = {
  PERFECT: 320,
  GREAT: 300,
  GOOD: 200,
  OK: 100,
  MEH: 50,
  MISS: 0,
}

/**
 * the Judgement of hit notes
 */
export class Judgement {
  /** @type {JudgementType} */
  #type

  /** @type {number} */
  #hitTiming

  /**
   * @param {JudgementType} type
   * @param {number} hitTiming
   */
  constructor (type, hitTiming) {
    this.#type = type
    this.#hitTiming = hitTiming
  }

  get type() {
    return this.#type
  }

  get hitTiming() {
    return this.#hitTiming
  }

  get hitValue() {
    return this.#type
  }

  get hitBonusValue() {
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

  get hitBonus() {
    return Math.floor(this.hitBonusValue / 16)
  }

  get hitPunishment() {
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
}
