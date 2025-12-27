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
  #acc

  /**
   * Creates an instance of AccuracyEffect.
   * @param acc {number} - The accuracy value, typically between 0 and 1.
   */
  constructor (acc) {
    super()
    this.#acc = acc ?? 1
  }

  render (context) {
    const acc = formatPercentage(this.#acc)
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
