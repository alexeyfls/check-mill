import {
  type AppProcessorFunction,
  type AppRef,
  type AppSystemInstance,
  AppDirtyFlags,
  Phases,
  Viewport,
  createAppRef,
  createPhasePipeline,
  mergePipelines,
  collectSystemLogic,
} from "./components";
import {
  type Disposable,
  type RenderLoopType,
  DisposableStoreId,
  RenderLoop,
  createDisposableStore,
  event,
  throttle,
  createPhase,
  createMergedRunner,
} from "./core";
import { NetworkSystem, RenderSystem, ScrollSystem, UpdateSystem } from "./systems";

export type CheckMillType = {
  destroy: Disposable;
};

/**
 * Internal state "struct" for the entire application.
 */
type ApplicationState = {
  appRef: AppRef;
  readonly disposables: ReturnType<typeof createDisposableStore>;
  renderLoop: RenderLoopType | null;

  readExecutor: AppProcessorFunction | null;
  writeExecutor: AppProcessorFunction | null;
};

/**
 * Initializes and starts the CheckMill application.
 *
 * @param root - The root HTML element for viewport calculations.
 * @param container - The main container element for the application.
 * @returns A promise that resolves to the application's public API.
 */
export function CheckMill(root: HTMLElement, container: HTMLElement): Promise<CheckMillType> {
  const appState: ApplicationState = {
    appRef: createAppRef(root, container),
    disposables: createDisposableStore(),
    renderLoop: null,
    readExecutor: null,
    writeExecutor: null,
  };

  setupStaticListeners(appState);
  reconfigure(appState);

  appState.renderLoop = RenderLoop(
    appState.appRef.owner.window,
    (t) => appState.readExecutor!(appState.appRef, t),
    (t) => appState.writeExecutor!(appState.appRef, t),
    60 /* fps */
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
  appState.appRef = createAppRef(prevAppRef.owner.root, prevAppRef.owner.container);

  const prependPipeline = createPhasePipeline();
  prependPipeline[Phases.IO].push(isInteracted);
  prependPipeline[Phases.Cleanup].push(resetInteractionState);

  const systems: AppSystemInstance[] = [
    NetworkSystem(appState.appRef),
    ScrollSystem(appState.appRef),
    UpdateSystem(appState.appRef),
    RenderSystem(appState.appRef),
  ];

  const finalPipeline = mergePipelines([prependPipeline, collectSystemLogic(systems)]);

  for (const system of systems) {
    appState.disposables.push(DisposableStoreId.Reconfigurable, system.init());
  }

  appState.readExecutor = createMergedRunner([
    createPhase(Phases.IO, finalPipeline[Phases.IO]),
    createPhase(Phases.Update, finalPipeline[Phases.Update]),
  ]);

  appState.writeExecutor = createMergedRunner([
    createPhase(Phases.Render, finalPipeline[Phases.Render]),
    createPhase(Phases.Cleanup, finalPipeline[Phases.Cleanup]),
  ]);
}

/**
 * Sets up long-lived, static event listeners
 * that persist for the entire application lifecycle.
 *
 * @param appState - The central application state object.
 */
function setupStaticListeners(appState: ApplicationState): void {
  const viewport = Viewport(appState.appRef.owner.root);
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
    event(appState.appRef.owner.document, "visibilitychange", onVisibilityChange)
  );
}

const isInteracted: AppProcessorFunction = (appRef: AppRef) => {
  return appRef.dirtyFlags.is(AppDirtyFlags.Interacted) ? appRef : null;
};

const resetInteractionState: AppProcessorFunction = (appRef: AppRef): AppRef => {
  appRef.dirtyFlags.unset(AppDirtyFlags.Interacted);
  return appRef;
};
