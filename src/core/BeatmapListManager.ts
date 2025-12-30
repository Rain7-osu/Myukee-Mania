import { Beatmap } from './Beatmap'
import { BeatmapItem } from './BeatmapItem'
import { BeatmapList } from './BeatmapList'
import { CANVAS } from './Config'
import { selectRandomArrayItem } from './utils'

export class BeatmapListManager {
  #beatmapItemMap: Map<string, BeatmapItem> = new Map()

  #selectedBeatmapItem: BeatmapItem | null = null

  #beatmapList: BeatmapList

  constructor (container: HTMLElement) {
    this.#beatmapList = new BeatmapList(container)
  }

  private loadConfigs (configs: any[]) {
    let lastBeatmap: BeatmapItem | null = null
    const result: BeatmapItem[] = []
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

  init (configs: any[]) {
    this.loadConfigs(configs)
  }

  get selectedItem (): BeatmapItem | null {
    return this.#selectedBeatmapItem
  }

  random (): BeatmapItem {
    const beatmapIds = Array.from(this.#beatmapItemMap.keys())
    const randomId = selectRandomArrayItem(beatmapIds)
    return this.#beatmapItemMap.get(randomId) as BeatmapItem
  }

  /**
   * 初始化时，随机选一张图
   */
  firstSelect (): BeatmapItem {
    const randomBeatmap = this.random()
    randomBeatmap.select()
    this.#beatmapList.select(randomBeatmap)
    this.#selectedBeatmapItem = randomBeatmap
    return randomBeatmap
  }

  selectItem (beatmapItem: BeatmapItem) {
    this.#selectedBeatmapItem?.cancelSelect()
    beatmapItem.select()
    this.#beatmapList.select(beatmapItem)
    this.#selectedBeatmapItem = beatmapItem
    this.#beatmapList.scrollTo(prev => {
      const [_, top, __, height] = beatmapItem.rect()
      return prev + top + height / 2 - CANVAS.HEIGHT / 2
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

  get beatmapList (): BeatmapList {
    return this.#beatmapList
  }
}
