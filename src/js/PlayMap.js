/**
 * @typedef {Array<{ offset: number; beatLen: number }>} TimingList
 */

export class PlayMap {
  /**
   * @constructor
   * @param notes {Note[]}
   * @param timingList {TimingList}
   * @param overallDifficulty {number}
   * @param hpDrainRate {number}
   * @param length {number}
   * @param keys {number}
   */
  constructor ({
    notes,
    timingList,
    overallDifficulty,
    hpDrainRate,
    keys,
    length,
  }) {
    this.#notes = notes
    this.#timingList = timingList
    this.#overallDifficulty = overallDifficulty
    this.#hpDrainRate = hpDrainRate
    this.#length = length
    this.#keys = keys
  }

  /** @type {number} */
  #keys

  /** @type {number} */
  #overallDifficulty

  /** @type {number} */
  #hpDrainRate

  /** @type {number} */
  #length

  /**
   * @type {Note[]}
   */
  #notes

  /**
   * @type {TimingList}
   */
  #timingList

  /**
   * @return {Note[]}
   */
  get notes () {
    return this.#notes
  }

  /**
   * @return {TimingList}
   */
  get timingList () {
    return this.#timingList
  }

  /**
   * @return {number}
   */
  get overallDifficulty () {
    return this.#overallDifficulty
  }

  /**
   * @return {number}
   */
  get hpDrainRate () {
    return this.#hpDrainRate
  }

  get length () {
    return this.#length
  }

  get keys () { return this.#keys}

  reset () {
    this.#notes.forEach((item) => item.reset())
  }
}
