import type {
  AppRef,
  AppSystemInstance,
  SlidesRendererType,
  VisibilityRecord,
} from "../components";
import {
  Phases,
  VisibilityChange,
  writeVariables,
  createSlidesRenderer,
  AppDirtyFlags,
  needsCheck,
} from "../components";
import type { Disposable, LoopParams } from "../core";
import { runIf, throttle } from "../core";

export function RenderSystem(appRef: AppRef): AppSystemInstance {
  let renderer: SlidesRendererType;

  const BATCH_SIZE = 2;
  const recordQueue: VisibilityRecord[] = [];

  function init(): Disposable {
    renderer = createSlidesRenderer(appRef.owner.document, appRef.owner.root, appRef.view.layout);
    renderer.mountContainers(appRef.view.slides);

    writeVariables(appRef.owner.root, appRef.view.layout);

    return () => {};
  }

  function syncVisibility(app: AppRef, _params: LoopParams): void {
    const records = app.view.slidesVisibilityTracker.takeRecords();
    if (records.length > 0) {
      recordQueue.push(...records);
    }

    const velocityMagnitude = Math.abs(app.view.motion.velocity);

    const dynamicBatchSize =
      velocityMagnitude > 20 ? Math.ceil(velocityMagnitude * 0.8) : BATCH_SIZE;

    const limit = Math.min(recordQueue.length, dynamicBatchSize);

    for (let i = 0; i < limit; i++) {
      const record = recordQueue.shift();
      if (!record) continue;

      switch (record.change) {
        case VisibilityChange.Exited:
          renderer.dehydrate(record.slide);
          break;

        case VisibilityChange.Entered:
          renderer.hydrate(record.slide, app.board);
          break;
      }
    }
  }

  function syncPosition(app: AppRef, _params: LoopParams): void {
    renderer.syncPosition(app.view.slides, app.view.motion);
  }

  function lerp(app: AppRef, params: LoopParams): void {
    const motion = app.view.motion;
    const isDragging = app.view.dirtyFlags.is(AppDirtyFlags.GestureRunning);

    if (isDragging) {
      motion.offset = motion.current;
    } else {
      motion.offset = motion.previous + (motion.current - motion.previous) * params.alpha;
    }
  }

  function updateSlides(app: AppRef, _params: LoopParams): void {
    for (const slide of app.view.slidesVisibilityTracker.getVisibleSlides()) {
      renderer.updateState(slide, app.board);
    }
  }

  return {
    init,
    logic: {
      [Phases.Render]: [
        lerp,
        syncPosition,
        throttle(syncVisibility, 32),
        runIf(needsCheck, updateSlides),
      ],
    },
  };
}
