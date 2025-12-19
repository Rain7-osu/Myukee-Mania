import { Beatmap } from './Beatmap'
import { BeatmapItem } from './BeatmapItem'
import { BeatmapList } from './BeatmapList'
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
  #beatmapList

  /**
   * @param container  {HTMLElement}
   */
  constructor (container) {
    this.#beatmapList = new BeatmapList(container)
  }

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
      this.#beatmapItemMap.set(beatmap.id, beatmapItem)
      result.push(beatmapItem)
    }

    const sortedBeatmaps = result.sort((a, b) => {
      if (a.beatmap.songName !== b.beatmap.songName) {
        return a.beatmap.songName.localeCompare(b.beatmap.songName)
      } else {
        return a.beatmap.star - b.beatmap.star
      }
    })
    for (let beatmapItem of sortedBeatmaps) {
      beatmapItem.last = lastBeatmap
      lastBeatmap && (lastBeatmap.next = beatmapItem)
      lastBeatmap = beatmapItem
    }

    this.#beatmapList.beatmapItems = sortedBeatmaps
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
  get selectedItem () {
    return this.#selectedBeatmapItem
  }

  /**
   * @return {BeatmapItem}
   */
  random () {
    const beatmapIds = Array.from(this.#beatmapItemMap.keys())
    const randomId = selectRandomArrayItem(beatmapIds)
    return this.#beatmapItemMap.get(randomId)
  }

  /**
   * 初始化时，随机选一张图
   * @return BeatmapItem
   */
  firstSelect () {
    const randomBeatmap = this.random()
    randomBeatmap.select()
    this.#beatmapList.select(randomBeatmap)
    this.#selectedBeatmapItem = randomBeatmap
    return randomBeatmap
  }

  /**
   * @param beatmapItem {BeatmapItem}
   */
  selectItem (beatmapItem) {
    this.#selectedBeatmapItem?.cancelSelect()
    beatmapItem.select()
    this.#beatmapList.select(beatmapItem)
    this.#selectedBeatmapItem = beatmapItem
    this.#beatmapList.scrollTo((prev) => {
      const [_, top, __, height] = beatmapItem.rect()
      return prev + top + height - CANVAS.HEIGHT / 2
    })
  }

  selectPrev () {
    const last = this.#selectedBeatmapItem.last
    if (last) {
      this.selectItem(last)
    }
  }

  selectNext () {
    const next = this.#selectedBeatmapItem.next
    if (next) {
      this.selectItem(next)
    }
  }

  async hide () {
    const items = this.beatmapList.scrollItems()
    // 临时用这个值代替，确保能大于每一项的宽度
    const targetX = CANVAS.WIDTH / 2
    this.#beatmapList.cancelTransitions()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      item.cancelEffect()
      this.#beatmapList.createTransitionSync(item.translateX, item.translateX + targetX, 500, 'easeOut', (value) => {
        item.translateX = value
      })
    }
    const [task] = this.#beatmapList.createTimeout(800)
    await task
  }

  async show () {
    const items = this.beatmapList.scrollItems()
    this.#beatmapList.cancelTransitions()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      item.cancelEffect()
      this.#beatmapList.createTransitionSync(item.translateX, item.currentStyle.left - item.style.left, 500, 'easeOut', (value) => {
        item.translateX = value
      })
    }
    const [task] = this.#beatmapList.createTimeout(800)
    await task
  }

  /**
   * @return {BeatmapList}
   */
  get beatmapList () {
    return this.#beatmapList
  }
}
