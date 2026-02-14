/**
 * Determines whether the local content should be updated
 * based on the server's version number.
 */
export function shouldUpdate(
  localVersion: number,
  serverVersion: number,
): boolean {
  return serverVersion > localVersion;
}
