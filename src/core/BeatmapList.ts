import { BeatmapItem } from './BeatmapItem'
import { ScrollList } from './ScrollList'
import { CANVAS } from './Config'
import { py, vw } from './Config'

const MAX_OFFSET_X_VW = 0.8
const MAX_SPEED = 50
const ITEM_HEIGHT = 160
const TOP = 164
const BOTTOM = 142

export class BeatmapList extends ScrollList<BeatmapItem> {
  #beatmapItems: BeatmapItem[] = []

  constructor (container: HTMLElement) {
    super(container, {
      // 惯性滚动相关
      friction: 0.98, // 摩擦系数
      minVelocity: 0.1, // 最小速度阈值
      maxVelocity: py(MAX_SPEED), // 最大速度限制
      initialScrollY: py(ITEM_HEIGHT / 2 - 1 / 3),
      maxOffsetX: vw(MAX_OFFSET_X_VW),
    }, {
      left: CANVAS.WIDTH / 2,
      top: py(TOP),
      bottom: py(BOTTOM),
      width: CANVAS.WIDTH / 2,
      height: CANVAS.HEIGHT - py(TOP) - py(BOTTOM),
    })
  }

  set beatmapItems (beatmapItems: BeatmapItem[]) {
    this.#beatmapItems = beatmapItems
  }

  scrollItems (): BeatmapItem[] {
    return this.#beatmapItems
  }
}
