import { RankingEffect } from '../Effects/RankingEffect'
import { AccuracyEffect } from '../Effects/AccuracyEffect'
import { Note } from '../Models/Note'

export class AccuracyManager {
  private _notes: Note[]

  private _acc: number = 1.0

  private _accEffect: AccuracyEffect = new AccuracyEffect()

  get accEffect(): AccuracyEffect { return this._accEffect }

  private _rankingEffect: RankingEffect = new RankingEffect(0)

  get rankingEffect(): RankingEffect { return this._rankingEffect }

  init(notes: Note[]): void {
    this._notes = notes
  }

  private _calcAcc(): number {
    if (this._notes.length === 0) {
      return 1.0
    }

    let acc = 0.0
    let hitCount = 0
    for (let i = 0; i < this._notes.length; i++) {
      const note = this._notes[i]

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

  update(): void {
    const acc = this._calcAcc()
    this._acc = acc
    this._accEffect.acc = acc
    this._rankingEffect.type = RankingEffect.calcRankingType(acc)
  }

  get acc(): number {
    return this._acc
  }
}
