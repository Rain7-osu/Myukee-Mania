import { Shape } from './Shape'
import { CANVAS_WIDTH } from './Config'

const RADIUS = 25
const LINE_WIDTH = 3

export class ProgressPercentEffect extends Shape {
  /** @type {number} */
  #percent

  /**
   * @param percent {number}
   */
  constructor (percent) {
    super()
    this.#percent = percent
  }

  render (context) {
    const percent = this.#percent > 0 ? this.#percent : 0
    const centerX = CANVAS_WIDTH - 200
    const centerY = 120

    // 绘制进度弧
    const startAngle = -Math.PI / 2; // 从垂直上方开始
    const endAngle = startAngle + (Math.PI * 2 * percent);

    context.beginPath();
    context.arc(centerX, centerY, RADIUS / 2.0, startAngle, endAngle, false);
    context.strokeStyle = '#ffffff75';
    context.lineWidth = RADIUS;
    context.stroke();

    // 绘制背景圆
    context.beginPath();
    context.arc(centerX, centerY, RADIUS, 0, Math.PI * 2);
    context.strokeStyle = '#fff';
    context.lineWidth = LINE_WIDTH;
    context.stroke();

    // 绘制中心圆
    context.beginPath();
    context.arc(centerX, centerY, LINE_WIDTH, 0, Math.PI * 2);
    context.fillStyle = '#fff';
    context.fill();
  }
}
