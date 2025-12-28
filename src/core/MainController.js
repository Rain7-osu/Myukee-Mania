import { Beatmap } from './Beatmap'
import { LayoutRenderEngine } from './LayoutRenderEngine'
import { MainLoadingEffect } from './MainLoadingEffect'
import { BeatmapListManager } from './BeatmapListManager'
import { AudioManager } from './AudioManager'
import { KeyboardEventManager } from './KeyboardEventManager'
import { KeyCode } from './KeyCode'
import { Settings } from './Settings'
import { BackgroundDarker } from './BackgroundDarker'
import { StageController } from './StageController'
import { MouseEventManager } from './MouseEventManager'
import { Cursor } from './Cursor'
import { PauseMenu } from './PauseMenu'
import { BackgroundEffect } from './BackgroundEffect'
import { RankingBoard } from './RankingBoard'
import { MainHeader } from './MainHeader'
import { FlashLightEffect } from './FlashLightEffect'
import { BackButton } from './BackButton'
import { FPS } from './FPS'
import { RateChangeEffect } from './RateChangeEffect'
import { MainFooter } from './MainFooter'
import { Mod, ModsPanel } from './ModsPanel'
import { ModsInfoEffect } from './ModsInfo'
import { MAX_SPEED, MIN_SPEED } from './Config'
import { SpeedChangeEffect } from './SpeedChangeEffect'
import { SettingsPanel } from './SettingsPanel'

/**
 * 主界面管理器
 */
export class MainController {
  /**
   * @type {LayoutRenderEngine}
   */
  #layoutEngine

  #loadingEffect = new MainLoadingEffect()

  /**
   * @type {BeatmapListManager}
   */
  #beatmapListManager

  #backgroundDarker = new BackgroundDarker()

  #backgroundEffect = new BackgroundEffect()

  #flashLightEffect = new FlashLightEffect()

  /**
   * @type {MainHeader}
   */
  #mainHeader

  /**
   * @type {MainFooter}
   */
  #mainFooter

  /**
   * @type {BackButton}
   */
  #backButton

  /**
   * @type {RankingBoard}
   */
  #rankingBoard

  /**
   * @type {PauseMenu}
   */
  #pauseMenu

  /**
   * @type {StageController}
   */
  #stageController

  /**
   * @type {number}
   */
  #currentRate = 1

  #loading = false
  #playing = false
  #paused = false
  #showResults = false

  #settings = Settings.getInstance()

  /**
   * @type {HTMLCanvasElement}
   */
  #canvas
  /**
   * @type {HTMLElement}
   */
  #entry

  /**
   * @type {AudioManager}
   */
  #autoManager

  /**
   * @type {KeyboardEventManager}
   */
  #keyboardEventManager

  /**
   * @type {MouseEventManager}
   */
  #mouseEventManager

  /**
   * @type {ValueChangeEffect}
   */
  #rateChangeEffect = null

  /**
   * @type {Cursor}
   */
  #cursor

  /**
   * @type {boolean}
   */
  #backgroundFading = false

  /**
   * @type {BeatmapItem[]}
   */
  #randomHistory = []

  #fps = new FPS()

  /**
   * @type {Mod[]}
   */
  #selectedMods = []

  /**
   * @type {ModsPanel}
   */
  #modsPanel

  /** @type {SpeedChangeEffect} */
  #speedChangeEffect = null

  /**
   * @type {number}
   */
  #cancelAnimation = -1

  /**
   * @type {SettingsPanel}
   */
  #settingsPanel

  /**
   * @type {ModsInfoEffect}
   */
  #modsInfo

  /**
   * @param canvas {HTMLCanvasElement}
   * @param entry {HTMLElement}
   */
  constructor (canvas, entry) {
    if (!canvas) {
      throw new Error('Canvas container can not be null.')
    }

    this.#canvas = canvas
    this.#entry = entry
    this.#layoutEngine = new LayoutRenderEngine(canvas)
    const speed = this.#settings.get('speed')
    this.#autoManager = new AudioManager()
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#mouseEventManager = new MouseEventManager(canvas, 'MainController')
    this.#stageController = new StageController(canvas, this, this.#layoutEngine)
    this.#rankingBoard = new RankingBoard(canvas, this)
    this.#beatmapListManager = new BeatmapListManager(canvas)
    this.#backButton = new BackButton(canvas, this)
    this.#modsPanel = new ModsPanel(canvas, this)
    this.#pauseMenu = new PauseMenu(canvas, this)
    this.#mainFooter = new MainFooter(canvas, this)
    this.#mainHeader = new MainHeader(speed)
    this.#settingsPanel = new SettingsPanel(canvas)
    this.#modsInfo = new ModsInfoEffect()
    this.#cursor = new Cursor()
    this.#modsPanel.display = false
    this.#settingsPanel.display = false
  }

