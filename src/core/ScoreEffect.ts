import { RenderObject } from './RenderObject'
import { Skin } from './Skin'
import { CANVAS } from './Config'

export class ScoreEffect extends RenderObject {
  private _score: number = 0

  private _targetScore: number = 0

  private readonly _textAlign: string = 'left'

  reset(): void {
    this._score = 0
    this._targetScore = 0
  }

  private _right: number | null = null
  private readonly _left: number | null = null

  private readonly _top: number = 0

  private _width: number = 0

  private _height: number = 0

  constructor(style?: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) {
    super()
    if (style) {
      this._left = style.left
      this._top = style.top
      this._width = style.width
      this._height = style.height
      this._textAlign = 'left'
    } else {
      const { top, right, lineHeight, textAlign } = Skin.config.stage.score
      this._left = CANVAS.WIDTH - right
      this._top = top
      this._height = lineHeight
      this._textAlign = textAlign
    }
  }

  async setScore(score: number, increasing?: number): Promise<void> {
    if (score === this._score) {
      return Promise.resolve()
    }

    const step = increasing || ((this._targetScore - this._score) / 10)

    this._targetScore = score
    this.cancelStepTos()
    return new Promise<void>(resolve => {
      this.createStepTo(this._score, this._targetScore, step, (value) => this._score = value, () => resolve())
    })
  }

  private scoreNumbers(): string {
    // 把 score 数字，数字字符数组，并且长度为 8 位，不足的前置补零，并且 score 是整数，四舍五入
    return String(Math.round(this._score)).padStart(8, '0')
  }

  render(context: CanvasRenderingContext2D): void {
    const { font, fontSize, lineHeight, color, strokeColor, fontWeight } = Skin.config.stage.score

    context.save()
    context.fillStyle = color
    context.strokeStyle = strokeColor
    context.textAlign = 'right'
    context.textBaseline = 'top'
    context.lineWidth = 2

    RenderObject.drawText({
      context,
      text: this.scoreNumbers(),
      x: this._left,
      y: this._top,
      width: 0,
      height: lineHeight,
      font: `${fontWeight} ${fontSize}px ${font}`,
      color,
      strokeColor,
      textAlign: this._textAlign,
      textBaseline: 'top',
      stroke: true,
    } as any)
    context.restore()
  }
}
