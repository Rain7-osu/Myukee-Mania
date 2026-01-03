import { RenderObject } from '../Core/RenderObject';
import type { Beatmap } from '../Models/Beatmap';
import { FrameSnapshot } from '../Core/FrameSnapshot';
import { Skin } from '../Configs/Skin';
import { CANVAS, px, py, vw } from '../Configs/Config';
import { formatMapTime, rgba } from '../_common/utils';

const TRANSITION_DURATION = 200
const BG_COLOR = 'rgb(0, 0, 0)'
const BORDER_COLOR = 'rgb(0, 102, 255)'

export class MainHeader extends RenderObject {
  private _beatmap: Beatmap

  private _backgroundSnapshot: FrameSnapshot | null = null

  private _headerSnapshot: FrameSnapshot | null = null

  private _translateY = 0

  private _leftMaskTop = 260

  private _textAlpha = 100

  private _switchingBeatmap = false

  private _speed: number

  constructor(speed: number) {
    super()
    this._speed = speed
    this._leftMaskTop = Skin.config.main.header.title.lineHeight
  }

  set speed(s: number) {
    this._speed = s
  }

  async hide() {
    if (this._translateY === -260) {
      return Promise.resolve()
    }
    await this.createTransition(this._translateY, -280, 600, 'easeOut', value => this._translateY = value)

  }

  async show() {
    if (this._translateY === 0) {
      return Promise.resolve()
    }
    await this.createTransition(this._translateY, 0, 600, 'easeOut', value => this._translateY = value)
  }

  async setBeatmap(beatmap: Beatmap) {
    const { title: { lineHeight } } = Skin.config.main.header
    this._headerSnapshot = null
    this._switchingBeatmap = true
    this._textAlpha = 0
    this.cancelTransitions()
    this._beatmap = beatmap
    await Promise.all([
      this.createTransition(this._leftMaskTop, lineHeight, TRANSITION_DURATION, 'linear', value => this._leftMaskTop = value),
      this.createTransition(this._textAlpha, 100, TRANSITION_DURATION, 'linear', value => this._textAlpha = value),
    ])
    this._switchingBeatmap = false
  }

  render(context) {
    this.renderWithSnapshot(context)
    if (this._switchingBeatmap) {
      this.renderTitleMask(context)
    }
    this.renderSpeed(context)
  }

  renderSpeed(context: CanvasRenderingContext2D) {
    const TOP = py(12)
    const RIGHT = CANVAS.WIDTH - py(12)
    const FONT_SIZE = py(48)
    context.save()
    context.font = `${FONT_SIZE}px 微软雅黑`
    context.fillStyle = 'rgba(255, 255, 255, 0.4)'
    context.textBaseline = 'top'
    context.textAlign = 'right'
    context.fillText(`${this._speed}(fixed)`, RIGHT, TOP + this._translateY)
    context.restore()
  }

  renderWithSnapshot(context: CanvasRenderingContext2D) {
    if (this._switchingBeatmap) {
      this.renderBackground(context)
      this.renderBeatmapInfo(context)
    } else {
      if (!this._headerSnapshot) {
        this._headerSnapshot = FrameSnapshot.createSnapshot(ctx => {
          ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
          this.renderBackground(ctx)
          this.renderBeatmapInfo(ctx)
        })
      }

      this._headerSnapshot.setStyle(0, this._translateY, CANVAS.WIDTH, CANVAS.HEIGHT)
      this._headerSnapshot.render(context)
    }
  }

  renderBeatmapInfo(context: CanvasRenderingContext2D) {
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
    } = this._beatmap

    context.save()
    let offsetY = top

    /**
     * @param text {string}
     * @param item {{ font: string; fontWeight?: string; fontSize: number; lineHeight: number }}
     */
    const renderLine = (text, item) => {
      const { font, fontWeight, fontSize, lineHeight } = item
      const [r, g, b] = rgba.toValues(color)
      context.fillStyle = rgba.format([r, g, b, this._textAlpha / 100])
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

  renderTitleMask(context: CanvasRenderingContext2D) {
    const { leftHeight: LEFT_HEIGHT, title: { lineHeight: LEFT_MASK_TOP } } = Skin.config.main.header
    const LEFT_RIGHT = CANVAS.WIDTH / 3 - vw(120 / 2560)

    context.save()
    // 从下到上的渐变
    const gradient = context.createLinearGradient(0, LEFT_HEIGHT, 0, LEFT_MASK_TOP)

    const offsetBlack = (LEFT_HEIGHT - this._leftMaskTop) / (LEFT_HEIGHT - LEFT_MASK_TOP)

    // 从下向上，从不透明到透明
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
    gradient.addColorStop(offsetBlack, 'rgba(0, 0, 0, 1)')
    gradient.addColorStop((1 - offsetBlack) / 2, 'rgba(0, 0, 0, 0.5)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    context.fillStyle = gradient
    context.fillRect(0, LEFT_MASK_TOP, LEFT_RIGHT - 4, LEFT_HEIGHT - LEFT_MASK_TOP - 4) // 4: strokeLineWidth, 2: rightStroke
    context.restore()
  }

  renderBackground(context: CanvasRenderingContext2D) {
    if (!this._backgroundSnapshot) {
      const { leftHeight: LEFT_HEIGHT, rightHeight: RIGHT_HEIGHT } = Skin.config.main.header

      this._backgroundSnapshot = FrameSnapshot.createSnapshot(ctx => {
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

    this._backgroundSnapshot.render(context)
  }
}
