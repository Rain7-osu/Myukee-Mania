/**
 * @typedef {'easeOut' | 'linear' | 'elastic' | 'elastic-strong' | 'elastic-medium' | 'elastic-weak' | 'elastic-bouncy'} TransitionType
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
        case 'elastic':
          transformer = Transition.simpleElastic
          break
        case 'elastic-bouncy':
          transformer = (...args) => Transition.presetElastic('bouncy', ...args)
          break
        case 'elastic-medium':
          transformer = (...args) => Transition.presetElastic('medium', ...args)
          break
        case 'elastic-strong':
          transformer = (...args) => Transition.presetElastic('strong', ...args)
          break
        case 'elastic-weak':
          transformer = (...args) => Transition.presetElastic('weak', ...args)
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
      if (step > 0 && currentValue + step >= endValue || step < 0 && currentValue + step <= endValue) {
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

  /**
   * 弹性动画计算函数
   * 使用弹簧物理模型实现弹性效果
   *
   * @param {number} startValue - 起始y轴值
   * @param {number} endValue - 目标y轴值
   * @param {number} start - 起始x轴值（时间起点）
   * @param {number} end - 结束x轴值（时间终点）
   * @param {number} current - 当前x轴值（当前时间）
   * @param {Object} options - 可选参数，调整弹性行为
   * @param {number} options.stiffness - 弹性系数，默认0.1
   * @param {number} options.damping - 阻尼系数，默认0.8
   * @param {number} options.velocity - 初始速度，默认0
   * @param {number} options.mass - 质量，默认1
   * @returns {number} 当前x值对应的y值
   */
  static elastic(startValue, endValue, start, end, current, options = {}) {
    // 参数解构和默认值
    const {
      stiffness = 0.1,
      damping = 0.8,
      velocity = 0,
      mass = 1
    } = options;

    // 边界检查
    if (current <= start) return startValue;
    if (current >= end) return endValue;

    // 计算进度（0到1之间）
    const progress = (current - start) / (end - start);

    // 使用弹簧物理模型计算当前值
    const displacement = endValue - startValue;
    const springForce = stiffness * displacement;
    const dampingForce = damping * velocity;

    // 计算加速度 (F = ma)
    const acceleration = (springForce - dampingForce) / mass;

    // 更新速度（简化模型）
    const newVelocity = velocity + acceleration * progress;

    // 计算当前位置
    const currentValue = startValue + displacement * progress + newVelocity * progress;

    return currentValue;
  }

  /**
   * 弹性动画计算函数
   * 使用弹簧物理模型实现弹性效果
   *
   * @param {number} startValue - 起始y轴值
   * @param {number} endValue - 目标y轴值
   * @param {number} start - 起始x轴值（时间起点）
   * @param {number} end - 结束x轴值（时间终点）
   * @param {number} current - 当前x轴值（当前时间）
   * @returns {number} 当前x值对应的y值
   */
  static simpleElastic(startValue, endValue, start, end, current) {
    return  Transition.elastic(startValue, endValue, start, end, current, {
      stiffness: 0.15,
      damping: 0.7,
      velocity: 0,
      mass: 1
    });
  }

  /**
   * 预配置的弹性动画类型
   */
  static elasticPresets = {
    // 强弹性效果
    strong: {
      stiffness: 0.2,
      damping: 0.6,
      velocity: 10,
      mass: 1
    },
    // 中等弹性效果
    medium: {
      stiffness: 0.15,
      damping: 0.7,
      velocity: 5,
      mass: 1
    },
    // 弱弹性效果
    weak: {
      stiffness: 0.1,
      damping: 0.8,
      velocity: 2,
      mass: 1
    },
    // 弹跳效果
    bouncy: {
      stiffness: 0.25,
      damping: 0.5,
      velocity: 15,
      mass: 1
    }
  };


  static presetElastic(preset, startValue, endValue, start, end, current) {
    return Transition.elastic(startValue, endValue, start, end, current, Transition.elasticPresets[preset]);
  }
}
