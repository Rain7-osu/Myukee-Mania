/**
 * @typedef {Array<{ offset: number; beatLen: number }>} TimingList
 */
import { Mod } from './ModsPanel'
import { shuffleArray } from './utils'
import { HpManager } from './HpManager'

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

  /**
   * @return {number}
   */
  get startTiming () {
    return this.#notes[0].offset
  }

  reset () {
    this.#notes.forEach((item) => item.reset())
  }

  /**
   * @param mod {Mod}
   */
  applyMod (mod) {
    if (mod === Mod.MR) {
      this.#notes.forEach(note => note.col = this.#keys - note.col - 1)
    } else if (mod === Mod.RD) {
      const keyArr = new Array(this.#keys).fill(0).map((_, index) => index)
      const targetColMap = shuffleArray(keyArr)
      this.#notes.forEach(note => note.col = targetColMap[note.col])
    } else if (mod === Mod.HT) {
      this.setRate(0.75)
    } else if (mod === Mod.DT || mod === Mod.NC) {
      this.setRate(1.5)
    } else if (mod === Mod.EZ) {
      this.#overallDifficulty = Math.round(this.#overallDifficulty * 5) / 10
      this.#hpDrainRate = Math.round(this.#hpDrainRate * 5) / 10
    } else if (mod === Mod.HR) {
      this.#overallDifficulty = Math.round(this.#overallDifficulty * 7 / 5 * 10) / 10
      this.#hpDrainRate = Math.round(this.#hpDrainRate * 7 / 5 * 10) / 10
      this.#overallDifficulty = Math.min(10, this.#overallDifficulty)
      this.#hpDrainRate = Math.min(10, this.#hpDrainRate)
    } else if (mod === Mod.NF) {
      this.#hpDrainRate = 0
    } else if (mod === Mod.SD) {
      this.#hpDrainRate = HpManager.MAX
    }
  }

  /**
   * @param rate {number}
   */
  setRate (rate) {
    this.#notes.forEach((note) => {
      note.offset /= rate
      note.end /= rate
    })
    this.#timingList.forEach((timing) => {
      timing.beatLen /= rate
      timing.offset /= rate
    })
    this.#length /= rate
  }

  clone () {
    return new PlayMap({
      notes: [...this.#notes],
      timingList: [...this.#timingList],
      overallDifficulty: this.#overallDifficulty,
      hpDrainRate: this.#hpDrainRate,
      keys: this.#keys,
      length: this.#length,
    })
  }
}
