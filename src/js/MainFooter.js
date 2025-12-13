import { Shape } from './Shape'
import { CANVAS } from './Config'
import { FooterMenuButton } from './FooterMenuButton'

const HEIGHT = 162
const BORDER_WIDTH = 6
const BORDER_COLOR = 'rgb(0, 102, 255)'
const BG_COLOR = 'rgb(0, 0, 0)'

export class MainFooter extends Shape {
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
   * @param container {HTMLCanvasElement}
   */
  constructor (container) {
    super()
    this.#container = container
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
        console.log('modsButton')
      }
    })
    this.#randomButton.registerEvents({
      onClick: () => {
        console.log('random')
      }
    })
    this.#beatmapOptionButton.registerEvents({
      onClick: () => {
        console.log('beatmapOption')
      }
    })
  }

  removeEvents() {
    this.#modeButton.removeEvents()
    this.#modsButton.removeEvents()
    this.#randomButton.removeEvents()
    this.#beatmapOptionButton.removeEvents()
  }

  updateEffect (time) {
    super.updateEffect(time)
    this.#modeButton.updateEffect(time)
    this.#modsButton.updateEffect(time)
    this.#randomButton.updateEffect(time)
    this.#beatmapOptionButton.updateEffect(time)
  }

  render (context) {
    context.save()
    const y = CANVAS.HEIGHT - HEIGHT
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
