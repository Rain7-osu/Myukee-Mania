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
}
