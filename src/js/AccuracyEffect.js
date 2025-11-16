import { Shape } from './Shape.js'
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

export class AccuracyEffect extends Shape {
  /** @type {number} */
  #acc

  /**
   * Creates an instance of AccuracyEffect.
   * @param acc {number} - The accuracy value, typically between 0 and 1.
   */
  constructor (acc) {
    super()
    this.#acc = acc || 1
  }

  render (context) {
    const acc = formatPercentage(this.#acc)
    const { x, y, font: FONT, textAlign: TEXT_ALIGN, color: COLOR } = Skin.config.stage.accuracy

    context.font = FONT
    context.fillStyle = COLOR
    context.textAlign = TEXT_ALIGN
    context.fillText(acc, x, y)
  }
}
