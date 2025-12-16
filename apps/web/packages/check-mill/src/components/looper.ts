import { wrap } from "../core";
import type { AppRef } from "./app-ref";
import { moveTo } from "./scroll-motion";

export enum LoopPhase {
  Neutral,
  ShiftedUp,
  ShiftedDown,
}

export interface LoopState {
  iteration: number;
  phase: LoopPhase;
}

export function loop(appRef: AppRef): void {
  const didWrap = maintainScrollBounds(appRef);
  updateVirtualConfiguration(appRef, didWrap);
}

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

function updateVirtualConfiguration(appRef: AppRef, forceUpdate: boolean): void {
  const { loopState } = appRef;
  const currentPhase = calculateLoopPhase(appRef);

  if (currentPhase === loopState.phase && !forceUpdate) {
    return;
  }

  loopState.phase = currentPhase;
  syncSlidesState(appRef, currentPhase);
}

function calculateLoopPhase(appRef: AppRef): LoopPhase {
  const { layout, motion } = appRef;

  const midPoint = layout.contentArea.height / 2;

  return Math.abs(motion.current) > midPoint ? LoopPhase.ShiftedDown : LoopPhase.ShiftedUp;
}

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
