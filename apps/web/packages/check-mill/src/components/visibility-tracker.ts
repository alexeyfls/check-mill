import { type Disposable, DisposableStoreId, createDisposableStore } from "../core";
import { type Component } from "./component";

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
  index: number;
  change: VisibilityChange.Entered | VisibilityChange.Exited;
};

export interface VisibilityTrackerType extends Component {
  takeRecords(): VisibilityRecord[];
}

export function createVisibilityTracker(
  root: HTMLElement,
  elementsToTrack: HTMLElement[]
): VisibilityTrackerType {
  const elementCount = elementsToTrack.length;
  const lastRecords = new Uint8Array(elementCount).fill(VisibilityState.Hidden);
  const currentRecords = new Uint8Array(elementCount).fill(VisibilityState.Hidden);

  function init(): Disposable {
    const observer = new IntersectionObserver(handleIntersection, {
      root,
      threshold: 0,
    });

    for (let i = 0; i < elementCount; i++) {
      const element = elementsToTrack[i];
      element.setAttribute("data-vi", i.toString());
      observer.observe(element);
    }

    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, () => observer.disconnect());

    return () => disposables.flushAll();
  }

  function takeRecords(): VisibilityRecord[] {
    const changedRecords: VisibilityRecord[] = [];

    for (let i = 0; i < elementCount; i++) {
      const diff = currentRecords[i] - lastRecords[i];
      const changed = diff === VisibilityChange.Entered || diff === VisibilityChange.Exited;

      if (!changed) continue;

      changedRecords.push({
        index: i,
        change: diff,
      });
    }

    lastRecords.set(currentRecords);
    return changedRecords;
  }

  function handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const { target, isIntersecting } of entries) {
      const index = parseInt(target.getAttribute("data-vi")!, 10);

      if (!isNaN(index)) {
        currentRecords[index] = isIntersecting ? VisibilityState.Visible : VisibilityState.Hidden;
      }
    }
  }

  return { init, takeRecords };
}
