import { DEFAULT_DELAY_TIME, MAX_SPEED, MIN_SPEED } from './Config'
import { KeyboardEventManager } from './KeyboardEventManager'
import { RenderEngine } from './RenderEngine'
import { HitEffectManager } from './HitEffectManager'
import { FPS } from './FPS'
import { SectionLine } from './SectionLine'
import { ComboEffect } from './ComboEffect'
import { JudgementManager } from './JudgementManager'
import { KeyCode } from './KeyCode'
import { ScoreManager } from './ScoreManager'
import { JudgementRecordEffect } from './JudgementRecordEffect'
import { ProgressPercentEffect } from './ProgressEffect'
import { AccuracyEffect } from './AccuracyEffect'
import { AccuracyManager } from './AccuracyManager'
import { SpeedChangeEffect } from './SpeedChangeEffect'
import { StageBoard } from './StageBoard'
import { RankingEffect } from './RankingEffect'
import { JudgementLineEffect } from './JudgementLineEffect'
import { FrameSnapshot } from './FrameSnapshot'
import { AudioManager } from './AudioManager'
import { FileManager } from './FileManager'
import { MapResolver } from './MapResolver'
import { createLimitLog } from './dev'

/**
 * @callback Callback
 * @callback FinishCallback
 * @param rankingResult {RankingResult}
 */

export class StageController {
  /**
   * @type {RenderEngine}
   */
  #renderEngine

  /**
   * @type {PlayMap | null}
   */
  #playingMap

  /**
   * @type {AudioManager | null}
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
   * @type {Beatmap}
   */
  #beatmap

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

  /** @type {JudgementLineEffect} */
  #judgementLineEffect

  /**
   * 是否在一局游戏中
   * @type {boolean}
   */
  #isPlaying = false
  /**
   * 是否结束
   * @type {boolean}
   */
  #finished = false

  /**
   * @type {boolean}
   */
  #isQuit = false

  /**
   * 是否真正开始，默认开始有一定的延迟，如果在这个时间段按暂停，会直接退到主屏幕
   * @type {boolean}
   */
  #realStarted = false
  /**
   * @type {null | number}
   */
  #delayStartTimer = null

  /**
   * @return {boolean}
   */
  get realStarted () { return this.#realStarted }

  /** @type {SpeedChangeEffect} */
  #speedChangeEffect = null

  /**
   * @type {Callback}
   */
  #quitCallback
  /**
   * @type {FinishCallback}
   */
  #finishCallback

  /**
   * @type {HTMLCanvasElement}
   */
  #canvas
  /**
   * @type {FrameSnapshot | null}
   */
  #frameSnapshot = null

  /**
   * @constructor
   * @param canvas {HTMLCanvasElement} canvas node name
   */
  constructor (canvas) {
    this.#canvas = canvas
    this.#renderEngine = new RenderEngine(canvas)
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#hitEffects = new HitEffectManager()
    this.#judgementManager = new JudgementManager()
    this.#scoreManager = new ScoreManager()
    this.#accuracyManager = new AccuracyManager()
    this.#stageBoard = new StageBoard()
    this.#judgementLineEffect = new JudgementLineEffect()
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
   * @param beatmap {Beatmap}
   * @return void
   */
  async init (beatmap) {
    this.reset()
    this.#beatmap = beatmap
    const mapFile = await FileManager.loadMapFile(beatmap.filename)
    const currentMap = MapResolver.loadFromOsuManiaMap(mapFile)
    const audio = new AudioManager()
    await audio.load(beatmap.audioFile)
    this.#playingMap = currentMap
    this.#playingAudio = audio
    this.initSectionLines()
    const { notes, overallDifficulty } = this.#playingMap
    this.#judgementManager.init(notes, overallDifficulty)
    this.#scoreManager.init(notes)
    this.#accuracyManager.init(notes)
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
    this.#frameSnapshot = null
    this.#realStarted = false
    this.#startTime = 0
    this.#totalPauseTime = 0
    this.#lastPausedTime = 0
    this.#frameTimeList = []
    this.#playingMap?.reset()
    this.#judgementManager.reset()
    this.#scoreManager.reset()
    this.#hitEffects.reset()
    this.#playingAudio?.abort()
    this.#keyboardEventManager.removeEvents()
  }

  /**
   * @param flag {boolean} true: run in resume
   * @return void
   */
  async playAudio (flag) {
    if (flag) {
      await this.#playingAudio.resume()
    } else {
      // setTimeout 会与帧不同步，要优化
      this.#delayStartTimer = setTimeout(() => {
        this.#realStarted = true
        this.#playingAudio.play()
      }, DEFAULT_DELAY_TIME)
    }
  }

