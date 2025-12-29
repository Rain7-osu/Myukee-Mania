import { RenderObject } from './RenderObject'
import { Skin } from './Skin'

export class ProgressPercentEffect extends RenderObject {
  /** @type {number} */
  #percent

  /**
   * @param value {number}
   */
  set percent(value) { this.#percent = value }

  /**
   * @return {number}
   */
  get percent(){ return this.#percent }

  /**
   * @param percent {number}
   */
  constructor (percent) {
    super()
    this.#percent = percent
  }

  render (context) {
    const { centerX, centerY, radius, lineWidth } = Skin.config.stage.progress
    const percent = this.#percent > 0 ? this.#percent : 0
    // 绘制进度弧
    const startAngle = -Math.PI / 2; // 从垂直上方开始
    const endAngle = startAngle + Math.PI * 2 * percent;

    context.beginPath();
    context.arc(centerX, centerY, radius / 2.0, startAngle, endAngle, false);
    context.strokeStyle = 'rgba(255,255,255,0.46)';
    context.lineWidth = radius;
    context.stroke();

    // 绘制背景圆
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.strokeStyle = 'rgb(255,255,255)';
    context.lineWidth = lineWidth;
    context.stroke();

    // 绘制中心圆
    context.beginPath();
    context.arc(centerX, centerY, lineWidth, 0, Math.PI * 2);
    context.fillStyle = 'rgb(255,255,255)';
    context.fill();
  }
}
