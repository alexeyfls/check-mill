import type {
  BitwiseFlags,
  Disposable,
  ProcessorFunction,
  LoopParams,
  RenderLoopType,
} from "../core";
import { assert, createFlagManager, BitSet, noop } from "../core";
import { SlideFactory } from "./dom-factories";
import type { LayoutProperties } from "./layout";
import { createLayout } from "./layout";
import type { LoopState } from "./looper";
import { initialLoopState } from "./looper";
import { createGateway, GatewayType } from "./gateway";
import type { MotionType } from "./scroll-motion";
import { createMotion } from "./scroll-motion";
import type { SlidesCollectionType } from "./slides";
import { createSlides } from "./slides";
import { createViewport, ViewportType } from "./viewport";
import { createVisibilityTracker, VisibilityTrackerType } from "./visibility-tracker";

// prettier-ignore
export const enum AppDirtyFlags {
  None             = 0,
  GestureRunning   = 1 << 0,
  FrameNeedsRedraw = 1 << 1,
}

export const enum Phases {
  IO,
  Update,
  Render,
  Cleanup,
}

/**
 * ViewLayout represents the ephemeral, layout-dependent state.
 */
export type ViewLayout = {
  readonly layout: LayoutProperties;
  readonly slides: SlidesCollectionType;
  readonly loopState: LoopState;
  readonly motion: MotionType;
  readonly dirtyFlags: BitwiseFlags;
  readonly slidesVisibilityTracker: VisibilityTrackerType;
};

/**
 * AppRef is the persistent state container.
 */
export type AppRef = {
  readonly owner: {
    window: Window;
    document: Document;
    root: HTMLElement;
  };

  readonly board: BitSet;
  readonly gateway: GatewayType;
  readonly viewport: ViewportType;

  view: ViewLayout;
  renderLoop: RenderLoopType | null;
  readExecutor: AppProcessoFunction;
  writeExecutor: AppProcessoFunction;
};

export type AppProcessoFunction = ProcessorFunction<AppRef, LoopParams>;

export type PhasePipeline = {
  [Phases.IO]: AppProcessoFunction[];
  [Phases.Update]: AppProcessoFunction[];
  [Phases.Render]: AppProcessoFunction[];
  [Phases.Cleanup]: AppProcessoFunction[];
};

export interface AppSystemInstance {
  init(): Disposable;
  readonly logic: Partial<PhasePipeline>;
}

export function createPhasePipeline(): PhasePipeline {
  return {
    [Phases.IO]: [],
    [Phases.Update]: [],
    [Phases.Render]: [],
    [Phases.Cleanup]: [cleanupFrame],
  };
}

export function collectSystemLogic(systems: AppSystemInstance[]): PhasePipeline {
  const collectedLogic = createPhasePipeline();

  for (const system of systems) {
    collectedLogic[Phases.IO].push(...(system.logic[Phases.IO] ?? []));
    collectedLogic[Phases.Update].push(...(system.logic[Phases.Update] ?? []));
    collectedLogic[Phases.Render].push(...(system.logic[Phases.Render] ?? []));
    collectedLogic[Phases.Cleanup].push(...(system.logic[Phases.Cleanup] ?? []));
  }

  return collectedLogic;
}

export function mergePipelines(pipelines: PhasePipeline[]): PhasePipeline {
  const merged = createPhasePipeline();

  for (const pipeline of pipelines) {
    merged[Phases.IO].push(...pipeline[Phases.IO]);
    merged[Phases.Update].push(...pipeline[Phases.Update]);
    merged[Phases.Render].push(...pipeline[Phases.Render]);
    merged[Phases.Cleanup].push(...pipeline[Phases.Cleanup]);
  }

  return merged;
}

/**
 * One-time setup for the persistent application state.
 */
export function createAppRef(root: HTMLElement): AppRef {
  const document = root.ownerDocument;
  const window = document.defaultView;
  assert(window, "Window object not available for provided root element");

  return {
    owner: {
      window,
      document,
      root,
    },
    board: BitSet.fromBitCount(1_048_576),
    gateway: createGateway("http://localhost:4000/view"),
    view: createViewLayout(root),
    viewport: createViewport(root),
    renderLoop: null,
    readExecutor: noop,
    writeExecutor: noop,
  };
}

/**
 * Creates the ephemeral, layout-dependent state.
 */
export function createViewLayout(root: HTMLElement): ViewLayout {
  const document = root.ownerDocument;
  const rect = root.getBoundingClientRect();

  const layout = createLayout({
    checkboxSize: 24,
    gridSpacing: 8,
    viewportSize: { width: rect.width, height: rect.height },
    loopBufferSizeRatio: 3,
    containerPadding: { vertical: 12, horizontal: 12 },
    slideSpacing: 8,
    slideMaxWidth: 1024,
    slideMaxHeightRatio: 0.25,
    slideMinHeight: 100,
    slidePadding: { vertical: 12, horizontal: 12 },
    minGridDimension: 2,
    maxGridDimension: 128,
    targetDivisor: 65_535 * 16,
  });

  const slides = createSlides(new SlideFactory(document), layout.slideCount.total);

  const slidesVisibilityTracker = createVisibilityTracker(root, slides);

  return {
    layout,
    slides,
    slidesVisibilityTracker,
    motion: createMotion(),
    loopState: initialLoopState(),
    dirtyFlags: createFlagManager(AppDirtyFlags.None),
  };
}

/**
 * Triggers a redraw for the next render frame.
 */
export function markForCheck(app: AppRef): void {
  app.view.dirtyFlags.set(AppDirtyFlags.FrameNeedsRedraw);
}

/**
 * Checks if the current frame has been marked for a redraw.
 */
export function needsCheck(app: AppRef): boolean {
  return app.view.dirtyFlags.is(AppDirtyFlags.FrameNeedsRedraw);
}

/**
 * Resets the redraw flag at the end of the pipeline.
 */
export function cleanupFrame(app: AppRef): void {
  app.view.dirtyFlags.unset(AppDirtyFlags.FrameNeedsRedraw);
}