  increaseRate () {
    this.#currentRate += 0.05
    if (this.#currentRate >= 2.5) {
      this.#currentRate = 2.5
    }
    this.#currentRate = +this.#currentRate.toFixed(2)
    this.#rateChangeEffect = new RateChangeEffect(this.#currentRate, performance.now())
    this.#autoManager.setRate(this.#currentRate)
  }

  decreaseRate () {
    this.#currentRate -= 0.05
    if (this.#currentRate <= 0.25) {
      this.#currentRate = 0.25
    }
    this.#currentRate = +this.#currentRate.toFixed(2)
    this.#rateChangeEffect = new RateChangeEffect(this.#currentRate, performance.now())
    this.#autoManager.setRate(this.#currentRate)
  }

  async exit () {
    await this.fadeOut(0, 2000)
    this.#canvas.style.display = 'none'
    this.#entry.style.display = 'flex'
    this.#autoManager.abort()
    this.removeEvents()
    cancelAnimationFrame(this.#cancelAnimation)
  }

  /**
   * 整个控制器的初始化
   * @return {Promise<void>}
   */
  async start () {
    this.#canvas.style.display = 'block'
    this.#entry.style.display = 'none'
    const songs = await this.loadSongList()
    this.#layoutEngine.speed = this.#settings.get('speed')
    this.#beatmapListManager.init(songs)
    const selectItem = this.#beatmapListManager.firstSelect()
    Promise.all([
      this.#mainHeader.setBeatmap(selectItem.beatmap),
      this.#backgroundEffect.setImage(selectItem.beatmap.bgImage),
      this.run(),
    ]).then()
    this._registerModsPanelEvents()
    this._registerBackButtonEvents()
    this._registerKeyboardEvents()
    this._registerMouseEvents()
    this._registerFooterEvents()
    this.loopFrame()
  }

  _registerBackButtonEvents () {
    this.#backButton.initEvents()
  }

  hideRankingBoard () {
    this.#rankingBoard.hide()
  }

  showRankingBoard () {
    return this.#rankingBoard.show()
  }

  /**
   *
   * @param selectedMods {Mod[]}
   */
  async closeModsPanel (selectedMods) {
    this.#selectedMods = selectedMods
    await this.#modsPanel.hide()
    this.#modsInfo.mods = selectedMods
    this.#mouseEventManager.enableEvents()
    this.#keyboardEventManager.enableEvents()
    this.#backButton.enableEvents()
    this.#mainFooter.enableEvents()
    this.#beatmapListManager.beatmapList.enableEvents()
    this.#modsPanel.disableEvents()
  }

  /**
   * @private
   */
  _registerModsPanelEvents () {
    this.#modsPanel.registerEvents()
  }

  _registerFooterEvents () {
    this.#mainFooter.registerEvents()
  }

  async showModsPanel () {
    this.#beatmapListManager.beatmapList.disableEvents()
    this.#keyboardEventManager.disableEvents()
    this.#mouseEventManager.disableEvents()
    this.#backButton.disableEvents()
    this.#mainFooter.disableEvents()
    this.#modsPanel.enableEvents()
    await this.#modsPanel.show()
  }

  async lastRandom () {
    if (this.#randomHistory.length) {
      await this.selectBeatmapItem(this.#randomHistory.pop())
    }
  }

  async random () {
    this.#randomHistory.push(this.#beatmapListManager.selectedItem)
    const beatmapItem = this.#beatmapListManager.random()
    await this.selectBeatmapItem(beatmapItem)
  }

  /**
   * @private
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async playAuto (beatmap) {
    if (this.#autoManager.filename === beatmap.audioFile) {
      if (!this.#autoManager.playing) {
        await this.#autoManager.play()
      }
      return
    }
    this.#autoManager.abort()
    await this.#autoManager.load(beatmap.audioFile, beatmap.previewTime)
    this.#autoManager.setRate(this.#currentRate)
    await this.#autoManager.play()
    this.#autoManager.repeat = true
  }

  async abortPlaying () {
    this.#playing = false
    this.run()
    this.#keyboardEventManager.enableEvents()
    this.#beatmapListManager.beatmapList.enableEvents()
    this.#mainFooter.enableEvents()
    this.#backButton.enableEvents()
    this.#mouseEventManager.enableEvents()
    this.#backgroundDarker.reset()
  }

  /**
   * @private
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async play (beatmap) {
    await this.#stageController.init(beatmap, this.#settings, this.#currentRate, this.#selectedMods)
    this.#stageController.start()
    this.#playing = true
    this.#backButton.scene = 'main'
    this.#showResults = false
    this.#paused = false
    this.#cursor.hide()
  }

  /**
   * 点击了选择的 Beatmap，到真正开始 play 的过渡过程
   * @param beatmap {Beatmap}
   */
  async preparePlay (beatmap) {
    this.#backButton.cancelAnimations()
    this.#backButton.disableEvents()
    this.#mainFooter.disableEvents()
    this.#keyboardEventManager.disableEvents()
    this.#mouseEventManager.disableEvents()
    this.#beatmapListManager.beatmapList.disableEvents()
    this.#autoManager.abort()
    this.#autoManager.abort()
    await Promise.all([
      this.#beatmapListManager.hide(),
      this.#mainHeader.hide(),
      this.#mainFooter.hide(),
      this.#backButton.hide(),
      this.#modsInfo.hide(),
      this.#settingsPanel.hide(),
    ])
    await this.play(beatmap)
    await this.#backgroundDarker.setValue(this.#settings.get('backgroundDark'))
  }

  /**
   * @param beatmapItem {BeatmapItem}
   */
  async selectBeatmapItem (beatmapItem) {
    this.#beatmapListManager.selectItem(beatmapItem)
    await Promise.all([
      this.#mainHeader.setBeatmap(beatmapItem.beatmap),
      this.#flashLightEffect.flash(),
      this.#backgroundEffect.setImage(beatmapItem.beatmap.bgImage),
      this.playAuto(beatmapItem.beatmap),
    ])
  }

  /**
   * 启动的主函数
   * @private
   */
  async run () {
    this.#cursor.show()
    this.#beatmapListManager.beatmapList.initScrollItems(this.#beatmapListManager.selectedItem)

    /**
     * @param item {BeatmapItem}
     */
    const handleClick = item => {
      if (this.#beatmapListManager.selectedItem === item) {
        this.#keyboardEventManager.removeEvents()
        this.preparePlay(item.beatmap)
      } else {
        this.selectBeatmapItem(item)
      }
    }

    this._registerKeyboardEvents()
    this._registerMouseEvents()
    this.#beatmapListManager.beatmapList.registerEvents({
      onClick: handleClick,
    })

    await Promise.all([
      this.playAuto(this.#beatmapListManager.selectedItem.beatmap),
      this.#beatmapListManager.show(),
      this.#mainHeader.show(),
      this.#mainFooter.show(),
      this.#modsInfo.show(),
      this.#backButton.show(),
    ])
  }

  _registerKeyboardEvents () {
    /** @type {KeyboardEventHandler} */
    const handleEnter = async e => {
      e.preventDefault()
      if (!this.#playing) {
        await this.preparePlay(this.#beatmapListManager.selectedItem.beatmap)
      } else if (this.#playing && this.#paused) {
      }
    }
    /** @type {KeyboardEventHandler} */
    const handleRandom = e => {
      if (e.shiftKey) {
        this.lastRandom()
      } else {
        this.random()
      }
    }

    /**
     * @type {Record<KeyCode, KeyboardEventHandler>}
     */
    const keydownEventList = {
      [KeyCode.ENTER]: handleEnter,
      [KeyCode.NUMPAD_ENTER]: handleEnter,
      [KeyCode.O]: e => {
        // process settings
        if (e.ctrlKey) {
          if (!this.#settingsPanel.display) {
            this.showSettingsPanel()
          }
        } else {
          // input o
        }
      },
      // [KeyCode.ARROW_UP]: () => this.#beatmapListManager.selectPrev(),
      // [KeyCode.ARROW_DOWN]: () => this.#beatmapListManager.selectNext(),
      [KeyCode.ESCAPE]: () => {
        if (this.#playing) {
          if (this.#paused) {
            this.resume()
          } else {
            this.pause()
          }
        } else if (this.#settingsPanel.display) {
          this.hideSettingsPanel()
        } else {
          this.exit()
        }
      },
      [KeyCode.F1]: () => this.showModsPanel(),
      [KeyCode.F2]: handleRandom,
      [KeyCode.F3]: e => {
        if (this.#playing) return
        if (e.ctrlKey) {
          this.decreaseSpeed()
        }
      },
      [KeyCode.F4]: e => {
        if (this.#playing) return
        if (e.ctrlKey) {
          this.increaseSpeed()
        }
      },
      [KeyCode.F5]: () => this.#autoManager.resume(),
      [KeyCode.F6]: () => this.#autoManager.pause(),
      [KeyCode.F7]: () => this.decreaseRate(),
      [KeyCode.F8]: () => this.increaseRate(),
    }

    this.#keyboardEventManager.registerEvents({
      keydownEventList,
    })
  }

  showSettingsPanel () {
    this.#backButton.scene = 'settings'
    this.#settingsPanel.show()
  }

  hideSettingsPanel () {
    this.#settingsPanel.hide()
    this.#backButton.scene = 'main'
  }

  _registerMouseEvents () {
    let cursorTimer = -1
    this.#mouseEventManager.registerEvents({
      mousemoveEvents: [
        () => {
          if (!this.#playing) {
            return
          }

          if (!this.#cursor.visible) {
            this.#cursor.show()
          }

          // 如果在游玩中，3 秒后自动隐藏
          clearTimeout(cursorTimer)
          cursorTimer = setTimeout(() => {
            if (this.#playing && !this.#paused) {
              this.#cursor.hide()
            }
          }, 3000)
        },
      ],
      clickEvents: [],
      wheelEvents: [],
    })
  }

