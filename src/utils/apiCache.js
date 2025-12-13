/**
 * API Response Cache Utility
 * Caches API responses to reduce network calls and improve performance
 */

const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map();

/**
 * Generate cache key from URL and headers
 */
const generateCacheKey = (url, headers = {}) => {
  const headerStr = JSON.stringify(headers);
  return `${url}|${headerStr}`;
};

/**
 * Get cached response if available and not expired
 */
export const getCachedResponse = (url, headers = {}, maxAge = CACHE_DURATION) => {
  const cacheKey = generateCacheKey(url, headers);
  const cached = cache.get(cacheKey);
  
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > maxAge) {
    cache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
};

/**
 * Set cached response
 */
export const setCachedResponse = (url, headers = {}, data) => {
  const cacheKey = generateCacheKey(url, headers);
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Clear specific cache entry
 */
export const clearCache = (url, headers = {}) => {
  const cacheKey = generateCacheKey(url, headers);
  cache.delete(cacheKey);
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  cache.clear();
};

/**
 * Cached fetch wrapper
 */
export const cachedFetch = async (url, options = {}, maxAge = CACHE_DURATION) => {
  const headers = options.headers || {};
  
  const cached = getCachedResponse(url, headers, maxAge);
  if (cached) {
    return {
      ok: true,
      json: async () => cached,
      cached: true,
    };
  }
  
  const response = await fetch(url, options);
  
  if (response.ok) {
    const data = await response.json();
    setCachedResponse(url, headers, data);
    return {
      ...response,
      json: async () => data,
      cached: false,
    };
  }
  
  return response;
};

