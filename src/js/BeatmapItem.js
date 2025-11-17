import { Shape } from './Shape'
import { Beatmap } from './Beatmap'
import { CANVAS } from './Config'
import { Skin } from './Skin'
import { ScrollItem } from './ScrollItem'

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
      select: { extra: SELECT_EXTRA, gap: SELECT_GAP },
      hover: { extra: HOVER_EXTRA, gap: HOVER_GAP },
      base: { height: HEIGHT, gap: BASE_GAP },
      width,
    } = Skin.config.main.beatmap.item

    this.style = {
      marginTop: BASE_GAP,
      marginBottom: 0,
      width: width,
      height: HEIGHT,
      left: CANVAS.WIDTH - width,
    }

    this.hoverStyle = {
      marginTop: HOVER_GAP,
      marginBottom: HOVER_GAP - BASE_GAP,
      width: width + HOVER_EXTRA,
      height: HEIGHT,
      left: CANVAS.WIDTH - width - HOVER_EXTRA,
    }

    this.activeStyle = {
      marginTop: SELECT_GAP,
      marginBottom: SELECT_GAP - BASE_GAP,
      width: width + SELECT_EXTRA,
      height: HEIGHT,
      left: CANVAS.WIDTH - width - SELECT_EXTRA,
    }

    this.activeHoverStyle = {
      marginTop: SELECT_GAP + HOVER_GAP,
      marginBottom: SELECT_GAP + HOVER_GAP - BASE_GAP,
      width: width + SELECT_EXTRA + HOVER_EXTRA,
      height: HEIGHT,
      left: CANVAS.WIDTH - width - SELECT_EXTRA - HOVER_EXTRA,
    }
  }

  renderByStyle (context, generalLeft, generalTop, generalWidth, height) {
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

    if (generalTop + height <= 0 || generalTop >= CANVAS.HEIGHT) {
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

    super.roundRect({
      context,
      x: generalLeft,
      y: generalTop,
      width: generalWidth,
      height,
      radius: 0,
      fill: bg,
    })

    const paddingLeft = generalLeft + 25
    let offsetY = generalTop

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

  hover () {
    this.hovered = true
  }

  hoverOut () {
    this.hovered = false
  }

  /**
   * @return {Beatmap}
   */
  get beatmap () {
    return this.#beatmap
  }

  select () {
    this.active = true
  }

  cancelSelect () {
    this.active = false
  }
}
