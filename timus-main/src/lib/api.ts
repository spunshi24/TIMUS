// In dev, VITE_API_URL is empty so fetch calls hit the Vite proxy (→ localhost:5000).
// In production (GitHub Pages), VITE_API_URL is set to the hosted Render backend URL.
export const API_BASE = (import.meta.env.VITE_API_URL as string) || "";
