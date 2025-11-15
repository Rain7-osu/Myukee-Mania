import { Beatmap } from './Beatmap'
import { LayoutRenderEngine } from './LayoutRenderEngine'
import { MainLoadingEffect } from './MainLoadingEffect'
import { BeatmapListManager } from './BeatmapListManager'
import { Game } from './Game'
import { BeatmapItem } from './BeatmapItem'
import { BeatmapList } from './BeatmapList'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './Config'
import { AudioManager } from './AudioManager'

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
    itemHeight: BeatmapItem.configs.HEIGHT,
    itemSpacing: BeatmapList.configs.GAP,
    // 惯性滚动相关
    velocity: 0,
    isInertiaScrolling: false,
    lastScrollTime: 0,
    lastScrollY: 0,
    friction: 0.95, // 摩擦系数
    minVelocity: 0.1, // 最小速度阈值
    maxVelocity: 75, // 最大速度限制
    scrollY: CANVAS_HEIGHT / 2,
    maxScrollY: CANVAS_HEIGHT / 2,
    minScrollY: CANVAS_HEIGHT / 2,
  }

  #autoManager = AudioManager.getInstance()

  #isHoveringItem = false

  /**
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    if (canvas) {
      this.#canvas = canvas
      this.#layoutEngine = new LayoutRenderEngine(canvas)
    }
  }

  init () {
    const canvas = this.#canvas
    const config = this.#listConfig
    // 允许滚动到最下面的时候，下面空半个屏幕
    config.minScrollY = -this.#beatmapListManager.beatmaps.length * (config.itemHeight + config.itemSpacing)
      + CANVAS_HEIGHT / 2
    // 允许滚动到最上面，上面空半个屏幕
    config.maxScrollY = CANVAS_HEIGHT / 2
    this.#beatmapListManager.beatmapList.scrollY = config.scrollY

    /**
     * @param e {HTMLElementEventMap['canvas']}
     */
    const handelMouseMove = (e) => {
      if (this.#play) {
        return
      }
      const x = e.clientX
      if (x < CANVAS_WIDTH / 2) {
        this.#isHoveringItem = false
        this.#beatmapListManager.hoverOut()
        return
      }
      const y = e.clientY

      const items = this.#beatmapListManager.beatmaps
      // 检查是否在列表项上 TODO 计算一下，减少额外遍历
      const startIndex = 0
      const endIndex = items.length - 1

      let hoveredItem = null
      for (let i = startIndex; i <= endIndex; i++) {
        const itemY = items[i].offsetY

        if (y >= itemY && y <= itemY + config.itemHeight) {
          hoveredItem = items[i]
          break
        }
      }

      if (!hoveredItem) {
        this.#isHoveringItem = false
        this.#beatmapListManager.hoverOut()
      } else {
        this.#isHoveringItem = true
        this.#beatmapListManager.hover(hoveredItem)
      }
    }

    /**
     * @param e {HTMLElementEventMap['canvas']}
     */
    const handleWheel = (e) => {
      if (this.#play) {
        return
      }
      e.preventDefault()

      const currentTime = performance.now()
      if (config.lastScrollTime > 0) {
        const timeDiff = currentTime - config.lastScrollTime
        const scrollDiff = config.scrollY - config.lastScrollY

        // 计算速度 (像素/帧)
        config.velocity = (scrollDiff / timeDiff) * 16 // 标准化为每帧速度

        // 限制最大速度
        if (Math.abs(config.velocity) > config.maxVelocity) {
          config.velocity = config.velocity > 0 ? config.maxVelocity : -config.maxVelocity
        }
      }

      config.lastScrollTime = currentTime
      config.lastScrollY = config.scrollY

      // 更新滚动位置
      config.scrollY += e.deltaY * -0.5
      config.scrollY = Math.max(Math.min(config.scrollY, config.maxScrollY), config.minScrollY)
      this.#beatmapListManager.beatmapList.scrollY = config.scrollY
      handelMouseMove(e)
    }

    const handleClick = async () => {
      if (this.#play || !this.#isHoveringItem) {
        return
      }
      if (this.#beatmapListManager.selectedBeatmapItem === this.#beatmapListManager.hoveredBeatmapItem) {
        const beatmap = this.#beatmapListManager.selectedBeatmapItem.beatmap
        await this.play(beatmap)
      } else if (this.#beatmapListManager.hoveredBeatmapItem) {
        this.#beatmapListManager.hoveredBeatmapItem.select()
        this.#beatmapListManager.selectItem(this.#beatmapListManager.hoveredBeatmapItem)
        const beatmap = this.#beatmapListManager.selectedBeatmapItem.beatmap
        this.playAuto(beatmap)
      }
    }

    canvas.addEventListener('wheel', handleWheel)
    canvas.addEventListener('mousemove', handelMouseMove)
    canvas.addEventListener('click', handleClick)
  }

  /**
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async playAuto (beatmap) {
    this.#autoManager.abort()
    console.log(beatmap.previewTime)
    await this.#autoManager.load(beatmap.audioFile, beatmap.previewTime)
    await this.#autoManager.play()
  }

  /**
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async play (beatmap) {
    this.#play = true
    this.#game.init(() => {
      this.#play = false
      this.loopFrame()
    })
    await this.#game.selectMap(beatmap)
    this.#game.start()
  }

  async loadSongList () {
    const configs = await fetch('./beatmaps.json').then(res => res.json())
    this.#beatmapListManager.loadFromConfigs(configs)
  }

  async start () {
    await this.loadSongList()
    this.#beatmapListManager.select()
    await this.playAuto(this.#beatmapListManager.selectedBeatmapItem.beatmap)
  }

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
      this.loopFrame()
    })
  }

  renderBackground () {
    const selectBeatmap = this.#beatmapListManager.selectedBeatmapItem.beatmap
    if (selectBeatmap) {
      const image = selectBeatmap.bgImage
      this.#layoutEngine.renderBackgroundImage(image)
    }
  }

  renderLoading () {
    this.#layoutEngine.renderShape(this.#loadingEffect)
  }

  renderBeatmaps () {
    this.#layoutEngine.renderShape(this.#beatmapListManager.beatmapList)
  }
}
