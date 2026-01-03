import { LayoutRenderEngine } from '../Core/LayoutRenderEngine';
import { Loading } from '../Components/Loading';
import { BeatmapListManager } from '../Managers/BeatmapListManager';
import { BackgroundDarker } from '../Views/BackgroundDarker';
import { BackgroundEffect } from '../Effects/BackgroundEffect';
import { FlashLightEffect } from '../Effects/FlashLightEffect';
import { MainHeader } from '../Views/MainHeader';
import { MainFooter } from '../Views/MainFooter';
import { BackButton } from '../Components/BackButton';
import { RankingBoard, RankingResult } from '../Views/RankingBoard';
import { PauseMenu } from '../Views/PauseMenu';
import { StageController } from './StageController';
import { Settings } from '../Configs/Settings';
import { AudioManager } from '../Managers/AudioManager';
import { KeyboardEventHandler, KeyboardEventManager } from '../Managers/KeyboardEventManager';
import { MouseEventManager } from '../Managers/MouseEventManager';
import { ValueChangeEffect } from '../Effects/ValueChangeEffect';
import { Cursor } from '../Views/Cursor';
import type { BeatmapItem } from '../Views/BeatmapItem';
import { FPS } from '../Views/FPS';
import { Mod } from '../Enums/Mod';
import { ModsPanel } from '../Views/ModsPanel';
import { SpeedChangeEffect } from '../Effects/SpeedChangeEffect';
import { MouseTip } from '../Components/MouseTip';
import { SettingsPanel } from '../Views/SettingsPanel';
import { ModsInfoEffect } from '../Views/ModsInfo';
import { RateChangeEffect } from '../Effects/RateChangeEffect';
import type { Beatmap } from '../Models/Beatmap';
import { KeyCode } from '../Enums/KeyCode';
import { MAX_SPEED, MIN_SPEED } from '../Configs/Config';
import { MainSearch } from '../Components/MainSearch';
import type { IMainController } from '../Interfaces/IMainController';

/**
 * 主界面管理器
 */
export class MainController implements IMainController {
  private readonly _layoutEngine: LayoutRenderEngine

  private _loadingEffect = new Loading()

  private _beatmapListManager: BeatmapListManager

  private _backgroundDarker = new BackgroundDarker()

  private _backgroundEffect = new BackgroundEffect()

  private _flashLightEffect = new FlashLightEffect()

  private readonly _mainHeader: MainHeader

  private readonly _mainFooter: MainFooter

  private readonly _backButton: BackButton

  private readonly _rankingBoard: RankingBoard

  private readonly _pauseMenu: PauseMenu

  private _stageController: StageController

  private _currentRate: number = 1

  private _loading = false
  private _playing = false
  private _paused = false
  private _showResults = false

  private _settings = Settings.getInstance()

  private _canvas: HTMLCanvasElement
  private _entry: HTMLElement

  private _autoManager: AudioManager

  private _keyboardEventManager: KeyboardEventManager

  private _mouseEventManager: MouseEventManager

  private _rateChangeEffect: ValueChangeEffect | null = null

  private _cursor: Cursor

  private _backgroundFading: boolean = false

  private _randomHistory: BeatmapItem[] = []

  private _fps = FPS.getInstance()

  private _selectedMods: Mod[] = []

  private readonly _modsPanel: ModsPanel

  private _speedChangeEffect: SpeedChangeEffect | null = null

  private _cancelAnimation: number = -1

  private readonly _mouseTip: MouseTip

  private readonly _settingsPanel: SettingsPanel

  private readonly _modsInfo: ModsInfoEffect

  private readonly _mainSearch: MainSearch


  constructor(canvas: HTMLCanvasElement, entry: HTMLElement) {
    if (!canvas) {
      throw new Error('Canvas container can not be null.')
    }

    const speed = this._settings.get('speed')

    this._canvas = canvas
    this._entry = entry
    this._layoutEngine = new LayoutRenderEngine(canvas)
    this._mouseTip = MouseTip.createInstance(canvas)
    this._autoManager = new AudioManager()
    this._keyboardEventManager = new KeyboardEventManager()
    this._mouseEventManager = new MouseEventManager(canvas, 'MainController')
    this._stageController = new StageController(canvas, this, this._layoutEngine)
    this._rankingBoard = new RankingBoard(canvas, this)
    this._backButton = new BackButton(canvas, this)
    this._modsPanel = new ModsPanel(canvas, this)
    this._pauseMenu = new PauseMenu(canvas, this)
    this._mainFooter = new MainFooter(canvas, this)
    this._mainSearch = new MainSearch(canvas, this)
    this._mainHeader = new MainHeader(speed)
    this._beatmapListManager = new BeatmapListManager(canvas)
    this._settingsPanel = new SettingsPanel(canvas)
    this._modsInfo = new ModsInfoEffect()
    this._cursor = new Cursor()
    this._modsPanel.display = false
    this._settingsPanel.display = false
  }

