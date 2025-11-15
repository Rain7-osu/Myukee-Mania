import { Beatmap } from './Beatmap'
import { BeatmapItem } from './BeatmapItem'
import { BeatmapList } from './BeatmapList'
import { selectRandomArrayItem } from './utils'
import { warn } from './dev'

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
   * @type {null | BeatmapItem}
   */
  #hoveredBeatmapItem = null

  /**
   * @type {BeatmapList}
   */
  #beatmapList = new BeatmapList()

  /**
   * @param configs {any[]}
   */
  loadFromConfigs (configs) {
    this.#beatmaps = configs.reduce((prev, item) => {
      const beatmap = Beatmap.fromConfig(item)
      if (!beatmap) {
        return prev
      }
      const beatmapItem = new BeatmapItem(beatmap)
      this.#beatmapItemMap.set(beatmap.id, beatmapItem)
      return [...prev, beatmapItem]
    }, [])
    this.#beatmapList.beatmaps = this.#beatmaps
  }

  /**
   * @return {BeatmapItem[]}
   */
  get beatmaps () {
    return this.#beatmaps
  }

  /**
   * @return {BeatmapItem|null}
   */
  get selectedBeatmapItem () {
    return this.#selectedBeatmapItem
  }

  /**
   * @return {BeatmapItem|null}
   */
  get hoveredBeatmapItem () {
    return this.#hoveredBeatmapItem
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
      // const index = this.beatmaps.findIndex((v) => v.beatmap.id === randomBeatmap.beatmap.id)
      // this.#beatmapList.scrollToIndex(index)
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
  }

  hover (beatmapItem) {
    this.#hoveredBeatmapItem?.hoverOut()
    beatmapItem.hover()
    this.#hoveredBeatmapItem = beatmapItem
  }

  hoverOut () {
    this.#hoveredBeatmapItem?.hoverOut()
  }

  /**
   * @return {BeatmapList}
   */
  get beatmapList () {
    return this.#beatmapList
  }
}
