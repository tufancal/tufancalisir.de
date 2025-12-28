/**
 * Determines if the app is running in development/staging mode
 * - Dev server: import.meta.env.DEV is true
 * - Staging build: import.meta.env.MODE is 'development'
 * - Production build: import.meta.env.MODE is 'production'
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Gets the appropriate Storyblok content version
 * Returns 'draft' for development/staging, 'published' for production
 */
export const getStoryblokVersion = (): 'draft' | 'published' => {
  return isDevelopment() ? 'draft' : 'published';
};
