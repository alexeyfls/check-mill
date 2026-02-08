import type { AppRef, AppProcessoFunction, AppSystemInstance } from "./components";
import { Phases, createAppRef, collectSystemLogic, createViewport } from "./components";
import type { Disposable, RenderLoopType } from "./core";
import {
  DisposableStoreId,
  RenderLoop,
  createDisposableStore,
  event,
  throttle,
  createPhase,
  createMergedRunner,
  noop,
} from "./core";
import { NetworkSystem, RenderSystem, ScrollSystem, ToggleSystem, UpdateSystem } from "./systems";

export type CheckMillType = {
  destroy: Disposable;
};

/**
 * Internal state for the entire application.
 */
type ApplicationState = {
  appRef: AppRef;
  readonly disposables: ReturnType<typeof createDisposableStore>;
  renderLoop: RenderLoopType | null;

  readExecutor: AppProcessoFunction;
  writeExecutor: AppProcessoFunction;
};

/**
 * Initializes and starts the CheckMill application.
 *
 * @param root - The root HTML element for viewport calculations.
 * @returns A promise that resolves to the application's public API.
 */
export function CheckMill(root: HTMLElement): Promise<CheckMillType> {
  const appState: ApplicationState = {
    appRef: createAppRef(root),
    disposables: createDisposableStore(),
    renderLoop: null,
    readExecutor: noop,
    writeExecutor: noop,
  };

  setupStaticListeners(appState);
  reconfigure(appState);

  appState.renderLoop = RenderLoop(
    appState.appRef.owner.window,
    (t) => appState.readExecutor!(appState.appRef, t),
    (t) => appState.writeExecutor!(appState.appRef, t),
    60 /* fps */,
  );

  appState.renderLoop.start();

  const destroy = (): void => {
    appState.renderLoop?.stop();
    appState.disposables.flushAll();
  };

  return Promise.resolve({ destroy });
}

/**
 * Tears down and rebuilds all layout-dependent systems and the processor pipeline.
 *
 * @param appState - The central application state object.
 */
function reconfigure(appState: ApplicationState): void {
  appState.disposables.flush(DisposableStoreId.Reconfigurable);

  const prevAppRef = appState.appRef;
  appState.appRef = createAppRef(prevAppRef.owner.root);

  const systems: AppSystemInstance[] = [
    NetworkSystem(appState.appRef),
    ToggleSystem(appState.appRef),
    ScrollSystem(appState.appRef),
    UpdateSystem(appState.appRef),
    RenderSystem(appState.appRef),
  ];

  const pipeline = collectSystemLogic(systems);

  for (const system of systems) {
    appState.disposables.push(DisposableStoreId.Reconfigurable, system.init());
  }

  appState.readExecutor = createMergedRunner([
    createPhase(Phases.IO, pipeline[Phases.IO]),
    createPhase(Phases.Update, pipeline[Phases.Update]),
  ]);

  appState.writeExecutor = createMergedRunner([
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
function setupStaticListeners(appState: ApplicationState): void {
  const viewport = createViewport(appState.appRef.owner.root);
  const throttledReconfigure = throttle(() => reconfigure(appState), 300);

  viewport.resized.register(throttledReconfigure);

  const onVisibilityChange = (_event: Event): void => {
    if (appState.appRef.owner.document.hidden) {
      appState.renderLoop?.stop();
    } else {
      appState.renderLoop?.start();
    }
  };

  appState.disposables.push(
    DisposableStoreId.Static,
    viewport.init(),
    event(appState.appRef.owner.document, "visibilitychange", onVisibilityChange),
  );
}
