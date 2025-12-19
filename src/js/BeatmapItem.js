import { Beatmap } from './Beatmap'
import { CANVAS } from './Config'
import { Skin } from './Skin'
import { ScrollItem } from './ScrollItem'
import { vh, vw } from './utils'

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
      select: { gap: SELECT_GAP, left: SELECT_LEFT },
      hover: { gap: HOVER_GAP, left: HOVER_LEFT },
      base: { width: WIDTH, left: LEFT, height: HEIGHT },
      selectHover: { left: SELECT_HOVER_LEFT },
    } = Skin.config.main.beatmap.item

    const width = vw(WIDTH)
    const height = vh(HEIGHT)
    const left = vw(LEFT)
    const hoverLeft = vw(HOVER_LEFT)
    const activeLeft = vw(SELECT_LEFT)
    const activeHoverLeft = vw(SELECT_HOVER_LEFT)

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

  renderByStyle (context, x, originY, width, originHeight) {
    const {
      select: { bgColor: SELECTED_BG },
      hover: { bgColor: HOVER_BG },
      base: {
        bgColor: BG,
        title: { color: TITLE_COLOR, font: TITLE_FONT },
        description: { font: DESC_FONT },
        subtitle: { font: SUBTITLE_FONT },
        gap: BASE_GAP,
      },
    } = Skin.config.main.beatmap.item

    const y = originY + BASE_GAP / 2
    const height = originHeight - BASE_GAP

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

    const paddingLeft = x + 25
    let offsetY = y

    context.fillStyle = TITLE_COLOR
    context.font = TITLE_FONT
    context.textAlign = 'left'
    context.fillText(this.#beatmap.songName, paddingLeft, offsetY += 36)

    context.font = DESC_FONT
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.description, paddingLeft, offsetY += 24)

    context.font = SUBTITLE_FONT
    context.fillStyle = TITLE_COLOR
    context.fillText(this.#beatmap.difficulty, paddingLeft, offsetY += 28)

    const star = Math.min(10, this.#beatmap.star)

    let i = 0
    let size = 24
    let left = paddingLeft + 10
    const top = offsetY + 26
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
