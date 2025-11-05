import { type AppRef, Phases } from "../components";
import { type ProcessorFunction, type TimeParams } from "../core";
import { Disposable } from "../core";

/**
 * Defines the processing functions for each engine phase.
 * This is a map where each key is a phase name (e.g., "Update", "Render")
 * and the value is the list of functions to run for that phase.
 */
type PhaseProcessors<T, P = unknown> = {
  [phase in Phases]?: ProcessorFunction<T, P>[];
};

/**
 * Defines the core components of a system:
 * its setup/teardown lifecycle and its per-frame processing logic.
 */
export type SystemDefinition<T, P = unknown> = {
  /**
   * One-time setup function that returns a teardown function (Disposable).
   * This is called once when the system is added.
   */
  init: () => Disposable;
  /**
   * Provides the per-frame processing functions, grouped by phase.
   */
  logic: PhaseProcessors<T, P>;
};

/**
 * A factory function that initializes and returns a SystemDefinition.
 * It receives the application reference (`appRef`) to access shared state
 * or services needed by the system's init or logic functions.
 */
export type SystemInitializer<T, P = unknown> = (appRef: T) => SystemDefinition<T, P>;

/**
 * A specialized SystemInitializer for this specific application's state.
 */
export type AppSystemInitializer = SystemInitializer<AppRef, TimeParams>;