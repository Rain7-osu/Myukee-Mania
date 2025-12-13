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
import { enterFullscreen, exitFullscreen, isFullscreen, listenFullscreenChange } from './dom'
import { PauseMenu } from './PauseMenu'
import { BackgroundEffect } from './BackgroundEffect'
import { RankingBoard } from './RankingBoard'
import { MainHeader } from './MainHeader'
import { FlashLightEffect } from './FlashLightEffect'
import { BackButton } from './BackButton'
import { FPS } from './FPS'
import { RateChangeEffect } from './RateChangeEffect'
import { MainFooter } from './MainFooter'

/**
 * 主界面管理器
 */
export class MainController {
  /**
   * @type {LayoutRenderEngine}
   */
  #layoutEngine

  #loadingEffect = new MainLoadingEffect()

  #beatmapListManager = new BeatmapListManager()

  #backgroundDarker = new BackgroundDarker()

  #backgroundEffect = new BackgroundEffect()

  #flashLightEffect = new FlashLightEffect()

  #mainHeader = new MainHeader()

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
  #interrupt = false
  /**
   * @type {boolean}
   */
  #backgroundFading = false

  #fps = new FPS()

  /**
   * @param canvas {HTMLCanvasElement}
   * @param entry {HTMLElement}
   */
  constructor (canvas, entry) {
    if (canvas) {
      this.#canvas = canvas
      this.#entry = entry
      this.#layoutEngine = new LayoutRenderEngine(canvas)
    }

    this.#autoManager = new AudioManager()
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#mouseEventManager = new MouseEventManager(canvas, 'MainController')
    this.#stageController = new StageController(canvas)
    this.#pauseMenu = new PauseMenu(canvas)
    this.#rankingBoard = new RankingBoard(canvas)
    this.#beatmapListManager = new BeatmapListManager(canvas)
    this.#backButton = new BackButton(canvas)
    this.#mainFooter = new MainFooter(canvas)
    this.#cursor = new Cursor()
  }

  increaseRate () {
    this.#currentRate += 0.05
    if (this.#currentRate >= 2.5) {
      this.#currentRate = 2.5
    }
    this.#currentRate = +this.#currentRate.toFixed(2)
    this.#valueChangeEffect = new RateChangeEffect(this.#currentRate, performance.now())
  }

  decreaseRate () {
    this.#currentRate -= 0.05
    if (this.#currentRate <= 0.25) {
      this.#currentRate = 0.25
    }
    this.#currentRate = +this.#currentRate.toFixed(2)
    this.#valueChangeEffect = new RateChangeEffect(this.#currentRate, performance.now())
  }

  exit () {
    this.#canvas.style.display = 'none'
    this.#entry.style.display = 'flex'
    this.removeEvents()
    this.#autoManager.abort()
  }

