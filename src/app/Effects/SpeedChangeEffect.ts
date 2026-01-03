import { ValueChangeEffect } from './ValueChangeEffect'

export class SpeedChangeEffect extends ValueChangeEffect {
  constructor(speed: number, time: number) {
    super(`Speed has changed to ${speed}`, time)
  }
}
