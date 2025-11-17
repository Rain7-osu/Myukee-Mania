import { BeatmapItem } from './BeatmapItem'
import { ScrollList } from './ScrollList'
import { CANVAS } from './Config'

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
      friction: 0.95, // 摩擦系数
      minVelocity: 0.1, // 最小速度阈值
      maxVelocity: 75, // 最大速度限制
      initialScrollY: -CANVAS.HEIGHT / 2,
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
  listItems () {
    return this.#beatmapItems
  }

  getOffsetX (scrollSpeed) {
    return Math.min(Math.abs(scrollSpeed * 5.0), CANVAS.WIDTH / 4.0)
  }
}
