import { Shape } from './Shape.js'
import { BeatmapItem } from './BeatmapItem.js'
import { CANVAS } from './Config'
import { Skin } from './Skin'

export class BeatmapList extends Shape {
  /**
   * @type {BeatmapItem[]}
   */
  #beatmapItems = []

  #scrollY = 0

  #scrollSpeed = 0

  /**
   * @param scrollY {number}
   */
  set scrollY (scrollY) {
    this.#scrollY = scrollY
  }

  /**
   * @param speed {number}
   */
  set scrollSpeed (speed) {
    this.#scrollSpeed = speed
  }

  /**
   * @param beatmapItems {BeatmapItem[]}
   */
  set beatmapItems (beatmapItems) {
    this.#beatmapItems = beatmapItems
  }

  render (context) {
    const beatmapItems = this.#beatmapItems
    let offsetY = this.#scrollY
    const offsetX = Math.min(Math.abs(this.#scrollSpeed * 5.0), CANVAS.WIDTH / 4.0)
    const {
      item: {
        base: { height, gap: BASE_GAP },
        select: { gap: SELECT_GAP },
        hover: { gap: HOVER_GAP },
      },
    } = Skin.config.main.beatmap

    for (let i = 0; i < beatmapItems.length; i++) {
      const beatmapItem = beatmapItems[i]

      let bottomGap = BASE_GAP
      let topExtraGap = 0
      if (beatmapItem.selected) {
        bottomGap = SELECT_GAP
        topExtraGap = -BASE_GAP + SELECT_GAP
      } else if (beatmapItem.hovered) {
        bottomGap = HOVER_GAP
        topExtraGap = -BASE_GAP + HOVER_GAP
      }

      offsetY += topExtraGap
      beatmapItem.offsetY = offsetY
      beatmapItem.offsetX = offsetX
      offsetY += height + bottomGap
      beatmapItem.render(context)
    }
  }

  scrollToIndex (index) {
    this.#scrollY = (Skin.config.main.beatmap.item.base.height + Skin.config.main.beatmap.gap) * index
  }
}
