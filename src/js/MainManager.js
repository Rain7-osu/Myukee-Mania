import { Beatmap } from './Beatmap.js'
import { LayoutRenderEngine } from './LayoutRenderEngine.js'
import { MainLoadingEffect } from './MainLoadingEffect.js'
import { BeatmapListManager } from './BeatmapListManager.js'
import { Game } from './Game.js'
import { BeatmapItem } from './BeatmapItem.js'
import { BeatmapList } from './BeatmapList.js'
import { CANVAS } from './Config.js'
import { AudioManager } from './AudioManager.js'
import { Skin } from './Skin'

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
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    if (canvas) {
      this.#canvas = canvas
      this.#layoutEngine = new LayoutRenderEngine(canvas)
    }
  }

  /**
   * @param e {HTMLElementEventMap['canvas']}
   */
  handleMouseMove (e) {
    const config = this.#listConfig
    if (this.#play) {
      return
    }
    const x = e.clientX
    if (x < CANVAS.WIDTH / 2) {
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

  init () {
    const canvas = this.#canvas
    const config = this.#listConfig
    // 允许滚动到最下面的时候，下面空半个屏幕
    config.minScrollY = -this.#beatmapListManager.beatmaps.length * (config.itemHeight + config.itemSpacing)
      + CANVAS.HEIGHT / 2
    // 允许滚动到最上面，上面空半个屏幕
    config.maxScrollY = CANVAS.HEIGHT / 2
    this.#beatmapListManager.beatmapList.scrollY = config.scrollY

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
        this.#beatmapListManager.beatmapList.scrollSpeed = config.velocity

        // 限制最大速度
        if (Math.abs(config.velocity) > config.maxVelocity) {
          config.velocity = config.velocity > 0 ? config.maxVelocity : -config.maxVelocity
          config.wheelEvent = e
        }
      }

      config.lastScrollTime = currentTime
      config.lastScrollY = config.scrollY

      // 更新滚动位置
      const scrollY = config.scrollY + e.deltaY * -0.5
      config.scrollY = Math.max(Math.min(scrollY, config.maxScrollY), config.minScrollY)
      this.#beatmapListManager.beatmapList.scrollY = config.scrollY
      this.handleMouseMove(e)
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
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    canvas.addEventListener('click', handleClick)
  }

  /**
   * 惯性滚动
   */
  inertiaScroll () {
    if (this.#play) {
      return
    }
    const config = this.#listConfig
    if (Math.abs(config.velocity) > config.minVelocity) {
      config.isInertiaScrolling = true

      // 应用速度
      config.scrollY += config.velocity
      this.#beatmapListManager.beatmapList.scrollY = config.scrollY
      config.wheelEvent && this.handleMouseMove(config.wheelEvent)

      // 应用摩擦力减速
      config.velocity *= config.friction

      // 边界检查
      if (config.scrollY < config.minScrollY) {
        config.scrollY = config.minScrollY
        config.velocity = 0
      } else if (config.scrollY > config.maxScrollY) {
        config.scrollY = config.maxScrollY
        config.velocity = 0
      }
    } else {
      config.isInertiaScrolling = false
      config.velocity = 0
    }
    this.#beatmapListManager.beatmapList.scrollSpeed = config.velocity
  }

  /**
   * @param beatmap {Beatmap}
   * @return {Promise<void>}
   */
  async playAuto (beatmap) {
    this.#autoManager.abort()
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
      this.inertiaScroll()
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
