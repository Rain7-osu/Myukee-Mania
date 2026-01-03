import { ValueChangeEffect } from './ValueChangeEffect'

export class RateChangeEffect extends ValueChangeEffect {
  constructor(rate: number, time: number) {
    super(`Rate has changed to ${rate === 1 ? '1.0' : rate}`, time)
  }
}
