export interface MotionType {
  current: number;
  previous: number;
  offset: number;
  target: number;
  velocity: number;
  direction: number;
}

export function createMotion(): MotionType {
  return {
    current: 0.0,
    previous: 0.0,
    offset: 0.0,
    target: 0.0,
    velocity: 0.0,
    direction: 1,
  };
}

export function move(motion: MotionType, delta: number): void {
  motion.current += delta;
  motion.previous += delta;
  motion.offset += delta;
  motion.target += delta;
}

export function moveTo(motion: MotionType, position: number): void {
  motion.current = position;
  motion.previous = position;
  motion.offset = position;
  motion.target = position;
}

export function initial(motion: MotionType): void {
  const ref = createMotion();

  for (const field in ref) {
    const typedF = field as keyof MotionType;
    motion[typedF] = ref[typedF];
  }
}
