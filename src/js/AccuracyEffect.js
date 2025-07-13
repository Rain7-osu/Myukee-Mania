import { Shape } from './Shape'
import { CANVAS_WIDTH } from './Config'

/**
 * Generates a percentage text with 4 significant digits.
 * @param {number} value - A positive number less than 1.
 * @returns {string} - The formatted percentage string.
 */
const formatPercentage = value => {
  if (value <= 0) {
    return '00.00%';
  }
  return (value * 100).toFixed(2) + '%';
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
    this.#acc = acc || 0
  }

  render (context) {
    const acc = formatPercentage(this.#acc)

    const x = CANVAS_WIDTH - 10
    const y = 140

    context.font = 'bold 64px Arial'
    context.fillStyle = '#FFF'
    context.textAlign = 'right'
    context.fillText(acc, x, y)
  }
}
