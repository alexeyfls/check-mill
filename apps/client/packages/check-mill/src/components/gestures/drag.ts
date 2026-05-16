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
const HISTORY_MAX_AGE = 80; // ms
const VELOCITY_CONVERSION = 1000; // ms to s

interface MoveSample {
  time: number;
  coord: number;
}

export interface DragGesture extends Component, Gesture {}

export function createDragGesture(root: HTMLElement): DragGesture {
  const ownerDocument = root.ownerDocument;
  const disposables = createDisposableStore();
  const dragged = new TypedEvent<GestureEvent>();

  let startEvent: PointerEvent | null = null;
  let lastEvent: PointerEvent | null = null;
  let moveHistory: MoveSample[] = [];
  let isDraggingThresholdMet = false;

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
    moveHistory = [{ time: readTime(event), coord: readPoint(event) }];
    isDraggingThresholdMet = false;

    ownerDocument.body.classList.add("is-dragging");
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    dragged.emit(gestureEvent(GestureType.Drag, GestureState.Initialize, 0));
    attachTemporalEvents();
  }

  function onPointerMove(event: PointerEvent): void {
    if (!lastEvent || !startEvent) return;
    prevent(event, true);

    const currentCoord = readPoint(event);
    const currentTime = readTime(event);
    const diff = currentCoord - readPoint(lastEvent);

    if (
      !isDraggingThresholdMet &&
      Math.abs(currentCoord - readPoint(startEvent)) > DRAG_THRESHOLD
    ) {
      isDraggingThresholdMet = true;
    }

    moveHistory.push({ time: currentTime, coord: currentCoord });

    const horizon = currentTime - HISTORY_MAX_AGE;
    while (moveHistory.length > 0 && moveHistory[0].time < horizon) {
      moveHistory.shift();
    }

    lastEvent = event;
    dragged.emit(gestureEvent(GestureType.Drag, GestureState.Update, diff));
  }

  function onPointerUp(event: PointerEvent): void {
    const velocity = calculateFinalVelocity(readTime(event));

    dragged.emit(gestureEvent(GestureType.Drag, GestureState.Finalize, velocity));

    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    ownerDocument.body.classList.remove("is-dragging");
    disposables.flush(DisposableStoreId.Temporal);

    startEvent = null;
    lastEvent = null;
    moveHistory = [];
  }

  function onMouseClick(event: MouseEvent): void {
    if (isDraggingThresholdMet) {
      prevent(event, true);
    }
  }

  function attachTemporalEvents(): void {
    disposables.push(
      DisposableStoreId.Temporal,
      event(root, "pointermove", onPointerMove),
      event(root, "pointerup", onPointerUp),
      event(root, "pointerout", onPointerUp),
      event(root, "pointerleave", onPointerUp),
      event(root, "pointercancel", onPointerUp),
    );
  }

  function calculateFinalVelocity(endTime: number): number {
    if (moveHistory.length < 2) return 0;

    const first = moveHistory[0];
    const last = moveHistory[moveHistory.length - 1];

    if (endTime - last.time > HISTORY_MAX_AGE) return 0;

    const deltaDist = last.coord - first.coord;
    const deltaTime = last.time - first.time;

    return deltaTime > 0 ? (deltaDist / deltaTime) * VELOCITY_CONVERSION : 0;
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
