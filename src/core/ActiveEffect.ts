import { rgba } from './utils'
import { dev } from './dev'

type TransitionType = 'easeOut' | 'linear';

type TransitionState = {
  startValue: number;
  endValue: number;
  start: number;
  end: number;
  type: TransitionType;
};

type TransitionFunc = (startValue: number, endValue: number, start: number, end: number, current: number) => number;

type TransitionConfig = [TransitionState, (value: number) => void, ((value: number) => void)?];

type StepToConfig = [
  {
    endValue: number;
    step: number;
    currentValue: number;
  },
  (value: number) => void,
  (() => void)?,
];

type AnimationConfig = {
  params: [
    startValue: number,
    endValue: number,
    type: 'spring',
    update: (value: number) => void,
  ];
  status: Record<string, any>;
};

type TimeoutAction = {
  time: number;
  start: number;
  resolve: () => void;
  reject: () => void;
  id: number;
};

export class ActiveEffect {
  static _timeout_counter: number = 0

  static _interval_counter: number = 0

  #updates: TransitionConfig[] = []

  #stepTos: StepToConfig[] = []

  #animations: AnimationConfig[] = []

  #timeouts: TimeoutAction[] = []

  #intervals: Array<{
    id: number;
    resolve: (v: unknown) => void;
    reject: (v: unknown) => void;
    interval: number;
    callback: () => void;
    endCondition: () => boolean;
    lastTime: number;
  }> = []

  createInterval (callback: () => void, interval: number, endCondition: () => boolean = () => false): [Promise<unknown>, number] {
    const id = ++ActiveEffect._interval_counter
    const task = new Promise((resolve, reject) => {
      this.#intervals.push({
        id,
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

  updateInterval (now: number): void {
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
    this.#intervals.forEach(config => {
      if (now - config.lastTime >= config.interval) {
        config.callback()
        config.lastTime = now
      }
    })
  }

  cancelInterval (timer?: number): void {
    if (timer) {
      this.#intervals = this.#intervals.filter(({ id, reject }) => {
        if (id === timer) {
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

  createTimeout (time: number): [Promise<void>, number] {
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

  cancelTimeout (timer?: number): void {
    if (timer) {
      this.#timeouts = this.#timeouts.filter(({ id, reject }) => {
        if (id === timer) {
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

  updateTimeout (now: number): void {
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
   */
  createTransitionSync (startValue: number | string, endValue: number | string, duration: number, type: TransitionType, update: (value: number | string) => void, endFn?: (value?: number | string) => void): () => void {
    const start: number = performance.now()
    const end = start + duration

    let updateFn: (value: number) => void = update
    let updateEnd: ((value: number) => void) | undefined = endFn
    if (typeof startValue === 'string' || typeof endValue === 'string') {
      if (rgba.isRgba(startValue) && rgba.isRgba(endValue)) {
        const [rs, gs, bs, as] = rgba.toValues(startValue)
        const [re, ge, be, ae] = rgba.toValues(endValue)
        updateFn = value => {
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
      this.#updates = this.#updates.filter(u => u[1] !== updateFn)
    }
  }

  /**
   * @public
   */
  createTransition<T extends string | number> (startValue: T, endValue: T, duration: number, type: TransitionType, updateFn: (value: T) => void): Promise<void> {
    return new Promise(resolve => {
      this.createTransitionSync(startValue, endValue, duration, type, updateFn, resolve)
    })
  }

  /**
   * @public
   */
  updateTransition (time?: number): void {
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

    this.#updates.forEach(update => {
      const [{ start, end, startValue, endValue, type }, updateFn] = update
      let transformer: TransitionFunc
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
   */
  createStepTo (startValue: number, endValue: number, step: number, updateFn: (value: number) => void, endFn?: (value?: number) => void): () => void {
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
      this.#stepTos = this.#stepTos.filter(stepTo => stepTo[1] !== updateFn)
    }
  }

  updateStepTo (): void {
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
   * 创建动画效果
   */
  createAnimation (startValue: number, endValue: number, type: 'spring', update: (value: number) => void): void {
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

  updateAnimation (): void {
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
   * 取消动画
   */
  cancelAnimations (animations?: Array<(value: number) => void>): void {
    if (!animations) {
      this.#animations = []
      return
    }
    this.#animations = this.#animations.filter(animation => !animations.includes(animation.params[3]))
  }

  /**
   * 取消步进更新器
   */
  cancelStepTos (transformers?: Array<(value: number) => void>): void {
    if (!transformers) {
      this.#stepTos = []
      return
    }
    this.#stepTos = this.#stepTos.filter(stepTo => !transformers.includes(stepTo[1]))
  }

  /**
   * 取消过渡效果
   */
  cancelTransitions (transformers?: Array<(value: number) => void>): void {
    if (!transformers) {
      this.#updates = []
    } else {
      this.#updates = this.#updates.filter(update => !transformers.includes(update[1]))
    }
  }

  updateEffect (now: number): void {
    this.updateTimeout(now)
    this.updateTransition(now)
    this.updateStepTo()
    this.updateAnimation()
  }

  cancelEffect (): void {
    this.cancelAnimations()
    this.cancelTransitions()
    this.cancelStepTos()
    this.cancelTimeout()
  }

  /**
   * easeOut 缓动函数
   */
  static easeOut (startValue: number, endValue: number, start: number, end: number, current: number): number {
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
  static linear (startValue: number, endValue: number, start: number, end: number, current: number): number {
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
  static spring (startValue: number, endValue: number, status: { stiffness: number; damping: number; velocity: number; currentValue: number | null }): number {
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
