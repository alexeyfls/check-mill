/**
 * Decompresses a gzip-compressed byte array in the browser.
 *
 * @param bytes - Gzip-compressed bytes to decompress.
 * @returns A Uint8Array containing the decompressed bytes.
 */
export async function gunzipInBrowser(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as any]).stream().pipeThrough(new DecompressionStream("gzip"));
  const buffer = await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

/**
 * Concatenates multiple Uint8Array chunks into a single Uint8Array.
 *
 * @param chunks - Array of Uint8Array chunks.
 * @returns A Uint8Array containing all chunks in order.
 */
export function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);

  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Converts a base64-encoded string into a Uint8Array.
 *
 * @param base64 - The base64-encoded string to decode.
 * @returns A Uint8Array containing the decoded bytes.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/**
 * Converts the supplied typed array into a base64-encoded string.
 *
 * @param array - The typed array to encode.
 * @returns Base64 encoded string representing the array.
 */
export function base64String(array: Uint8Array | Uint16Array | Uint32Array): string {
  const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  return btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), ""));
}
