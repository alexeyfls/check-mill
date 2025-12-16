import {
  type Disposable,
  type EventReader,
  DisposableStoreId,
  TypedEvent,
  createDisposableStore,
} from "../core";
import { type Component } from "./component";

export interface ViewportType extends Component {
  resized: EventReader<DOMRect>;
  measure(): DOMRect;
}

export function createViewport(root: HTMLElement): ViewportType {
  let memoRect: DOMRect = root.getBoundingClientRect();

  const resized = new TypedEvent<DOMRect>();

  function init(): Disposable {
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(root);

    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, resized.clear, () => resizeObserver.disconnect());

    return () => disposables.flushAll();
  }

  function measure(): DOMRect {
    return memoRect;
  }

  function onResize(): void {
    memoRect = root.getBoundingClientRect();
    resized.emit(memoRect);
  }

  return {
    init,
    measure,
    resized,
  };
}