  pause () {
    this.#paused = true
    this.#cursor.show()
    this.#pauseMenu.showResume = true
    this.#pauseMenu.showBack = true
    this.#pauseMenu.showRetry = true
    this.#keyboardEventManager.removeEvents()
    this.#pauseMenu.show()
    this.#pauseMenu.registerEvents({})
  }

  /**
   * @param rankingResults {RankingResult}
   */
  async finish (rankingResults) {
    this.#playing = false
    this.#showResults = true
    this.#backButton.scene = 'result'
    this.#rankingBoard.setResult(rankingResults)
    this.#cursor.show()
    this.#rankingBoard.registerEvents()
    this.#backButton.enableEvents()
    await this.fadeIn()
    await Promise.all([
      this.#backButton.show(),
      this.showRankingBoard(),
    ])
  }

  async fail () {
    this.#cursor.show()
    this.#pauseMenu.showRetry = true
    this.#pauseMenu.showBack = true
    this.#pauseMenu.showResume = false
    this.#keyboardEventManager.disableEvents()
    this.#pauseMenu.registerEvents({})
    await this.#pauseMenu.show(true)
  }

  async backMain () {
    this.#showResults = false
    this.#backButton.scene = 'main'
    this.#playing = false
    this.#paused = false
    this.#pauseMenu.hide()
    this.#stageController.quit()
    this.#pauseMenu.removeEvents()
    this.#rankingBoard.removeEvents()
    this.#backButton.cancelAnimations()
    this.#beatmapListManager.beatmapList.enableEvents()
    this.#keyboardEventManager.enableEvents()
    this.#mouseEventManager.enableEvents()
    this.#mainFooter.enableEvents()
  }

