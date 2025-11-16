import { Shape } from './Shape.js'
import { Beatmap } from './Beatmap.js'
import { CANVAS } from './Config.js'
import { Skin } from './Skin'

export class BeatmapItem extends Shape {
  /**
   * @type {Beatmap}
   */
  #beatmap

  #hovered = false

  #selected = false

  #offsetY = 0

  #offsetX = 0

  /**
   * @param beatmap {Beatmap}
   */
  constructor (beatmap) {
    super()
    this.#beatmap = beatmap
  }

  render (context) {
    const {
      select: { extra: SELECT_EXTRA, bgColor: SELECTED_BG },
      hover: { extra: HOVER_EXTRA, bgColor: HOVER_BG },
      base: {
        height: HEIGHT,
        bgColor: BG,
        title: { color: TITLE_COLOR, font: TITLE_FONT },
        description: { font: DESC_FONT },
        subtitle: { font: SUBTITLE_FONT },
      },
      baseLeft,
    } = Skin.config.main.beatmap.item

    if (this.#offsetY + HEIGHT <= 0 || this.#offsetY >= CANVAS.HEIGHT) {
      // 在屏幕外
      return
    }

    let currentLeft = baseLeft + HOVER_EXTRA + SELECT_EXTRA
    let currentWidth = baseLeft - HOVER_EXTRA - SELECT_EXTRA
    if (this.#hovered) {
      currentLeft -= HOVER_EXTRA
      currentWidth += HOVER_EXTRA
    }
    if (this.#selected) {
      currentLeft -= SELECT_EXTRA
      currentWidth += SELECT_EXTRA
    }
    if (this.#offsetX) {
      currentLeft += this.#offsetX
      currentWidth -= this.#offsetX
    }

    let bg = BG
    if (this.#selected) {
      bg = SELECTED_BG
    } else if (this.#hovered) {
      bg = HOVER_BG
    }

    context.fillStyle = bg

    super.roundRect({
      context,
      x: currentLeft,
      y: this.#offsetY,
      width: currentWidth,
      height: HEIGHT,
      radius: 0,
      fill: bg,
    })

    const paddingLeft = currentLeft + 25
    let offsetY = this.#offsetY

    context.fillStyle = TITLE_COLOR
    context.font = TITLE_FONT
    context.textAlign = 'left'
    context.fillText(this.#beatmap.songName, paddingLeft, offsetY += 44)

    context.font = DESC_FONT
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.description, paddingLeft, offsetY += 24)

    context.font = SUBTITLE_FONT
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.difficulty, paddingLeft, offsetY += 28)

    const star = Math.min(10, this.#beatmap.star)

    let i = 0
    let size = 20
    let left = paddingLeft + 10
    const top = offsetY + 22
    while (i < star - 1) {
      context.fillStyle = TITLE_COLOR

      super.drawStar({
        context,
        cx: left,
        cy: top,
        outerRadius: size / 2.0,
        innerRadius: size / 4.0,
        fillColor: TITLE_COLOR,
        strokeWidth: 0,
        strokeColor: TITLE_COLOR,
        rotation: 54,
      })

      left += size + 5
      size++
      i++
    }

    // 小于 1.1 的，直接画到前面的星星上，更大一点
    const lastStar = star - i
    const lastStarSize = lastStar * 15.0 + 5.0
    super.drawStar({
      context,
      cx: left,
      cy: top,
      outerRadius: lastStarSize / 2.0,
      innerRadius: lastStarSize / 4.0,
      fillColor: TITLE_COLOR,
      strokeWidth: 0,
      strokeColor: TITLE_COLOR,
      rotation: 54,
    })
  }

  /**
   * @param offsetY {number}
   */
  set offsetY (offsetY) {
    this.#offsetY = offsetY
  }

  /**
   * @param offsetX {number}
   */
  set offsetX (offsetX) {
    this.#offsetX = offsetX
  }

  /**
   * @return {number}
   */
  get offsetY () {
    return this.#offsetY
  }

  get offsetX () {
    return this.#offsetX
  }

  hover () {
    this.#hovered = true
  }

  hoverOut () {
    this.#hovered = false
  }

  get hovered () {
    return this.#hovered
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
