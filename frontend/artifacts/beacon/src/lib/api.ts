// API base URL configuration - Always use port 7000 for backend
const API_BASE_URL = "http://localhost:7000/api";

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("[API] Calling:", url);
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  }).catch(err => {
    console.error("[API] Error:", err);
    throw err;
  });
};

export default API_BASE_URL;

