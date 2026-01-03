import { RenderObject } from '../Core/RenderObject';
import type { JudgementDeviationPointEffect } from './JudgementDeviationPointEffect';
import { CANVAS, px, py } from '../Configs/Config';
import { JudgementAreaCalculators } from '../Models/Judgement';
import { JudgementType } from '../Enums/JudgementType';

const BG_COLOR = 'rgba(0, 0, 0, 0.5)'
const YELLOW_COLOR = '#dead50'
const GREEN_COLOR = '#53e80a'
const BLUE_COLOR = '#2ebbe6'
const WHITE_COLOR = '#ffffff'

interface DeviationConfig {
  width: number
  height: number
  colorHeight: number
  yellowWidth: number
  greenWidth: number
  blueWidth: number
}

/**
 * 打击偏差动效
 */
export class JudgementDeviationEffect extends RenderObject {
  private _activeDeviations: JudgementDeviationPointEffect[]

  private _config: DeviationConfig

  reset(): void {
    this._activeDeviations = []
  }

  /**
   * 初始化偏差条配置
   */
  init(od: number, scale: number = 1.5): void {
    this._activeDeviations = []
    const BAR_HEIGHT = py(32)
    const COLOR_HEIGHT = py(8)
    this._config = {
      width: py(JudgementAreaCalculators[JudgementType.MEH](od) * 2 * scale),
      height: BAR_HEIGHT * scale,
      colorHeight: py(COLOR_HEIGHT * scale),
      yellowWidth: py(JudgementAreaCalculators[JudgementType.MEH](od) * 2 * scale),
      greenWidth: py(JudgementAreaCalculators[JudgementType.OK](od) * 2 * scale),
      blueWidth: py(JudgementAreaCalculators[JudgementType.GREAT](od) * 2 * scale),
    }
  }

  /**
   * 渲染偏差条
   */
  renderBar(context: CanvasRenderingContext2D): void {
    const WHITE_LINE_WIDTH = py(4)
    const y = CANVAS.HEIGHT - this._config.height
    const x = (CANVAS.WIDTH - this._config.width) / 2.0
    const colorY = y + (this._config.height - this._config.colorHeight) / 2.0
    const yellowX = x
    const greenX = (CANVAS.WIDTH - this._config.greenWidth) / 2.0
    const blueX = (CANVAS.WIDTH - this._config.blueWidth) / 2.0
    const whiteX = (CANVAS.WIDTH - px(WHITE_LINE_WIDTH)) / 2.0
    const whiteY = y

    // 绘制背景
    context.fillStyle = BG_COLOR
    context.fillRect(x, y, this._config.width, this._config.height)

    // 绘制黄色区域
    context.fillStyle = YELLOW_COLOR
    context.fillRect(yellowX, colorY, this._config.yellowWidth, this._config.colorHeight)

    // 绘制绿色区域
    context.fillStyle = GREEN_COLOR
    context.fillRect(greenX, colorY, this._config.greenWidth, this._config.colorHeight)

    // 绘制蓝色区域
    context.fillStyle = BLUE_COLOR
    context.fillRect(blueX, colorY, this._config.blueWidth, this._config.colorHeight)

    // 绘制白线
    context.fillStyle = WHITE_COLOR
    context.fillRect(whiteX, whiteY, px(WHITE_LINE_WIDTH), this._config.height)
  }

  update(currentTiming: number): void {
    // 更新偏差条的状态
    for (const deviation of this._activeDeviations) {
      deviation.update(currentTiming)
    }
    this._activeDeviations = this._activeDeviations.filter(j => j.active)
  }

  render(context: CanvasRenderingContext2D): void {
    this.renderBar(context)
    context.globalCompositeOperation = 'lighter'
    this._activeDeviations.forEach(deviation => deviation.render(context))
    context.globalCompositeOperation = 'source-over'
  }

  push(deviation: JudgementDeviationPointEffect): void {
    if (!this._activeDeviations) {
      this._activeDeviations = []
    }
    this._activeDeviations.push(deviation)
  }

  clear(): void {
    this._activeDeviations = []
  }
}
