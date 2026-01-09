import {
  type Disposable,
  DisposableStoreId,
  TypedEvent,
  createDisposableStore,
  event,
  prevent,
  revert,
} from "../../core";
import { type Component } from "../component";
import {
  type GestureEvent,
  type Gesture,
  GestureState,
  GestureType,
  gestureEvent,
} from "./gesture";

const STATIC_LINE_HEIGHT = 16;

const STATIC_PAGE_HEIGHT = 800;

export interface WheelGesture extends Component, Gesture {}

export function createWheelGesture(root: HTMLElement): WheelGesture {
  const wheeled = new TypedEvent<GestureEvent>();

  function init(): Disposable {
    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, wheeled.clear, event(root, "wheel", onWheel));

    return () => disposables.flushAll();
  }

  function onWheel(event: WheelEvent) {
    const gEvent = gestureEvent(
      GestureType.Wheel,
      GestureState.Update,
      revert(normalizeDelta(event))
    );
    wheeled.emit(gEvent);

    prevent(event, true);
  }

  function normalizeDelta(event: WheelEvent): number {
    const rawDelta = readPoint(event);

    switch (event.deltaMode) {
      case WheelEvent.DOM_DELTA_LINE:
        return rawDelta * STATIC_LINE_HEIGHT;

      case WheelEvent.DOM_DELTA_PAGE:
        return rawDelta * STATIC_PAGE_HEIGHT;

      case WheelEvent.DOM_DELTA_PIXEL:
      default:
        return rawDelta;
    }
  }

  function readPoint(event: WheelEvent): number {
    return event.deltaY;
  }

  return {
    init,
    register: wheeled.register,
  };
}
