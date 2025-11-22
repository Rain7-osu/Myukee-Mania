import { Shape } from './Shape'
import { KeyboardEventManager } from './KeyboardEventManager'
import { BaseButton } from './BaseButton'
import { CANVAS } from './Config'
import { KeyCode } from './KeyCode'
import { Skin } from './Skin'
import { isFullscreen } from './dom'

export class PauseMenu extends Shape {
  #keyboardEventManager = new KeyboardEventManager()
  /**
   * @type {BaseButton}
   */
  #resumeButton
  /**
   * @type {BaseButton}
   */
  #retryButton
  /**
   * @type {BaseButton}
   */
  #backButton
  /**
   * @type {BaseButton}
   */
  #fullscreenButton

  #alpha = 0

  #backgroundColor = 'rgba(0, 0, 0, .85)'

  /**
   * @param container {HTMLElement}
   */
  constructor (container) {
    super()

    const {
      width, height, font, left, gap, fontSize, radius, color,
    } = Skin.config.pauseMenu.buttons.base

    let offsetY = (CANVAS.HEIGHT - 4 * height - 3 * gap) / 2
    this.#resumeButton = new BaseButton(container, {
      left,
      top: offsetY,
      width,
      height,
      font,
      fontSize,
      radius,
      color,
      background: [100, 220, 100, 0.85],
      text: 'Continue',
    })
    offsetY += gap + height
    this.#retryButton = new BaseButton(container, {
      left,
      top: offsetY,
      width,
      height,
      font,
      fontSize,
      radius,
      color,
      background: [255, 159, 28, 0.85],
      text: 'Retry',
    })
    offsetY += gap + height
    this.#backButton = new BaseButton(container, {
      left,
      top: offsetY,
      width,
      height,
      font,
      fontSize,
      radius,
      color,
      background: [255, 100, 100, 0.85],
      text: 'Back to Menu',
    })
    offsetY += gap + height
    this.#fullscreenButton = new BaseButton(container, {
      left,
      top: offsetY,
      width,
      height,
      font,
      fontSize,
      radius,
      color,
      background: [255, 255, 255, 0.85],
      text: 'Enter Fullscreen',
    })
  }

  /**
   * @param onResume {() => void}
   * @param onRetry  {() => void}
   * @param onBack {() => void}
   * @param onFullscreenChange {() => void}
   */
  registerEvents ({
    onResume,
    onRetry,
    onBack,
    onFullscreenChange,
  }) {
    this.#resumeButton.initEvents({ onClick: onResume })
    this.#retryButton.initEvents({ onClick: onRetry })
    this.#backButton.initEvents({ onClick: onBack })
    this.#fullscreenButton.initEvents({ onClick: onFullscreenChange })

    this.#keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ENTER]: () => {
          console.log('enter')
        },
        [KeyCode.UP]: () => {
          console.log('up')
        },
        [KeyCode.DOWN]: () => {
          console.log('down')
        },
      },
    })
  }

  init () {
    this.createTransition(0, 100, 800, 'easeOut', (value) => {
      this.#alpha = value / 100
    })
  }

  removeEvents () {
    this.#keyboardEventManager.removeEvents()
    this.#retryButton.removeEvents()
    this.#backButton.removeEvents()
    this.#resumeButton.removeEvents()
    this.#fullscreenButton.removeEvents()
  }

  updateTransition (time) {
    super.updateTransition(time)
    this.#resumeButton.updateTransition(time)
    this.#retryButton.updateTransition(time)
    this.#backButton.updateTransition(time)
    this.#fullscreenButton.updateTransition(time)
  }

  render (context) {
    context.globalAlpha = this.#alpha

    context.fillStyle = this.#backgroundColor
    context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    this.#resumeButton.render(context)
    this.#retryButton.render(context)
    this.#backButton.render(context)

    if (isFullscreen()) {
      this.#fullscreenButton.setStyle({ text: 'Exit Fullscreen' })
    } else {
      this.#fullscreenButton.setStyle({ text: 'Enter Fullscreen'})
    }

    this.#fullscreenButton.render(context)

    context.globalAlpha = 1
  }
}
