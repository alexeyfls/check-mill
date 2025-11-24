import { type AppRef } from "./app-ref";
import { moveTo } from "./scroll-motion";

/**
 * Describes the virtual state of the slide loop (the direction of the shift).
 * 'None' is used primarily for initialization.
 */
export enum LoopOperation {
  None,
  ShiftedUp,
  ShiftedDown,
}

/**
 * Global state to track the last applied loop operation.
 * This is an optimization to prevent redundant virtual slide updates
 * when the desired shift state has not changed.
 */
let previousOperation = LoopOperation.None;

/**
 * Manages the logic for a virtualized infinite scroller.
 *
 * @param appRef The complete, current application state for this frame.
 */
export function loop(appRef: AppRef): void {
  resetScrollPosition(appRef);
  updateSlideVirtualState(appRef);
}

/**
 * Resets the physical scroll position back into the defined range [moveDistance, 0].
 * This operation is critical for hiding the loop mechanism and must occur before
 * updating the virtual slide state to prevent visual flickering.
 */
function resetScrollPosition(appRef: AppRef): void {
  const { motion, layout } = appRef;
  const { contentArea, slideSpacing } = layout;

  const moveDistance = -1 * contentArea.height + slideSpacing;
  moveTo(motion, wrapPosition(motion.current, 0, moveDistance));
}

/**
 * Updates the slides' virtual properties (virtualIndex and viewportOffset)
 * based on the current physical scroll position.
 *
 * @param appRef The complete, current application state.
 */
function updateSlideVirtualState(appRef: AppRef): void {
  const desiredOperation = calculateLoopOperation(appRef);

  if (desiredOperation === previousOperation) return;

  previousOperation = desiredOperation;

  initializeSlideVirtualState(appRef);

  switch (desiredOperation) {
    case LoopOperation.ShiftedUp:
      applyShiftUp(appRef);
      break;

    case LoopOperation.ShiftedDown:
      applyShiftDown(appRef);
      break;
  }
}

/**
 * Initializes the virtual state for all slides to their real (non-shifted) position.
 * This is the baseline state before any virtual wrapping is applied.
 */
function initializeSlideVirtualState(appRef: AppRef): void {
  for (const slide of appRef.slides) {
    slide.viewportOffset = 0;
    slide.virtualIndex = slide.realIndex;
  }
}

/**
 * Determines whether the slides should be virtually shifted up or down.
 * The shift is triggered when the scroll position moves past the "midpoint"
 * of the scrollable content area.
 *
 * @returns The required loop operation.
 */
function calculateLoopOperation(appRef: AppRef): LoopOperation {
  const { layout, motion } = appRef;
  const midPosition = layout.contentArea.height / 2;

  return Math.abs(motion.current) > midPosition
    ? LoopOperation.ShiftedDown
    : LoopOperation.ShiftedUp;
}

/**
 * Applies the virtual shift logic for a "ShiftedUp" operation.
 * This shifts the slides at the end of the array to the virtual start.
 */
function applyShiftUp(appRef: AppRef): void {
  const { slides, layout } = appRef;
  const numToWrap = layout.slideCount.inView;
  const totalSlides = layout.slideCount.total;

  slides.slice(slides.length - numToWrap).forEach((slide) => {
    slide.virtualIndex = slide.realIndex - totalSlides;
    slide.viewportOffset = -1;
  });
}

/**
 * Applies the virtual shift logic for a "ShiftedDown" operation.
 * This shifts the slides at the beginning of the array to the virtual end.
 */
function applyShiftDown(appRef: AppRef): void {
  const { slides, layout } = appRef;
  const numToWrap = layout.slideCount.inView;
  const totalSlides = layout.slideCount.total;

  slides.slice(0, numToWrap).forEach((slide) => {
    slide.virtualIndex = slide.realIndex + totalSlides;
    slide.viewportOffset = 1;
  });
}

function wrapPosition(x: number, min: number, max: number): number {
  const length = max - min;
  return ((((x - min) % length) + length) % length) + min;
}
