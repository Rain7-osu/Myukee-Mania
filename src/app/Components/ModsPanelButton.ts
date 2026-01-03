import { RenderButton } from './RenderButton'
import { ActiveEffect } from '../Core/ActiveEffect'

const LEFT_OFFSET = 120

export class ModsPanelButton extends RenderButton {
  private _translateX = LEFT_OFFSET

  private _showEffect = new ActiveEffect()

  set initTranslateDirection (x: 1 | -1) {
    this._translateX = x > 0 ? LEFT_OFFSET : -LEFT_OFFSET
  }

  rect (): [number, number, number, number] {
    const [x, y, w, h] = super.rect()
    return [x + this._translateX, y, w, h]
  }

  async show (): Promise<void> {
    this._showEffect.cancelTransitions()
    await this._showEffect.createTransition(this._translateX, 0, 300, 'easeOut', (v: number) => this._translateX = v)
  }

  updateEffect (now: number): void {
    super.updateEffect(now)
    this._showEffect.updateEffect(now)
  }
}
