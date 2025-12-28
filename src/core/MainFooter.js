import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'
import { FooterMenuButton } from './FooterMenuButton'
import { Skin } from './Skin'

const MAX_TRANSLATE_Y = 228

export class MainFooter extends RenderObject {
  /**
   * @type {HTMLCanvasElement}
   */
  #container

  /**
   * @type {FooterMenuButton}
   */
  #modeButton

  /**
   * @type {FooterMenuButton}
   */
  #modsButton

  /**
   * @type {FooterMenuButton}
   */
  #randomButton

  /**
   * @type {FooterMenuButton}
   */
  #beatmapOptionButton

  /**
   * @type {FooterMenuButton}
   */
  #beatmapOptions

  /**
   * @type {MainController}
   */
  #mainController

  #translateY = 0

  /**
   * @param container {HTMLCanvasElement}
   * @param mainController {MainController}
   */
  constructor (container, mainController) {
    super()
    this.#container = container
    this.#mainController = mainController
    this.#modeButton = new FooterMenuButton(container, {
      text: 'Mania',
      key: '',
      borderColor: 'rgb(150, 64, 255)',
      hoverStartColor: 'rgb(138, 59, 238)',
      hoverEndColor: 'rgb(53, 22, 90)',
    }, 0, 1.2)
    this.#modsButton = new FooterMenuButton(container, {
      text: 'Mods',
      key: 'F1',
      borderColor: 'rgb(171, 88, 166)',
      hoverStartColor: 'rgb(213, 71, 173)',
      hoverEndColor: 'rgb(79, 27, 65)',
    }, 1.2)
    this.#randomButton = new FooterMenuButton(container, {
      text: 'Random',
      key: 'F2',
      borderColor: 'rgb(150, 228, 1)',
      hoverStartColor: 'rgb(142, 215, 0)',
      hoverEndColor: 'rgb(53, 80, 1)',
    }, 2.2)
    this.#beatmapOptionButton = new FooterMenuButton(container, {
      text: 'Beatmap\nOptions',
      key: 'F3',
      borderColor: 'rgb(2, 163, 250)',
      hoverStartColor: 'rgb(1, 151, 238)',
      hoverEndColor: 'rgb(1, 59, 91)',
    }, 3.2)
  }

  registerEvents () {
    this.#modeButton.registerEvents({
      onClick: () => {
        console.log('modeButton')
      },
    })
    this.#modsButton.registerEvents({
      onClick: () => {
        this.#mainController.showModsPanel()
        this.#modsButton.hoverOut()
      },
    })
    this.#randomButton.registerEvents({
      onClick: () => {
        this.#mainController.random()
      },
    })
    this.#beatmapOptionButton.registerEvents({
      onClick: () => {
        console.log('beatmapOption')
      },
    })
  }

  removeEvents () {
    this.#modeButton.removeEvents()
    this.#modsButton.removeEvents()
    this.#randomButton.removeEvents()
    this.#beatmapOptionButton.removeEvents()
  }

  disableEvents () {
    this.#modeButton.disableEvents()
    this.#modsButton.disableEvents()
    this.#randomButton.disableEvents()
    this.#beatmapOptionButton.disableEvents()
  }

  enableEvents () {
    this.#modeButton.enableEvents()
    this.#modsButton.enableEvents()
    this.#randomButton.enableEvents()
    this.#beatmapOptionButton.enableEvents()
  }

  updateEffect (time) {
    super.updateEffect(time)
    this.#modeButton.updateEffect(time)
    this.#modsButton.updateEffect(time)
    this.#randomButton.updateEffect(time)
    this.#beatmapOptionButton.updateEffect(time)
  }

  /**
   * @param value {number}
   * @private
   */
  _setTranslateY (value) {
    this.#translateY = value
    this.#modeButton.translateY = value
    this.#modsButton.translateY = value
    this.#randomButton.translateY = value
    this.#beatmapOptionButton.translateY = value
  }

  async show () {
    this.cancelTransitions()
    await this.createTransition(this.#translateY, 0, 100, 'easeOut', value => this._setTranslateY(value))
  }

  async hide () {
    this.cancelTransitions()
    await this.createTransition(this.#translateY, MAX_TRANSLATE_Y, 100, 'easeOut', value => this._setTranslateY(value))
  }

  render (context) {
    const {
      height: HEIGHT,
      borderWidth: BORDER_WIDTH,
      borderColor: BORDER_COLOR,
      bgColor: BG_COLOR,
    } = Skin.config.main.footer

    context.save()
    const y = CANVAS.HEIGHT - HEIGHT + this.#translateY
    context.fillStyle = BG_COLOR
    context.fillRect(0, y, CANVAS.WIDTH, HEIGHT)
    context.fillStyle = BORDER_COLOR
    context.fillRect(0, y, CANVAS.WIDTH, -BORDER_WIDTH)
    context.restore()

    this.#modeButton.render(context)
    this.#modsButton.render(context)
    this.#randomButton.render(context)
    this.#beatmapOptionButton.render(context)
  }
}
