/**
 * @typedef {'easeOut' | 'linear' | 'easeOutBounce'} TransitionType
 */

/**
 * @typedef  {{
 *   startValue: number;
 *   endValue: number;
 *   start: number;
 *   end: number;
 *   type: TransitionType;
 * }} TransitionState
 */

/**
 * @typedef {(startValue: number, endValue: number, start: number , end: number, current: number) => number} TransitionFunc
 */

/**
 * @typedef {[TransitionState, (value: number) => void, (value: number) => void? ]} TransitionConfig
 */

/** @typedef {[
 *   {
 *     endValue: number;
 *     step: number;
 *     currentValue: number;
 *   },
 *   (value: number) => void,
 *   () =>void?,
 * ]} StepToConfig
 */

/**
 * @typedef {{
 *   params: [
 *     startValue: number,
 *     endValue: number,
 *     type: 'spring',
 *     update: (value: number) => void,
 *  ],
 *  status: Object
 * }} AnimationConfig
 *
 */

/**
 * @typedef {{
 *   time: number;
 *   start: number;
 *   resolve: () => void;
 *   reject: () => void;
 *   id: number;
 * }} TimeoutAction
 */

import { rgba } from './utils'
import { dev } from './dev'

export class ActiveEffect {
  /**
   * @type {number}
   * @private
   */
  static _timeout_counter = 0

  /**
   * @type {number}
   * @private
   */
  static _interval_counter = 0

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
   * @type {AnimationConfig[]}
   */
  #animations = []

  /**
   * @type {TimeoutAction[]}
   */
  #timeouts = []

  /**
   * @type {Array<{
   *   resolve: (v: unknown) => void;
   *   reject: (v: unknown) => void;
   *   interval: number;
   *   callback: () => void;
   *   endCondition: () => boolean;
   *   lastTime: () => boolean;
   * }>}
   */
  #intervals = []

