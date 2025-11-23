import { type AppRef } from "./app-ref";
import { move } from "./scroll-motion";

/**
 * Describes the virtual state of the slide loop.
 */
export enum LoopOperation {
  None,
  ShiftedUp,
  ShiftedDown,
}

/**
 * Function that manages the logic for a virtualized infinite scroller.
 *
 * @param appRef The complete, current application state for this frame.
 * @returns `true` if the looping state was changed, otherwise `false`.
 */
export function loop(appRef: AppRef): boolean {
  const { motion, layout } = appRef;
  const { contentArea, slideSpacing } = layout;

  const nextOperation = getNextOperation(appRef);
  const previousOperation = getPreviousOperation(appRef);

  if (nextOperation === previousOperation) {
    return false;
  }

  applyShift(appRef, nextOperation);

  const moveDistance = contentArea.height - slideSpacing;

  switch (nextOperation) {
    case LoopOperation.ShiftedUp:
      move(motion, -1 * moveDistance);
      break;
    case LoopOperation.ShiftedDown:
      move(motion, moveDistance);
      break;
  }

  return true;
}

/**
 * An efficient helper that mutates the slides' virtual properties in a single pass.
 */
function applyShift(appRef: AppRef, operation: LoopOperation): void {
  for (const slide of appRef.slides) {
    slide.viewportOffset = 0;
    slide.virtualIndex = slide.realIndex;
  }

  for (let i = 0; i < appRef.slides.length; i++) {
    const slide = appRef.slides[i];

    switch (operation) {
      case LoopOperation.ShiftedDown:
        if (i >= appRef.slides.length - appRef.layout.slideCount.inView) {
          slide.virtualIndex = slide.realIndex - appRef.layout.slideCount.total;
          slide.viewportOffset = -1;
        }
        break;

      case LoopOperation.ShiftedUp:
        if (i < appRef.layout.slideCount.inView) {
          slide.virtualIndex = slide.realIndex + appRef.layout.slideCount.total;
          slide.viewportOffset = 1;
        }
        break;
    }
  }
}

function getNextOperation(appRef: AppRef): LoopOperation {
  const { motion } = appRef;

  const [topLoopBound, bottomLoopBound] = computeLoopBounds(appRef);
  let desiredOperation = LoopOperation.None;

  if (motion.offset > topLoopBound) {
    desiredOperation = LoopOperation.ShiftedUp;
  } else if (motion.offset < bottomLoopBound) {
    desiredOperation = LoopOperation.ShiftedDown;
  }

  return desiredOperation;
}

function getPreviousOperation(appRef: AppRef): LoopOperation {
  const { slides } = appRef;

  if (slides[0].viewportOffset === 1) {
    return LoopOperation.ShiftedDown;
  }

  if (slides[slides.length - 1].viewportOffset === -1) {
    return LoopOperation.ShiftedUp;
  }

  return LoopOperation.None;
}

function computeLoopBounds(appRef: AppRef): [number, number] {
  const { layout } = appRef;
  const { contentArea, viewportRect } = layout;

  const topLoopBound = 0;
  const bottomLoopBound = -contentArea.height + viewportRect.height;

  return [topLoopBound, bottomLoopBound];
}
