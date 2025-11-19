import { Beatmap } from './Beatmap'
import { LayoutRenderEngine } from './LayoutRenderEngine'
import { MainLoadingEffect } from './MainLoadingEffect'
import { BeatmapListManager } from './BeatmapListManager'
import { Game } from './Game'
import { CANVAS } from './Config'
import { AudioManager } from './AudioManager'
import { Skin } from './Skin'
import { KeyboardEventManager } from './KeyboardEventManager'
import { KeyCode } from './KeyCode'

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

  /**
   * @type {Image}
   */
  #currentBackground

  #play = false

  #game = Game.create()

  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  #listConfig = {
    itemHeight: Skin.config.main.beatmap.item.base.height,
    itemSpacing: Skin.config.main.beatmap.item.base.gap,
    // 惯性滚动相关
    velocity: 0,
    isInertiaScrolling: false,
    lastScrollTime: 0,
    lastScrollY: 0,
    friction: 0.95, // 摩擦系数
    minVelocity: 0.1, // 最小速度阈值
    maxVelocity: 75, // 最大速度限制
    scrollY: CANVAS.HEIGHT / 2,
    maxScrollY: CANVAS.HEIGHT / 2,
    minScrollY: CANVAS.HEIGHT / 2,
    wheelEvent: null,
  }

  #autoManager = AudioManager.getInstance()

  #isHoveringItem = false
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
    this.playAuto(this.#beatmapListManager.selectedBeatmapItem.beatmap)
    this.#beatmapListManager.beatmapList.registerEvents(this.#canvas, {
      onClick: (item) => {
        if (this.#beatmapListManager.selectedBeatmapItem === item) {
          this.play(item.beatmap)
          this.disposeEvents()
          this.#beatmapListManager.beatmapList.removeEvents()
        } else {
          this.#beatmapListManager.selectItem(item)
          this.playAuto(item.beatmap)
        }
      },
    })
    this.loopFrame()
  }

  /**
   * @private
   */
  registerEvents () {
    this.#keyboardEventManager.registerStageEvent({
      keydownEventList: {
        [KeyCode.F5]: (e) => {
          e.preventDefault()
          this.#autoManager.pause()
        },
      },
    })
  }

  disposeEvents () {
    this.#keyboardEventManager.removeStageEvent()
  }

  /**
   * @return {Promise<void>}
   */
  async start () {
    const songs = await this.loadSongList()
    this.#beatmapListManager.init(songs)
    this.#beatmapListManager.select()
    this.run()
    this.registerEvents()
  }

  /**
   * @private
   */
  loopFrame () {
    requestAnimationFrame(() => {
      if (this.#play) {
        return
      }
      if (this.#loading) {
        this.renderLoading()
      }

      this.renderBackground()
      this.renderBeatmaps()
      this.#layoutEngine.renderHorizontalLine(720)
      this.#layoutEngine.renderHorizontalLine(400)
      this.loopFrame()
    })
  }

  /**
   * @private
   */
  renderBackground () {
    const selectBeatmap = this.#beatmapListManager.selectedBeatmapItem.beatmap
    if (selectBeatmap) {
      const image = selectBeatmap.bgImage
      this.#layoutEngine.renderBackgroundImage(image)
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
