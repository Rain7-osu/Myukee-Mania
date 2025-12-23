/**
 * @param arr {any[]}
 */
export function selectRandomArrayItem (arr) {
  if (!Array.isArray(arr)) {
    throw new Error('Excepted receive an array type param')
  }

  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * @param func {Function}
 * @param limit {number}
 * @return {(function(): void)|*}
 */
export function throttle (func, limit) {
  let inThrottle
  return function () {
    if (!inThrottle) {
      func.apply(this, arguments)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function debounce (func, limit) {
  clearTimeout(this.resizeTimeout)
  this.resizeTimeout = setTimeout(() => {
    func()
  }, limit)
}

/**
 * @param time {number}
 */
export function formatTime (time = new Date().getMilliseconds()) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatMapTime (milliseconds) {
  // 确保是正数
  const ms = Math.abs(milliseconds)

  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)

  // 格式化为两位数
  const format = num => num.toString().padStart(2, '0')

  if (hours <= 0) {
    if (minutes <= 0) {
      return format(seconds)
    }
    return `${format(minutes)}:${format(seconds)}`
  }

  return `${format(hours)}:${format(minutes)}:${format(seconds)}`
}

export const rgba = {
  regexp: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)/,
  /**
   * @param r {number}
   * @param g {number}
   * @param b {number}
   * @param a {number?}
   * @return {string}
   */
  format ([r, g, b, a]) {
    if (a === undefined) {
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    }
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
  },
  /**
   * @param color
   * @return {[number, number, number, number]}
   */
  toValues (color) {
    const match = color.match(rgba.regexp)
    if (match) {
      return [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        match[4] ? parseFloat(match[4]) : 1,
      ]
    }
    return [0, 0, 0, 0]
  },
  isRgba (color) {
    return color.match(rgba.regexp)
  },
}

/**
 * @param notes {Note[]}
 */
export function uniqNotes (notes) {
  const map = new Map()
  return notes.filter(item => {
    if (map.get(`${item.col}-${item.offset}`)) {
      return false
    }
    map.set(`${item.col}-${item.offset}`, true)
    return true
  })
}

/**
 * @template T
 * @param arr {T[]}
 * @return {T[]}
 */
export function shuffleArray (arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 安全设置 localStorage 项
 * @param key {string}
 * @param value {string}
 */
export const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.error('Failed to set item in localStorage', e)
  }
}

/**
 * 安全获取 localStorage 项
 * @param key {string}
 * @return {string | null}
 */
export const safeGetStorage = key => {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.error('Failed to get item from localStorage', e)
    return null
  }
}

/**
 * 安全解析 JSON 字符串
 * @param str {string}
 * @param defaultValue {any?}
 * @return {any | null}
 */
export const safeParseJson = (str, defaultValue = null) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    console.error('Failed to parse JSON string', e)
    return defaultValue
  }
}
