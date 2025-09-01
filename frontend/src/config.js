// frontend/src/config.js

// Use environment variable if available, otherwise fallback to localhost
export const BASE_URL =
  process.env.REACT_APP_BASE_URL || "http://localhost:5000";
