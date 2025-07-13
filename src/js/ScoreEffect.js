import { Shape } from './Shape'
import { NumberImageConfig } from './ResourceConfig'
import { CANVAS_WIDTH } from './Config'

export class ScoreEffect extends Shape {
  #score

  /**
   * Creates an instance of ScoreEffect.
   * @param score {number}
   */
  constructor (score) {
    super()
    // 把 score 数字，数字字符数组，并且长度为 8 位，不足的前置补零，并且 score 是整数，四舍五入
    this.#score = String(Math.round(score)).padStart(8, '0').split('');
  }

  render (context) {
    const numList = this.#score.map((name) => `default-${name}`)

    const width = numList.reduce((previousValue, currentValue) => {
      return previousValue + (NumberImageConfig[currentValue]?.width || 0)
    }, 0)

    let x = CANVAS_WIDTH - width - 10
    const y = 10

    numList.forEach((name) => {
      const config = NumberImageConfig[name]
      context.drawImage(config.image, x, y, config.width, config.height)
      x += config.width
    })
  }
}
