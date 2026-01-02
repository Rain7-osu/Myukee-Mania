import { RenderObject } from './RenderObject'
import { CANVAS, px, py } from './Config'
import { ModButton } from './ModButton'
import { KeyboardEventManager } from './KeyboardEventManager'
import { KeyCode } from './KeyCode'
import { ModsPanelButton } from './ModsPanelButton'
import {
  ATIcon,
  DTIcon,
  EZIcon,
  FDIcon,
  FLIcon,
  HDIcon,
  HRIcon,
  HTIcon,
  MRIcon,
  NCIcon,
  NFIcon,
  PFIcon,
  RDIcon,
  SDIcon,
} from './Icons'
import type { MainController } from './MainController'

const BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.95)'
const BUTTON_TEXT_COLOR = '#fff'
const BUTTON_RESET_COLOR = 'rgb(233, 49, 0)'
const BUTTON_CLOSE_COLOR = 'rgb(107, 107, 107)'
const BUTTON_RESET_HOVER_COLOR = 'rgb(249, 67, 1)'
const BUTTON_CLOSE_HOVER_COLOR = 'rgb(127, 127, 127)'
const BUTTON_BOTTOM = 224
const BUTTON_GAP = 44
const BUTTON_HEIGHT = 104
const BUTTON_WIDTH = 1356
const BUTTON_FONT_SIZE = 64
const DIFFICULTY_REDUCTION_LABEL_COLOR = 'rgb(73, 190, 67)'
const DIFFICULTY_INCREASE_LABEL_COLOR = 'rgb(240, 78, 13)'
const SPECIAL_LABEL_COLOR = 'rgb(255, 255, 255)'
const LABEL_LEFT = 76
const LABEL_TOP = 396
const LABEL_GAP = 132
const LABEL_FONT_SIZE = 48
const MOD_LEFT = 660
const MOD_TOP = 356
const MOD_HEIGHT = 120
const MOD_WIDTH = 120
const MOD_X_GAP = 78
const MOD_Y_GAP = 64
const BUTTON_ACTIVE_COLOR = 'rgba(255, 255, 255, 0.6)'

export const enum Mod {
  DT = 'DT',
  NC = 'NC',
  HR = 'HR',
  FD = 'FD',
  HD = 'HD',
  FL = 'FL',
  SD = 'SD',
  PF = 'PF',
  HT = 'HT',
  EZ = 'EZ',
  NF = 'NF',
  MR = 'MR',
  RD = 'RD',
  AT = 'AT',
}

const ConflictModsMap: Mod[][] = [
  [Mod.EZ, Mod.HR],
  [Mod.HT, Mod.DT, Mod.NC],
  [Mod.HD, Mod.FD, Mod.FL],
  [Mod.SD, Mod.PF, Mod.NF, Mod.AT],
]

interface ModConfigItem {
  mod: Mod[] | Mod
  backgroundImage: CanvasImageSource | CanvasImageSource[]
  description?: string
  keyBind: KeyCode
}

export class ModsPanel extends RenderObject {
  private _container: HTMLCanvasElement

  private _resetButton: ModsPanelButton

  private _closeButton: ModsPanelButton

  private _selectedMods: Mod[] = []

  private _modButtons: ModButton[] = []

  private _alpha = 0

  private _keyboardEventManager: KeyboardEventManager

  private _mainController: MainController

