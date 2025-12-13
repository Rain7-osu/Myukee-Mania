import { Shape } from './Shape'
import { CANVAS } from './Config'
import { BaseButton } from './BaseButton'
import { vh, vw } from './utils'

const BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.75)'
const BUTTON_TEXT_COLOR = '#fff'
const BUTTON_RESET_COLOR = 'rgb(233, 49, 0)'
const BUTTON_CLOSE_COLOR = 'rgb(107, 107, 107)'
const BUTTON_RESET_HOVER_COLOR = 'rgb(249, 67, 1)'
const BUTTON_CLOSE_HOVER_COLOR = 'rgb(127, 127, 127)'
const BUTTON_BOTTOM = 224 / 1440
const BUTTON_GAP = 44 / 1440
const BUTTON_HEIGHT = 104 / 1440
const BUTTON_WIDTH = 1356 / 2560
const FONT_SIZE = 64 / 1440

/**
 * @readonly
 * @enum {string}
 */
export const Mod = {
  DT: 'DT',
  HR: 'HR',
  FD: 'FD',
  HD: 'HD',
  FL: 'FL',
  SD: 'SD',
  PF: 'PF',
  HT: 'HT',
  EZ: 'EZ',
  NF: 'NF',
  MR: 'MR',
  RD: 'RD',
  AT: 'AT',
}

export class ModsPanel extends Shape {
  /**
   * @type {HTMLCanvasElement}
   */
  #container

  /**
   * @type {BaseButton}
   */
  #resetButton

  /**
   * @type {BaseButton}
   */
  #closeButton

  /**
   * @type {Mod[]}
   */
  #selectedMods = []

  /**
   * @param container {HTMLCanvasElement}
   */
  constructor (container) {
    super()
    this.#container = container
    this.#resetButton = new BaseButton(container, {
      text: '1. Reset All Mods',
      left: CANVAS.WIDTH / 2 - vw(BUTTON_WIDTH) / 2,
      top: CANVAS.HEIGHT - vh(BUTTON_BOTTOM + BUTTON_HEIGHT * 2 + BUTTON_GAP),
      height: vh(BUTTON_HEIGHT),
      width: vw(BUTTON_WIDTH),
      color: BUTTON_TEXT_COLOR,
      background: BUTTON_RESET_COLOR,
      hoverBackground: BUTTON_RESET_HOVER_COLOR,
      font: '微软雅黑',
      fontSize: vh(FONT_SIZE),
    })
    this.#closeButton = new BaseButton(container, {
      text: '2. Close',
      left: CANVAS.WIDTH / 2 - vw(BUTTON_WIDTH) / 2,
      top: CANVAS.HEIGHT - vh(BUTTON_BOTTOM + BUTTON_HEIGHT),
      height: vh(BUTTON_HEIGHT),
      width: vw(BUTTON_WIDTH),
      color: BUTTON_TEXT_COLOR,
      background: BUTTON_CLOSE_COLOR,
      hoverBackground: BUTTON_CLOSE_HOVER_COLOR,
      font: '微软雅黑',
      fontSize: vh(FONT_SIZE),
    })
  }

  /**
   * @param onClose {function(selectedMods: Mod[]): void}
   */
  registerEvents ({
    onClose,
  }) {
    this.#resetButton.registerEvents({
      onClick: () => {
        this.#selectedMods = []
      },
    })
    this.#closeButton.registerEvents({
      onClick: () => {
        onClose(this.#selectedMods)
      },
    })
  }

  removeEvents () {
    this.#closeButton.removeEvents()
    this.#resetButton.removeEvents()
  }

  updateEffect (time) {
    super.updateEffect(time)
    this.#resetButton.updateEffect(time)
    this.#closeButton.updateEffect(time)
  }

  render (context) {
    const renderBg = () => {
      context.save()
      context.fillStyle = BACKGROUND_COLOR
      context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
      context.restore()
    }

    renderBg()
    this.#closeButton.render(context)
    this.#resetButton.render(context)
  }
}