  increaseRate() {
    this._currentRate += 0.05
    if (this._currentRate >= 2.5) {
      this._currentRate = 2.5
    }
    this._currentRate = +this._currentRate.toFixed(2)
    this._rateChangeEffect = new RateChangeEffect(this._currentRate, performance.now())
    this._autoManager.setRate(this._currentRate)
    this._autoManager.preservesPitch = false
  }

  decreaseRate() {
    this._currentRate -= 0.05
    if (this._currentRate <= 0.25) {
      this._currentRate = 0.25
    }
    this._currentRate = +this._currentRate.toFixed(2)
    this._rateChangeEffect = new RateChangeEffect(this._currentRate, performance.now())
    this._autoManager.setRate(this._currentRate)
    this._autoManager.preservesPitch = true
  }

  async exit() {
    await this.fadeOut(0, 2000)
    this._canvas.style.display = 'none'
    this._entry.style.display = 'flex'
    this._autoManager.abort()
    this.removeEvents()
    cancelAnimationFrame(this._cancelAnimation)
  }

  /**
   * 整个控制器的初始化
   * @return {Promise<void>}
   */
  async start() {
    this._canvas.style.display = 'block'
    this._entry.style.display = 'none'
    const songs = await this.loadSongList()
    this._layoutEngine.speed = this._settings.get('speed')
    this._beatmapListManager.init(songs)
    const selectItem = this._beatmapListManager.firstSelect()
    Promise.all([
      this._mainHeader.setBeatmap(selectItem.beatmap),
      this._backgroundEffect.setImage(selectItem.beatmap.bgImage),
      this.run(),
    ]).then()
    this._registerModsPanelEvents()
    this._registerBackButtonEvents()
    this._registerKeyboardEvents()
    this._registerMouseEvents()
    this._registerFooterEvents()
    this._registerMainSearchEvents()
    this.loopFrame()
  }

  _registerMainSearchEvents() {
    this._mainSearch.registerEvents()
  }

  _registerBackButtonEvents() {
    this._backButton.registerEvents()
  }

  hideRankingBoard() {
    this._rankingBoard.hide()
  }

  showRankingBoard() {
    return this._rankingBoard.show()
  }

  async closeModsPanel(selectedMods: Mod[]) {
    this._selectedMods = selectedMods
    await this._modsPanel.hide()
    this._modsInfo.mods = selectedMods
    this._mouseEventManager.enableEvents()
    this._keyboardEventManager.enableEvents()
    this._backButton.enableEvents()
    this._mainFooter.enableEvents()
    this._beatmapListManager.beatmapList.enableEvents()
    this._modsPanel.disableEvents()
  }

  /**
   * @private
   */
  _registerModsPanelEvents() {
    this._modsPanel.registerEvents()
    this._modsPanel.disableEvents()
  }

  _registerFooterEvents() {
    this._mainFooter.registerEvents()
  }

  async showModsPanel() {
    this._beatmapListManager.beatmapList.disableEvents()
    this._keyboardEventManager.disableEvents()
    this._mouseEventManager.disableEvents()
    this._backButton.disableEvents()
    this._mainFooter.disableEvents()
    this._modsPanel.enableEvents()
    this._mainSearch.disableEvents()
    await this._modsPanel.show()
  }

  async lastRandom() {
    if (this._randomHistory.length) {
      await this.selectBeatmapItem(this._randomHistory.pop()!)
    }
  }

  async random() {
    this._randomHistory.push(this._beatmapListManager.selectedItem!)
    const beatmapItem = this._beatmapListManager.random()
    await this.selectBeatmapItem(beatmapItem)
  }

  async playAuto(beatmap: Beatmap) {
    if (this._autoManager.filename === beatmap.audioFile) {
      if (!this._autoManager.playing) {
        await this._autoManager.play()
      }
      return
    }
    this._autoManager.abort()
    await this._autoManager.load(beatmap.audioFile, beatmap.previewTime)
    this._autoManager.setRate(this._currentRate)
    await this._autoManager.play()
    this._autoManager.repeat = true
  }

  async abortPlaying() {
    this._playing = false
    this.run()
    this._keyboardEventManager.enableEvents()
    this._beatmapListManager.beatmapList.enableEvents()
    this._mainFooter.enableEvents()
    this._backButton.enableEvents()
    this._mouseEventManager.enableEvents()
    this._backgroundDarker.reset()
  }

