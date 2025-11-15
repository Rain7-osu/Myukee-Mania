import { Shape } from './Shape'
import { BeatmapItem } from './BeatmapItem'

const GAP = 10

export class BeatmapList extends Shape {
  static configs = {
    GAP,
  }

  /**
   * @type {BeatmapItem[]}
   */
  #beatmaps = []

  #scrollY = 0

  /**
   * @param scrollY {number}
   */
  set scrollY (scrollY) {
    this.#scrollY = scrollY
  }

  set beatmaps (beatmaps) {
    this.#beatmaps = beatmaps
  }

  render (context) {
    const beatmaps = this.#beatmaps
    let scrollY = this.#scrollY

    for (let i = 0; i < beatmaps.length; i++) {
      const beatmap = beatmaps[i]
      beatmap.offsetY = scrollY
      scrollY += BeatmapItem.configs.HEIGHT + GAP
      beatmap.render(context)
    }
  }

  scrollToIndex (index) {
    this.#scrollY = (BeatmapItem.configs.HEIGHT + GAP) * index
  }
}
