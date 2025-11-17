import type { ProcessorFunction } from "../core";
import { Disposable } from "../core";

/**
 * Defines the per-frame logic for a system, organized by phase.
 *
 * This type maps phase keys (like 'update' or 'render') to a read-only array
 * of processor functions that should be executed during that phase.
 *
 * @template K - The set of valid phase keys.
 * @template T - The type of the application reference.
 * @template P - The type of the payload.
 *
 * @see {@link SystemInstance}
 * @see {@link ProcessorFunction}
 */
export type SystemLogic<K extends PropertyKey, T, P = unknown> = Partial<
  Record<K, ReadonlyArray<ProcessorFunction<T, P>>>
>;

/**
 * Represents the instantiated object of a single system.
 *
 * This is the core object returned by a {@link SystemFactory}. It bundles the
 * system's one-time initialization/teardown logic with its per-frame
 * processing logic.
 *
 * @template K - The set of valid phase keys.
 * @template T - The type of the application reference.
 * @template P - The type of the payload.
 *
 * @see {@link SystemFactory}
 * @see {@link SystemLogic}
 */
export type SystemInstance<K extends PropertyKey, T, P = unknown> = {
  /**
   * A one-time setup function called when the system is initialized.
   *
   * @returns A {@link Disposable} a teardown function.
   */
  readonly init: () => Disposable;

  /**
   * A map of the per-frame processing functions, organized by phase.
   *
   * Phases not included in this record will be skipped during processing.
   * @see {@link SystemLogic}
   */
  readonly logic: SystemLogic<K, T, P>;
};

/**
 * A factory function that creates a {@link SystemInstance}.
 *
 * This is the standard pattern for defining a new system. The factory
 * receives the application reference (`appRef`) and returns the system's
 * instance, which contains its `init` and `logic` properties.
 *
 * @template K - The set of valid phase keys.
 * @template T - The type of the application reference (`appRef`).
 * @template P - The type of the payload passed to processors.
 *
 * @param appRef - A reference to the main application, state, or context.
 * @returns A {@link SystemInstance} object.
 *
 * @see {@link SystemInstance}
 */
export type SystemFactory<K extends PropertyKey, T, P = unknown> = (
  appRef: T
) => SystemInstance<K, T, P>;
