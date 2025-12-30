import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { FooterMenuButton } from './FooterMenuButton'
import { Skin } from './Skin'
import type { MainController } from './MainController'

const MAX_TRANSLATE_Y = 228

export class MainFooter extends RenderObject {
  private _container: HTMLCanvasElement

  private _modeButton: FooterMenuButton

  private _modsButton: FooterMenuButton

  private _randomButton: FooterMenuButton

  private _beatmapOptionButton: FooterMenuButton

  private _beatmapOptions: FooterMenuButton

  private _mainController: MainController

  private _translateY = 0

  constructor(container: HTMLCanvasElement, mainController: MainController) {
    super()
    this._container = container
    this._mainController = mainController
    this._modeButton = new FooterMenuButton(container, {
      text: 'Mania',
      key: '',
      borderColor: 'rgb(150, 64, 255)',
      hoverStartColor: 'rgb(138, 59, 238)',
      hoverEndColor: 'rgb(53, 22, 90)',
    }, 0, 1.2)
    this._modsButton = new FooterMenuButton(container, {
      text: 'Mods',
      key: 'F1',
      borderColor: 'rgb(171, 88, 166)',
      hoverStartColor: 'rgb(213, 71, 173)',
      hoverEndColor: 'rgb(79, 27, 65)',
    }, 1.2)
    this._randomButton = new FooterMenuButton(container, {
      text: 'Random',
      key: 'F2',
      borderColor: 'rgb(150, 228, 1)',
      hoverStartColor: 'rgb(142, 215, 0)',
      hoverEndColor: 'rgb(53, 80, 1)',
    }, 2.2)
    this._beatmapOptionButton = new FooterMenuButton(container, {
      text: 'Beatmap\nOptions',
      key: 'F3',
      borderColor: 'rgb(2, 163, 250)',
      hoverStartColor: 'rgb(1, 151, 238)',
      hoverEndColor: 'rgb(1, 59, 91)',
    }, 3.2)
  }

  registerEvents() {
    this._modeButton.registerEvents({
      onClick: () => {
        console.log('modeButton')
      },
    })
    this._modsButton.registerEvents({
      onClick: () => {
        this._mainController.showModsPanel()
        this._modsButton.hoverOut()
      },
    })
    this._randomButton.registerEvents({
      onClick: () => {
        this._mainController.random()
      },
    })
    this._beatmapOptionButton.registerEvents({
      onClick: () => {
        console.log('beatmapOption')
      },
    })
  }

  removeEvents() {
    this._modeButton.removeEvents()
    this._modsButton.removeEvents()
    this._randomButton.removeEvents()
    this._beatmapOptionButton.removeEvents()
  }

  disableEvents() {
    this._modeButton.disableEvents()
    this._modsButton.disableEvents()
    this._randomButton.disableEvents()
    this._beatmapOptionButton.disableEvents()
  }

  enableEvents() {
    this._modeButton.enableEvents()
    this._modsButton.enableEvents()
    this._randomButton.enableEvents()
    this._beatmapOptionButton.enableEvents()
  }

  updateEffect(time) {
    super.updateEffect(time)
    this._modeButton.updateEffect(time)
    this._modsButton.updateEffect(time)
    this._randomButton.updateEffect(time)
    this._beatmapOptionButton.updateEffect(time)
  }

  _setTranslateY(value: number) {
    this._translateY = value
    this._modeButton.translateY = value
    this._modsButton.translateY = value
    this._randomButton.translateY = value
    this._beatmapOptionButton.translateY = value
  }

  async show() {
    this.cancelTransitions()
    await this.createTransition(this._translateY, 0, 100, 'easeOut', value => this._setTranslateY(value))
  }

  async hide() {
    this.cancelTransitions()
    await this.createTransition(this._translateY, MAX_TRANSLATE_Y, 100, 'easeOut', value => this._setTranslateY(value))
  }

  render(context) {
    const {
      height: HEIGHT,
      borderWidth: BORDER_WIDTH,
      borderColor: BORDER_COLOR,
      bgColor: BG_COLOR,
    } = Skin.config.main.footer

    context.save()
    const y = CANVAS.HEIGHT - HEIGHT + this._translateY
    context.fillStyle = BG_COLOR
    context.fillRect(0, y, CANVAS.WIDTH, HEIGHT)
    context.fillStyle = BORDER_COLOR
    context.fillRect(0, y, CANVAS.WIDTH, -BORDER_WIDTH)
    context.restore()

    this._modeButton.render(context)
    this._modsButton.render(context)
    this._randomButton.render(context)
    this._beatmapOptionButton.render(context)
  }
}
