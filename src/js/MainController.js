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
import { CANVAS } from './Config'

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

  /**
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    if (canvas) {
      this.#canvas = canvas
      this.#layoutEngine = new LayoutRenderEngine(canvas)
    }

    this.#autoManager = new AudioManager()
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#mouseEventManager = new MouseEventManager(canvas, 'main')
    this.#stageController = new StageController(canvas)
    this.#pauseMenu = new PauseMenu(canvas)
    this.#rankingBoard = new RankingBoard(canvas)
    this.#beatmapListManager = new BeatmapListManager(canvas)
    this.#cursor = new Cursor()
  }

  /**
   * 整个控制器的初始化
   * @return {Promise<void>}
   */
  async start () {
    const songs = await this.loadSongList()
    this.#beatmapListManager.init(songs)
    const selectItem = this.#beatmapListManager.firstSelect()
    await Promise.all([
      this.#mainHeader.setBeatmap(selectItem.beatmap),
      this.#backgroundEffect.setImage(selectItem.beatmap.bgImage),
      this.run(),
    ])
    this.registerEvents()

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
    await this.#stageController.init(beatmap, this.#settings)
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
    this.#beatmapListManager.beatmapList.removeEvents()
    this.#autoManager.abort()
    this.#autoManager.abort()
    await Promise.all([
      this.#beatmapListManager.hide(),
      this.#mainHeader.hide(),
    ])
    if (!this.#interrupt) {
      await this.play(beatmap)
      this.removeEvents()
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
        this.removeEvents()
        this.preparePlay(item.beatmap)
      } else {
        this.selectBeatmapItem(item)
      }
    }

    this.loopFrame()
    await this.playAuto(this.#beatmapListManager.selectedBeatmapItem.beatmap)
    await Promise.all([
      this.#beatmapListManager.show(),
      this.#mainHeader.show(),
    ])
    if (!this.#interrupt) {
      this.registerEvents()
      this.#beatmapListManager.beatmapList.registerEvents({
        onClick: handleClick,
      })
    }
  }

  registerKeyboardEvents () {
    this.#keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ENTER]: async (e) => {
          e.preventDefault()
          if (!document.fullscreenElement) {
            await enterFullscreen()
          }
          if (!this.#playing) {
            await this.preparePlay(this.#beatmapListManager.selectedBeatmapItem.beatmap)
          } else if (this.#playing && this.#paused) {
            await this.resume()
          }
        },
        [KeyCode.ESCAPE]: async () => {
          if (this.#playing) {
            if (this.#paused) {
              await this.resume()
            } else {
              this.pause()
            }
          }
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
          this.registerEvents()
          this.#pauseMenu.hide()
          this.run()
        }
      },
    })
  }

  /**
   * @private
   */
  registerEvents () {
    this.registerKeyboardEvents()
    this.registerMouseEvents()
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

  async fadeIn () {
    this.#backgroundFading = true
    await this.#backgroundDarker.setValue(100, 200)
    await this.#backgroundDarker.setValue(0, 300)
    this.#backgroundFading = false
  }

  async fadeOut () {
    this.#backgroundFading = true
    await this.#backgroundDarker.setValue(0, 200)
    await this.#backgroundDarker.setValue(100, 300)
    this.#backgroundFading = false
  }

  /**
   * @param rankingResults {RankingResult}
   */
  async finish (rankingResults) {
    this.#playing = false
    this.#showResults = true
    this.#rankingBoard.setResult(rankingResults)
    this.#cursor.show()
    await this.fadeIn()
    await this.#rankingBoard.show()
    this.#rankingBoard.registerEvents({
      onRetry: async () => {
        await Promise.all([this.#rankingBoard.hide(), this.fadeOut()])
        console.log('retry')
        await this.retry()
      },
      onBack: async () => {
        await Promise.all([this.#rankingBoard.hide(), this.fadeOut()])
        console.log('backMain')
        await this.backMain()
      },
      onWatchReplay: async () => {
        console.log('Not implements')
      },
    })
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
    this.#beatmapListManager.beatmapList.updateTransition(now)
    this.#backgroundEffect.updateTransition(now)
    this.#backgroundDarker.updateTransition(now)
    this.#flashLightEffect.updateTransition(now)
    this.#pauseMenu.updateTransition(now)
    this.#mainHeader.updateTransition(now)
    this.#rankingBoard.update(now)
  }

  renderFrame () {
    this.#layoutEngine.clearBackground()
    this.renderBackground()

    // if (this.#loading) {
    //   this.renderLoading()
    // }

    if (this.#playing) {
      this.#stageController.loopFrame()
      if (this.#paused) {
        this.renderFrameSnapshot()
        this.renderPauseMenu()
      }
    } else if (this.#showResults) {
      this.renderResultsBoard()
    } else {
      this.renderBeatmaps()
      this.renderHeader()
    }

    if (this.#interrupt) {
      this.renderPauseMenu()
    }

    this.#layoutEngine.renderShape(this.#flashLightEffect)
  }

  renderHeader () {
    this.#layoutEngine.renderShape(this.#mainHeader)
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

    if (this.#playing || this.#backgroundFading) {
      this.#layoutEngine.renderShape(this.#backgroundDarker)
    }
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

  /**
   * @private
   * @return {Promise<any[]>}
   */
  async loadSongList () {
    return await fetch('./beatmaps.json').then(res => res.json())
  }
}
