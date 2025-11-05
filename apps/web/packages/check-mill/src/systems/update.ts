import { type AppProcessorFunction, Phases, loop } from "../components";
import { noop } from "../core";
import { type AppSystemInitializer } from "./system";

export const UpdateSystem: AppSystemInitializer = () => ({
    init: () => noop,
    logic: {
      [Phases.Update]: [processMotion, processLoop, processLerp],
    },
});

const processLoop: AppProcessorFunction = (appRef) => {
  loop(appRef);
  return appRef;
};

const processMotion: AppProcessorFunction = (app, timeParams) => {
  const motion = app.motion;
  const integrated = applyFriction(motion.velocity, 0.75, timeParams.dt);
  const displacement = motion.current + integrated - motion.previous;

  motion.velocity = integrated;
  motion.previous = motion.current;
  motion.current += integrated;
  motion.direction = Math.sign(displacement);

  return app;
};

const applyFriction = (velocity: number, friction: number, dt: number): number => {
  const decay = 1 - Math.pow(1 - friction, dt / 1000);
  const next = velocity * (1 - decay);

  return next;
};

const processLerp: AppProcessorFunction = (app, timeParams) => {
  const motion = app.motion;
  const interpolated =
    motion.current * timeParams.alpha + motion.previous * (1.0 - timeParams.alpha);
  motion.offset = interpolated;

  return app;
};
