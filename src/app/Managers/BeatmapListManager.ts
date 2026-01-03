import { BeatmapItem } from '../Views/BeatmapItem';
import { BeatmapList } from '../Views/BeatmapList';
import { Beatmap } from '../Models/Beatmap';
import { selectRandomArrayItem } from '../_common/utils';
import { CANVAS } from '../Configs/Config';

export class BeatmapListManager {
  private _beatmapItemMap: Map<string, BeatmapItem> = new Map()

  private _selected: BeatmapItem | null = null

  private _focused: BeatmapItem | null = null

  private readonly _beatmapList: BeatmapList

  private _fullBeatmapList: BeatmapItem[] = []

  private _fullBeatmapItemMap: Map<string, BeatmapItem> = new Map()

  constructor(container: HTMLElement) {
    this._beatmapList = new BeatmapList(container)
  }

  private loadConfigs(configs: any[]) {
    let lastBeatmap: BeatmapItem | null = null
    const result: BeatmapItem[] = []
    const beatmapItemMap = new Map<string, BeatmapItem>()
    for (let i = 0; i < configs.length; i++) {
      const beatmap = Beatmap.fromConfig(configs[i])
      if (!beatmap) {
        continue
      }
      const beatmapItem = new BeatmapItem(beatmap)
      beatmapItemMap.set(beatmap.id, beatmapItem)
      result.push(beatmapItem)
    }

    this._fullBeatmapItemMap = beatmapItemMap
    this._beatmapItemMap = beatmapItemMap

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

    this._fullBeatmapList = sortedBeatmaps
    this._beatmapList.beatmapItems = this._fullBeatmapList
  }

  init(configs: any[]) {
    this.loadConfigs(configs)
  }

  get selectedItem(): BeatmapItem | null {
    return this._selected
  }

  get focusedItem(): BeatmapItem | null {
    return this._focused
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
    this._selected = randomBeatmap
    this._focused = randomBeatmap
    return randomBeatmap
  }

  moveToItem(beatmapItem: BeatmapItem) {
    this._focused = beatmapItem
    this._beatmapList.scrollTo(prev => {
      const [_, top, __, height] = beatmapItem.rect()
      return prev + top + height / 2 - CANVAS.HEIGHT / 2
    })
  }

  select(beatmapItem: BeatmapItem) {
    this._selected?.cancelSelect()
    beatmapItem.select()
    this._beatmapList.select(beatmapItem)
    this._selected = beatmapItem
    this._focused = beatmapItem
    this.moveToItem(beatmapItem)
  }

  async search(text: string) {
    if (!text) {
      this._beatmapList.beatmapItems = this._fullBeatmapList
      await this._beatmapList.reflow(this._selected!)
    } else {
      const searchedResults = this._fullBeatmapList.filter(beatmapItem => {
        return beatmapItem.beatmap.matchSearch(text)
      })

      const newResultChanged = this._beatmapList.beatmapItems.length !== searchedResults.length || this._beatmapList.beatmapItems.some(beatmapItem => {
        return !searchedResults.includes(beatmapItem)
      })
      if (newResultChanged) {
        this._beatmapList.beatmapItems = searchedResults
        this._beatmapItemMap = new Map(searchedResults.map(beatmapItem => [beatmapItem.beatmap.id, beatmapItem]))
        if (searchedResults.length && searchedResults.every(beatmapItem => beatmapItem !== this._focused)) {
          this._focused = this.random()
        }
        await this._beatmapList.reflow(this._focused!)
      }
    }
  }

  selectPrev(): BeatmapItem {
    if (this._selected === this._focused) {
      const last = this._selected!.last
      if (last) {
        this.select(last)
        return last
      }
      return this._selected!
    } else {
      this.select(this._focused!)
      return this._focused!
    }
  }

  selectNext(): BeatmapItem {
    if (this._selected === this._focused) {
      const next = this._selected!.next
      if (next) {
        this.select(next)
        return next
      }
      return this._selected!
    } else {
      this.select(this._focused!)
      return this._focused!
    }
  }

  movePrev() {
    const last = this._focused!.last
    if (last) {
      this.moveToItem(last)
      return last
    }
    return this._focused
  }

  moveNext() {
    const next = this._focused!.next
    if (next) {
      this.moveToItem(next)
      return next
    }
    return this._focused
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
