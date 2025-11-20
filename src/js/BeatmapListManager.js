import { Beatmap } from './Beatmap'
import { BeatmapItem } from './BeatmapItem'
import { BeatmapList } from './BeatmapList'
import { warn } from './dev'
import { CANVAS } from './Config'
import { selectRandomArrayItem } from './utils'

export class BeatmapListManager {
  /**
   * @type {Map<string, BeatmapItem>}
   */
  #beatmapItemMap = new Map()

  /**
   * @type {null | BeatmapItem}
   */
  #selectedBeatmapItem = null

  /**
   * @type {BeatmapList}
   */
  #beatmapList = new BeatmapList()

  /**
   * @private
   * @param configs {any[]}
   */
  loadConfigs (configs) {
    /** @type {BeatmapItem | null} */
    let lastBeatmap = null
    /** @type {BeatmapItem[]} */
    const result = []
    for (let i = 0; i < configs.length; i++) {
      const beatmap = Beatmap.fromConfig(configs[i])
      if (!beatmap) {
        continue
      }
      const beatmapItem = new BeatmapItem(beatmap)
      beatmapItem.last = lastBeatmap
      lastBeatmap && (lastBeatmap.next = beatmapItem)
      this.#beatmapItemMap.set(beatmap.id, beatmapItem)
      result.push(beatmapItem)
      lastBeatmap = beatmapItem
    }

    this.#beatmapList.beatmapItems = result
  }

  /**
   * @param configs {any[]}
   */
  init (configs) {
    this.loadConfigs(configs)
  }

  /**
   * @return {BeatmapItem|null}
   */
  get selectedBeatmapItem () {
    return this.#selectedBeatmapItem
  }

  /**
   * 初始化时，随机选一张图
   */
  firstSelect () {
    const beatmapIds = Array.from(this.#beatmapItemMap.keys())
    const randomId = selectRandomArrayItem(beatmapIds)
    const randomBeatmap = this.#beatmapItemMap.get(randomId)
    randomBeatmap.select()
    this.#selectedBeatmapItem = randomBeatmap
  }

  /**
   * @param beatmapItem {BeatmapItem}
   */
  selectItem (beatmapItem) {
    this.#selectedBeatmapItem?.cancelSelect()
    beatmapItem.select()
    this.#selectedBeatmapItem = beatmapItem
    this.#beatmapList.scrollTo((prev) => {
      const { top, height } = beatmapItem.renderInfo()
      return prev + top + height - CANVAS.HEIGHT / 2
    })
  }

  /**
   * @param callback {() => void}
   */
  open (callback) {
    const items = this.beatmapList.scrollItems()
    // 临时用这个值代替，确保能大于每一项的宽度
    const targetX = CANVAS.WIDTH / 2
    this.#beatmapList.cancelTransitions()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const translateX = item.translateX
      item.cancelTransitions()
      this.#beatmapList.createTransition(translateX, translateX + targetX, 500, 'easeOut', (value) => {
        item.translateX = value
      })
    }
    setTimeout(() => {
      callback()
    }, 810)
  }

  /**
   * @param callback {() => void}
   */
  back (callback) {
    const items = this.beatmapList.scrollItems()
    this.#beatmapList.cancelTransitions()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const translateX = item.translateX
      this.#beatmapList.createTransition(translateX, 0, 500, 'easeOut', (value) => {
        item.translateX = value
      })
    }
    setTimeout(() => {
      callback()
    }, 810)
  }

  /**
   * @return {BeatmapList}
   */
  get beatmapList () {
    return this.#beatmapList
  }
}
