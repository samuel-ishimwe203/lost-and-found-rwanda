const getBaseUrl = () => {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl.replace(/\/api\/?$/, '');
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Auto-detect Render deployment if on .onrender.com
    if (hostname.includes('onrender.com')) {
      const origin = window.location.origin;
      return origin.replace(/\/$/, '');
    }

    if (hostname !== 'localhost') {
      console.warn('VITE_API_URL is missing in production! Images might fail to load.');
    }
  }

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
