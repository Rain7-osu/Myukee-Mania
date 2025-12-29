import { RankingEffect } from './RankingEffect.js'
import { AccuracyEffect } from './AccuracyEffect.js'

export class AccuracyManager {
  /** @type {Note[]} */
  #notes

  #acc = 1.0

  /** @type {AccuracyEffect} */
  #accEffect = new AccuracyEffect()

  /**
   * @return {AccuracyEffect}
   */
  get accEffect () { return this.#accEffect }

  /** @type {RankingEffect} */
  #rankingEffect = new RankingEffect(0)

  /**
   * @return {RankingEffect}
   */
  get rankingEffect () { return this.#rankingEffect }

  /**
   * @param notes {Note[]}
   */
  init (notes) {
    this.#notes = notes
  }

  /**
   * @private
   * @return {number}
   */
  _calcAcc () {
    if (this.#notes.length === 0) {
      return 1.0
    }

    let acc = 0.0
    let hitCount = 0
    for (let i = 0; i < this.#notes.length; i++) {
      const note = this.#notes[i]

      if (note.judgement) {
        acc += note.judgement.accuracy
        hitCount++
      }
    }

    if (hitCount === 0) {
      return 1.0
    }

    return acc / hitCount
  }

  update () {
    const acc = this._calcAcc()
    this.#acc = acc
    this.#accEffect.acc = acc
    this.#rankingEffect.type = RankingEffect.calcRankingType(acc)
  }

  /**
   * @return {number}
   */
  get acc () {
    return this.#acc
  }
}
