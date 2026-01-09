/**
 * The public interface for the flag manager.
 */
export interface BitwiseFlags {
  /**
   * Checks if one or more flags are currently set.
   * @param flag The flag(s) to check.
   * @returns True if all specified flags are set.
   */
  is(flag: number): boolean;

  /**
   * Sets one or more flags to ON.
   * @param flag The flag(s) to set.
   */
  set(flag: number): number;

  /**
   * Unsets one or more flags (turns them OFF).
   * @param flag The flag(s) to unset.
   */
  unset(flag: number): number;

  /**
   * Toggles the state of one or more flags.
   * If a flag is ON, it will be turned OFF. If it's OFF, it will be turned ON.
   * @param flag The flag(s) to toggle.
   */
  toggle(flag: number): number;

  /**
   * Returns the current raw integer value of all flags.
   */
  getValue(): number;

  /**
   * Resets all flags to a specific value, defaulting to None (0).
   */
  reset(value?: number): number;
}

/**
 * Creates a manager for handling bitwise flags.
 * @param initialFlags The starting value for the flags. Defaults to 0.
 */
export function createFlagManager(initialFlags = 0): BitwiseFlags {
  let dirtyFlags = initialFlags;

  function is(flag: number): boolean {
    return (dirtyFlags & flag) === flag;
  }

  function set(flag: number): number {
    return (dirtyFlags |= flag);
  }

  function unset(flag: number): number {
    return (dirtyFlags &= ~flag);
  }

  function toggle(flag: number): number {
    return (dirtyFlags ^= flag);
  }

  function getValue(): number {
    return dirtyFlags;
  }

  function reset(value = 0): number {
    return (dirtyFlags = value);
  }

  return {
    is,
    set,
    unset,
    toggle,
    getValue,
    reset,
  };
}
