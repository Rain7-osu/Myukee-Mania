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

export function formatMapTime(milliseconds) {
  // 确保是正数
  const ms = Math.abs(milliseconds);

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  // 格式化为两位数
  const format = (num) => num.toString().padStart(2, '0');

  if (hours <= 0) {
    if (minutes <= 0) {
      return format(seconds)
    }
    return `${format(minutes)}:${format(seconds)}`
  }

  return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
}
export const rgba = {
  regexp: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)/,
  /**
   * @param r {number}
   * @param g {number}
   * @param b {number}
   * @param a {number}
   * @return {string}
   */
  format ([r, g, b, a]) {
    return `rgba(${r}, ${g}, ${b}, ${a})`
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
