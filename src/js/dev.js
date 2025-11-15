export function warn (...args) {
  if (window.__DEV__) {
    console.warn(...args)
  }
}
