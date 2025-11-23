import { Shape } from './Shape'
import { CANVAS } from './Config'

export class BackgroundDarker extends Shape {
  #value = 0

  async setValue (value, duration = 2000) {
    const target = Math.max(Math.min(value, 100), 0)
    this.cancelTransitions()
    return new Promise(resolve => {
      this.createTransition(this.#value, target, duration, 'easeOut', (v) => {
        this.#value = v
      }, () => resolve())
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
