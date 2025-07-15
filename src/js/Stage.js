import { DEFAULT_DELAY_TIME, MAX_SPEED, MIN_SPEED } from './Config'
import { KeyboardEventManager } from './KeyboardEventManager'
import { RenderEngine } from './RenderEngine'
import { HitEffectManager } from './HitEffectManager'
import { FPS } from './FPS'
import { SectionLine } from './SectionLine'
import { ComboEffect } from './ComboEffect'
import { JudgementManager } from './JudgementManager'
import { JudgementEffect } from './JudgementEffect'
import { Judgement, JudgementType } from './Judgement'
import { KeyCode } from './KeyCode'
import { ScoreEffect } from './ScoreEffect'
import { ScoreManager } from './ScoreManager'
import { JudgementRecordEffect } from './JudgementRecordEffect'
import { ProgressPercentEffect } from './ProgressEffect'
import { AccuracyEffect } from './AccuracyEffect'
import { AccuracyManager } from './AccuracyManager'
import { SpeedChangeEffect } from './SpeedChangeEffect'

export class Stage {
  /**
   * @type {RenderEngine}
   */
  #renderEngine

  /**
   * @type {number}
   */
  #requestAnimationFrameHandle

  /**
   * @type {PlayMap}
   */
  #playingMap

  /**
   * @type {AudioManager}
   */
  #playingAudio

  /**
   * every section line offset
   * @type {number[]}
   */
  #sectionLines = []

  /**
   * 是否在一局游戏中处于暂停状态
   * @type {boolean}
   */
  #isPaused

  /**
   * start rendered time
   * @type {number}
   */
  #startTime = -1

  /**
   * 上次按暂停的时间
   * @type {number}
   */
  #lastPausedTime = 0

  /**
   * 本局游戏总共的暂停时间
   * @type {number}
   */
  #totalPauseTime = 0

  /**
   * 帧数记录
   * @type {number[]}
   */
  #frameTimeList = []

  /**
   * @type {KeyboardEventManager}
   */
  #keyboardEventManager

  /**
   * @type {JudgementManager}
   */
  #judgementManager

  /** @type {ScoreManager} */
  #scoreManager

  /**
   * @type {HitEffectManager}
   */
  #hitEffects

  /**
   * @type {{ [key: KeyCode]: boolean }}
   */
  #keyStatus = {}

  /** @type {AccuracyManager} */
  #accuracyManager

  /**
   * 是否在一局游戏中
   * @type {boolean}
   */
  #isPlaying = false

  /** @type {SpeedChangeEffect} */
  #speedChangeEffect = null

  /**
   * @constructor
   * @param root {string} canvas node name
   */
  constructor (root) {
    const canvas = document.getElementById(root)
    this.#renderEngine = new RenderEngine(canvas)
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#hitEffects = new HitEffectManager()
    this.#judgementManager = new JudgementManager()
    this.#scoreManager = new ScoreManager()
    this.#accuracyManager = new AccuracyManager()
  }

  /**
   * 计算游戏局时，对于一首曲目基于音频时长的游戏局时间
   * 减去暂停时间
   */
  getGameTiming () {
    const now = performance.now()
    return now - this.#startTime - this.#totalPauseTime
  }

  /**
   * @param map {PlayMap}
   * @param audio {AudioManager}
   * @return void
   */
  init (map, audio) {
    this.#playingMap = map
    this.#playingAudio = audio
    this.initSectionLines()
    this.#judgementManager.init(this.#playingMap.notes, this.#playingMap.overallDifficulty)
    this.#scoreManager.init(this.#playingMap.notes)
    this.#accuracyManager.init(this.#playingMap.notes)
    this.reset()
  }

  initSectionLines () {
    const timingList = this.#playingMap.timingList
    const duration = this.#playingAudio.duration

    let currentSection = -1
    for (let i = 0; i < timingList.length; i++) {
      const currentTiming = timingList[i]
      const startOffset = currentTiming.offset
      const sectionLen = currentTiming.beatLen * 4
      const endOffset = i + 1 >= timingList.length ? duration : timingList[i + 1].offset

      for (let j = 0; j + startOffset < endOffset; j += sectionLen) {
        currentSection = startOffset + j
        this.#sectionLines.push(currentSection)
      }
    }
  }

  /**
   * @return void
   */
  reset () {
    this.#isPaused = false
    this.#startTime = 0
    this.#totalPauseTime = 0
    this.#lastPausedTime = 0
    this.#frameTimeList = []
    this.#judgementManager.reset()
    this.#playingMap.notes.forEach((item) => item.reset())
  }

  /**
   * @param flag {boolean} true: run in resume
   * @return void
   */
  playAudio (flag) {
    if (flag) {
      this.#playingAudio.play()
    } else {
      setTimeout(() => {
        this.#playingAudio.play()
      }, DEFAULT_DELAY_TIME)
    }
  }

