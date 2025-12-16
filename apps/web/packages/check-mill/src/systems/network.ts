import type { AppRef, AppSystemInstance } from "../components";
import { noop } from "../core";

export function NetworkSystem(_appRef: AppRef): AppSystemInstance {
  return {
    init: () => noop,
    logic: {},
  };
}