  async play(beatmap: Beatmap) {
    await this._stageController.init(beatmap, this._currentRate, this._selectedMods)
    this._stageController.start()
    this._playing = true
    this._backButton.scene = 'main'
    this._showResults = false
    this._paused = false
    this._cursor.hide()
  }

  async preparePlay(beatmap: Beatmap) {
    this._backButton.cancelAnimations()
    this._backButton.disableEvents()
    this._mainFooter.disableEvents()
    this._mainSearch.disableEvents()
    this._keyboardEventManager.disableEvents()
    this._mouseEventManager.disableEvents()
    this._beatmapListManager.beatmapList.disableEvents()
    this._autoManager.abort()
    this._autoManager.abort()
    await Promise.all([
      this._beatmapListManager.hide(),
      this._mainHeader.hide(),
      this._mainFooter.hide(),
      this._backButton.hide(),
      this._modsInfo.hide(),
      this._settingsPanel.hide(),
    ])
    await this.play(beatmap)
    await this._backgroundDarker.setValue(this._settings.get('backgroundDark'))
  }

  async selectBeatmapItem(beatmapItem: BeatmapItem) {
    this._beatmapListManager.select(beatmapItem)
    await Promise.all([
      this._mainHeader.setBeatmap(beatmapItem.beatmap),
      this._flashLightEffect.flash(),
      this._backgroundEffect.setImage(beatmapItem.beatmap.bgImage),
      this.playAuto(beatmapItem.beatmap),
    ])
  }

  async selectPrev() {
    const beatmapItem = this._beatmapListManager.selectPrev()
    await this.selectBeatmapItem(beatmapItem)
  }

  async selectNext() {
    const beatmapItem = this._beatmapListManager.selectNext()
    await this.selectBeatmapItem(beatmapItem)
  }

  /**
   * 启动的主函数
   * @private
   */
  async run() {
    this._cursor.show()
    this._beatmapListManager.beatmapList.layout(this._beatmapListManager.selectedItem!)

    /**
     * @param item {BeatmapItem}
     */
    const handleClick = item => {
      if (this._beatmapListManager.selectedItem === item) {
        this._keyboardEventManager.removeEvents()
        this.preparePlay(item.beatmap)
      } else {
        this.selectBeatmapItem(item)
      }
    }

    this._registerKeyboardEvents()
    this._registerMouseEvents()
    this._beatmapListManager.beatmapList.registerEvents({
      onClick: handleClick,
    })

    await Promise.all([
      this.playAuto(this._beatmapListManager.selectedItem!.beatmap),
      this._beatmapListManager.show(),
      this._mainHeader.show(),
      this._mainFooter.show(),
      this._modsInfo.show(),
      this._backButton.show(),
    ])
  }

  _registerKeyboardEvents() {
    const handleEnter: KeyboardEventHandler = async e => {
      e.preventDefault()
      if (!this._playing) {
        if (this._beatmapListManager.selectedItem === this._beatmapListManager.focusedItem) {
          await this.preparePlay(this._beatmapListManager.selectedItem!.beatmap)
        } else {
          await this.selectBeatmapItem(this._beatmapListManager.focusedItem!)
        }
      } else if (this._playing && this._paused) {
      }
    }

    const handleRandom: KeyboardEventHandler = e => {
      if (e.shiftKey) {
        this.lastRandom()
      } else {
        this.random()
      }
    }

    const keydownEventList: Record<string, KeyboardEventHandler> = {
      [KeyCode.ENTER]: handleEnter,
      [KeyCode.NUMPAD_ENTER]: handleEnter,
      [KeyCode.O]: e => {
        // process settings
        if (e.ctrlKey) {
          if (!this._settingsPanel.display) {
            this.showSettingsPanel()
          }
        } else {
          // input o
        }
      },
      [KeyCode.ARROW_LEFT]: () => this.selectPrev(),
      [KeyCode.ARROW_RIGHT]: () => this.selectNext(),
      [KeyCode.ARROW_UP]: () => this._beatmapListManager.movePrev(),
      [KeyCode.ARROW_DOWN]: () => this._beatmapListManager.moveNext(),
      [KeyCode.ESCAPE]: () => {
        if (this._playing) {
          if (this._paused) {
            this.resume()
          } else {
            this.pause()
          }
        } else if (this._settingsPanel.display) {
          this.hideSettingsPanel()
        } else {
          if (!this._mainSearch.value) {
            this.exit()
          }
        }
      },
      [KeyCode.F1]: () => this.showModsPanel(),
      [KeyCode.F2]: handleRandom,
      [KeyCode.F3]: e => {
        if (this._playing) return
        if (e.ctrlKey) {
          this.decreaseSpeed()
        }
      },
      [KeyCode.F4]: e => {
        if (this._playing) return
        if (e.ctrlKey) {
          this.increaseSpeed()
        }
      },
      [KeyCode.F5]: () => this._autoManager.resume(),
      [KeyCode.F6]: () => this._autoManager.pause(),
      [KeyCode.F7]: e => {
        if (e.ctrlKey) {
          this.decreaseRate()
        }
      },
      [KeyCode.F8]: e => {
        if (e.ctrlKey) {
          this.increaseRate()
        }
      },
    }

    this._keyboardEventManager.registerEvents({
      keydownEventList,
    })
  }

