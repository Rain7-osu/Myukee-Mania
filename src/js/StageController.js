import { DEFAULT_DELAY_TIME } from './Config'
import { KeyboardEventManager } from './KeyboardEventManager'
import { RenderEngine } from './RenderEngine'
import { HitEffectManager } from './HitEffectManager'
import { SectionLine } from './SectionLine'
import { ComboEffect } from './ComboEffect'
import { JudgementManager } from './JudgementManager'
import { KeyCode } from './KeyCode'
import { ScoreManager } from './ScoreManager'
import { JudgementRecordEffect } from './JudgementRecordEffect'
import { ProgressPercentEffect } from './ProgressEffect'
import { AccuracyEffect } from './AccuracyEffect'
import { AccuracyManager } from './AccuracyManager'
import { StageBoard } from './StageBoard'
import { RankingEffect } from './RankingEffect'
import { FrameSnapshot } from './FrameSnapshot'
import { AudioManager } from './AudioManager'
import { FileManager } from './FileManager'
import { MapResolver } from './MapResolver'
import { Settings } from './Settings'
import { Skin } from './Skin'
import { SkipHeadEffect } from './SkipHeadEffect'
import { MouseEventManager } from './MouseEventManager'
import { ActiveEffect } from './ActiveEffect'
import { ModEffect } from './ModEffect'
import { Mod } from './ModsPanel'
import { HpEffect } from './HpEffect'

/**
 * @callback Callback
 * @callback FinishCallback
 * @param rankingResult {RankingResult}
 */

export class StageController extends ActiveEffect {
  /**
   * @type {Settings}
   */
  #settings
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
  #paused

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
   * @type {SkipHeadEffect}
   */
  #skipHeadEffect = null

  /**
   * @type {HpEffect}
   */
  #hpEffect = new HpEffect()

  /**
   * @type {ModEffect}
   */
  #modEffect = null

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
  #playing = false
  /**
   * 是否结束
   * @type {boolean}
   */
  #finished = false

  /**
   * @type {boolean}
   */
  #quited = false

  /**
   * @type {boolean}
   */
  #failed = false

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
   * @type {number}
   */
  #duration = 0

  /**
   * @type {MainController}
   */
  #mainController

