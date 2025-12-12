import {
  type Disposable,
  DisposableStoreId,
  TypedEvent,
  createDisposableStore,
  event,
  prevent,
  revert,
} from "../../core";
import { type Axis } from "../axis";
import { type Component } from "../component";
import {
  type GestureEvent,
  type Gesture,
  GestureState,
  GestureType,
  gestureEvent,
} from "./gesture";

export interface WheelGesture extends Component, Gesture {}

const STATIC_LINE_HEIGHT = 16;
const STATIC_PAGE_HEIGHT = 800;

export function createWheelGesture(root: HTMLElement, axis: Axis): WheelGesture {
  /**
   * Returns a reader for the wheel event stream.
   */
  const wheeled = new TypedEvent<GestureEvent>();

  /**
   * @internal
   * Component lifecycle method.
   */
  function init(): Disposable {
    const disposables = createDisposableStore();
    disposables.push(DisposableStoreId.Static, wheeled.clear, event(root, "wheel", onWheel));

    return () => disposables.flushAll();
  }

  /**
   * Handles wheel event.
   */
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

  /**
   * Extracts the primary coordinate value (X or Y) from a wheel event.
   */
  function readPoint(event: WheelEvent): number {
    const property: keyof WheelEvent = `delta${axis.isVertical ? "Y" : "X"}`;
    return event[property];
  }

  return {
    init,
    register: wheeled.register,
  };
}
