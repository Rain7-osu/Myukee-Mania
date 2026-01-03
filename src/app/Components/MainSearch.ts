import { InputEvent, RenderInput } from './RenderInput';
import { CANVAS, px, py } from '../Configs/Config';
import type { IMainController } from '../Interfaces/IMainController';

const SEARCH_WIDTH = 580
const TOTAL_WIDTH = 800
const LEFT = 2560 - TOTAL_WIDTH
const PADDING_LEFT = 16
const PADDING_TOP = 12
const PADDING_BOTTOM = PADDING_TOP
const PADDING_RIGHT = PADDING_LEFT
const LINE_HEIGHT = 32
const HEIGHT = LINE_HEIGHT * 2 + py(PADDING_TOP) + py(PADDING_BOTTOM)
const TOP = 164
const LABEL_COLOR = 'rgb(173, 254, 44)'
const FONT_SIZE = 24
const BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.3)'
const TIP_COLOR = 'rgb(255, 255, 255)'

const HIDE_DURATION = 600
const HIDE_TOP = -280

export class MainSearch extends RenderInput {
  private _mainController: IMainController;

  private _tip: string
  constructor(container: HTMLElement, mainController: IMainController) {
    super(container, {
      placeholder: 'Type to Search!',
      width: px(SEARCH_WIDTH - PADDING_RIGHT),
      height: py(LINE_HEIGHT * 2),
      offsetX: CANVAS.WIDTH - px(SEARCH_WIDTH),
      offsetY: py(TOP + PADDING_TOP),
      translateX: 0,
      translateY: 0,
      style: {
        fontSize: py(FONT_SIZE),
        fontWeight: 'bold',
        lineHeight: py(LINE_HEIGHT),
        color: 'rgb(255, 255, 255)',
        placeholderColor: 'rgb(255, 255, 255)',
      },
    });
    this._mainController = mainController;
    this._tip = 'Searching...'
  }

  get tip(): string {
    return this._tip
  }

  set tip(tip: string) {
    this._tip = tip
  }

  protected onChange(e: InputEvent) {
    this._mainController.search(e.value)
  }

  async hide() {
    this.cancelTransitions()
    await this.createTransition(this.translateY, py(HIDE_TOP), HIDE_DURATION, 'easeOut', value => this.translateY = value)
  }

  async show() {
    this.cancelTransitions()
    await this.createTransition(this.translateY, 0, HIDE_DURATION, 'easeOut', value => this.translateY = value)
  }

  render(context: CanvasRenderingContext2D) {
    const baseY = py(TOP) + this.translateY
    context.fillStyle = BACKGROUND_COLOR
    context.fillRect(px(LEFT), baseY, px(TOTAL_WIDTH), py(HEIGHT))

    context.fillStyle = LABEL_COLOR
    context.textAlign = 'left'
    context.textBaseline = 'top'
    context.font = `bold ${py(FONT_SIZE)}px 微软雅黑`
    context.fillText('Search: ', px(LEFT + PADDING_LEFT), baseY + py(PADDING_TOP))

    if (this._tip) {
      context.textBaseline = 'top'
      context.fillStyle = TIP_COLOR
      context.fillText(this._tip, px(LEFT + PADDING_LEFT), baseY + py(LINE_HEIGHT + PADDING_TOP))
    }

    super.render(context)
  }
}
