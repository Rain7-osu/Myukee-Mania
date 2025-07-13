import { Shape } from './Shape'
import { FileManager } from './FileManager'
import { CANVAS_HEIGHT, NOTE_WIDTH } from './Config'

const NumberImageConfig = {
  ['default-0']: {
    image: FileManager.loadImage('./skin/default-0.png'),
    width: 35,
    height: 52,
  },
  ['default-1']: {
    image: FileManager.loadImage('./skin/default-1.png'),
    width: 25,
    height: 50,
  },
  ['default-2']: {
    image: FileManager.loadImage('./skin/default-2.png'),
    width: 32,
    height: 51,
  },
  ['default-3']: {
    image: FileManager.loadImage('./skin/default-3.png'),
    width: 32,
    height: 52,
  },
  ['default-4']: {
    image: FileManager.loadImage('./skin/default-4.png'),
    width: 36,
    height: 51,
  },
  ['default-5']: {
    image: FileManager.loadImage('./skin/default-5.png'),
    width: 32,
    height: 51,
  },
  ['default-6']: {
    image: FileManager.loadImage('./skin/default-6.png'),
    width: 34,
    height: 52,
  },
  ['default-7']: {
    image: FileManager.loadImage('./skin/default-7.png'),
    width: 32,
    height: 50,
  },
  ['default-8']: {
    image: FileManager.loadImage('./skin/default-8.png'),
    width: 34,
    height: 52,
  },
  ['default-9']: {
    image: FileManager.loadImage('./skin/default-9.png'),
    width: 34,
    height: 52,
  },
}

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
