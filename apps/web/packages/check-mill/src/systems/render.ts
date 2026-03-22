import type {
  AppRef,
  AppSystemInstance,
  SlidesRendererType,
  VisibilityRecord,
  VisibilityTrackerType,
} from "../components";
import {
  Phases,
  VisibilityChange,
  writeVariables,
  createVisibilityTracker,
  createSlidesRenderer,
  AppDirtyFlags,
} from "../components";
import type { Disposable, LoopParams } from "../core";
import { DisposableStoreId, createDisposableStore, throttle } from "../core";

export function RenderSystem(appRef: AppRef): AppSystemInstance {
  let renderer: SlidesRendererType;
  let visibilityTracker: VisibilityTrackerType;

  const BATCH_SIZE = 2;
  const recordQueue: VisibilityRecord[] = [];

  function init(): Disposable {
    visibilityTracker = createVisibilityTracker(
      appRef.owner.root,
      appRef.view.slides.map((s) => s.nativeElement),
    );

    renderer = createSlidesRenderer(appRef.owner.document, appRef.owner.root, appRef.view.layout);
    renderer.mountContainers(appRef.view.slides);

    writeVariables(appRef.owner.root, appRef.view.layout);

    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, visibilityTracker.init());

    return () => disposables.flushAll();
  }

  function syncVisibility(app: AppRef, _params: LoopParams): void {
    const records = visibilityTracker.takeRecords();
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
          renderer.dehydrate(app.view.slides[record.index]);
          break;

        case VisibilityChange.Entered:
          renderer.hydrate(app.view.slides[record.index], app.board);
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

  function processStyles(app: AppRef, _params: LoopParams): void {
    const classList = app.owner.root.classList;
    const isGestureRunning = app.view.dirtyFlags.is(AppDirtyFlags.GestureRunning);
    const containsClass = classList.contains("is-scrolling");

    if (isGestureRunning) {
      !containsClass && classList.add("is-scrolling");
    } else {
      containsClass && classList.remove("is-scrolling");
    }
  }

  return {
    init,
    logic: {
      [Phases.Render]: [lerp, syncPosition, throttle(syncVisibility, 32), processStyles],
    },
  };
}
