import { BeatmapItem } from '../Views/BeatmapItem';
import { BeatmapList } from '../Views/BeatmapList';
import { Beatmap } from '../Models/Beatmap';
import { selectRandomArrayItem } from '../_common/utils';
import { CANVAS } from '../Configs/Config';

export class BeatmapListManager {
  private _beatmapItemMap: Map<string, BeatmapItem> = new Map()

  private _selectedBeatmapItem: BeatmapItem | null = null

  private readonly _beatmapList: BeatmapList

  constructor(container: HTMLElement) {
    this._beatmapList = new BeatmapList(container)
  }

  private loadConfigs(configs: any[]) {
    let lastBeatmap: BeatmapItem | null = null
    const result: BeatmapItem[] = []
    for (let i = 0; i < configs.length; i++) {
      const beatmap = Beatmap.fromConfig(configs[i])
      if (!beatmap) {
        continue
      }
      const beatmapItem = new BeatmapItem(beatmap)
      this._beatmapItemMap.set(beatmap.id, beatmapItem)
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

    this._beatmapList.beatmapItems = sortedBeatmaps
  }

  init(configs: any[]) {
    this.loadConfigs(configs)
  }

  get selectedItem(): BeatmapItem | null {
    return this._selectedBeatmapItem
  }

  random(): BeatmapItem {
    const beatmapIds = Array.from(this._beatmapItemMap.keys())
    const randomId = selectRandomArrayItem(beatmapIds)
    return this._beatmapItemMap.get(randomId) as BeatmapItem
  }

  /**
   * 初始化时，随机选一张图
   */
  firstSelect(): BeatmapItem {
    const randomBeatmap = this.random()
    randomBeatmap.select()
    this._beatmapList.select(randomBeatmap)
    this._selectedBeatmapItem = randomBeatmap
    return randomBeatmap
  }

  selectItem(beatmapItem: BeatmapItem) {
    this._selectedBeatmapItem?.cancelSelect()
    beatmapItem.select()
    this._beatmapList.select(beatmapItem)
    this._selectedBeatmapItem = beatmapItem
    this._beatmapList.scrollTo(prev => {
      const [_, top, __, height] = beatmapItem.rect()
      return prev + top + height / 2 - CANVAS.HEIGHT / 2
    })
  }

  selectPrev() {
    const last = this._selectedBeatmapItem!.last
    if (last) {
      this.selectItem(last)
    }
  }

  selectNext() {
    const next = this._selectedBeatmapItem!.next
    if (next) {
      this.selectItem(next)
    }
  }

  async hide() {
    const items = this.beatmapList.scrollItems()
    // 临时用这个值代替，确保能大于每一项的宽度
    const targetX = CANVAS.WIDTH / 2
    this._beatmapList.cancelTransitions()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      item.cancelEffect()
      this._beatmapList.createTransitionSync(item.translateX, item.translateX + targetX, 500, 'easeOut', value => {
        item.translateX = value
      })
    }
    const [task] = this._beatmapList.createTimeout(800)
    await task
  }

  async show() {
    const items = this.beatmapList.scrollItems()
    this._beatmapList.cancelTransitions()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      item.cancelEffect()
      this._beatmapList.createTransitionSync(item.translateX, item.currentStyle.left - item.style.left, 500, 'easeOut', value => {
        item.translateX = value
      })
    }
    const [task] = this._beatmapList.createTimeout(800)
    await task
  }

  get beatmapList(): BeatmapList {
    return this._beatmapList
  }
}
