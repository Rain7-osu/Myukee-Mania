import { Judgement, JudgementAreaCalculators, JudgementAreaList, JudgementType } from './Judgement'
import { JudgementEffect } from './JudgementEffect'
import { NoteType } from './NoteType'
import { JudgementDeviationEffect } from './JudgementDeviationEffect'
import { JudgementDeviation } from './JudgementDeviation'
import { warn } from './dev'

const DEFAULT_OD = 7

export class JudgementManager {
  /**
   * @type {number}
   * overall Difficult
   */
  #od = DEFAULT_OD

  /**
   * @type {JudgementEffect[]}
   */
  #activeEffects = []
  /**
   * @return {JudgementEffect[]}
   */
  get activeEffects () { return this.#activeEffects }

  /** @type {JudgementDeviationEffect} */
  #activeDeviations = new JudgementDeviationEffect()
  get activeDeviations () { return  this.#activeDeviations }

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
    this.#activeDeviations.init(od)
  }

  /**
   * 严格根据判定表生成判定，如果不在判定表中，则返回 null，不生成判定
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

    // 判定时间就是打击时间
    return type && new Judgement(type, hitTiming, hitTiming)
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
    const mehTime = JudgementAreaCalculators[JudgementType.MEH](this.#od)

    // 在 meh 早于 meh 区间内松开，不做判定
    if (end - releaseTiming > mehTime) {
      return null
    }

    if (releaseTiming - end > mehTime) {
      // 如果松开时间晚于 meh 区间，进了 miss 区间，则直接把 meh 时间作为松开时间参与下方的判定
      releaseTiming = end + mehTime
    }

    const hitDeviation = Math.abs(offset - hitTiming)
    const releaseDeviation = Math.abs(end - releaseTiming)

    const perfectTime = JudgementAreaCalculators[JudgementType.PERFECT](this.#od)
    const greatTime = JudgementAreaCalculators[JudgementType.GREAT](this.#od)
    const goodTime = JudgementAreaCalculators[JudgementType.GOOD](this.#od)
    const okTime = JudgementAreaCalculators[JudgementType.OK](this.#od)

    if (hitDeviation <= perfectTime * 1.2 && (hitDeviation + releaseDeviation) <= perfectTime * 2.4) {
      return new Judgement(JudgementType.PERFECT, releaseTiming, hitTiming, releaseTiming)
    }

    if (hitDeviation <= greatTime * 1.1 && (hitDeviation + releaseDeviation) <= greatTime * 2.2) {
      return new Judgement(JudgementType.GREAT, releaseTiming, hitTiming, releaseTiming)
    }

    if (hitDeviation <= goodTime && (hitDeviation + releaseDeviation) <= goodTime * 2) {
      return new Judgement(JudgementType.GOOD, releaseTiming, hitTiming, releaseTiming)
    }

    if (hitDeviation <= okTime && (hitDeviation + releaseDeviation) <= okTime * 2) {
      return new Judgement(JudgementType.OK, releaseTiming, hitTiming, releaseTiming)
    }

    // 判定时间是松手时间
    return new Judgement(JudgementType.MEH, releaseTiming, hitTiming, releaseTiming)
  }

  /**
   * @param {number} currentTiming
   */
  update (currentTiming) {
    const maxMehTime = JudgementAreaCalculators[JudgementType.MEH](this.#od)
    const maxOkTime = JudgementAreaCalculators[JudgementType.OK](this.#od)
    const notes = this.#notes

    this.#activeDeviations.update(currentTiming)

    for (let i = 0; i < this.#activeEffects.length; i++) {
      const effect = this.#activeEffects[i]
      const nextEffect = i < this.activeEffects.length - 1 ? this.activeEffects[i + 1] : null
      effect.update(currentTiming, nextEffect)
    }

    this.#activeEffects = this.#activeEffects.filter((e) => e.active)

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      // 到 miss 区间了还没按，直接判定 miss
      const type = note.type
      const isHit = note.isHit

      if (isHit) {
        continue
      }

      if (type === NoteType.TAP && currentTiming - note.offset > maxMehTime) {
        note.hit()
        this.#combo = 0
        // 没有判定时间
        note.judgement = new Judgement(JudgementType.MISS, currentTiming)
        this.#judgementRecord[JudgementType.MISS]++
        const effect = new JudgementEffect(note.judgement)
        this.#activeEffects.push(effect)
      } else if (type === NoteType.HOLD) {
        // note 一直按着，如果过了最晚的 meh 区间，进入 miss 区间还不松手，则直接拿最晚的 meh 区间来生成判定
        if (note.isHeld && currentTiming - note.end > maxMehTime) {
          note.hit()
          note.isHeld = false
          note.judgement = this.createJudgementByRelease(note.offset, note.hitTiming, note.end, currentTiming)
          if (!note.judgement) {
            // 默认直接判定为 meh，但是理论上不应该走到这里，进去的判定一定是在判定表中的
            warn('JudgementManager: createJudgementByRelease returned null, defaulting to meh', {
              note,
              currentTiming,
            })
            note.judgement = new Judgement(JudgementType.MEH, currentTiming, note.hitTiming, currentTiming)
          }
          if (note.judgement.type <= JudgementType.MEH) {
            // 直接灰条
            note.grayed = true
            this.#combo = 0
          }
          this.#judgementRecord[note.judgement.type]++
          const effect = new JudgementEffect(note.judgement)
          this.#activeEffects.push(effect)
        }
        // 长条到了尾判 miss 区间还没按，也没按着，直接判定 miss
        else if (currentTiming - note.end > maxMehTime && !note.isHeld) {
          note.hit()
          note.judgement = new Judgement(JudgementType.MISS, currentTiming)
          note.grayed = true
          this.#combo = 0
          this.#judgementRecord[JudgementType.MISS]++
          const effect = new JudgementEffect(note.judgement)
          this.#activeEffects.push(effect)
        }
        // 长条如果过了头判 OK 区间还没按，也没按着，则直接灰条断连
        else if (currentTiming - note.offset > maxOkTime && !note.isHeld) {
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

      // 点击时间早于最早的 meh 区间，则不处理
      if (note.offset - hitTiming > JudgementAreaCalculators[JudgementType.MEH](this.#od)) {
        continue
      }

      const isHeld = note.isHeld
      const noteType = note.type
      if (noteType === NoteType.TAP) {
        note.judgement = this.createJudgementByHit(note.offset, hitTiming)
        if (!note.judgement) {
          warn('JudgementManager: createJudgementByHit returned null, skipping hit', {
            note,
            hitTiming,
          })
          // 理论上这里不可能是 null，因为前面已经判断过了，所以默认走 MISS
          note.judgement = new Judgement(JudgementType.MISS, hitTiming, hitTiming)
        }

        note.hit()
        note.hitTiming = hitTiming
        const type = note.judgement.type
        this.#judgementRecord[type]++
        const effect = new JudgementEffect(note.judgement)
        this.#activeEffects.push(effect)
        this.#activeDeviations.push(new JudgementDeviation(hitTiming, hitTiming - note.offset, type))

        if (type !== JudgementType.MISS && type !== JudgementType.MEH) {
          this.#combo++
        } else {
          this.#combo = 0
        }
        // one hit => one judgement
        break
      } else if (noteType === NoteType.HOLD) {
        if (isHeld) {
          // 理论上这里不可能存在这个 note 被按下去了，在 held 状态不重置的情况下又被按一次
          warn('JudgementManager: note is already held, skipping hit', {
            note,
            hitTiming,
          })
          continue
        }

        const headJudgement = this.createJudgementByHit(note.offset, hitTiming)

        note.hitTiming = hitTiming
        note.isHeld = true
        const type = headJudgement?.type || JudgementType.MISS
        this.activeDeviations.push(new JudgementDeviation(hitTiming, hitTiming - note.offset, type))
        break
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
      if (note.isHit || note.type !== NoteType.HOLD || releaseCol !== note.col || !note.isHeld || !note.hitTiming) {
        continue
      }

      // 松手后，设置为未按下状态
      note.isHeld = false

      // 检查打击偏差
      // 有灰条，说明肯定松过手了，直接不再产生打击偏差
      // 有判定，说明也肯定送过手了，也直接不再产生打击偏差
      if (!note.judgement && !note.grayed) {
        // 通过 end 创建一个判定
        const judgement = this.createJudgementByHit(note.end, releaseTiming)
        const deviation = new JudgementDeviation(releaseTiming, releaseTiming - note.end, judgement?.type || JudgementType.MISS)
        this.#activeDeviations.push(deviation)
      }

      // 如果松手时间早于尾判最早的 meh 区间，则不判定
      const mehTime = JudgementAreaCalculators[JudgementType.MEH](this.#od)
      if (note.end - releaseTiming > mehTime) {
        note.hitTiming = null
        note.grayed = true
        this.#combo = 0
      } else {
        // 开始判定 hitTiming 和 releaseTiming
        note.releaseTiming = releaseTiming

        // 理论上这里不可能存在 releaseTiming - note.end > mehTime 的情况（在到了 miss 区间还没松手），因为在 update 的时候已经判断过了
        if (releaseTiming - note.end > mehTime) {
          warn('JudgementManager: releaseTiming is too late', {
            note,
            releaseTiming,
          })
          note.judgement = new Judgement(JudgementType.MEH, releaseTiming, note.hitTiming, releaseTiming)
          this.#activeEffects.push(new JudgementEffect(note.judgement))
          this.#judgementRecord[JudgementType.MEH]++
          note.hit()
        } else {
          note.hit()
          note.judgement = this.createJudgementByRelease(note.offset, note.hitTiming, note.end, releaseTiming)
          if (!note.judgement) {
            // 理论上不存在这里为 null 的情况，因为前面已经判断过了在 meh 区间松开的情况
            warn('JudgementManager: createJudgementByRelease returned null, skipping release', {
              note,
              releaseTiming,
            })
            note.judgement = new Judgement(JudgementType.MEH, releaseTiming, note.hitTiming, releaseTiming)
          }
          this.#activeEffects.push(new JudgementEffect(note.judgement))
          this.#judgementRecord[note.judgement.type]++
          if (note.judgement.type <= JudgementType.MEH) {
            // 直接灰条 + 断连
            note.grayed = true
            this.#combo = 0
          } else {
            this.#combo++
          }
        }
      }
      // 一定有一个判定的，所以检查完当前直接不再向下检查
      break
    }
  }

  reset () {
    this.#activeEffects = []
    this.#combo = 0
  }
}
