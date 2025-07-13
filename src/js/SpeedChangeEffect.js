import { Shape } from './Shape'

export class SpeedChangeEffect extends Shape {
  #currentSpeed

  constructor (speed) {
    super()
    this.#currentSpeed = speed
  }

  render (context) {
    
  }
}
