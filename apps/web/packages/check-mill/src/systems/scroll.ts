import type { AppRef, AppSystemInstance, GestureEvent } from "../components";
import {
  AppDirtyFlags,
  GestureState,
  Phases,
  createDragGesture,
  createWheelGesture,
} from "../components";
import type { Disposable } from "../core";
import { DisposableStoreId, createDisposableStore, UpdateParams } from "../core";

const WHEEL_FORCE_MULTIPLIER = 0.05;

const MAX_WHEEL_VELOCITY = 32;

export function ScrollSystem(appRef: AppRef): AppSystemInstance {
  const dragQueue: GestureEvent[] = [];
  const wheelQueue: GestureEvent[] = [];

  function init(): Disposable {
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
  }

  function processWheelScroll(app: AppRef, _params: UpdateParams): AppRef {
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
  }

  function processDragScroll(app: AppRef, _params: UpdateParams): AppRef {
    if (dragQueue.length === 0) return app;

    const motion = app.motion;

    for (const event of dragQueue) {
      switch (event.state) {
        case GestureState.Initialize:
          motion.velocity = 0;
          motion.previous = motion.current;
          app.dirtyFlags.set(AppDirtyFlags.GestureRunning);
          break;

        case GestureState.Update:
          motion.previous = motion.current;
          motion.current += event.delta;
          break;

        case GestureState.Finalize:
          motion.velocity = event.delta;
          app.dirtyFlags.unset(AppDirtyFlags.GestureRunning);
          break;
      }
    }

    dragQueue.length = 0;
    return app;
  }

  return {
    init,
    logic: {
      [Phases.IO]: [processDragScroll, processWheelScroll],
    },
  };
}
