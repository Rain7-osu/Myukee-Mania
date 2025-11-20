import { Beatmap } from './Beatmap'
import { LayoutRenderEngine } from './LayoutRenderEngine'
import { MainLoadingEffect } from './MainLoadingEffect'
import { BeatmapListManager } from './BeatmapListManager'
import { Game } from './Game'
import { AudioManager } from './AudioManager'
import { KeyboardEventManager } from './KeyboardEventManager'
import { KeyCode } from './KeyCode'
import { Settings } from './Settings'
import { BackgroundDarker } from './BackgroundDarker'

/**
 * 主界面管理器
 */
export class MainManager {
  /**
   * @type {LayoutRenderEngine}
   */
  #layoutEngine

  #loadingEffect = new MainLoadingEffect()

  #loading = false

  #beatmapListManager = new BeatmapListManager()

  #backgroundDarker = new BackgroundDarker()

  /**
   * @type {Image}
   */
  #currentBackground

  #play = false

  #game = Game.create()

  #settings = new Settings()

  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  #autoManager = AudioManager.getInstance()

  /**
   * @type {KeyboardEventManager}
   */
  #keyboardEventManager

  /**
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    if (canvas) {
      this.#canvas = canvas
      this.#layoutEngine = new LayoutRenderEngine(canvas)
    }

    this.#keyboardEventManager = new KeyboardEventManager()
  }

  /**
   * @return {Promise<void>}
   */
  async start () {
    const songs = await this.loadSongList()
    this.#beatmapListManager.init(songs)
    this.#beatmapListManager.firstSelect()
    this.run()
    this.registerEvents()
  }

  /**
   * @private
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async playAuto (beatmap) {
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
    this.#play = true
    this.#game.init(() => {
      this.#play = false
      this.run()
      this.#backgroundDarker.reset()
    })
    await this.#game.selectMap(beatmap)
    this.#game.start()
  }

  /**
   * @private
   * @return {Promise<any[]>}
   */
  async loadSongList () {
    return await fetch('./beatmaps.json').then(res => res.json())
  }

  /**
   * @private
   */
  run () {
    this.#beatmapListManager.beatmapList.initScrollItems(this.#beatmapListManager.selectedBeatmapItem)
    this.playAuto(this.#beatmapListManager.selectedBeatmapItem.beatmap)

    /**
     * @param item {BeatmapItem}
     */
    const handleClick = (item) => {
      if (this.#beatmapListManager.selectedBeatmapItem === item) {
        this.#beatmapListManager.beatmapList.removeEvents()
        this.#beatmapListManager.open(() => {
          this.play(item.beatmap)
          this.disposeEvents()
          setTimeout(() => {
            this.#backgroundDarker.value = this.#settings.get('backgroundDark')
          }, 3000)
        })
      } else {
        this.#beatmapListManager.selectItem(item)
        this.playAuto(item.beatmap)
      }
    }

    this.loopFrame()
    this.#beatmapListManager.back(() => {
      this.#beatmapListManager.beatmapList.registerEvents(this.#canvas, {
        onClick: handleClick,
      })
    })
  }

  /**
   * @private
   */
  registerEvents () {
    this.#keyboardEventManager.registerStageEvent({
      keydownEventList: {
        [KeyCode.F5]: () => {
          this.#autoManager.pause()
        },
        [KeyCode.ENTER]: () => {
          console.log('enter')
          this.#beatmapListManager.open(() => {
            this.play(this.#beatmapListManager.selectedBeatmapItem.beatmap)
            setTimeout(() => {
              this.#backgroundDarker.value = this.#settings.get('backgroundDark')
            }, 2000)
          })
        },
      },
    })
  }

  disposeEvents () {
    this.#keyboardEventManager.removeStageEvent()
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
    this.#backgroundDarker.updateTransition()
  }

  renderFrame () {
    this.renderBackground()
    if (this.#loading) {
      this.renderLoading()
    }

    if (this.#play) {
      this.#game.loopFrame()
    } else {
      this.renderBeatmaps()
    }
  }

  /**
   * @private
   */
  renderBackground () {
    const selectBeatmap = this.#beatmapListManager.selectedBeatmapItem.beatmap
    if (selectBeatmap) {
      const image = selectBeatmap.bgImage
      this.#layoutEngine.renderBackgroundImage(image)

      if (this.#play) {
        this.#layoutEngine.renderShape(this.#backgroundDarker)
      }
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
}
