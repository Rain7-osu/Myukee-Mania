/**
 * @typedef {Array<{ offset: number; beatLen: number }>} TimingList
 */

export class PlayMap {
  /**
   * @constructor
   * @param notes {Note[]}
   * @param timingList {TimingList}
   */
  constructor (notes, timingList) {
    this.#notes = notes
    this.#timingList = timingList
  }

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
  get notes() {
    return this.#notes
  }

  get timingList() {
    return this.#timingList
  }
}