  /**
   * @return {boolean}
   */
  get failed () { return this.#failed }

  /**
   * @return {boolean}
   */
  get realStarted () { return this.#realStarted }

  /**
   * @type {HTMLCanvasElement}
   */
  #canvas
  /**
   * @type {FrameSnapshot | null}
   */
  #frameSnapshot = null

  #stageWidth = 0

  #skippedTiming = 0

  /**
   * @type {MouseEventManager}
   */
  #mouseEventHandler

  #pf = false

  /**
   * @constructor
   * @param canvas {HTMLCanvasElement} canvas node name
   * @param mainController {MainController}
   * @param renderEngine {RenderEngine}
   */
  constructor (canvas, mainController, renderEngine) {
    super()
    this.#canvas = canvas
    this.#mainController = mainController
    this.#renderEngine = renderEngine
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#hitEffects = new HitEffectManager()
    this.#judgementManager = new JudgementManager()
    this.#scoreManager = new ScoreManager()
    this.#accuracyManager = new AccuracyManager()
    this.#stageBoard = new StageBoard()
    this.#mouseEventHandler = new MouseEventManager(canvas, 'StageController')
  }

  skipHead () {
    if (this.canSkip()) {
      this.#skippedTiming = this.#playingMap.startTiming - this.getGameTiming() - 3000
      this.#playingAudio.setCurrentTime(this.getGameTiming() / 1000)
      this.#mouseEventHandler.remove(this.#skipHeadEffect)
      this.#skipHeadEffect = null
    }
  }

  /**
   * 计算游戏局时，对于一首曲目基于音频时长的游戏局时间
   * 减去暂停时间
   */
  getGameTiming () {
    const now = performance.now() + this.#skippedTiming
    return now - this.#startTime - this.#totalPauseTime
  }

  canSkip () {
    return this.getGameTiming() - this.#playingMap.startTiming < -3000
  }

  /**
   * @param beatmap {Beatmap}
   * @param settings {Settings}
   * @param rate {number}
   * @param mods {Mod[]}
   * @return void
   */
  async init (beatmap, settings, rate, mods) {
    const { keys } = Skin.config.stage
    this.#settings = settings
    this.reset()

    // map
    this.#beatmap = beatmap
    const mapFile = await FileManager.loadMapFile(beatmap.filename)
    const currentMap = MapResolver.loadFromOsuManiaMap(mapFile)
    currentMap.setRate(rate)
    mods.forEach(mod => currentMap.applyMod(mod))

    // keys
    const { keys: keysCount, notes, overallDifficulty, hpDrainRate } = currentMap
    const { note: { width } } = keys[`keys${keysCount}`]
    this.#stageBoard.init(keysCount)
    this.#hitEffects.keys = keysCount
    this.#stageWidth = keysCount * width
    this.#hpEffect.init(this.#stageBoard.boundary.right)
    const coverMod = mods.find(v => [Mod.FD, Mod.FL, Mod.HD].includes(v))
    if (coverMod) {
      this.#modEffect = new ModEffect(coverMod)
      this.#modEffect.keys = keysCount
    } else {
      this.#modEffect = null
    }

    // audio
    const audio = new AudioManager()
    await audio.load(beatmap.audioFile)
    audio.setRate(rate)
    mods.forEach(mod => audio.applyMod(mod))
    this.#duration = audio.duration / rate
    this.#playingMap = currentMap
    this.#playingAudio = audio

    // init
    if (mods.includes(Mod.PF)) this.#pf = true
    this.initSectionLines()
    this.#judgementManager.init(notes, overallDifficulty, hpDrainRate, this.#hpEffect, () => this.fail())
    this.#scoreManager.init(notes)
    this.#accuracyManager.init(notes)
    this.#mouseEventHandler.registerEvents({})
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
    this.#paused = false
    this.#failed = false
    this.#frameSnapshot = null
    this.#realStarted = false
    this.#startTime = 0
    this.#totalPauseTime = 0
    this.#lastPausedTime = 0
    this.#skippedTiming = 0
    this.#hitEffects.reset()
    this.#playingMap?.reset()
    this.#judgementManager.reset()
    this.#scoreManager.reset()
    this.#playingAudio?.abort()
    this.#keyboardEventManager.removeEvents()
  }

  /**
   * @param flag {boolean} true: run in resume
   * @return Promise<void>
   */
  async playAudio (flag) {
    if (flag) {
      await this.#playingAudio.resume()
    } else {
      const [task] = this.createTimeout(DEFAULT_DELAY_TIME)
      await task
      this.#realStarted = true
      await this.#playingAudio.play()
    }
  }

  registerStageEvent () {
    /** @type {Record<number, KeyCode>} */
    const keyBinds = this.#settings.get('maniaKeyBinds')[`keys${this.#playingMap.keys}`]

    /** @type {KeyCode[]} */
    const hitObjectKeys = Object.values(keyBinds)

    const hitObjectsUpEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          if (this.#paused || !this.#playing) {
            return
          }
          if (this.#keyStatus[key]) {
            const col = hitObjectKeys.indexOf(key)
            this.#hitEffects.releaseKey(col)
            if (col >= 0 && this.#playing && !this.#paused) {
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
          if (this.#paused || !this.#playing) {
            return
          }
          const col = hitObjectKeys.indexOf(key)
          this.#hitEffects.pressKey(col)
          if (col >= 0 && this.#playing && !this.#paused) {
            this.#judgementManager.checkHit(this.getGameTiming(), col)
            this.#keyStatus[key] = true
          }
        },
      }
    }, {})

    const optionKeyEvents = {
      [KeyCode.F4]: (e) => {
        e.preventDefault()
        this.#mainController.increaseSpeed()
      },
      [KeyCode.F3]: (e) => {
        e.preventDefault()
        this.#mainController.decreaseSpeed()
      },
      [KeyCode.TILED]: (e) => {
        e.preventDefault()
        this.retry()
      },
      [KeyCode.SPACE]: () => {
        if (this.#skipHeadEffect) {
          this.skipHead()
        } else {
          hitObjectsDownEvents[KeyCode.SPACE]?.()
        }
      },
      [KeyCode.ESCAPE]: () => {
        if (!this.#realStarted) {
          this.quit()
        }
        if (this.#paused) {
          this.resume()
        } else {
          this.pause()
        }
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

  quit () {
    this.#delayStartTimer && clearTimeout(this.#delayStartTimer)
    this.#quited = true
    this.#playingAudio?.abort()
    this.reset()
    this.#mainController.abortPlaying()
  }

  finish () {
    this.#finished = false
    /** @type {RankingResult} */
    const results = {
      accuracy: this.#accuracyManager.acc,
      maxCombo: this.#judgementManager.maxCombo,
      judgementRecord: this.#judgementManager.judgementRecord,
      fullCombo: this.#judgementManager.fullCombo,
      finishTime: new Date().getTime(),
      score: this.#scoreManager.score,
      beatmap: this.#beatmap,
    }
    this.#mainController.finish(results)
    this.reset()
  }

  /**
   * @return void
   */
  start () {
    this.#playing = true
    this.#finished = false
    this.#startTime = performance.now() + DEFAULT_DELAY_TIME
    this.#stageBoard.show()
    this.#hpEffect.start()
    this.playAudio(false).then(() => {
      if (this.canSkip()) {
        this.#skipHeadEffect = new SkipHeadEffect()
        this.#mouseEventHandler.bind(this.#skipHeadEffect, () => {
          this.#mouseEventHandler.remove(this.#skipHeadEffect)
          this.skipHead()
        })
      }
    })
    this.registerStageEvent()
  }

  /** @type {number | null} */
  #resumeTimer = null

  /**
   * @return void
   */
  pause () {
    this.#keyboardEventManager.removeEvents()
    // 有 resumeTimer，说明是暂停状态下，点了继续，但是还没开始继续下落，在 DELAY 状态，此时则不取消暂停状态，继续暂停就行
    if (this.#resumeTimer !== null && this.#resumeTimer > 0) {
      this.cancelTimeout(this.#resumeTimer)
      this.#resumeTimer = null
    } else {
      this.#paused = true
      this.#lastPausedTime = performance.now()
      this.#playingAudio.pause()
      this.#frameSnapshot = FrameSnapshot.saveSnapshot(this.#canvas)
    }
    this.#mainController.pause()
  }

  async fail () {
    await this.createTimeout(300)[0]
    this.#keyboardEventManager.removeEvents()
    this.#playingAudio.abort()
    this.#frameSnapshot = FrameSnapshot.saveSnapshot(this.#canvas)
    this.#failed = true
    await this.#mainController.fail()
  }

  /**
   * @return void
   */
  async resume () {
    const [task, timer] = this.createTimeout(DEFAULT_DELAY_TIME)
    this.#resumeTimer = timer
    await task
    this.registerStageEvent()
    this.#paused = false
    this.#frameSnapshot = null
    const now = performance.now()
    const currentPausedTime = now - this.#lastPausedTime
    this.#totalPauseTime += currentPausedTime
    this.playAudio(true)
    this.cancelTimeout(this.#resumeTimer)
    this.#resumeTimer = null
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
    if (this.#playing) {
      this.renderStageBoard()
      if (!this.#finished) {
        this.renderSectionLine()
        this.renderNotes()
        this.renderHitEffects()
        this.renderHpEffect()
        this.renderCoverEffect()
        this.renderAccuracyEffect()
        this.renderProgressEffect()
        this.renderScoreEffect()
        this.renderJudgementEffects()
        this.renderComboEffect()
        this.renderJudgementDeviations()
      }
      this.renderSkip()
    }
  }

  loopFrame () {
    // Quit 之后，下一帧重置状态，直接就退出 loopFrame 了
    if (this.#quited) {
      this.#quited = false
      return
    }

    this.updateFrame()
    this.renderFrame()
  }

  updateFrame () {
    if (this.#modEffect) {
      this.#modEffect.combo = this.#judgementManager.combo
    }
    const gameTiming = this.getGameTiming()
    if (this.#playing && this.#playingMap.length < gameTiming || __FORCE_FINISH__) {
      this.#paused = false
      this.#failed = false

      // 1200ms 后隐藏打击面板
      if (this.#stageBoard.visible && this.#playingMap.length < gameTiming - 1200) {
        this.#finished = true
        this.#stageBoard.hide()
      }

      // 2000ms 后开始展示结果面板
      if (this.#playingMap.length < gameTiming - 2000 || __FORCE_FINISH__) {
        this.finish()
        return
      }
    }

    const now = performance.now()
    this.updateTimeout(now)
    if (this.#playing) {
      const timing = gameTiming

      if (!this.#paused && !this.#failed) {
        this.#renderEngine.setTiming(timing)
        this.#judgementManager.update(timing)
        this.#scoreManager.update(now)
        this.#accuracyManager.update()
        if (this.#pf && this.#accuracyManager.acc < 1) {
          this.retry()
          return
        }
        this.#hpEffect.updateEffect(now)
      }
      this.#hitEffects.updateTransition(now)
    }

    this.#stageBoard.updateEffect(now)

    if (this.#skipHeadEffect) {
      if (!this.canSkip()) {
        this.#skipHeadEffect = null
      }
    }
  }

  renderCoverEffect () {
    this.#modEffect && this.#renderEngine.renderShape(this.#modEffect)
  }

  renderJudgementDeviations () {
    this.#renderEngine.renderShape(this.#judgementManager.activeDeviations)
  }

  renderStageBoard () {
    this.#renderEngine.renderShape(this.#stageBoard)
  }

  renderAccuracyEffect () {
    const acc = this.#accuracyManager.acc
    this.#renderEngine.renderShape(new AccuracyEffect(acc))
    this.#renderEngine.renderShape(new RankingEffect(acc))
  }

  renderSkip () {
    if (this.#skipHeadEffect) {
      this.#renderEngine.renderShape(this.#skipHeadEffect)
    }
  }

  renderProgressEffect () {
    const timing = this.getGameTiming()
    const duration = this.#duration
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
      this.#renderEngine.renderOffsetShape(new SectionLine(offset, this.#stageWidth))
    })
  }

  renderHpEffect () {
    this.#renderEngine.renderShape(this.#hpEffect)
  }

  get frameSnapshot () {
    return this.#frameSnapshot
  }
}
