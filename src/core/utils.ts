type AnyFunc = Function;

/**
 * 从数组中随机选择一个元素
 */
export function selectRandomArrayItem<T>(arr: T[]): T {
  if (!Array.isArray(arr)) {
    throw new Error('Excepted receive an array type param')
  }

  return arr[Math.floor(Math.random() * arr.length)]
}

export function formatTime (time: number = new Date().getMilliseconds()): string {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatMapTime (milliseconds: number): string {
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

export const rgba: {
  regexp: RegExp;
  format(rgba: [number, number, number, number?]): string;
  toValues(color: string): [number, number, number, number];
  isRgba(color: string): RegExpMatchArray | null;
} = {
  regexp: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)/,
  format ([r, g, b, a]) {
    if (a === undefined) {
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    }
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
  },
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

export type Note = {
  col: number | string;
  offset: number | string;
  [key: string]: any;
};

export function uniqNotes (notes: Note[]): Note[] {
  const map = new Map<string, boolean>()
  return notes.filter(item => {
    const key = `${item.col}-${item.offset}`
    if (map.get(key)) {
      return false
    }
    map.set(key, true)
    return true
  })
}

export function shuffleArray<T> (arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 安全设置 localStorage 项
 */
export const safeSetStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.error('Failed to set item in localStorage', e)
  }
}

/**
 * 安全获取 localStorage 项
 */
export const safeGetStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.error('Failed to get item from localStorage', e)
    return null
  }
}

/**
 * 安全解析 JSON 字符串
 */
export const safeParseJson = <T = any>(str: string, defaultValue: T | null = null): T | null => {
  try {
    return JSON.parse(str)
  } catch (e) {
    console.error('Failed to parse JSON string', e)
    return defaultValue
  }
}
