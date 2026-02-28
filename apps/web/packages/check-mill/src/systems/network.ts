import { Phases, type AppRef, type AppSystemInstance } from "../components";
import type { Disposable } from "../core";

import { Socket } from "phoenix";

export function NetworkSystem(_appRef: AppRef): AppSystemInstance {
  function init(): Disposable {
    const socket = new Socket("ws://localhost:4000/view/websocket?vsn=2.0.0", {});

    socket.connect();

    return () => socket.disconnect();
  }

  return {
    init,
    logic: {
      [Phases.IO]: [],
      [Phases.Cleanup]: [],
    },
  };
}
