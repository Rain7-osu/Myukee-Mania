import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { FrameSnapshot } from './FrameSnapshot'
import { formatMapTime, rgba, py, px, vw } from './utils'
import { Skin } from './Skin'

const TRANSITION_DURATION = 200
const BG_COLOR = 'rgb(0, 0, 0)'
const BORDER_COLOR = 'rgb(0, 102, 255)'

export class MainHeader extends RenderObject {
  /**
   * @type {Beatmap}
   */
  #beatmap

  /**
   * @type {FrameSnapshot | null}
   */
  #backgroundSnapshot = null

  /**
   * @type {FrameSnapshot | null}
   */
  #headerSnapshot = null

  #translateY = 0

  #leftMaskTop = 260

  #textAlpha = 100

  #switchingBeatmap = false

  /**
   * @type {number}
   */
  #speed

  /**
   * @param speed {number}
   */
  constructor (speed) {
    super()
    this.#speed = speed
    this.#leftMaskTop = Skin.config.main.header.title.lineHeight
  }

  /**
   * @param s {number}
   */
  set speed (s) {
    this.#speed = s
  }

  async hide () {
    if (this.#translateY === -260) {
      return Promise.resolve()
    }
    await this.createTransition(this.#translateY, -280, 600, 'easeOut', value => this.#translateY = value)

  }

  async show () {
    if (this.#translateY === 0) {
      return Promise.resolve()
    }
    await this.createTransition(this.#translateY, 0, 600, 'easeOut', value => this.#translateY = value)
  }

  /**
   * @param beatmap {Beatmap}
   */
  async setBeatmap (beatmap) {
    const { title: { lineHeight } } = Skin.config.main.header
    this.#headerSnapshot = null
    this.#switchingBeatmap = true
    this.#textAlpha = 0
    this.cancelTransitions()
    this.#beatmap = beatmap
    await Promise.all([
      this.createTransition(this.#leftMaskTop, lineHeight, TRANSITION_DURATION, 'linear', value => this.#leftMaskTop = value),
      this.createTransition(this.#textAlpha, 100, TRANSITION_DURATION, 'linear', value => this.#textAlpha = value),
    ])
    this.#switchingBeatmap = false
  }

  render (context) {
    this.renderWithSnapshot(context)
    if (this.#switchingBeatmap) {
      this.renderTitleMask(context)
    }
    this.renderSpeed(context)
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  renderSpeed (context) {
    const TOP = py(12)
    const RIGHT = CANVAS.WIDTH - py(12)
    const FONT_SIZE = py(48)
    context.save()
    context.font = `${FONT_SIZE}px 微软雅黑`
    context.fillStyle = 'rgba(255, 255, 255, 0.4)'
    context.textBaseline = 'top'
    context.textAlign = 'right'
    context.fillText(`${this.#speed}(fixed)`, RIGHT, TOP + this.#translateY)
    context.restore()
  }

  renderWithSnapshot (context) {
    if (this.#switchingBeatmap) {
      this.renderBackground(context)
      this.renderBeatmapInfo(context)
    } else {
      if (!this.#headerSnapshot) {
        this.#headerSnapshot = FrameSnapshot.createSnapshot(ctx => {
          ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
          this.renderBackground(ctx)
          this.renderBeatmapInfo(ctx)
        })
      }

      this.#headerSnapshot.setStyle(0, this.#translateY, CANVAS.WIDTH, CANVAS.HEIGHT)
      this.#headerSnapshot.render(context)
    }
  }

  /**
   * @private
   * @param context {CanvasRenderingContext2D}
   */
  renderBeatmapInfo (context) {
    const {
      color,
      title: titleItem,
      subtitle,
      info1,
      info2,
      difficulty: difficultyItem,
      top, left,
    } = Skin.config.main.header
    const {
      title,
      creator,
      star,
      length,
      objectCount,
      bpm,
      keys,
      od,
      hp,
      circles,
      sliders,
    } = this.#beatmap

    context.save()
    let offsetY = top

    /**
     * @param text {string}
     * @param item {{ font: string; fontWeight?: string; fontSize: number; lineHeight: number }}
     */
    const renderLine = (text, item) => {
      const { font, fontWeight, fontSize, lineHeight } = item
      const [r, g, b] = rgba.toValues(color)
      context.fillStyle = rgba.format([r, g, b, this.#textAlpha / 100])
      context.font = `${fontWeight} ${fontSize}px ${font}`
      context.textBaseline = 'top'
      context.textAlign = 'left'
      context.fillText(text, left, offsetY)
      offsetY += lineHeight
    }

    renderLine(title, titleItem)
    renderLine(`Mapper: ${creator}`, subtitle)
    renderLine(`Length: ${formatMapTime(length)}  BPM: ${bpm}  Objects: ${objectCount}`, info1)
    renderLine(`Circles: ${circles}  Sliders: ${sliders}`, info2)
    renderLine(`Keys: ${keys}  OD: ${od}  HP: ${hp} Star Rating: ${star.toFixed(2)}`, difficultyItem)

    context.restore()
  }

  /**
   * @private
   * @param context {CanvasRenderingContext2D}
   */
  renderTitleMask (context) {
    const { leftHeight: LEFT_HEIGHT, title: { lineHeight: LEFT_MASK_TOP } } = Skin.config.main.header
    const LEFT_RIGHT = CANVAS.WIDTH / 3 - vw(120 / 2560)

    context.save()
    // 从下到上的渐变
    const gradient = context.createLinearGradient(0, LEFT_HEIGHT, 0, LEFT_MASK_TOP)

    const offsetBlack = (LEFT_HEIGHT - this.#leftMaskTop) / (LEFT_HEIGHT - LEFT_MASK_TOP)

    // 从下向上，从不透明到透明
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
    gradient.addColorStop(offsetBlack, 'rgba(0, 0, 0, 1)')
    gradient.addColorStop((1 - offsetBlack) / 2, 'rgba(0, 0, 0, 0.5)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    context.fillStyle = gradient
    context.fillRect(0, LEFT_MASK_TOP, LEFT_RIGHT - 4, LEFT_HEIGHT - LEFT_MASK_TOP - 4) // 4: strokeLineWidth, 2: rightStroke
    context.restore()
  }

  /**
   * @private
   * @param context {CanvasRenderingContext2D}
   */
  renderBackground (context) {
    if (!this.#backgroundSnapshot) {
      const { leftHeight: LEFT_HEIGHT, rightHeight: RIGHT_HEIGHT } = Skin.config.main.header

      this.#backgroundSnapshot = FrameSnapshot.createSnapshot(ctx => {
        ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
        const RIGHT_LEFT = CANVAS.WIDTH / 3 + px(120)
        const LEFT_RIGHT = CANVAS.WIDTH / 3 - px(120)
        const BEZIER_POINT1 = [RIGHT_LEFT - px(40), RIGHT_HEIGHT]
        const BEZIER_POINT2 = [LEFT_RIGHT + px(40), RIGHT_HEIGHT]

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(CANVAS.WIDTH, 0)
        ctx.lineTo(CANVAS.WIDTH, RIGHT_HEIGHT)
        ctx.lineTo(RIGHT_LEFT, RIGHT_HEIGHT)
        ctx.bezierCurveTo(
          ...BEZIER_POINT1,
          ...BEZIER_POINT2,
          LEFT_RIGHT, LEFT_HEIGHT,
        )
        ctx.lineTo(LEFT_RIGHT, LEFT_HEIGHT)
        ctx.lineTo(0, LEFT_HEIGHT)
        ctx.lineTo(0, 0)
        ctx.closePath()

        ctx.fillStyle = BG_COLOR
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(CANVAS.WIDTH, RIGHT_HEIGHT)
        ctx.lineTo(RIGHT_LEFT, RIGHT_HEIGHT)
        ctx.bezierCurveTo(
          ...BEZIER_POINT1,
          ...BEZIER_POINT2,
          LEFT_RIGHT, LEFT_HEIGHT,
        )
        ctx.lineTo(0, LEFT_HEIGHT)

        ctx.lineWidth = py(8)
        ctx.lineJoin = 'round'
        ctx.strokeStyle = BORDER_COLOR
        ctx.stroke()
      })
    }

    this.#backgroundSnapshot.render(context)
  }
}
