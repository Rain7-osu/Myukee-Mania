import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { BaseButton } from './BaseButton'
import { rgba, vh, vw } from './utils'
import { ModButton } from './ModButton'
import { FrameSnapshot } from './FrameSnapshot'
import { KeyboardEventManager } from './KeyboardEventManager'
import { KeyCode } from './KeyCode'
import { ModsPanelButton } from './ModsPanelButton'

const BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.95)'
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
const LABEL_TOP = 396 / 1440
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
const BUTTON_ACTIVE_COLOR = 'rgba(255, 255, 255, 0.6)'

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

/**
 * @type {Mod[][]}
 */
const ConflictModsMap = [
  [Mod.EZ, Mod.HR],
  [Mod.HT, Mod.DT, Mod.NC],
  [Mod.HD, Mod.FD, Mod.FL],
  [Mod.SD, Mod.PF, Mod.NF, Mod.AT],
]

export class ModsPanel extends RenderObject {
  /**
   * @type {HTMLCanvasElement}
   */
  #container

  /**
   * @type {ModsPanelButton}
   */
  #resetButton

  /**
   * @type {ModsPanelButton}
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
   * @type {number}
   */
  #alpha = 0

  /**
   * @type {KeyboardEventManager}
   */
  #keyboardEventManager

  /**
   * @param container {HTMLCanvasElement}
   */
  constructor (container) {
    super()
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#container = container
    const baseModStyle = {
      width: vw(MOD_WIDTH),
      height: vh(MOD_HEIGHT),
    }
    /**
     * @readonly
     * @type {Array<Array<{ mod: Mod[] | Mod; backgroundImage: RenderObject | RenderObject[]; description?: string; keyBind: KeyCode }>>}
     */
    const modConfig = [
      [
        { mod: Mod.EZ, backgroundImage: EZIcon(), keyBind: KeyCode.Q },
        { mod: Mod.NF, backgroundImage: NFIcon(), keyBind: KeyCode.W },
        { mod: Mod.HT, backgroundImage: HTIcon(), keyBind: KeyCode.E },
      ],
      [
        { mod: Mod.HR, backgroundImage: HRIcon(), keyBind: KeyCode.A },
        { mod: [Mod.SD, Mod.PF], backgroundImage: [SDIcon(), PFIcon()], keyBind: KeyCode.S },
        { mod: [Mod.DT, Mod.NC], backgroundImage: [DTIcon(), NCIcon()], keyBind: KeyCode.D },
        { mod: [Mod.FD, Mod.HD], backgroundImage: [FDIcon(), HDIcon()], keyBind: KeyCode.F },
        { mod: Mod.FL, backgroundImage: FLIcon(), keyBind: KeyCode.G },
      ],
      [
        { mod: Mod.MR, backgroundImage: MRIcon(), keyBind: KeyCode.Z },
        { mod: Mod.RD, backgroundImage: RDIcon(), keyBind: KeyCode.X },
        { mod: Mod.AT, backgroundImage: ATIcon(), keyBind: KeyCode.C },
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
          keyBind: subItem.keyBind,
          ...baseModStyle,
        })
      })
    }).reduce((prev, current) => {
      return [...prev, ...current]
    }, [])
    this.#resetButton = new ModsPanelButton(container, {
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
      activeBackground: BUTTON_ACTIVE_COLOR,
    })
    this.#closeButton = new ModsPanelButton(container, {
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
      activeBackground: BUTTON_ACTIVE_COLOR,
    })
  }

  _reset () {
    this.#selectedMods = []
    this.#modButtons.forEach(btn => {
      btn.setValue(null)
    })
  }

  /**
   * @param btn {ModButton}
   * @private
   */
  _updateMods (btn) {
    const newMod = btn.value
    if (!newMod) {
      if (Array.isArray(btn.mod)) {
        this.#selectedMods = this.#selectedMods.filter(mod => !btn.mod.includes(mod))
      } else {
        this.#selectedMods = this.#selectedMods.filter(mod => btn.mod !== mod)
      }
    } else {
      const conflictList = ConflictModsMap.find(list => list.includes(newMod))
      if (conflictList) {
        this.#selectedMods = this.#selectedMods.filter(mod => !conflictList.includes(mod))
      }
      this.#selectedMods.push(newMod)
    }
    this.#modButtons.forEach(btn => {
      if (Array.isArray(btn.mod)) {
        const found = this.#selectedMods.find(mod => btn.mod.includes(mod))
        if (!found) {
          btn.setValue(null)
        }
      } else {
        const found = this.#selectedMods.find(mod => btn.mod === mod)
        if (!found) {
          btn.setValue(null)
        }
      }
    })
  }

  async show () {
    this.display = true
    this.#resetButton.initTranslateDirection = -1
    this.#closeButton.initTranslateDirection = 1
    await Promise.all([
      this.createTransition(this.#alpha, 100, 300, 'easeOut', (v) => this.#alpha = v),
      this.#resetButton.show(),
      this.#closeButton.show(),
    ])
  }

  async hide () {
    await this.createTransition(this.#alpha, 0, 300, 'easeOut', (v) => this.#alpha = v)
    this.display = false
  }

  /**
   * @param onClose {function(selectedMods: Mod[]): void}
   */
  registerEvents ({
    onClose,
  }) {
    this.#resetButton.registerEvents({
      onClick: () => {
        this._reset()
      },
    })
    this.#closeButton.registerEvents({
      onClick: () => {
        onClose(this.#selectedMods)
      },
    })

    /** @type {Record<KeyCode, () => void>} */
    const modButtonKeyMaps = {}
    this.#modButtons.forEach(btn => {
      btn.registerEvents({ onClick: () => this._updateMods(btn) })
      modButtonKeyMaps[btn.keyBind] = () => {
        btn.click()
        this._updateMods(btn)
      }
    })

    this.#keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.Digit1]: () => {
          this._reset()
        },
        [KeyCode.Digit2]: () => {
          onClose(this.#selectedMods)
        },
        ...modButtonKeyMaps,
      },
    })
  }

  removeEvents () {
    this.#closeButton.removeEvents()
    this.#resetButton.removeEvents()
    this.#modButtons.forEach(btn => btn.removeEvents())
    this.#keyboardEventManager.removeEvents()
  }

  disableEvents(){
    this.#closeButton.disableEvents()
    this.#resetButton.disableEvents()
    this.#modButtons.forEach(btn => btn.disableEvents())
    this.#keyboardEventManager.disableEvents()
  }

  enableEvents() {
    this.#closeButton.enableEvents()
    this.#resetButton.enableEvents()
    this.#modButtons.forEach(btn => btn.enableEvents())
    this.#keyboardEventManager.enableEvents()
  }

  updateEffect (time) {
    super.updateEffect(time)
    this.#resetButton.updateEffect(time)
    this.#closeButton.updateEffect(time)
  }

  render (context) {
    context.save()
    context.globalAlpha = this.#alpha / 100

    const renderBg = () => {
      context.save()
      context.fillStyle = BACKGROUND_COLOR
      context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
      context.restore()
    }

    const renderLabel = () => {
      let y = vh(LABEL_TOP)
      const fontSize = vh(LABEL_FONT_SIZE)
      context.save()
      context.textBaseline = 'top'
      context.fillStyle = DIFFICULTY_REDUCTION_LABEL_COLOR
      context.font = `${fontSize}px 微软雅黑`
      context.fillText('Difficulty Reduction', vw(LABEL_LEFT), y)
      context.fillStyle = DIFFICULTY_INCREASE_LABEL_COLOR
      context.fillText('Difficulty Increase', vw(LABEL_LEFT), y += vh(LABEL_FONT_SIZE + LABEL_GAP))
      context.fillStyle = SPECIAL_LABEL_COLOR
      context.fillText('Special', vw(LABEL_LEFT), y += vh(LABEL_FONT_SIZE + LABEL_GAP))
      context.restore()
    }

    renderBg()
    renderLabel()
    this.#modButtons.forEach(button => button.render(context))
    this.#closeButton.render(context)
    this.#resetButton.render(context)
    context.restore()
  }
}

