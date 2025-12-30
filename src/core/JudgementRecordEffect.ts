import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { JudgementType } from './Judgement'

const RESULT_WIDTH = 100
const RESULT_TOP = 200

export type JudgementRecord = Record<JudgementType, number>

export class JudgementRecordEffect extends RenderObject {
  #record: JudgementRecord

  constructor (record: JudgementRecord) {
    super()
    this.#record = record
  }

  render (context: CanvasRenderingContext2D): void {
    const judgementTypes = Object.keys(this.#record)

    const x = CANVAS.WIDTH - RESULT_WIDTH
    let y = RESULT_TOP

    judgementTypes.sort((a, b) => Number(b) - Number(a)).forEach((type) => {
      const content = `${type}: ${this.#record[type]}`
      context.fillStyle = '#FFF'
      context.font = 'bold 18px Torus'
      context.fillText(content, x, y)
      y += 24
    })
  }
}
