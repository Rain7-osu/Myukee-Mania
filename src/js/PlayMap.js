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
   */
  constructor ({
    notes,
    timingList,
    overallDifficulty,
    hpDrainRate,
  }) {
    this.#notes = notes
    this.#timingList = timingList
    this.#overallDifficulty = overallDifficulty
    this.#hpDrainRate = hpDrainRate
  }

  /** @type {number} */
  #overallDifficulty

  /** @type {number} */
  #hpDrainRate

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

  reset () {
    this.#notes.forEach((item) => item.reset())
    this.#timingList = []
    this.#overallDifficulty = 0
    this.#hpDrainRate = 0
  }
}
