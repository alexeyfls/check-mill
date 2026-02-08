import type {
  AppRef,
  AppRenderFunction,
  AppSystemInstance,
  SlidesRendererType,
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
import type { Disposable, RenderParams } from "../core";
import { DisposableStoreId, createDisposableStore, throttle } from "../core";

export function RenderSystem(appRef: AppRef): AppSystemInstance {
  let renderer: SlidesRendererType;
  let visibilityTracker: VisibilityTrackerType;

  const BATCH_SIZE = 2;
  const recordQueue: ReturnType<VisibilityTrackerType["takeRecords"]> = [];

  function init(): Disposable {
    visibilityTracker = createVisibilityTracker(
      appRef.owner.root,
      appRef.slides.map((s) => s.nativeElement),
    );

    renderer = createSlidesRenderer(appRef.owner.document, appRef.owner.root, appRef.layout);
    renderer.mountContainers(appRef.slides);

    writeVariables(appRef.owner.root, appRef.layout);

    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, visibilityTracker.init());

    return () => disposables.flushAll();
  }

  function syncVisibility(app: AppRef, _params: RenderParams): void {
    const records = visibilityTracker.takeRecords();
    if (records.length > 0) {
      recordQueue.push(...records);
    }

    const dynamicBatchSize = Math.ceil(Math.abs(app.motion.velocity) / 5) + BATCH_SIZE;
    const limit = Math.min(recordQueue.length, dynamicBatchSize);

    for (let i = 0; i < limit; i++) {
      const record = recordQueue.shift();
      if (!record) continue;

      switch (record.change) {
        case VisibilityChange.Exited:
          renderer.dehydrate(app.slides[record.index]);
          break;

        case VisibilityChange.Entered:
          renderer.hydrate(app.slides[record.index], app.board);
          break;
      }
    }
  }

  function syncPosition(app: AppRef, _params: RenderParams): void {
    renderer.syncPosition(app.slides, app.motion);
  }

  function lerp(app: AppRef, params: RenderParams): void {
    const motion = app.motion;
    const interpolated = motion.current * params.alpha + motion.previous * (1.0 - params.alpha);
    motion.offset = interpolated;
  }

  function processStyles(app: AppRef, _params: RenderParams): void {
    const classList = app.owner.root.classList;
    const isGestureRunning = app.dirtyFlags.is(AppDirtyFlags.GestureRunning);
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
      [Phases.Render]: [
        lerp,
        syncPosition,
        throttle<AppRenderFunction>(syncVisibility, 32),
        processStyles,
      ],
    },
  };
}
