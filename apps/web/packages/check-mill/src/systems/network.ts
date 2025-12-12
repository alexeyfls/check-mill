import type { AppRef, AppSystemInstance } from "../components";
import { noop } from "../core";

export const NetworkSystem = (_appRef: AppRef): AppSystemInstance => ({
  init: () => noop,
  logic: {},
});
