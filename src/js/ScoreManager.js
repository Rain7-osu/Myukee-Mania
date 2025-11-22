import { JudgementType } from './Judgement'
import { ScoreEffect } from './ScoreEffect'

const MAX_SCORE = 1_000_000

const clamp = (value) => {
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

export class ScoreManager {
  /**
   * @type {Note[]}
   */
  #notes

  /**
   * @type {number}
   */
  #baseEveryNoteScore = 0

  /**
   * bonus of the last hit
   * @type {number}
   */
  #lastBonus = 100

  #effect = new ScoreEffect()
  /**
   * @return {ScoreEffect}
   */
  get effect () { return this.#effect }

  /** @type {number} */
  #score = 0

  /**
   * @return {number}
   */
  get score () { return this.#score }

  reset () {
    this.#notes = []
    this.#baseEveryNoteScore = 0
    this.#lastBonus = 100
    this.#score = 0
  }

  /**
   * @param notes {Note[]}
   */
  init (notes) {
    this.#notes = notes
    const TOTAL_NOTES = this.#notes.length
    this.#baseEveryNoteScore = MAX_SCORE * 0.5 / TOTAL_NOTES
  }

  /**
   * Calculate the score for each note based on its judgement.
   * @private
   * @param note {Note}
   */
  calcEachNoteScore (note) {
    if (!note.isHit) {
      return 0
    }

    const judgement = note.judgement
    if (!judgement) {
      return 0
    }

    const baseScore = this.#baseEveryNoteScore * (judgement.hitValue / JudgementType.PERFECT)
    const bonus = clamp(this.#lastBonus + judgement.hitBonus - judgement.hitPunishment)
    const bonusScore = this.#baseEveryNoteScore * (judgement.hitBonusValue * Math.sqrt(bonus) / JudgementType.PERFECT)
    note.bonus = bonus
    this.#lastBonus = bonus

    return baseScore + bonusScore
  }

  update () {
    let totalScore = 0

    for (let i = 0; i < this.#notes.length; i++) {
      const note = this.#notes[i]

      if (note.score > 0) {
        totalScore += note.score
        this.#lastBonus = note.bonus
      } else if (note.isHit) {
        note.score = this.calcEachNoteScore(note)
        totalScore += note.score
        this.#lastBonus = note.bonus
      }
    }

    this.#score = totalScore
    this.#effect.setScore(totalScore)
    this.#effect.updateStepTo()
  }
}
