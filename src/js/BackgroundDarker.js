import { Shape } from './Shape'
import { CANVAS } from './Config'

export class BackgroundDarker extends Shape {
  #value = 0

  set value (value) {
    const target = Math.min(value, 100)
    this.cancelTransitions()
    this.createTransition(0, target, 2000, 'easeOut', (v) => {
      this.#value = v
    })
  }

  reset () {
    this.#value = 0
  }

  render (context) {
    if (this.#value <= 0) {
      return
    }
    const backgroundDark = this.#value
    context.fillStyle = `rgba(0, 0, 0, ${backgroundDark / 100})`
    context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}