/**
 * @return {(function(context: CanvasRenderingContext2D): void)}
 */
const createRender = ({
  baseFill,
  fontSize,
  text,
  bottom = 6,
}) => {
  return (context) => {
    const [r, g, b, a] = rgba.toValues(baseFill)
    const calc = (v, s) => Math.round((255 - v) * s + v)
    const gradient = context.createLinearGradient(0, 0, 0, vh(MOD_HEIGHT))
    gradient.addColorStop(0, rgba.format([calc(r, 0.1), calc(g, 0.1), calc(b, 0.1), a]))
    gradient.addColorStop(0.5, rgba.format([r, g, b, a]))
    gradient.addColorStop(0.8, rgba.format([r, g, b, a]))
    gradient.addColorStop(1, rgba.format([calc(r, -0.15), calc(g, -0.15), calc(b, -0.15), a]))
    context.fillStyle = gradient
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
      context.shadowBlur = 6
      context.fillText(text, vw(MOD_WIDTH / 2), vh(MOD_HEIGHT) - bottom)
    } else {
      context.textBaseline = 'bottom'
      context.textAlign = 'left'
      context.shadowColor = 'rgb(255, 255, 255)'
      context.shadowBlur = 6
      context.fillText(lines[0], 2, vh(MOD_HEIGHT) - bottom - fontSize)
      context.textBaseline = 'bottom'
      context.textAlign = 'right'
      context.fillText(lines[1], vw(MOD_WIDTH) - 2, vh(MOD_HEIGHT) - bottom)
    }
  }
}

export const EZIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(68, 102, 28)',
  fontSize: vh(MOD_HEIGHT / 4),
  text: 'Easy',
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const NFIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(29, 34, 74)',
  fontSize: vh(MOD_HEIGHT / 5),
  text: 'No-Fail',
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const HTIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(49, 43, 53)',
  fontSize: vh(MOD_HEIGHT / 4),
  text: 'Half',
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const HRIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(108, 2, 32)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Hard\nRock',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const SDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(95, 44, 1)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Sudden\nDeath',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const PFIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(113, 64, 22)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Perfect',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const DTIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(91, 51, 130)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Double',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const NCIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(57, 28, 154)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Nightcore',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const FDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(107, 68, 0)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Fade',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const HDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(152, 116, 30)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Hidden',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const FLIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(26, 26, 26)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Flashlight',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const MRIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(38,77,51)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Mirror',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const RDIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(2, 96, 42)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Random',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))

export const ATIcon = () => FrameSnapshot.createOffscreenCanvas(createRender({
  baseFill: 'rgb(0, 60, 125)',
  fontSize: vh(MOD_HEIGHT / 4.2),
  text: 'Auto',
  bottom: 2,
}), vw(MOD_WIDTH), vh(MOD_HEIGHT))
