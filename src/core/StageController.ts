import { DEFAULT_DELAY_TIME } from './Config'
import { KeyboardEventManager } from './KeyboardEventManager'
import { RenderEngine } from './RenderEngine'
import { HitEffectManager } from './HitEffectManager'
import { ComboEffect } from './ComboEffect'
import { JudgementManager } from './JudgementManager'
import { KeyCode } from './KeyCode'
import { ScoreManager } from './ScoreManager'
import { AccuracyManager } from './AccuracyManager'
import { StageBoard } from './StageBoard'
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
import { SectionLineManager } from './SectionLineManager'
import { ProgressPercentManager } from './ProgressPercentManager'
import type { PlayMap } from './PlayMap'
import type { RankingResult } from './RankingBoard'
import type { Beatmap } from './Beatmap'
import type { MainController } from './MainController'

export class StageController extends ActiveEffect {
  private _settings: Settings
  private _renderEngine: RenderEngine

  private _playingMap: PlayMap | null

  private _playingAudio: AudioManager | null

  /**
   * 是否在一局游戏中处于暂停状态
   */
  private _paused: boolean

  /**
   * start rendered time
   */
  private _startTime = -1

  /**
   * 上次按暂停的时间
   */
  private _lastPausedTime = 0

  /**
   * 本局游戏总共的暂停时间
   */
  private _totalPauseTime = 0

  private _beatmap: Beatmap

  private _keyboardEventManager: KeyboardEventManager

  private _judgementManager: JudgementManager

  private _scoreManager: ScoreManager

  private _skipHeadEffect: SkipHeadEffect | null = null

  private _hpEffect = new HpEffect()

  private _modEffect: ModEffect | null = null

  private readonly _hitEffectManager: HitEffectManager

  private _sectionLineManager = new SectionLineManager()

  private _progressPercentManager = new ProgressPercentManager()

  private _comboEffect = new ComboEffect()

  private _keyStatus: { [key: KeyCode]: boolean } = {}

  private _accuracyManager: AccuracyManager

  private readonly _stageBoard: StageBoard

  /**
   * 是否在一局游戏中
   */
  private _playing = false
  /**
   * 是否结束
   */
  private _finished = false

  private _quited = false

  private _failed = false

  /**
   * 是否真正开始，默认开始有一定的延迟，如果在这个时间段按暂停，会直接退到主屏幕
   */
  private _realStarted = false
  private _delayStartTimer: null | number = null

  private _duration = 0

  private _mainController: MainController

  get failed (): boolean { return this._failed }

  get realStarted (): boolean { return this._realStarted }

  private readonly _canvas: HTMLCanvasElement
  private _frameSnapshot: FrameSnapshot | null = null

  private _stageWidth = 0

  private _skippedTiming = 0

  private _mouseEventHandler: MouseEventManager

  private _pf = false

  private _auto = false

  constructor (canvas: HTMLCanvasElement, mainController: MainController, renderEngine: RenderEngine) {
    super()
    this._canvas = canvas
    this._mainController = mainController
    this._renderEngine = renderEngine
    this._keyboardEventManager = new KeyboardEventManager()
    this._hitEffectManager = new HitEffectManager()
    this._judgementManager = new JudgementManager()
    this._scoreManager = new ScoreManager()
    this._accuracyManager = new AccuracyManager()
    this._stageBoard = new StageBoard()
    this._mouseEventHandler = new MouseEventManager(canvas, 'StageController')
  }

  skipHead (): void {
    if (this.canSkip()) {
      this._skippedTiming = this._playingMap!.startTiming - this.getGameTiming() - 3000
      this._playingAudio!.setCurrentTime(this.getGameTiming() / 1000)
      this._mouseEventHandler.remove(this._skipHeadEffect!)
      this._skipHeadEffect = null
    }
  }

  /**
   * 计算游戏局时，对于一首曲目基于音频时长的游戏局时间
   * 减去暂停时间
   */
  getGameTiming (): number {
    const now = performance.now() + this._skippedTiming
    return now - this._startTime - this._totalPauseTime
  }

