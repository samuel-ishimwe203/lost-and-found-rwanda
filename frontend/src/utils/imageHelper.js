const getBaseUrl = () => {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl.replace(/\/api\/?$/, '');
  }
  
  // If we are on a hosted domain (not localhost) but VITE_API_URL is missing,
  // we might still be able to guess the backend if it's relative or same-origin,
  // but usually it's better to warn.
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.warn('VITE_API_URL is missing in production! Images might fail to load.');
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
