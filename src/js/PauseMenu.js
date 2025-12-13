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
   * @type {null | 'Resume' | 'Retry' | 'Back' | 'FullscreenChange'}
   */
  #currentSelect = null

  /**
   * @type {number | null}
   */
  #currentSelectIndex = null

  /**
   * @type {Array<'Resume', 'Retry', 'Back', 'FullscreenChange'>}
   */
  #currentMenus

  /**
   * @param show {boolean}
   */
  set showRetry (show) {
    this.#showRetry = show
  }

  #showResume = true
  /**
   * @param show {boolean}
   */
  set showResume (show) {
    this.#showResume = show
  }

  #showBack = true
  /**
   * @param show {boolean}
   */
  set showBack (show) {
    this.#showBack = show
  }

  /**
   * @param container {HTMLElement}
   */
  constructor (container) {
    super()

    this.#currentMenus = [
      'Resume',
      'Retry',
      'Back',
      'FullscreenChange',
    ]

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
      hoverScale: 105,
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
      hoverScale: 105,
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
      hoverScale: 105,
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
      hoverScale: 105,
    })
  }

  /**
   * @param arrow {'up' | 'down'}
   */
  changeOption (arrow) {
    const menus = this.#currentMenus

    if (!this.#currentSelect) {
      if (arrow === 'up') {
        this.#currentSelectIndex = menus.length - 1
      } else {
        this.#currentSelectIndex = 0
      }
      this.#currentSelect = menus[this.#currentSelectIndex]
    } else {
      const delta = arrow === 'up' ? -1 : 1
      const index = (this.#currentSelectIndex + delta) % menus.length
      this.#currentSelectIndex = index < 0 ? index + menus.length : index
      this.#currentSelect = menus[this.#currentSelectIndex]
    }

    if (this.#currentSelect === 'Resume' && !this.#showResume) {
      this.changeOption(arrow)
    } else if (this.#currentSelect === 'Retry' && !this.#showRetry) {
      this.changeOption(arrow)
    } else if (this.#currentSelect === 'Back' && !this.#showBack) {
      this.changeOption(arrow)
    }
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
    const eventsMap = {
      onResume,
      onRetry,
      onBack,
      onFullscreenChange,
    }
    this.#showResume && this.#resumeButton.registerEvents({ onClick: onResume })
    this.#showRetry && this.#retryButton.registerEvents({ onClick: onRetry })
    this.#showBack && this.#backButton.registerEvents({ onClick: onBack })
    this.#fullscreenButton.registerEvents({ onClick: onFullscreenChange })

    this.#keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ENTER]: () => {
          if (!this.#currentSelect) {
            onResume?.()
          } else {
            eventsMap[`on${this.#currentSelect}`]?.()
          }
        },
        [KeyCode.ARROW_UP]: () => {
          this.changeOption('up')
        },
        [KeyCode.ARROW_DOWN]: () => {
          this.changeOption('down')
        },
      },
    })
  }

  show () {
    this.#currentSelect = null
    this.#currentSelectIndex = null
    this.createTransition(0, 100, 800, 'easeOut', (value) => {
      this.#alpha = value / 100
    })
  }

  hide () {
    this.#currentSelect = null
    this.#currentSelectIndex = null
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

    if (this.#currentSelect) {
      this.renderArrow(context)
    }
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  renderArrow (context) {
    const {
      buttons: {
        base: { height, gap },
      },
      arrow: { left, right, size, color },
    } = Skin.config.pauseMenu

    let offsetY = (CANVAS.HEIGHT - 4 * height - 3 * gap) / 2
    offsetY += (gap + height) * this.#currentSelectIndex

    this.drawArrow({
      size,
      context,
      color,
      x: left,
      y: offsetY,
      direction: 'right',
      stroke: false,
    })
    this.drawArrow({
      size,
      context,
      color,
      x: CANVAS.WIDTH - right,
      y: offsetY,
      direction: 'left',
      stroke: false,
    })
  }
}
