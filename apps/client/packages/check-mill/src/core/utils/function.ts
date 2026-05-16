/**
 * Calls the provided function immediately.
 *
 * @param func - A zero-argument function to invoke.
 */
export function call(func: () => void): void {
  func();
}

/**
 * Creates a throttled version of the given function that, when invoked repeatedly,
 * will only call the original function at most once per every `wait` milliseconds.
 *
 * The returned function is intended to be called from a render/update loop.
 *
 * @typeParam T - The type of the function to be throttled.
 *
 * @param func - The function to throttle.
 * @param wait - The number of milliseconds to wait before allowing another call.
 *
 * @returns A throttled version of the original function.
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = performance.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      return func(...args);
    }

    return args;
  };
}

/**
 * Creates a debounced version of the given function that delays invoking it
 * until after `wait` milliseconds have elapsed since the last time it was called.
 *
 * The returned function is intended to be called from a render/update loop.
 *
 * @typeParam T - The type of the function to be debounced.
 *
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to delay.
 *
 * @returns A debounced version of the original function.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let lastArgs: Parameters<T> | undefined;

  return (...args: Parameters<T>) => {
    const now = performance.now();

    lastArgs = args;

    if (now - lastCall >= wait) {
      lastCall = now;

      const nextArgs = lastArgs;
      lastArgs = undefined;

      return func(...nextArgs);
    }
  };
}

export function noop(): void {}
