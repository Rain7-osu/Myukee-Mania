import { DEFAULT_DELAY_TIME, MAX_SPEED, MIN_SPEED } from './Config.js'
import { KeyboardEventManager } from './KeyboardEventManager.js'
import { RenderEngine } from './RenderEngine.js'
import { HitEffectManager } from './HitEffectManager.js'
import { FPS } from './FPS.js'
import { SectionLine } from './SectionLine.js'
import { ComboEffect } from './ComboEffect.js'
import { JudgementManager } from './JudgementManager.js'
import { KeyCode } from './KeyCode.js'
import { ScoreEffect } from './ScoreEffect.js'
import { ScoreManager } from './ScoreManager.js'
import { JudgementRecordEffect } from './JudgementRecordEffect.js'
import { ProgressPercentEffect } from './ProgressEffect.js'
import { AccuracyEffect } from './AccuracyEffect.js'
import { AccuracyManager } from './AccuracyManager.js'
import { SpeedChangeEffect } from './SpeedChangeEffect.js'
import { StageBoard } from './StageBoard.js'
import { RankEffect } from './RankEffect'

export class StageController {
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

  /** @type {StageBoard} */
  #stageBoard

  /**
   * 是否在一局游戏中
   * @type {boolean}
   */
  #isPlaying = false
  /**
   * @type {boolean}
   */
  #isQuit = false

  /** @type {SpeedChangeEffect} */
  #speedChangeEffect = null

  /**
   * @type {(() => void) | undefined}
   */
  #quitCallback

  set afterQuit (quitCallback) {
    this.#quitCallback = quitCallback
  }

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
    this.#stageBoard = new StageBoard()
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
            if (col >= 0 && this.#isPlaying && !this.#isPaused) {
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
          if (col >= 0 && this.#isPlaying && !this.#isPaused) {
            this.#judgementManager.checkHit(getTiming(), col)
            this.#keyStatus[key] = true
          }
        },
      }
    }, {})

    const optionKeyEvents = {
      [KeyCode.F1]: () => {
        if (this.#isPaused) {
          this.resume()
        } else {
          this.pause()
        }
      },
      [KeyCode.F2]: () => {
        this.quit()
      },
      [KeyCode.F4]: () => this.increaseSpeed(),
      [KeyCode.F3]: () => this.decreaseSpeed(),
      [KeyCode.TILED]: () => this.retry(),
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

  quit () {
    this.#isQuit = true
    this.#quitCallback?.()
    this.audio.abort()
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

  /** @type {number | null} */
  #resumeTimer = null

  /**
   * @return void
   */
  pause () {
    // 有 resumeTimer，说明是暂停状态下，点了继续，但是还没开始继续下落，在 DELAY 状态，此时则不取消暂停状态，继续暂停就行
    if (this.#resumeTimer !== null) {
      clearTimeout(this.#resumeTimer)
      this.#resumeTimer = null
    } else {
      this.#isPaused = true
      this.#lastPausedTime = performance.now()
      this.#playingAudio.pause()
    }
  }

  /**
   * @return void
   */
  resume () {
    this.#resumeTimer = setTimeout(() => {
      this.#isPaused = false
      const now = performance.now()
      const currentPausedTime = now - this.#lastPausedTime
      this.#totalPauseTime += currentPausedTime
      this.playAudio(true)

      clearTimeout(this.#resumeTimer)
      this.#resumeTimer = null
    }, DEFAULT_DELAY_TIME)
  }

  retry () {
    this.#playingAudio.abort()
    this.reset()
    this.start()
  }

  renderFrame () {
    this.#renderEngine.clearBackground()

    if (this.#isPlaying) {
      this.renderFps()
      this.renderScoreEffect()
      this.renderJudgementResultEffect()
      this.renderProgressEffect()
      this.renderAccuracyEffect()
      this.renderSectionLine()
      this.renderNotes()
      this.renderHitEffects()
      this.#renderEngine.renderShape(this.#stageBoard)
      this.renderJudgementEffects()
      this.renderComboEffect()
      this.renderSpeedChangeEffects()
      this.#renderEngine.renderShape(this.#judgementManager.activeDeviations)
    }
  }

  loopFrame () {
    if (this.#isQuit) {
      this.#isQuit = false
      return
    }

    if (this.#isPlaying) {
      const timing = this.getGameTiming()

      if (!this.#isPaused) {
        this.#renderEngine.setTiming(timing)
        this.#judgementManager.update(timing)
        this.#scoreManager.calcScore()

        if (timing > this.#playingAudio.duration + 3000) {
          this.#isPlaying = false
          this.#isPaused = false
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
    this.#renderEngine.renderShape(new RankEffect(acc))
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
}

