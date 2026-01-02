import { rgba } from './utils'
import { dev } from './dev'

export type TransitionType = 'easeOut' | 'linear';

interface TransitionState {
  startValue: number;
  endValue: number;
  start: number;
  end: number;
  type: TransitionType;
}

type TransitionFunc = (startValue: number, endValue: number, start: number, end: number, current: number) => number;

type TransitionConfig = [TransitionState, (value: number) => void, (value: number) => void?];

interface StepToState {
  endValue: number;
  step: number;
  currentValue: number;
}

type StepToConfig = [StepToState, (value: number) => void, () => void?];

interface AnimationState {
  startValue: number;
  endValue: number;
  type: 'spring';
  update: (value: number) => void;
}

interface AnimationConfig {
  state: AnimationState;
  data: Record<string, any>;
}

interface TimeoutAction {
  time: number;
  start: number;
  resolve: () => void;
  reject: () => void;
  id: number;
}

interface IntervalAction {
  id: number;
  resolve: () => void;
  reject: () => void;
  interval: number;
  callback: () => void;
  endCondition: () => boolean;
  lastTime: number;
}

export class ActiveEffect {
  static _timeout_counter: number = 0

  static _interval_counter: number = 0

  private _updates: TransitionConfig[] = []

  private _stepTos: StepToConfig[] = []

  private _animations: AnimationConfig[] = []

  private _timeouts: TimeoutAction[] = []

  private _intervals: IntervalAction[] = []

