import { JudgementDeviationEffect } from '../Effects/JudgementDeviationEffect';
import type { Note } from '../Models/Note';
import { JudgementType } from '../Enums/JudgementType';
import { JudgementEffect } from '../Effects/JudgementEffect';
import { HpManager } from './HpManager';
import { Judgement } from '../Models/Judgement';
import { JudgementAreaCalculators, JudgementAreaList } from '../Models/Judgement';
import { NoteType } from '../Enums/NoteType';
import { JudgementDeviationPointEffect } from '../Effects/JudgementDeviationPointEffect';
import { dev } from '../_common/dev';

interface InitOptions {
  notes: Note[]
  od: number
  hp: number
  hpEffect: any
  auto: boolean
  onFail: () => void
  judgementDelay?: number
}

type JudgementRecord = {
  [key in JudgementType]: number
}

const DEFAULT_OD = 7

export class JudgementManager {
  private _od: number = DEFAULT_OD

  private _activeEffects: JudgementEffect[] = []

  private _judgementDelay: number = 0

  get activeEffects(): JudgementEffect[] { return this._activeEffects }

  private _activeDeviations: JudgementDeviationEffect = new JudgementDeviationEffect()
  get activeDeviations(): JudgementDeviationEffect { return this._activeDeviations }

  private _hpManager: HpManager = new HpManager()

  private _notes: Note[] = []

  private _combo: number = 0
  get combo(): number { return this._combo }

  private _maxCombo: number = 0
  get maxCombo(): number {return this._maxCombo || this._combo}

  private _fullCombo: boolean = true
  get fullCombo(): boolean {return this._fullCombo}

  private _auto: boolean = false

  private _judgementRecord: JudgementRecord = {
    [JudgementType.PERFECT]: 0,
    [JudgementType.GREAT]: 0,
    [JudgementType.GOOD]: 0,
    [JudgementType.OK]: 0,
    [JudgementType.MEH]: 0,
    [JudgementType.MISS]: 0,
  }
  get judgementRecord(): JudgementRecord { return this._judgementRecord }

  init(options: InitOptions): void {
    const { notes, od, hp, hpEffect, auto, onFail, judgementDelay = 0 } = options
    this._auto = auto
    this._notes = notes
    this._od = od || 8
    this._combo = 0
    this._maxCombo = 0
    this._judgementDelay = judgementDelay
    this._fullCombo = true
    this._activeDeviations.init(od)
    this._hpManager.init(hp, onFail, hpEffect)
    this._judgementRecord = {
      [JudgementType.PERFECT]: 0,
      [JudgementType.GREAT]: 0,
      [JudgementType.GOOD]: 0,
      [JudgementType.OK]: 0,
      [JudgementType.MEH]: 0,
      [JudgementType.MISS]: 0,
    }
  }

  reset() {
    this._activeDeviations.reset()
    this._activeEffects = []
    this._hpManager.reset()
    this._combo = 0
    this._maxCombo = 0
    this._fullCombo = true
    this._auto = false
    this._judgementRecord = {
      [JudgementType.PERFECT]: 0,
      [JudgementType.GREAT]: 0,
      [JudgementType.GOOD]: 0,
      [JudgementType.OK]: 0,
      [JudgementType.MEH]: 0,
      [JudgementType.MISS]: 0,
    }
  }

  createJudgementByHit(offset: number, hitTiming: number): null | Judgement {
    const missDeviation = JudgementAreaCalculators[JudgementType.MISS](this._od)
    // 点的很早，没必要处理
    if (offset - hitTiming > missDeviation) {
      return null
    }

    let type = null
    const deviation = Math.abs(offset - hitTiming)

    for (let i = 0; i < JudgementAreaList.length; i++) {
      const judgementType = JudgementAreaList[i]
      const func = JudgementAreaCalculators[judgementType]
      const maxDeviation = func(this._od)
      if (deviation <= maxDeviation) {
        type = judgementType
        break
      }
    }

    // 判定时间就是打击时间
    return type && new Judgement(type, hitTiming, hitTiming)
  }

