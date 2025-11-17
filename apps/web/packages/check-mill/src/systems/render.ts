import {
  type AppRef,
  type AppProcessorFunction,
  type AppSystemFactory,
  type SlidesRendererType,
  type TranslateType,
  type VisibilityTrackerType,
  Phases,
  VisibilityChange,
  SlidesRenderer,
  Translate,
  appProcessorThrottled,
  writeVariables,
  createVisibilityTracker,
} from "../components";
import { type Disposable, DisposableStoreId, createDisposableStore } from "../core";

export const RenderSystem: AppSystemFactory = (appRef: AppRef) => {
  let renderer: SlidesRendererType;
  let translate: TranslateType;
  let visibilityTracker: VisibilityTrackerType;

  const init = (): Disposable => {
    translate = Translate(appRef.axis);

    visibilityTracker = createVisibilityTracker(
      appRef.owner.root,
      appRef.slides.map((s) => s.nativeElement)
    );

    renderer = SlidesRenderer(
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

  const syncVisibility: AppProcessorFunction = (app: AppRef, _timeParams) => {
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

  const syncOffset: AppProcessorFunction = (app, _timeParams) => {
    renderer.syncOffset(app.slides);
    return app;
  };

  const applyTranslation: AppProcessorFunction = (app, _timeParams) => {
    translate.to(app.owner.container, app.motion.offset);
    return app;
  };

  return {
    init,
    logic: {
      [Phases.Render]: [syncOffset, applyTranslation, appProcessorThrottled(syncVisibility, 160)],
    },
  };
};