  showSettingsPanel() {
    this._backButton.scene = 'settings'
    this._settingsPanel.show()
    this._settingsPanel.registerEvents()
    this._mainFooter.disableEvents()
    this._mainSearch.disableEvents()
  }

  hideSettingsPanel() {
    this._settingsPanel.hide()
    this._backButton.scene = 'main'
    this._settingsPanel.removeEvents()
    this._mainFooter.enableEvents()
    this._mainSearch.enableEvents()
  }

  _registerMouseEvents() {
    let cursorTimer = -1
    this._mouseEventManager.registerEvents({
      mousemoveEvents: [
        () => {
          if (!this._playing) {
            return
          }

          if (!this._cursor.visible) {
            this._cursor.show()
          }

          // 如果在游玩中，3 秒后自动隐藏
          clearTimeout(cursorTimer)
          cursorTimer = window.setTimeout(() => {
            if (this._playing && !this._paused) {
              this._cursor.hide()
            }
          }, 3000)
        },
      ],
      clickEvents: [],
      wheelEvents: [],
    })
  }

  async pause() {
    this._paused = true
    this._cursor.show()
    this._pauseMenu.showResume = true
    this._pauseMenu.showBack = true
    this._pauseMenu.showRetry = true
    this._keyboardEventManager.removeEvents()
    await this._pauseMenu.show()
    this._pauseMenu.registerEvents()
  }

  async finish(rankingResults: RankingResult) {
    this._playing = false
    this._showResults = true
    this._backButton.scene = 'result'
    this._rankingBoard.setResult(rankingResults)
    this._cursor.show()
    this._rankingBoard.registerEvents()
    this._backButton.enableEvents()
    await this.fadeIn()
    await Promise.all([
      this._backButton.show(),
      this.showRankingBoard(),
    ])
  }

  async fail() {
    this._cursor.show()
    this._pauseMenu.showRetry = true
    this._pauseMenu.showBack = true
    this._pauseMenu.showResume = false
    this._keyboardEventManager.disableEvents()
    this._pauseMenu.registerEvents()
    await this._pauseMenu.show(true)
  }

  async backMain() {
    this._showResults = false
    this._backButton.scene = 'main'
    this._playing = false
    this._paused = false
    this._pauseMenu.hide()
    this._stageController.quit()
    this._pauseMenu.removeEvents()
    this._rankingBoard.removeEvents()
    this._backButton.cancelAnimations()
    this._beatmapListManager.beatmapList.enableEvents()
    this._keyboardEventManager.enableEvents()
    this._mouseEventManager.enableEvents()
    this._mainFooter.enableEvents()
  }

  async resume() {
    this._paused = false
    this._stageController.resume()
    this._pauseMenu.hide()
    this._pauseMenu.removeEvents()
  }

  async retry() {
    this._playing = true
    this._paused = false
    this._showResults = false
    this._backButton.scene = 'main'
    this._pauseMenu.hide()
    this._stageController.retry()
    this._pauseMenu.removeEvents()
    this._rankingBoard.removeEvents()
    await this._backgroundDarker.setValue(this._settings.get('backgroundDark'))
  }

  removeEvents() {
    this._keyboardEventManager.removeEvents()
    this._keyboardEventManager.dispose()
    this._mouseEventManager.removeEvents()
    this._backButton.removeEvents()
    this._mainFooter.removeEvents()
    this._beatmapListManager.beatmapList.removeEvents()
    this._modsPanel.removeEvents()
  }

  /**
   * @private
   */
  loopFrame() {
    this._cancelAnimation = requestAnimationFrame(() => {
      this.updateFrame()
      this.renderFrame()
      this.loopFrame()
    })
  }

