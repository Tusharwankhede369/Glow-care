import { BASE_URL } from "../config"

/**
 * Resolve product/media paths from the API to a full URL.
 * Handles absolute URLs, /uploads/... paths, and relative paths.
 */
export function resolveMediaUrl(path) {
  if (path == null || path === "") return "/placeholder.svg"
  const p = String(path).trim()
  if (!p) return "/placeholder.svg"
  if (p.startsWith("http://") || p.startsWith("https://")) return p
  const normalized = p.startsWith("/") ? p : `/${p}`
  return `${BASE_URL}${normalized}`
}

export function getPrimaryMedia(item) {
  if (!item) return ""
  return item.primaryImage || item.image || item.images?.[0] || ""
}
