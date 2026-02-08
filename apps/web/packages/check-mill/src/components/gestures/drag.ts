import {
  type Disposable,
  DisposableStoreId,
  TypedEvent,
  createDisposableStore,
  event,
  prevent,
} from "../../core";
import { type Component } from "../component";
import {
  type Gesture,
  type GestureEvent,
  GestureState,
  GestureType,
  gestureEvent,
} from "./gesture";

const DRAG_THRESHOLD = 8;

const HISTORY_MAX_AGE = 80;

interface MoveSample {
  time: number;
  coord: number;
}

export interface DragGesture extends Component, Gesture {}

export function createDragGesture(root: HTMLElement): DragGesture {
  let startEvent: PointerEvent;

  let lastEvent: PointerEvent;

  let preventClick: boolean = false;

  const ownerDocument = root.ownerDocument;

  const disposables = createDisposableStore();

  const dragged = new TypedEvent<GestureEvent>();

  let moveHistory: MoveSample[] = [];

  function init(): Disposable {
    disposables.push(
      DisposableStoreId.Static,
      dragged.clear,
      event(root, "pointerdown", onPointerDown),
      event(root, "click", onMouseClick, { capture: true }),
    );

    return () => disposables.flushAll();
  }

  function onPointerDown(event: PointerEvent): void {
    prevent(event, true);

    lastEvent = event;
    startEvent = event;
    preventClick = false;
    const gEvent = gestureEvent(GestureType.Drag, GestureState.Initialize, 0);

    ownerDocument.body.classList.add("is-dragging");
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    dragged.emit(gEvent);
    addDragEvents();
  }

  function onPointerMove(event: PointerEvent): void {
    prevent(event, true);

    const currentCoord = readPoint(event);
    const currentTime = readTime(event);
    const diff = currentCoord - readPoint(lastEvent);

    moveHistory.push({ time: currentTime, coord: currentCoord });

    const horizon = currentTime - HISTORY_MAX_AGE;
    while (moveHistory.length > 0 && moveHistory[0].time < horizon) {
      moveHistory.shift();
    }

    if (Math.abs(currentCoord - readPoint(startEvent)) > DRAG_THRESHOLD) {
      preventClick = true;
    }

    lastEvent = event;
    const gEvent = gestureEvent(GestureType.Drag, GestureState.Update, diff);
    dragged.emit(gEvent);
  }

  function onPointerUp(event: PointerEvent): void {
    const velocityPxMs = computeSampledVelocity(event);
    const velocityPxS = velocityPxMs * 1000;
    const gEvent = gestureEvent(GestureType.Drag, GestureState.Finalize, velocityPxS);

    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    dragged.emit(gEvent);

    moveHistory = [];
    ownerDocument.body.classList.remove("is-dragging");
    disposables.flush(DisposableStoreId.Temporal);
  }

  function onMouseClick(event: MouseEvent): void {
    if (preventClick) {
      prevent(event, true);
    }
  }

  function addDragEvents(): void {
    disposables.push(
      DisposableStoreId.Temporal,
      event(root, "pointermove", onPointerMove),
      event(root, "pointerup", onPointerUp),
      event(root, "pointerout", onPointerUp),
      event(root, "pointerleave", onPointerUp),
      event(root, "pointercancel", onPointerUp),
    );
  }

  function computeSampledVelocity(event: PointerEvent): number {
    if (moveHistory.length < 2) return 0;

    const now = readTime(event);
    const horizon = now - HISTORY_MAX_AGE;

    const samples = moveHistory.filter((s) => s.time > horizon);
    if (samples.length < 2) return 0;

    const first = samples[0];
    const last = samples[samples.length - 1];

    const deltaDist = last.coord - first.coord;
    const deltaTime = last.time - first.time;

    return deltaTime > 0 ? deltaDist / deltaTime : 0;
  }

  function readPoint(event: PointerEvent): number {
    return event.clientY;
  }

  function readTime(event: Event): number {
    return event.timeStamp;
  }

  return {
    init,
    register: dragged.register,
  };
}
