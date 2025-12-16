import type { Disposable } from "../core";

export interface Component {
  init(): Disposable;
}
