export interface TimingPoint {
  offset: number
  beatLen: number
}

export type TimingList = TimingPoint[]

import { Mod } from './ModsPanel'
import { shuffleArray } from './utils'
import { HpManager } from './HpManager'

export class PlayMap {
  constructor ({
    notes,
    timingList,
    overallDifficulty,
    hpDrainRate,
    keys,
    length,
  }: {
    notes: Note[]
    timingList: TimingList
    overallDifficulty: number
    hpDrainRate: number
    keys: number
    length: number
  }) {
    this.#notes = notes
    this.#timingList = timingList
    this.#overallDifficulty = overallDifficulty
    this.#hpDrainRate = hpDrainRate
    this.#length = length
    this.#keys = keys
  }

  #keys: number

  #overallDifficulty: number

  #hpDrainRate: number

  #length: number

  #notes: Note[]

  #timingList: TimingList

  get notes (): Note[] {
    return this.#notes
  }

  get timingList (): TimingList {
    return this.#timingList
  }

  get overallDifficulty (): number {
    return this.#overallDifficulty
  }

  get hpDrainRate (): number {
    return this.#hpDrainRate
  }

  get length (): number {
    return this.#length
  }

  get keys (): number {
    return this.#keys
  }

  get startTiming (): number {
    return this.#notes[0].offset
  }

  reset (): void {
    this.#notes.forEach((item) => item.reset())
  }

  applyMod (mod: Mod): void {
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

  setRate (rate: number): void {
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

  clone (): PlayMap {
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
