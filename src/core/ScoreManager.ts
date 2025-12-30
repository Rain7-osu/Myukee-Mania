import { JudgementType, MAX_MISS_DIVISION } from './Judgement'
import { ScoreEffect } from './ScoreEffect'
import type { Note } from './Note'

const MAX_SCORE = 1_000_000

const clamp = (value: number): number => {
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

export class ScoreManager {
  private _notes: Note[]

  private _baseEveryNoteScore: number = 0

  private _lastBonus: number = 100

  private _effect = new ScoreEffect()
  get effect(): ScoreEffect { return this._effect }

  private _score: number = 0

  get score(): number { return this._score }

  constructor () {
    this._notes = []
  }

  reset(): void {
    const TOTAL_NOTES = this._notes.length
    this._baseEveryNoteScore = MAX_SCORE * 0.5 / TOTAL_NOTES
    this._lastBonus = 100
    this._score = 0
  }

  init(notes: any[]): void {
    this._notes = notes
    const TOTAL_NOTES = this._notes.length
    this._baseEveryNoteScore = MAX_SCORE * 0.5 / TOTAL_NOTES
  }

  private calcEachNoteScore(note: any): number {
    if (!note.isHit) {
      return 0
    }

    const judgement = note.judgement

    if (!judgement) {
      return 0
    }

    const baseScore = this._baseEveryNoteScore * (judgement.hitValue / JudgementType.PERFECT)
    const bonus = clamp(this._lastBonus + judgement.hitBonus - judgement.hitPunishment)
    const bonusScore = this._baseEveryNoteScore * (judgement.hitBonusValue * Math.sqrt(bonus) / JudgementType.PERFECT)
    note.bonus = bonus
    this._lastBonus = bonus

    return baseScore + bonusScore
  }

  private _lastScoreValue = 0

  private _lastScoreNoteIndex = 0

  update(time: number, gameTiming: number): void {
    let totalScore = 0

    for (let i = this._lastScoreNoteIndex; i < this._notes.length; i++) {
      const note = this._notes[i]

      if (note.score !== null) {
        totalScore += note.score
        this._lastBonus = note.bonus
      } else if (note.isHit) {
        note.score = this.calcEachNoteScore(note)
        totalScore += note.score
        this._lastBonus = note.bonus
      } else if (!note.isHit) {

      }

      if (note.offset - gameTiming > MAX_MISS_DIVISION) {
        break
      }
    }

    this._score = totalScore
    this._effect.setScore(totalScore)
    this._effect.updateStepTo()
  }
}
