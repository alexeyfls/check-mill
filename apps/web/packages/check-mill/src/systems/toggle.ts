import type { AppRef, AppSystemInstance } from "../components";
import { Phases, Dataset } from "../components";
import type { Disposable, LoopParams } from "../core";
import { DisposableStoreId, createDisposableStore, event } from "../core";

export function ToggleSystem(appRef: AppRef): AppSystemInstance {
  const toggleQueue: number[] = [];
  const disposables = createDisposableStore();
  const itemsPerSlide = appRef.layout.pagination.itemsPerSlide;

  function init(): Disposable {
    disposables.push(
      DisposableStoreId.Static,
      event(appRef.owner.root, "click", handleToggle),
      () => (toggleQueue.length = 0),
    );

    return () => disposables.flushAll();
  }

  function processToggles(app: AppRef, _params: LoopParams): void {
    if (toggleQueue.length === 0) return;

    for (const toggle of toggleQueue) {
      app.board.flip(toggle);
    }

    toggleQueue.length = 0;
  }

  function handleToggle(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const parent = target.closest(`[data-${Dataset.SLIDE_INDEX}]`) as HTMLElement;

    if (!parent) {
      return;
    }

    const slideIndex = parseInt(parent.dataset[Dataset.SLIDE_INDEX] ?? "");
    const checkboxIndex = parseInt(target.dataset[Dataset.CHECKBOX_INDEX] ?? "");

    if (Number.isInteger(slideIndex) && Number.isInteger(checkboxIndex)) {
      const index = slideIndex * itemsPerSlide + checkboxIndex;
      toggleQueue.push(index);
    }
  }

  return {
    init,
    logic: {
      [Phases.IO]: [processToggles],
    },
  };
}
