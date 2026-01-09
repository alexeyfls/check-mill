import type {
  BitwiseFlags,
  Disposable,
  ProcessorFunction,
  UpdateParams,
  RenderParams,
} from "../core";
import { assert, createFlagManager, UintXBitSet } from "../core";
import { SlideFactory } from "./dom-factories";
import type { LayoutProperties } from "./layout";
import { createLayout } from "./layout";
import type { LoopState } from "./looper";
import { LoopPhase } from "./looper";
import type { MotionType } from "./scroll-motion";
import { createMotion } from "./scroll-motion";
import type { SlidesCollectionType } from "./slides";
import { createSlides } from "./slides";

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
  };
  board: UintXBitSet;
  dirtyFlags: BitwiseFlags;
  layout: Readonly<LayoutProperties>;
  motion: MotionType;
  slides: SlidesCollectionType;
  loopState: LoopState;
}

export type AppUpdateFunction = ProcessorFunction<AppRef, UpdateParams>;

export type AppRenderFunction = ProcessorFunction<AppRef, RenderParams>;

export type PhasePipeline = {
  [Phases.IO]: AppUpdateFunction[];
  [Phases.Update]: AppUpdateFunction[];
  [Phases.Render]: AppRenderFunction[];
  [Phases.Cleanup]: AppRenderFunction[];
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
    [Phases.Cleanup]: [],
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

export function createAppRef(root: HTMLElement): AppRef {
  const document = root.ownerDocument;
  const window = document.defaultView;
  assert(window, "Window object not available for provided root element");

  const rect = root.getBoundingClientRect();

  const layout = createLayout({
    checkboxSize: 32,
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
    slideSpacing: 8,
    slideMaxWidth: 1024,
    slideMaxHeightRatio: 0.25,
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
  };

  const loopState = {
    iteration: 0,
    phase: LoopPhase.Neutral,
  };

  return {
    board: UintXBitSet.empty(16, 65_535),
    dirtyFlags: createFlagManager(AppDirtyFlags.None),
    layout,
    loopState,
    motion: createMotion(),
    owner,
    slides,
  };
}
