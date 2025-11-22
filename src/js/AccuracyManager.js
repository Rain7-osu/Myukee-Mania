export class AccuracyManager {
  /** @type {Note[]} */
  #notes

  #acc = 1.0

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
  calcAcc () {
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
    this.#acc = this.calcAcc()
  }

  /**
   * @return {number}
   */
  get acc () {
    return this.#acc
  }
}