  registerMainBackButtonEvents () {
    this.#backButton.registerEvents({
      onClick: async () => {
        await this.fadeOut(0, 2000)
        this.exit()
      },
    })
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
    this.registerKeyboardEvents()
    this.registerMouseEvents()
    this.registerMainBackButtonEvents()
    this.registerFooterEvents()
    this.loopFrame()

    listenFullscreenChange((fullscreen) => {
      if (!fullscreen) {
        if (this.#playing) {
          if (!this.#stageController.realStarted) {
            // 没有真正开始，则直接退出到主屏幕
            this.interrupt()
            this.#stageController.quit()
            return
          }

          if (!this.#paused) {
            this.pause()
          } else {
            // has pause
          }
        } else {
          if (!this.#interrupt) {
            this.interrupt()
          }
        }
      }
    })
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
    await this.#autoManager.play()
  }

  /**
   * @private
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async play (beatmap) {
    this.#stageController.afterQuit(() => {
      this.#playing = false
      this.run()
      this.#backgroundDarker.reset()
    })
    this.#stageController.afterFinish((rankingResults) => {
      this.finish(rankingResults)
    })
    await this.#stageController.init(beatmap, this.#settings, this.#currentRate)
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
    this.#backButton.removeEvents()
    this.#mainFooter.removeEvents()
    this.#beatmapListManager.beatmapList.removeEvents()
    this.#autoManager.abort()
    this.#autoManager.abort()
    await Promise.all([
      this.#beatmapListManager.hide(),
      this.#mainHeader.hide(),
    ])
    if (!this.#interrupt) {
      await this.play(beatmap)
      this.#keyboardEventManager.removeEvents()
      this.#backgroundDarker.setValue(this.#settings.get('backgroundDark'))
    } else {
      this.#playing = false
      await Promise.all([
        this.#beatmapListManager.show(),
        this.#mainHeader.show(),
      ])
    }
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
    this.#beatmapListManager.beatmapList.initScrollItems(this.#beatmapListManager.selectedBeatmapItem)

    /**
     * @param item {BeatmapItem}
     */
    const handleClick = (item) => {
      if (this.#beatmapListManager.selectedBeatmapItem === item) {
        this.#keyboardEventManager.removeEvents()
        this.preparePlay(item.beatmap)
      } else {
        this.selectBeatmapItem(item)
      }
    }

    if (!this.#interrupt) {
      this.registerKeyboardEvents()
      this.registerMouseEvents()
      this.#beatmapListManager.beatmapList.registerEvents({
        onClick: handleClick,
      })
    }

    await Promise.all([
      this.playAuto(this.#beatmapListManager.selectedBeatmapItem.beatmap),
      this.#beatmapListManager.show(),
      this.#mainHeader.show(),
    ])
  }

  registerKeyboardEvents () {
    /** @type {KeyboardEventHandler} */
    const handleEnter = async (e) => {
      e.preventDefault()
      if (!document.fullscreenElement) {
        await enterFullscreen()
      }
      if (!this.#playing) {
        await this.preparePlay(this.#beatmapListManager.selectedBeatmapItem.beatmap)
      } else if (this.#playing && this.#paused) {
        await this.resume()
      }
    }

    this.#keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ENTER]: handleEnter,
        [KeyCode.NUMPAD_ENTER]: handleEnter,
        [KeyCode.ESCAPE]: async () => {
          if (this.#playing) {
            if (this.#paused) {
              await this.resume()
            } else {
              this.pause()
            }
          }
        },
        [KeyCode.F6]: async () => {
          this.#autoManager.pause()
        },
        [KeyCode.F5]: async () => {
          this.#autoManager.resume()
        },
        [KeyCode.F7]: async () => {
          this.decreaseRate()
        },
        [KeyCode.F8]: async () => {
          this.increaseRate()
        },
      },
    })
  }

  registerMouseEvents () {
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

  registerFooterEvents() {
    this.#mainFooter.registerEvents({})
  }

  interrupt () {
    this.#interrupt = true
    this.#pauseMenu.removeEvents()
    this.#pauseMenu.showBack = false
    this.#pauseMenu.showRetry = false
    this.#pauseMenu.showResume = false
    this.#pauseMenu.show()
    this.#beatmapListManager.beatmapList.removeEvents()
    this.#keyboardEventManager.removeEvents()
    this.#mouseEventManager.removeEvents()
    this.#pauseMenu.registerEvents({
      onFullscreenChange: async () => {
        if (isFullscreen()) {
          await exitFullscreen()
        } else {
          await enterFullscreen()
          this.#interrupt = false
          this.registerMainBackButtonEvents()
          this.registerFooterEvents()
          this.registerKeyboardEvents()
          this.registerMouseEvents()
          this.#pauseMenu.hide()
          this.run()
        }
      },
    })
  }

  pause () {
    this.#paused = true
    this.#stageController.pause()
    this.#cursor.show()
    this.#pauseMenu.showResume = true
    this.#pauseMenu.showBack = true
    this.#pauseMenu.showRetry = true
    this.#keyboardEventManager.removeEvents()
    this.#pauseMenu.show()
    this.#pauseMenu.registerEvents({
      onResume: async () => {
        await this.resume()
      },
      onRetry: async () => {
        await this.retry()
      },
      onBack: async () => {
        await this.backMain()
      },
      onFullscreenChange: async () => {
        if (isFullscreen()) {
          await exitFullscreen()
        } else {
          await enterFullscreen()
        }
      },
    })
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
        await Promise.all([this.#rankingBoard.hide(), this.fadeOut()])
        await this.retry()
      },
      onWatchReplay: async () => {
        console.log('Not implements')
      },
    })
    this.#backButton.registerEvents({
      onClick: async () => {
        await Promise.all([this.#rankingBoard.hide(), this.fadeOut()])
        this.#backButton.removeEvents()
        await this.backMain()
      },
    })
    await this.fadeIn()
    await this.#rankingBoard.show()
  }

  async backMain () {
    this.#showResults = false
    this.#playing = false
    this.#paused = false
    await enterFullscreen()
    this.#pauseMenu.hide()
    this.#stageController.quit()
    this.#pauseMenu.removeEvents()
    this.#rankingBoard.removeEvents()
    this.#backButton.cancelAnimations()
    this.registerMainBackButtonEvents()
    this.registerFooterEvents()
  }

  async resume () {
    this.#paused = false
    await enterFullscreen()
    this.#pauseMenu.hide()
    this.#stageController.resume()
    this.#pauseMenu.removeEvents()
  }

  async retry () {
    this.#playing = true
    this.#paused = false
    this.#showResults = false
    await enterFullscreen()
    this.#pauseMenu.hide()
    this.#stageController.retry()
    this.#pauseMenu.removeEvents()
    this.#rankingBoard.removeEvents()
    await this.#backgroundDarker.setValue(this.#settings.get('backgroundDark'))
  }

  removeEvents () {
    this.#keyboardEventManager.removeEvents()
    this.#mouseEventManager.removeEvents()
    this.#backButton.removeEvents()
    this.#mainFooter.removeEvents()
  }

  /**
   * @private
   */
  loopFrame () {
    requestAnimationFrame(() => {
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

    if (this.#valueChangeEffect) {
      this.#valueChangeEffect.update(now)
      if (!this.#valueChangeEffect.active) {
        this.#valueChangeEffect = null
      }
    }
  }

  renderFrame () {
    this.#layoutEngine.clearBackground()
    this.renderBackground()

    // if (this.#loading) {
    //   this.renderLoading()
    // }

    if (this.#playing) {
      this.#layoutEngine.renderShape(this.#backgroundDarker)
      this.#stageController.loopFrame()
      if (this.#paused) {
        this.renderFrameSnapshot()
        this.renderPauseMenu()
      }
    } else if (this.#showResults) {
      this.renderResultsBoard()
      this.#layoutEngine.renderShape(this.#backButton)
    } else {
      this.renderBeatmaps()
      this.renderHeader()
      this.renderFooter()
      this.#layoutEngine.renderShape(this.#backButton)
    }

    this.#layoutEngine.renderShape(this.#flashLightEffect)

    if (this.#interrupt) {
      this.renderPauseMenu()
    }

    if (this.#backgroundFading) {
      this.#layoutEngine.renderShape(this.#backgroundDarker)
    }

    if (this.#valueChangeEffect) {
      this.#layoutEngine.renderShape(this.#valueChangeEffect)
    }
    this.renderFps()
  }

  renderHeader () {
    this.#layoutEngine.renderShape(this.#mainHeader)
  }

  renderFooter () {
    this.#layoutEngine.renderShape(this.#mainFooter)
  }

  renderResultsBoard () {
    this.#layoutEngine.renderShape(this.#rankingBoard)
  }

  renderFrameSnapshot () {
    const frameSnapshot = this.#stageController.frameSnapshot
    if (frameSnapshot) {
      this.#layoutEngine.renderShape(frameSnapshot)
    }
  }

  renderPauseMenu () {
    this.#layoutEngine.renderShape(this.#pauseMenu)
  }

  /**
   * @private
   */
  renderBackground () {
    this.#layoutEngine.renderShape(this.#backgroundEffect)
  }

  /**
   * @private
   */
  renderLoading () {
    this.#layoutEngine.renderShape(this.#loadingEffect)
  }

  /**
   * @private
   */
  renderBeatmaps () {
    this.#layoutEngine.renderShape(this.#beatmapListManager.beatmapList)
  }

  renderFps () {
    this.#layoutEngine.renderShape(this.#fps)
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
