import type { AppRef, AppSystemInstance, GestureEvent } from "../components";
import {
  AppDirtyFlags,
  GestureState,
  Phases,
  createDragGesture,
  createWheelGesture,
} from "../components";
import type { Disposable, LoopParams } from "../core";
import { DisposableStoreId, createDisposableStore, getSupport } from "../core";

const WHEEL_SENSITIVITY = 15;

export function ScrollSystem(appRef: AppRef): AppSystemInstance {
  const dragQueue: GestureEvent[] = [];
  const wheelQueue: GestureEvent[] = [];
  const disposables = createDisposableStore();

  function init(): Disposable {
    const { hasTouch } = getSupport(appRef.owner.window, appRef.owner.document);
    if (hasTouch) {
      setupDragStrategy();
    } else {
      setupWheelStrategy();
    }

    disposables.push(DisposableStoreId.Static, cleanup);

    return disposables.flushAll;
  }

  function setupDragStrategy(): void {
    const dragGesture = createDragGesture(appRef.owner.root);

    dragGesture.register((e) => dragQueue.push(e));

    disposables.push(DisposableStoreId.Static, dragGesture.init());
  }

  function setupWheelStrategy(): void {
    const wheelGesture = createWheelGesture(appRef.owner.root);

    wheelGesture.register((e) => wheelQueue.push(e));

    disposables.push(DisposableStoreId.Static, wheelGesture.init());
  }

  function processWheelScroll(app: AppRef, _params: LoopParams): void {
    if (wheelQueue.length === 0) return;

    const motion = app.view.motion;
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

    const motion = app.view.motion;

    for (const event of dragQueue) {
      switch (event.state) {
        case GestureState.Initialize:
          motion.velocity = 0;
          app.view.dirtyFlags.set(AppDirtyFlags.GestureRunning);
          break;

        case GestureState.Update:
          motion.previous = motion.current;
          motion.current += event.delta;
          motion.offset = motion.current;
          break;

        case GestureState.Finalize:
          motion.velocity = event.delta;
          app.view.dirtyFlags.unset(AppDirtyFlags.GestureRunning);
          break;
      }
    }

    dragQueue.length = 0;
  }

  function cleanup(): void {
    dragQueue.length = 0;
    wheelQueue.length = 0;
  }

  return {
    init,
    logic: {
      [Phases.IO]: [processDragScroll, processWheelScroll],
    },
  };
}