  createJudgementByRelease(offset: number, hitTiming: number, end: number, releaseTiming: number): null | Judgement {
    const mehTime = JudgementAreaCalculators[JudgementType.MEH](this._od)

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

    const perfectTime = JudgementAreaCalculators[JudgementType.PERFECT](this._od)
    const greatTime = JudgementAreaCalculators[JudgementType.GREAT](this._od)
    const goodTime = JudgementAreaCalculators[JudgementType.GOOD](this._od)
    const okTime = JudgementAreaCalculators[JudgementType.OK](this._od)

    if (hitDeviation <= perfectTime * 1.2 && hitDeviation + releaseDeviation <= perfectTime * 2.4) {
      return new Judgement(JudgementType.PERFECT, releaseTiming, hitTiming, releaseTiming)
    }

    if (hitDeviation <= greatTime * 1.1 && hitDeviation + releaseDeviation <= greatTime * 2.2) {
      return new Judgement(JudgementType.GREAT, releaseTiming, hitTiming, releaseTiming)
    }

    if (hitDeviation <= goodTime && hitDeviation + releaseDeviation <= goodTime * 2) {
      return new Judgement(JudgementType.GOOD, releaseTiming, hitTiming, releaseTiming)
    }

    if (hitDeviation <= okTime && hitDeviation + releaseDeviation <= okTime * 2) {
      return new Judgement(JudgementType.OK, releaseTiming, hitTiming, releaseTiming)
    }

    // 判定时间是松手时间
    return new Judgement(JudgementType.MEH, releaseTiming, hitTiming, releaseTiming)
  }

  _processHp(judgement: JudgementType): void {
    if (judgement <= JudgementType.MEH) {
      this._hpManager.drop()
    } else {
      this._hpManager.restore(judgement)
    }
  }

  autoPlay(currentTiming: number, hitEffectManager: any): void {
    const notes = this._notes
    this.activeDeviations.update(currentTiming)
    for (let i = 0; i < this._activeEffects.length; i++) {
      const effect = this._activeEffects[i]
      const nextEffect = i < this.activeEffects.length - 1 ? this.activeEffects[i + 1] : null
      effect.update(currentTiming, nextEffect)
    }

    this._activeEffects = this._activeEffects.filter(e => e.active)

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]

      if (note.isHit) {
        continue
      }

