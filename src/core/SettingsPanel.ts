import { RenderObject } from './RenderObject'
import { Skin } from './Skin'
import { CANVAS } from './Config'

const TRANSITION_DURATION = 500

interface InnerStyle {
  width: number;
  maxWidth: number;
}

export class SettingsPanel extends RenderObject {
  #container: HTMLCanvasElement

  #innerStyle: InnerStyle = {
    width: 0,
    maxWidth: Skin.config.settingsPanel.width,
  }

  constructor(container: HTMLCanvasElement) {
    super()
    this.#container = container
  }

  get width(): number {
    return this.#innerStyle.width
  }

  async show () {
    this.display = true
    this.cancelTransitions()
    await this.createTransition(this.#innerStyle.width, this.#innerStyle.maxWidth, TRANSITION_DURATION, 'easeOut', value => this.#innerStyle.width = value)
  }

  async hide () {
    if (!this.display) {
      return Promise.resolve()
    }
    this.cancelTransitions()
    await this.createTransition(this.#innerStyle.width, 0, TRANSITION_DURATION, 'easeOut', value => this.#innerStyle.width = value)
    this.display = false
  }

  render(context: CanvasRenderingContext2D) {
    const { background } = Skin.config.settingsPanel
    context.fillStyle = background
    context.fillRect(0, 0, this.width, CANVAS.HEIGHT)
  }
}
