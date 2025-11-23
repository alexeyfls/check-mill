/**
 * Defines the state structure for a single dimension of scroll motion.
 * These properties are used by motion and animation systems.
 */
export interface MotionType {
  current: number;
  previous: number;
  offset: number;
  target: number;
  velocity: number;
  direction: number;
}

/**
 * A motion state container.
 *
 * Manages multiple 1D vectors used in scroll calculations,
 * such as current position, target position, velocity, and more.
 *
 * @returns {MotionType} A MotionType instance .
 */
export function Motion(): MotionType {
  return {
    current: 0.0,
    previous: 0.0,
    offset: 0.0,
    target: 0.0,
    velocity: 0.0,
    direction: 1,
  };
}

/**
 * Apply a uniform delta to Motion.
 *
 * @param motion - Motion to advance.
 * @param delta - Amount to increment each value by.
 */
export function move(motion: MotionType, delta: number): void {
  motion.current += delta;
  motion.previous += delta;
  motion.offset += delta;
  motion.target += delta;
}

/**
 * Sets all primary motion properties to a specific, static position.
 *
 * @param motion - The MotionType object to update.
 * @param position - The new static position to assign to all relevant fields.
 */
export function moveTo(motion: MotionType, position: number): void {
  motion.current = position;
  motion.previous = position;
  motion.offset = position;
  motion.target = position;
}

/**
 * Resets the motion state to its initial, zeroed values.
 *
 * @param motion - The MotionType object to reset.
 */
export function initial(motion: MotionType): void {
  const ref = Motion();

  for (const field in ref) {
    const typedF = field as keyof MotionType;
    motion[typedF] = ref[typedF];
  }
}
