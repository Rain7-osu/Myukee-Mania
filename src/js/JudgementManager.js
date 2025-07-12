import { Judgement, JudgementType } from './Judgement'
import { Shape } from './Shape'


const JudgementAreaList = [
  JudgementType.PERFECT,
  JudgementType.GREAT,
  JudgementType.GOOD,
  JudgementType.OK,
  JudgementType.MEH,
  JudgementType.MISS,
]

/**
 * @type {{[JudgementType]: (function(od: number): number)}}
 */
const JudgementAreaCalculators = {
  [JudgementType.PERFECT]: () => 16.0,
  [JudgementType.GREAT]: (od) => 64.0 - 3 * od,
  [JudgementType.GOOD]: (od) => 97.0 - 3 * od,
  [JudgementType.OK]: (od) => 127.0 - 3 * od,
  [JudgementType.MEH]: (od) => 151.0 - 3 * od,
  [JudgementType.MISS]: (od) => 188.0 - 3 * od,
}

export class JudgementManager extends Shape {
  /**
   * @type {number}
   * overall Difficult
   */
  #od

  /**
   * @param targetTiming {number}
   * @param hitTiming {number}
   * @return {null | Judgement}
   */
  createByHit(targetTiming, hitTiming) {
    let type = null
    const deviation = Math.abs(targetTiming - hitTiming)
    if (deviation) {
      for (let i = 0; i < JudgementAreaList.length; i++) {
        const judgementType = JudgementAreaList[i]
        const func = JudgementAreaCalculators[judgementType]
        const maxDeviation = func(this.#od)
        if (deviation <= maxDeviation) {
          type = judgementType
        }
      }
    }

    if (!type) {
      return null
    }
    return new Judgement(type, hitTiming)
  }

  constructor (od) {
    super()
    this.#od = od
  }

  render (context: CanvasRenderingContext2D) {
  }
}
