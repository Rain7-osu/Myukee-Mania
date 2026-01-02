import type { Note } from './Note'
import { Mod } from './ModsPanel'
import { shuffleArray } from './utils'
import { HpManager } from './HpManager'

export interface TimingPoint {
  offset: number
  beatLen: number
}

export type TimingList = TimingPoint[]

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
    this._notes = notes
    this._timingList = timingList
    this._overallDifficulty = overallDifficulty
    this._hpDrainRate = hpDrainRate
    this._length = length
    this._keys = keys
  }

  private readonly _keys: number

  private _overallDifficulty: number

  private _hpDrainRate: number

  private _length: number

  private readonly _notes: Note[]

  private readonly _timingList: TimingList

  get notes (): Note[] {
    return this._notes
  }

  get timingList (): TimingList {
    return this._timingList
  }

  get overallDifficulty (): number {
    return this._overallDifficulty
  }

  get hpDrainRate (): number {
    return this._hpDrainRate
  }

  get length (): number {
    return this._length
  }

  get keys (): number {
    return this._keys
  }

  get startTiming (): number {
    return this._notes[0].offset
  }

  reset (): void {
    this._notes.forEach(item => item.reset())
  }

  applyMod (mod: Mod): void {
    if (mod === Mod.MR) {
      this._notes.forEach(note => note.col = this._keys - note.col - 1)
    } else if (mod === Mod.RD) {
      const keyArr = new Array(this._keys).fill(0).map((_, index) => index)
      const targetColMap = shuffleArray(keyArr)
      this._notes.forEach(note => note.col = targetColMap[note.col])
    } else if (mod === Mod.HT) {
      this.setRate(0.75)
    } else if (mod === Mod.DT || mod === Mod.NC) {
      this.setRate(1.5)
    } else if (mod === Mod.EZ) {
      this._overallDifficulty = Math.round(this._overallDifficulty * 5) / 10
      this._hpDrainRate = Math.round(this._hpDrainRate * 5) / 10
    } else if (mod === Mod.HR) {
      this._overallDifficulty = Math.round(this._overallDifficulty * 7 / 5 * 10) / 10
      this._hpDrainRate = Math.round(this._hpDrainRate * 7 / 5 * 10) / 10
      this._overallDifficulty = Math.min(10, this._overallDifficulty)
      this._hpDrainRate = Math.min(10, this._hpDrainRate)
    } else if (mod === Mod.NF) {
      this._hpDrainRate = 0
    } else if (mod === Mod.SD) {
      this._hpDrainRate = HpManager.MAX
    }
  }

  setRate (rate: number): void {
    this._notes.forEach(note => {
      note.offset /= rate
      note.end /= rate
    })
    this._timingList.forEach(timing => {
      timing.beatLen /= rate
      timing.offset /= rate
    })
    this._length /= rate
  }

  clone (): PlayMap {
    return new PlayMap({
      notes: [...this._notes],
      timingList: [...this._timingList],
      overallDifficulty: this._overallDifficulty,
      hpDrainRate: this._hpDrainRate,
      keys: this._keys,
      length: this._length,
    })
  }
}
