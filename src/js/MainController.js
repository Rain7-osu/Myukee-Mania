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
import { ModsPanel } from './ModsPanel'
import { ModsInfoEffect } from './ModsInfo'
import { MAX_SPEED, MIN_SPEED } from './Config'
import { SpeedChangeEffect } from './SpeedChangeEffect'

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

  #settings = new Settings()

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
  #valueChangeEffect = null

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
    this.#rankingBoard = new RankingBoard(canvas)
    this.#beatmapListManager = new BeatmapListManager(canvas)
    this.#backButton = new BackButton(canvas)
    this.#modsPanel = new ModsPanel(canvas)
    this.#pauseMenu = new PauseMenu(canvas, this)
    this.#mainFooter = new MainFooter(canvas, this)
    this.#mainHeader = new MainHeader(speed)
    this.#cursor = new Cursor()
    this.#modsPanel.display = false
  }

  increaseRate () {
    this.#currentRate += 0.05
    if (this.#currentRate >= 2.5) {
      this.#currentRate = 2.5
    }
    this.#currentRate = +this.#currentRate.toFixed(2)
    this.#valueChangeEffect = new RateChangeEffect(this.#currentRate, performance.now())
    this.#autoManager.setRate(this.#currentRate)
  }

  decreaseRate () {
    this.#currentRate -= 0.05
    if (this.#currentRate <= 0.25) {
      this.#currentRate = 0.25
    }
    this.#currentRate = +this.#currentRate.toFixed(2)
    this.#valueChangeEffect = new RateChangeEffect(this.#currentRate, performance.now())
    this.#autoManager.setRate(this.#currentRate)
  }

  exit () {
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
    this.#backButton.registerEvents({
      onClick: async () => {
        if (this.#showResults) {
          await this.fadeOut()
          this.#rankingBoard.hide()
          await this.backMain()
        } else {
          await this.fadeOut(0, 2000)
          this.exit()
        }
      },
    })
  }

  /**
   * @private
   */
  _registerModsPanelEvents () {
    this.#modsPanel.registerEvents({
      onClose: async (mods) => {
        this.#selectedMods = mods
        await this.#modsPanel.hide()
        this.#mouseEventManager.enableEvents()
        this.#keyboardEventManager.enableEvents()
        this.#backButton.enableEvents()
        this.#mainFooter.enableEvents()
        this.#beatmapListManager.beatmapList.enableEvents()
        this.#modsPanel.disableEvents()
      },
    })
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
    await this.#modsPanel.show()
    this.#modsPanel.enableEvents()
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
    const handleClick = (item) => {
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
      this.#backButton.show(),
    ])
  }

  _registerKeyboardEvents () {
    /** @type {KeyboardEventHandler} */
    const handleEnter = async (e) => {
      e.preventDefault()
      if (!this.#playing) {
        await this.preparePlay(this.#beatmapListManager.selectedItem.beatmap)
      } else if (this.#playing && this.#paused) {
      }
    }
    /** @type {KeyboardEventHandler} */
    const handleRandom = (e) => {
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
      // [KeyCode.ARROW_UP]: () => this.#beatmapListManager.selectPrev(),
      // [KeyCode.ARROW_DOWN]: () => this.#beatmapListManager.selectNext(),
      [KeyCode.ESCAPE]: () => {
        if (this.#playing) {
          if (this.#paused) {
            this.resume()
          } else {
            this.pause()
          }
        }
      },
      [KeyCode.F1]: () => this.showModsPanel(),
      [KeyCode.F2]: handleRandom,
      [KeyCode.F3]: (e) => {
        if (this.#playing) return
        if (e.ctrlKey) {
          this.decreaseSpeed()
        }
      },
      [KeyCode.F4]: (e) => {
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
    this.#rankingBoard.setResult(rankingResults)
    this.#cursor.show()
    this.#rankingBoard.registerEvents({
      onRetry: async () => {
        await this.fadeOut()
        this.#rankingBoard.hide()
        await this.retry()
      },
      onWatchReplay: async () => {
        console.log('Not implements')
      },
    })
    this.#backButton.enableEvents()
    await this.fadeIn()
    await Promise.all([
      this.#backButton.show(),
      this.#rankingBoard.show(),
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
    this.#rankingBoard.updateEffect(now)
    this.#beatmapListManager.beatmapList.updateEffect(now)
    this.#mainHeader.updateEffect(now)
    this.#mainFooter.updateEffect(now)
    this.#backButton.updateEffect(now)
    this.#flashLightEffect.updateEffect(now)
    this.#pauseMenu.updateEffect(now)
    this.#backgroundDarker.updateEffect(now)
    if (this.#modsPanel.display) {
      this.#modsPanel.updateEffect(now)
    }

    if (this.#valueChangeEffect) {
      this.#valueChangeEffect.update(now)
      if (!this.#valueChangeEffect.active) {
        this.#valueChangeEffect = null
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
    this.#layoutEngine.renderShape(this.#backgroundEffect)

    // if (this.#loading) {
    //   this.renderLoading()
    // }

    if (this.#playing) {
      this.#layoutEngine.renderShape(this.#backgroundDarker)
      this.#stageController.loopFrame()
      if (this.#paused || this.#stageController.failed) {
        this.renderFrameSnapshot()
        this.#layoutEngine.renderShape(this.#pauseMenu)
      }
    } else if (this.#showResults) {
      this.#layoutEngine.renderShape(this.#rankingBoard)
      this.#layoutEngine.renderShape(this.#backButton)
    } else {
      this.#layoutEngine.renderShape(this.#beatmapListManager.beatmapList)
      this.#layoutEngine.renderShape(this.#mainHeader)
      this.renderModsInfo()
      this.#layoutEngine.renderShape(this.#mainFooter)
      this.#layoutEngine.renderShape(this.#backButton)
      this.#layoutEngine.renderShape(this.#modsPanel)
    }

    this.#layoutEngine.renderShape(this.#flashLightEffect)

    if (this.#backgroundFading) {
      this.#layoutEngine.renderShape(this.#backgroundDarker)
    }

    if (this.#valueChangeEffect) {
      this.#layoutEngine.renderShape(this.#valueChangeEffect)
    }
    this.#layoutEngine.renderShape(this.#fps)
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
      this.#layoutEngine.renderShape(this.#speedChangeEffect)
    }
  }

  renderFrameSnapshot () {
    const frameSnapshot = this.#stageController.frameSnapshot
    if (frameSnapshot) {
      this.#layoutEngine.renderShape(frameSnapshot)
    }
  }

  renderModsInfo () {
    if (this.#selectedMods && this.#selectedMods.length) {
      this.#layoutEngine.renderShape(new ModsInfoEffect(this.#selectedMods))
    }
  }

  /**
   * @private
   */
  renderLoading () {
    this.#layoutEngine.renderShape(this.#loadingEffect)
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
    return await fetch('./beatmaps.json').then(res => res.json())
  }
}
