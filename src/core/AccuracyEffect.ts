import { RenderObject } from './RenderObject'
import { Skin } from './Skin'

/**
 * Generates a percentage text with 4 significant digits.
 */
const formatPercentage = (value: number): string => {
  if (value <= 0) {
    return '00.00%'
  }
  return (value * 100).toFixed(2) + '%'
}

export class AccuracyEffect extends RenderObject {
  static format (acc: number): string {
    return formatPercentage(acc)
  }

  #value: number = 0

  set acc(value: number) { this.#value = value }

  render (context: CanvasRenderingContext2D): void {
    const acc = formatPercentage(this.#value)
    const { x, y, font, textAlign, color } = Skin.config.stage.accuracy

    context.save()
    this.drawText({
      context,
      font,
      color,
      textAlign: 'right',
      textBaseline: 'top',
      text: acc,
      x, y,
      stroke: false,
      width: 0,
      height: 0,
    })

    context.restore()
  }
}
