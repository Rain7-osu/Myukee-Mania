import { BeatmapItem } from './BeatmapItem'
import { ScrollList } from './ScrollList'
import { CANVAS } from './Config'
import { vw } from './utils'

const MAX_OFFSET_X_VW = 0.25
const MAX_SPEED = 50
const ITEM_HEIGHT = 160 / 1440
const TOP = 164
const BOTTOM = 142

/**
 * @extends {ScrollList<BeatmapItem>}
 */
export class BeatmapList extends ScrollList {
  /**
   * @type {BeatmapItem[]}
   */
  #beatmapItems = []

  /**
   * @param container {HTMLElement}
   */
  constructor (container) {
    super(container, {
      // 惯性滚动相关
      friction: 0.98, // 摩擦系数
      minVelocity: 0.1, // 最小速度阈值
      maxVelocity: MAX_SPEED, // 最大速度限制
      initialScrollY: vw(ITEM_HEIGHT / 2 - 1 / 3),
      maxOffsetX: vw(MAX_OFFSET_X_VW),
    }, {
      left: CANVAS.WIDTH / 2,
      top: TOP,
      bottom: BOTTOM,
      width: CANVAS.WIDTH / 2,
      height: CANVAS.HEIGHT - TOP - BOTTOM,
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
}
