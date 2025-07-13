import { Judgement, JudgementType } from './Judgement'
import { Shape } from './Shape'
import { JudgementEffect } from './JudgementEffect'


const JudgementAreaList = [
  JudgementType.PERFECT,
  JudgementType.GREAT,
  JudgementType.GOOD,
  JudgementType.OK,
  JudgementType.MEH,
  JudgementType.MISS,
]

/**
 * @type {{[JudgementType]: (function(od: number): number)}}
 */
const JudgementAreaCalculators = {
  [JudgementType.PERFECT]: () => 16.0,
  [JudgementType.GREAT]: (od) => 64.0 - 3 * od,
  [JudgementType.GOOD]: (od) => 97.0 - 3 * od,
  [JudgementType.OK]: (od) => 127.0 - 3 * od,
  [JudgementType.MEH]: (od) => 151.0 - 3 * od,
  [JudgementType.MISS]: (od) => 188.0 - 3 * od,
}

const DEFAULT_OD = 7

export class JudgementManager {
  /**
   * @type {number}
   * overall Difficult
   */
  #od = DEFAULT_OD

  /**
   * @type {import('./JudgementEffect').JudgementEffect[]}
   */
  #activeEffects = []

  get activeEffects() {
    return this.#activeEffects
  }

  /**
   * @type {Note[]}
   */
  #notes = []

  /** @type {number}  */
  #combo = 0

  get combo() {
    return this.#combo
  }

  /**
   * @param targetTiming {number}
   * @param hitTiming {number}
   * @return {null | Judgement}
   */
  createByHit(targetTiming, hitTiming) {
    let type = null
    const deviation = Math.abs(targetTiming - hitTiming)

    const missTime = JudgementAreaCalculators[JudgementType.MISS](this.#od)
    // 点的很早，没必要处理
    if (targetTiming - hitTiming > missTime) {
      return null
    }

    for (let i = 0; i < JudgementAreaList.length; i++) {
      const judgementType = JudgementAreaList[i]
      const func = JudgementAreaCalculators[judgementType]
      const maxDeviation = func(this.#od)
      if (deviation <= maxDeviation) {
        type = judgementType
        break
      }
    }

    if (type === null) {
      return null
    }
    if (type !== JudgementType.MISS && type !== JudgementType.MEH) {
      this.#combo += 1
    } else {
      this.#combo = 0
    }
    return new Judgement(type, hitTiming)
  }

  /**
   * @param notes {Note[]}
   */
  setNotes(notes) {
    this.#notes = notes
  }

  /**
   * @param od {number}
   */
  setOd(od) {
    this.#od = od
  }

  /**
   * @param {number} currentTiming
   */
  update(currentTiming) {
    const maxMehTime = JudgementAreaCalculators[JudgementType.MEH](this.#od)
    const notes = this.#notes

    for (let i = 0; i < this.#activeEffects.length; i++) {
      const effect = this.#activeEffects[i]
      const nextEffect = i < this.activeEffects.length - 1 ? this.activeEffects[i + 1] : null
      effect.update(currentTiming, nextEffect)
    }

    this.#activeEffects = this.#activeEffects.filter((e) => e.active)

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      // 到 miss 区间了还没按，直接判定 miss
      if (!note.isHit && currentTiming - note.offset > maxMehTime) {
        note.hit()
        this.#combo = 0
        note.judgement = new Judgement(JudgementType.MISS, currentTiming);
        const effect = new JudgementEffect(note.judgement)
        this.#activeEffects.push(effect)
      }
    }
  }

  /**
   * @param {number} hitTiming
   */
  checkHit(hitTiming) {
    const notes = this.#notes
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]

      if (note.isHit) {
        continue
      }

      const judgement = this.createByHit(note.offset, hitTiming)
      if (!judgement) {
        continue
      }

      note.hit()
      note.judgement = judgement

      const effect = new JudgementEffect(judgement)
      this.#activeEffects.push(effect)
      // 一次只处理一个音符
      break
    }
  }

  reset() {
    this.#activeEffects = []
  }
}
