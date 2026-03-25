const getBaseUrl = () => {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl.replace(/\/api\/?$/, '');
  }
  
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    
    // In production (Vercel/Render), use the current window's origin
    // This fixes Mixed Content errors by ensuring we use HTTPS and the same domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin.replace(/\/$/, '');
    }
  }

  // Fallback for local development
  return 'http://localhost:3001';
};

const API_BASE_URL = getBaseUrl();

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Clean up path if it starts with /api/uploads
  const cleanPath = path.startsWith('/uploads') ? path : `/uploads/${path}`;
  
  return `${API_BASE_URL}${cleanPath}`;
};
