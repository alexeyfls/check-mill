/**
 * A unique identifier for a phase, used for ordering.
 */
export type PhaseIdentifier = number;

/**
 * The basic unit of work
 *
 * @template T The type of the shared data object.
 * @template P The type of the optional extra argument.
 */
export type ProcessorFunction<T, P = unknown> = (data: T, params: P) => void;

/**
 * A simple object representing a phase of execution.
 */
export interface Phase<T, P> {
  readonly phase: PhaseIdentifier;
  readonly functions: ReadonlyArray<ProcessorFunction<T, P>>;
}

let execIdx = 0;

/**
 * Creates a Phase configuration object.
 *
 * @param phase The identifier for this phase.
 * @param functions An array of functions to be executed for this phase.
 * @returns An immutable Phase configuration object.
 */
export function createPhase<T, P = unknown>(
  phase: PhaseIdentifier,
  functions: ProcessorFunction<T, P>[]
): Phase<T, P> {
  return {
    phase,
    functions: Object.freeze([...functions]),
  };
}

/**
 * Chains multiple ProcessorFunctions into a single one.
 *
 * @param funcs The array of functions to chain.
 * @returns A single, combined ProcessorFunction.
 */
export function chainProcessors<T, P = unknown>(
  funcs: readonly ProcessorFunction<T, P>[]
): ProcessorFunction<T, P> {
  return (data: T, params: P): void => {
    for (execIdx = 0; execIdx >= 0 && execIdx < funcs.length; execIdx += 1) {
      funcs[execIdx](data, params);
    }

    execIdx = 0;
  };
}

/**
 * A helper function that wraps a *single* ProcessorFunction with a condition.
 *
 * @param predicate A standard boolean function to check the condition.
 * @param fnToRun The ProcessorFunction to run if the predicate is true.
 * @returns A new ProcessorFunction that includes the conditional logic.
 */
export function runIf<T, P = unknown>(
  predicate: (data: T, params: P) => boolean,
  fnToRun: ProcessorFunction<T, P>
): ProcessorFunction<T, P> {
  return (data: T, params: P): void => (predicate(data, params) ? fnToRun(data, params) : void 0);
}

export function skipPhaseIf<T, P = unknown>(
  predicate: (data: T, params: P) => boolean
): ProcessorFunction<T, P> {
  return (data: T, params: P): void => {
    predicate(data, params) && (execIdx = -2);
  };
}

/**
 * Creates an executable ProcessorFunction for a *single phase*.
 *
 * This function now just chains all functions in the phase.
 *
 * @param phase The Phase configuration object.
 * @returns A ProcessorFunction that executes the logic for this single phase.
 */
export function createPhaseRunner<T, P = unknown>(phase: Phase<T, P>): ProcessorFunction<T, P> {
  return chainProcessors(phase.functions);
}

/**
 * Creates a master ProcessorFunction from multiple phases.
 *
 * @param phases An array of Phase configuration objects.
 * @returns A single, master ProcessorFunction that runs all phases in order.
 */
export function createMergedRunner<T, P = unknown>(phases: Phase<T, P>[]): ProcessorFunction<T, P> {
  const phaseRunners = [...phases].sort((a, b) => a.phase - b.phase).map(createPhaseRunner);
  return chainProcessors(phaseRunners);
}
