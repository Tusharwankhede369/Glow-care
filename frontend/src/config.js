const RAW_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000"

export const BASE_URL = RAW_BASE_URL.endsWith("/") ? RAW_BASE_URL.slice(0, -1) : RAW_BASE_URL