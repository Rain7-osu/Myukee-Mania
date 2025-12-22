import { Beatmap } from './Beatmap'
import { CANVAS } from './Config'
import { Skin } from './Skin'
import { ScrollItem } from './ScrollItem'
import { py, px, vh, vw } from './utils'

/**
 * @extends ScrollItem
 */
export class BeatmapItem extends ScrollItem {
  /**
   * @type {Beatmap}
   */
  #beatmap

  /**
   * @param beatmap {Beatmap}
   */
  constructor (beatmap) {
    super()
    this.#beatmap = beatmap
    const {
      select: { gap: SELECT_GAP, left: activeLeft },
      hover: { gap: HOVER_GAP, left: hoverLeft },
      base: { width, left, height },
      selectHover: { left: activeHoverLeft },
    } = Skin.config.main.beatmap.item

    this.style = {
      marginTop: 0,
      marginBottom: 0,
      width,
      height,
      left,
    }

    this.hoverStyle = {
      marginTop: HOVER_GAP,
      marginBottom: HOVER_GAP,
      width,
      height,
      left: hoverLeft,
    }

    this.activeStyle = {
      marginTop: SELECT_GAP,
      marginBottom: SELECT_GAP,
      width,
      height,
      left: activeLeft,
    }

    this.activeHoverStyle = {
      marginTop: SELECT_GAP + HOVER_GAP,
      marginBottom: SELECT_GAP + HOVER_GAP,
      width,
      height,
      left: activeHoverLeft,
    }
  }

  rect () {
    const { base: { gap: BASE_GAP } } = Skin.config.main.beatmap.item
    const [x, y, w, h] = super.rect()
    return [x, y + BASE_GAP / 2, w, h - BASE_GAP]
  }

  renderByStyle (context, x, y, width, height) {
    const {
      select: { bgColor: SELECTED_BG },
      hover: { bgColor: HOVER_BG },
      base: {
        bgColor: BG,
        title: { color: TITLE_COLOR, font: TITLE_FONT },
        description: { font: DESC_FONT },
        subtitle: { font: SUBTITLE_FONT },
      },
    } = Skin.config.main.beatmap.item

    if (y + height <= 0 || y >= CANVAS.HEIGHT) {
      // 在屏幕外
      return
    }

    let bg = BG
    if (this.active) {
      bg = SELECTED_BG
    } else if (this.hovered) {
      bg = HOVER_BG
    }

    context.fillStyle = bg
    context.fillRect(x, y, width, height)

    const paddingLeft = x + px(25)
    let offsetY = y

    context.fillStyle = TITLE_COLOR
    context.font = TITLE_FONT
    context.textAlign = 'left'
    context.fillText(this.#beatmap.songName, paddingLeft, offsetY += py(40))

    context.font = DESC_FONT
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.description, paddingLeft, offsetY += py(24))

    context.font = SUBTITLE_FONT
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.difficulty, paddingLeft, offsetY += py(28))

    const star = Math.min(10, this.#beatmap.star)

    let i = 0
    let size = py(24)
    let left = paddingLeft + py(10)
    const top = offsetY + py(26)
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

      left += size + py(5)
      size++
      i++
    }

    // 小于 1.1 的，直接画到前面的星星上，更大一点
    const lastStar = star - i
    const lastStarSize = lastStar * py(15) + py(5)
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
   * @return {Beatmap}
   */
  get beatmap () {
    return this.#beatmap
  }

  select () {
    this.activeIn()
  }

  cancelSelect () {
    this.activeOut()
  }
}