  async resume () {
    this.#paused = false
    this.#stageController.resume()
    this.#pauseMenu.hide()
    this.#pauseMenu.removeEvents()
  }

  async retry () {
    this.#playing = true
    this.#paused = false
    this.#showResults = false
    this.#backButton.scene = 'main'
    this.#pauseMenu.hide()
    this.#stageController.retry()
    this.#pauseMenu.removeEvents()
    this.#rankingBoard.removeEvents()
    await this.#backgroundDarker.setValue(this.#settings.get('backgroundDark'))
  }

  removeEvents () {
    this.#keyboardEventManager.removeEvents()
    this.#keyboardEventManager.dispose()
    this.#mouseEventManager.removeEvents()
    this.#backButton.removeEvents()
    this.#mainFooter.removeEvents()
    this.#beatmapListManager.beatmapList.removeEvents()
    this.#modsPanel.removeEvents()
  }

  /**
   * @private
   */
  loopFrame () {
    this.#cancelAnimation = requestAnimationFrame(() => {
      this.updateFrame()
      this.renderFrame()
      this.loopFrame()
    })
  }

  updateFrame () {
    const now = performance.now()

    this.#fps.update(now)
    this.#backgroundDarker.updateEffect(now)

    if (!this.#stageController.realStarted) {
      this.#rankingBoard.updateEffect(now)
      this.#beatmapListManager.beatmapList.updateEffect(now)
      this.#mainHeader.updateEffect(now)
      this.#mainFooter.updateEffect(now)
      this.#backButton.updateEffect(now)
      this.#flashLightEffect.updateEffect(now)
      this.#pauseMenu.updateEffect(now)
      this.#backgroundDarker.updateEffect(now)
      this.#modsInfo.updateEffect(now)
      this.#settingsPanel.updateEffect(now)
      this.#modsPanel.updateEffect(now)
    }

    if (this.#rateChangeEffect) {
      this.#rateChangeEffect.update(now)
      if (!this.#rateChangeEffect.active) {
        this.#rateChangeEffect = null
      }
    }

    if (this.#speedChangeEffect) {
      this.#speedChangeEffect.update(now)

      if (!this.#speedChangeEffect.active) {
        this.#speedChangeEffect = null
      }
    }
  }

  renderFrame () {
    this.#layoutEngine.clearBackground()
    this.#layoutEngine.renderObject(this.#backgroundEffect)

    // if (this.#loading) {
    //   this.renderLoading()
    // }

    if (this.#playing) {
      this.#layoutEngine.renderObject(this.#backgroundDarker)
      this.#stageController.loopFrame()
      if (this.#paused || this.#stageController.failed) {
        this.renderFrameSnapshot()
        this.#layoutEngine.renderObject(this.#pauseMenu)
      }
    } else if (this.#showResults) {
      this.#layoutEngine.renderObject(this.#rankingBoard)
      this.#layoutEngine.renderObject(this.#backButton)
    } else {
      this.#layoutEngine.renderObject(this.#beatmapListManager.beatmapList)
      this.#layoutEngine.renderObject(this.#mainHeader)
      this.#layoutEngine.renderObject(this.#modsInfo)
      this.#layoutEngine.renderObject(this.#mainFooter)
      this.#layoutEngine.renderObject(this.#settingsPanel)
      this.#layoutEngine.renderObject(this.#backButton)
      this.#layoutEngine.renderObject(this.#modsPanel)
    }

    this.#layoutEngine.renderObject(this.#flashLightEffect)

    if (this.#backgroundFading) {
      this.#layoutEngine.renderObject(this.#backgroundDarker)
    }

    if (this.#rateChangeEffect) {
      this.#layoutEngine.renderObject(this.#rateChangeEffect)
    }

    this.#layoutEngine.renderObject(this.#fps)
    this.renderSpeedChangeEffects()
  }

  increaseSpeed () {
    if (this.#layoutEngine.speed >= MAX_SPEED) {
      return
    }
    this.#layoutEngine.speed++
    this.#settings.set('speed', this.#layoutEngine.speed)
    this.#mainHeader.speed = this.#layoutEngine.speed
    this.#speedChangeEffect = new SpeedChangeEffect(this.#layoutEngine.speed, performance.now())
  }

  decreaseSpeed () {
    if (this.#layoutEngine.speed <= MIN_SPEED) {
      return
    }
    this.#layoutEngine.speed--
    this.#settings.set('speed', this.#layoutEngine.speed)
    this.#mainHeader.speed = this.#layoutEngine.speed
    this.#speedChangeEffect = new SpeedChangeEffect(this.#layoutEngine.speed, performance.now())
  }

  renderSpeedChangeEffects () {
    if (this.#speedChangeEffect && this.#speedChangeEffect.active) {
      this.#layoutEngine.renderObject(this.#speedChangeEffect)
    }
  }

  renderFrameSnapshot () {
    const frameSnapshot = this.#stageController.frameSnapshot
    if (frameSnapshot) {
      this.#layoutEngine.renderObject(frameSnapshot)
    }
  }

  /**
   * @private
   */
  renderLoading () {
    this.#layoutEngine.renderObject(this.#loadingEffect)
  }

  async fadeIn (start = 200, end = 300) {
    this.#backgroundFading = true
    await this.#backgroundDarker.setValue(100, start)
    await this.#backgroundDarker.setValue(0, end)
    this.#backgroundFading = false
  }

  async fadeOut (start = 200, end = 300) {
    this.#backgroundFading = true
    await this.#backgroundDarker.setValue(0, start)
    await this.#backgroundDarker.setValue(100, end)
    this.#backgroundFading = false
  }

  /**
   * @private
   * @return {Promise<any[]>}
   */
  async loadSongList () {
    return await fetch('/beatmaps.json').then(res => res.json())
  }
}