  constructor (container: HTMLCanvasElement, mainController: MainController) {
    super()
    this._keyboardEventManager = new KeyboardEventManager()
    this._container = container
    this._mainController = mainController
    const baseModStyle = {
      width: py(MOD_WIDTH),
      height: py(MOD_HEIGHT),
    }
    const modConfig: ModConfigItem[][] = [
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
    this._modButtons = modConfig.flatMap((item, index) => {
      return item.map((subItem, subIndex) => {
        return new ModButton(container, {
          left: px(MOD_LEFT + subIndex * (MOD_WIDTH + MOD_X_GAP)),
          top: py(MOD_TOP + index * (MOD_HEIGHT + MOD_Y_GAP)),
          mod: subItem.mod,
          backgroundImage: subItem.backgroundImage,
          description: subItem.description || '',
          keyBind: subItem.keyBind,
          ...baseModStyle,
        })
      })
    })
    this._resetButton = new ModsPanelButton(container, {
      text: '1. Reset All Mods',
      left: CANVAS.WIDTH / 2 - px(BUTTON_WIDTH) / 2,
      top: CANVAS.HEIGHT - py(BUTTON_BOTTOM + BUTTON_HEIGHT * 2 + BUTTON_GAP),
      height: py(BUTTON_HEIGHT),
      width: px(BUTTON_WIDTH),
      color: BUTTON_TEXT_COLOR,
      background: BUTTON_RESET_COLOR,
      hoverBackground: BUTTON_RESET_HOVER_COLOR,
      font: '微软雅黑',
      fontSize: py(BUTTON_FONT_SIZE),
      activeBackground: BUTTON_ACTIVE_COLOR,
    })
    this._closeButton = new ModsPanelButton(container, {
      text: '2. Close',
      left: CANVAS.WIDTH / 2 - px(BUTTON_WIDTH) / 2,
      top: CANVAS.HEIGHT - py(BUTTON_BOTTOM + BUTTON_HEIGHT),
      height: py(BUTTON_HEIGHT),
      width: px(BUTTON_WIDTH),
      color: BUTTON_TEXT_COLOR,
      background: BUTTON_CLOSE_COLOR,
      hoverBackground: BUTTON_CLOSE_HOVER_COLOR,
      font: '微软雅黑',
      fontSize: py(BUTTON_FONT_SIZE),
      activeBackground: BUTTON_ACTIVE_COLOR,
    })
  }

  _reset (): void {
    this._selectedMods = []
    this._modButtons.forEach(btn => {
      btn.setValue(null)
    })
  }

  _updateMods (btn: ModButton): void {
    const newMod = btn.value
    if (!newMod) {
      const btnMod = btn.mod
      if (Array.isArray(btnMod)) {
        this._selectedMods = this._selectedMods.filter(mod => !btnMod.includes(mod))
      } else {
        this._selectedMods = this._selectedMods.filter(mod => btnMod !== mod)
      }
    } else {
      const conflictList = ConflictModsMap.find(list => list.includes(newMod))
      if (conflictList) {
        this._selectedMods = this._selectedMods.filter(mod => !conflictList.includes(mod))
      }
      this._selectedMods.push(newMod)
    }
    this._modButtons.forEach(btn => {
      const btnMod = btn.mod
      if (Array.isArray(btnMod)) {
        const found = this._selectedMods.find(mod => btnMod.includes(mod))
        if (!found) {
          btn.setValue(null)
        }
      } else {
        const found = this._selectedMods.find(mod => btnMod === mod)
        if (!found) {
          btn.setValue(null)
        }
      }
    })
  }

  async show (): Promise<void> {
    this.display = true
    this._resetButton.initTranslateDirection = -1
    this._closeButton.initTranslateDirection = 1
    await Promise.all([
      this.createTransition(this._alpha, 100, 300, 'easeOut', v => this._alpha = v),
      this._resetButton.show(),
      this._closeButton.show(),
    ])
  }

  async hide (): Promise<void> {
    await this.createTransition(this._alpha, 0, 300, 'easeOut', v => this._alpha = v)
    this.display = false
  }

  registerEvents (): void {
    this._resetButton.registerEvents({
      onClick: () => {
        this._reset()
      },
    })
    this._closeButton.registerEvents({
      onClick: () => {
        this._mainController.closeModsPanel(this._selectedMods)
      },
    })

    const keyMaps = {}
    this._modButtons.forEach(btn => {
      btn.registerEvents({ onClick: () => this._updateMods(btn) })
      keyMaps[btn.keyBind] = () => {
        btn.click()
        this._updateMods(btn)
      }
    })
    const modButtonKeyMaps = keyMaps as Record<KeyCode, () => void>

    this._keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.DIGIT1]: () => {
          this._reset()
        },
        [KeyCode.DIGIT2]: () => {
          this._mainController.closeModsPanel(this._selectedMods)
        },
        [KeyCode.ESCAPE]: () => {
          this._mainController.closeModsPanel(this._selectedMods)
        },
        ...modButtonKeyMaps,
      },
    })
  }

  removeEvents (): void {
    this._closeButton.removeEvents()
    this._resetButton.removeEvents()
    this._modButtons.forEach(btn => btn.removeEvents())
    this._keyboardEventManager.removeEvents()
  }

  disableEvents (): void {
    this._closeButton.disableEvents()
    this._resetButton.disableEvents()
    this._modButtons.forEach(btn => btn.disableEvents())
    this._keyboardEventManager.disableEvents()
  }

  enableEvents (): void {
    this._closeButton.enableEvents()
    this._resetButton.enableEvents()
    this._modButtons.forEach(btn => btn.enableEvents())
    this._keyboardEventManager.enableEvents()
  }

  updateEffect (time: number): void {
    super.updateEffect(time)
    this._resetButton.updateEffect(time)
    this._closeButton.updateEffect(time)
  }

  render (context: CanvasRenderingContext2D): void {
    context.save()
    context.globalAlpha = this._alpha / 100

    const renderBg = () => {
      context.save()
      context.fillStyle = BACKGROUND_COLOR
      context.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
      context.restore()
    }

    const renderLabel = () => {
      let y = py(LABEL_TOP)
      const fontSize = py(LABEL_FONT_SIZE)
      context.save()
      context.textBaseline = 'top'
      context.fillStyle = DIFFICULTY_REDUCTION_LABEL_COLOR
      context.font = `${fontSize}px 微软雅黑`
      context.fillText('Difficulty Reduction', px(LABEL_LEFT), y)
      context.fillStyle = DIFFICULTY_INCREASE_LABEL_COLOR
      context.fillText('Difficulty Increase', px(LABEL_LEFT), y += py(LABEL_FONT_SIZE + LABEL_GAP))
      context.fillStyle = SPECIAL_LABEL_COLOR
      context.fillText('Special', px(LABEL_LEFT), y + py(LABEL_FONT_SIZE + LABEL_GAP))
      context.restore()
    }

    renderBg()
    renderLabel()
    this._modButtons.forEach(button => button.render(context))
    this._closeButton.render(context)
    this._resetButton.render(context)
    context.restore()
  }
}


