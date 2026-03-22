import type { AppRef, AppSystemInstance } from "./components";
import { Phases, createAppRef, collectSystemLogic, createViewLayout } from "./components";
import type { Disposable, DisposableStore } from "./core";
import {
  DisposableStoreId,
  RenderLoop,
  createDisposableStore,
  event,
  throttle,
  createPhase,
  createMergedRunner,
} from "./core";
import { RenderSystem, ScrollSystem, SyncSystem, ToggleSystem, UpdateSystem } from "./systems";

export type CheckMillType = {
  destroy: Disposable;
};

/**
 * Initializes and starts the CheckMill application.
 *
 * @param root - The root HTML element for viewport calculations.
 * @returns A promise that resolves to the application's public API.
 */
export function CheckMill(root: HTMLElement): Promise<CheckMillType> {
  const appRef = createAppRef(root);
  const disposables = createDisposableStore();

  disposables.push(DisposableStoreId.Static, appRef.gateway.init());

  setupStaticListeners(appRef, disposables);
  reconfigure(appRef, disposables);

  appRef.renderLoop = RenderLoop(
    appRef.owner.window,
    (t) => appRef.readExecutor!(appRef, t),
    (t) => appRef.writeExecutor!(appRef, t),
    60 /* fps */,
  );

  appRef.renderLoop.start();

  const destroy = (): void => {
    appRef.renderLoop?.stop();
    disposables.flushAll();
  };

  return Promise.resolve({ destroy });
}

/**
 * Tears down and rebuilds all layout-dependent systems and the processor pipeline.
 *
 * @param appState - The central application state object.
 */
function reconfigure(appRef: AppRef, disposables: DisposableStore): void {
  disposables.flush(DisposableStoreId.Reconfigurable);

  appRef.view = createViewLayout(appRef.owner.root);

  const systems: AppSystemInstance[] = [
    ToggleSystem(appRef),
    ScrollSystem(appRef),
    SyncSystem(appRef),
    UpdateSystem(appRef),
    RenderSystem(appRef),
  ];

  const pipeline = collectSystemLogic(systems);

  for (const system of systems) {
    disposables.push(DisposableStoreId.Reconfigurable, system.init());
  }

  appRef.readExecutor = createMergedRunner([
    createPhase(Phases.IO, pipeline[Phases.IO]),
    createPhase(Phases.Update, pipeline[Phases.Update]),
  ]);

  appRef.writeExecutor = createMergedRunner([
    createPhase(Phases.Render, pipeline[Phases.Render]),
    createPhase(Phases.Cleanup, pipeline[Phases.Cleanup]),
  ]);
}

/**
 * Sets up long-lived, static event listeners
 * that persist for the entire application lifecycle.
 *
 * @param appState - The central application state object.
 */
function setupStaticListeners(appRef: AppRef, disposables: DisposableStore): void {
  const throttledReconfigure = throttle(() => reconfigure(appRef, disposables), 300);

  const onVisibilityChange = (_event: Event): void => {
    if (appRef.owner.document.hidden) {
      appRef.renderLoop?.stop();
    } else {
      appRef.renderLoop?.start();
    }
  };

  disposables.push(
    DisposableStoreId.Static,
    appRef.view.viewport.init(),
    appRef.view.viewport.resized.register(throttledReconfigure),
    event(appRef.owner.document, "visibilitychange", onVisibilityChange),
  );
}
