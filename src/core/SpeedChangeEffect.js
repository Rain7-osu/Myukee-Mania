import { ValueChangeEffect } from './ValueChangeEffect'

export class SpeedChangeEffect extends ValueChangeEffect {
  /**
   * @param speed {number}
   * @param time {number}
   */
  constructor (speed, time) {
    super(`Speed has changed to ${speed}`, time)
  }
}
