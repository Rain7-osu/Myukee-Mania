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
    let lastMarginBottom = 0

    for (let i = 0; i < beatmapItems.length; i++) {
      const beatmapItem = beatmapItems[i]
      const { marginTop, height, marginBottom } = beatmapItem.currentStyle
      beatmapItem.offsetY = offsetY
      beatmapItem.offsetX = offsetX
      offsetY += height + marginTop + marginBottom
      lastMarginBottom = marginBottom
      beatmapItem.render(context)
    }
  }

  scrollToIndex (index) {
    this.#scrollY = (Skin.config.main.beatmap.item.base.height + Skin.config.main.beatmap.gap) * index
  }
}
