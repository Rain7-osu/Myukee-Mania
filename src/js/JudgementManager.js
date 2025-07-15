import { Judgement, JudgementType } from './Judgement'
import { Shape } from './Shape'
import { JudgementEffect } from './JudgementEffect'
import { NoteType } from './NoteType'

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
  get activeEffects () { return this.#activeEffects }

  /**
   * @type {Note[]}
   */
  #notes = []

  /** @type {number}  */
  #combo = 0
  get combo () { return this.#combo }

  /** @type {JudgementRecord} */
  #judgementRecord = {
    [JudgementType.PERFECT]: 0,
    [JudgementType.GREAT]: 0,
    [JudgementType.GOOD]: 0,
    [JudgementType.OK]: 0,
    [JudgementType.MEH]: 0,
    [JudgementType.MISS]: 0,
  }

  get judgementRecord () { return this.#judgementRecord }

  /**
   * @param notes {Note[]}
   * @param od {number}
   */
  init (notes, od) {
    this.#notes = notes
    this.#od = od || 8
  }

  /**
   * @param od {number}
   */
  setOd (od) {
    this.#od = od
  }

  /**
   * @param offset {number}
   * @param hitTiming {number}
   * @return {null | Judgement}
   */
  createJudgementByHit (offset, hitTiming) {
    const missDeviation = JudgementAreaCalculators[JudgementType.MISS](this.#od)
    // 点的很早，没必要处理
    if (offset - hitTiming > missDeviation) {
      return null
    }

    let type = null
    const deviation = Math.abs(offset - hitTiming)

    for (let i = 0; i < JudgementAreaList.length; i++) {
      const judgementType = JudgementAreaList[i]
      const func = JudgementAreaCalculators[judgementType]
      const maxDeviation = func(this.#od)
      if (deviation <= maxDeviation) {
        type = judgementType
        break
      }
    }

    return type === null ? null : new Judgement(type, hitTiming)
  }

  /**
   * 长按音符
   * 取决于音符头按下按键、音符尾松开按键的准确度，长按音符整体给出一个判定。根据如下表格，其中整体打击误差等于音符头打击误差+音符尾打击误差（均为正值）：
   *
   * 判定	要求
   * PERFECT	音符头打击误差 ≤ PERFECT 最大误差 × 1.2 且整体打击误差 ≤ PERFECT 最大误差 × 2.4
   * GREAT	音符头打击误差 ≤ GREAT 最大误差 × 1.1 且整体打击误差 ≤ GREAT 最大误差 × 2.2
   * GOOD	音符头打击误差 ≤ GOOD 最大误差且整体打击误差 ≤ GOOD 最大误差 × 2
   * OK	音符头打击误差 ≤ OK 最大误差且整体打击误差 ≤ OK 最大误差 × 2
   * MEH	不是 MISS 的其他情况
   * MISS	从音符尾的较早 MEH 区间至较晚 OK 区间没有按住按键
   *
   * @param offset {number}
   * @param hitTiming {number}
   * @param end {number}
   * @param releaseTiming {number}
   * @return {null | Judgement}
   */
  createJudgementByRelease (offset, hitTiming, end, releaseTiming) {
    const missTime = JudgementAreaCalculators[JudgementType.MISS](this.#od)
    // 点的很早，没必要处理
    if (offset - hitTiming > missTime) {
      return null
    }

    const hitDeviation = Math.abs(offset - hitTiming)
    const releaseDeviation = Math.abs(end - releaseTiming)

    const perfectMaxDeviation = JudgementAreaCalculators[JudgementType.PERFECT](this.#od)
    const greatMaxDeviation = JudgementAreaCalculators[JudgementType.GREAT](this.#od)
    const goodMaxDeviation = JudgementAreaCalculators[JudgementType.GOOD](this.#od)
    const okMaxDeviation = JudgementAreaCalculators[JudgementType.OK](this.#od)
    const mehMaxDeviation = JudgementAreaCalculators[JudgementType.MEH](this.#od)

    // 先判断 miss
    if (offset - hitTiming > mehMaxDeviation && releaseDeviation - end > okMaxDeviation) {
      return new Judgement(JudgementType.MISS, hitTiming, releaseTiming)
    }

    if (hitDeviation <= perfectMaxDeviation * 1.2 && (hitDeviation + releaseDeviation) <= perfectMaxDeviation * 2.4) {
      return new Judgement(JudgementType.PERFECT, hitTiming, releaseTiming)
    }

    if (hitDeviation <= greatMaxDeviation * 1.1 && (hitDeviation + releaseDeviation) <= greatMaxDeviation * 2.2) {
      return new Judgement(JudgementType.GREAT, hitTiming, releaseTiming)
    }

    if (hitDeviation <= goodMaxDeviation && (hitDeviation + releaseDeviation) <= goodMaxDeviation * 2) {
      return new Judgement(JudgementType.GOOD, hitTiming, releaseTiming)
    }

    if (hitDeviation <= okMaxDeviation && (hitDeviation + releaseDeviation) <= okMaxDeviation * 2) {
      return new Judgement(JudgementType.OK, hitTiming, releaseTiming)
    }

    return new Judgement(JudgementType.MEH, hitTiming, releaseTiming)
  }

  /**
   * @param {number} currentTiming
   */
  update (currentTiming) {
    const maxMehTime = JudgementAreaCalculators[JudgementType.MEH](this.#od)
    const maxOkTime = JudgementAreaCalculators[JudgementType.OK](this.#od)
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
      if (note.type === NoteType.TAP && !note.isHit && currentTiming - note.offset > maxMehTime) {
        note.hit()
        this.#combo = 0
        note.judgement = new Judgement(JudgementType.MISS, currentTiming)
        note.grayed = true
        this.#judgementRecord[JudgementType.MISS]++
        const effect = new JudgementEffect(note.judgement)
        this.#activeEffects.push(effect)
      } else if (note.type === NoteType.HOLD && !note.isHit) {
        // 长条到了尾判 miss 区间还没按，直接判定 miss
        if (currentTiming - note.end > maxMehTime) {
          note.hit()
          note.judgement = new Judgement(JudgementType.MISS, currentTiming, undefined)
          note.grayed = true
          this.#combo = 0
          this.#judgementRecord[JudgementType.MISS]++
          const effect = new JudgementEffect(note.judgement)
          this.#activeEffects.push(effect)
        } else if (currentTiming - note.offset > maxOkTime && !note.isHeld) {
          // 长条到了头判 meh 区间还没按，直接断连
          note.grayed = true
          if (this.#combo > 0) {
            this.#combo = 0
          }
        }
      }
    }
  }

  /**
   * @param {number} hitTiming
   * @param {number} hitCol
   */
  checkHit (hitTiming, hitCol) {
    const notes = this.#notes
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]

      // 按过的，不是自己轨道的，不处理
      if (note.isHit || hitCol !== note.col) {
        continue
      }

      if (note.type === NoteType.TAP) {
        const judgement = this.createJudgementByHit(note.offset, hitTiming)
        if (!judgement) {
          continue
        }

        if (hitTiming < note.offset && judgement.type === JudgementType.MISS) {
          // 点到了过早的 miss 区间，则不判定
          continue
        }

        note.hit()
        note.judgement = judgement
        note.hitTiming = hitTiming
        const type = judgement.type
        this.#judgementRecord[type]++

        if (type !== JudgementType.MISS && type !== JudgementType.MEH) {
          this.#combo++
        } else {
          this.#combo = 0
        }

        const effect = new JudgementEffect(judgement)
        this.#activeEffects.push(effect)
        // one hit => one judgement
        break
      } else if (note.type === NoteType.HOLD) {
        const hitDivision = note.offset - hitTiming
        const maxMehTime = JudgementAreaCalculators[JudgementType.MEH](this.#od)
        const maxOkTime = JudgementAreaCalculators[JudgementType.OK](this.#od)
        if (!note.isHeld && hitDivision <= maxMehTime) {
          note.isHeld = true
          note.hitTiming = hitTiming

          // 过了 OK 区间还没按，直接灰条，断连
          if (hitDivision > maxOkTime) {
            note.grayed = true
            this.#combo = 0
          }
          break
        }
      }
    }
  }

  /**
   * @param releaseTiming {number}
   * @param releaseCol {number}
   */
  checkRelease (releaseTiming, releaseCol) {
    const notes = this.#notes
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      // 已经按过的，不是自己轨道的，或者不是长按音符的，不处理
      if (note.isHit || note.type !== NoteType.HOLD || releaseCol !== note.col || !note.isHeld) {
        continue
      }

      note.isHeld = false
      note.releaseTiming = releaseTiming

      // release time 已经进了最大的早 meh 区间，则直接标记 hit，后续也不再重置判定
      if (note.end - note.releaseTiming <= JudgementAreaCalculators[JudgementType.MISS](this.#od)) {
        note.hit()
        const judgement = this.createJudgementByRelease(note.offset, note.hitTiming, note.end, releaseTiming)

        if (!judgement) {
          continue
        }

        const type = judgement.type
        note.judgement = judgement
        this.#judgementRecord[type]++
        const effect = new JudgementEffect(note.judgement)
        this.#activeEffects.push(effect)

        if (type === JudgementType.MISS || type === JudgementType.MEH) {
          this.#combo = 0
          note.grayed = true
        } else {
          this.#combo ++
        }

        // 只检查一个
        break
      } else {
        // 没过最大的早 meh 区间，直接灰条，断连
        note.grayed = true
        this.#combo = 0
        break
      }
    }
  }

  reset () {
    this.#activeEffects = []
    this.#combo = 0
  }
}
