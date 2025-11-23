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
 *
 * @typedef {[
 *   {
 *     endValue: number;
 *     step: number;
 *     currentValue: number;
 *   },
 *   (value: number) => void,
 *   () =>void?,
 * ]} StepToConfig
 */

export class Transition {
  /**
   * @private
   * @type {TransitionConfig[]}
   */
  #updates = []

  /**
   * @type {StepToConfig[]}
   */
  #stepTos = []

  /**
   * @public
   * @param startValue {number}
   * @param endValue {number}
   * @param duration {number}
   * @param type {TransitionType}
   * @param updateFn {(value: number) => void}
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
   * @param startValue {number}
   * @param endValue {number}
   * @param duration {number}
   * @param type {TransitionType}
   * @param updateFn {(value: number) => void}
   */
  createTransitionPromisify (startValue, endValue, duration, type, updateFn) {
    return new Promise(resolve => {
      this.createTransition(startValue, endValue, duration, type, updateFn, () => resolve())
    })
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
      const [{ start, end, startValue, endValue, type }, updateFn] = update
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
    })
  }

  /**
   * 创建一个每一帧都更新 step 数量的更新器
   * @param startValue {number}
   * @param endValue {number}
   * @param step {number}
   * @param updateFn {(value: number) => void}
   * @param endFn {() => void?}
   */
  createStepTo (startValue, endValue, step, updateFn, endFn) {
    this.#stepTos.push([
      {
        endValue,
        currentValue: startValue,
        step,
      },
      updateFn,
      endFn,
    ])

    return () => {
      this.#stepTos = this.#stepTos.filter((stepTo) => stepTo[1] !== updateFn)
    }
  }

  updateStepTo () {
    this.#stepTos = this.#stepTos.filter(stepTo => {
      const [{ endValue, step, currentValue }, updateFn, endFn] = stepTo
      if (currentValue + step >= endValue) {
        updateFn(endValue)
        endFn?.()
        return false
      }
      return true
    })

    if (!this.#stepTos.length) {
      return
    }

    this.#stepTos.forEach(stepTo => {
      const [config, updateFn] = stepTo
      const { step } = config
      config.currentValue += step
      updateFn(config.currentValue)
    })
  }

  /**
   * @param transformers {Array<(value: number) => void>?}
   */
  cancelStepTos (transformers) {
    if (!transformers) {
      this.#stepTos = []
      return
    }
    this.#stepTos = this.#stepTos.filter(stepTo => !transformers.includes(stepTo[1]))
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
    return +(k * (current - start) + startValue).toFixed(2)
  }
}
