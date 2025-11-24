import { BaseButton } from './BaseButton'
import { Skin } from './Skin'

export class BackButton extends BaseButton {
  #defaultWidth = 0

  constructor (container) {
    const { buttons: { back } } = Skin.config.rankingBoard
    super(container, {
      width: back.width,
      height: back.height,
      left: back.left,
      top: back.top,
      text: back.text,
      background: back.background,
      color: back.color,
      font: back.font,
      fontSize: back.fontSize,
      radius: 0,
      hoverWidth: back.width * 1.25,
      hoverScale: 100,
      offsetPercentX: 0,
    })
    this.#defaultWidth = back.width
  }

  /**
   * @override
   */
  async hover () {
    this.hovered = true
    this.cancelTransitions()
    const { hoverWidth, width } = this.style()
    console.log('hoverInfo', width, hoverWidth)
    await this.createTransitionPromisify(width, hoverWidth, 100,
      'elastic', (value) => this.setStyle({ width: value }))
  }

  /**
   * @override
   */
  async hoverOut () {
    this.hovered = false
    this.cancelTransitions()
    const { width } = this.style()
    await this.createTransitionPromisify(width, this.#defaultWidth, 100,
      'elastic-weak', (value) => this.setStyle({ width: value }))
  }
}
