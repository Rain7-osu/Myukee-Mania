export class PlayMap {
  /**
   * @constructor
   * @param notes {Note[]}
   * @param offset {number}
   * @param sectionLen {number}
   */
  constructor (notes, offset, sectionLen) {
    this.#notes = notes
    this.#offset = offset
    this.#sectionLen = sectionLen
  }

  /**
   * @type {Note[]}
   */
  #notes

  /**
   * @type {number}
   */
  #offset

  #sectionLen

  /**
   * @return {Note[]}
   */
  get notes() {
    return this.#notes
  }

  get offset() {
    return this.#offset
  }

  get sectionLen() {
    return this.#sectionLen
  }
}
