import { Shape } from './Shape.js'
import { Beatmap } from './Beatmap.js'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './Config.js'

const HEIGHT = 140
const SELECTED_BG = '#ffffffcc'
const BG = '#1e90ffb3'
const HOVER_BG = '#e9ecef'
const TITLE_COLOR = '#212529'

export class BeatmapItem extends Shape {
  static configs = {
    HEIGHT,
  }

  /**
   * @type {Beatmap}
   */
  #beatmap

  #hover = false

  #selected = false

  #offsetY = 0

  /**
   * @param beatmap {Beatmap}
   */
  constructor (beatmap) {
    super()
    this.#beatmap = beatmap
  }

  render (context) {
    const WIDTH = CANVAS_WIDTH / 2
    const LEFT = CANVAS_WIDTH / 2

    if (this.#offsetY + HEIGHT <= 0 || this.#offsetY >= CANVAS_HEIGHT) {
      // 在屏幕外
      return
    }

    let bg = BG
    if (this.#selected) {
      bg = SELECTED_BG
    } else if (this.#hover) {
      bg = HOVER_BG
    }

    context.fillStyle = bg

    super.roundRect({
      context,
      x: LEFT,
      y: this.#offsetY,
      width: WIDTH,
      height: HEIGHT,
      radius: 0,
      fill: bg,
    })

    const paddingLeft = LEFT + 25
    let offsetY = this.#offsetY

    context.fillStyle = TITLE_COLOR
    context.font = '32px 黑体'
    context.textAlign = 'left'
    context.fillText(this.#beatmap.songName, paddingLeft, offsetY += 44)

    context.font = '20px 黑体'
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.description, paddingLeft, offsetY += 24)

    context.font = 'bold 24px 黑体'
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.difficulty, paddingLeft, offsetY += 28)

    let i = 0
    while (i ++ < this.#beatmap.star) {
      context.fillStyle = TITLE_COLOR
      context.fillRect(paddingLeft + (i - 1) * 25, offsetY + 12, 20, 20)
    }
    const lastStar = this.#beatmap.star - i + 2
    const lastStarSize = lastStar * 10 + 10
    const lastStarOffset = (20 - lastStarSize) / 2.0

    if (lastStar > 0.2) {
      context.fillRect(paddingLeft + (i - 1) * 25, offsetY + 12 + lastStarOffset, lastStarSize, lastStarSize)
    }
  }

  /**
   * @param offsetY {number}
   */
  set offsetY (offsetY) {
    this.#offsetY = offsetY
  }

  /**
   * @return {number}
   */
  get offsetY () {
    return this.#offsetY
  }

  hover () {
    this.#hover = true
  }

  hoverOut () {
    this.#hover = false
  }

  get selected () {
    return this.#selected
  }

  /**
   * @return {Beatmap}
   */
  get beatmap () {
    return this.#beatmap
  }

  select () {
    this.#selected = true
  }

  cancelSelect () {
    this.#selected = false
  }
}