  createInterval(callback: () => void, interval: number, endCondition: () => boolean = () => false): [Promise<unknown>, number] {
    const id = ++ActiveEffect._interval_counter
    const task = new Promise<void>((resolve: () => void, reject: () => void) => {
      this._intervals.push({
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

  updateInterval(now: number): void {
    if (!this._intervals.length) {
      return
    }
    this._intervals = this._intervals.filter(({ resolve, callback, endCondition }) => {
      if (endCondition()) {
        callback()
        resolve()
        return false
      }
      return true
    })
    this._intervals.forEach(config => {
      if (now - config.lastTime >= config.interval) {
        config.callback()
        config.lastTime = now
      }
    })
  }

  cancelInterval(timer?: number): void {
    if (timer) {
      this._intervals = this._intervals.filter(({ id, reject }) => {
        if (id === timer) {
          reject()
          return false
        }
        return true
      })
    } else {
      this._intervals.forEach(({ reject }) => reject())
      this._intervals = []
    }
  }

  createTimeout(time: number): [Promise<void>, number] {
    const id = ++ActiveEffect._timeout_counter
    const task = new Promise<void>((resolve: () => void, reject: () => void) => {
      this._timeouts.push({
        id,
        time,
        start: performance.now(),
        resolve,
        reject,
      })
    })
    return [task, id]
  }

  cancelTimeout(timer?: number): void {
    if (timer) {
      this._timeouts = this._timeouts.filter(({ id, reject }) => {
        if (id === timer) {
          reject()
          return false
        }
        return true
      })
    } else {
      this._timeouts.forEach(({ reject }) => reject())
      this._timeouts = []
    }
  }

  updateTimeout(now: number): void {
    if (!this._timeouts.length) {
      return
    }
    this._timeouts = this._timeouts.filter(({ start, time, resolve }) => {
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
  createTransitionSync<Value extends string | number = number>(
    startValue: Value,
    endValue: Value,
    duration: number,
    type: TransitionType,
    update: (value: Value) => void,
    endFn?: (value?: Value) => void,
  ): () => void {
    const start: number = performance.now()
    const end = start + duration

    let updateFn: (value: number) => void = update
    let updateEnd: ((value: number) => void) | undefined = endFn
    if (typeof startValue === 'string' && typeof endValue === 'string') {
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
        this._updates.push([
          {
            start,
            end,
            startValue: 0,
            endValue: 100,
            type,
          },
          updateFn,
          updateEnd,
        ] as TransitionConfig)
      } else {
        throw new Error('The startValue and endValue must be number or rgba color string!')
      }
    } else {
      this._updates.push([
        {
          start,
          end,
          startValue,
          endValue,
          type,
        },
        updateFn,
        updateEnd,
      ] as TransitionConfig)
    }

    return () => {
      this._updates = this._updates.filter(u => u[1] !== updateFn)
    }
  }

  /**
   * @public
   */
  createTransition<Value extends string | number = number>(
    startValue: Value,
    endValue: Value,
    duration: number,
    type: TransitionType,
    updateFn: (value: Value) => void,
  ): Promise<void> {
    return new Promise((resolve: () => void) => {
      this.createTransitionSync(startValue, endValue, duration, type, updateFn, resolve)
    })
  }

  /**
   * @public
   */
  updateTransition(time?: number): void {
    const now = time || performance.now()
    this._updates = this._updates.filter(update => {
      if (update[0].end > now) {
        return true
      }
      const [{ endValue }, updateFn, endFn] = update
      updateFn(endValue)
      endFn?.(endValue)
      return false
    })

    if (!this._updates.length) {
      return
    }

    this._updates.forEach(update => {
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
      updateFn(value)
    })
  }

  /**
   * 创建一个每一帧都更新 step 数量的更新器
   */
  createStepTo(startValue: number, endValue: number, step: number, updateFn: (value: number) => void, endFn?: (value?: number) => void): () => void {
    this._stepTos.push([
      {
        endValue,
        currentValue: startValue,
        step,
      },
      updateFn,
      endFn,
    ] as StepToConfig)

    return () => {
      this._stepTos = this._stepTos.filter(stepTo => stepTo[1] !== updateFn)
    }
  }

  updateStepTo(): void {
    this._stepTos = this._stepTos.filter(stepTo => {
      const [{ endValue, step, currentValue }, updateFn, endFn] = stepTo
      if (step > 0 && currentValue + step >= endValue || step < 0 && currentValue + step <= endValue) {
        updateFn(endValue)
        endFn?.()
        return false
      }
      return true
    })

    if (!this._stepTos.length) {
      return
    }

    this._stepTos.forEach(stepTo => {
      const [config, updateFn] = stepTo
      const { step } = config
      config.currentValue += step
      updateFn(config.currentValue)
    })
  }

  /**
   * 创建动画效果
   */
  createAnimation(startValue: number, endValue: number, type: 'spring', update: (value: number) => void): void {
    const ANIMATION_INIT_STATUS: { spring: Record<string, any> } = {
      spring: {
        stiffness: 0.1,  // 弹性系数
        damping: 0.85,    // 阻尼系数
        velocity: 0,      // 当前速度
        currentValue: null,
      },
    }

    this._animations.push({
      state: [startValue, endValue, type, update],
      data: { ...ANIMATION_INIT_STATUS[type] },
    } as AnimationConfig)
  }

  updateAnimation(): void {
    if (!this._animations.length) {
      return
    }

    this._animations.forEach(({ state, data }) => {
      const [startValue, endValue, type, update] = state
      let animation
      switch (type) {
        case 'spring':
          animation = ActiveEffect.spring
          break
        default:
          animation = ActiveEffect.spring
      }
      const value = animation(startValue, endValue, data)
      update(value)
    })
  }

  /**
   * 取消动画
   */
  cancelAnimations(animations?: Array<(value: number) => void>): void {
    if (!animations) {
      this._animations = []
      return
    }
    this._animations = this._animations.filter(animation => !animations.includes(animation.state[3]))
  }

  /**
   * 取消步进更新器
   */
  cancelStepTos(transformers?: Array<(value: number) => void>): void {
    if (!transformers) {
      this._stepTos = []
      return
    }
    this._stepTos = this._stepTos.filter(stepTo => !transformers.includes(stepTo[1]))
  }

  /**
   * 取消过渡效果
   */
  cancelTransitions(transformers?: Array<(value: number) => void>): void {
    if (!transformers) {
      this._updates = []
    } else {
      this._updates = this._updates.filter(update => !transformers.includes(update[1]))
    }
  }

  updateEffect(now: number): void {
    this.updateTimeout(now)
    this.updateTransition(now)
    this.updateStepTo()
    this.updateAnimation()
  }

  cancelEffect(): void {
    this.cancelAnimations()
    this.cancelTransitions()
    this.cancelStepTos()
    this.cancelTimeout()
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