  updateFrame() {
    const now = performance.now()

    this._fps.update(now)
    this._backgroundDarker.updateEffect(now)

    if (!this._stageController.realStarted) {
      this._rankingBoard.updateEffect(now)
      this._beatmapListManager.beatmapList.updateEffect(now)
      this._mainHeader.updateEffect(now)
      this._mainFooter.updateEffect(now)
      this._backButton.updateEffect(now)
      this._flashLightEffect.updateEffect(now)
      this._backgroundDarker.updateEffect(now)
      this._modsInfo.updateEffect(now)
      this._settingsPanel.updateEffect(now)
      this._modsPanel.updateEffect(now)
      this._mainSearch.updateEffect(now)
    }

    if (this._paused || this._stageController.failed) {
      this._pauseMenu.updateEffect(now)
    }

    if (this._rateChangeEffect) {
      this._rateChangeEffect.update(now)
      if (!this._rateChangeEffect.active) {
        this._rateChangeEffect = null
      }
    }

    if (this._speedChangeEffect) {
      this._speedChangeEffect.update(now)

      if (!this._speedChangeEffect.active) {
        this._speedChangeEffect = null
      }
    }

    if (this._mouseTip.display) {
      this._mouseTip.updateEffect(now)
    }
  }

  renderFrame() {
    this._layoutEngine.clearBackground()
    this._layoutEngine.renderObject(this._backgroundEffect)

    // if (this._loading) {
    //   this.renderLoading()
    // }

    if (this._playing) {
      this._layoutEngine.renderObject(this._backgroundDarker)
      this._stageController.loopFrame()
      if (this._paused || this._stageController.failed) {
        this.renderFrameSnapshot()
        this._layoutEngine.renderObject(this._pauseMenu)
      }
    } else if (this._showResults) {
      this._layoutEngine.renderObject(this._rankingBoard)
      this._layoutEngine.renderObject(this._backButton)
    } else {
      this._layoutEngine.renderObject(this._beatmapListManager.beatmapList)
      this._layoutEngine.renderObject(this._mainHeader)
      this._layoutEngine.renderObject(this._modsInfo)
      this._layoutEngine.renderObject(this._mainFooter)
      this._layoutEngine.renderObject(this._settingsPanel)
      this._layoutEngine.renderObject(this._backButton)
      this._layoutEngine.renderObject(this._modsPanel)
      this._layoutEngine.renderObject(this._mainSearch)
    }

    this._layoutEngine.renderObject(this._flashLightEffect)

    if (this._backgroundFading) {
      this._layoutEngine.renderObject(this._backgroundDarker)
    }

    if (this._rateChangeEffect) {
      this._layoutEngine.renderObject(this._rateChangeEffect)
    }

    this._layoutEngine.renderObject(this._fps)
    this._layoutEngine.renderObject(this._mouseTip)
    this.renderSpeedChangeEffects()
  }

  increaseSpeed() {
    if (this._layoutEngine.speed >= MAX_SPEED) {
      return
    }
    this._layoutEngine.speed++
    this._settings.set('speed', this._layoutEngine.speed)
    this._mainHeader.speed = this._layoutEngine.speed
    this._speedChangeEffect = new SpeedChangeEffect(this._layoutEngine.speed, performance.now())
  }

  decreaseSpeed() {
    if (this._layoutEngine.speed <= MIN_SPEED) {
      return
    }
    this._layoutEngine.speed--
    this._settings.set('speed', this._layoutEngine.speed)
    this._mainHeader.speed = this._layoutEngine.speed
    this._speedChangeEffect = new SpeedChangeEffect(this._layoutEngine.speed, performance.now())
  }

  renderSpeedChangeEffects() {
    if (this._speedChangeEffect && this._speedChangeEffect.active) {
      this._layoutEngine.renderObject(this._speedChangeEffect)
    }
  }

  renderFrameSnapshot() {
    const frameSnapshot = this._stageController.frameSnapshot
    if (frameSnapshot) {
      this._layoutEngine.renderObject(frameSnapshot)
    }
  }

  /**
   * @private
   */
  renderLoading() {
    this._layoutEngine.renderObject(this._loadingEffect)
  }

  async fadeIn(start = 200, end = 300) {
    this._backgroundFading = true
    await this._backgroundDarker.setValue(100, start)
    await this._backgroundDarker.setValue(0, end)
    this._backgroundFading = false
  }

  async fadeOut(start = 200, end = 300) {
    this._backgroundFading = true
    await this._backgroundDarker.setValue(0, start)
    await this._backgroundDarker.setValue(100, end)
    this._backgroundFading = false
  }

  /**
   * @private
   * @return {Promise<any[]>}
   */
  async loadSongList() {
    return await fetch('/beatmaps.json').then(res => res.json())
  }

  search(searchText: string): void {
    this._beatmapListManager.search(searchText)
  }
}
