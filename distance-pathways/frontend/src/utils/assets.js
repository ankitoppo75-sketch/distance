// Backend stores uploaded files (logo, documents, etc.) as relative paths like
// "/uploads/logo/abc.png". In local development the Vite proxy makes these resolve correctly
// against the same origin. In production, the frontend and backend usually live on different
// domains, so we prefix relative paths with the backend's origin.
const apiBase = import.meta.env.VITE_API_URL || "/api";
const backendOrigin = apiBase.replace(/\/api\/?$/, "");

export const resolveAssetUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  if (!backendOrigin || backendOrigin.startsWith("/")) return path; // dev mode, proxy handles it
  return `${backendOrigin}${path}`;
};
