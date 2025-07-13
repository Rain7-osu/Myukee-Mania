import { Shape } from './Shape'
import { CANVAS_WIDTH } from './Config'

const RESULT_WIDTH = 100
const RESULT_TOP = 200

export class JudgementRecordEffect extends Shape {
  /** @type {JudgementRecord} */
  #record

  /**
   * @param record {JudgementRecord}
   */
  constructor (record) {
    super()
    this.#record = record
  }

  render (context) {
    const judgementTypes = Object.keys(this.#record)

    const x = CANVAS_WIDTH - RESULT_WIDTH
    let y = RESULT_TOP

    judgementTypes.sort((a, b) => Number(b) - Number(a)).forEach((type) => {
      const content = `${type}: ${this.#record[type]}`
      context.fillStyle = '#FFF'
      context.font = 'bold 18px Arial'
      context.fillText(content, x, y)
      y += 24
    })
  }
}