  registerStageEvent () {
    const hitObjectKeys = [KeyCode.D, KeyCode.F, KeyCode.J, KeyCode.K]
    const getTiming = () => this.getGameTiming()

    // { d: func, f: func, j: func, k: func}
    const hitObjectsUpEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          if (this.#keyStatus[key]) {
            this.#hitEffects.releaseKey(key)
            const col = [KeyCode.D, KeyCode.F, KeyCode.J, KeyCode.K].indexOf(key)
            if (col >= 0) {
              this.#judgementManager.checkRelease(getTiming(), col)
            }
            this.#keyStatus[key] = false
          }
        },
      }
    }, {})

    const hitObjectsDownEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          this.#hitEffects.pressKey(key)
          const col = [KeyCode.D, KeyCode.F, KeyCode.J, KeyCode.K].indexOf(key)
          if (col >= 0) {
            this.#judgementManager.checkHit(getTiming(), col)
            this.#keyStatus[key] = true
          }
        },
      }
    }, {})

    const optionKeyEvents = {
      [KeyCode.ESCAPE]: () => {
        if (this.#isPaused) {
          this.resume()
        } else {
          this.pause()
        }
      },
      [KeyCode.F4]: () => this.increaseSpeed(),
      [KeyCode.F3]: () => this.decreaseSpeed(),
    }

    this.#keyboardEventManager.registerStageEvent({
      keypressEventList: [],
      keyupEventList: {
        ...hitObjectsUpEvents,
      },
      keydownEventList: {
        ...hitObjectsDownEvents,
        ...optionKeyEvents,
      },
    })
  }

  /**
   * @return void
   */
  start () {
    this.#isPlaying = true
    this.#startTime = performance.now() + DEFAULT_DELAY_TIME
    this.playAudio(false)
    this.registerStageEvent()
  }

  /**
   * @return void
   */
  pause () {
    this.#isPaused = true
    this.#lastPausedTime = performance.now()
    this.#playingAudio.pause()
  }

  /**
   * @return void
   */
  resume () {
    setTimeout(() => {
      this.#isPaused = false
      const now = performance.now()
      const currentPausedTime = now - this.#lastPausedTime
      this.#totalPauseTime += currentPausedTime
      this.playAudio(true)
    }, DEFAULT_DELAY_TIME)
  }

  retry () {
    this.#playingAudio.abort()
    this.reset()
    this.start()
  }

  renderFrame () {
    this.#renderEngine.renderBackground()

    if (this.#isPlaying) {
      this.renderFps()
      this.renderScoreEffect()
      this.renderJudgementResultEffect()
      this.renderProgressEffect()
      this.renderAccuracyEffect()
      this.renderSectionLine()
      this.renderNotes()
      this.renderHitEffects()
      this.renderJudgementEffects()
      this.renderComboEffect()
      this.renderSpeedChangeEffects()
    }
  }

  loopFrame () {
    if (this.#isPlaying) {
      const timing = this.getGameTiming()

      if (!this.#isPaused) {
        this.#renderEngine.setTiming(timing)
        this.#judgementManager.update(timing)
        this.#scoreManager.calcScore()

        if (timing > this.#playingAudio.duration + 3000) {
          this.#isPlaying = false
          this.#isPaused = false
          alert('游戏结束！')
        }
      }
    }

    if (this.#speedChangeEffect) {
      this.#speedChangeEffect.update()

      if (!this.#speedChangeEffect.active) {
        this.#speedChangeEffect = null
      }
    }

    this.renderFrame()
    this.#requestAnimationFrameHandle = window.requestAnimationFrame(this.loopFrame.bind(this))
  }

  renderSpeedChangeEffects () {
    if (this.#speedChangeEffect && this.#speedChangeEffect.active) {
      this.#renderEngine.renderShape(this.#speedChangeEffect)
    }
  }

  renderAccuracyEffect () {
    const acc = this.#accuracyManager.calcAcc()
    this.#renderEngine.renderShape(new AccuracyEffect(acc))
  }

  renderProgressEffect () {
    const timing = this.getGameTiming()
    const duration = this.#playingAudio.duration
    const percent = timing > duration ? 1.0 : (timing / duration)
    this.#renderEngine.renderShape(new ProgressPercentEffect(percent))
  }

  renderJudgementResultEffect () {
    this.#renderEngine.renderShape(new JudgementRecordEffect(this.#judgementManager.judgementRecord))
  }

  renderScoreEffect () {
    this.#renderEngine.renderShape(new ScoreEffect(this.#scoreManager.score))
  }

  renderJudgementEffects () {
    this.#judgementManager.activeEffects.forEach((e) => {
      this.#renderEngine.renderShape(e)
    })
  }

  renderComboEffect () {
    const combo = new ComboEffect(this.#judgementManager.combo)
    this.#renderEngine.renderShape(combo)
  }

  renderHitEffects () {
    this.#renderEngine.renderShape(this.#hitEffects)
  }

  renderNotes () {
    this.#playingMap.notes.forEach((note) => {
      this.#renderEngine.renderOffsetShape(note)
    })
  }

  renderSectionLine () {
    this.#sectionLines.forEach((offset) => {
      this.#renderEngine.renderOffsetShape(new SectionLine(offset))
    })
  }

  renderFps () {
    const now = performance.now()
    this.#frameTimeList.push(now)

    const first = this.#frameTimeList[0]
    const last = this.#frameTimeList[this.#frameTimeList.length - 1]

    const fpsValue = (1000.0 * this.#frameTimeList.length / (last - first)).toFixed(0)

    if (this.#frameTimeList.length > 200) {
      this.#frameTimeList.shift()
    }

    this.#renderEngine.renderShape(new FPS(fpsValue))
  }

  increaseSpeed () {
    if (this.#renderEngine.speed >= MAX_SPEED) {
      return
    }
    this.#renderEngine.speed++
    this.#speedChangeEffect = new SpeedChangeEffect(this.#renderEngine.speed, performance.now())
  }

  decreaseSpeed () {
    if (this.#renderEngine.speed <= MIN_SPEED) {
      return
    }
    this.#renderEngine.speed--
    this.#speedChangeEffect = new SpeedChangeEffect(this.#renderEngine.speed, performance.now())
  }

  get playingMap () {
    return this.#playingMap
  }

  get audio () {
    return this.#playingAudio
  }

  /**
   * @param timing {number}
   */
  renderSpecialTiming (timing) {
    this.renderFrame()
  }

  dispose () {
    this.#keyboardEventManager.removeStageEvent()
  }

  testRender () {
    this.#renderEngine.renderShape(new ScoreEffect(990133))
  }
}

