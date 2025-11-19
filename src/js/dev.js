export function warn (...args) {
  if (window.__DEV__) {
    console.warn(...args)
  }
}

export function createLimitLog (limit) {
  let times = 0
  return (...args) => {
    if (times < limit) {
      times++
      console.log(...args)
    }
  }
}
