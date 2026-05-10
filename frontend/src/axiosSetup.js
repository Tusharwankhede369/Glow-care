import axios from "axios"
import { BASE_URL } from "./config"

/**
 * Shop JWT (`token`) and Admin JWT (`adminToken`) both live in localStorage.
 * Global `axios.defaults.Authorization` was always set to the shopper token,
 * so every `/admin/*` request sent the wrong Bearer token → 403 / failed analytics.
 * This interceptor picks the correct token from the request URL.
 */
function absoluteUrl(config) {
  const u = config.url || ""
  if (!u) return ""
  if (u.startsWith("http")) return u
  const base = config.baseURL || BASE_URL
  const path = u.startsWith("/") ? u : `/${u}`
  return `${base.replace(/\/$/, "")}${path}`
}

axios.interceptors.request.use((config) => {
  const abs = absoluteUrl(config)
  const isPublicAdmin =
    abs.includes("/admin/login") ||
    abs.includes("/admin/register")

  if (isPublicAdmin) {
    delete config.headers.Authorization
    return config
  }

  const useAdminToken = abs.includes("/admin/")
  const token = useAdminToken ? localStorage.getItem("adminToken") : localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})
