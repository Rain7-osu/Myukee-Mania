import { RenderObject } from './RenderObject'
import { Skin } from './Skin'
import { CANVAS } from './Config'

export class ScoreEffect extends RenderObject {
  #score: number = 0

  #targetScore: number = 0

  #textAlign: string = 'left'

  reset(): void {
    this.#score = 0
    this.#targetScore = 0
  }

  #right: number | null = null
  #left: number | null = null

  #top: number = 0

  #width: number = 0

  #height: number = 0

  constructor(style?: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) {
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

  async setScore(score: number, increasing?: number): Promise<void> {
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

  private scoreNumbers(): string {
    // 把 score 数字，数字字符数组，并且长度为 8 位，不足的前置补零，并且 score 是整数，四舍五入
    return String(Math.round(this.#score)).padStart(8, '0')
  }

  render(context: CanvasRenderingContext2D): void {
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
    } as any)
    context.restore()
  }
}
