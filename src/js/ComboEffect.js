import { Shape } from './Shape'
import { CANVAS } from './Config'
import { Skin } from './Skin'

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

    const {
      columnStart,
      note: { width: NOTE_WIDTH },
      combo: { top: TOP, assets },
    } = Skin.config.stage

    const numberResource = assets || Skin.config.common.number.default

    const imageList = String(this.#value)
      .split('')
      .map((name) => `default-${name}`)

    const width = imageList.reduce((previousValue, currentValue) => {
      return previousValue + (numberResource[currentValue]?.width || 0)
    }, 0)

    let x = columnStart + (4 * NOTE_WIDTH - width) / 2.0

    imageList.forEach((name) => {
      const config = numberResource[name]
      context.drawImage(config.image, x, TOP - config.height / 2, config.width, config.height)
      x += config.width
    })
  }
}
