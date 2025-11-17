import type { AppSystemFactory } from "../components";
import { noop } from "../core";

export const NetworkSystem: AppSystemFactory = (_appRef) => {
  return {
    init: () => noop,
    logic: {},
  };
};
