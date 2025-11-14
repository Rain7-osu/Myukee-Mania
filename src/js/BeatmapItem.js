import { Shape } from './Shape'
import { Beatmap } from './Beatmap'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './Config'

const HEIGHT = 120
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

    const textPaddingLeft = LEFT + 25

    context.fillStyle = TITLE_COLOR
    context.font = '32px 黑体'
    context.fillText(this.#beatmap.songName, textPaddingLeft, this.#offsetY + 44)

    context.font = '20px 黑体'
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.description, textPaddingLeft, this.#offsetY + 44 + 24)

    context.font = 'bold 24px 黑体'
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.difficulty, textPaddingLeft, this.#offsetY + 44 + 24 + 28)
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
