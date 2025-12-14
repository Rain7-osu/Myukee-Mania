import { Shape } from './Shape'
import { Skin } from './Skin'
import { CANVAS } from './Config'

export class ScoreEffect extends Shape {
  #score = 0

  #targetScore = 0
  /**
   * @type {string}
   */
  #textAlign = 'left'

  reset () {
    this.#score = 0
    this.#targetScore = 0
  }

  /**
   * @type {number | null}
   */
  #right = null
  /**
   * @type  {number | null}
   */
  #left = null

  #top = 0

  #width = 0

  #height = 0

  /**
   * @param {{
   *   left: number;
   *   top: number;
   *   width: number;
   *   height: number;
   * }?} style
   */
  constructor (style) {
    super()
    if (style) {
      this.#left = style.left
      this.#top = style.top
      this.#width = style.width
      this.#height = style.height
      this.#textAlign = 'left'
    } else {
      const { top, right, lineHeight, textAlign } = Skin.config.stage.score
      this.#left = CANVAS.WIDTH - right
      this.#top = top
      this.#height = lineHeight
      this.#textAlign = textAlign
    }
  }

  /**
   * @param score {number}
   * @param increasing {number?} 单次 render 后更新增量
   */
  async setScore (score, increasing) {
    if (score === this.#score) {
      return Promise.resolve()
    }

    const step = increasing || ((this.#targetScore - this.#score) / 10)

    this.#targetScore = score
    this.cancelStepTos()
    return new Promise(resolve => {
      this.createStepTo(this.#score, this.#targetScore, step, (value) => this.#score = value, () => resolve())
    })
  }

  /**
   * @private
   * @return {string}
   */
  scoreNumbers () {
    // 把 score 数字，数字字符数组，并且长度为 8 位，不足的前置补零，并且 score 是整数，四舍五入
    return String(Math.round(this.#score)).padStart(8, '0')
  }

  render (context) {
    const { font, fontSize, lineHeight, color, strokeColor, fontWeight } = Skin.config.stage.score

    context.save()
    context.fillStyle = color
    context.strokeStyle = strokeColor
    context.textAlign = 'right'
    context.textBaseline = 'top'
    context.lineWidth = 2

    this.drawText({
      context,
      text: this.scoreNumbers(),
      x: this.#left,
      y: this.#top,
      width: 0,
      height: lineHeight,
      font: `${fontWeight} ${fontSize}px ${font}`,
      color,
      strokeColor,
      textAlign: this.#textAlign,
      textBaseline: 'top',
      stroke: true,
    })
    context.restore()
  }
}
