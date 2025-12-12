import {
  type AppRef,
  type AppRenderFunction,
  type SlidesRendererType,
  type TranslateType,
  type VisibilityTrackerType,
  Phases,
  VisibilityChange,
  appProcessorThrottled,
  writeVariables,
  createVisibilityTracker,
  createSlidesRenderer,
  createTranslationController,
  AppSystemInstance,
} from "../components";
import { type Disposable, DisposableStoreId, createDisposableStore } from "../core";

export const RenderSystem = (appRef: AppRef): AppSystemInstance => {
  let renderer: SlidesRendererType;
  let translate: TranslateType;
  let visibilityTracker: VisibilityTrackerType;

  const init = (): Disposable => {
    translate = createTranslationController(appRef.axis);

    visibilityTracker = createVisibilityTracker(
      appRef.owner.root,
      appRef.slides.map((s) => s.nativeElement)
    );

    renderer = createSlidesRenderer(
      appRef.owner.document,
      appRef.owner.container,
      appRef.axis,
      appRef.layout
    );
    renderer.appendSlides(appRef.slides);

    writeVariables(appRef.owner.root, appRef.layout);

    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, visibilityTracker.init());

    return () => disposables.flushAll();
  };

  const syncVisibility: AppRenderFunction = (app: AppRef, _params) => {
    const records = visibilityTracker.takeRecords();

    for (const record of records) {
      switch (record.change) {
        case VisibilityChange.Exited:
          renderer.fadeOut(app.slides[record.index], app.motion);
          break;

        case VisibilityChange.Entered:
          renderer.fadeIn(app.slides[record.index], app.motion);
          break;
      }
    }

    return app;
  };

  const syncOffset: AppRenderFunction = (app, _params) => {
    renderer.syncOffset(app.slides);
    return app;
  };

  const applyTranslation: AppRenderFunction = (app, _params) => {
    translate.to(app.owner.container, app.motion.offset);
    return app;
  };

  const lerp: AppRenderFunction = (app, params) => {
    const motion = app.motion;

    const interpolated = motion.current * params.alpha + motion.previous * (1.0 - params.alpha);
    motion.offset = interpolated;

    return app;
  };

  return {
    init,
    logic: {
      [Phases.Render]: [
        lerp,
        syncOffset,
        applyTranslation,
        appProcessorThrottled(syncVisibility, 300),
      ],
    },
  };
};