  registerStageEvent () {
    /** @type {KeyCode[]} */
    const hitObjectKeys = [KeyCode.D, KeyCode.F, KeyCode.J, KeyCode.K]

    const hitObjectsUpEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          if (this.#isPaused || !this.#isPlaying) {
            return
          }
          if (this.#keyStatus[key]) {
            this.#hitEffects.releaseKey(key)
            const col = hitObjectKeys.indexOf(key)
            if (col >= 0 && this.#isPlaying && !this.#isPaused) {
              this.#judgementManager.checkRelease(this.getGameTiming(), col)
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
          if (this.#isPaused || !this.#isPlaying) {
            return
          }
          this.#hitEffects.pressKey(key)
          const col = [KeyCode.D, KeyCode.F, KeyCode.J, KeyCode.K].indexOf(key)
          if (col >= 0 && this.#isPlaying && !this.#isPaused) {
            this.#judgementManager.checkHit(this.getGameTiming(), col)
            this.#keyStatus[key] = true
          }
        },
      }
    }, {})

    const optionKeyEvents = {
      [KeyCode.F4]: (e) => {
        e.preventDefault()
        this.increaseSpeed()
      },
      [KeyCode.F3]: (e) => {
        e.preventDefault()
        this.decreaseSpeed()
      },
      [KeyCode.TILED]: (e) => {
        e.preventDefault()
        this.retry()
      },
    }

    this.#keyboardEventManager.registerEvents({
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
   * @param quitCallback {Callback}
   */
  afterQuit (quitCallback) {
    this.#quitCallback = quitCallback
  }

  quit () {
    this.#delayStartTimer && clearTimeout(this.#delayStartTimer)
    this.#isQuit = true
    this.#playingAudio?.abort()
    this.reset()
    this.#quitCallback?.()
  }

  /**
   * @param finishCallback {FinishCallback}
   */
  afterFinish (finishCallback) {
    this.#finishCallback = finishCallback
  }

  finish () {
    this.#finished = false
    /**
     * @type {RankingResult}
     */
    const results = {
      accuracy: this.#accuracyManager.acc,
      maxCombo: this.#judgementManager.maxCombo,
      judgementRecord: this.#judgementManager.judgementRecord,
      fullCombo: this.#judgementManager.fullCombo,
      finishTime: new Date().getTime(),
      score: this.#scoreManager.score,
      beatmap: this.#beatmap,
    }

    this.#finishCallback(results)
    this.reset()
  }

  /**
   * @return void
   */
  start () {
    this.#isPlaying = true
    this.#finished = false
    this.#startTime = performance.now() + DEFAULT_DELAY_TIME
    this.playAudio(false)
    this.registerStageEvent()
    this.#stageBoard.show()
  }

  /** @type {number | null} */
  #resumeTimer = null

  /**
   * @return void
   */
  pause () {
    this.#keyboardEventManager.removeEvents()
    // 有 resumeTimer，说明是暂停状态下，点了继续，但是还没开始继续下落，在 DELAY 状态，此时则不取消暂停状态，继续暂停就行
    if (this.#resumeTimer !== null) {
      clearTimeout(this.#resumeTimer)
      this.#resumeTimer = null
    } else {
      this.#isPaused = true
      this.#lastPausedTime = performance.now()
      this.#playingAudio.pause()
      this.#frameSnapshot = FrameSnapshot.saveSnapshot(this.#canvas)
    }
  }

  /**
   * @return void
   */
  resume () {
    this.#resumeTimer = setTimeout(() => {
      this.registerStageEvent()
      this.#isPaused = false
      this.#frameSnapshot = null
      const now = performance.now()
      const currentPausedTime = now - this.#lastPausedTime
      this.#totalPauseTime += currentPausedTime
      this.playAudio(true)

      clearTimeout(this.#resumeTimer)
      this.#resumeTimer = null
    }, DEFAULT_DELAY_TIME)
  }

  retry () {
    this.#stageBoard.hide()
    this.#frameSnapshot = null
    this.#playingAudio.abort()
    this.reset()
    this.start()
  }

  renderFrame () {
    // TODO update 逻辑抽出
    if (this.#isPlaying) {
      this.renderFps()
      this.renderStageBoard()
      this.renderScoreEffect()
      // this.renderJudgementResultEffect()
      this.renderProgressEffect()
      this.renderAccuracyEffect()
      this.renderSectionLine()
      this.renderNotes()
      this.renderHitEffects()
      this.renderJudgementEffects()
      this.renderComboEffect()
      this.renderJudgementLine()
      this.renderSpeedChangeEffects()
      this.renderJudgementDeviations()
    }
  }

  loopFrame () {
    // Quit 之后，下一帧重置状态，直接就退出 loopFrame 了
    if (this.#isQuit) {
      this.#isQuit = false
      return
    }

    log('renderStart', performance.now())
    this.updateFrame()
    this.renderFrame()
    log('renderEnd', performance.now())
  }

  updateFrame () {
    if (this.#isPlaying && this.#playingMap.length < this.getGameTiming()) {
      this.#finished = true
      this.#isPaused = false
      this.#stageBoard.hide()

      if (this.#playingMap.length < this.getGameTiming() + 3) {
        this.finish()
        return
      }
    }

    const now = performance.now()
    if (this.#isPlaying) {
      const timing = this.getGameTiming()

      if (!this.#isPaused) {
        this.#renderEngine.setTiming(timing)
        this.#judgementManager.update(timing)
        this.#scoreManager.update()
        this.#accuracyManager.update()
      }
    }

    if (this.#speedChangeEffect) {
      this.#speedChangeEffect.update()

      if (!this.#speedChangeEffect.active) {
        this.#speedChangeEffect = null
      }
    }

    this.#stageBoard.updateTransition(now)
  }

  renderJudgementLine () {
    this.#renderEngine.renderShape(this.#judgementLineEffect)
  }

  renderJudgementDeviations () {
    this.#renderEngine.renderShape(this.#judgementManager.activeDeviations)
  }

  renderStageBoard () {
    this.#renderEngine.renderShape(this.#stageBoard)
  }

  renderSpeedChangeEffects () {
    if (this.#speedChangeEffect && this.#speedChangeEffect.active) {
      this.#renderEngine.renderShape(this.#speedChangeEffect)
    }
  }

  renderAccuracyEffect () {
    const acc = this.#accuracyManager.acc
    this.#renderEngine.renderShape(new AccuracyEffect(acc))
    this.#renderEngine.renderShape(new RankingEffect(acc))
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
    this.#renderEngine.renderShape(this.#scoreManager.effect)
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
    this.#playingMap?.notes.forEach((note) => {
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

  get frameSnapshot () {
    return this.#frameSnapshot
  }
}

const log = createLimitLog(2, 1000)
