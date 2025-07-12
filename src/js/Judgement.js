import { Shape } from './Shape'

export const JudgementType = {
  PERFECT: 320,
  GREAT: 300,
  GOOD: 200,
  OK: 100,
  MEH: 50,
  MISS: 0,
}

/**
 * the Judgement of hit notes
 */
export class Judgement extends Shape {
  /** @type {JudgementType} */
  #type

  /** @type {number} */
  #hitTiming

  constructor (type, hitTiming) {
    super()
    this.#type = type
    this.#hitTiming = hitTiming
  }

  render (context: CanvasRenderingContext2D) {

  }
}
