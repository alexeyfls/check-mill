import {
  type AppRef,
  type AppSystemInstance,
  type AppUpdateFunction,
  type GestureEvent,
  GestureState,
  Phases,
  createDragGesture,
  createWheelGesture,
} from "../components";
import { type Disposable, DisposableStoreId, createDisposableStore } from "../core";

const WHEEL_FORCE_MULTIPLIER = 0.05;

/**
 * Limits the maximum velocity a wheel event can induce.
 * Critical for preventing "Rocket Scrolling" on high-speed trackpads.
 */
const MAX_WHEEL_VELOCITY = 32;

export const ScrollSystem = (appRef: AppRef): AppSystemInstance => {
  const dragQueue: GestureEvent[] = [];
  const wheelQueue: GestureEvent[] = [];

  const init = (): Disposable => {
    const dragGesture = createDragGesture(appRef.owner.root, appRef.axis);
    const wheelGesture = createWheelGesture(appRef.owner.root, appRef.axis);

    dragGesture.register((e) => dragQueue.push(e));
    wheelGesture.register((e) => wheelQueue.push(e));

    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, dragGesture.init(), wheelGesture.init(), () => {
      dragQueue.length = 0;
      wheelQueue.length = 0;
    });

    return () => disposables.flushAll();
  };

  const processWheelScroll: AppUpdateFunction = (app, _params) => {
    if (wheelQueue.length === 0) return app;

    const motion = app.motion;
    let accumulatedDelta = 0;

    for (const event of wheelQueue) {
      accumulatedDelta += event.delta;
    }

    motion.velocity += accumulatedDelta * WHEEL_FORCE_MULTIPLIER;

    if (motion.velocity > MAX_WHEEL_VELOCITY) {
      motion.velocity = MAX_WHEEL_VELOCITY;
    } else if (motion.velocity < -MAX_WHEEL_VELOCITY) {
      motion.velocity = -MAX_WHEEL_VELOCITY;
    }

    wheelQueue.length = 0;
    return app;
  };

  const processDragScroll: AppUpdateFunction = (app, _params) => {
    if (dragQueue.length === 0) return app;

    const motion = app.motion;

    for (const event of dragQueue) {
      switch (event.state) {
        case GestureState.Initialize:
          motion.velocity = 0;
          break;

        case GestureState.Update:
          motion.current += event.delta;
          break;

        case GestureState.Finalize:
          motion.velocity = event.delta;
          break;
      }
    }

    dragQueue.length = 0;
    return app;
  };

  return {
    init,
    logic: {
      [Phases.IO]: [processDragScroll, processWheelScroll],
    },
  };
};
