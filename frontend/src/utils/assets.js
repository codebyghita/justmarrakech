export const getAssetUrl = (path) => {
  if (!path) return '/images/hero_home.jfif';
  if (path.startsWith('http')) return path;
  
  const baseUrl = '';
  
  // If it starts with /images/ or /itinerary.jfif, it's a local public asset
  // We should not prepend the backend URL to these
  if (path.startsWith('/images') || path.startsWith('images') || path === '/itinerary.jfif' || path === 'itinerary.jfif' || path.startsWith('/hero')) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  // Force leading slash if not present for concatenation
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If it already has storage, just prepend base
  if (cleanPath.startsWith('/storage')) {
    return `${baseUrl}${cleanPath}`;
  }
  
  // Otherwise, assume it's a relative path that needs /storage/ prefixing 
  return `${baseUrl}/storage${cleanPath}`;
};
