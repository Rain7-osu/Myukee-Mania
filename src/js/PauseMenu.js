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

  #showRetry = true
  /**
   * @param show {boolean}
   */
  set showRetry (show) { this.#showRetry = show}

  #showResume = true
  /**
   * @param show {boolean}
   */
  set showResume (show) { this.#showResume = show}

  #showBack = true
  /**
   * @param show {boolean}
   */
  set showBack (show) { this.#showBack = show}

  /**
   * @param container {HTMLElement}
   */
  constructor (container) {
    super()

    const {
      base: { width, height, font, left, gap, fontSize, radius, color },
      resume,
      retry,
      back,
      fullscreen,
    } = Skin.config.pauseMenu.buttons

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
      background: resume.background,
      text: resume.text,
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
      background: retry.background,
      text: retry.text,
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
      background: back.background,
      text: back.text,
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
      background: fullscreen.background,
      text: fullscreen.text,
    })
  }

  /**
   * @param onResume {Function?}
   * @param onRetry  {Function?}
   * @param onBack {Function?}
   * @param onFullscreenChange {Function?}
   */
  registerEvents ({
    onResume,
    onRetry,
    onBack,
    onFullscreenChange,
  }) {
    this.#showResume && this.#resumeButton.registerEvents({ onClick: onResume })
    this.#showRetry && this.#retryButton.registerEvents({ onClick: onRetry })
    this.#showBack && this.#backButton.registerEvents({ onClick: onBack })
    this.#fullscreenButton.registerEvents({ onClick: onFullscreenChange })

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

  show () {
    this.createTransition(0, 100, 800, 'easeOut', (value) => {
      this.#alpha = value / 100
    })
  }

  hide () {
    this.createTransition(100, 0, 600, 'easeOut', (value) => {
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
    this.#showResume && this.#resumeButton.render(context)
    this.#showRetry && this.#retryButton.render(context)
    this.#showBack && this.#backButton.render(context)

    if (isFullscreen()) {
      this.#fullscreenButton.setStyle({ text: 'Exit Fullscreen' })
    } else {
      this.#fullscreenButton.setStyle({ text: 'Enter Fullscreen' })
    }

    this.#fullscreenButton.render(context)

    context.globalAlpha = 1
  }
}
