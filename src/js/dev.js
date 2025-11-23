export function warn (...args) {
  if (window.__DEV__) {
    console.warn(performance.now(), ...args)
  }
}

/**
 * @param limit {number}
 * @param delay {number}
 * @return {(function(...[*]): void)|*}
 */
export function createLimitLog (limit, delay = 0) {
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

/**
 * @param max {number}
 * @return {(function(*): void)|*}
 */
export function createCollectMaxValues (max) {
  const values = []
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
