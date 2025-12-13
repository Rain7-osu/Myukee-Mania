import { Shape } from './Shape'
import { CANVAS } from './Config'
import { BaseButton } from './BaseButton'
import { vh, vw } from './utils'
import { ModButton } from './ModButton'
import { FrameSnapshot } from './FrameSnapshot'

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
const BUTTON_FONT_SIZE = 64 / 1440
const DIFFICULTY_REDUCTION_LABEL_COLOR = 'rgb(73, 190, 67)'
const DIFFICULTY_INCREASE_LABEL_COLOR = 'rgb(240, 78, 13)'
const SPECIAL_LABEL_COLOR = 'rgb(255, 255, 255)'
const LABEL_LEFT = 76 / 2560
const LABEL_GAP = 132 / 1440
const LABEL_FONT_SIZE = 48 / 1440
const TITLE_TEXT = 'Mods provide different ways to enjoy gameplay. Some have an effect on the score you can achieve during ranked play. Others are just for fun.'
const TITLE_COLOR = 'rgb(255, 255, 255)'
const TITLE_FONT_SIZE = 36
const MOD_LEFT = 660 / 2560
const MOD_TOP = 356 / 1440
const MOD_HEIGHT = 120 / 1440
const MOD_WIDTH = 120 / 2560
const MOD_X_GAP = 78 / 2560
const MOD_Y_GAP = 64 / 1440
const MOD_FONT_SIZE = 36 / 2560

/**
 * @readonly
 * @enum {string}
 */
export const Mod = {
  DT: 'DT',
  NC: 'NC',
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
   * @type {ModButton[]}
   */
  #modButtons = []

  /**
   * @param container {HTMLCanvasElement}
   */
  constructor (container) {
    super()
    this.#container = container
    const baseModStyle = {
      width: vw(MOD_WIDTH),
      height: vh(MOD_HEIGHT),
    }
    /**
     * @readonly
     * @type {Array<Array<{ mod: Mod[] | Mod; backgroundImage: Shape | Shape[]; description?: string }>>}
     */
    const modConfig = [
      [
        { mod: Mod.EZ, backgroundImage: EZIcon() },
        { mod: Mod.NF, backgroundImage: NFIcon() },
        { mod: Mod.HT, backgroundImage: HTIcon() },
      ],
      [
        { mod: Mod.HR, backgroundImage: HRIcon() },
        { mod: [Mod.SD, Mod.PF], backgroundImage: [SDIcon(), PFIcon()] },
        { mod: [Mod.DT, Mod.NC], backgroundImage: [DTIcon(), NCIcon()] },
        { mod: [Mod.FD, Mod.HD], backgroundImage: [FDIcon(), HDIcon()] },
        { mod: Mod.FL, backgroundImage: FLIcon() },
      ],
      [
        { mod: Mod.MR, backgroundImage: MRIcon() },
        { mod: Mod.RD, backgroundImage: RDIcon() },
        { mod: Mod.AT, backgroundImage: ATIcon() },
      ],
    ]
    this.#modButtons = modConfig.map((item, index) => {
      return item.map((subItem, subIndex) => {
        return new ModButton(container, {
          left: vw(MOD_LEFT + subIndex * (MOD_WIDTH + MOD_X_GAP)),
          top: vh(MOD_TOP + index * (MOD_HEIGHT + MOD_Y_GAP)),
          mod: subItem.mod,
          backgroundImage: subItem.backgroundImage,
          description: subItem.description || '',
          ...baseModStyle,
        })
      })
    }).reduce((prev, current) => {
      return [...prev, ...current]
    }, [])
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
      fontSize: vh(BUTTON_FONT_SIZE),
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
      fontSize: vh(BUTTON_FONT_SIZE),
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
    this.#modButtons.forEach(btn => {
      btn.registerEvents({})
    })
  }

  removeEvents () {
    this.#closeButton.removeEvents()
    this.#resetButton.removeEvents()
    this.#modButtons.forEach(btn => {
      btn.removeEvents()
    })
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

    const renderLabel = () => {

    }

    renderBg()
    this.#modButtons.forEach(button => button.render(context))
    this.#closeButton.render(context)
    this.#resetButton.render(context)
  }
}

/**
 * @return {(function(context: CanvasRenderingContext2D): void)}
 */
const createRender = ({
  fillStyle,
  fontSize,
  text,
  bottom = 6,
}) => {
  return (context) => {
    context.fillStyle = fillStyle
    context.beginPath()
    context.roundRect(0, 0, vw(MOD_WIDTH), vh(MOD_HEIGHT), [8])
    context.fill()
    context.fillStyle = BUTTON_TEXT_COLOR
    context.font = `${fontSize}px 等线 Light`
    const lines = text.split('\n')
    if (lines.length === 1) {
      context.textBaseline = 'bottom'
      context.textAlign = 'center'
      context.shadowColor = 'rgb(255, 255, 255)'
      context.shadowBlur = 4
      context.fillText(text, vw(MOD_WIDTH / 2), vh(MOD_HEIGHT) - bottom)
    } else {
      context.textBaseline = 'bottom'
      context.textAlign = 'left'
      context.shadowColor = 'rgb(255, 255, 255)'
      context.shadowBlur = 4
      context.fillText(lines[0], 2, vh(MOD_HEIGHT) - bottom - fontSize)
      context.textBaseline = 'bottom'
      context.textAlign = 'right'
      context.fillText(lines[1], vw(MOD_WIDTH) - 2, vh(MOD_HEIGHT) - bottom)
    }
  }
}

const EZIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(68, 102, 28)',
  fontSize: vh(MOD_HEIGHT / 4),
  text: 'Easy',
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const NFIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(29, 34, 74)',
  fontSize: vh(MOD_HEIGHT / 5),
  text: 'No-Fail',
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const HTIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(49, 43, 53)',
  fontSize: vh(MOD_HEIGHT / 4),
  text: 'Half',
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const HRIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(108, 2, 32)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Hard\nRock',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const SDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(95, 44, 1)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Sudden\nDeath',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const PFIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(113, 64, 22)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Perfect',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const DTIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(91, 51, 130)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Double',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const NCIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(57, 28, 154)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Nightcore',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const FDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(107, 68, 0)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Fade',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const HDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(152, 116, 30)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Hidden',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const FLIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(26, 26, 26)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Flashlight',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const MRIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(31, 62, 49)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Mirror',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const RDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(2, 96, 42)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Random',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

const ATIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  fillStyle: 'rgb(0, 60, 125)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Auto',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))
