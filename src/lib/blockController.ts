// Utilities for working with content blocks.
// The config_json field stores arbitrary flags that control behaviour of a block.
//
// Current code simply serialises any provided flags object into JSON so that
// additional keys can be added without code changes.
//
// Possible future flags (not currently implemented) include:
// - skippableAfterMinutes: number  // allow skipping block after given minutes
// - requireCompletion: boolean     // whether block completion is mandatory
//
// These are documented here so that developers know the intended extension points.

export interface Block {
  id: string;
  /**
   * Raw JSON string representing configuration flags.  This will be persisted
   * to the database and should contain any arbitrary key/value pairs provided
   * by editors.
   */
  config_json: string | null;
}

/**
 * Normalise an incoming flags value to a JSON string suitable for storage in
 * `config_json`.
 *
 * The function accepts:
 * - an object containing arbitrary keys
 * - a JSON string
 * - `null` or `undefined` meaning no configuration
 *
 * If the value is a string it will be parsed to ensure it is valid JSON before
 * being re-stringified to avoid inconsistent spacing or ordering.
 */
export function parseFlags(flags: unknown): string | null {
  if (flags == null) {
    return null;
  }

  if (typeof flags === "string") {
    const parsed = JSON.parse(flags);
    return JSON.stringify(parsed);
  }

  if (typeof flags === "object") {
    return JSON.stringify(flags as Record<string, unknown>);
  }

  throw new Error("Invalid flags: must be object or JSON string");
}

/**
 * Update a block's configuration with the provided flags and return the new
 * block object.
 */
export function updateBlockConfig(block: Block, flags: unknown): Block {
  return { ...block, config_json: parseFlags(flags) };
}
