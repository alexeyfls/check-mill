import {
  type BitwiseFlags,
  type Disposable,
  type ProcessorFunction,
  type UpdateParams,
  type RenderParams,
  createFlagManager,
  UintXBitSet,
} from "../core";
import { assert } from "../core";
import { type Axis, createAxis } from "./axis";
import { SlideFactory } from "./dom-factories";
import { type LayoutProperties, createLayout } from "./layout";
import { LoopPhase, type LoopState } from "./looper";
import { type MotionType, createMotion } from "./scroll-motion";
import { type SlidesCollectionType, createSlides } from "./slides";

// prettier-ignore
export const enum AppDirtyFlags {
  None           = 0b00000000,
  GestureRunning = 0b00000001,
  Interacted     = 0b00000010,
}

export const enum Phases {
  // Logic & Simulation (fixed timestamp)
  IO,
  Update,

  // Presentation (variable timestamp)
  Render,
  Cleanup,
}

export interface AppRef {
  owner: {
    window: Window;
    document: Document;
    root: HTMLElement;
    container: HTMLElement;
  };
  axis: Axis;
  board: UintXBitSet;
  dirtyFlags: BitwiseFlags;
  layout: Readonly<LayoutProperties>;
  motion: MotionType;
  slides: SlidesCollectionType;
  loopState: LoopState;
}

/**
 * Processor for fixed-step logic.
 */
export type AppUpdateFunction = ProcessorFunction<AppRef, UpdateParams>;

/**
 * Processor for variable-step rendering.
 */
export type AppRenderFunction = ProcessorFunction<AppRef, RenderParams>;

/**
 * A strongly-typed pipeline that enforces the correct function signature
 * for each phase.
 */
export type PhasePipeline = {
  [Phases.IO]: AppUpdateFunction[];
  [Phases.Update]: AppUpdateFunction[];
  [Phases.Render]: AppRenderFunction[];
  [Phases.Cleanup]: AppRenderFunction[];
};

/**
 * Defines the structure of a System in this application.
 * We avoid the generic `SystemInstance` here to support the mixed parameter types in `PhasePipeline`.
 */
export interface AppSystemInstance {
  /**
   * Initializes the system (DOM listeners, etc).
   * @returns A disposable to clean up the system.
   */
  init(): Disposable;

  /**
   * Returns the logic functions to be injected into the main loop.
   */
  readonly logic: Partial<PhasePipeline>;
}

/**
 * Creates an empty pipeline object, mapping each phase to an empty
 * function array.
 *
 * @returns A new PhasePipeline.
 */
export function createPhasePipeline(): PhasePipeline {
  return {
    [Phases.IO]: [],
    [Phases.Update]: [],
    [Phases.Render]: [],
    [Phases.Cleanup]: [],
  };
}

/**
 * Collects and merges processor functions from multiple systems into a
 * single record organized by phase.
 *
 * @param systems An array of AppSystemInstance objects.
 * @returns A new PhasePipeline.
 */
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

/**
 * Merges multiple phase pipelines into a single pipeline.
 *
 * @param pipelines An array of PhasePipeline objects.
 * @returns A single, combined PhasePipeline.
 */
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
 * Creates a throttled version of a processor function.
 * Works for both Update and Render functions as long as params include `t`.
 *
 * @param fn The processor function to throttle.
 * @param delay The throttle duration in milliseconds.
 */
export function appProcessorThrottled<P extends { t: number }>(
  fn: ProcessorFunction<AppRef, P>,
  delay: number
): ProcessorFunction<AppRef, P> {
  let lastExecutionTime = -Infinity;

  return (appRef, params) => {
    const currentTime = params.t;

    if (currentTime - lastExecutionTime >= delay) {
      lastExecutionTime = currentTime;
      return fn(appRef, params);
    }

    return appRef;
  };
}

export function createAppRef(root: HTMLElement, container: HTMLElement): AppRef {
  const document = root.ownerDocument;
  const window = document.defaultView;
  assert(window, "Window object not available for provided root element");

  const rect = root.getBoundingClientRect();

  const layout = createLayout({
    checkboxSize: 24,
    gridSpacing: 8,
    viewportSize: {
      width: rect.width,
      height: rect.height,
    },
    loopBufferSizeRatio: 3,
    containerPadding: {
      vertical: 12,
      horizontal: 12,
    },
    slideSpacing: 12,
    slideMaxWidth: 1024,
    slideMaxHeightRatio: 0.3,
    slideMinHeight: 100,
    slidePadding: {
      vertical: 12,
      horizontal: 12,
    },
    minGridDimension: 2,
    maxGridDimension: 128,
    targetDivisor: 65_535 * 16,
  });

  const slides = createSlides(new SlideFactory(document), layout.slideCount.total);

  const owner = {
    window,
    document,
    root,
    container,
  };

  const loopState = {
    iteration: 0,
    phase: LoopPhase.Neutral,
  };

  return {
    axis: createAxis("y"),
    board: UintXBitSet.empty(16, 65_535),
    dirtyFlags: createFlagManager(AppDirtyFlags.None),
    layout,
    loopState,
    motion: createMotion(),
    owner,
    slides,
  };
}
