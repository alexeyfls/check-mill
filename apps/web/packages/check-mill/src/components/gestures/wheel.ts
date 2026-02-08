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

const LINE_HEIGHT = 40;
const PAGE_HEIGHT_FALLBACK = 800;

export interface WheelGesture extends Component, Gesture {}

export function createWheelGesture(root: HTMLElement): WheelGesture {
  const disposables = createDisposableStore();
  const wheeled = new TypedEvent<GestureEvent>();

  const DeltaMultiplier = {
    [WheelEvent.DOM_DELTA_LINE]: LINE_HEIGHT,
    [WheelEvent.DOM_DELTA_PAGE]: root.clientHeight || PAGE_HEIGHT_FALLBACK,
    [WheelEvent.DOM_DELTA_PIXEL]: 1,
  } as const;

  function init(): Disposable {
    disposables.push(
      DisposableStoreId.Static,
      wheeled.clear,
      event(root, "wheel", onWheel, { passive: false }),
    );

    return () => disposables.flushAll();
  }

  function onWheel(event: WheelEvent) {
    prevent(event, true);

    // @ts-ignore
    const multiplier = DeltaMultiplier[event.deltaMode] ?? 1;
    const delta = readPoint(event) * multiplier;

    wheeled.emit(gestureEvent(GestureType.Wheel, GestureState.Update, revert(delta)));
  }

  function readPoint(event: WheelEvent): number {
    return event.deltaY;
  }

  return {
    init,
    register: wheeled.register,
  };
}
