export function warn (...args) {
  if (window.__DEV__) {
    console.warn(...args)
  }
}

/**
 * @param limit {number}
 * @return {(function(...[*]): void)|*}
 */
export function createLimitLog (limit) {
  let times = 0
  return (...args) => {
    if (times < limit) {
      times++
      console.log(...args)
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
