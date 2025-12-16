import type {
  AppRef,
  AppSystemInstance,
  SlidesRendererType,
  VisibilityTrackerType,
} from "../components";
import {
  Phases,
  VisibilityChange,
  appProcessorThrottled,
  writeVariables,
  createVisibilityTracker,
  createSlidesRenderer,
  AppDirtyFlags,
} from "../components";
import type { Disposable, RenderParams } from "../core";
import { DisposableStoreId, createDisposableStore } from "../core";

export function RenderSystem(appRef: AppRef): AppSystemInstance {
  let renderer: SlidesRendererType;
  let visibilityTracker: VisibilityTrackerType;

  const syncVisibilityThrottled = appProcessorThrottled(syncVisibility, 300);

  function init(): Disposable {
    visibilityTracker = createVisibilityTracker(
      appRef.owner.root,
      appRef.slides.map((s) => s.nativeElement)
    );

    renderer = createSlidesRenderer(
      appRef.owner.document,
      appRef.owner.root,
      appRef.axis,
      appRef.layout
    );
    renderer.mountContainers(appRef.slides);

    writeVariables(appRef.owner.root, appRef.layout);

    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, visibilityTracker.init());

    return () => disposables.flushAll();
  }

  function syncVisibility(app: AppRef, _params: RenderParams): AppRef {
    const records = visibilityTracker.takeRecords();

    for (const record of records) {
      switch (record.change) {
        case VisibilityChange.Exited:
          renderer.dehydrate(app.slides[record.index]);
          break;

        case VisibilityChange.Entered:
          renderer.hydrate(app.slides[record.index], app.board);
          break;
      }
    }

    return app;
  }

  function syncPosition(app: AppRef, _params: RenderParams): AppRef {
    renderer.syncPosition(app.slides, app.motion);
    return app;
  }

  function lerp(app: AppRef, params: RenderParams): AppRef {
    const motion = app.motion;

    const interpolated = motion.current * params.alpha + motion.previous * (1.0 - params.alpha);
    motion.offset = interpolated;

    return app;
  }

  function processStyles(app: AppRef, _params: RenderParams): AppRef {
    const classList = app.owner.root.classList;
    const isGestureRunning = app.dirtyFlags.is(AppDirtyFlags.GestureRunning);
    const containsClass = classList.contains("is-scrolling");

    if (isGestureRunning) {
      !containsClass && classList.add("is-scrolling");
    } else {
      containsClass && classList.remove("is-scrolling");
    }

    return app;
  }

  return {
    init,
    logic: {
      [Phases.Render]: [lerp, syncPosition, syncVisibilityThrottled, processStyles],
    },
  };
}
