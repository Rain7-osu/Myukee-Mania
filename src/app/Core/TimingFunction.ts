export class TimingFunction {
  constructor() {
    throw new Error('Cannot create an instance of a static class.')
  }

  /**
   * easeOut 缓动函数
   */
  static easeOut(startValue: number, endValue: number, start: number, end: number, current: number): number {
    // 确保当前值在区间内
    if (current <= start) return startValue
    if (current >= end) return endValue

    // 计算当前进度 (0 到 1)
    const progress = (current - start) / (end - start)

    // 应用 easeOut 缓动函数 (二次缓动)
    const easedProgress = 1 - Math.pow(1 - progress, 2)

    // 计算并返回当前值
    return startValue + easedProgress * (endValue - startValue)
  }

  /**
   * linear 线性缓动函数
   */
  static linear(startValue: number, endValue: number, start: number, end: number, current: number): number {
    // 确保当前值在区间内
    if (current <= start) return startValue
    if (current >= end) return endValue

    // 斜率
    const k = (endValue - startValue) / (end - start)
    return k * (current - start) + startValue
  }

  /**
   * spring 弹簧物理效果函数
   */
  static spring(startValue: number, endValue: number, status: {
    stiffness: number;
    damping: number;
    velocity: number;
    currentValue: number | null
  }): number {
    if (status.currentValue === null) {
      status.currentValue = startValue
    }

    // 计算目标差值
    const displacement = endValue - status.currentValue
    // 计算弹性力
    const springForce = displacement * status.stiffness

    // 更新速度
    status.velocity += springForce
    status.velocity *= status.damping

    // 更新值
    status.currentValue += status.velocity
    return status.currentValue
  }
}
