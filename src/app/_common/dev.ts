const searchParams = new URLSearchParams(location.search)

window.__FORCE_FINISH__ = false
window.__DEV__ = import.meta.env.DEV
window.__DEBUG__ = searchParams.get('__DEBUG__') === 'true'
window.__MOUSE_MOVE__SOURCE__ = ''
window.__SHOW_SCROLL_BOX__ = false

function debug(...args: any[]): void {
  if (window.__DEBUG__) {
    console.log(performance.now(), ...args)
  }
}

function warn(...args: any[]): void {
  if (window.__DEV__) {
    console.warn(performance.now(), ...args)
  }
}

function log(...args: any[]): void {
  if (window.__DEV__) {
    console.log(performance.now(), ...args)
  }
}

export const dev = {
  warn,
  log,
  debug,
}

export function createLimitLog(limit: number, delay: number = 0): (...args: any[]) => void {
  let times = 0
  return (...args) => {
    if (times - delay < limit) {
      times++
      if (times - delay > 0) {
        console.log(performance.now(), ...args)
      }
    }
  }
}

export function createCollectMaxValues(max: number): (value: number) => void {
  const values: number[] = []
  let hasLog = false
  return (value) => {
    if (values.length < max) {
      values.push(value)
    } else {
      if (!hasLog) {
        console.log('MaxValue', Math.max(...values))
        hasLog = true
      }
    }
  }
}