  canSkip (): boolean {
    return this.getGameTiming() - this._playingMap!.startTiming < -3000
  }

  async init (beatmap: Beatmap, settings: Settings, rate: number, mods: Mod[]): Promise<void> {
    const { keys } = Skin.config.stage
    this._settings = settings
    this.reset()

    // map
    this._beatmap = beatmap
    const mapFile = await FileManager.loadMapFile(beatmap.filename)
    const currentMap = MapResolver.loadFromOsuManiaMap(mapFile)
    currentMap.setRate(rate)
    mods.forEach(mod => currentMap.applyMod(mod))

    // keys
    const { keys: keysCount, notes, overallDifficulty, hpDrainRate } = currentMap
    const { note: { width } } = keys[`keys${keysCount}`]
    this._stageBoard.init(keysCount)
    this._hitEffectManager.keys = keysCount
    this._stageWidth = keysCount * width
    this._hpEffect.init(this._stageBoard.boundary.right)
    const coverModList = [Mod.FD, Mod.FL, Mod.HD]
    const coverMod = mods.find(v => coverModList.includes(v))
    if (coverMod) {
      this._modEffect = new ModEffect(coverMod)
      this._modEffect.keys = keysCount
    } else {
      this._modEffect = null
    }

    // audio
    const audio = new AudioManager()
    await audio.load(beatmap.audioFile)
    const duration = audio.duration / rate

    audio.setRate(rate)
    mods.forEach(mod => audio.applyMod(mod))
    this._duration = duration
    this._playingMap = currentMap
    this._playingAudio = audio
    this._progressPercentManager.duration = duration

    // init
    this._pf = mods.includes(Mod.PF)
    this._auto = mods.includes(Mod.AT)
    this._sectionLineManager.init(currentMap, audio, this._stageWidth)
    this._judgementManager.init({
      notes,
      od: overallDifficulty,
      hp: hpDrainRate,
      auto: this._auto,
      onFail: () => this.fail(),
      hpEffect: this._hpEffect,
    })
    this._scoreManager.init(notes)
    this._accuracyManager.init(notes)
    this._mouseEventHandler.registerEvents({})
  }

  reset (): void {
    this._paused = false
    this._failed = false
    this._frameSnapshot = null
    this._realStarted = false
    this._startTime = 0
    this._totalPauseTime = 0
    this._lastPausedTime = 0
    this._skippedTiming = 0
    this._hitEffectManager.reset()
    this._playingMap?.reset()
    this._judgementManager.reset()
    this._scoreManager.reset()
    this._playingAudio?.abort()
    this._keyboardEventManager.removeEvents()
  }

  async playAudio (flag: boolean): Promise<void> {
    if (flag) {
      await this._playingAudio!.resume()
    } else {
      await new Promise(resolve => setTimeout(resolve, DEFAULT_DELAY_TIME))
      this._realStarted = true
      await this._playingAudio!.play()
    }
  }

