import type { AppRef, AppSystemInstance } from "../components";
import { Phases, loop } from "../components";
import { UpdateParams, noop } from "../core";

const FRICTION = 0.92;

export function UpdateSystem(_appRef: AppRef): AppSystemInstance {
  return {
    init: () => noop,
    logic: {
      [Phases.Update]: [processInertia, loop],
    },
  };
}

function processInertia(app: AppRef, params: UpdateParams): void {
  const motion = app.motion;

  motion.velocity *= Math.pow(FRICTION, params.dt / 16.67);

  if (Math.abs(motion.velocity) < 1) {
    motion.velocity = 0;
  }

  const displacement = motion.velocity * (params.dt / 1000);

  motion.previous = motion.current;
  motion.current += displacement;
}
