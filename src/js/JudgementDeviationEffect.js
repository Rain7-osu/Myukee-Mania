import { Shape } from './Shape.js'
import { JudgementAreaCalculators, JudgementType } from './Judgement.js'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './Config.js'

const BG_COLOR = 'rgba(0, 0, 0, 0.5)'
const YELLOW_COLOR = '#dead50'
const GREEN_COLOR = '#53e80a'
const BLUE_COLOR = '#2ebbe6'
const WHITE_COLOR = '#ffffff'

const WHITE_LINE_WIDTH = 4
const BAR_HEIGHT = 32
const COLOR_HEIGHT = 8

/**
 * 打击偏差动效
 */
export class JudgementDeviationEffect extends Shape {
  /**
   * @type {import('./JudgementDeviation').JudgementDeviation[]}
   */
  #activeDeviations

  /**
   * @type {{width: number, height: number, colorHeight: number, yellowWidth: number, greenWidth: number, blueWidth: number}}
   */
  #config

  /**
   * 初始化偏差条配置
   * @param od {number}
   * @param scale {number}
   */
  init (od, scale = 1.5) {
    this.#activeDeviations = []
    this.#config = {
      width: JudgementAreaCalculators[JudgementType.MEH](od) * 2 * scale,
      height: BAR_HEIGHT * scale,
      colorHeight: COLOR_HEIGHT * scale,
      yellowWidth: JudgementAreaCalculators[JudgementType.MEH](od) * 2 * scale,
      greenWidth: JudgementAreaCalculators[JudgementType.OK](od) * 2 * scale,
      blueWidth: JudgementAreaCalculators[JudgementType.GREAT](od) * 2 * scale,
    }
  }

  /**
   * 渲染偏差条
   * @param context {CanvasRenderingContext2D}
   */
  renderBar (context) {
    const y = CANVAS_HEIGHT - this.#config.height
    const x = (CANVAS_WIDTH - this.#config.width) / 2.0
    const colorY = y + (this.#config.height - this.#config.colorHeight) / 2.0
    const yellowX = x
    const greenX = (CANVAS_WIDTH - this.#config.greenWidth) / 2.0
    const blueX = (CANVAS_WIDTH - this.#config.blueWidth) / 2.0
    const whiteX = (CANVAS_WIDTH - WHITE_LINE_WIDTH) / 2.0
    const whiteY = y

    // 绘制背景
    context.fillStyle = BG_COLOR
    context.fillRect(x, y, this.#config.width, this.#config.height)

    // 绘制黄色区域
    context.fillStyle = YELLOW_COLOR
    context.fillRect(yellowX, colorY, this.#config.yellowWidth, this.#config.colorHeight)

    // 绘制绿色区域
    context.fillStyle = GREEN_COLOR
    context.fillRect(greenX, colorY, this.#config.greenWidth, this.#config.colorHeight)

    // 绘制蓝色区域
    context.fillStyle = BLUE_COLOR
    context.fillRect(blueX, colorY, this.#config.blueWidth, this.#config.colorHeight)

    // 绘制白线
    context.fillStyle = WHITE_COLOR
    context.fillRect(whiteX, whiteY, WHITE_LINE_WIDTH, this.#config.height)
  }

  /**
   * @param currentTiming {number}
   */
  update(currentTiming) {
    // 更新偏差条的状态
    for (const deviation of this.#activeDeviations) {
      deviation.update(currentTiming)
    }
    this.#activeDeviations = this.#activeDeviations.filter(j => j.active)
  }

  render (context) {
    this.renderBar(context)
    this.#activeDeviations.forEach(deviation => deviation.render(context))
  }

  /**
   * @param deviation {import('./JudgementDeviation').JudgementDeviation}
   */
  push(deviation) {
    if (!this.#activeDeviations) {
      this.#activeDeviations = []
    }
    this.#activeDeviations.push(deviation)
  }

  clear() {
    this.#activeDeviations = []
  }
}