  registerStageEvent (): void {
    const keyBinds: Record<number, KeyCode> = this._settings.get('maniaKeyBinds')[`keys${this._playingMap!.keys}`]

    const hitObjectKeys: KeyCode[] = Object.values(keyBinds)

    const hitObjectsUpEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          if (this._paused || !this._playing || this._auto) {
            return
          }
          if (this._keyStatus[key]) {
            const col = hitObjectKeys.indexOf(key)
            this._hitEffectManager.releaseKey(col)
            if (col >= 0 && this._playing && !this._paused) {
              this._judgementManager.checkRelease(this.getGameTiming(), col)
            }
            this._keyStatus[key] = false
          }
        },
      }
    }, {})

    const hitObjectsDownEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          if (this._paused || !this._playing || this._auto) {
            return
          }
          const col = hitObjectKeys.indexOf(key)
          this._hitEffectManager.pressKey(col)
          if (col >= 0 && this._playing && !this._paused) {
            this._judgementManager.checkHit(this.getGameTiming(), col)
            this._keyStatus[key] = true
          }
        },
      }
    }, {})

    const optionKeyEvents = {
      [KeyCode.F4]: (e: KeyboardEvent) => {
        e.preventDefault()
        this._mainController.increaseSpeed()
      },
      [KeyCode.F3]: (e: KeyboardEvent) => {
        e.preventDefault()
        this._mainController.decreaseSpeed()
      },
      [KeyCode.TILED]: (e: KeyboardEvent) => {
        e.preventDefault()
        this.retry()
      },
      [KeyCode.SPACE]: () => {
        if (this._skipHeadEffect) {
          this.skipHead()
        } else {
          hitObjectsDownEvents[KeyCode.SPACE]?.()
        }
      },
      [KeyCode.ESCAPE]: () => {
        if (!this.realStarted || this._auto) {
          this.quit()
        }
        if (this._paused) {
          this.resume()
        } else {
          this.pause()
        }
      },
    }

    this._keyboardEventManager.registerEvents({
      keypressEventList: {},
      keyupEventList: {
        ...hitObjectsUpEvents,
      },
      keydownEventList: {
        ...hitObjectsDownEvents,
        ...optionKeyEvents,
      },
    })
  }

  quit (): void {
    this._delayStartTimer && clearTimeout(this._delayStartTimer)
    this._quited = true
    this._playingAudio?.abort()
    this.reset()
    this._mainController.abortPlaying()
  }

  finish (): void {
    this._finished = false
    const results: RankingResult = {
      accuracy: this._accuracyManager.acc,
      maxCombo: this._judgementManager.maxCombo,
      judgementRecord: this._judgementManager.judgementRecord,
      fullCombo: this._judgementManager.fullCombo,
      finishTime: new Date().getTime(),
      score: this._scoreManager.score,
      beatmap: this._beatmap,
    }
    this._mainController.finish(results)
    this.reset()
  }

  start (): void {
    this._playing = true
    this._finished = false
    this._startTime = performance.now() + DEFAULT_DELAY_TIME
    this._stageBoard.show()
    this._hpEffect.start()
    this.playAudio(false).then(() => {
      if (this.canSkip()) {
        this._skipHeadEffect = new SkipHeadEffect()
        this._mouseEventHandler.bind(this._skipHeadEffect, () => {
          this._mouseEventHandler.remove(this._skipHeadEffect!)
          this.skipHead()
        })
      }
    })
    this.registerStageEvent()
  }

  private _resumeTimer: number | null = null

  pause (): void {
    this._keyboardEventManager.removeEvents()
    // 有 resumeTimer，说明是暂停状态下，点了继续，但是还没开始继续下落，在 DELAY 状态，此时则不取消暂停状态，继续暂停就行
    if (this._resumeTimer !== null && this._resumeTimer > 0) {
      this.cancelTimeout(this._resumeTimer)
      this._resumeTimer = null
    } else {
      this._paused = true
      this._lastPausedTime = performance.now()
      this._playingAudio!.pause()
      this._frameSnapshot = FrameSnapshot.saveSnapshot(this._canvas)
    }
    this._mainController.pause()
  }

  async fail (): Promise<void> {
    await this.createTimeout(300)[0]
    this._keyboardEventManager.removeEvents()
    this._playingAudio!.abort()
    this._frameSnapshot = FrameSnapshot.saveSnapshot(this._canvas)
    this._failed = true
    await this._mainController.fail()
  }

  async resume (): Promise<void> {
    const [task, timer] = this.createTimeout(DEFAULT_DELAY_TIME)
    this._resumeTimer = timer
    await task
    this.registerStageEvent()
    this._paused = false
    this._frameSnapshot = null
    const now = performance.now()
    const currentPausedTime = now - this._lastPausedTime
    this._totalPauseTime += currentPausedTime
    this.playAudio(true)
    this.cancelTimeout(this._resumeTimer)
    this._resumeTimer = null
  }

  retry (): void {
    this._stageBoard.hide()
    this._frameSnapshot = null
    this._playingAudio!.abort()
    this.reset()
    this.start()
  }

  renderFrame (): void {
    if (this._playing) {
      this.renderStageBoard()
      if (!this._finished) {
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

  loopFrame (): void {
    // Quit 之后，下一帧重置状态，直接就退出 loopFrame 了
    if (this._quited) {
      this._quited = false
      return
    }

    this.updateFrame()
    this.renderFrame()
  }

  updateFrame (): void {
    if (this._modEffect) {
      this._modEffect.combo = this._judgementManager.combo
    }
    const gameTiming = this.getGameTiming()
    if (this._playing && this._playingMap!.length < gameTiming || window.__FORCE_FINISH__) {
      this._paused = false
      this._failed = false

      // 1200ms 后隐藏打击面板
      if (this._stageBoard.visible && this._playingMap!.length < gameTiming - 1200) {
        this._finished = true
        this._stageBoard.hide()
      }

      // 2000ms 后开始展示结果面板
      if (this._playingMap!.length < gameTiming - 2000 || window.__FORCE_FINISH__) {
        this.finish()
        return
      }
    }

    const now = performance.now()
    this.updateTimeout(now)

    if (this._playing && !this._paused && !this._failed) {
      this._renderEngine.setTiming(gameTiming)
      if (this._auto) {
        this._judgementManager.autoPlay(gameTiming, this._hitEffectManager)
      } else {
        this._judgementManager.update(gameTiming)
      }
      this._comboEffect.value = this._judgementManager.combo
      this._scoreManager.update(now, gameTiming)
      this._accuracyManager.update()
      if (this._pf && this._accuracyManager.acc < 1) {
        this.retry()
        return
      }
      this._progressPercentManager.update(gameTiming)
      this._hpEffect.updateEffect(now)
      this._hitEffectManager.update(now)
    }

    this._stageBoard.updateEffect(now)

    if (this._skipHeadEffect) {
      if (!this.canSkip()) {
        this._skipHeadEffect = null
      }
    }
  }

  renderCoverEffect (): void {
    this._modEffect && this._renderEngine.renderObject(this._modEffect)
  }

  renderJudgementDeviations (): void {
    this._renderEngine.renderObject(this._judgementManager.activeDeviations)
  }

  renderStageBoard (): void {
    this._renderEngine.renderObject(this._stageBoard)
  }

  renderAccuracyEffect (): void {
    this._renderEngine.renderObject(this._accuracyManager.accEffect)
    this._renderEngine.renderObject(this._accuracyManager.rankingEffect)
  }

  renderSkip (): void {
    if (this._skipHeadEffect) {
      this._renderEngine.renderObject(this._skipHeadEffect)
    }
  }

  renderProgressEffect (): void {
    this._renderEngine.renderObject(this._progressPercentManager.effect)
  }

  renderScoreEffect (): void {
    this._renderEngine.renderObject(this._scoreManager.effect)
  }

  renderJudgementEffects (): void {
    this._judgementManager.activeEffects.forEach(e => {
      this._renderEngine.renderObject(e)
    })
  }

  renderComboEffect (): void {
    this._renderEngine.renderObject(this._comboEffect)
  }

  renderHitEffects (): void {
    this._hitEffectManager.effects.forEach(effect => this._renderEngine.renderObject(effect))
  }

  renderNotes (): void {
    this._playingMap!.notes.forEach(note => {
      this._renderEngine.renderOffsetObject(note)
    })
  }

  renderSectionLine (): void {
    this._sectionLineManager.effects.forEach(effect => this._renderEngine.renderOffsetObject(effect))
  }

  renderHpEffect (): void {
    this._renderEngine.renderObject(this._hpEffect)
  }

  get frameSnapshot (): FrameSnapshot | null {
    return this._frameSnapshot
  }
}
