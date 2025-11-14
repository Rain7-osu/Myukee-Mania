// 缓动函数
export function easeOutQuad(t) {
  return t * (2 - t);
}

export function easeInQuad(t) {
  return t * t;
}

/**
 * @param arr {any[]}
 */
export function selectRandomArrayItem(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('Excepted receive an array type param')
  }

  return  arr[Math.floor(Math.random() * arr.length)]
}

/**
 * @param func {Function}
 * @param limit {number}
 * @return {(function(): void)|*}
 */
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export function debounce(func, limit) {
  // 防抖处理，避免频繁重绘
  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout(() => {
    func()
  }, 100); // 100ms延迟
}
