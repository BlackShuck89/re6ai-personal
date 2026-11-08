/**
 * Normalize Danbooru API results across server versions.
 *
 * Some endpoints return an array or post object directly, while others wrap
 * the payload under a named key such as "posts" or "post".
 */
export function unwrapResponse<T> (data: unknown, node?: string): T[] {
  if (data === null || data === undefined) return [];

  if (node && !Array.isArray(data) && typeof data === "object"
      && Object.prototype.hasOwnProperty.call(data, node)) {
    data = (data as Record<string, unknown>)[node];
  }

  if (data === null || data === undefined) return [];
  return Array.isArray(data) ? data as T[] : [data as T];
}
