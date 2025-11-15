import { Shape } from './Shape.js'
import { CANVAS_HEIGHT, NOTE_WIDTH } from './Config.js'
import { NumberImageConfig } from './ResourceConfig.js'

export class ComboEffect extends Shape {
  /** @type {number} */
  #value

  constructor (value) {
    super()
    this.#value = value
  }

  render (context) {
    if (!this.#value) {
      return
    }
    const imageList = String(this.#value)
      .split('')
      .map((name) => `default-${name}`)

    const width = imageList.reduce((previousValue, currentValue) => {
      return previousValue + (NumberImageConfig[currentValue]?.width || 0)
    }, 0)

    let x = (4 * NOTE_WIDTH - width) / 2

    imageList.forEach((name) => {
      const config = NumberImageConfig[name]
      context.drawImage(config.image, x, CANVAS_HEIGHT / 1.5 - config.height / 2, config.width, config.height)
      x += config.width
    })
  }x
}
