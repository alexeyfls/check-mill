import {
  type AppRef,
  type AppSystemInstance,
  type AppUpdateFunction,
  Phases,
  loop,
} from "../components";
import { noop } from "../core";

export const UpdateSystem = (_appRef: AppRef): AppSystemInstance => ({
  init: () => noop,
  logic: {
    [Phases.Update]: [processInertia, processLoop],
  },
});

const processLoop: AppUpdateFunction = (appRef) => {
  loop(appRef);
  return appRef;
};

export const processInertia: AppUpdateFunction = (app, params) => {
  const motion = app.motion;

  const integratedVelocity = applyFriction(motion.velocity, 0.75 /* friction factor */, params.dt);

  const displacement = integratedVelocity;

  motion.velocity = integratedVelocity;
  motion.previous = motion.current;
  motion.current += displacement;
  motion.direction = Math.sign(displacement);

  return app;
};

const applyFriction = (velocity: number, friction: number, dt: number): number => {
  const decay = 1 - Math.pow(1 - friction, dt / 1000);
  const next = velocity * (1 - decay);

  return next;
};
