import { type Disposable } from "../core";
import { type Component } from "./component";
import { Slide, SlidesCollectionType } from "./slides";

export const enum VisibilityState {
  Hidden = 1,
  Visible = 2,
}

export const enum VisibilityChange {
  Exited = -1,
  NoChange = 0,
  Entered = 1,
}

export type VisibilityRecord = {
  slide: Slide;
  change: VisibilityChange.Entered | VisibilityChange.Exited;
};

export interface VisibilityTrackerType extends Component {
  takeRecords(): VisibilityRecord[];
  getVisibleSlides(): SlidesCollectionType;
  getFirstVisibleSlide(): Slide | null;
}

export function createVisibilityTracker(
  root: HTMLElement,
  slides: SlidesCollectionType,
): VisibilityTrackerType {
  const elementCount = slides.length;
  const lastRecords = new Uint8Array(elementCount).fill(VisibilityState.Hidden);
  const currentRecords = new Uint8Array(elementCount).fill(VisibilityState.Hidden);

  function init(): Disposable {
    const observer = new IntersectionObserver(handleIntersection, {
      root,
      threshold: 0,
    });

    for (const slide of slides) {
      slide.nativeElement.setAttribute("data-vi", slide.realIndex.toString());
      observer.observe(slide.nativeElement);
    }

    return () => observer.disconnect();
  }

  function takeRecords(): VisibilityRecord[] {
    const records: VisibilityRecord[] = [];

    for (let i = 0; i < elementCount; i++) {
      const diff = currentRecords[i] - lastRecords[i];
      if (diff === 0) continue;

      records.push({
        slide: slides[i],
        change: diff as VisibilityChange.Entered | VisibilityChange.Exited,
      });
    }

    lastRecords.set(currentRecords);
    return records;
  }

  function getVisibleSlides(): SlidesCollectionType {
    const visible: Slide[] = [];
    for (let i = 0; i < elementCount; i++) {
      if (currentRecords[i] === VisibilityState.Visible) {
        visible.push(slides[i]);
      }
    }
    return visible;
  }

  function getFirstVisibleSlide(): Slide | null {
    let first: Slide | null = null;

    for (let i = 0; i < elementCount; i++) {
      if (currentRecords[i] === VisibilityState.Visible) {
        const slide = slides[i];
        if (!first || slide.virtualIndex < first.virtualIndex) {
          first = slide;
        }
      }
    }
    return first;
  }

  function handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const idxStr = entry.target.getAttribute("data-vi");
      if (idxStr === null) continue;

      const index = parseInt(idxStr, 10);
      currentRecords[index] = entry.isIntersecting
        ? VisibilityState.Visible
        : VisibilityState.Hidden;
    }
  }

  return { init, takeRecords, getVisibleSlides, getFirstVisibleSlide };
}
