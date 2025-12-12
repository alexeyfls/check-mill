import { wrap } from "../core";
import { type AppRef } from "./app-ref";
import { moveTo } from "./scroll-motion";

/**
 * Represents the virtual shift direction of the loop.
 */
export enum LoopPhase {
  Neutral,
  ShiftedUp,
  ShiftedDown,
}

export interface LoopState {
  /**
   * The number of full cycles the scroll has wrapped around.
   */
  iteration: number;

  /**
   * The last calculated shift phase to prevent redundant updates.
   */
  phase: LoopPhase;
}

/**
 * Main loop entry point.
 *
 * @param appRef - The complete application state.
 */
export function loop(appRef: AppRef): void {
  const didWrap = maintainScrollBounds(appRef);
  updateVirtualConfiguration(appRef, didWrap);
}

/**
 * Checks if the scroll position has exceeded boundaries and wraps it.
 * Updates the `loopIteration` count if a wrap occurs.
 *
 * @returns `true` if a physical wrap (jump) occurred this frame.
 */
function maintainScrollBounds(appRef: AppRef): boolean {
  const { motion, layout, loopState } = appRef;
  const { contentArea, slideSpacing } = layout;

  const topBound = 0;
  const bottomBound = -1 * contentArea.height + slideSpacing;

  const current = motion.current;

  const wrapped = wrap(current, topBound, bottomBound);

  if (Math.abs(current - wrapped) < 0.1) {
    return false;
  }

  if (current < bottomBound) {
    loopState.iteration++;
  } else if (current > topBound) {
    loopState.iteration--;
  }

  moveTo(motion, wrapped);
  return true;
}

/**
 * Updates the virtual identity (index, offset, page) of slides.
 * Optimized to only run when the phase changes or a wrap occurs.
 */
function updateVirtualConfiguration(appRef: AppRef, forceUpdate: boolean): void {
  const { loopState } = appRef;
  const currentPhase = calculateLoopPhase(appRef);

  if (currentPhase === loopState.phase && !forceUpdate) {
    return;
  }

  loopState.phase = currentPhase;
  syncSlidesState(appRef, currentPhase);
}

/**
 * Determines the current virtual shift phase based on scroll position.
 */
function calculateLoopPhase(appRef: AppRef): LoopPhase {
  const { layout, motion } = appRef;

  const midPoint = layout.contentArea.height / 2;

  return Math.abs(motion.current) > midPoint ? LoopPhase.ShiftedDown : LoopPhase.ShiftedUp;
}

/**
 * The core logic that updates every slide's virtual properties in one pass.
 */
function syncSlidesState(appRef: AppRef, phase: LoopPhase): void {
  const { slides, layout, loopState } = appRef;
  const { visible, total } = layout.slideCount;
  const { totalPages } = layout.pagination;

  const iterationOffset = loopState.iteration * total;

  for (const slide of slides) {
    let viewportOffset = 0;
    let virtualIndex = slide.realIndex + iterationOffset;

    if (phase === LoopPhase.ShiftedDown && slide.realIndex < visible) {
      viewportOffset = 1;
      virtualIndex += total;
    } else if (phase === LoopPhase.ShiftedUp && slide.realIndex >= total - visible) {
      viewportOffset = -1;
      virtualIndex -= total;
    }

    slide.viewportOffset = viewportOffset;
    slide.virtualIndex = virtualIndex;

    slide.pageIndex = wrap(virtualIndex, 0, totalPages - 1);
  }
}
