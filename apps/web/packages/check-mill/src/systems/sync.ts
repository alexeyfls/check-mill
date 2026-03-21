import {
  AppRef,
  AppSystemInstance,
  GlobalSnapshotBegin,
  GlobalSnapshotChunk,
  PatchBatch,
  Phases,
  WindowSnapshot,
} from "../components";
import {
  base64ToUint8Array,
  concatUint8Arrays,
  createDisposableStore,
  Disposable,
  DisposableStoreId,
  gunzipInBrowser,
} from "../core";

export function SyncSystem(appRef: AppRef): AppSystemInstance {
  let expectedChunks = 0;
  let chunkBuffer: Uint8Array[] = [];

  const patcheQueue: PatchBatch["patches"] = [];
  const windowSnapshotQueue: WindowSnapshot[] = [];

  function init(): Disposable {
    const gateway = appRef.gateway;
    const disposables = createDisposableStore();

    disposables.push(
      DisposableStoreId.Static,
      gateway.snapshotBegin.register(onSnapshotStart),
      gateway.snapshotChunk.register(onChunkReceived),
      gateway.snapshotDone.register(onSnapshotComplete),
      gateway.patchBatch.register(ingestPatches),
      gateway.windowSnapshot.register(stageViewSnapshot),
    );

    return disposables.flushAll;
  }

  function onSnapshotStart(payload: GlobalSnapshotBegin): void {
    expectedChunks = payload.chunks;
    chunkBuffer.length = 0;
  }

  function onChunkReceived(payload: GlobalSnapshotChunk): void {
    chunkBuffer.push(base64ToUint8Array(payload.b64));
  }

  function onSnapshotComplete(): void {
    hydrateBoard(chunkBuffer);

    expectedChunks = 0;
    chunkBuffer.length = 0;
  }

  function ingestPatches(batch: PatchBatch): void {
    for (const patch of batch.patches) {
      patcheQueue.push(patch);
    }
  }

  function stageViewSnapshot(snapshot: WindowSnapshot): void {
    windowSnapshotQueue.push(snapshot);
  }

  function commitPatchQueue(app: AppRef): void {
    for (const [index, value] of patcheQueue) {
      Boolean(value) ? app.board.set(index) : app.board.unset(index);
    }

    patcheQueue.length = 0;
  }

  function synchronizeViews(app: AppRef): void {
    for (const { pos, bits_b64 } of windowSnapshotQueue) {
      app.board.patchFromBase64(pos, bits_b64);
    }

    windowSnapshotQueue.length = 0;
  }

  async function hydrateBoard(chunks: Uint8Array[]): Promise<void> {
    const gzBytes = concatUint8Arrays(chunks);
    const rawBytes = await gunzipInBrowser(gzBytes);

    appRef.board.copyFromBytes(rawBytes);
  }

  return {
    init,
    logic: {
      [Phases.IO]: [commitPatchQueue, synchronizeViews],
    },
  };
}
