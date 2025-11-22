import { Shape } from './Shape'
import { Skin } from './Skin'
import { CANVAS } from './Config'

export class ScoreEffect extends Shape {
  #score = 0

  #targetScore = 0

  reset () {
    this.#score = 0
    this.#targetScore = 0
  }

  #left = 0

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
    } else {
      const width = Skin.config.common.number.width
      const { top, right } = Skin.config.stage.score
      this.#left = CANVAS.WIDTH - right - width * 8
      this.#top = top
    }
  }

  /**
   * @param score {number}
   * @param increasing {number?} 单次 render 后更新增量
   */
  setScore (score, increasing) {
    if (score === this.#score) {
      return
    }

    const step = increasing || ((this.#targetScore - this.#score) / 10)

    this.#targetScore = score
    this.cancelStepTos()
    this.createStepTo(this.#score, this.#targetScore, step, (value) => {
      this.#score = value
    }, () => {
      this.#score = this.#targetScore
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

    context.fillStyle = color
    context.strokeStyle = strokeColor
    context.textAlign = 'right'
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
      textAlign: 'left',
      textBaseline: 'top',
      stroke: true,
    })
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  renderImageNumbers (context) {
    const NumberImageConfig = Skin.config.stage.score.assets || Skin.config.common.number.default
    const width = Skin.config.common.number.width
    const numbers = this.scoreNumbers().split('')

    let offsetLeft = this.#left

    const numList = numbers.map((name) => `default-${name}`)
    numList.forEach((name) => {
      const config = NumberImageConfig[name]
      context.drawImage(config.image, offsetLeft, this.#top, config.width, config.height)
      offsetLeft += width
    })
  }
}
