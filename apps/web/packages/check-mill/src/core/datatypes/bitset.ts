import { base64ToUint8Array } from "../utils";

/**
 * Bit numbering inside each byte.
 * lsb0: Bit 0 is the least significant bit (2^0).
 * msb0: Bit 0 is the most significant bit (2^7), common in Elixir/Erlang.
 */
export type BitOrder = "lsb0" | "msb0";

/**
 * Options controlling how incoming bytes should be interpreted.
 */
export interface BitSetByteOptions {
  /** The bit order used in the source bytes. */
  bitOrder?: BitOrder;
}

/**
 * Options controlling how a patch operation should be applied.
 */
export interface BitSetPatchOptions {
  /** The bit order used in the source patch payload. */
  bitOrder?: BitOrder;
  /** Optional number of bits to apply from the payload. */
  bitLength?: number;
}

/**
 * A fixed-size bit set backed by a Uint8Array and Uint32Array.
 * Internal bit ordering is always LSB-first for CPU efficiency.
 * Utilizes "Blit" strategies for high-performance real-time updates.
 */
export class BitSet {
  /** Underlying byte storage for granular/unaligned access. */
  private readonly bytes: Uint8Array;

  /** 32-bit view for fast bit-checking and bulk operations. */
  private readonly words: Uint32Array;

  /** Pre-computed lookup table to reverse bits within a byte (MSB0 -> LSB0). */
  private static readonly REVERSE_TABLE = new Uint8Array(256).map((_, i) => {
    let v = i;
    let r = 0;
    for (let b = 0; b < 8; b++) {
      r = (r << 1) | (v & 1);
      v >>>= 1;
    }
    return r;
  });

  /**
   * Constructs a BitSet instance from an ArrayBuffer.
   *
   * @param buffer - The underlying shared buffer.
   */
  private constructor(buffer: ArrayBuffer) {
    this.bytes = new Uint8Array(buffer);
    this.words = new Uint32Array(buffer);
  }

  /**
   * Gets the total number of bits that the bitset can hold.
   * * @returns Total bit count.
   */
  public get totalBits(): number {
    return this.bytes.length * 8;
  }

  /**
   * Gets the total number of bytes in the bitset.
   * * @returns Total byte count.
   */
  public get byteLength(): number {
    return this.bytes.length;
  }

  /**
   * Creates an empty BitSet (all bits cleared).
   * Ensures the underlying buffer is 32-bit aligned for maximum performance.
   *
   * @param bitCount - Total number of bits required.
   * @returns A new BitSet instance.
   * @throws Error if bitCount is negative or not an integer.
   */
  public static fromBitCount(bitCount: number): BitSet {
    if (!Number.isInteger(bitCount) || bitCount < 0) {
      throw new Error("BitSet.fromBitCount: bitCount must be a non-negative integer");
    }
    const byteCount = Math.ceil(bitCount / 32) * 4;
    return new BitSet(new ArrayBuffer(byteCount));
  }

  /**
   * Checks if the bit at the specified index is set.
   * Optimized to use 32-bit word access to reduce memory fetches.
   *
   * @param index - The overall bit index to check.
   * @returns True if the bit is set (1); false otherwise (0).
   */
  public has(index: number): boolean {
    return (this.words[index >>> 5] & (1 << (index & 31))) !== 0;
  }

  /**
   * Sets the bit at the specified index to 1.
   *
   * @param index - The overall bit index to update.
   */
  public set(index: number): void {
    this.words[index >>> 5] |= 1 << (index & 31);
  }

  /**
   * Clears the bit at the specified index (sets to 0).
   *
   * @param index - The overall bit index to update.
   */
  public unset(index: number): void {
    this.words[index >>> 5] &= ~(1 << (index & 31));
  }

