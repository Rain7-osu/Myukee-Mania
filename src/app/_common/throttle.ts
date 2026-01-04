export function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastCallTime = 0;
  const func = function (...args) {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      fn.apply(this, args);
      lastCallTime = now;
    }
  };

  return func as T;
}