  /**
   * @param callback {() => void}
   * @param interval {number}
   * @param endCondition {() => boolean}
   */
  createInterval (callback, interval, endCondition = () => false) {
    const id = ++ActiveEffect._interval_counter
    const task = new Promise((resolve, reject) => {
      this.#intervals.push({
        reject,
        resolve,
        callback,
        interval,
        endCondition,
        lastTime: performance.now(),
      })
    })
    return [task, id]
  }

  updateInterval (now) {
    if (!this.#intervals.length) {
      return
    }
    this.#intervals = this.#intervals.filter(({ resolve, callback, endCondition }) => {
      if (endCondition()) {
        callback()
        resolve()
        return false
      }
      return true
    })
    this.#intervals.forEach((config) => {
      if (now - config.lastTime >= config.interval) {
        config.callback()
        config.lastTime = now
      }
    })
  }

  /**
   * @param timer {number}
   */
  cancelInterval (timer) {
    if (timer) {
      this.#intervals = this.#intervals.filter(({ id, reject }) => {
        if (id !== timer) {
          reject()
          return false
        }
        return true
      })
    } else {
      this.#intervals.forEach(({ reject }) => reject())
      this.#intervals = []
    }
  }

  /**
   * @param time {number}
   * @return {[Promise<void>, number]} [Task, id]
   */
  createTimeout (time) {
    const id = ++ActiveEffect._timeout_counter
    const task = new Promise((resolve, reject) => {
      this.#timeouts.push({
        id,
        time,
        start: performance.now(),
        resolve,
        reject,
      })
    })
    return [task, id]
  }

  /**
   * @param timer {number?}
   */
  cancelTimeout (timer) {
    if (timer) {
      this.#timeouts = this.#timeouts.filter(({ id, reject }) => {
        if (id !== timer) {
          reject()
          return false
        }
        return true
      })
    } else {
      this.#timeouts.forEach(({ reject }) => reject())
      this.#timeouts = []
    }
  }

  /**
   * @param now {number}
   */
  updateTimeout (now) {
    if (!this.#timeouts.length) {
      return
    }
    this.#timeouts = this.#timeouts.filter(({ start, time, resolve }) => {
      if (now - start >= time) {
        resolve()
        return false
      }
      return true
    })
  }

  /**
   * @public
   * @param startValue {number | string}
   * @param endValue {number | string}
   * @param duration {number}
   * @param type {TransitionType}
   * @param update {(value: number | string) => void}
   * @param endFn {(value?: number | string) => void?}
   */
  createTransitionSync (startValue, endValue, duration, type, update, endFn) {
    /** @type {number} */
    const start = performance.now()
    const end = start + duration

    console.log('update debug', update.__debug__)

    /** @type {(value: number) => void} */
    let updateFn = update
    /** @type {(value: number) => void} */
    let updateEnd = endFn
    if (typeof startValue === 'string' || typeof endValue === 'string') {
      if (rgba.isRgba(startValue) && rgba.isRgba(endValue)) {
        const [rs, gs, bs, as] = rgba.toValues(startValue)
        const [re, ge, be, ae] = rgba.toValues(endValue)
        updateFn = (value) => {
          const progress = value / 100
          update(rgba.format([
            re !== rs ? rs + (re - rs) * progress : rs,
            ge !== gs ? gs + (ge - gs) * progress : gs,
            be !== bs ? bs + (be - bs) * progress : bs,
            ae !== as ? as + (ae - as) * progress : as,
          ]))
        }
        this.#updates.push([
          {
            start,
            end,
            startValue: 0,
            endValue: 100,
            type,
          },
          updateFn,
          updateEnd,
        ])
      } else {
        throw new Error('The startValue and endValue must be number or rgba color string!')
      }
    } else {
      this.#updates.push([
        {
          start,
          end,
          startValue,
          endValue,
          type,
        },
        updateFn,
        updateEnd,
      ])
    }

    return () => {
      this.#updates = this.#updates.filter((u) => u[1] !== updateFn)
    }
  }

  /**
   * @public
   * @template {string | number} T
   * @param startValue {T}
   * @param endValue {T}
   * @param duration {number}
   * @param type {TransitionType}
   * @param updateFn {(value: T) => void}
   */
  createTransition (startValue, endValue, duration, type, updateFn) {
    return new Promise(resolve => {
      this.createTransitionSync(startValue, endValue, duration, type, updateFn, resolve)
    })
  }

  /**
   * @public
   * @param time {number?}
   */
  updateTransition (time) {
    const now = time || performance.now()
    this.#updates = this.#updates.filter(update => {
      if (update[0].end > now) {
        return true
      }
      const [{ endValue }, updateFn, endFn] = update
      updateFn(endValue)
      endFn?.(endValue)
      if (updateFn.__debug__) {
        dev.log('end transition', endValue)
      }
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
          transformer = ActiveEffect.easeOut
          break
        case 'linear':
          transformer = ActiveEffect.linear
          break
        default:
          transformer = ActiveEffect.easeOut
      }

      const value = transformer(startValue, endValue, start, end, now)
      if (updateFn.__debug__) {
        dev.log('update transition', value)
      }
      updateFn(value)
    })
  }

  /**
   * 创建一个每一帧都更新 step 数量的更新器
   * @param startValue {number}
   * @param endValue {number}
   * @param step {number}
   * @param updateFn {(value: number) => void}
   * @param endFn {(value?: number) => void?}
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
        endFn?.(endValue)
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
   * @param startValue {number}
   * @param endValue {number}
   * @param type {'spring'}
   * @param update {(value: number) => void}
   */
  createAnimation (startValue, endValue, type, update) {
    const ANIMATION_INIT_STATUS = {
      spring: {
        stiffness: 0.1,  // 弹性系数
        damping: 0.85,    // 阻尼系数
        velocity: 0,      // 当前速度
        currentValue: null,
      },
    }

    this.#animations.push({
      params: [startValue, endValue, type, update],
      status: { ...ANIMATION_INIT_STATUS[type] },
    })
  }

  updateAnimation () {
    if (!this.#animations.length) {
      return
    }

    this.#animations.forEach(({ params, status }) => {
      const [startValue, endValue, type, update] = params
      let animation
      switch (type) {
        case 'spring':
          animation = ActiveEffect.spring
          break
        default:
          animation = ActiveEffect.spring
      }
      const value = animation(startValue, endValue, status)
      update(value)
    })
  }

  /**
   * @param animations {Array<(value: number) => void>?}
   */
  cancelAnimations (animations) {
    if (!animations) {
      this.#animations = []
      return
    }
    this.#animations = this.#animations.filter(animation => !animations.includes(animation[2]))
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

  updateEffect (now) {
    this.updateTimeout(now)
    this.updateTransition(now)
    this.updateStepTo()
    this.updateAnimation()
  }

  cancelEffect () {
    this.cancelAnimations()
    this.cancelTransitions()
    this.cancelStepTos()
    this.cancelTimeout()
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
   * @param startValue {number}
   * @param endValue {number}
   * @param status {Object}
   * @return {number}
   */
  static spring (startValue, endValue, status) {
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
