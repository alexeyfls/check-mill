import { type Disposable } from "../core";

export interface Component {
  /**
   * Called after all components/resources are registered.
   */
  init(): Disposable;
}
