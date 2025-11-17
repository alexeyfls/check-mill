import {
  type BitwiseFlags,
  type ProcessorFunction,
  type TimeParams,
  createFlagManager,
  SystemFactory,
  SystemInstance,
  UintXBitSet,
} from "../core";
import { assert } from "../core";
import { type AxisType, Axis } from "./axis";
import { SlideFactory } from "./dom-factories";
import { type GestureEvent } from "./gestures";
import { type LayoutProperties, createLayout } from "./layout";
import { type MotionType, Motion } from "./scroll-motion";
import { type SlidesCollectionType, Slides } from "./slides";

// prettier-ignore
export const enum AppDirtyFlags {
  None           = 0b00000000,
  GestureRunning = 0b00000001,
  Interacted     = 0b00000010,
}

export const enum Phases {
  IO,
  Update,
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
  axis: AxisType;
  board: UintXBitSet;
  dirtyFlags: BitwiseFlags;
  layout: Readonly<LayoutProperties>;
  motion: MotionType;
  slides: SlidesCollectionType;
  dragEvents: GestureEvent[];
  wheelEvents: GestureEvent[];
}

export type AppProcessorFunction = ProcessorFunction<AppRef, TimeParams>;

export type AppSystemInstance = SystemInstance<Phases, AppRef, TimeParams>;

export type AppSystemFactory = SystemFactory<Phases, AppRef, TimeParams>;

export type PhasePipeline = Record<Phases, AppProcessorFunction[]>;

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
 * Creates a throttled version of a processor function that only invokes the
 * original function at most once per every `delay` milliseconds.
 *
 * This is ideal for expensive, repeated operations within a render loop, such
 * as visibility checks or DOM measurements.
 *
 * @param fn The processor function to throttle.
 * @param delay The throttle duration in milliseconds.
 * @returns A new processor function that wraps the original with throttle logic.
 */
export function appProcessorThrottled(
  fn: AppProcessorFunction,
  delay: number
): AppProcessorFunction {
  let lastExecutionTime = -Infinity;

  return (appRef, timeParams) => {
    const currentTime = timeParams.t;

    if (currentTime - lastExecutionTime >= delay) {
      lastExecutionTime = currentTime;
      return fn(appRef, timeParams);
    }

    return appRef;
  };
}

export function createAppRef(root: HTMLElement, container: HTMLElement): AppRef {
  const document = root.ownerDocument;
  const window = document.defaultView;
  assert(window, "Window object not available for provided root element");

  const layout = createLayout({
    checkboxSize: 24,
    gridSpacing: 8,
    viewportRect: root.getBoundingClientRect(),
    loopBufferSizeRatio: 3,
    containerPadding: {
      vertical: 12,
      horizontal: 12,
    },
    slideSpacing: 12,
    slideMaxWidth: 1024,
    slideMaxHeightAsViewportRatio: 0.3,
    slideMinHeightInPx: 100,
    slidePadding: {
      vertical: 12,
      horizontal: 12,
    },
  });

  const slides = Slides(new SlideFactory(document), layout.slideCount.total);

  return {
    owner: {
      window,
      document,
      root,
      container,
    },
    layout,
    slides,
    axis: Axis("y"),
    board: UintXBitSet.empty(16, 65_535),
    motion: Motion(),
    dirtyFlags: createFlagManager(AppDirtyFlags.None),
    dragEvents: new Array<GestureEvent>(),
    wheelEvents: new Array<GestureEvent>(),
  };
}