  /**
   * Sets or clears the bit at the specified index based on a boolean value.
   *
   * @param index - The overall bit index to update.
   * @param value - True to set the bit to 1; false to clear to 0.
   */
  public setAt(index: number, value: boolean): void {
    const wordIdx = index >>> 5;
    const mask = 1 << (index & 31);
    if (value) {
      this.words[wordIdx] |= mask;
    } else {
      this.words[wordIdx] &= ~mask;
    }
  }

  /**
   * Flips the bit at the specified index (0 becomes 1, 1 becomes 0).
   * Optimized using bitwise XOR on 32-bit words.
   *
   * @param index - The overall bit index to toggle.
   */
  public flip(index: number): void {
    this.words[index >>> 5] ^= 1 << (index & 31);
  }

  /**
   * Replaces the entire content of this bitset with raw bytes.
   * Performs a native memory copy.
   *
   * @param bytes - The source Uint8Array to copy from.
   */
  public copyFromBytes(bytes: Uint8Array): void {
    this.bytes.set(bytes);
  }

  /**
   * Replaces content with bytes interpreted according to the specified bit order.
   * Uses a fast lookup table if conversion from MSB0 is required.
   *
   * @param bytes - Source byte buffer.
   * @param options - Configuration including source bitOrder.
   */
  public copyFromBytesWithOrder(bytes: Uint8Array, options: BitSetByteOptions = {}): void {
    const order = options.bitOrder ?? "lsb0";
    if (order === "msb0") {
      for (let i = 0; i < bytes.length; i++) {
        this.bytes[i] = BitSet.REVERSE_TABLE[bytes[i]];
      }
    } else {
      this.bytes.set(bytes);
    }
  }

  /**
   * Patches a specific region of the bitset using a Base64 payload.
   * Automatically handles bit-alignment and MSB0 normalization.
   *
   * @param startBit - The starting bit index in the bitset to apply the patch.
   * @param base64String - The Base64 encoded payload.
   * @param options - Patch configuration (order, length).
   */
  public patchFromBase64(
    startBit: number,
    base64String: string,
    options: BitSetPatchOptions = {},
  ): void {
    const patchBytes = base64ToUint8Array(base64String);
    const order = options.bitOrder ?? "lsb0";

    if (order === "msb0") {
      for (let i = 0; i < patchBytes.length; i++) {
        patchBytes[i] = BitSet.REVERSE_TABLE[patchBytes[i]];
      }
    }

    const bitOffset = startBit & 7;
    const byteStart = startBit >>> 3;

    if (bitOffset === 0) {
      this.bytes.set(patchBytes, byteStart);
      return;
    }

    this.blitUnaligned(byteStart, bitOffset, patchBytes);
  }

  /**
   * Performs an unaligned bit-block transfer (Blit).
   * Splices source bytes across target byte boundaries using bit-shifting masks.
   * * @param targetByteIdx - Starting byte index in target storage.
   * @param bitOffset - Number of bits to shift (0-7).
   * @param source - The source payload bytes.
   */
  private blitUnaligned(targetByteIdx: number, bitOffset: number, source: Uint8Array): void {
    const invOffset = 8 - bitOffset;
    const mask = (1 << bitOffset) - 1;

    for (let i = 0; i < source.length; i++) {
      const val = source[i];
      const idx = (targetByteIdx + i) % this.bytes.length;
      const nextIdx = (idx + 1) % this.bytes.length;

      this.bytes[idx] = (this.bytes[idx] & mask) | (val << bitOffset);
      this.bytes[nextIdx] = (this.bytes[nextIdx] & (0xff << bitOffset)) | (val >>> invOffset);
    }
  }

  /**
   * Returns a string representation of a range of bits for debugging.
   *
   * @param start - Starting bit index.
   * @param count - Number of bits to include in the string.
   * @returns A string of "1" and "0".
   */
  public toBitString(start = 0, count = 64): string {
    let out = "";
    for (let i = 0; i < count; i++) {
      out += this.has(start + i) ? "1" : "0";
    }
    return out;
  }
}