      if (note.type === NoteType.TAP) {
        if (currentTiming >= note.offset) {
          note.hit()
          hitEffectManager.pressKey(note.col)
          setTimeout(() => hitEffectManager.releaseKey(note.col), 80)
          note.hitTiming = note.offset
          note.judgement = new Judgement(JudgementType.PERFECT, note.offset, note.offset)
          const type = note.judgement.type
          this._judgementRecord[type]++
          const effect = new JudgementEffect(note.judgement)
          this.activeEffects.push(effect)
          this.activeDeviations.push(new JudgementDeviationPointEffect(note.offset, 0, type))
          this._combo++
        }
      } else if (note.type === NoteType.HOLD) {
        if (!note.isHeld) {
          if (currentTiming >= note.offset) {
            note.hitTiming = note.offset
            note.isHeld = true

            hitEffectManager.pressKey(note.col)
            const type = JudgementType.PERFECT
            this.activeDeviations.push(new JudgementDeviationPointEffect(note.offset, 0, type))
            this._combo++
          }
        } else {
          if (currentTiming >= note.end) {
            note.releaseTiming = note.end
            note.isHeld = false

            hitEffectManager.releaseKey(note.col)
            note.hit()
            note.judgement = this.createJudgementByRelease(note.offset, note.hitTiming!, note.end, note.releaseTiming)
            this.activeEffects.push(new JudgementEffect(note.judgement!))
            this.judgementRecord[note.judgement!.type]++
            this._combo++
          }
        }
      }
    }
  }

  update(timing: number): void {
    const currentTiming = timing + this._judgementDelay
    const maxMehTime = JudgementAreaCalculators[JudgementType.MEH](this._od)
    const maxOkTime = JudgementAreaCalculators[JudgementType.OK](this._od)
    const notes = this._notes

    this.activeDeviations.update(currentTiming)

    for (let i = 0; i < this._activeEffects.length; i++) {
      const effect = this._activeEffects[i]
      const nextEffect = i < this.activeEffects.length - 1 ? this.activeEffects[i + 1] : null
      effect.update(currentTiming, nextEffect)
    }

    this._activeEffects = this._activeEffects.filter(e => e.active)

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      const type = note.type
      const isHit = note.isHit

      if (isHit) {
        continue
      }

      // 到 miss 区间了还没按，直接判定 miss
      if (type === NoteType.TAP && currentTiming - note.offset > maxMehTime) {
        note.hit()
        this.breakCombo()
        // 没有判定时间
        note.judgement = new Judgement(JudgementType.MISS, currentTiming)
        this._judgementRecord[JudgementType.MISS]++
        const effect = new JudgementEffect(note.judgement)
        this._activeEffects.push(effect)
      } else if (type === NoteType.HOLD) {
        // note 一直按着，如果过了最晚的 meh 区间，进入 miss 区间还不松手，则直接拿最晚的 meh 区间来生成判定
        if (note.isHeld && currentTiming - note.end > maxMehTime) {
          note.hit()
          note.isHeld = false
          note.judgement = this.createJudgementByRelease(note.offset, note.hitTiming!, note.end, currentTiming)
          if (!note.judgement) {
            // 默认直接判定为 meh，但是理论上不应该走到这里，进去的判定一定是在判定表中的
            dev.warn('JudgementManager: createJudgementByRelease returned null, defaulting to meh', {
              note, currentTiming,
            })
            note.judgement = new Judgement(JudgementType.MEH, currentTiming, note.hitTiming!, currentTiming)
          }
          if (note.judgement.type <= JudgementType.MEH) {
            // 直接灰条
            note.grayed = true
            this.breakCombo()
          }
          this._judgementRecord[note.judgement.type]++
          const effect = new JudgementEffect(note.judgement)
          this._activeEffects.push(effect)
        }
        // 长条到了尾判 miss 区间还没按，也没按着，直接判定 miss
        else if (currentTiming - note.end > maxMehTime && !note.isHeld) {
          note.hit()
          note.judgement = new Judgement(JudgementType.MISS, currentTiming)
          note.grayed = true
          this.breakCombo()
          this._judgementRecord[JudgementType.MISS]++
          const effect = new JudgementEffect(note.judgement)
          this._activeEffects.push(effect)
        }
        // 长条如果过了头判 OK 区间还没按，也没按着，则直接灰条断连
        else if (currentTiming - note.offset > maxOkTime && !note.isHeld) {
          note.grayed = true
          if (this._combo > 0) {
            this.breakCombo()
          }
        }
      }

      if (note.judgement) {
        this._processHp(note.judgement.type)
      }
    }
  }

  checkHit(timing: number, hitCol: number): void {
    const hitTiming = this._judgementDelay + timing
    const notes = this._notes
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]

      // 按过的，不是自己轨道的，不处理
      if (note.isHit || hitCol !== note.col) {
        continue
      }

      // 点击时间早于最早的 meh 区间，则不处理
      if (note.offset - hitTiming > JudgementAreaCalculators[JudgementType.MEH](this._od)) {
        continue
      }

      const isHeld = note.isHeld
      const noteType = note.type
      if (noteType === NoteType.TAP) {
        note.judgement = this.createJudgementByHit(note.offset, hitTiming)
        if (!note.judgement) {
          dev.warn('JudgementManager: createJudgementByHit returned null, skipping hit', {
            note, hitTiming,
          })
          // 理论上这里不可能是 null，因为前面已经判断过了，所以默认走 MISS
          note.judgement = new Judgement(JudgementType.MISS, hitTiming, hitTiming)
        }

        note.hit()
        note.hitTiming = hitTiming
        const type = note.judgement.type
        this.judgementRecord[type]++
        const effect = new JudgementEffect(note.judgement)
        this.activeEffects.push(effect)
        this.activeDeviations.push(new JudgementDeviationPointEffect(hitTiming, hitTiming - note.offset, type))

        if (type !== JudgementType.MISS && type !== JudgementType.MEH) {
          this._combo++
        } else {
          this.breakCombo()
        }
        // one hit => one judgement
        if (note.judgement) {
          this._processHp(note.judgement.type)
        }
        break
      } else if (noteType === NoteType.HOLD) {
        if (isHeld) {
          // 如果已经 held 了，就不再处理 hit 事件（键盘 keydown 事件有长按连续触发）
          continue
        }

        const headJudgement = this.createJudgementByHit(note.offset, hitTiming)

        note.hitTiming = hitTiming
        note.isHeld = true
        const type = headJudgement?.type || JudgementType.MISS
        this.activeDeviations.push(new JudgementDeviationPointEffect(hitTiming, hitTiming - note.offset, type))
        break
      }
    }
  }

  checkRelease(timing: number, releaseCol: number): void {
    const releaseTiming = this._judgementDelay + timing

    const notes = this._notes
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
        const deviation = new JudgementDeviationPointEffect(releaseTiming, releaseTiming - note.end, judgement?.type || JudgementType.MISS)
        this.activeDeviations.push(deviation)
      }

      // 如果松手时间早于尾判最早的 meh 区间，则不判定，但是要灰条加断连
      const mehTime = JudgementAreaCalculators[JudgementType.MEH](this._od)
      if (note.end - releaseTiming > mehTime) {
        note.hitTiming = null
        note.grayed = true
        this.breakCombo()
      } else {
        // 开始判定 hitTiming 和 releaseTiming
        note.releaseTiming = releaseTiming

        // 理论上这里不可能存在 releaseTiming - note.end > mehTime 的情况（在到了 miss 区间还没松手），因为在 update 的时候已经判断过了
        if (releaseTiming - note.end > mehTime) {
          dev.warn('JudgementManager: releaseTiming is too late', {
            note, releaseTiming,
          })
          note.judgement = new Judgement(JudgementType.MEH, releaseTiming, note.hitTiming, releaseTiming)
          this.activeEffects.push(new JudgementEffect(note.judgement))
          this.activeDeviations.push(new JudgementDeviationPointEffect(note.releaseTiming, note.releaseTiming - note.end, note.judgement.type))
          this.judgementRecord[JudgementType.MEH]++
          note.hit()
        } else {
          note.hit()
          note.judgement = this.createJudgementByRelease(note.offset, note.hitTiming, note.end, releaseTiming)
          if (!note.judgement) {
            // 理论上不存在这里为 null 的情况，因为前面已经判断过了在 meh 区间松开的情况
            dev.warn('JudgementManager: createJudgementByRelease returned null, skipping release', {
              note, releaseTiming,
            })
            note.judgement = new Judgement(JudgementType.MEH, releaseTiming, note.hitTiming, releaseTiming)
          }
          this.activeEffects.push(new JudgementEffect(note.judgement))
          this.activeDeviations.push(new JudgementDeviationPointEffect(note.releaseTiming, note.releaseTiming - note.end, note.judgement.type))
          this.judgementRecord[note.judgement.type]++
          if (note.judgement.type <= JudgementType.MEH) {
            // 直接灰条 + 断连
            note.grayed = true
            this.breakCombo()
          } else {
            this._combo++
          }
        }
      }

      if (note.judgement) {
        this._processHp(note.judgement.type)
      }
      // 一定有一个判定的，所以检查完当前直接不再向下检查
      break
    }
  }

  breakCombo(): void {
    this._fullCombo = false
    this._maxCombo = Math.max(this._maxCombo, this._combo)
    this._combo = 0
  }
}
