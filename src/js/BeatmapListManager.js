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
   * @type {BeatmapItem[]}
   */
  #beatmaps = []

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

    this.#beatmaps = result
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
   * 不传 beatmapId 直接随机选一个
   * return true when hasSelected instead return false
   * @param beatmapId {string?}
   * @return boolean
   */
  select (beatmapId) {
    if (!beatmapId) {
      // 暂时选第一个，后面随机选
      this.#beatmaps[0].select()
      this.#selectedBeatmapItem = this.#beatmaps[0]
      return false

      // const beatmapIds = Array.from(this.#beatmapItemMap.keys())
      // const randomId = selectRandomArrayItem(beatmapIds)
      // const randomBeatmap = this.#beatmapItemMap.get(randomId)
      // randomBeatmap.select()
      // this.#beatmapList.scrollTo(randomBeatmap.renderInfo().top)
      // this.#selectedBeatmapItem = randomBeatmap
      // return false
    }
    const hasSelected = this.#selectedBeatmapItem?.beatmap?.id === beatmapId
    const beatmapItem = this.#beatmapItemMap.get(beatmapId)
    this.#selectedBeatmapItem = beatmapItem
    if (beatmapItem) {
      !hasSelected && beatmapItem.select()
      return hasSelected
    } else {
      warn('selected beatmap not exist')
      return false
    }
  }

  /**
   * @param beatmapItem {BeatmapItem}
   */
  selectItem (beatmapItem) {
    this.#selectedBeatmapItem?.cancelSelect()
    beatmapItem.select()
    this.#selectedBeatmapItem = beatmapItem
    this.#beatmapList.scrollTo((prev) => {
      return prev + beatmapItem.renderInfo().top - CANVAS.HEIGHT / 2
    })
  }

  /**
   * @return {BeatmapList}
   */
  get beatmapList () {
    return this.#beatmapList
  }
}
