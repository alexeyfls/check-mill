import type { AppRef, AppSystemInstance, GestureEvent } from "../components";
import {
  AppDirtyFlags,
  GestureState,
  Phases,
  createDragGesture,
  createWheelGesture,
} from "../components";
import type { Disposable, LoopParams } from "../core";
import { DisposableStoreId, createDisposableStore } from "../core";

const WHEEL_SENSITIVITY = 15;

export function ScrollSystem(appRef: AppRef): AppSystemInstance {
  const dragQueue: GestureEvent[] = [];
  const wheelQueue: GestureEvent[] = [];
  const disposables = createDisposableStore();

  function init(): Disposable {
    const dragGesture = createDragGesture(appRef.owner.root);
    const wheelGesture = createWheelGesture(appRef.owner.root);

    dragGesture.register((e) => dragQueue.push(e));
    wheelGesture.register((e) => wheelQueue.push(e));

    disposables.push(DisposableStoreId.Static, dragGesture.init(), wheelGesture.init(), () => {
      dragQueue.length = 0;
      wheelQueue.length = 0;
    });

    return () => disposables.flushAll();
  }

  function processWheelScroll(app: AppRef, _params: LoopParams): void {
    if (wheelQueue.length === 0) return;

    const motion = app.motion;
    let accumulatedDelta = 0;

    for (const event of wheelQueue) {
      accumulatedDelta += event.delta;
    }

    const accelerationDropoff = Math.max(0, 1 - Math.abs(motion.velocity) / 5000);

    motion.velocity += accumulatedDelta * WHEEL_SENSITIVITY * accelerationDropoff;

    wheelQueue.length = 0;
  }

  function processDragScroll(app: AppRef, _params: LoopParams): void {
    if (dragQueue.length === 0) return;

    const motion = app.motion;

    for (const event of dragQueue) {
      switch (event.state) {
        case GestureState.Initialize:
          motion.velocity = 0;
          app.dirtyFlags.set(AppDirtyFlags.GestureRunning);
          break;

        case GestureState.Update:
          motion.previous = motion.current;
          motion.current += event.delta;
          motion.offset = motion.current;
          break;

        case GestureState.Finalize:
          motion.velocity = event.delta;
          app.dirtyFlags.unset(AppDirtyFlags.GestureRunning);
          break;
      }
    }

    dragQueue.length = 0;
  }

  return {
    init,
    logic: {
      [Phases.IO]: [processDragScroll, processWheelScroll],
    },
  };
}
