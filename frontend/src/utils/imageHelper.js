const getBaseUrl = () => {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl.replace(/\/api\/?$/, '');
  }
  
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    
    // In production (Vercel/Render), point explicitly to the Render backend.
    // This fixes Mixed Content errors and prevents images from trying to load
    // from the Vercel frontend domain itself.
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://lost-and-found-rwanda.onrender.com';
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
