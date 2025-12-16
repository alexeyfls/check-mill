import type { AppRef, AppSystemInstance } from "../components";
import { Phases, loop } from "../components";
import { UpdateParams, noop } from "../core";

export function UpdateSystem(_appRef: AppRef): AppSystemInstance {
  return {
    init: () => noop,
    logic: {
      [Phases.Update]: [processInertia, processLoop],
    },
  };
}

function processLoop(appRef: AppRef): AppRef {
  loop(appRef);
  return appRef;
}

function processInertia(app: AppRef, params: UpdateParams): AppRef {
  const motion = app.motion;
  if (Math.abs(motion.velocity) < 0.01) {
    motion.velocity = 0;
    return app;
  }

  const integratedVelocity = applyFriction(motion.velocity, 0.75 /* friction factor */, params.dt);

  const displacement = integratedVelocity;

  motion.velocity = integratedVelocity;

  motion.previous = motion.current;
  motion.current += displacement;
  motion.direction = Math.sign(displacement);

  return app;
}

function applyFriction(velocity: number, friction: number, dt: number): number {
  const decay = 1 - Math.pow(1 - friction, dt / 1000);
  let next = velocity * (1 - decay);

  if (Math.abs(next) < 0.001) return 0;

  return next;
}
