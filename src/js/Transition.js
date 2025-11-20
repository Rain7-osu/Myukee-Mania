/**
 * @typedef {'easeOut' | 'linear'} TransitionType
 * @typedef {(startValue: number, endValue: number, start: number , end: number, current: number) => number} TransitionFunc
 * @typedef {[
 * {
 *   startValue: number;
 *   endValue: number;
 *   start: number;
 *   end: number;
 *   type: TransitionType;
 * },
 * (value: number) => void,
 * () => void?
 * ]} TransitionConfig
 */

export class Transition {
  /**
   * @private
   * @type {TransitionConfig[]}
   */
  #updates = []

  /**
   * @public
   * @param startValue {number}
   * @param endValue {number}
   * @param duration {number}
   * @param type {TransitionType}
   * @param updateFn {(delta: number) => void}
   * @param endFn {() => void?}
   */
  createTransition (startValue, endValue, duration, type, updateFn, endFn) {
    /** @type {number} */
    const start = performance.now()
    const end = start + duration

    this.#updates.push([
      {
        start,
        end,
        startValue,
        endValue,
        type,
      },
      updateFn,
      endFn,
    ])

    return () => {
      this.#updates = this.#updates.filter((u) => u[1] !== updateFn)
    }
  }

  /**
   * @public
   * @param time {number?}
   */
  updateTransition (time) {
    const current = time || performance.now()
    this.#updates = this.#updates.filter(update => {
      if (update[0].end > current) {
        return true
      }
      const [{ endValue }, updateFn, endFn] = update
      updateFn(endValue)
      endFn?.()
      return false
    })

    if (!this.#updates.length) {
      return
    }

    this.#updates.forEach((update) => {
      const [{ start, end, startValue, endValue, type }, updateFn, endFn] = update
      /** @type {TransitionFunc} */
      let transformer
      switch (type) {
        case 'easeOut':
          transformer = Transition.easeOut
          break
        case 'linear':
          transformer = Transition.linear
          break
        default:
          transformer = Transition.easeOut
      }

      const value = transformer(startValue, endValue, start, end, current)
      updateFn(value)
      if (value >= endValue) {
        endFn?.()
      }
    })
  }

  /**
   * @param transformers {Array<(value: number) => void>?}
   */
  cancelTransitions (transformers) {
    if (!transformers) {
      this.#updates = []
    }
    this.#updates = this.#updates.filter((update) => !transformers.includes(update[1]))
  }

  /**
   * @param startValue {number}
   * @param endValue {number}
   * @param start {number}
   * @param end {number}
   * @param current {number}
   * @return {number}
   */
  static easeOut (startValue, endValue, start, end, current) {
    // 确保当前值在区间内
    if (current <= start) return startValue
    if (current >= end) return endValue

    // 计算当前进度 (0 到 1)
    const progress = (current - start) / (end - start)

    // 应用 easeOut 缓动函数 (二次缓动)
    const easedProgress = 1 - Math.pow(1 - progress, 2)

    // 计算并返回当前值
    return +(startValue + easedProgress * (endValue - startValue)).toFixed(2)
  }

  /**
   * @param startValue {number}
   * @param endValue {number}
   * @param start {number}
   * @param end {number}
   * @param current {number}
   * @return {number}
   */
  static linear (startValue, endValue, start, end, current) {
    // 确保当前值在区间内
    if (current <= start) return startValue
    if (current >= end) return endValue

    // 斜率
    const k = (endValue - startValue) / (end - start)
    return +(k * (current - start)).toFixed(2)
  }
}
