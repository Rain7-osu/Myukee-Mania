import { RenderObject } from '../Core/RenderObject';
import { FooterMenuButton } from '../Components/FooterMenuButton';
import type { MainController } from '../Controllers/MainController';
import { Skin } from '../Configs/Skin';
import { CANVAS } from '../Configs/Config';

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
      index: 0,
      widthScale: 1.2,
      id: 'Mode',
    }, this)
    this._modsButton = new FooterMenuButton(container, {
      text: 'Mods',
      key: 'F1',
      borderColor: 'rgb(171, 88, 166)',
      hoverStartColor: 'rgb(213, 71, 173)',
      hoverEndColor: 'rgb(79, 27, 65)',
      index: 1.2,
      id: 'Mods',
    }, this)
    this._randomButton = new FooterMenuButton(container, {
      text: 'Random',
      key: 'F2',
      borderColor: 'rgb(150, 228, 1)',
      hoverStartColor: 'rgb(142, 215, 0)',
      hoverEndColor: 'rgb(53, 80, 1)',
      index: 2.2,
      id: 'Random',
    }, this)
    this._beatmapOptionButton = new FooterMenuButton(container, {
      text: 'Beatmap\nOptions',
      key: 'F3',
      borderColor: 'rgb(2, 163, 250)',
      hoverStartColor: 'rgb(1, 151, 238)',
      hoverEndColor: 'rgb(1, 59, 91)',
      index: 3.2,
      id: 'BeatmapOptions',
    }, this)
  }

  clickFooter(id: string) {
    if (id === 'Mods') {
      this._mainController.showModsPanel()
      this._modsButton.hoverOut()
    } else if (id === 'Random') {
      this._mainController.random()
    } else if (id === 'BeatmapOptions') {
      console.log('beatmapOption')
    } else if (id === 'Mode') {
      console.log('modeButton')
    }
  }

  registerEvents() {
    this._modeButton.registerEvents()
    this._modsButton.registerEvents()
    this._randomButton.registerEvents()
    this._beatmapOptionButton.registerEvents()
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
