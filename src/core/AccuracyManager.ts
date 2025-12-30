import { RankingEffect } from './RankingEffect'
import { AccuracyEffect } from './AccuracyEffect'
import { Note } from './Note'

export class AccuracyManager {
  #notes: Note[]

  #acc: number = 1.0

  #accEffect: AccuracyEffect = new AccuracyEffect()

  get accEffect (): AccuracyEffect { return this.#accEffect }

  #rankingEffect: RankingEffect = new RankingEffect(0)

  get rankingEffect (): RankingEffect { return this.#rankingEffect }

  init (notes: Note[]): void {
    this.#notes = notes
  }

  private _calcAcc (): number {
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

  update (): void {
    const acc = this._calcAcc()
    this.#acc = acc
    this.#accEffect.acc = acc
    this.#rankingEffect.type = RankingEffect.calcRankingType(acc)
  }

  get acc (): number {
    return this.#acc
  }
}
