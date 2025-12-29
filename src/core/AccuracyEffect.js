import { RenderObject } from './RenderObject'
import { Skin } from './Skin'

/**
 * Generates a percentage text with 4 significant digits.
 * @param {number} value - A positive number less than 1.
 * @returns {string} - The formatted percentage string.
 */
const formatPercentage = value => {
  if (value <= 0) {
    return '00.00%'
  }
  return (value * 100).toFixed(2) + '%'
}

export class AccuracyEffect extends RenderObject {
  /**
   * @param acc {number}
   */
  static format (acc) {
    return formatPercentage(acc)
  }

  /** @type {number} */
  #value = 0

  /**
   * @param value {number}
   */
  set acc(value) { this.#value = value }

  render (context) {
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
