import { Shape } from './Shape'
import { CANVAS } from './Config'
import { FrameSnapshot } from './FrameSnapshot'

const RENDER_CONFIG = {
  color: '#fff',
  top: 20,
  left: 20,
  title: {
    font: '微软雅黑',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: 'normal',
  },
  subtitle: {
    font: '微软雅黑',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 'lighter',
  },
  info1: {
    font: '微软雅黑',
    fontWeight: 'bold',
    fontSize: 28,
    lineHeight: 36,
  },
  info2: {
    font: '微软雅黑',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 'lighter',
  },
  difficulty: {
    font: '微软雅黑',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'normal',
  },
}

export class MainHeader extends Shape {
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

  async hide () {
    if (this.#translateY === -260) {
      return Promise.resolve()
    }

    return new Promise(resolve => {
      this.createTransition(this.#translateY, -280, 600, 'easeOut', (value) => this.#translateY = value, () => resolve())
    })
  }

  async show () {
    if (this.#translateY === 0) {
      return Promise.resolve()
    }
    return new Promise(resolve => {
      this.createTransition(this.#translateY, 0, 600, 'easeOut', (value) => this.#translateY = value, () => resolve())
    })
  }

  /**
   * @param beatmap {Beatmap}
   */
  setBeatmap (beatmap) {
    this.#beatmap = beatmap
    this.#headerSnapshot = null
  }

  render (context) {
    this.renderWithSnapshot(context)
  }

  renderWithSnapshot (context) {
    if (!this.#headerSnapshot) {
      this.#headerSnapshot = FrameSnapshot.createSnapshot((ctx) => {
        ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
        this.renderBackground(ctx)
        this.renderBeatmapInfo(ctx)
      })
    }

    this.#headerSnapshot.setStyle(0, this.#translateY, CANVAS.WIDTH, CANVAS.HEIGHT)
    this.#headerSnapshot.render(context)
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
    } = RENDER_CONFIG
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
    context.fillStyle = color

    /**
     * @param text {string}
     * @param item {{ font: string; fontWeight?: string; fontSize: number; lineHeight: number }}
     */
    const renderLine = (text, item) => {
      const { font, fontWeight, fontSize, lineHeight } = item
      context.font = `${fontWeight} ${fontSize}px ${font}`
      context.textBaseline = 'top'
      context.textAlign = 'left'
      context.fillText(text, left, offsetY)
      offsetY += lineHeight
    }

    renderLine(title, titleItem)
    renderLine(`Mapper: ${creator}`, subtitle)
    renderLine(`Length: ${length}  BPM: ${bpm}  Objects: ${objectCount}`, info1)
    renderLine(`Circles: ${circles}  Sliders: ${sliders}`, info2)
    renderLine(`Keys: ${keys}  OD: ${od}  HP: ${hp} Star Rating: ${star.toFixed(2)}`, difficultyItem)

    context.restore()
  }

  /**
   * @private
   * @param context {CanvasRenderingContext2D}
   */
  renderBackground (context) {
    if (!this.#backgroundSnapshot) {
      this.#backgroundSnapshot = FrameSnapshot.createSnapshot((ctx) => {
        ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
        const RIGHT_HEIGHT = 160
        const RIGHT_LEFT = CANVAS.WIDTH / 3 + 120
        const LEFT_HEIGHT = RIGHT_HEIGHT + 100
        const LEFT_RIGHT = CANVAS.WIDTH / 3 - 120
        const BEZIER_POINT1 = [RIGHT_LEFT - 40, RIGHT_HEIGHT]
        const BEZIER_POINT2 = [LEFT_RIGHT + 40, RIGHT_HEIGHT]

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

        ctx.fillStyle = '#000'
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

        ctx.lineWidth = 8
        ctx.strokeStyle = 'rgb(0,102,255)'
        ctx.stroke()
      })
    }

    this.#backgroundSnapshot.render(context)
  }
}
