import { BeatmapItem } from './BeatmapItem'
import { ScrollList } from './ScrollList'
import { CANVAS } from './Config'
import { Skin } from './Skin'

/**
 * @extends {ScrollList<BeatmapItem>}
 */
export class BeatmapList extends ScrollList {
  /**
   * @type {BeatmapItem[]}
   */
  #beatmapItems = []

  constructor () {
    super({
      // 惯性滚动相关
      friction: 0.98, // 摩擦系数
      minVelocity: 0.1, // 最小速度阈值
      maxVelocity: 75, // 最大速度限制
      initialScrollY: -CANVAS.HEIGHT / 3 + Skin.config.main.beatmap.item.base.height / 2,
    })
  }

  /**
   * @param beatmapItems {BeatmapItem[]}
   */
  set beatmapItems (beatmapItems) {
    this.#beatmapItems = beatmapItems
  }

  /**
   * @return {BeatmapItem[]}
   */
  scrollItems () {
    return this.#beatmapItems
  }

  getOffsetX (scrollSpeed, offsetY) {
    const speedOffset = Math.min(Math.abs(scrollSpeed * 5.0), CANVAS.WIDTH / 4.0)
    const itemHeight = Skin.config.main.beatmap.item.base.height
    const scrollOffset = Math.abs(offsetY - CANVAS.HEIGHT / 2) / itemHeight * 25
    return Math.min(speedOffset + scrollOffset, 240)
  }
}
